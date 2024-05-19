import { ActionFunction } from "@remix-run/node";
import { uploadToS3, downloadFromS3, listObjectsInS3 } from "../lib/s3";
import { SendState } from "../lib/sends";

export const UPLOAD_SEND_ENCRYPTED_PART_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  ENCRYPTED_PART_PASSWORD: "X-2SECURED-ENCRYPTED-PART-PASSWORD",
  PART_NUMBER: "X-2SECURED-PART-NUMBER",
  TOTAL_PARTS: "X-2SECURED-TOTAL-PARTS",
};

/** The amount of time we are willing to wait after a send is created before we consider it too old. */
const REJECT_PARTS_AFTER_MS = 20 * 60 * 1000; // 20 minutes

export const action: ActionFunction = async ({ request }) => {
  // we need to pull the sendId from the request
  // we can do it all from the headers of the request
  const sendId = request.headers.get(UPLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_ID);
  const encryptedPartPassword = request.headers.get(UPLOAD_SEND_ENCRYPTED_PART_HEADERS.ENCRYPTED_PART_PASSWORD);
  const partNumber = request.headers.get(UPLOAD_SEND_ENCRYPTED_PART_HEADERS.PART_NUMBER);
  const totalParts = request.headers.get(UPLOAD_SEND_ENCRYPTED_PART_HEADERS.TOTAL_PARTS);

  if (!sendId || !encryptedPartPassword || !partNumber || !totalParts) {
    return new Response("Missing required headers", { status: 400 });
  }

  try {
    const sendStateKey = `sends/${sendId}/state.json`;

    const { data: sendStateData } = await downloadFromS3({
      bucket: "MARKETING_BUCKET",
      key: sendStateKey,
    });

    const sendState: SendState = JSON.parse(sendStateData.toString());

    // check to see if the encrypted part password matches the one we have stored
    if (sendState.encryptedPartsPassword !== encryptedPartPassword) {
      return new Response("Invalid encrypted part password", { status: 400 });
    }

    // also check to see if the send has already been marked as ready, or if it's been too long since it was created
    if (sendState.readyAt !== null) {
      return new Response("Send is already ready", { status: 400 });
    }

    const createdAt = new Date(sendState.createdAt);
    const elapsedMs = new Date().getTime() - createdAt.getTime();
    if (elapsedMs > REJECT_PARTS_AFTER_MS) {
      return new Response("Send is too old to accept parts", { status: 400 });
    }

    // we need to store the encrypted part in S3
    const encryptedPartKey = `sends/${sendId}/encrypted/${partNumber}.bin`;

    // just get the body from the request. we don't care about size for now since we are hosting in
    // vercel and they have a 4.5MB limit on request size
    const responseBlob = await request.blob();
    const responseArrayBuffer = await responseBlob.arrayBuffer();
    const responseBuffer = Buffer.from(responseArrayBuffer);

    // We don't care if we are overwriting an existing part. We are just going to overwrite it.
    // This would imply that the client is re-uploading the part for some reason, but we don't care.
    await uploadToS3({
      bucket: "MARKETING_BUCKET",
      key: encryptedPartKey,
      body: responseBuffer,
    });

    // check to see if all of the parts have been uploaded
    const encryptedPartsPrefix = `sends/${sendId}/encrypted/`;
    const { Contents: encryptedParts } = await listObjectsInS3({
      bucket: "MARKETING_BUCKET",
      prefix: encryptedPartsPrefix,
    });

    const expectedFinalTotalParts = parseInt(totalParts, 10);
    const actualTotalParts = encryptedParts?.length ?? 0;

    console.log(`Expected total parts: ${expectedFinalTotalParts}`);
    console.log(`Actual total parts: ${actualTotalParts}`);

    if (actualTotalParts === expectedFinalTotalParts) {
      sendState.readyAt = new Date().toISOString();

      await uploadToS3({
        bucket: "MARKETING_BUCKET",
        key: sendStateKey,
        body: Buffer.from(JSON.stringify(sendState)),
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
