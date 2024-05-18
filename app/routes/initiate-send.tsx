import { ActionFunction } from "@remix-run/node";
import { downloadFromS3, uploadToS3 } from "../lib/s3";
import { generateSendId, SendConfig, SendState } from "../lib/sends";
import { getRandomBase62String } from "../lib/crypto-utils";

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
    deletedReason: null,
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

    return new Response(
      JSON.stringify({
        sendId,
        encryptedPartsPassword: fakeSendState.encryptedPartsPassword,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
