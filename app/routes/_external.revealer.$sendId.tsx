import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Link, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";

import AboutSidenav from "~/components/about-sidenav";
import { DisplaySecrets } from "~/components/sends/revealer/DisplaySecrets";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Label } from "~/components/ui/label";

import {
  EncryptionWorkerProvider,
  useEncryptionWorker,
} from "../components/context-providers/EncryptionWorkerContextProvider";
import { SendBuilderTemplate } from "../components/sends/builder/types";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/Spinner";
import { utf16ArrayBufferToString } from "../lib/crypto-utils";
import { PackedSecrets, PublicPackedSecrets, SecretResponses } from "../lib/secrets";
import { SendId, SendViewId } from "../lib/sends";
import { parallelWithLimit } from "../lib/utils";
import { COMPLETE_SEND_VIEW_HEADERS } from "./marketing.api.sends.complete-send-view";
import { CONFIRM_SEND_VIEW_HEADERS, ConfirmSendViewResponse } from "./marketing.api.sends.confirm-send-view";
import { DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS } from "./marketing.api.sends.download-send-encrypted-part";
import { INITIATE_SEND_VIEW_HEADERS, InitiateSendViewResponse } from "./marketing.api.sends.initiate-send-view";
import {
  LOAD_SEND_VIEWING_STATUS_HEADERS,
  LoadSendViewingStatusResponse,
  NeedsConfirmationCodeVerificationStatusResponse,
  NeedsToInitiateSendViewStatusResponse,
} from "./marketing.api.sends.load-send-viewing-status";
import { RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS } from "./marketing.api.sends.retry-confirmation-for-send-view";

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
 * Default export for the send revealer container. Just wraps the send revealer in the encryption worker provider
 * so that the send revealer can use the encryption worker if it needs to.
 */
export default function SendRevealerRootContainer() {
  return (
    <EncryptionWorkerProvider>
      <SendViewContainer />
    </EncryptionWorkerProvider>
  );
}

/**
 * Responsible for pulling out the send id and fetching the send viewing status from the server.
 */
function SendViewContainer() {
  const { sendId } = useParams();

  const [loadSendViewingStatusResponse, setLoadSendViewingStatusResponse] =
    useState<LoadSendViewingStatusResponse | null>(null);

  const [error, setError] = useState<{ message: string } | null>(null);

  const [sendViewingData, setSendViewingData] = useState<{
    sendId: SendId;
    sendViewId: SendViewId;
    sendViewPassword: string;
    totalEncryptedParts: number;
    sendBuilderTemplate: SendBuilderTemplate;
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
      <div className="container">
        <h3>AN ERROR OCCURRED</h3>
        <p className="muted mb-4">An error occurred while trying to access this send. Please try again later.</p>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (loadSendViewingStatusResponse === null) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <Spinner />
          <h4>Initializing...</h4>
        </div>
      </div>
    );
  } else if (loadSendViewingStatusResponse.stage === "not-viewable") {
    return (
      <div className="container">
        <h3>🤔 This link has expired or does not exist</h3>
        <p className="muted mt-2 mb-4">
          The secret link you are trying to view has expired, may have never existed, was deleted, or has been viewed
          too many times. If it did in fact exist, there is no way to retrieve it anymore.
        </p>
        <Link to={"https://2secured.link"}>
          <Button>Go to 2Secured</Button>
        </Link>
      </div>
    );
  } else if (loadSendViewingStatusResponse.stage === "viewable") {
    const { sendId, sendViewId, sendViewPassword, totalEncryptedParts } = loadSendViewingStatusResponse;

    return (
      <SendViewDownloaderAndDecryptor
        sendId={sendId}
        sendViewId={sendViewId}
        sendViewPassword={sendViewPassword}
        totalEncryptedParts={totalEncryptedParts}
        sendBuilderTemplate={loadSendViewingStatusResponse.sendBuilderTemplate}
      />
    );
  } else {
    if (sendViewingData === null) {
      return (
        <SendViewUnlocker
          loadSendViewingStatusResponse={loadSendViewingStatusResponse}
          // eslint-disable-next-line max-len
          onSendIsReadyToView={({ sendId, sendViewId, sendViewPassword, totalEncryptedParts, sendBuilderTemplate }) => {
            setSendViewingData({ sendId, sendViewId, sendViewPassword, totalEncryptedParts, sendBuilderTemplate });
          }}
        />
      );
    } else {
      return (
        <div>
          <SendViewDownloaderAndDecryptor
            sendId={sendViewingData.sendId}
            sendViewId={sendViewingData.sendViewId}
            sendViewPassword={sendViewingData.sendViewPassword}
            totalEncryptedParts={sendViewingData.totalEncryptedParts}
            sendBuilderTemplate={sendViewingData.sendBuilderTemplate}
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
    totalEncryptedParts,
    sendBuilderTemplate,
  }: {
    sendId: SendId;
    sendViewId: SendViewId;
    sendViewPassword: string;
    totalEncryptedParts: number;
    sendBuilderTemplate: SendBuilderTemplate;
  }) => void;
}) {
  const [internalUnlockerStatus, setInternalUnlockerStatus] = useState<
    | NeedsToInitiateSendViewStatusResponse
    | NeedsConfirmationCodeVerificationStatusResponse
    | {
        stage: "send-view-unlocked";
        sendId: SendId;
        sendViewId: SendViewId;
        sendViewPassword: string;
        totalEncryptedParts: number;
        sendBuilderTemplate: SendBuilderTemplate;
      }
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
        totalEncryptedParts: internalUnlockerStatus.totalEncryptedParts,
        sendBuilderTemplate: internalUnlockerStatus.sendBuilderTemplate,
      });
    }
  }, [internalUnlockerStatus, onSendIsReadyToView]);

  if (showLoadingScreen === true) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <Spinner />
          <h4>Loading...</h4>
        </div>
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="container">
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
    <div className="container">
      <h3>Accessing encrypted data...</h3>
      <p className="muted mb-4">
        Accessing encrypted data via{" "}
        <Link target="_blank" to="https://2secured.link" rel="noreferrer">
          2Secured
        </Link>
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
                totalEncryptedParts: initiateSendViewResponse.totalEncryptedParts,
                sendBuilderTemplate: initiateSendViewResponse.sendBuilderTemplate,
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
                  <h4>Enter Password to Continue</h4>

                  <p>
                    The sender has required a password to view this encrypted data. Please enter it below to continue.
                  </p>

                  <p>
                    Views remaining: <b>{internalUnlockerStatus.viewsRemaining}</b>
                  </p>
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
                  {
                    // if the password check failed, show an error message
                    passwordCheckFailed === true && (
                      <p className="text-red-400 font-medium">The password you entered is incorrect.</p>
                    )
                  }
                  <div>
                    <p className="muted text-xs">
                      When the sender created this link, they chose to set a password. You&apos;ll need to ask them for
                      the password.
                    </p>
                  </div>
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
              totalEncryptedParts: confirmSendViewResponse.totalEncryptedParts,
              sendBuilderTemplate: confirmSendViewResponse.sendBuilderTemplate,
            });

            return;
          }

          if (confirmSendViewResponseFetch.status === 400) {
            const confirmSendViewResponseText = await confirmSendViewResponseFetch.text();

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
              <h4>Check Your Email for Access Code</h4>

              <p>
                To view this link, please enter the access code we just sent to the email address{" "}
                {internalUnlockerStatus.obscuredEmail}
              </p>

              <div className="flex items-center space-x-4 text-xs pb-2 text-slate-600">
                <a
                  href="https://mail.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-slate-400"
                >
                  Gmail <OpenInNewWindowIcon className="h-3 w-3 ml-1" />
                </a>
                <a
                  href="https://www.icloud.com/mail/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-slate-400"
                >
                  Apple Mail <OpenInNewWindowIcon className="h-3 w-3 ml-1" />
                </a>
                <a
                  href="https://outlook.live.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-slate-400"
                >
                  Outlook <OpenInNewWindowIcon className="h-3 w-3 ml-1" />
                </a>
              </div>
              {/* <Button
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
              </Button> */}
              <Input
                placeholder="Enter access code"
                type="text"
                autoComplete="off"
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
              {
                // if the confirmation code check failed, show an error message
                confirmationCodeCheckFailed === true && (
                  <p className="text-red-500 font-medium">The confirmation code you entered is incorrect.</p>
                )
              }
              <p className="muted text-xs">
                Didn&apos;t receive a code? Look for an email from noreply@2secured.link, check your spam, or try{" "}
                <Link
                  to={"#"}
                  className="font-medium hover:text-slate-400"
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
                              [RETRY_CONFIRMATION_FOR_SEND_VIEW_HEADERS.SEND_VIEW_ID]:
                                internalUnlockerStatus.sendViewId,
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
                  resending
                </Link>
              </p>

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
    // this component will presumably be immediately unmounted.
    return (
      <div className="container">
        <h3>Unlocking...</h3>
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
function SendViewDownloaderAndDecryptor({
  sendId,
  sendViewId,
  sendViewPassword,
  totalEncryptedParts,
  sendBuilderTemplate,
}: {
  sendId: SendId;
  sendViewId: SendViewId;
  sendViewPassword: string;
  totalEncryptedParts: number;
  sendBuilderTemplate: SendBuilderTemplate;
}) {
  const encryptionWorker = useEncryptionWorker();

  const [secretResponses, setSecretResponses] = useState<SecretResponses | null>(null);

  // pull out fragment from the URL
  const password = window.location.hash.slice(1);

  useEffect(() => {
    if (password === "") {
      return;
    }

    const fetchAndDecrypt = async () => {
      // fetch the encrypted parts
      const fetchEncryptedPartsPromises = Array.from({ length: totalEncryptedParts }).map((_, index) => {
        return async () => {
          return fetch(`/marketing/api/sends/download-send-encrypted-part`, {
            method: "GET",
            headers: {
              [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_ID]: sendId,
              [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.PART_NUMBER]: `${index + 1}`,
              [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_VIEW_ID]: sendViewId,
              [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_VIEW_PASSWORD]: sendViewPassword,
            },
          });
        };
      });

      // get the string data out from each and then concatenate them
      const encryptedParts = await parallelWithLimit({
        fns: fetchEncryptedPartsPromises,
        limit: 3,
      });

      const encryptedPartArrayBuffers = await Promise.all(encryptedParts.map((part) => part.arrayBuffer()));
      const text = encryptedPartArrayBuffers
        // each of these buffers should be a utf16 string and should be concatenated in order
        .map((arrayBuffer) => utf16ArrayBufferToString(arrayBuffer))
        .join("");

      const parsedPublicPackedSecrets = JSON.parse(text) as PublicPackedSecrets;

      const parsedPackedSecrets: PackedSecrets = {
        ...parsedPublicPackedSecrets,
        password,
      };

      const secretResponses = await encryptionWorker.sendPackedSecretsForDecryption(parsedPackedSecrets);
      setSecretResponses(secretResponses);

      // close the view
      await fetch(`/marketing/api/sends/complete-send-view`, {
        method: "POST",
        headers: {
          [COMPLETE_SEND_VIEW_HEADERS.SEND_ID]: sendId,
          [COMPLETE_SEND_VIEW_HEADERS.SEND_VIEW_ID]: sendViewId,
          [COMPLETE_SEND_VIEW_HEADERS.SEND_VIEW_PASSWORD]: sendViewPassword,
        },
      });
    };

    fetchAndDecrypt();
  }, [encryptionWorker, sendId, sendViewId, sendViewPassword, totalEncryptedParts, password]);

  if (password === "") {
    // can't do anything failed to load password via fragment
    return (
      <div className="container">
        <h3>SEND VIEWER</h3>
        <p className="muted mb-4">Failed to load password from URL fragment. This will not work.</p>
      </div>
    );
  }

  if (secretResponses === null) {
    return (
      <div className="container">
        <h3>SEND VIEWED</h3>
        <p className="muted mb-4">The send has been successfully unlocked to view!</p>
        <p>Send Id: {sendId}</p>
        <p>Send View Id: {sendViewId}</p>
        <p>Send View Password: {sendViewPassword}</p>

        {/** Can add in more fancy states here */}
        <p>Downloading and decrypting...</p>
        <Spinner />
      </div>
    );
  } else {
    // TODO: this is where the revealer should go. We still need to store the config for the send and
    // send it down once the send is ready to view. For now, just hardcode the config.

    // TODO
    return (
      <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="mb-2">{sendBuilderTemplate.title}</h3>

          <Alert variant={"success"}>
            <AlertDescription>The link has been successfully unlocked!</AlertDescription>
          </Alert>
          {/* TODO use a toast ^ */}
          {/* <pre>{JSON.stringify(secretResponses, null, 2)}</pre> */}
          <div className="mt-4">
            <DisplaySecrets template={sendBuilderTemplate} responses={secretResponses} />
          </div>
        </div>

        <aside className="space-y-4">
          <div>
            <Label>Created on</Label>
            <p>TODO date</p>
          </div>

          <div>
            <Label>Expires in</Label>
            <p>TODO views / TODO date</p>
          </div>
          <div>
            <AboutSidenav showAbout={true} />
          </div>
        </aside>
      </div>
    );
  }
}
