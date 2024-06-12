import {
  CheckIcon,
  CopyIcon,
  EnvelopeClosedIcon,
  LinkBreak2Icon,
  LockClosedIcon,
  OpenInNewWindowIcon,
} from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { stringToUtf16ArrayBuffer } from "~/lib/crypto-utils";
import { PublicPackedSecrets, SecretResponses } from "~/lib/secrets";
import { parallelWithLimit } from "~/lib/utils";
import { InitiateSendBody, InitiateSendResponse } from "~/routes/marketing.api.sends.initiate-send";
import { UPLOAD_SEND_ENCRYPTED_PART_HEADERS } from "~/routes/marketing.api.sends.upload-send-encrypted-part";

// eslint-disable-next-line max-len
import { EncryptionWorkerProvider, useEncryptionWorker } from "../../context-providers/EncryptionWorkerContextProvider";
import { Dialog, DialogContent, DialogFooter } from "../../ui/dialog";
import { Spinner } from "../../ui/Spinner";
import { SendBuilderConfiguration } from "./types";

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

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const sendSecret = async () => {
      try {
        setProgress("initializing-send");

        // We break out this initialization step so that if we add in any unknown properties to each field,
        // typescript will complain because "Object literal may only specify known properties". This is a
        // measure we're taking to make sure we don't accidentally include the `value` property in the fields.
        const initiateSendBodyFields: InitiateSendBody["fields"] = [];
        for (const field of sendBuilderConfiguration.fields) {
          // VERY IMPORTANT: we omit the value from the fields because we don't want to store the value
          // in the send state. If you forget this, you will leak the secret values to the server.
          initiateSendBodyFields.push({
            title: field.title,
            type: field.type,
          });
        }

        const initiateSendBody: InitiateSendBody = {
          title: sendBuilderConfiguration.title,
          confirmationEmail: sendBuilderConfiguration.confirmationEmail,
          expirationDate: sendBuilderConfiguration.expirationDate,
          maxViews: sendBuilderConfiguration.maxViews,
          password: sendBuilderConfiguration.password,
          fields: initiateSendBodyFields,
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

        let finishedParts = 0;

        setUploadedParts({
          totalParts,
          finishedParts,
        });

        const uploadPromiseGenerators = chunks.map((chunk, index) => {
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
          promiseGenerators: uploadPromiseGenerators,
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

  //copy function to copy the secret link
  const getShareLink = () => {
    if (secretLinkData === null) {
      return "";
    }

    // extract the host from the current URL
    const host = window.location.host;
    // also extract the https or http from the current URL
    const protocol = window.location.protocol;

    return `${protocol}//${host}/revealer/${secretLinkData.sendId}#${secretLinkData.encryptedPartsPassword}`;
  };
  const handleCopy = () => {
    if (secretLinkData === null) return;
    const shareLink = getShareLink();
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <>
      <Dialog open={true}>
        <DialogContent noClose={true} className="sm:max-w-xl">
          {secretLinkData === null ? (
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                <Spinner />
                {["initializing-send", "mounted", "encrypting"].includes(progress) ? (
                  <h4>Encrypting...</h4>
                ) : (
                  progress === "sending-parts" && (
                    <>
                      <h4>
                        {uploadedParts.finishedParts}/{uploadedParts.totalParts} parts encrypted
                      </h4>
                    </>
                  )
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="flex items-center">
                  <LockClosedIcon className="w-4 h-4 mr-1" />
                  Your data has been encrypted
                </h4>
                <p className="text-xs muted py-0">Only this link will be able to decrypt the information or files</p>
              </div>
              <div>
                <Label>Secret Link</Label>
                <div className="flex items-start space-x-2 mt-2">
                  <Input className="bg-slate-50 font-medium" type="text" value={getShareLink()} readOnly={true} />
                  <Button variant={"outline"} onClick={handleCopy}>
                    {isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                  </Button>
                  <Link to={getShareLink()}>
                    <Button type="button" variant="outline">
                      <OpenInNewWindowIcon />
                    </Button>
                  </Link>
                </div>

                {(sendBuilderConfiguration.maxViews || sendBuilderConfiguration.expirationDate) && (
                  <div className="flex items-center mt-2">
                    <LinkBreak2Icon className="w-4 h-4 text-slate-500 mr-3" />
                    <div>
                      <small>Link Expiration</small>
                      <p className="text-xs">
                        This link will expire in{" "}
                        <b>
                          {sendBuilderConfiguration.expirationDate?.totalTimeUnits}{" "}
                          {sendBuilderConfiguration.expirationDate?.timeUnit}
                        </b>{" "}
                        {sendBuilderConfiguration.maxViews && sendBuilderConfiguration.expirationDate ? "or " : ""}
                        <b>{sendBuilderConfiguration.maxViews} views</b>
                      </p>
                    </div>
                  </div>
                )}

                {sendBuilderConfiguration.confirmationEmail && (
                  <div className="flex items-center mt-2">
                    <EnvelopeClosedIcon className="w-4 h-4 text-slate-500 mr-3" />
                    <div>
                      <small>Email Restriction</small>
                      <p className="text-xs">
                        The recipient will need to enter a code emailed to{" "}
                        <b>{sendBuilderConfiguration.confirmationEmail}</b> to view
                      </p>
                    </div>
                  </div>
                )}

                {sendBuilderConfiguration.password && (
                  <div className="flex items-center mt-2">
                    <LockClosedIcon className="w-4 h-4 text-slate-500 mr-3" />
                    <div>
                      <small>Password</small>
                      <p className="text-xs">
                        The recipient must enter the password <b>{sendBuilderConfiguration.password}</b> to view
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="!justify-start">
                <Button type="button" variant="outline" onClick={handleCopy}>
                  Copy Link
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
