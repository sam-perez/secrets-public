import { EnvelopeClosedIcon, EnvelopeOpenIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Dialog, DialogContent } from "~/components/ui/dialog";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { ReceiveBuilderConfiguration } from "./types";

function validateHttpsWebhookUrl(url: string) {
  try {
    const newUrl = new URL(url);
    const usesHttpsProtocol = newUrl.protocol === "https:";

    if (!usesHttpsProtocol) {
      return { isValid: false, error: "Must use https." } as const;
    } else {
      return { isValid: true } as const;
    }
  } catch (err) {
    return { isValid: false, error: "Invalid URL." } as const;
  }
}

// Check if the notification configuration is ready
const isNotificationConfigReady = (notificationConfig: ReceiveBuilderConfiguration["notificationConfig"]) => {
  if (notificationConfig === null) {
    return false;
  }

  if (notificationConfig.type === "webhook") {
    return notificationConfig.url.length > 0 && validateHttpsWebhookUrl(notificationConfig.url).isValid;
  }

  return false;
};

/**
 * The secret builder configuration footer for receives.
 *
 * In order to create a receive, the user must configure the webhook and the fields that they want to receive.
 * This is where users configure the webhook.
 *
 * In the future, we will allow users to select Google email integration here.
 */
export function SecretBuilderConfigurationFooter({
  receiveBuilderConfiguration,
  updateNotificationConfig,
}: {
  receiveBuilderConfiguration: ReceiveBuilderConfiguration;
  updateNotificationConfig: (notificationConfig: ReceiveBuilderConfiguration["notificationConfig"] | null) => void;
}) {
  const { notificationConfig } = receiveBuilderConfiguration;

  const readyToGenerateLink = notificationConfig !== null && isNotificationConfigReady(notificationConfig);

  const linkText =
    receiveBuilderConfiguration.fields.length === 0
      ? "Please add a field"
      : notificationConfig === null
      ? "Please configure notifications"
      : "Generate Receive Link";

  const [showLinkGeneration, setShowLinkGeneration] = useState(false);

  return (
    <>
      <div className="border-t bg-slate-50 rounded-b-xl">
        <div className="px-4 py-2 sm:flex flex-wrap justify-between items-center text-sm overflow-hidden">
          {/* Configuration popovers.  */}
          <div className="flex items-center space-x-4">
            <div className="text-ellipsis overflow-hidden">
              {
                <NotificationConfigurationPopover
                  setNotificationConfig={(notificationConfig) => {
                    updateNotificationConfig(notificationConfig);
                  }}
                />
              }
            </div>
          </div>
          {/* Button to generate link. */}
          <div>
            <ConfirmPopover receiveBuilderConfiguration={receiveBuilderConfiguration}>
              <Button className="w-full" disabled={!readyToGenerateLink} onClick={() => setShowLinkGeneration(true)}>
                {linkText}
              </Button>
            </ConfirmPopover>
          </div>
        </div>

        {/* Link generation dialog. */}
        {showLinkGeneration === false ? null : (
          <Dialog open={true}>
            <DialogContent noClose={true}>TODO: Implement the link generation dialog.</DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}

/**
 * The notification configuration popover for receives.
 *
 * TODO: make this handle more than just webhooks urls.
 */
function NotificationConfigurationPopover({
  setNotificationConfig,
}: {
  setNotificationConfig: (notificationConfig: ReceiveBuilderConfiguration["notificationConfig"] | null) => void;
}) {
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookUrl(event.target.value);

    if (event.target.value === "") {
      setNotificationConfig(null);
    } else {
      // check if the url is valid
      if (validateHttpsWebhookUrl(event.target.value).isValid) {
        setNotificationConfig({
          type: "webhook",
          url: event.target.value,
        });
      } else {
        // if the url is not valid, set the notification config to null
        setNotificationConfig(null);
      }
    }
  };

  const validateHttpsWebhookResult = validateHttpsWebhookUrl(webhookUrl);
  const isInWebhookErrorState = webhookUrl.length > 0 && !validateHttpsWebhookResult.isValid;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* TODO: Show something obvious when the webhook is in error state! */}
        <Button variant="ghost" className="px-2">
          {webhookUrl.length === 0 ? (
            <>
              <EnvelopeClosedIcon className="h-4 w-4 mr-1" />
              <span className="text-slate-500 text-xs">Configure Notifications</span>
            </>
          ) : isInWebhookErrorState ? (
            <>
              <EnvelopeClosedIcon className="h-4 w-4 mr-1 text-red-700" />
              <span className="text-red-500 text-xs">Invalid Webhook</span>
            </>
          ) : (
            <span className="flex items-center font-medium text-sm">
              <EnvelopeOpenIcon className="h-4 w-4 mr-1" /> Webhook Set
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Configure Webhook</h5>
          <p className="text-sm text-muted-foreground">
            You will receive a notification when someone responds to your receive by filling out the form.
          </p>
        </div>

        <small>Enter Webhook</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input
          className={isInWebhookErrorState ? "border-red-500 text-red-500 focus-visible:ring-red-500" : ""}
          placeholder="https://example.com/webhooks/123"
          type="url"
          value={webhookUrl}
          onChange={handleChange}
        />
        {
          // if the webhook is not valid, show an error message.
          isInWebhookErrorState ? (
            <div className="mt-1">
              <span className="text-xs text-red-500">{validateHttpsWebhookResult.error}</span>
            </div>
          ) : null
        }
      </PopoverContent>
    </Popover>
  );
}

// this function handles the confirmation popover when hovering over the button
export function ConfirmPopover({
  children,
  receiveBuilderConfiguration,
}: {
  children: React.ReactNode;
  receiveBuilderConfiguration: ReceiveBuilderConfiguration;
}) {
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const notificationConfigIsReady = isNotificationConfigReady(receiveBuilderConfiguration.notificationConfig);

  return (
    <Popover open={open}>
      <PopoverTrigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={10}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <span className="font-medium">Confirm {receiveBuilderConfiguration.title}</span>
        <p className="text-slate-500">A secure link will be generated with:</p>
        <ul className="text-xs space-y-2">
          <li className="flex items-center">
            <FileTextIcon className="flex-none h-3 w-3 mr-2" />
            {receiveBuilderConfiguration.fields.length} encrypted field
            {receiveBuilderConfiguration.fields.length === 1 ? "" : "s"}
          </li>
          {notificationConfigIsReady ? (
            <li className="flex items-center">
              <EnvelopeClosedIcon className="flex-none h-3 w-3 mr-2" />
              <span>
                You will be notified of responses at <b> {receiveBuilderConfiguration.notificationConfig?.url}</b>.
              </span>
            </li>
          ) : (
            <li className="flex items-center">
              <EnvelopeClosedIcon className="flex-none h-3 w-3 mr-2" />
              <span>You must configure a notification webhook.</span>
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
