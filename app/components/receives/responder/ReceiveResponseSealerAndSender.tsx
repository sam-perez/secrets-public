import { LockClosedIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { stringToUtf16ArrayBuffer } from "~/lib/crypto-utils";
import { ReceiveConfig } from "~/lib/receives";
import { PublicPackedSecrets, SecretResponses } from "~/lib/secrets";
import { chunkOutPackedSecrets, exhaustiveGuard, parallelWithLimit } from "~/lib/utils";
import {
  INITIATE_RECEIVE_RESPONSE_HEADERS,
  InitiateReceiveResponseResponseBody,
} from "~/routes/marketing.api.receives.initiate-receive-response";
// eslint-disable-next-line max-len
import { UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS } from "~/routes/marketing.api.receives.upload-receive-response-encrypted-part";

// eslint-disable-next-line max-len
import { EncryptionWorkerProvider, useEncryptionWorker } from "../../context-providers/EncryptionWorkerContextProvider";
import { Dialog, DialogContent } from "../../ui/dialog";
import { Spinner } from "../../ui/Spinner";
import { ReceiveResponse } from "./types";

/**
 * The component that seals and sends the secret from the receive responder.
 *
 * Accepts the secret fields, seals them, and sends them to the backend via the API.
 */
// eslint-disable-next-line max-len
export function ReceiveResponseSealerAndSender({
  receiveId,
  receiveResponse,
  notificationConfig,
}: {
  receiveId: string;
  receiveResponse: ReceiveResponse;
  notificationConfig: ReceiveConfig["notificationConfig"];
}) {
  return (
    <EncryptionWorkerProvider>
      <ReceiveResponseSealerAndSenderInner
        receiveId={receiveId}
        receiveResponse={receiveResponse}
        notificationConfig={notificationConfig}
      />
    </EncryptionWorkerProvider>
  );
}

/**
 * The inner component that sends the secret. Responsible for sending the secret to the API.
 */
function ReceiveResponseSealerAndSenderInner({
  receiveId,
  receiveResponse,
  notificationConfig,
}: {
  receiveId: string;
  receiveResponse: ReceiveResponse;
  notificationConfig: ReceiveConfig["notificationConfig"];
}) {
  const encryptionWorker = useEncryptionWorker();

  const [uploadedParts, setUploadedParts] = useState<{
    totalParts: number;
    finishedParts: number;
  }>({
    totalParts: 0,
    finishedParts: 0,
  });

  const [progress, setProgress] = useState<
    "mounted" | "initializing" | "encrypting" | "sending-parts" | "done" | "error"
  >("mounted");

  useEffect(() => {
    const sendSecret = async () => {
      try {
        setProgress("initializing");

        // initiate the secret send
        const initiateSendResponseFetch = await fetch("/marketing/api/receives/initiate-receive-response", {
          method: "POST",
          headers: {
            [INITIATE_RECEIVE_RESPONSE_HEADERS.RECEIVE_ID]: receiveId,
          },
        });

        if (initiateSendResponseFetch.ok === false) {
          setProgress("error");
          console.error("Failed to initiate send", {
            status: initiateSendResponseFetch.status,
            statusText: initiateSendResponseFetch.statusText,
          });

          return;
        }

        const initiateResponse = (await initiateSendResponseFetch.json()) as InitiateReceiveResponseResponseBody;

        const secretResponses: SecretResponses = await Promise.all(
          receiveResponse.fields.map(async (field) => {
            if (field.type === "single-line-text" || field.type === "multi-line-text") {
              return {
                textValues: [field.value || ""],
                files: [],
              };
            } else {
              return {
                textValues: [],
                files:
                  field.value === null
                    ? []
                    : await Promise.all(
                        field.value.map(async (file) => {
                          return {
                            name: file.name,
                            data: new Uint8Array(await file.arrayBuffer()),
                          };
                        })
                      ),
              };
            }
          })
        );

        setProgress("encrypting");

        const packedSecrets = await encryptionWorker.sendSecretResponsesForEncryption(secretResponses);

        const publicPackedSecrets: PublicPackedSecrets = {
          iv: packedSecrets.iv,
          ciphertext: packedSecrets.ciphertext,
          salt: packedSecrets.salt,
        };

        setProgress("sending-parts");

        const publicPackedSecretsJson = JSON.stringify(publicPackedSecrets);

        // split up the json string into 4mb chunks, assuming 2 bytes per character
        const chunks = chunkOutPackedSecrets(publicPackedSecretsJson);

        const totalParts = chunks.length;

        let finishedParts = 0;

        setUploadedParts({
          totalParts,
          finishedParts,
        });

        const uploadPromiseGenerators = chunks.map((chunk, index) => {
          return async () => {
            const fetchPromise = fetch(`/marketing/api/receives/upload-receive-response-encrypted-part`, {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                [UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_ID]: initiateResponse.receiveId,
                [UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_RESPONSE_ID]:
                  initiateResponse.receiveResponseId,
                [UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.PART_NUMBER]: `${index + 1}`,
                [UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.ENCRYPTED_PART_PASSWORD]:
                  initiateResponse.encryptedPartsPassword,
                [UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.TOTAL_PARTS]: `${totalParts}`,
              },
              body: new Blob([stringToUtf16ArrayBuffer(chunk)], { type: "application/octet-stream" }),
            });

            return fetchPromise.finally(() => {
              finishedParts += 1;
              setUploadedParts({
                totalParts,
                finishedParts,
              });
            });
          };
        });

        const uploadEncryptedPartResults = await parallelWithLimit({
          promiseGenerators: uploadPromiseGenerators,
          limit: 3,
        });

        // check to make sure that they all uploaded successfully
        uploadEncryptedPartResults.forEach((result) => {
          if (!result.ok) {
            throw new Error("Failed to upload encrypted part.");
          }
        });

        // eslint-disable-next-line max-len
        const receiveResponseLink = `${window.location.origin}/rr/${initiateResponse.receiveId}/${initiateResponse.receiveResponseId}#${packedSecrets.password}`;

        // send a notification
        console.log("Sending notification", { notificationConfig, linkToReceiveResponse: receiveResponseLink });

        if (notificationConfig.type === "webhook") {
          await fetch(notificationConfig.url, {
            method: "POST",
            body: JSON.stringify({ receiveResponseLink }),
          });
        } else {
          exhaustiveGuard(notificationConfig.type);
        }

        setProgress("done");
      } catch (error) {
        console.error(error);
        setProgress("error");
      }
    };

    sendSecret();
    // we only want to run this exactly once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let dialogContent = null;

  if (progress === "error") {
    dialogContent = (
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <h4>There was an error sending the secret data.</h4>
        </div>
      </div>
    );
  } else if (progress === "done") {
    dialogContent = (
      <div>
        <h4 className="flex items-center">
          <LockClosedIcon className="w-4 h-4 mr-1" />
          Your data has been encrypted and sent.
        </h4>
        <p className="text-xs muted py-0">Thank you! The owner of this request has been notified.</p>
      </div>
    );
  } else {
    dialogContent = (
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <Spinner />
          {(() => {
            switch (progress) {
              case "initializing":
              case "mounted":
              case "encrypting":
                return <h4>Encrypting...</h4>;
              case "sending-parts":
                return (
                  <h4>
                    {uploadedParts.finishedParts}/{uploadedParts.totalParts} parts encrypted
                  </h4>
                );
              default:
                exhaustiveGuard(progress);
            }
          })()}
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={true}>
        <DialogContent noClose={true} className="sm:max-w-xl">
          {dialogContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
