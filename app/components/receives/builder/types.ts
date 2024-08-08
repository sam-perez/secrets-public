import { SecretField } from "../../shared/types";

/**
 * This file contains the frontend types for the receive builder component.
 */

/**
 * A field in the receive builder.
 */
export type ReceiveField = {
  /** The title of the field. */
  title: string;

  /** A placeholder for display purposes. */
  placeholder?: string;
} & SecretField;

/**
 * The configuration for a receive.
 */
export type ReceiveBuilderConfiguration = {
  /** The title of the receive. */
  title: string;

  /**
   * The notification configuration for the receive.
   *
   * Note that we allow this to be null here on the frontend, but that is just for convenience while we are
   * constructing the receive. The backend will not allow this to be null, and we should make sure that it is
   * set before sending it to the backend.
   *
   * This should be fine as long as you use the CreateReceiveBody type from the create receive endpoint.
   */
  notificationConfig: {
    /** A webhook notification. */
    type: "webhook";

    /** The url to send the notification to. */
    url: string;
  } | null;

  /** The fields in the receive. */
  fields: Array<ReceiveField>;
};

/**
 * A receive builder template.
 */
export type ReceiveBuilderTemplate = {
  /** The title of the template. */
  title: string;

  /** The fields for the template */
  fields: Array<Omit<ReceiveField, "value">>;
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
    title: "Encrypted Blank Form",
    description: "A blank template to request and receive any data from someone else with end-to-end encryption.",
    fields: [
      {
        title: "Untitled",
        type: "single-line-text",
        placeholder: "Receipent enters text here",
      },
    ],
  },
};
