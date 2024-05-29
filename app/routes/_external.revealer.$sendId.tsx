import { Link, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { SendId, SendViewId } from "../lib/sends";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { INITIATE_SEND_VIEW_HEADERS, InitiateSendViewResponse } from "./marketing.api.sends.initiate-send-view";
import { CONFIRM_SEND_VIEW_HEADERS, ConfirmSendViewResponse } from "./marketing.api.sends.confirm-send-view";

// TODO: move this to an api route
import { RevealerActionRequest, RevealerActionResponse } from "./_external.revealer.$sendId.init-data";

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

  return <div style={spinnerStyle}></div>;
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

export default function SendRevealer() {
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);

  const [password, setPassword] = useState("");
  const [passwordCheckFailed, setPasswordCheckFailed] = useState<boolean | null>(null);
  const [initiateSendViewResponse, setInitiateSendViewResponse] = useState<InitiateSendViewResponse | null>(null);

  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeCheckFailed, setConfirmationCodeCheckFailed] = useState<boolean | null>(null);

  const [sendViewPassword, setSendViewPassword] = useState<string | null>(null);

  const [actionData, setActionData] = useState<RevealerActionResponse | null>(null);

  // get the sendId from the path
  const { sendId } = useParams();

  // get the action data by fetching it from the action
  useEffect(() => {
    if (!sendId) {
      return;
    }

    const getRevealerActionData = () =>
      Promise.resolve()
        .then(async () => {
          setShowLoadingScreen(true);

          // TODO: get more sophisticated with the number of views we have in localStorage?
          const latestCheckpoint = getSendCheckpointFromLocalStorage();

          let revealerActionRequest: RevealerActionRequest;
          if (latestCheckpoint.sendId !== sendId) {
            clearSendCheckpointInLocalStorage();

            revealerActionRequest = {
              lastSendViewId: null,
              lastSendViewPassword: null,
            };
          } else {
            revealerActionRequest = {
              lastSendViewId: latestCheckpoint.sendViewId,
              lastSendViewPassword: latestCheckpoint.sendViewPassword,
            };
          }

          const getRevealerSendFetchRequest = await fetch("/revealer/" + sendId + "/init-data", {
            method: "POST",
            body: JSON.stringify(revealerActionRequest),
          });

          if (getRevealerSendFetchRequest.status !== 200) {
            // this should not really happen ever...
            alert("An error occurred while trying to view this send. Please try again later.");
          } else {
            const actionData = (await getRevealerSendFetchRequest.json()) as RevealerActionResponse;
            setActionData(actionData);

            if (actionData.viewable === true) {
              if (actionData.stage === "viewable") {
                // if we've gotten to the viewable stage, let's just view the send
                setSendViewPassword(actionData.sendViewPassword);
              }
            }
          }
        })
        .finally(() => {
          setShowLoadingScreen(false);
        });

    getRevealerActionData();
  }, [sendId]);

  if (!sendId) {
    return <h1>SEND ID NOT FOUND</h1>;
  }

  // Hack for now to check for actionData being null as well as showLoadingScreen being true
  if (showLoadingScreen === true || actionData === null) {
    // TODO: add an appropriate loading spinner here
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>THIS IS A LOADING SCREEN</h1>
        <Spinner />
      </div>
    );
  }

  if (actionData.viewable === false) {
    return (
      <div className="px-4 container max-w-5xl">
        <h3>SEND NOT FOUND</h3>
        <p className="muted mb-4">
          The send you are trying to view is not available. It may never have never existed, expired, been deleted, or
          been viewed too many times.
        </p>
      </div>
    );
  }

  if (sendViewPassword !== null) {
    return (
      <div className="px-4 container max-w-5xl">
        <h3>SEND VIEWED</h3>
        <p className="muted mb-4">The send has been successfully unlocked to view!</p>
        <p>{sendViewPassword}</p>
      </div>
    );
  }

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
  if (actionData.stage === "needs-to-initiate-send-view" && initiateSendViewResponse === null) {
    const initiateSend = () =>
      Promise.resolve()
        .then(async () => {
          setShowLoadingScreen(true);

          // initiate the secret send view
          const initiateSendViewResponseFetch = await fetch("/marketing/api/sends/initiate-send-view", {
            method: "PUT",
            headers: {
              [INITIATE_SEND_VIEW_HEADERS.SEND_ID]: actionData.sendId,
              // only send the password if it is required
              ...(actionData.requiresPassword === true
                ? {
                    [INITIATE_SEND_VIEW_HEADERS.SEND_PASSWORD]: password,
                  }
                : {}),
            },
          });

          if (initiateSendViewResponseFetch.status === 200) {
            const initiateSendViewResponse = (await initiateSendViewResponseFetch.json()) as InitiateSendViewResponse;

            setInitiateSendViewResponse(initiateSendViewResponse);
            if (initiateSendViewResponse.requiresConfirmation === false) {
              setSendViewPassword(initiateSendViewResponse.viewPassword);
            }

            setSendCheckpointInLocalStorage({
              sendId: actionData.sendId,
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
              alert("An unknown error client error occurred. This send may no longer be available.");
            }
          } else {
            // this is unexpected, we may want to notify ourselves of this error somehow
            alert("An unknown error occurred. Please try again later.");
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
              {actionData.requiresPassword === true ? (
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
                  <p>Views remaining: {actionData.viewsRemaining}</p>
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
                  <p>Views remaining: {actionData.viewsRemaining}</p>
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

  const getConfirmationCodeDialog = ({
    sendId,
    sendViewId,
    obscuredEmail,
  }: {
    sendId: SendId;
    sendViewId: SendViewId;
    obscuredEmail: string;
  }) => {
    const submitConfirmationCode = () =>
      Promise.resolve()
        .then(async () => {
          setShowLoadingScreen(true);

          // confirm the secret send view
          const confirmSendViewResponseFetch = await fetch("/marketing/api/sends/confirm-send-view", {
            method: "PUT",
            headers: {
              [CONFIRM_SEND_VIEW_HEADERS.SEND_ID]: sendId,
              [CONFIRM_SEND_VIEW_HEADERS.SEND_VIEW_ID]: sendViewId,
              [CONFIRM_SEND_VIEW_HEADERS.SEND_VIEW_CONFIRMATION_CODE]: confirmationCode,
            },
          });

          if (confirmSendViewResponseFetch.status === 200) {
            // success case
            const confirmSendViewResponse = (await confirmSendViewResponseFetch.json()) as ConfirmSendViewResponse;
            setSendViewPassword(confirmSendViewResponse.viewPassword);

            setSendCheckpointInLocalStorage({
              sendId,
              sendViewId,
              sendViewPassword: confirmSendViewResponse.viewPassword,
            });

            return;
          }

          if (confirmSendViewResponseFetch.status === 400) {
            const confirmSendViewResponseText = await confirmSendViewResponseFetch.text();
            if (confirmSendViewResponseText === "Invalid confirmation code.") {
              // the confirmation code was incorrect, we can't advance. but we can show an error message.
              setConfirmationCodeCheckFailed(true);
              // clear the password field
              setConfirmationCode("");
            } else {
              alert("An unknown error client error occurred. This send may no longer be available.");
            }
          } else if (confirmSendViewResponseFetch.status !== 200) {
            alert("An unknown error occurred. Please try again later.");
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
              <p>Email sent to (OBSCURE ME PLEASE): {obscuredEmail}</p>
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
  };

  if (actionData.stage === "needs-confirmation-code-verification") {
    return getConfirmationCodeDialog({
      sendId: actionData.sendId,
      sendViewId: actionData.sendViewId,
      obscuredEmail: actionData.obscuredEmail,
    });
  }

  if (initiateSendViewResponse !== null && initiateSendViewResponse.requiresConfirmation === true) {
    return getConfirmationCodeDialog({
      sendId: actionData.sendId,
      sendViewId: initiateSendViewResponse.sendViewId,
      obscuredEmail: initiateSendViewResponse.obscuredEmail,
    });
  }

  // This should never happen. Show an error message?
  return <h1>{"SOMETHIN' AIN'T QUITE RIGHT..."}</h1>;
}
