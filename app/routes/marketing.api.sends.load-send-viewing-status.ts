import { LoaderFunction } from "@remix-run/node";
import { SendId, SendViewId, getSendConfig, getSendState } from "../lib/sends";

/**
 * The send is not viewable.
 */
export type NotViewableStatusResponse = {
  stage: "not-viewable";
};

/**
 * The send is viewable with the provided send id.
 */
export type NeedsToInitiateSendViewStatusResponse = {
  stage: "needs-to-initiate-send-view";
  sendId: SendId;
  requiresPassword: boolean;
  viewsRemaining: number;
};

/**
 * The send view is waiting for a confirmation code to be entered.
 */
export type NeedsConfirmationCodeVerificationStatusResponse = {
  stage: "needs-confirmation-code-verification";
  sendId: SendId;
  sendViewId: SendViewId;
  obscuredEmail: string;
};

/**
 * The send is viewable with the provided send view id and password.
 */
export type ViewableStatusResponse = {
  stage: "viewable";
  sendId: SendId;
  sendViewId: SendViewId;
  sendViewPassword: string;
  totalEncryptedParts: number;
};

/**
 * The response from the load send viewing status endpoint.
 */
export type LoadSendViewingStatusResponse =
  | NotViewableStatusResponse
  | NeedsToInitiateSendViewStatusResponse
  | NeedsConfirmationCodeVerificationStatusResponse
  | ViewableStatusResponse;

export const LOAD_SEND_VIEWING_STATUS_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  LAST_SEND_VIEW_ID: "X-2SECURED-LAST-SEND-VIEW-ID",
  LAST_SEND_VIEW_PASSWORD: "X-2SECURED-LAST-SEND-VIEW-PASSWORD",
};

export const loader: LoaderFunction = async ({ request }) => {
  // check these two exist, we don't need to reach out to S3 for this
  const sendId = request.headers.get(LOAD_SEND_VIEWING_STATUS_HEADERS.SEND_ID);
  const lastSendViewId = request.headers.get(LOAD_SEND_VIEWING_STATUS_HEADERS.LAST_SEND_VIEW_ID) || null;
  const lastSendViewPassword = request.headers.get(LOAD_SEND_VIEWING_STATUS_HEADERS.LAST_SEND_VIEW_PASSWORD) || null;

  if (!sendId) {
    return new Response("Missing required headers.", { status: 400 });
  }

  try {
    // try to get the related send from the backend, assume it is a send id
    const [sendConfig, sendState] = await Promise.all([
      getSendConfig(sendId as SendId),
      getSendState(sendId as SendId),
    ]);

    let response: LoadSendViewingStatusResponse;

    if (sendState.readyAt === null) {
      console.log("Send is not ready yet.", { sendState });
      response = { stage: "not-viewable" };
    } else if (sendConfig.expiresAt !== null && new Date(sendConfig.expiresAt) < new Date()) {
      console.log("Send has expired.", { sendState });
      response = { stage: "not-viewable" };
    } else if (sendState.dataDeletedAt !== null) {
      console.log("Send has been deleted.", { sendState });
      response = { stage: "not-viewable" };
    } else {
      response = ((): LoadSendViewingStatusResponse => {
        // the send is generally viewable, we need to check if we are in the progress of viewing it
        const matchingLastSendView =
          lastSendViewId !== null ? sendState.views.find((v) => v.sendViewId === lastSendViewId) : undefined;

        /**
         * Helper function to create a new view, checking if the send has been viewed too many times.
         */
        const createNewView = (): LoadSendViewingStatusResponse => {
          if (sendState.views.length >= sendConfig.maxViews) {
            console.log("Send has been viewed too many times.", { sendState });
            return { stage: "not-viewable" };
          } else {
            return {
              sendId: sendConfig.sendId,
              stage: "needs-to-initiate-send-view",
              requiresPassword: sendConfig.password !== null,
              viewsRemaining: sendConfig.maxViews - sendState.views.length,
            };
          }
        };

        if (matchingLastSendView === undefined) {
          // we don't have a matching view, we should consider this a new view and start over.
          return createNewView();
        }

        if (matchingLastSendView.viewClosedAt !== null) {
          // the view has already been completed, we should consider this a new view and start over.
          // note that we are relying on the cron job to clean up the old views.
          return createNewView();
        }

        if (lastSendViewPassword !== null) {
          // a password was provided, we should check if it matches the view password
          if (matchingLastSendView.viewPassword === lastSendViewPassword) {
            if (sendState.totalEncryptedParts === null) {
              throw new Error("Total encrypted parts is null, this should not happen.");
            }

            return {
              stage: "viewable",
              sendId: sendConfig.sendId,
              sendViewId: matchingLastSendView.sendViewId,
              sendViewPassword: matchingLastSendView.viewPassword,
              totalEncryptedParts: sendState.totalEncryptedParts,
            };
          } else {
            // the password was incorrect, something has gone wrong with the password. we should just consider
            // this a new view and start over.
            return createNewView();
          }
        } else {
          // no password was provided. if this view is waiting for a confirmation code, we should show that.
          if (sendConfig.confirmationEmail !== null) {
            // we are waiting for a confirmation code. we could check if we have sent a confirmation code to the
            // email address, but we are going to assume that at least one confirmation code has been sent.
            // if the user has lost the confirmation code, they can request a new one.
            return {
              stage: "needs-confirmation-code-verification",
              sendId: sendConfig.sendId,
              sendViewId: matchingLastSendView.sendViewId,
              // TODO: obfuscate the email address
              obscuredEmail: sendConfig.confirmationEmail,
            };
          } else {
            // this is unexpected, we should consider this a new view and start over.
            return createNewView();
          }
        }
      })();
    }

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error getting send data.", { error });
    const response: LoadSendViewingStatusResponse = { stage: "not-viewable" };
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
