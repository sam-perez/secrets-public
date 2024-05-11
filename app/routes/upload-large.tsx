import { json, ActionFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { PassThrough } from "stream";
import { Readable } from "node:stream";
import { stringToUint8Array, uint8ArrayToString, computeSHA256HashOfUint8Array } from "../lib/encryption";

import { uploadToS3, BUCKET_OPTIONS } from "../lib/s3";

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

    if (totalBytes > MAX_FILE_SIZE || Math.random() <= 1) {
      // If the total bytes exceeds the maximum, destroy the stream
      counterStream.destroy(new Error("Payload too large"));
    }

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
    await uploadToS3({
      bucket: process.env["AWS_APPLICATION_BUCKET"] as BUCKET_OPTIONS, // i swear
      key: "large-file.bin",
      body: buffer,
    });

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

// Client-side component for file upload
export default function UploadLarge() {
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [uploadHash, setUploadHash] = useState<string>("");
  const [downloadHash, setDownloadHash] = useState<string>("");

  // side effect on load to calculate some fibonacci numbers
  useEffect(() => {
    console.log("Calculating fibonacci numbers...");
    console.log(process.env);

    const worker = new Worker("./assets/workers/encryption_worker.js");
    console.log("Worker created!!!");
    worker.onmessage = (event) => {
      console.log("Fibonacci result:", event.data);
    };

    worker.postMessage({ data: 40 });
  });

  async function uploadLargeBinaryData(binaryArray: Uint8Array) {
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
    xhr.send(new Blob([binaryArray]));

    setUploadHash(await computeSHA256HashOfUint8Array(binaryArray));

    // let's test out some stuff
    const { stringRepresentation, originalLength } = uint8ArrayToString(binaryArray);
    const reconstituted = stringToUint8Array({ stringRepresentation, originalLength });

    console.log("Data integrity check:", binaryArray.toString() === reconstituted.toString() ? "PASSED" : "FAILED");

    console.log("Converted string (gobbledygook):", stringRepresentation);

    const originalHash = await computeSHA256HashOfUint8Array(binaryArray);
    const reconstitutedHash = await computeSHA256HashOfUint8Array(reconstituted);

    const sizeOfBinaryArray = binaryArray.length;
    const sizeOfStr = stringRepresentation.length;
    console.log("Size of binary array:", sizeOfBinaryArray);
    console.log("Size of string:", sizeOfStr);

    console.log("Hashes:", { originalHash, reconstitutedHash });
    console.log("Hash integrity check:", originalHash === reconstitutedHash ? "PASSED" : "FAILED");
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
      <p>Upload hash: {uploadHash || "Unavailable"}</p>
      <p>Download hash: {downloadHash || "Unavailable"}</p>
      {uploadHash !== "" ? (
        <button
          onClick={async () => {
            const response = await fetch(`/fetch-blob?key=${encodeURIComponent("large-file.bin")}`);
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();

            setDownloadHash(await computeSHA256HashOfUint8Array(new Uint8Array(buffer)));
          }}
        >
          Now Download
        </button>
      ) : null}
    </div>
  );
}
