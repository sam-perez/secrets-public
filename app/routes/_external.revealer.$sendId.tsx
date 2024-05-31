import { Link, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { SendId, SendViewId } from "../lib/sends";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { INITIATE_SEND_VIEW_HEADERS, InitiateSendViewResponse } from "./marketing.api.sends.initiate-send-view";
import { CONFIRM_SEND_VIEW_HEADERS, ConfirmSendViewResponse } from "./marketing.api.sends.confirm-send-view";
import { RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS } from "./marketing.api.sends.retry-confirmation-for-send-view";

import {
  LOAD_SEND_VIEWING_STATUS_HEADERS,
  LoadSendViewingStatusResponse,
  NeedsToInitiateSendViewStatusResponse,
  NeedsConfirmationCodeVerificationStatusResponse,
} from "./marketing.api.sends.load-send-viewing-status";

// TODO: REAL LOADING EXPERIENCE
function Spinner() {
  const spinnerStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #3498db",
    animation: "spin 1s linear infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
    </>
  );
}

const setSendCheckpointInLocalStorage = ({
  sendId,
  sendViewId,
  sendViewPassword,
}: {
  sendId: SendId;
  sendViewId: SendViewId | null;
  sendViewPassword: string | null;
}) => {
  localStorage.setItem("latestSendCheckpoint", JSON.stringify({ sendId, sendViewId, sendViewPassword }));
};

const clearSendCheckpointInLocalStorage = () => {
  localStorage.removeItem("latestSendCheckpoint");
};

const getSendCheckpointFromLocalStorage = (): {
  sendId: SendId | null;
  sendViewId: SendViewId | null;
  sendViewPassword: string | null;
} => {
  const latestSendCheckpoint = localStorage.getItem("latestSendCheckpoint");
  if (latestSendCheckpoint === null) {
    return { sendId: null, sendViewId: null, sendViewPassword: null };
  }

  return JSON.parse(latestSendCheckpoint);
};

/**
 * Container. Responsible for pulling out the send id and fetching the send viewing status from the server.
 */
export default function SendRevealerContainer() {
  const { sendId } = useParams();

  const [loadSendViewingStatusResponse, setLoadSendViewingStatusResponse] =
    useState<LoadSendViewingStatusResponse | null>(null);

  const [error, setError] = useState<{ message: string } | null>(null);

  const [sendViewingData, setSendViewingData] = useState<{
    sendId: SendId;
    sendViewId: SendViewId;
    sendViewPassword: string;
  } | null>(null);

  const alertWithErrorMessage = (message: string) => {
    alert(message);
    setError({ message });
  };

  useEffect(() => {
    if (!sendId) {
      return;
    }

    const getRevealerActionData = async () => {
      // TODO: get more sophisticated with the number of views we have in localStorage?
      const latestCheckpoint = getSendCheckpointFromLocalStorage();

      const requestHeaders = {
        [LOAD_SEND_VIEWING_STATUS_HEADERS.SEND_ID]: sendId,
      };

      if (latestCheckpoint.sendId !== sendId) {
        clearSendCheckpointInLocalStorage();
      } else {
        // add in the last send view id and password if they exist
        if (latestCheckpoint.sendViewId !== null) {
          requestHeaders[LOAD_SEND_VIEWING_STATUS_HEADERS.LAST_SEND_VIEW_ID] = latestCheckpoint.sendViewId;
        }

        if (latestCheckpoint.sendViewPassword !== null) {
          requestHeaders[LOAD_SEND_VIEWING_STATUS_HEADERS.LAST_SEND_VIEW_PASSWORD] = latestCheckpoint.sendViewPassword;
        }
      }

      const getRevealerSendFetchRequest = await fetch("/marketing/api/sends/load-send-viewing-status", {
        method: "GET",
        headers: requestHeaders,
      });

      if (getRevealerSendFetchRequest.status !== 200) {
        // this should not really happen ever...
        alertWithErrorMessage("An error occurred while trying to view this send. Please try again later.");
      } else {
        const LoadSendViewingStatusResponse =
          (await getRevealerSendFetchRequest.json()) as LoadSendViewingStatusResponse;
        setLoadSendViewingStatusResponse(LoadSendViewingStatusResponse);
      }
    };

    getRevealerActionData();
  }, [sendId]);

  if (!sendId) {
    return <h1>Send id not present, this link is broken.</h1>;
  }

  if (error !== null) {
    return (
      <div className="px-4 container max-w-5xl">
        <h3>AN ERROR OCCURRED</h3>
        <p className="muted mb-4">An error occurred while trying to access this send. Please try again later.</p>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (loadSendViewingStatusResponse === null) {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>Initializing.</h1>
        <Spinner />
      </div>
    );
  } else if (loadSendViewingStatusResponse.stage === "not-viewable") {
    return (
      <div className="px-4 container max-w-5xl">
        <h3>SEND NOT FOUND</h3>
        <p className="muted mb-4">
          The send you are trying to view is not available. It may never have never existed, expired, been deleted, or
          been viewed too many times.
        </p>
      </div>
    );
  } else if (loadSendViewingStatusResponse.stage === "viewable") {
    const { sendId, sendViewId, sendViewPassword } = loadSendViewingStatusResponse;
    return <SendViewer sendId={sendId} sendViewId={sendViewId} sendViewPassword={sendViewPassword} />;
  } else {
    if (sendViewingData === null) {
      return (
        <SendViewUnlocker
          loadSendViewingStatusResponse={loadSendViewingStatusResponse}
          onSendIsReadyToView={({ sendId, sendViewId, sendViewPassword }) => {
            setSendViewingData({ sendId, sendViewId, sendViewPassword });
          }}
        />
      );
    } else {
      return (
        <div>
          <h1>Send Is Ready To View</h1>
          <SendViewer
            sendId={sendViewingData.sendId}
            sendViewId={sendViewingData.sendViewId}
            sendViewPassword={sendViewingData.sendViewPassword}
          />
        </div>
      );
    }
  }
}

/**
 * Mounted when the send needs to be unlocked. Either we need to initiate a send view or confirm a send view.
 */
function SendViewUnlocker({
  loadSendViewingStatusResponse,
  onSendIsReadyToView,
}: {
  loadSendViewingStatusResponse:
    | NeedsToInitiateSendViewStatusResponse
    | NeedsConfirmationCodeVerificationStatusResponse;

  onSendIsReadyToView: ({
    sendId,
    sendViewId,
    sendViewPassword,
  }: {
    sendId: SendId;
    sendViewId: SendViewId;
    sendViewPassword: string;
  }) => void;
}) {
  const [internalUnlockerStatus, setInternalUnlockerStatus] = useState<
    | NeedsToInitiateSendViewStatusResponse
    | NeedsConfirmationCodeVerificationStatusResponse
    | { stage: "send-view-unlocked"; sendId: SendId; sendViewId: SendViewId; sendViewPassword: string }
  >(loadSendViewingStatusResponse);

  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const [password, setPassword] = useState("");
  const [passwordCheckFailed, setPasswordCheckFailed] = useState<boolean | null>(null);

  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeCheckFailed, setConfirmationCodeCheckFailed] = useState<boolean | null>(null);

  useEffect(() => {
    if (internalUnlockerStatus.stage === "send-view-unlocked") {
      onSendIsReadyToView({
        sendId: internalUnlockerStatus.sendId,
        sendViewId: internalUnlockerStatus.sendViewId,
        sendViewPassword: internalUnlockerStatus.sendViewPassword,
      });
    }
  }, [internalUnlockerStatus, onSendIsReadyToView]);

  if (showLoadingScreen === true) {
    // TODO: add an appropriate loading spinner here
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>THIS IS A LOADING SCREEN</h1>
        <Spinner />
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="px-4 container max-w-5xl">
        <h3>AN ERROR OCCURRED</h3>
        <p className="muted mb-4">An error occurred while trying to view this send.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  const alertWithErrorMessage = (message: string) => {
    setError({ message });
  };

  const dialogBackground = (
    <div className="px-4 container max-w-5xl">
      <h3>LOADING REVEALER DATA</h3>
      <p className="muted mb-4">
        Someone has securely shared this data with you via{" "}
        <Link target="_blank" to="https://2secured.link" rel="noreferrer">
          2Secured
        </Link>
        .
      </p>
    </div>
  );

  // if the send needs to initiate a send view, show the dialog
  if (internalUnlockerStatus.stage === "needs-to-initiate-send-view") {
    const initiateSend = () =>
      Promise.resolve()
        .then(async () => {
          setShowLoadingScreen(true);

          const headers: { [key: string]: string } = {
            [INITIATE_SEND_VIEW_HEADERS.SEND_ID]: loadSendViewingStatusResponse.sendId,
          };

          if (internalUnlockerStatus.requiresPassword === true) {
            headers[INITIATE_SEND_VIEW_HEADERS.SEND_PASSWORD] = password;
          }

          // initiate the secret send view
          const initiateSendViewResponseFetch = await fetch("/marketing/api/sends/initiate-send-view", {
            method: "PUT",
            headers,
          });

          if (initiateSendViewResponseFetch.status === 200) {
            const initiateSendViewResponse = (await initiateSendViewResponseFetch.json()) as InitiateSendViewResponse;

            if (initiateSendViewResponse.requiresConfirmation === false) {
              setInternalUnlockerStatus({
                stage: "send-view-unlocked",
                sendId: internalUnlockerStatus.sendId,
                sendViewId: initiateSendViewResponse.sendViewId,
                sendViewPassword: initiateSendViewResponse.viewPassword,
              });
            } else {
              setInternalUnlockerStatus({
                stage: "needs-confirmation-code-verification",
                sendId: internalUnlockerStatus.sendId,
                sendViewId: initiateSendViewResponse.sendViewId,
                obscuredEmail: initiateSendViewResponse.obscuredEmail,
              });
            }

            setSendCheckpointInLocalStorage({
              sendId: internalUnlockerStatus.sendId,
              sendViewId: initiateSendViewResponse.sendViewId,
              sendViewPassword:
                initiateSendViewResponse.requiresConfirmation === false ? initiateSendViewResponse.viewPassword : null,
            });

            return;
          }

          // failure cases
          if (initiateSendViewResponseFetch.status === 400) {
            const responseText = await initiateSendViewResponseFetch.text();
            if (responseText === "Invalid password.") {
              // the password was incorrect, we can't advance. but we can show an error message.
              setPasswordCheckFailed(true);
              // clear the password field
              setPassword("");
            } else {
              // TODO: better experience here? Don't necessarily want to have a UX for every possible error
              // since some of them will imply that the send is no longer available.
              // Maybe this is just a TODO for now.
              alertWithErrorMessage("An unknown error client error occurred. This send may no longer be available.");
            }
          } else {
            // this is unexpected, we may want to notify ourselves of this error somehow
            alertWithErrorMessage("An unknown error occurred. Please try again later.");
          }
        })
        .finally(() => {
          setShowLoadingScreen(false);
        });

    return (
      <>
        <Dialog open={true}>
          <DialogContent noClose={true} className="sm:max-w-md">
            <div className="space-y-2">
              {internalUnlockerStatus.requiresPassword === true ? (
                <>
                  <h4>Enter Password to View</h4>
                  {
                    // if the password check failed, show an error message
                    passwordCheckFailed === true && (
                      <p className="text-red-500">The password you entered is incorrect.</p>
                    )
                  }
                  <p>
                    The sender has required a password to view this encrypted data. Please enter it below to continue.
                  </p>
                  <p>Views remaining: {internalUnlockerStatus.viewsRemaining}</p>
                  <Input
                    placeholder="Enter password"
                    value={password}
                    onKeyDown={(e) => {
                      // if the user presses enter, submit the password
                      if (e.key === "Enter") {
                        if (password.length > 0) {
                          initiateSend();
                        }
                      }
                    }}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button disabled={password.length === 0} onClick={initiateSend}>
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  <h4>Initiate View</h4>
                  <p>Would you like to view this send? This action will consume a view.</p>
                  <p>Views remaining: {internalUnlockerStatus.viewsRemaining}</p>
                  <Button onClick={initiateSend}>Initiate View</Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        {dialogBackground}
      </>
    );
  }

  if (internalUnlockerStatus.stage === "needs-confirmation-code-verification") {
    const submitConfirmationCode = () =>
      Promise.resolve()
        .then(async () => {
          setShowLoadingScreen(true);

          // confirm the secret send view
          const confirmSendViewResponseFetch = await fetch("/marketing/api/sends/confirm-send-view", {
            method: "PUT",
            headers: {
              [CONFIRM_SEND_VIEW_HEADERS.SEND_ID]: internalUnlockerStatus.sendId,
              [CONFIRM_SEND_VIEW_HEADERS.SEND_VIEW_ID]: internalUnlockerStatus.sendViewId,
              [CONFIRM_SEND_VIEW_HEADERS.SEND_VIEW_CONFIRMATION_CODE]: confirmationCode,
            },
          });

          if (confirmSendViewResponseFetch.status === 200) {
            // success case
            const confirmSendViewResponse = (await confirmSendViewResponseFetch.json()) as ConfirmSendViewResponse;

            setSendCheckpointInLocalStorage({
              sendId: internalUnlockerStatus.sendId,
              sendViewId: internalUnlockerStatus.sendViewId,
              sendViewPassword: confirmSendViewResponse.viewPassword,
            });

            setInternalUnlockerStatus({
              stage: "send-view-unlocked",
              sendId: internalUnlockerStatus.sendId,
              sendViewId: internalUnlockerStatus.sendViewId,
              sendViewPassword: confirmSendViewResponse.viewPassword,
            });

            return;
          }

          if (confirmSendViewResponseFetch.status === 400) {
            const confirmSendViewResponseText = await confirmSendViewResponseFetch.text();

            console.log("confirmSendViewResponseText", confirmSendViewResponseText);

            if (confirmSendViewResponseText === "Invalid confirmation code.") {
              // the confirmation code was incorrect, we can't advance. but we can show an error message.
              setConfirmationCodeCheckFailed(true);
              // clear the confirmation code field
              setConfirmationCode("");
            } else if (confirmSendViewResponseText === "View is closed.") {
              alertWithErrorMessage(
                [
                  "Too many confirmation codes have been attempted.",
                  "This view is now locked. Reload the page and if the send has views remaining, you can try again.",
                ].join(" ")
              );
            } else {
              alertWithErrorMessage("An unknown error client error occurred. This send may no longer be available.");
            }
          } else if (confirmSendViewResponseFetch.status !== 200) {
            alertWithErrorMessage("An unknown error occurred. Please try again later.");
          }
        })
        .finally(() => {
          setShowLoadingScreen(false);
        });

    return (
      <>
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md" noClose={true}>
            <div className="space-y-2">
              <h4>Enter Confirmation Code</h4>
              {
                // if the confirmation code check failed, show an error message
                confirmationCodeCheckFailed === true && (
                  <p className="text-red-500">The confirmation code you entered is incorrect.</p>
                )
              }
              <p>This send requires email confirmation to unlock view. Please enter the code sent via email.</p>
              <p>Email sent to (OBSCURE ME PLEASE): {internalUnlockerStatus.obscuredEmail}</p>
              <Button
                variant={"link"}
                onClick={() => {
                  Promise.resolve()
                    .then(async () => {
                      setShowLoadingScreen(true);

                      // initiate the secret send view
                      const retryConfirmationForSendViewResponseFetch = await fetch(
                        "/marketing/api/sends/retry-confirmation-for-send-view",
                        {
                          method: "POST",
                          headers: {
                            [RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS.SEND_ID]: internalUnlockerStatus.sendId,
                            [RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS.SEND_VIEW_ID]: internalUnlockerStatus.sendViewId,
                          },
                        }
                      );

                      if (retryConfirmationForSendViewResponseFetch.status !== 204) {
                        // this is unexpected, we may want to notify ourselves of this error somehow
                        alertWithErrorMessage(
                          [
                            "An unknown error occurred while requesting a confirmation code resend.",
                            "Please try again later.",
                          ].join(" ")
                        );
                      }
                    })
                    .finally(() => {
                      setShowLoadingScreen(false);
                    });
                }}
              >
                Request another confirmation code.
              </Button>
              <Input
                placeholder="Enter code"
                value={confirmationCode}
                onKeyDown={(e) => {
                  // if the user presses enter, submit the confirmation code
                  if (e.key === "Enter") {
                    if (confirmationCode.length > 0) {
                      submitConfirmationCode();
                    }
                  }
                }}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
              <Button disabled={confirmationCode.length === 0} onClick={submitConfirmationCode}>
                Continue
              </Button>
              {
                // TODO: add a resend confirmation code button
              }
            </div>
          </DialogContent>
        </Dialog>
        {dialogBackground}
      </>
    );
  }

  if (internalUnlockerStatus.stage === "send-view-unlocked") {
    // HOORAY!
    // Should be emphemeral since the useEffect above will report to the parent that the send is ready to view and
    // this component will presumably be done for.
    return (
      <div className="px-4 container max-w-5xl">
        <h3>SEND VIEWED</h3>
        <p className="muted mb-4">
          The send has been successfully unlocked to view! But you really should not be seeing this!
        </p>
        <p>Send Id: {internalUnlockerStatus.sendId}</p>
        <p>Send View Id: {internalUnlockerStatus.sendViewId}</p>
        <p>Send View Password: {internalUnlockerStatus.sendViewPassword}</p>
      </div>
    );
  }
}

/**
 * Work in progress. This will be the component that shows the send data.
 */
function SendViewer({
  sendId,
  sendViewId,
  sendViewPassword,
}: {
  sendId: SendId;
  sendViewId: SendViewId;
  sendViewPassword: string;
}) {
  return (
    <div className="px-4 container max-w-5xl">
      <h3>SEND VIEWED</h3>
      <p className="muted mb-4">The send has been successfully unlocked to view!</p>
      <p>Send Id: {sendId}</p>
      <p>Send View Id: {sendViewId}</p>
      <p>Send View Password: {sendViewPassword}</p>
    </div>
  );
}
