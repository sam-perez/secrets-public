import { BrandedId, generateUniqueId } from "../ids";

/** Send id type. */
export type SendId = BrandedId<"s">;

/**
 * A configuration for a send.
 */
export type SendConfig = {
  /** The id of the send. */
  sendId: SendId;

  /** The email address that we will use for mfa confirmation. */
  confirmationEmail: string | null;

  /** Max number of views allowed for the send. */
  maxViews: number | null;

  /**
   * We are going to use the lexocographic ordering of S3 when we list objects for the first version of our
   * code that will clean up expired sends. We should write the dates in ISO-8601 format of each send that
   * needs to be cleaned up. Then every minute, we have some cron job that will list all of the sends and
   * any send that has an expiration date that is less than the current date will have its encrypted parts
   * deleted and the send marked as deleted.
   */

  /** The expiration date for the send. ISO-8601 date string. */
  expiresAt: string | null;

  /** Password. If set, the recipient must enter this password to view the send. */
  password: string | null;
};

/** Send view id type. */
export type SendViewId = BrandedId<"sv">;

/** The state of a send. Has to be tracked separately from the config. Stored in S3 for now. */
export type SendState = {
  /** The id of the send. */
  sendId: SendId;

  /** The password required when uploading encrypted parts. */
  encryptedPartsPassword: string;

  /** ISO-8601 date string when the send was created. */
  createdAt: string;

  /** ISO-8601 date string when the send ready. Once a send is marked ready, it will stop accepting new parts. */
  readyAt: string | null;

  /** The total number of encrypted parts that make up the send. */
  totalEncryptedParts: number | null;

  /** ISO-8601 date string when the send data was deleted. */
  dataDeletedAt: string | null;

  /** The reason the send data was deleted. */
  dataDeletedReason: "expired" | "deleted" | "viewed" | null;

  // TODO: we probably want to not just assume that the send has been viewed once the client has downloaded the file,
  // but instead wait for a confirmation from the client that the file has been viewed using a piece of data
  // that is only available to the client after the file has been decrypted.
  // This is probably an edge case? Low priority for now, and maybe this is a feature we can build and bill around
  // later. AKA, a feature where we schedule the deletion of the data but they have time to cancel the deletion.
  // Like, reset the views and the expiration date and allow the target to try to pull the data again.

  /** The number of times the send has been viewed. */
  views: Array<{
    /** The id for the send view. */
    sendViewId: string;

    /** ISO-8601 date string when the send view was initiated. */
    viewInitiatedAt: string;

    /** ISO-8601 date string when the send view was marked as ready. */
    viewReadyAt: string | null;

    /** ISO-8601 date string when the send view was completed. */
    viewCompletedAt: string | null;

    /** The password used to view the send. */
    viewPassword: string;

    /** Metadata about the view. */
    metadata: Record<string, string>;

    /**
     * Email confirmation attempts.
     *
     * We are going to use this to track all of the email confirmation attempts for a send.
     * If any of the email confirmation attempts are successful, then we will consider the send
     * unlocked and ready to be viewed.
     *
     * When a user is trying to view a send and they have not confirmed their email, we will
     * assume that they are trying to respond to the latest email confirmation attempt,
     * and will not compare the confirmation code to any of the other email confirmation attempts,
     * even if they are still unexpired
     */
    emailConfirmationAttempts: Array<{
      /** Tracker for the attempt. Need to modify this once we choose an email provider. */
      tracker: string;

      /** The confirmation code that we sent to the email address. */
      code: string;

      /** ISO-8601 date string when the email was sent. */
      sentAt: string;

      /** ISO-8601 date string when the email was confirmed. */
      emailConfirmedAt: string | null;
    }>;
  }>;
};

/**
 * Generate a send id.
 */
export const generateSendId = (): SendId => generateUniqueId("s", 10);

/**
 * Generate a send view id.
 */
export const generateSendViewId = (): SendViewId => generateUniqueId("sv", 20);

/**
 * Get the key for the send config in s3.
 */
export const getSendConfigKey = (sendId: SendId): string => `sends/${sendId}/config.json`;

/**
 * Get the key for the send state in s3.
 */
export const getSendStateKey = (sendId: SendId): string => `sends/${sendId}/state.json`;

/**
 *  Get the key for and encrypted part in s3.
 */
export const getEncryptedPartKey = (sendId: SendId, partNumber: number): string =>
  `sends/${sendId}/encrypted/${partNumber}.bin`;
