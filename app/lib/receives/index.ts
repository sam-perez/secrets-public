// TODO: should we move this type to a more appropriate shared location?
import { ReceiveBuilderTemplate } from "../../components/receives/builder/types";
import { BrandedId, generateUniqueId } from "../ids";
import { deleteObjectInS3, downloadFromS3, listObjectsInS3, uploadToS3 } from "../s3";
import { Iso8601DateTimeString } from "../time";

/** Receive id type. */
export type ReceiveId = BrandedId<"r">;

/**
 * Generate a receive id.
 *
 * We make the id longer than usual since these are truly public links and we want them to be unguessable.
 */
export const generateReceiveId = (): ReceiveId => generateUniqueId("r", 30);

/** A configuration for a receive. */
export type ReceiveConfig = {
  /** The id of the receive. */
  receiveId: ReceiveId;

  /** The ISO-8601 date string when the receive was created. */
  createdAt: Iso8601DateTimeString;

  /** The template of the receive secrets builder. To be sent down to the revealer for display purposes. */
  template: ReceiveBuilderTemplate;

  /** Notification config. */
  notificationConfig: {
    /** A webhook notification. */
    type: "webhook";

    /** The url to send the notification to. */
    url: string;
  };
};

/** Recursive metadata. Deeply nested string keys of strings, numbers, or more nested metadata. */
interface RecursiveMetadata {
  [key: string]: string | number | RecursiveMetadata;
}

/** Receive response id. */
export type ReceiveResponseId = BrandedId<"rr">;

/** Generate a receive response id. */
export const generateReceiveResponseId = (): ReceiveResponseId => generateUniqueId("rr", 10);

/** The state of a receive response. Has to be tracked separately from the config. Stored in S3 for now. */
export type ReceiveResponseState = {
  /** The id of the parent receive. */
  receiveId: ReceiveId;

  /** The id of the receive response. */
  receiveResponseId: ReceiveResponseId;

  /** ISO-8601 date string when the receive response was created. */
  createdAt: Iso8601DateTimeString;

  /** The password needed to upload the encrypted parts. */
  encryptedPartPassword: string;

  /**
   * ISO-8601 date string when the receive response is ready.
   * Once a receive instance is marked ready, it will stop accepting new parts.
   */
  readyAt: Iso8601DateTimeString | null;

  /** The total number of encrypted parts that make up the receive response. */
  totalEncryptedParts: number | null;

  /** ISO-8601 date string when the receive response data was deleted. */
  dataDeletedAt: Iso8601DateTimeString | null;

  /** The reason the receive response data was deleted. */
  dataDeletedReason: "expired" | "downloaded-and-completed-by-owner" | null;

  /** Metadata about the request that created the receive response. */
  creationRequestMetadata: RecursiveMetadata;
};

/**
 * Get the key for the receive config in s3.
 */
export const getReceiveConfigKey = (receiveId: ReceiveId): string => `receives/instance-data/${receiveId}/config.json`;

/**
 * Get the key for the receive response state in s3.
 */
export const getReceiveResponseStateKey = (receiveId: ReceiveId, receiveResponseId: ReceiveResponseId): string =>
  `receives/instance-data/${receiveId}/responses/${receiveResponseId}/state.json`;

/**
 *  Get the key for an encrypted part of a receive response in s3.
 */
export const getEncryptedPartKey = (
  receiveId: ReceiveId,
  receiveResponseId: ReceiveResponseId,
  partNumber: number
): string => `receives/instance-data/${receiveId}/responses/${receiveResponseId}/encrypted-parts/${partNumber}.bin`;

/**
 * Get the key for receive response expiration info in s3.
 */
export const getReceiveExpirationKey = (
  receiveId: ReceiveId,
  receiveResponseId: ReceiveResponseId,
  expiresAt: Iso8601DateTimeString
): string => `receives/expirations/receives/${expiresAt}/${receiveId}/${receiveResponseId}`;

/**
 * Writes a receive response expiration record to s3.
 */
export const writeReceiveResponseExpirationRecord = async (
  receiveId: ReceiveId,
  receiveResponseId: ReceiveResponseId,
  expiresAt: Iso8601DateTimeString
) => {
  const receiveResponseExpirationKey = getReceiveExpirationKey(receiveId, receiveResponseId, expiresAt);

  await uploadToS3({
    bucket: "MARKETING_BUCKET",
    // We don't need to store any data in the expiration record, just the key is enough
    body: Buffer.from(""),
    key: receiveResponseExpirationKey,
  });
};

/**
 * Get the next page of entries from the receive response expiration records in s3.
 */
export const listNextPageOfReceiveResponseExpirationRecords = async () => {
  const expiredReceiveResponsesPrefix = `receives/expirations/receives/`;
  const { Contents: expiredReceives } = await listObjectsInS3({
    bucket: "MARKETING_BUCKET",
    prefix: expiredReceiveResponsesPrefix,
  });

  return expiredReceives;
};

/**
 * Get the receive response state from s3.
 */
export const getReceiveState = async (
  receiveId: ReceiveId,
  receiveResponseId: ReceiveResponseId
): Promise<ReceiveResponseState> => {
  const receiveStateKey = getReceiveResponseStateKey(receiveId, receiveResponseId);

  const response = await downloadFromS3({
    bucket: "MARKETING_BUCKET",
    key: receiveStateKey,
  });

  return JSON.parse(new TextDecoder().decode(response.data)) as ReceiveResponseState;
};

/**
 * Save the receive response state to s3.
 */
export const saveReceiveResponseState = async (receiveResponseState: ReceiveResponseState): Promise<void> => {
  const receiveResponseStateKey = getReceiveResponseStateKey(
    receiveResponseState.receiveId,
    receiveResponseState.receiveResponseId
  );

  await uploadToS3({
    bucket: "MARKETING_BUCKET",
    body: Buffer.from(JSON.stringify(receiveResponseState)),
    key: receiveResponseStateKey,
  });
};

/**
 * Get the receive config from s3.
 */
export const getReceiveConfig = async (receiveId: ReceiveId): Promise<ReceiveConfig> => {
  const receiveConfigKey = getReceiveConfigKey(receiveId);

  const response = await downloadFromS3({
    bucket: "MARKETING_BUCKET",
    key: receiveConfigKey,
  });

  return JSON.parse(new TextDecoder().decode(response.data)) as ReceiveConfig;
};

/**
 * Save the receive config to s3.
 */
export const saveReceiveConfig = async (receiveConfig: ReceiveConfig): Promise<void> => {
  const receiveConfigKey = getReceiveConfigKey(receiveConfig.receiveId);

  await uploadToS3({
    bucket: "MARKETING_BUCKET",
    body: Buffer.from(JSON.stringify(receiveConfig)),
    key: receiveConfigKey,
  });
};

/**
 * List all of the receive response encrypted parts in s3.
 */
// eslint-disable-next-line max-len
export const listReceiveResponseEncryptedParts = async (receiveId: ReceiveId, receiveResponseId: ReceiveResponseId) => {
  // check to see if all of the parts have been uploaded
  const encryptedPartsPrefix = `receives/instance-data/${receiveId}/responses/${receiveResponseId}encrypted-parts/`;
  const { Contents: encryptedParts } = await listObjectsInS3({
    bucket: "MARKETING_BUCKET",
    prefix: encryptedPartsPrefix,
  });

  return encryptedParts;
};

/**
 * Deletes a receive response's encrypted parts from s3.
 */
export const deleteReceiveResponseEncryptedParts = async (
  receiveId: ReceiveId,
  receiveResponseId: ReceiveResponseId
) => {
  const encryptedParts = await listReceiveResponseEncryptedParts(receiveId, receiveResponseId);

  // just delete them all serially for now
  for (const part of encryptedParts || []) {
    if (part.Key !== undefined) {
      await deleteObjectInS3({
        bucket: "MARKETING_BUCKET",
        key: part.Key,
      });
    }
  }
};
