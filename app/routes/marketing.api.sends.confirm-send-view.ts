import { ActionFunction, json } from "@remix-run/node";

import { SendBuilderTemplate } from "~/components/sends/builder/types";

import { getSendConfig,getSendState, saveSendState, SendId } from "../lib/sends";
import { nowIso8601DateTimeString } from "../lib/time";

/**
 * The headers that we expect to be present in the request for confirming a send view.
 */
export const CONFIRM_SEND_VIEW_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  SEND_VIEW_ID: "X-2SECURED-SEND-VIEW-ID",
  SEND_VIEW_CONFIRMATION_CODE: "X-2SECURED-SEND-VIEW-CONFIRMATION-CODE",
};

/**
 * The response from the confirm send view endpoint.
 */
export type ConfirmSendViewResponse = {
  /** The password to use to view the send. */
  viewPassword: string;

  /** The total number of encrypted parts. */
  totalEncryptedParts: number;

  /** The send builder template. */
  sendBuilderTemplate: SendBuilderTemplate;
};

/**
 * Action for confirming a send view.
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    const sendId = request.headers.get(CONFIRM_SEND_VIEW_HEADERS.SEND_ID);
    const sendViewId = request.headers.get(CONFIRM_SEND_VIEW_HEADERS.SEND_VIEW_ID);
    const confirmationCode = request.headers.get(CONFIRM_SEND_VIEW_HEADERS.SEND_VIEW_CONFIRMATION_CODE);

    if (!sendId || !sendViewId || !confirmationCode) {
      return new Response("Missing required headers.", { status: 400 });
    }

    const sendState = await getSendState(sendId as SendId);

    // find the matching view
    const view = sendState.views.find((v) => v.sendViewId === sendViewId);
    if (!view) {
      return new Response("No matching view found.", { status: 400 });
    }

    // check to make sure the view is not marked as closed
    if (view.viewClosedAt !== null) {
      return new Response("View is closed.", { status: 400 });
    }

    // check to make sure the view is not marked as ready
    if (view.viewReadyAt !== null) {
      return new Response("View is already ready.", { status: 400 });
    }

    view.emailConfirmationCodeSubmissions.push({
      code: confirmationCode,
      submittedAt: nowIso8601DateTimeString(),
      submissionRequestMetadata: { headers: Object.fromEntries(request.headers) },
    });

    // check to make sure the confirmation code matches any of the confirmation codes that we have sent out
    const matchingConfirmation = view.emailConfirmationAttempts.find((a) => a.code === confirmationCode);
    if (!matchingConfirmation) {
      // if we have had 10 confirmation code submissions, we should close this view.
      if (view.emailConfirmationCodeSubmissions.length === 10) {
        view.viewClosedAt = nowIso8601DateTimeString();
        view.viewClosedReason = "too-many-confirmation-attempts";
      }

      // either way, we need to persist the state before returning to track the attempts
      await saveSendState(sendState);

      return new Response("Invalid confirmation code.", { status: 400 });
    }

    // mark the view as ready
    view.viewReadyAt = nowIso8601DateTimeString();
    matchingConfirmation.emailConfirmedAt = nowIso8601DateTimeString();

    await saveSendState(sendState);

    if (sendState.totalEncryptedParts === null) {
      throw new Error("Total encrypted parts should not be null, something went wrong.");
    }

    const sendConfig = await getSendConfig(sendId as SendId);

    const response: ConfirmSendViewResponse = {
      viewPassword: view.viewPassword,
      totalEncryptedParts: sendState.totalEncryptedParts,
      sendBuilderTemplate: sendConfig.template,
    };

    return json(response);
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
