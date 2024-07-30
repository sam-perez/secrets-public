import {
  deleteReceiveResponseEncryptedParts,
  getReceiveResponseState,
  listNextPageOfReceiveResponseExpirationRecords,
  ReceiveId,
  ReceiveResponseId,
  saveReceiveResponseState,
} from "~/lib/receives";
import { deleteObjectInS3 } from "~/lib/s3";
import { nowIso8601DateTimeString } from "~/lib/time";

/**
 * This job is responsible for handling expired receive responses.
 */
export const handleExpiredReceiveResponses = async () => {
  console.log("Starting job to handle expired receives...");

  const receiveResponseExpirationRecords = await listNextPageOfReceiveResponseExpirationRecords();

  if (receiveResponseExpirationRecords === undefined) {
    console.log("No receive response expiration records found.");
    return;
  }

  console.log(
    `Found ${receiveResponseExpirationRecords.length} expired receive response records, processing the expired ones.`
  );

  const now = new Date();
  console.log(`Current time is ${now.toISOString()}.`);

  for (const expirationRecord of receiveResponseExpirationRecords) {
    if (expirationRecord.Key === undefined) {
      console.error("Expired receive response has no key, skipping.");
      continue;
    }

    // the key is in the format `receives/expirations/responses/${expiresAt}/${receiveId}/${receiveResponseId}`
    const [, , , expiresAtIsoString, receiveId, receiveResponseId] = expirationRecord.Key.split("/");
    const expiresAt = new Date(expiresAtIsoString);

    console.log(`Processing receive response expiration record with key ${expirationRecord.Key}.`, {
      receiveId,
      receiveResponseId,
      expiresAt,
    });

    if (expiresAt < now) {
      try {
        // this send has expired, let's process it
        const receiveResponseState = await getReceiveResponseState(
          receiveId as ReceiveId,
          receiveResponseId as ReceiveResponseId
        );

        if (receiveResponseState.dataDeletedAt !== null) {
          console.log(
            `Receive response ${receiveResponseId} has already been deleted, just deleting this expiration record.`
          );

          await deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: expirationRecord.Key,
          });

          continue;
        }

        receiveResponseState.dataDeletedAt = nowIso8601DateTimeString();
        receiveResponseState.dataDeletedReason = "expired";

        await Promise.all([
          deleteReceiveResponseEncryptedParts(receiveResponseState.receiveId, receiveResponseState.receiveResponseId),
          saveReceiveResponseState(receiveResponseState),
          deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: expirationRecord.Key,
          }),
        ]);
      } catch (error) {
        console.error(`Error processing receive response expiration record with key ${expirationRecord.Key}.`, error);
      }
    } else {
      console.log("We have reached first non-expired receive response, stopping processing.");
      break;
    }
  }

  console.log("Finished job to handle expired sends.");
};
