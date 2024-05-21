import { ActionFunction } from "@remix-run/node";
import { downloadFromS3, uploadToS3 } from "../lib/s3";
import {
  generateSendViewId,
  SendViewId,
  getSendStateKey,
  getSendConfigKey,
  SendId,
  SendState,
  SendConfig,
} from "../lib/sends";
import { getRandomBase62String } from "../lib/crypto-utils";

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
    }
  | {
      /** The password to use to view the send. When null, it is pending confirmation. */
      viewPassword: null;

      /** When true, the view requires confirmation. */
      requiresConfirmation: true;
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

    // pull down the state and the config for the send
    const sendStateKey = getSendStateKey(sendId as SendId);
    const sendConfigKey = getSendConfigKey(sendId as SendId);

    const [sendStateResponse, sendConfigResponse] = await Promise.all([
      downloadFromS3({
        bucket: "MARKETING_BUCKET",
        key: sendStateKey,
      }),
      downloadFromS3({
        bucket: "MARKETING_BUCKET",
        key: sendConfigKey,
      }),
    ]);

    const sendState = JSON.parse(new TextDecoder().decode(sendStateResponse.data)) as SendState;
    const sendConfig = JSON.parse(new TextDecoder().decode(sendConfigResponse.data)) as SendConfig;

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
      viewInitiatedAt: new Date().toISOString(),
      viewPassword: getRandomBase62String(32),
      viewReadyAt: null,
      viewCompletedAt: null,
      emailConfirmationAttempts: [],
      metadata: {},
    };

    // check to see if the send requires confirmation
    if (sendConfig.confirmationEmail !== null) {
      initiateSendViewResponse = {
        sendViewId,
        // we don't want to give the password yet, we want to wait for the confirmation
        viewPassword: null,
        requiresConfirmation: true,
      };

      // TODO: send an email to the confirmation email address with a code that the user can enter to confirm the view
    } else {
      initiateSendViewResponse = {
        sendViewId,
        requiresConfirmation: false,
        viewPassword: view.viewPassword,
      };

      // mark the view as ready
      view.viewReadyAt = new Date().toISOString();
    }

    // save the view to the send state
    sendState.views.push(view);
    await uploadToS3({
      bucket: "MARKETING_BUCKET",
      body: Buffer.from(JSON.stringify(sendState)),
      key: sendStateKey,
    });

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
