import { useEffect, useState } from "react";
import { SendBuilderConfiguration } from "./types";
import { Dialog, DialogContent } from "../../ui/dialog";
import { Spinner } from "../../ui/Spinner";
import { InitiateSendResponse, InitiateSendBody } from "../../../routes/marketing.api.sends.initiate-send";
import { UPLOAD_SEND_ENCRYPTED_PART_HEADERS } from "../../../routes/marketing.api.sends.upload-send-encrypted-part";
import { PublicPackedSecrets, SecretResponses } from "../../../lib/secrets";
import { parallelWithLimit } from "../../../lib/utils";
import { stringToUtf16ArrayBuffer } from "../../../lib/crypto-utils";

// eslint-disable-next-line max-len
import { EncryptionWorkerProvider, useEncryptionWorker } from "../../context-providers/EncryptionWorkerContextProvider";

/**
 * The component that sends the secret. Accepts a completed secret builder configuration, massages the data into the
 * shape expected by the API, and sends it.
 */
export function SecretSender({ sendBuilderConfiguration }: { sendBuilderConfiguration: SendBuilderConfiguration }) {
  return (
    <EncryptionWorkerProvider>
      <SecretSenderInner sendBuilderConfiguration={sendBuilderConfiguration} />
    </EncryptionWorkerProvider>
  );
}

/**
 * The inner component that sends the secret. Responsible for sending the secret to the API.
 */
function SecretSenderInner({ sendBuilderConfiguration }: { sendBuilderConfiguration: SendBuilderConfiguration }) {
  const encryptionWorker = useEncryptionWorker();

  const [secretLinkData, setSecretLinkData] = useState<{
    sendId: string;
    encryptedPartsPassword: string;
  } | null>(null);

  const [uploadedParts, setUploadedParts] = useState<{
    totalParts: number;
    finishedParts: number;
  }>({
    totalParts: 0,
    finishedParts: 0,
  });

  const [progress, setProgress] = useState<
    "mounted" | "initializing-send" | "encrypting" | "sending-parts" | "done" | "error"
  >("mounted");

  useEffect(() => {
    const sendSecret = async () => {
      try {
        setProgress("initializing-send");

        const initiateSendBody: InitiateSendBody = {
          title: sendBuilderConfiguration.title,
          confirmationEmail: sendBuilderConfiguration.confirmationEmail,
          expirationDate: sendBuilderConfiguration.expirationDate,
          maxViews: sendBuilderConfiguration.maxViews,
          password: sendBuilderConfiguration.password,
          fields: sendBuilderConfiguration.fields.map((field) => {
            // VERY IMPORTANT: we omit the value from the fields because we don't want to store the value
            // in the send state. If you forget this, you will leak the secret values to the server.

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { value, ...rest } = field;

            return rest;
          }),
        };

        // initiate the secret send
        const initiateSendResponseFetch = await fetch("/marketing/api/sends/initiate-send", {
          method: "POST",
          body: JSON.stringify(initiateSendBody),
        });

        if (initiateSendResponseFetch.ok === false) {
          setProgress("error");
          console.error("Failed to initiate send", {
            status: initiateSendResponseFetch.status,
            statusText: initiateSendResponseFetch.statusText,
          });

          return;
        }

        const initiateSendResponse = (await initiateSendResponseFetch.json()) as InitiateSendResponse;

        const secretResponses: SecretResponses = await Promise.all(
          sendBuilderConfiguration.fields.map(async (field) => {
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
        const bytesPerCharacter = 2;
        const chunkSize = (4 * 1024 * 1024) / bytesPerCharacter;
        const chunkArrays: Array<Array<string>> = [[]];
        for (let i = 0; i < publicPackedSecretsJson.length; i += 1) {
          let currentChunk = chunkArrays[chunkArrays.length - 1];

          if (currentChunk.length >= chunkSize) {
            chunkArrays.push([]);
            currentChunk = chunkArrays[chunkArrays.length - 1];
          }

          currentChunk.push(publicPackedSecretsJson[i]);
        }

        const chunks = chunkArrays.map((chunk) => chunk.join(""));

        const totalParts = chunks.length;

        setUploadedParts({
          totalParts,
          finishedParts: 0,
        });

        let finishedParts = 0;

        const uploadPromises = chunks.map((chunk, index) => {
          return async () => {
            const fetchPromise = fetch(`/marketing/api/sends/upload-send-encrypted-part`, {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                [UPLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_ID]: initiateSendResponse.sendId,
                [UPLOAD_SEND_ENCRYPTED_PART_HEADERS.PART_NUMBER]: `${index + 1}`,
                [UPLOAD_SEND_ENCRYPTED_PART_HEADERS.ENCRYPTED_PART_PASSWORD]:
                  initiateSendResponse.encryptedPartsPassword,
                [UPLOAD_SEND_ENCRYPTED_PART_HEADERS.TOTAL_PARTS]: `${totalParts}`,
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
          fns: uploadPromises,
          limit: 3,
        });

        // check to make sure that they all uploaded successfully
        uploadEncryptedPartResults.forEach((result) => {
          if (!result.ok) {
            throw new Error("Failed to upload encrypted part.");
          }
        });

        setProgress("done");

        setSecretLinkData({
          sendId: initiateSendResponse.sendId,
          encryptedPartsPassword: packedSecrets.password,
        });
      } catch (error) {
        console.error(error);
        setProgress("error");
      }
    };

    sendSecret();
    // we only want to run this exactly once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Dialog open={true}>
        <DialogContent noClose={true} className="sm:max-w-md">
          {secretLinkData === null ? (
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                <Spinner />
                <h4>{progress}</h4>
                {
                  // show the progress if we have it
                  progress === "sending-parts" && (
                    <p>
                      {uploadedParts.finishedParts}/{uploadedParts.totalParts} parts uploaded
                    </p>
                  )
                }
              </div>
            </div>
          ) : (
            <>
              <p>Send ID: {secretLinkData.sendId}</p>
              <a
                href={`/revealer/${secretLinkData.sendId}#${secretLinkData.encryptedPartsPassword}`}
                target="_blank"
                rel="noreferrer"
              >
                View Send
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
