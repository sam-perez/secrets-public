import { ActionFunction } from "@remix-run/node";
import { uploadToS3 } from "../lib/s3";
import { generateSendId, SendConfig, SendState, SendId } from "../lib/sends";
import { getRandomBase62String } from "../lib/crypto-utils";

/** The response from the initiate send endpoint. */
export type InitiateSendResponse = {
  sendId: SendId;
  encryptedPartsPassword: string;
};

export const action: ActionFunction = async () => {
  const sendId = generateSendId();

  // let's make a fake request for now
  const fakeSendConfig: SendConfig = {
    sendId,
  };

  const fakeSendState: SendState = {
    sendId,
    createdAt: new Date().toISOString(),
    // super secure password
    encryptedPartsPassword: getRandomBase62String(32),
    readyAt: null,
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
        key: `sends/${sendId}/config.json`,
      }),
      uploadToS3({
        bucket: "MARKETING_BUCKET",
        body: Buffer.from(JSON.stringify(fakeSendState)),
        key: `sends/${sendId}/state.json`,
      }),
    ]);

    const initiateSendResponse: InitiateSendResponse = {
      sendId,
      encryptedPartsPassword: fakeSendState.encryptedPartsPassword,
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
