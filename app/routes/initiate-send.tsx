import { ActionFunction } from "@remix-run/node";
import { uploadToS3 } from "../lib/s3";
import { generateSendId, SendConfig, SendState, SendId, getSendStateKey, getSendConfigKey } from "../lib/sends";
import { getRandomBase62String } from "../lib/crypto-utils";

/** The response from the initiate send endpoint. */
export type InitiateSendResponse = {
  sendId: SendId;
  encryptedPartsPassword: string;
};

/**
 * Action for initiating a send.
 *
 * Will create a new send and return the send id and the password to use for encrypting the parts.
 * The config and the state of the send are written to our object store.
 */
export const action: ActionFunction = async () => {
  const sendId = generateSendId();

  // let's make a fake request for now
  const fakeSendConfig: SendConfig = {
    sendId,
    confirmationEmail: null,
    maxViews: null,
    expiresAt: null,
    password: null,
  };

  // with an initial send state
  const initialSendState: SendState = {
    sendId,
    createdAt: new Date().toISOString(),
    // super secure password
    encryptedPartsPassword: getRandomBase62String(32),
    readyAt: null,
    totalEncryptedParts: null,
    dataDeletedAt: null,
    dataDeletedReason: null,
    views: [],
  };

  // we are going to store the send config in S3 under sends/{sendId}/config.json
  // we will also store the send state in S3 under sends/{sendId}/state.json as well as the
  // encrypted file parts under sends/{sendId}/encrypted/{partNumber}.bin

  try {
    await Promise.all([
      uploadToS3({
        bucket: "MARKETING_BUCKET",
        body: Buffer.from(JSON.stringify(fakeSendConfig)),
        key: getSendConfigKey(sendId),
      }),
      uploadToS3({
        bucket: "MARKETING_BUCKET",
        body: Buffer.from(JSON.stringify(initialSendState)),
        key: getSendStateKey(sendId),
      }),
    ]);

    const initiateSendResponse: InitiateSendResponse = {
      sendId,
      encryptedPartsPassword: initialSendState.encryptedPartsPassword,
    };

    return new Response(JSON.stringify(initiateSendResponse), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
