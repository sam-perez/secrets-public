import { ActionFunction } from "@remix-run/node";

import { SendBuilderTemplate } from "~/components/sends/builder/types";

import { getRandomBase62String, getRandomHumanFriendlyString } from "../lib/crypto-utils";
import { sendEmail } from "../lib/email";
import {
  generateSendViewId,
  getSendConfig,
  getSendState,
  saveSendState,
  SEND_VIEW_EXPIRATION_MS,
  SendId,
  SendState,
  SendViewId,
  writeSendViewExpirationRecord,
} from "../lib/sends";
import { getIso8601DateTimeString, nowIso8601DateTimeString } from "../lib/time";
import { obscureEmailAddress, sendDiscordMessage } from "../lib/utils";

/** The response from the initiate send view endpoint. */
export type InitiateSendViewResponse = {
  /** The send view id. */
  sendViewId: SendViewId;
} & (
  | {
      /** The password to use to view the send. */
      viewPassword: string;

      /** When false, the view does not require confirmation. */
      requiresConfirmation: false;

      /** The total number of encrypted parts. */
      totalEncryptedParts: number;

      /** The send builder template. */
      sendBuilderTemplate: SendBuilderTemplate;
    }
  | {
      /** The password to use to view the send. When null, it is pending confirmation. */
      viewPassword: null;

      /** When true, the view requires confirmation. */
      requiresConfirmation: true;

      /** The obscured confirmation email address. */
      obscuredEmail: string;
    }
);

/**
 * The headers that we expect to be present in the request for initiating a send view.
 */
export const INITIATE_SEND_VIEW_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  SEND_PASSWORD: "X-2SECURED-SEND-PASSWORD",
};

/**
 * Action for initiating a send view.
 *
 * Will do some checks to ensure that a send view can be initiated, then create a new send view.
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    const sendId = request.headers.get(INITIATE_SEND_VIEW_HEADERS.SEND_ID);

    if (!sendId) {
      return new Response("Missing required headers.", { status: 400 });
    }

    // just ping discord without awaiting, should complete quickly
    sendDiscordMessage(`Send is being viewed: \`${sendId}\``);

    const [sendState, sendConfig] = await Promise.all([
      getSendState(sendId as SendId),
      getSendConfig(sendId as SendId),
    ]);

    // check to see if the send has been marked as ready
    if (sendState.readyAt === null) {
      return new Response("Send is not ready.", { status: 400 });
    }

    // check to see if the send has been deleted
    if (sendState.dataDeletedAt !== null) {
      return new Response("Send data has been deleted.", { status: 400 });
    }

    // check to see if the send has expired
    if (sendConfig.expiresAt && new Date(sendConfig.expiresAt).getTime() < new Date().getTime()) {
      return new Response("Send has expired.", { status: 400 });
    }

    // check to see if the send requires a password
    if (sendConfig.password !== null) {
      const sendPassword = request.headers.get(INITIATE_SEND_VIEW_HEADERS.SEND_PASSWORD);

      if (sendPassword === null) {
        return new Response("Send requires a password.", { status: 400 });
      } else if (sendPassword !== sendConfig.password) {
        return new Response("Invalid password.", { status: 400 });
      }
    }

    // check to see if the send has been viewed the maximum number of times
    if (sendConfig.maxViews !== null && sendState.views.length >= sendConfig.maxViews) {
      return new Response("Send has been viewed the maximum number of times.", { status: 400 });
    }

    const sendViewId = generateSendViewId();

    let initiateSendViewResponse: InitiateSendViewResponse;
    const view: SendState["views"][0] = {
      sendViewId,
      creationRequestMetadata: { headers: Object.fromEntries(request.headers) },
      viewInitiatedAt: nowIso8601DateTimeString(),
      viewPassword: getRandomBase62String(32),
      viewReadyAt: null,
      viewClosedAt: null,
      viewClosedReason: null,
      emailConfirmationAttempts: [],
      emailConfirmationCodeSubmissions: [],
    };

    // check to see if the send requires confirmation
    if (sendConfig.confirmationEmail !== null) {
      if (sendState.totalEncryptedParts === null) {
        throw new Error("Send does not have total encrypted parts, this should not happen.");
      }

      initiateSendViewResponse = {
        sendViewId,
        // we don't want to give the password yet, we want to wait for the confirmation
        viewPassword: null,
        requiresConfirmation: true,
        obscuredEmail: obscureEmailAddress(sendConfig.confirmationEmail),
      };

      const code = getRandomHumanFriendlyString(6);

      // send an email to the confirmation email address with a code that the user can enter to confirm the view
      // TODO: handle errors?
      const emailResponse = await sendEmail({
        to: sendConfig.confirmationEmail,
        from: "2Secured <noreply@2secured.link>",
        subject: `2Secured Access Code is ${code}`,
        body: `Enter this code to access the link sent to you via 2Secured: ${code}
If you didn't request this code, you can safely ignore this email.
        `,
      });

      // add the email confirmation attempt to the view
      view.emailConfirmationAttempts.push({
        code,
        sentAt: nowIso8601DateTimeString(),
        emailConfirmedAt: null,
        messageId: emailResponse.MessageId || "no-message-id",
        messageMetadata: { ...emailResponse.$metadata },
      });
    } else {
      if (sendState.totalEncryptedParts === null) {
        throw new Error("Send does not have total encrypted parts, this should not happen.");
      }

      initiateSendViewResponse = {
        sendViewId,
        requiresConfirmation: false,
        viewPassword: view.viewPassword,
        totalEncryptedParts: sendState.totalEncryptedParts,
        sendBuilderTemplate: sendConfig.template,
      };

      // mark the view as ready
      view.viewReadyAt = nowIso8601DateTimeString();
    }

    // save the view to the send state
    sendState.views.push(view);
    const sendViewExpiresAt = new Date(new Date().getTime() + SEND_VIEW_EXPIRATION_MS);

    await Promise.all([
      saveSendState(sendState),
      writeSendViewExpirationRecord(sendState.sendId, sendViewId, getIso8601DateTimeString(sendViewExpiresAt)),
    ]);

    return new Response(JSON.stringify(initiateSendViewResponse), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
