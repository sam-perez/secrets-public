import { FileField, MultiLineTextField, SingleLineTextField } from "../../shared/types";

/**
 * This file contains the frontend types for the receive builder component.
 */

/**
 * A field in the receive builder.
 */
export type ReceiveBuilderField = {
  /** The title of the field. */
  title: string;

  /** A placeholder for display purposes. */
  placeholder?: string;
} & (SingleLineTextField | MultiLineTextField | FileField);

/**
 * The configuration for a receive.
 */
export type ReceiveBuilderConfiguration = {
  /** The title of the receive. */
  title: string;

  /** The fields in the receive. */
  fields: Array<ReceiveBuilderField>;
};

/**
 * A receive builder template.
 */
export type ReceiveBuilderTemplate = {
  /** The title of the template. */
  title: string;

  /** The fields for the template */
  fields: Array<Omit<ReceiveBuilderField, "value">>;
};

/**
 * Our library of receiving templates.
 *
 * We use the ReceiveBuilderTemplate type, plus a description and optional private flag that are used
 * in the UI to display the templates.
 */
export const RECEIVE_BUILDER_TEMPLATES: {
  [SLUG in string]: ReceiveBuilderTemplate & {
    /** The description of the template. */
    description: string;

    /** Optional flag. If true, the template will not be shown in the template list or sitemap. */
    private?: boolean;
  };
} = {
  new: {
    title: "Encrypted Receive",
    description: "Start from scratch and share any data with end-to-end encryption.",
    fields: [
      {
        title: "Untitled",
        type: "single-line-text",
        placeholder: "Enter Text",
      },
    ],
  },
};
