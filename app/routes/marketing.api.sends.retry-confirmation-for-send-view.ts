import { ActionFunction } from "@remix-run/node";

import { getRandomBase62String } from "../lib/crypto-utils";
import { sendEmail } from "../lib/email";
import { getSendConfig, getSendState, saveSendState,SendId } from "../lib/sends";
import { nowIso8601DateTimeString } from "../lib/time";

/**
 * The headers that we expect to be present in the request for retrying a confirmation for a send view.
 */
export const RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  SEND_VIEW_ID: "X-2SECURED-SEND-VIEW-ID",
};

export const action: ActionFunction = async ({ request }) => {
  // we need to pull the sendId from the request
  // we can do it all from the headers of the request
  const sendId = request.headers.get(RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS.SEND_ID);
  const sendViewId = request.headers.get(RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS.SEND_VIEW_ID);

  if (!sendId || !sendViewId) {
    return new Response("Missing required headers", { status: 400 });
  }

  try {
    const [sendState, sendConfig] = await Promise.all([
      getSendState(sendId as SendId),
      getSendConfig(sendId as SendId),
    ]);

    // find the matching view
    const view = sendState.views.find((v) => v.sendViewId === sendViewId);
    if (!view) {
      return new Response("No matching view found.", { status: 400 });
    }

    // check to make sure the view is not marked as closed
    if (view.viewClosedAt !== null) {
      return new Response("View is closed.", { status: 400 });
    }

    // check to make sure that the send config requires confirmation
    if (!sendConfig.confirmationEmail) {
      return new Response("Send does not require confirmation.", { status: 400 });
    }

    // check to make sure we haven't sent too many confirmation emails
    if (view.emailConfirmationAttempts.length >= 10) {
      return new Response("Too many confirmation email attempts.", { status: 400 });
    }

    const code = getRandomBase62String(6);

    // send an email to the confirmation email address with a code that the user can enter to confirm the view
    // TODO: handle errors?
    const emailResponse = await sendEmail({
      to: sendConfig.confirmationEmail,
      from: "2Secured <noreply@2secured.link>",
      subject: `2Secured Access Code is ${code}`,
      body: `Enter this code to access the link sent to you via 2Secured: ${code}
If you didn't request this code, you can safely ignore this email.`,
    });

    // add the email confirmation attempt to the view
    view.emailConfirmationAttempts.push({
      code,
      sentAt: nowIso8601DateTimeString(),
      emailConfirmedAt: null,
      messageId: emailResponse.MessageId || "no-message-id",
      messageMetadata: { ...emailResponse.$metadata },
    });

    await saveSendState(sendState);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
