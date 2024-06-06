import { LoaderFunction } from "@remix-run/node";
import { downloadFromS3 } from "../lib/s3";
import { SEND_VIEW_EXPIRATION_MS, SendId, getEncryptedPartKey, getSendState } from "../lib/sends";

export const DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS = {
  SEND_ID: "X-2SECURED-SEND-ID",
  SEND_VIEW_ID: "X-2SECURED-SEND-VIEW-ID",
  SEND_VIEW_PASSWORD: "X-2SECURED-SEND-VIEW-PASSWORD",
  PART_NUMBER: "X-2SECURED-PART-NUMBER",
};

/**
 * Action for downloading the encrypted parts of a send.
 *
 * Checks to make sure a view has been initiated, that the password is correct, and that the view has not expired
 * or been closed.
 */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    // check these two exist, we don't need to reach out to S3 for this
    const sendId = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_ID);
    const partNumber = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.PART_NUMBER);
    const sendViewId = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_VIEW_ID);
    const viewPassword = request.headers.get(DOWNLOAD_SEND_ENCRYPTED_PART_HEADERS.SEND_VIEW_PASSWORD);

    if (!sendId || !partNumber || !sendViewId || !viewPassword) {
      return new Response("Missing required headers.", { status: 400 });
    }

    const sendState = await getSendState(sendId as SendId);

    // find the matching view
    const view = sendState.views.find((v) => v.sendViewId === sendViewId);
    if (!view) {
      return new Response("No matching view found.", { status: 400 });
    }

    // check the password. we assume that the password has not been distributed unless the view is confirmed.
    if (view.viewPassword !== viewPassword) {
      return new Response("Invalid view password.", { status: 400 });
    }

    // check to make sure the view is not marked as closed
    if (view.viewClosedAt !== null) {
      return new Response("View is closed.", { status: 400 });
    }

    // check to make sure the view is marked as ready
    if (view.viewReadyAt === null) {
      return new Response("View is not ready.", { status: 400 });
    }

    // check to make sure the view has not expired
    if (new Date().getTime() - new Date(view.viewInitiatedAt).getTime() > SEND_VIEW_EXPIRATION_MS) {
      return new Response("View has expired.", { status: 400 });
    }

    // download the encrypted part
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
