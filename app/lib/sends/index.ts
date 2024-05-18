import { BrandedId, generateUniqueId } from "../ids";

/**
 * A configuration for a send.
 */
export type SendConfig = {
  /** The id of the send. */
  id: BrandedId<"s">;

  /** ISO-8601 date string when the send was created. */
  createdAt: string;

  /** The email address that we will use for mfa confirmation. */
  confirmationEmail?: string;

  /** Max number of views allowed for the send. */
  maxViews?: number;

  /** The expiration date for the send. ISO-8601 date string. */
  expiresAt?: string;

  /** Password. If set, the recipient must enter this password to view the send. */
  password?: string;
};

/** The status of a send. */
export type SendStatus = "active" | "expired" | "deleted";

/** The state of a send. Has to be tracked separately from the config. Stored in S3 for now. */
export type SendState = {
  /** The id of the send. */
  id: BrandedId<"s">;

  /** The status of the send. */
  status: SendStatus;

  // TODO: we probably want to not just assume that the send has been viewed once the client has downloaded the file,
  // but instead wait for a confirmation from the client that the file has been viewed using a piece of data
  // that is only available to the client after the file has been decrypted.
  // This is probably an edge case? Low priority for now, and maybe this is a feature we can build and bill around
  // later. AKA, a feature where we schedule the deletion of the data but they have time to cancel the deletion.
  // Like, reset the views and the expiration date and allow the target to try to pull the data again.

  /** The number of times the send has been viewed. */
  views: number;
};

/**
 * Generate a send id.
 */
export const generateSendId = (): BrandedId<"s"> => generateUniqueId("s", 10);
