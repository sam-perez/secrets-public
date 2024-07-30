import { LoaderFunction } from "@remix-run/node";

import { getEncryptedPartKey, getReceiveResponseState, ReceiveId, ReceiveResponseId } from "../lib/receives";
import { downloadFromS3 } from "../lib/s3";

export const DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS = {
  RECEIVE_ID: "X-2SECURED-RECEIVE-ID",
  RECEIVE_RESPONSE_ID: "X-2SECURED-RECEIVE-RESPONSE-ID",
  PART_NUMBER: "X-2SECURED-PART-NUMBER",
};

/**
 * Action for downloading the encrypted parts of a receive response.
 *
 * We assume that if the person loading is loading the link, we can send them the encrypted part.
 * The receive and receive response ids themselves should be enough to verify that the person has access to the part,
 * and if they don't also have the encryption key, they won't be able to decrypt it.
 */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const receiveId = request.headers.get(DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_ID);
    // eslint-disable-next-line max-len
    const receiveResponseId = request.headers.get(DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_RESPONSE_ID);
    const partNumber = request.headers.get(DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.PART_NUMBER);

    if (!receiveId || !receiveResponseId || !partNumber) {
      return new Response("Missing required headers.", { status: 400 });
    }

    const receiveResponseState = await getReceiveResponseState(
      receiveId as ReceiveId,
      receiveResponseId as ReceiveResponseId
    );

    if (receiveResponseState.readyAt === null) {
      return new Response("Receive response is not ready.", { status: 400 });
    }

    if (receiveResponseState.dataDeletedAt !== null) {
      return new Response("Receive response data has been deleted.", { status: 400 });
    }

    // download the encrypted part
    const encryptedPartKey = getEncryptedPartKey(
      receiveResponseState.receiveId,
      receiveResponseState.receiveResponseId,
      parseInt(partNumber, 10)
    );

    const { data } = await downloadFromS3({
      bucket: "MARKETING_BUCKET",
      key: encryptedPartKey,
    });

    return new Response(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${partNumber}.bin"`,
      },
    });
  } catch (error) {
    return new Response("Server error.", { status: 500 });
  }
};
