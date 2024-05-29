import { ActionFunction } from "@remix-run/node";
import { getSendConfig, getSendState, SendId, SendViewId } from "../lib/sends";

export type RevealerActionResponse =
  | {
      viewable: false;
    }
  | {
      viewable: true;
      stage: "needs-to-initiate-send-view";
      sendId: SendId;
      requiresPassword: boolean;
      viewsRemaining: number;
    }
  | {
      viewable: true;
      stage: "needs-confirmation-code-verification";
      sendId: SendId;
      sendViewId: SendViewId;
      obscuredEmail: string;
    }
  | {
      viewable: true;
      stage: "viewable";
      sendId: SendId;
      sendViewId: SendViewId;
      sendViewPassword: string;
    };

export type RevealerActionRequest = {
  lastSendViewId: string | null;
  lastSendViewPassword: string | null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const sendId = params.sendId;

  if (!sendId) {
    return new Response("Not found.", { status: 404 });
  }

  const requestBody = (await request.json()) as RevealerActionRequest;

  try {
    // try to get the related send from the backend, assume it is a send id
    const [sendConfig, sendState] = await Promise.all([
      getSendConfig(sendId as SendId),
      getSendState(sendId as SendId),
    ]);

    let response: RevealerActionResponse;

    if (sendState.readyAt === null) {
      console.log("Send is not ready yet.", { sendState });
      response = { viewable: false };
    } else if (sendConfig.expiresAt !== null && new Date(sendConfig.expiresAt) < new Date()) {
      console.log("Send has expired.", { sendState });
      response = { viewable: false };
    } else if (sendState.dataDeletedAt !== null) {
      console.log("Send has been deleted.", { sendState });
      response = { viewable: false };
    } else {
      response = ((): RevealerActionResponse => {
        // the send is generally viewable, we need to check if we are in the progress of viewing it
        const matchingLastSendView =
          requestBody.lastSendViewId !== null
            ? sendState.views.find((v) => v.sendViewId === requestBody.lastSendViewId)
            : undefined;

        const createNewView = (): RevealerActionResponse => {
          if (sendState.views.length >= sendConfig.maxViews) {
            console.log("Send has been viewed too many times.", { sendState });
            return { viewable: false };
          } else {
            return {
              viewable: true,
              sendId: sendConfig.sendId,
              stage: "needs-to-initiate-send-view",
              requiresPassword: sendConfig.password !== null,
              viewsRemaining: sendConfig.maxViews - sendState.views.length,
            };
          }
        };

        if (matchingLastSendView !== undefined) {
          if (matchingLastSendView.viewCompletedAt === null) {
            if (requestBody.lastSendViewPassword !== null) {
              if (matchingLastSendView.viewPassword === requestBody.lastSendViewPassword) {
                return {
                  viewable: true,
                  stage: "viewable",
                  sendId: sendConfig.sendId,
                  sendViewId: matchingLastSendView.sendViewId,
                  sendViewPassword: matchingLastSendView.viewPassword,
                };
              } else {
                // the password was incorrect, something has gone wrong with the password. we should just consider
                // this a new view and start over.
                return createNewView();
              }
            } else {
              // no password was provided. if this view is waiting for a confirmation code, we should show that.
              if (sendConfig.confirmationEmail !== null) {
                return {
                  viewable: true,
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
          } else {
            // the view has already been completed, we should consider this a new view and start over.
            return createNewView();
          }
        } else {
          // we don't have a matching view, we should consider this a new view and start over.
          return createNewView();
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
    const response: RevealerActionResponse = { viewable: false };
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
