import { LoaderFunction } from "@remix-run/node";
import { downloadFromS3 } from "../lib/s3";
import { getEncryptedPartKey, getSendStateKey, getSendConfigKey, SendId, SendState, SendConfig } from "../lib/sends";

export const DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  SEND_PASSWORD: "X-2SECURED-SEND-PASSWORD",
  PART_NUMBER: "X-2SECURED-PART-NUMBER",
};

/**
 * Action for downloading the encrypted parts of a send.
 *
 * Will only allow if the send is unexpired, has not been viewed too many times, has not been deleted,
 * if the header for the password matches the password we have stored (if one is stored), and if there is
 * a valid email confirmation attempt assuming that the send requires email confirmation.
 */
export const loader: LoaderFunction = async ({ request }) => {
  // check these two exist, we don't need to reach out to S3 for this
  const sendId = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_ID);
  const partNumber = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.PART_NUMBER);

  if (!sendId || !partNumber) {
    return new Response("Missing required headers.", { status: 400 });
  }

  // pull down the state and the config for the send
  const sendPassword = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_PASSWORD);

  const sendStateKey = getSendStateKey(sendId as SendId);
  const sendConfigKey = getSendConfigKey(sendId as SendId);

  const [sendStateResponse, sendConfigResponse] = await Promise.all([
    downloadFromS3({
      bucket: "MARKETING_BUCKET",
      key: sendStateKey,
    }),
    downloadFromS3({
      bucket: "MARKETING_BUCKET",
      key: sendConfigKey,
    }),
  ]);

  const sendState = JSON.parse(new TextDecoder().decode(sendStateResponse.data)) as SendState;
  const sendConfig = JSON.parse(new TextDecoder().decode(sendConfigResponse.data)) as SendConfig;

  // check to see if the send has been marked as ready
  if (sendState.readyAt === null) {
    return new Response("Send is not ready.", { status: 400 });
  }

  // check to see if the send has been deleted
  if (sendState.dataDeletedAt !== null) {
    return new Response("Send has been deleted.", { status: 400 });
  }

  // check to see if the send has expired
  if (sendConfig.expiresAt && new Date(sendConfig.expiresAt).getTime() < new Date().getTime()) {
    return new Response("Send has expired.", { status: 400 });
  }

  // check to see if the send requires a password
  if (sendConfig.password !== null) {
    if (sendPassword === null) {
      return new Response("Send requires a password.", { status: 400 });
    } else if (sendPassword !== sendConfig.password) {
      return new Response("Invalid password.", { status: 400 });
    }
  }

  // check to see if the send has been viewed too many times
  if (sendConfig.maxViews !== null && sendState.views.length >= sendConfig.maxViews) {
    return new Response("Send has been viewed too many times.", { status: 400 });
  }

  // check to see if the send requires email confirmation
  if (sendConfig.confirmationEmail !== null) {
    // check to see if the email confirmation has been made
    const emailConfirmationAttempt = sendState.emailConfirmationAttempts.find(
      (attempt) => attempt.emailConfirmedAt !== null
    );

    if (emailConfirmationAttempt === undefined) {
      return new Response("Send requires email confirmation.", { status: 400 });
    }
  }

  // download the encrypted part
  try {
    const encryptedPartKey = getEncryptedPartKey(sendId as SendId, parseInt(partNumber, 10));

    const { data } = await downloadFromS3({
      bucket: "MARKETING_BUCKET",
      key: encryptedPartKey,
    });

    return new Response(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${sendId}-${partNumber}.bin"`,
      },
    });
  } catch (error) {
    return new Response("Server error.", { status: 500 });
  }
};
