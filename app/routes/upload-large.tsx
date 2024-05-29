import { useState } from "react";
import { PackedSecrets, SecretResponses } from "../lib/secrets";
import {
  useEncryptionWorker,
  EncryptionWorkerProvider,
} from "../components/context-providers/EncryptionWorkerContextProvider";
import { InitiateSendResponse } from "./marketing.api.sends.initiate-send";
import { UPLOAD_SEND_ENCRYPTED_PART_HEADERS } from "./marketing.api.sends.upload-send-encrypted-part";
import { DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS } from "./marketing.api.sends.download-send-encrypted-part";
import { INITIATE_SEND_VIEW_HEADERS, InitiateSendViewResponse } from "./marketing.api.sends.initiate-send-view";
import { COMPLETE_SEND_VIEW_HEADERS } from "./marketing.api.sends.complete-send-view";
import { parallelWithLimit } from "../lib/utils";

function stringToUtf16ArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes per character
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function utf16ArrayBufferToString(arrayBuffer: ArrayBuffer) {
  const reconstructedStringChars = [];
  const uint16Array = new Uint16Array(arrayBuffer);

  for (let i = 0; i < uint16Array.length; i++) {
    reconstructedStringChars.push(String.fromCharCode(uint16Array[i]));
  }

  return reconstructedStringChars.join("");
}

export default function UploadLarge() {
  return (
    <EncryptionWorkerProvider>
      <UploadLargeInner />
    </EncryptionWorkerProvider>
  );
}

/**
 * The parts of the secret that are considered public.
 * This is the data that is sent to the server for encryption.
 */
type PublicPackedSecrets = Omit<PackedSecrets, "password">;

function UploadLargeInner() {
  const [progress, setProgress] = useState<number>(0);
  const [password, setPassword] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{
    totalParts: number;
    sendId: string;
  } | null>(null);

  const encryptionWorker = useEncryptionWorker();

  async function uploadLargeBinaryData(binaryArray: Uint8Array) {
    // initiate the secret send
    const initiateSendResponseFetch = await fetch("/marketing/api/sends/initiate-send", {
      method: "PUT",
    });
    const initiateSendResponse = (await initiateSendResponseFetch.json()) as InitiateSendResponse;

    const secretResponses: SecretResponses = [
      {
        textValues: ["This is a large file.", "It is very large."],
        files: [
          {
            name: "large-file.bin",
            data: binaryArray,
          },
        ],
      },
    ];

    console.log("Sending secret responses for encryption...");
    const packedSecrets = await encryptionWorker.sendSecretResponsesForEncryption(secretResponses);
    console.log("Done sending secret responses for encryption.");
    const publicPackedSecrets: PublicPackedSecrets = {
      iv: packedSecrets.iv,
      ciphertext: packedSecrets.ciphertext,
      salt: packedSecrets.salt,
    };

    setPassword(packedSecrets.password);

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

    console.log("Uploading encrypted parts..., chunks: ", chunks.length);
    const totalParts = chunks.length;

    setRequestData({
      totalParts,
      sendId: initiateSendResponse.sendId,
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
            [UPLOAD_SEND_ENCRYPTED_PART_HEADERS.ENCRYPTED_PART_PASSWORD]: initiateSendResponse.encryptedPartsPassword,
            [UPLOAD_SEND_ENCRYPTED_PART_HEADERS.TOTAL_PARTS]: `${totalParts}`,
          },
          body: new Blob([stringToUtf16ArrayBuffer(chunk)], { type: "application/octet-stream" }),
        });

        return fetchPromise.finally(() => {
          finishedParts += 1;
          setProgress((finishedParts / totalParts) * 100);
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

    console.log("Finished uploading encrypted parts.");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const arrayBuffer = e.target?.result;
        const binaryArray = new Uint8Array(arrayBuffer as ArrayBuffer);
        uploadLargeBinaryData(binaryArray);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  return (
    <div>
      <h1>Upload Large Binary Data</h1>
      <input type="file" onChange={handleFileChange} />
      <p>Progress: {progress.toFixed(2)}%</p>
      {requestData !== null ? (
        <>
          <p>Send ID: {requestData.sendId}</p>
          <a href={`/revealer/${requestData.sendId}`} target="_blank" rel="noreferrer">
            View Send
          </a>
        </>
      ) : null}
      <br />
      {password !== null && requestData !== null ? (
        <button
          onClick={async () => {
            // initiate the secret send view
            const initiateSendViewResponseFetch = await fetch("/marketing/api/sends/initiate-send-view", {
              method: "PUT",
              headers: {
                [INITIATE_SEND_VIEW_HEADERS.SEND_ID]: requestData.sendId,
                // no send password for now
                // [INITIATE_SEND_VIEW_HEADERS.SEND_PASSWORD]: password,
              },
            });
            const initiateSendViewResponse = (await initiateSendViewResponseFetch.json()) as InitiateSendViewResponse;

            if (initiateSendViewResponse.requiresConfirmation) {
              throw new Error("CONFIRMATION NOT READY YET.");
            }

            const { sendId, totalParts } = requestData;

            // fetch the encrypted parts
            const fetchEncryptedPartsPromises = Array.from({ length: totalParts }).map((_, index) => {
              return async () => {
                return fetch(`/marketing/api/sends/download-send-encrypted-part`, {
                  method: "GET",
                  headers: {
                    [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_ID]: sendId,
                    [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.PART_NUMBER]: `${index + 1}`,
                    [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_VIEW_ID]: initiateSendViewResponse.sendViewId,
                    [DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_VIEW_PASSWORD]: initiateSendViewResponse.viewPassword,
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

            // TODO: validate that the parsing is successful
            const parsedPublicPackedSecrets = JSON.parse(text) as PublicPackedSecrets;

            const parsedPackedSecrets: PackedSecrets = {
              ...parsedPublicPackedSecrets,
              password,
            };

            const secretResponses = await encryptionWorker.sendPackedSecretsForDecryption(parsedPackedSecrets);

            console.log("Decrypted secret responses:", secretResponses);

            // close the view
            await fetch(`/marketing/api/sends/complete-send-view`, {
              method: "POST",
              headers: {
                [COMPLETE_SEND_VIEW_HEADERS.SEND_ID]: sendId,
                [COMPLETE_SEND_VIEW_HEADERS.SEND_VIEW_ID]: initiateSendViewResponse.sendViewId,
                [COMPLETE_SEND_VIEW_HEADERS.SEND_VIEW_PASSWORD]: initiateSendViewResponse.viewPassword,
              },
            });
          }}
        >
          Now Download
        </button>
      ) : null}
    </div>
  );
}
