import { ActionFunction } from "@remix-run/node";
import { SendConfig, SendId, SendState, generateSendId, saveSendConfig, saveSendState } from "../lib/sends";
import { getRandomBase62String } from "../lib/crypto-utils";
import { nowIso8601DateTimeString, getIso8601DateTimeString } from "../lib/time";
import { SendBuilderConfiguration, ExpirationDateTimeUnits } from "~/components/sends/builder/types";

/** The response from the initiate send endpoint. */
export type InitiateSendResponse = {
  sendId: SendId;
  encryptedPartsPassword: string;
};

/**
 * The body of the initiate send endpoint.
 *
 * For now, reuse the send builder configuration. We do some massaging of the data in the route to make it
 * compatible with the send state and send config.
 */
export type InitiateSendBody = SendBuilderConfiguration;

/**
 * Action for initiating a send.
 *
 * Will create a new send and return the send id and the password to use for encrypting the parts.
 * The config and the state of the send are written to our object store.
 */
export const action: ActionFunction = async ({ request }) => {
  const sendId = generateSendId();

  const body = (await request.json()) as InitiateSendBody;

  const now = new Date();
  // Default to a 7 day expiration
  const { totalTimeUnits, timeUnit } = body.expirationDate || { totalTimeUnits: 7, timeUnit: "days" };
  const timeUnitMultiplier: Record<ExpirationDateTimeUnits, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };
  const expiresAt = new Date(now.getTime() + totalTimeUnits * timeUnitMultiplier[timeUnit]);

  // let's make a fake request for now
  const sendConfig: SendConfig = {
    sendId,
    confirmationEmail: body.confirmationEmail,
    // Default to a one-time exploding link
    maxViews: body.maxViews || 1,
    expiresAt: getIso8601DateTimeString(expiresAt),
    password: body.password,
    template: {
      title: body.title,
      // TODO: do we want to display a description at all in the revealer?
      // Do we want the sender to be able to add in a description that gets displayed?
      description: "",
      fields: body.fields,
    },
  };

  // with an initial send state
  const initialSendState: SendState = {
    sendId,
    createdAt: nowIso8601DateTimeString(),
    creationRequestMetadata: { headers: Object.fromEntries(request.headers.entries()) },
    // super secure password
    encryptedPartsPassword: getRandomBase62String(32),
    readyAt: null,
    totalEncryptedParts: null,
    dataDeletedAt: null,
    dataDeletedReason: null,
    views: [],
  };

  try {
    await Promise.all([saveSendConfig(sendConfig), saveSendState(initialSendState)]);

    const initiateSendResponse: InitiateSendResponse = {
      sendId,
      encryptedPartsPassword: initialSendState.encryptedPartsPassword,
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
