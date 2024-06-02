import { ActionFunction } from "@remix-run/node";
import { generateSendId, SendConfig, SendState, SendId, saveSendConfig, saveSendState } from "../lib/sends";
import { getRandomBase62String } from "../lib/crypto-utils";
import { nowIso8601DateTimeString } from "../lib/time";

/** The response from the initiate send endpoint. */
export type InitiateSendResponse = {
  sendId: SendId;
  encryptedPartsPassword: string;
};

/**
 * Action for initiating a send.
 *
 * Will create a new send and return the send id and the password to use for encrypting the parts.
 * The config and the state of the send are written to our object store.
 */
export const action: ActionFunction = async ({ request }) => {
  const sendId = generateSendId();

  // let's make a fake request for now
  const fakeSendConfig: SendConfig = {
    sendId,
    //confirmationEmail: "taylorballenger@gmail.com",'
    confirmationEmail: null,
    maxViews: 1000,
    expiresAt: null,
    password: "asdf",
    template: {
      title: "Test Template",
      description: "This is a test template",
      fields: [],
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
    await Promise.all([saveSendConfig(fakeSendConfig), saveSendState(initialSendState)]);

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
