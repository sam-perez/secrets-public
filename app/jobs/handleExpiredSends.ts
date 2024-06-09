import { deleteObjectInS3 } from "~/lib/s3";
import {
  deleteSendEncryptedParts,
  getSendState,
  listNextPageOfSendExpirationRecords,
  saveSendState,
  SendId,
} from "~/lib/sends";
import { nowIso8601DateTimeString } from "~/lib/time";

/**
 * This job is responsible for handling expired sends.
 */
export const handleExpiredSends = async () => {
  console.log("Starting job to handle expired sends...");

  const expiredSends = await listNextPageOfSendExpirationRecords();

  if (expiredSends === undefined) {
    console.log("No expired sends found.");
    return;
  }

  console.log(`Found ${expiredSends.length} expired send records, processing any that have expired.`);

  const now = new Date();
  console.log(`Current time is ${now.toISOString()}.`);

  for (const expiredSend of expiredSends) {
    if (expiredSend.Key === undefined) {
      console.error("Expired send has no key, skipping.");
      continue;
    }

    // the key is in the format `sends/expirations/sends/${expiresAt}/${sendId}`
    const [, , , expiresAtIsoString, sendId] = expiredSend.Key.split("/");
    const expiresAt = new Date(expiresAtIsoString);

    console.log(`Processing expired send with key ${expiredSend.Key}.`, {
      sendId,
      expiresAt,
    });

    if (expiresAt < now) {
      try {
        // this send has expired, let's process it
        const sendState = await getSendState(sendId as SendId);

        if (sendState.dataDeletedAt !== null) {
          console.log(`Send ${sendId} has already been deleted, skipping.`);
          continue;
        }

        sendState.dataDeletedAt = nowIso8601DateTimeString();
        sendState.dataDeletedReason = "expired";

        await Promise.all([
          deleteSendEncryptedParts(sendState.sendId),
          saveSendState(sendState),
          deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: expiredSend.Key,
          }),
        ]);
      } catch (error) {
        console.error(`Error processing expired send with key ${expiredSend.Key}.`, error);
      }
    } else {
      console.log("We have reached first non-expired send, stopping processing.");
      break;
    }
  }

  console.log("Finished job to handle expired sends.");
};
