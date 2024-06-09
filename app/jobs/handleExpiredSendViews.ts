import { deleteObjectInS3 } from "~/lib/s3";
import {
  deleteSendEncryptedParts,
  getSendConfig,
  getSendState,
  listNextPageOfSendViewExpirationRecords,
  saveSendState,
  SendId,
} from "~/lib/sends";
import { nowIso8601DateTimeString } from "~/lib/time";

/**
 * This job is responsible for handling expired send views.
 */
export const handleExpiredSendViews = async () => {
  console.log("Starting job to handle expired sends views...");

  const expiredSendViews = await listNextPageOfSendViewExpirationRecords();

  if (expiredSendViews === undefined) {
    console.log("No send view expiration records found.");
    return;
  }

  console.log(`Found ${expiredSendViews.length} expired send view records, processing any that have expired.`);

  const now = new Date();
  console.log(`Current time is ${now.toISOString()}.`);

  for (const expiredSendView of expiredSendViews) {
    if (expiredSendView.Key === undefined) {
      console.error("Expired send view has no key, skipping.");
      continue;
    }

    // the key is in the format `sends/expirations/views/${expiresAt}/${sendId}/${sendViewId}`
    const [, , , expiresAtIsoString, sendId, sendViewId] = expiredSendView.Key.split("/");
    const expiresAt = new Date(expiresAtIsoString);

    console.log(`Processing expired send view with key ${expiredSendView.Key}.`, {
      expiresAt,
      sendId,
      sendViewId,
    });

    if (expiresAt < now) {
      try {
        // this send view has expired, let's process it
        const sendState = await getSendState(sendId as SendId);

        // find the view in the send state, if it exists
        const sendView = sendState.views.find((v) => v.sendViewId === sendViewId);
        if (sendView === undefined) {
          console.error(`Send view ${sendViewId} not found in send state, skipping.`);
          continue;
        }

        if (sendView.viewClosedAt !== null) {
          console.log(`Send view ${sendViewId} has already been closed, deleting this record and skipping.`);
          await deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: expiredSendView.Key,
          });

          continue;
        }

        sendView.viewClosedAt = nowIso8601DateTimeString();
        sendView.viewClosedReason = "expired";

        if (sendState.dataDeletedAt !== null) {
          // see if we need to delete the send also because now all views are closed and max views have been reached
          const sendConfig = await getSendConfig(sendId as SendId);

          if (sendState.views.every((v) => v.viewClosedAt !== null) && sendState.views.length >= sendConfig.maxViews) {
            // all views are closed and we have reached the max views, delete the send's encrypted parts
            sendState.dataDeletedAt = nowIso8601DateTimeString();
            sendState.dataDeletedReason = "max-views";
          }

          await deleteSendEncryptedParts(sendState.sendId);
        }

        await Promise.all([
          saveSendState(sendState),
          deleteObjectInS3({
            bucket: "MARKETING_BUCKET",
            key: expiredSendView.Key,
          }),
        ]);
      } catch (error) {
        console.error(`Error processing expired send view with key ${expiredSendView.Key}.`, error);
      }
    } else {
      console.log("We have reached first non-expired send view, stopping processing.");
      break;
    }
  }

  console.log("Finished job to handle expired send views.");
};
