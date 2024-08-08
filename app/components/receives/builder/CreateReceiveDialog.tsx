import { CheckIcon, CopyIcon, EnvelopeClosedIcon, LockClosedIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CreateReceiveBody, CreateReceiveResponse } from "~/routes/marketing.api.receives.create-receive";

import { Dialog, DialogContent, DialogFooter } from "../../ui/dialog";
import { Spinner } from "../../ui/Spinner";
import { ReceiveBuilderConfiguration } from "./types";

/**
 * Helper type to make all fields in a type non-nullable.
 */
type NonNullableFields<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * This dialogue is shown when the user has finished configuring their receive and is ready to send
 * the receive configuration to the server.
 *
 * The server will respond with a link that the user can share with others to collect receive responses.
 */
export function CreateReceiveDialog({
  receiveBuilderConfiguration,
}: {
  receiveBuilderConfiguration: NonNullableFields<ReceiveBuilderConfiguration>;
}) {
  const [progress, setProgress] = useState<"mounted" | "creating-receive" | "done" | "error">("mounted");

  const [isCopied, setIsCopied] = useState(false);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const [receiveId, setReceivedId] = useState<string | null>(null);

  useEffect(() => {
    const createReceive = async () => {
      try {
        setProgress("creating-receive");

        const createReceiveBody: CreateReceiveBody = {
          title: receiveBuilderConfiguration.title,
          fields: receiveBuilderConfiguration.fields.map((field) => {
            return {
              title: field.title,
              type: field.type,
            };
          }),
          notificationConfig: receiveBuilderConfiguration.notificationConfig,
        };

        // create the receive
        const createReceiveResponseFetch = await fetch("/marketing/api/receives/create-receive", {
          method: "POST",
          body: JSON.stringify(createReceiveBody),
        });

        if (createReceiveResponseFetch.ok === false) {
          setProgress("error");
          console.error("Failed to create receive", {
            status: createReceiveResponseFetch.status,
            statusText: createReceiveResponseFetch.statusText,
          });

          return;
        } else {
          const createReceiveResponse = (await createReceiveResponseFetch.json()) as CreateReceiveResponse;
          setProgress("done");
          setReceivedId(createReceiveResponse.receiveId);
        }
      } catch (error) {
        console.error(error);
        setProgress("error");
      }
    };

    createReceive();
    // we only want to run this exactly once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // copy function to copy the secret link
  const getRevealerLink = () => {
    if (receiveId === null) {
      return "";
    }

    // extract the host from the current URL
    const host = window.location.host;
    // also extract the https or http from the current URL
    const protocol = window.location.protocol;

    return `${protocol}//${host}/receive/${receiveId}`;
  };

  const handleCopy = () => {
    if (receiveId === null) {
      return;
    }

    const shareLink = getRevealerLink();
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
  };

  if (showCloseConfirmation) {
    return (
      <>
        <Dialog open={true}>
          <DialogContent noClose={true} className="sm:max-w-xl">
            <h4>Confirm</h4>
            <p className="">{"Please make sure you've stored this link before you close this dialog."}</p>
            <Button type="button" variant="default" onClick={() => window.location.reload()}>
              {"Yes, I've saved the link"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCloseConfirmation(false)}>
              Go back
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Dialog open={true}>
        <DialogContent noClose={true} className="sm:max-w-xl">
          {progress === "mounted" || progress === "creating-receive" ? (
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                <Spinner />
                {["creating-receive"].includes(progress) ? <h4>Submitting receive configuration...</h4> : null}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="flex items-center">
                  <LockClosedIcon className="w-4 h-4 mr-1" />
                  Share this link to your end-to-end encrypted form!
                </h4>
                <p className="text-xs muted py-0">
                  Anyone with this link will be able to send data to you via end-to-end encryption.
                </p>
              </div>
              <div>
                <Label>Encrypted Form Link</Label>
                <div className="flex items-start space-x-2 mt-2">
                  <Input className="bg-slate-50 font-medium" type="text" value={getRevealerLink()} readOnly={true} />
                  <Button variant={"outline"} onClick={handleCopy}>
                    {isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                  </Button>
                  <Link to={getRevealerLink()} target="_blank" rel="noreferrer">
                    <Button type="button" variant="outline">
                      <OpenInNewWindowIcon />
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center mt-2 ">
                  <EnvelopeClosedIcon className="w-4 h-4 text-slate-500 mr-3" />
                  <div className="break-words">
                    <small>Notifications</small>
                    <p className="text-xs">You will be notified when someone fills out your secured form.</p>
                    {/** TODO: handle other notification types */}
                    <p className="text-xs">A request will be sent to the webhook you configured at:</p>
                    <p className="text-xs break-all">{receiveBuilderConfiguration.notificationConfig.url}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between w-full">
                <Button type="button" variant="outline" onClick={handleCopy}>
                  Copy Link
                </Button>
                <div className="flex-grow"></div>
                <Button type="button" onClick={() => setShowCloseConfirmation(true)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
