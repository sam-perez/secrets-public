import { ActionFunction } from "@remix-run/node";
import { SendId, SEND_VIEW_EXPIRATION_MS, getSendState, saveSendState } from "../lib/sends";

/**
 * The headers that we expect to be present in the request for completing a send view.
 */
export const COMPLETE_SEND_VIEW_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  SEND_VIEW_ID: "X-2SECURED-SEND-VIEW-ID",
  SEND_VIEW_PASSWORD: "X-2SECURED-SEND-VIEW-PASSWORD",
};

/**
 * Action for completing a send view.
 *
 * Will do some checks to ensure that a send view can be initiated, then create a new.
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    const sendId = request.headers.get(COMPLETE_SEND_VIEW_HEADERS.SEND_ID);
    const sendViewId = request.headers.get(COMPLETE_SEND_VIEW_HEADERS.SEND_VIEW_ID);
    const viewPassword = request.headers.get(COMPLETE_SEND_VIEW_HEADERS.SEND_VIEW_PASSWORD);

    if (!sendId || !sendViewId || !viewPassword) {
      return new Response("Missing required headers.", { status: 400 });
    }

    const sendState = await getSendState(sendId as SendId);

    // find the matching view
    const view = sendState.views.find((v) => v.sendViewId === sendViewId);
    if (!view) {
      return new Response("No matching view found.", { status: 400 });
    }

    // check the password
    if (view.viewPassword !== viewPassword) {
      return new Response("Invalid view password.", { status: 400 });
    }

    // check to make sure the view is not marked as closed
    if (view.viewCompletedAt !== null) {
      return new Response("View is closed.", { status: 400 });
    }

    // check to make sure the view is marked as ready
    if (view.viewReadyAt === null) {
      return new Response("View is not ready.", { status: 400 });
    }

    // check to make sure the view has not expired
    if (new Date().getTime() - new Date(view.viewInitiatedAt).getTime() > SEND_VIEW_EXPIRATION_MS) {
      return new Response("View has expired.", { status: 400 });
    }

    // mark the view as completed
    view.viewCompletedAt = new Date().toISOString();

    await saveSendState(sendState);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
