/**
 * This file contains the frontend types for the send builder component.
 */

/**
 * A single-line text field.
 */
type SingleLineTextField = {
  /** A single-line text field. */
  type: "single-line-text";

  /** The single-line string value of the field. */
  value: string | null;
};

/**
 * A multi-line text field.
 */
type MultiLineTextField = {
  /** A multi-line text field. */
  type: "multi-line-text";

  /** The multi-line string value of the field. */
  value: string | null;

  /** The number of rows for the text area. */
  rows?: number;
};

/**
 * A file field.
 */
type FileField = {
  /** A file field. */
  type: "file";

  /** The file value of the field. */
  value: Array<File> | null;
};

/**
 * A field in the send builder.
 */
export type SendBuilderField = {
  /** The title of the field. */
  title: string;

  /** A placeholder for display purposes. */
  placeholder?: string;
} & (SingleLineTextField | MultiLineTextField | FileField);

/**
 * The configuration for a send.
 */
export type SendBuilderConfiguration = {
  /** The title of the send. */
  title: string;

  /** The password for a send. Optional. */
  password: string | null;

  /** The expiration date for a send. Optional.  */
  expirationDate: Date | null;

  /** The email address for MFA. Optional. */
  confirmationEmail: string | null;

  /** The max number of views allowed for the send. Optional. If not set, defaults to one. */
  maxViews: number | null;

  /** The fields in the send. */
  fields: Array<SendBuilderField>;
};

/**
 * A send builder template.
 */
export type SendBuilderTemplate = {
  /** The title of the template. */
  title: string;

  /** The description of the template. */
  description: string;

  /** The fields for the template */
  fields: Array<Omit<SendBuilderField, "value">>;
};

/**
 * Our library of sending templates.
 */
export const SEND_BUILDER_TEMPLATES: { [SLUG in string]: SendBuilderTemplate } = {
  /** A template for sending an AWS API key. */
  "aws-api-key": {
    title: "AWS API Key",
    description: "Use this template to securely send an AWS API Key that is end-to-end encrypted.",
    fields: [
      {
        title: "AWS ACCESS KEY",
        type: "single-line-text",
        placeholder: "AKIAIOSFODNN7EXAMPLE",
      },
      {
        title: "AWS SECRET ACCESS KEY",
        type: "single-line-text",
        placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      },
    ],
  },
};
