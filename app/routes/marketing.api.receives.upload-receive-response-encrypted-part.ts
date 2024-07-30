import { ActionFunction } from "@remix-run/node";

import {
  getEncryptedPartKey,
  getReceiveResponseState,
  listReceiveResponseEncryptedParts,
  ReceiveId,
  ReceiveResponseId,
  saveReceiveResponseState,
} from "../lib/receives";
import { uploadToS3 } from "../lib/s3";
import { nowIso8601DateTimeString } from "../lib/time";

/**
 * The headers that we expect to be present in the request for uploading an encrypted part.
 */
export const UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS = {
  RECEIVE_ID: "X-2SECURED-RECEIVE-ID",
  RECEIVE_RESPONSE_ID: "X-2SECURED-RECEIVE-RESPONSE-ID",
  ENCRYPTED_PART_PASSWORD: "X-2SECURED-ENCRYPTED-PART-PASSWORD",
  PART_NUMBER: "X-2SECURED-PART-NUMBER",
  TOTAL_PARTS: "X-2SECURED-TOTAL-PARTS",
};

/**
 * The amount of time we are willing to wait after a receive response is created before we consider it too old to
 * accept new parts. This is to prevent a malicious client from uploading parts for a receive response that was created
 * a long time ago.
 */
const REJECT_PARTS_AFTER_MS = 20 * 60 * 1000; // 20 minutes

export const action: ActionFunction = async ({ request }) => {
  // we need to pull the receive and receive response ids from the request.
  // we can do it all from the headers of the request.
  const receiveId = request.headers.get(UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_ID);
  const receiveResponseId = request.headers.get(UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_RESPONSE_ID);
  const encryptedPartPassword = request.headers.get(
    UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.ENCRYPTED_PART_PASSWORD
  );
  const partNumber = request.headers.get(UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.PART_NUMBER);
  const totalParts = request.headers.get(UPLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.TOTAL_PARTS);

  if (!receiveId || !receiveResponseId || !encryptedPartPassword || !partNumber || !totalParts) {
    return new Response("Missing required headers", { status: 400 });
  }

  try {
    const receiveResponseState = await getReceiveResponseState(
      receiveId as ReceiveId,
      receiveResponseId as ReceiveResponseId
    );

    // check to see if the encrypted part password matches the one we have stored
    if (receiveResponseState.encryptedPartsPassword !== encryptedPartPassword) {
      return new Response("Invalid encrypted part password.", { status: 400 });
    }

    // also check to see if the receive response has already been marked as ready,
    // or if it's been too long since it was created
    if (receiveResponseState.readyAt !== null) {
      return new Response("Receive response is no longer accepting parts.", { status: 400 });
    }

    const createdAt = new Date(receiveResponseState.createdAt);
    const elapsedMs = new Date().getTime() - createdAt.getTime();
    if (elapsedMs > REJECT_PARTS_AFTER_MS) {
      return new Response("Receive response is too old to accept parts.", { status: 400 });
    }

    // we need to store the encrypted part in S3
    const partNumberInt = parseInt(partNumber, 10);
    const totalPartsInt = parseInt(totalParts, 10);

    if (isNaN(totalPartsInt) || isNaN(partNumberInt) || partNumberInt < 0 || partNumberInt > totalPartsInt) {
      return new Response("Invalid part number.", { status: 400 });
    }

    // we want a max of let's say 15 parts for now. Each request is a max of 4.5MB, so we are looking at a max
    // of 15 * 4.5MB = 67.5MB. The client should impose a limit on the total size of the file that they are
    // sending, but we should also protect ourselves from a malicious client.
    if (totalPartsInt > 15) {
      return new Response("Too many parts.", { status: 400 });
    }

    const encryptedPartKey = getEncryptedPartKey(
      receiveResponseState.receiveId,
      receiveResponseState.receiveResponseId,
      parseInt(partNumber, 10)
    );

    // just get the body from the request. we don't care about size for now since we are hosting in
    // vercel and they have a 4.5MB limit on request size
    const responseBlob = await request.blob();
    const responseArrayBuffer = await responseBlob.arrayBuffer();
    const responseBuffer = Buffer.from(responseArrayBuffer);

    // We don't care if we are overwriting an existing part. We are just going to overwrite it.
    // This would imply that the client is re-uploading the part for some reason, but we don't care.
    // This really isn't worth solving right now, since really we'd probably want some locking mechanism
    // to prevent this from happening, but we don't have that right now since we are just using S3.
    // The REJECT_PARTS_AFTER_MS is probably good enough for now to prevent malicious weirdness.
    await uploadToS3({
      bucket: "MARKETING_BUCKET",
      key: encryptedPartKey,
      body: responseBuffer,
    });

    const encryptedParts = await listReceiveResponseEncryptedParts(
      receiveResponseState.receiveId,
      receiveResponseState.receiveResponseId
    );
    const actualTotalParts = encryptedParts?.length ?? 0;

    if (actualTotalParts === totalPartsInt) {
      receiveResponseState.readyAt = nowIso8601DateTimeString();

      // TODO: move this to the initiate-receive-response route? would only be worthwhile if we wanted to check before
      // accepting parts.
      receiveResponseState.totalEncryptedParts = actualTotalParts;

      await saveReceiveResponseState(receiveResponseState);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
