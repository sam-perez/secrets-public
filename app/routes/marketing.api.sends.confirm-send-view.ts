import { ActionFunction } from "@remix-run/node";
import { SendId, SEND_VIEW_EXPIRATION_MS, getSendState, saveSendState } from "../lib/sends";

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
  viewPassword: string;
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
    if (view.viewCompletedAt !== null) {
      return new Response("View is closed.", { status: 400 });
    }

    // check to make sure the view is not marked as ready
    if (view.viewReadyAt !== null) {
      return new Response("View is already ready.", { status: 400 });
    }

    // check to make sure the view has not expired
    if (new Date().getTime() - new Date(view.viewInitiatedAt).getTime() > SEND_VIEW_EXPIRATION_MS) {
      return new Response("View has expired.", { status: 400 });
    }

    // check to make sure the confirmation code matches any of the confirmation codes that we have sent out
    const matchingConfirmation = view.emailConfirmationAttempts.find((a) => a.code === confirmationCode);
    if (!matchingConfirmation) {
      return new Response("Invalid confirmation code.", { status: 400 });
    }

    // mark the view as ready
    view.viewReadyAt = new Date().toISOString();
    matchingConfirmation.emailConfirmedAt = new Date().toISOString();

    await saveSendState(sendState);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
