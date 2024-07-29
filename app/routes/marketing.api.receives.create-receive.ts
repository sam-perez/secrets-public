import { ActionFunction } from "@remix-run/node";

import { ReceiveBuilderConfiguration, ReceiveBuilderField } from "~/components/receives/builder/types";

import { generateReceiveId, ReceiveConfig, ReceiveId, saveReceiveConfig } from "../lib/receives";
import { nowIso8601DateTimeString } from "../lib/time";
import { sendDiscordMessage } from "../lib/utils";

/** The response from the create receive endpoint. */
export type CreateReceiveResponse = { receiveId: ReceiveId };

/**
 * The body of the create receive endpoint.
 *
 * For now, reuse the receive builder configuration. We do some massaging of the data in the route to make it
 * compatible with the receive state and receive config.
 *
 * No values are stored in the configuration, just the titles and types.
 */
export type CreateReceiveBody = {
  notificationConfig: ReceiveConfig["notificationConfig"];
  template: Omit<ReceiveBuilderConfiguration, "fields"> & {
    fields: Array<Omit<ReceiveBuilderField, "value">>;
  };
};

/**
 * Action for creating a receive.
 *
 * Will create a new receive and return the receive id.
 * The config of the receive is written to our object store.
 */
export const action: ActionFunction = async ({ request }) => {
  const receiveId = generateReceiveId();

  // just ping discord without awaiting, should complete quickly
  sendDiscordMessage(`Receive has been created: \`${receiveId}\``);

  const body = (await request.json()) as CreateReceiveBody;

  const receiveConfig: ReceiveConfig = {
    receiveId,
    createdAt: nowIso8601DateTimeString(),
    notificationConfig: body.notificationConfig,
    template: body.template,
  };

  try {
    await saveReceiveConfig(receiveConfig);

    const createReceiveResponse: CreateReceiveResponse = {
      receiveId,
    };

    return new Response(JSON.stringify(createReceiveResponse), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
