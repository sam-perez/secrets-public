import { ActionFunction } from "@remix-run/node";
import { SendId, getSendState, saveSendState } from "../lib/sends";
import { nowIso8601DateTimeString } from "../lib/time";

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
    if (view.viewClosedAt !== null) {
      return new Response("View is closed.", { status: 400 });
    }

    // check to make sure the view is marked as ready
    if (view.viewReadyAt === null) {
      return new Response("View is not ready.", { status: 400 });
    }

    // mark the view as closed
    view.viewClosedAt = nowIso8601DateTimeString();

    await saveSendState(sendState);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
