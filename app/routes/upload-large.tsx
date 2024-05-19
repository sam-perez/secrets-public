import { json, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { PassThrough } from "stream";
import { Readable } from "node:stream";
import { PackedSecrets, SecretResponses } from "../lib/secrets";
import { uploadToS3, BUCKET_OPTIONS } from "../lib/s3";
import {
  useEncryptionWorker,
  EncryptionWorkerProvider,
} from "../components/context-providers/EncryptionWorkerContextProvider";
import { InitiateSendResponse } from "./initiate-send";

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 MB

// Server-side action function to handle the file upload
export const action: ActionFunction = async ({ request }) => {
  if (request.headers.get("content-type") !== "application/octet-stream") {
    return json({ error: "Invalid content type." }, { status: 400 });
  }

  if (request.body === null) {
    return json({ error: "No stream uploaded." }, { status: 400 });
  }

  // Get the Content-Length header
  const contentLength = request.headers.get("content-length");

  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
    // If Content-Length exceeds the maximum, return a 413 Payload Too Large error
    return json({ error: "Payload too large" }, { status: 413 });
  }

  let totalBytes = 0;
  const counterStream = new PassThrough();
  const chunks: Buffer[] = [];

  counterStream.on("data", (chunk: Buffer) => {
    totalBytes += chunk.length; // Increment the total bytes counter

    if (totalBytes > MAX_FILE_SIZE) {
      // If the total bytes exceeds the maximum, destroy the stream
      counterStream.destroy(new Error("Payload too large"));
    }

    console.log(`Received ${chunk.length} bytes`); // Log the number of bytes received
    console.log(`Total bytes received: ${totalBytes}`); // Log the total bytes received
    chunks.push(chunk);
  });

  try {
    // Wait for all data to pass through
    await new Promise<void>((resolve, reject) => {
      counterStream.on("end", resolve);
      counterStream.on("error", reject);

      const bodyIterable: AsyncIterable<unknown> = {
        [Symbol.asyncIterator]() {
          const reader = request.body?.getReader();
          return {
            async next() {
              const { done, value } = (await reader?.read()) ?? { done: true, value: undefined };
              return { done, value };
            },
          };
        },
      };

      const stream = Readable.from(bodyIterable, {
        objectMode: false,
        highWaterMark: 16,
      });

      stream.pipe(counterStream);
    });

    // Upload the file to S3. for now, we're just loading the entire file into memory instead of streaming it.
    // in the future, when we are on a platform that supports body sizes larger than 4.5MB (vercel limitation),
    // we can stream the data directly to S3.
    const buffer = Buffer.concat(chunks);
    console.log(`Uploading ${buffer.length} bytes to S3`);
    await uploadToS3({
      bucket: process.env["AWS_APPLICATION_BUCKET"] as BUCKET_OPTIONS, // i swear
      key: "large-file.bin",
      body: buffer,
    });
    console.log("Upload complete");

    // After all data has been received
    return json({ success: true, totalBytes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";

    if (errorMessage === "Payload too large") {
      return json({ error: "Payload too large" }, { status: 413 });
    } else {
      return json({ error: errorMessage }, { status: 500 });
    }
  }
};

function stringToUtf16ArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes per character
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

async function utf16ArrayBufferBlobToString(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
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

function UploadLargeInner() {
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [packedSecrets, setPackedSecrets] = useState<PackedSecrets | null>(null);

  const encryptionWorker = useEncryptionWorker();

  async function uploadLargeBinaryData(binaryArray: Uint8Array) {
    // initiate the secret send
    const initiateSendResponseFetch = await fetch("/initiate-send");
    const initiateSendResponse: InitiateSendResponse = await initiateSendResponseFetch.json();

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
    const packedSecretsJson = JSON.stringify(packedSecrets);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload-large");

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setMessage("Upload successful");
        setPackedSecrets(packedSecrets);
      } else {
        setMessage(`Upload failed: ${xhr.responseText}`);
      }
    };

    xhr.onerror = () => setMessage("Upload failed: Network error " + xhr.status);

    xhr.onreadystatechange = function () {
      console.log(`Ready state: ${xhr.readyState}`);
      if (xhr.readyState == XMLHttpRequest.HEADERS_RECEIVED) {
        if (xhr.status === 413) {
          xhr.abort(); // Abort the request if the server says the payload is too large
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.send(new Blob([stringToUtf16ArrayBuffer(packedSecretsJson)], { type: "application/octet-stream" }));
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
      <p>{message}</p>
      {packedSecrets !== null ? (
        <button
          onClick={async () => {
            const response = await fetch(`/fetch-blob?key=${encodeURIComponent("large-file.bin")}`);
            const blob = await response.blob();
            const text = await utf16ArrayBufferBlobToString(blob);
            // TODO: validate that the parsing is successful
            const parsedPackedSecrets = JSON.parse(text) as PackedSecrets;

            const secretResponses = await encryptionWorker.sendPackedSecretsForDecryption(parsedPackedSecrets);

            console.log("Decrypted secret responses:", secretResponses);
          }}
        >
          Now Download
        </button>
      ) : null}
    </div>
  );
}
