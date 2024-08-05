/**
 * A single-line text field.
 */
export type SingleLineTextSecretField = {
  /** A single-line text field. */
  type: "single-line-text";

  /** The single-line string value of the field. */
  value: string | null;
};

/**
 * A multi-line text field.
 */
export type MultiLineTextSecretField = {
  /** A multi-line text field. */
  type: "multi-line-text";

  /** The multi-line string value of the field. */
  value: string | null;
};

/**
 * A file field.
 */
export type FileSecretField = {
  /** A file field. */
  type: "file";

  /** The file value of the field. */
  value: Array<File> | null;
};

/** A field in a send or a receive. */
export type SecretField = SingleLineTextSecretField | MultiLineTextSecretField | FileSecretField;
