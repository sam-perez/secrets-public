import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import { useState } from "react";
import { getSendConfig, getSendState, SendId } from "../lib/sends";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { INITIATE_SEND_VIEW_HEADERS, InitiateSendViewResponse } from "./marketing.api.sends.initiate-send-view";

type RevealerLoaderResponse =
  | {
      viewable: true;
      sendId: SendId;
      requiresPassword: boolean;
    }
  | {
      viewable: false;
    };

export const loader: LoaderFunction = async ({ params }) => {
  const sendId = params.sendId;

  if (!sendId) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    // try to get the related send from the backend, assume it is a send id
    const sendConfig = await getSendConfig(sendId as SendId);

    const sendState = await getSendState(sendConfig.sendId);

    let response: RevealerLoaderResponse;

    if (sendState.readyAt === null) {
      console.log("Send is not ready yet.", { sendState });
      response = { viewable: false };
    } else if (sendConfig.expiresAt !== null && new Date(sendConfig.expiresAt) < new Date()) {
      console.log("Send has expired.", { sendState });
      response = { viewable: false };
    } else if (sendState.dataDeletedAt !== null) {
      console.log("Send has been deleted.", { sendState });
      response = { viewable: false };
    } else if (sendState.views.length >= sendConfig.maxViews) {
      console.log("Send has been viewed too many times.", { sendState });
      response = { viewable: false };
    } else {
      response = {
        viewable: true,
        sendId: sendConfig.sendId,
        requiresPassword: sendConfig.password !== null,
      };
    }

    return json(response);
  } catch (error) {
    console.error("Error getting send data.", { error });
    return json({ viewable: false });
  }
};

export default function RevealerOfSend() {
  const loaderData = useLoaderData<RevealerLoaderResponse>();

  const [password, setPassword] = useState("");
  const [passwordIsVerified, setPasswordIsVerified] = useState(false);
  const [initiateSendViewResponse, setInitiateSendViewResponse] = useState<InitiateSendViewResponse | null>(null);

  const [confirmationCode, setConfirmationCode] = useState("");

  if (loaderData.viewable === false) {
    return (
      <div className="px-4 container max-w-5xl">
        <h3>SEND NOT FOUND</h3>
        <p className="muted mb-4">
          The send you are trying to view is not available. It may never have never existed, expired, been deleted, or
          been viewed too many times.
        </p>
      </div>
    );
  }

  const dialogBackground = (
    <div className="px-4 container max-w-5xl">
      <h3>LOADING REVEALER DATA</h3>
      <p className="muted mb-4">
        Someone has securely shared this data with you via{" "}
        <Link target="_blank" to="https://2secured.link" rel="noreferrer">
          2Secured
        </Link>
        .
      </p>
    </div>
  );

  // if the password is required and hasn't been verified, show the password dialog
  if (loaderData.requiresPassword && passwordIsVerified === false) {
    console.log("Password is required and not verified.");

    return (
      <>
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <div className="space-y-2">
              <h4>Enter Password to View</h4>
              <p>The sender has required a password to view this encrypted data. Please enter it below to continue.</p>
              <Input placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />
              <Button
                disabled={password.length === 0}
                onSubmit={async () => {
                  // initiate the secret send view
                  const initiateSendViewResponseFetch = await fetch("/marketing/api/sends/initiate-send-view", {
                    method: "PUT",
                    headers: {
                      [INITIATE_SEND_VIEW_HEADERS.SEND_ID]: loaderData.sendId,
                      [INITIATE_SEND_VIEW_HEADERS.SEND_PASSWORD]: password,
                    },
                  });

                  if (initiateSendViewResponseFetch.status === 400) {
                    // TODO: show error message?
                    console.error("Error initiating send view.", { status: initiateSendViewResponseFetch.status });

                    // check if the password was incorrect and ask for it again?
                    return;
                  }

                  const initiateSendViewResponse =
                    (await initiateSendViewResponseFetch.json()) as InitiateSendViewResponse;

                  setInitiateSendViewResponse(initiateSendViewResponse);
                  setPasswordIsVerified(true);
                }}
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {dialogBackground}
      </>
    );
  }

  if (initiateSendViewResponse !== null && initiateSendViewResponse.requiresConfirmation) {
    return (
      <>
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <div className="space-y-2">
              <h4>Enter Confirmation Code</h4>
              <p>The sender has an email confirmation. Please enter the code sent to your address.</p>
              <Input placeholder="Enter code" onChange={(e) => setConfirmationCode(e.target.value)} />
              <Button
                disabled={confirmationCode.length === 0}
                onSubmit={async () => {
                  // confirm the secret send view
                }}
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {dialogBackground}
      </>
    );
  }

  // todo
  return <h1>WE ARE AT THE END OF THE LINE FOR NOW</h1>;
}
