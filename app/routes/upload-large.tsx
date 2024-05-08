import { json, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { PassThrough } from "stream";
import { Readable } from "node:stream";

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 MB

// Server-side action function to handle the file upload
export const action: ActionFunction = async ({ request }) => {
  if (request.headers.get("content-type") !== "application/octet-stream") {
    return json({ error: "Invalid content type." }, { status: 400 });
  }

  if (request.body === null) {
    return json({ error: "No stream uploaded." }, { status: 400 });
  }

  console.log("Request headers:");
  console.log(request.headers);

  // Get the Content-Length header
  const contentLength = request.headers.get("Content-Length");

  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
    // If Content-Length exceeds the maximum, return a 413 Payload Too Large error
    console.log("Payload too large");

    return json({ error: "Payload too large." }, { status: 413 });
  }

  let totalBytes = 0;
  const counterStream = new PassThrough();

  counterStream.on("data", (chunk: Buffer) => {
    totalBytes += chunk.length; // Increment the total bytes counter
    console.log(`Received ${chunk.length} bytes`);
    console.log(`Total bytes received: ${totalBytes}`);

    if (totalBytes > MAX_FILE_SIZE) {
      counterStream.emit("error", new Error("File size exceeds the maximum limit"));
    }
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

    console.log(`Total bytes received: ${totalBytes}`);

    // After all data has been received
    return json({ success: true, totalBytes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";

    return json({ error: errorMessage }, { status: 413 });
  }
};

// Client-side component for file upload
export default function UploadLarge() {
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  function uploadLargeBinaryData(binaryArray: Uint8Array) {
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
    </div>
  );
}
