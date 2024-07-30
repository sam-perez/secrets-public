import { ActionFunction } from "@remix-run/node";

import { getRandomBase62String } from "../lib/crypto-utils";
import {
  generateReceiveResponseId,
  getReceiveConfig,
  ReceiveId,
  ReceiveResponseId,
  ReceiveResponseState,
  saveReceiveResponseState,
  writeReceiveResponseExpirationRecord,
} from "../lib/receives";
import { getIso8601DateTimeString, nowIso8601DateTimeString } from "../lib/time";
import { sendDiscordMessage } from "../lib/utils";

/** The response from the initiate receive endpoint. */
export type InitiateReceiveResponseBody = {
  receiveId: ReceiveId;
  receiveResponseId: ReceiveResponseId;
  encryptedPartsPassword: string;
};

/**
 * The headers that we expect to be present in the request for initiating a receive response.
 */
export const INITIATE_RECEIVE_RESPONSE_HEADERS = {
  RECEIVE_ID: "X-2SECURED-RECEIVE-ID",
};

/**
 * Action for initiating a receive response.
 *
 * Will create a new receive response and return the receive response id and the password to use for uploading
 * the encrypted parts.
 */
export const action: ActionFunction = async ({ request }) => {
  const receiveResponseId = generateReceiveResponseId();

  // just ping discord without awaiting, should complete quickly
  sendDiscordMessage(`Receive response incoming: \`${receiveResponseId}\``);

  const receiveIdStr = request.headers.get(INITIATE_RECEIVE_RESPONSE_HEADERS.RECEIVE_ID);
  if (!receiveIdStr) {
    return new Response("Missing required headers", { status: 400 });
  }

  // we'll check if this is a real receive id by grabbing the config
  const receiveConfig = await getReceiveConfig(receiveIdStr as ReceiveId);
  const receiveId = receiveConfig.receiveId;

  // expire the receive in 30 days
  const now = new Date();
  const daysUntilExpiration = 30;
  const msPerDay = 24 * 60 * 60 * 1000;
  const expiresAt = getIso8601DateTimeString(new Date(now.getTime() + daysUntilExpiration * msPerDay));

  const initialReceiveResponseState: ReceiveResponseState = {
    receiveId,
    receiveResponseId,

    createdAt: nowIso8601DateTimeString(),
    creationRequestMetadata: { headers: Object.fromEntries(request.headers.entries()) },
    dataDeletedAt: null,
    dataDeletedReason: null,
    encryptedPartsPassword: getRandomBase62String(32),
    readyAt: null,
    expiresAt,
    // this is set when the receive is marked as ready
    totalEncryptedParts: null,
  };

  console.log(
    "Initiating receive response.",
    JSON.stringify({ receiveId, receiveConfig, initialReceiveResponseState }, null, 4)
  );

  try {
    await Promise.all([
      saveReceiveResponseState(initialReceiveResponseState),
      writeReceiveResponseExpirationRecord(receiveId, receiveResponseId, expiresAt),
    ]);

    const initiateReceiveResponseBody: InitiateReceiveResponseBody = {
      receiveId,
      receiveResponseId,
      encryptedPartsPassword: initialReceiveResponseState.encryptedPartsPassword,
    };

    return new Response(JSON.stringify(initiateReceiveResponseBody), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
