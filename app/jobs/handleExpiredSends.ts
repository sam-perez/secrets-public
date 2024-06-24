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

  const sendExpirationRecords = await listNextPageOfSendExpirationRecords();

  if (sendExpirationRecords === undefined) {
    console.log("No send expiration records found.");
    return;
  }

  console.log(`Found ${sendExpirationRecords.length} expired send records, processing any that have expired.`);

  const now = new Date();
  console.log(`Current time is ${now.toISOString()}.`);

  for (const sendExpirationRecord of sendExpirationRecords) {
    if (sendExpirationRecord.Key === undefined) {
      console.error("Expired send has no key, skipping.");
      continue;
    }

    // the key is in the format `sends/expirations/sends/${expiresAt}/${sendId}`
    const [, , , expiresAtIsoString, sendId] = sendExpirationRecord.Key.split("/");
    const expiresAt = new Date(expiresAtIsoString);

    console.log(`Processing send expiration record with key ${sendExpirationRecord.Key}.`, {
      sendId,
      expiresAt,
    });

    if (expiresAt < now) {
      try {
        // this send has expired, let's process it
        const sendState = await getSendState(sendId as SendId);

        if (sendState.dataDeletedAt !== null) {
          console.log(`Send ${sendId} has already been deleted, just deleting this expiration record.`);

          await deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: sendExpirationRecord.Key,
          });

          continue;
        }

        sendState.dataDeletedAt = nowIso8601DateTimeString();
        sendState.dataDeletedReason = "expired";

        await Promise.all([
          deleteSendEncryptedParts(sendState.sendId),
          saveSendState(sendState),
          deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: sendExpirationRecord.Key,
          }),
        ]);
      } catch (error) {
        console.error(`Error processing send expiration record with key ${sendExpirationRecord.Key}.`, error);
      }
    } else {
      console.log("We have reached first non-expired send, stopping processing.");
      break;
    }
  }

  console.log("Finished job to handle expired sends.");
};
