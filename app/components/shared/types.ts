/**
 * A single-line text field.
 */
export type SingleLineTextField = {
  /** A single-line text field. */
  type: "single-line-text";

  /** The single-line string value of the field. */
  value: string | null;
};

/**
 * A multi-line text field.
 */
export type MultiLineTextField = {
  /** A multi-line text field. */
  type: "multi-line-text";

  /** The multi-line string value of the field. */
  value: string | null;
};

/**
 * A file field.
 */
export type FileField = {
  /** A file field. */
  type: "file";

  /** The file value of the field. */
  value: Array<File> | null;
};
