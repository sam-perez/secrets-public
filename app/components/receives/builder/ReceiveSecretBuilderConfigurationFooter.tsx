import { Cross2Icon, FileTextIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { useState } from "react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { CreateReceiveDialog } from "./CreateReceiveDialog";
import { ReceiveBuilderConfiguration } from "./types";

function validateHttpsWebhookUrl(url: string) {
  try {
    const newUrl = new URL(url);
    const usesHttpsProtocol = newUrl.protocol === "https:";
    const isZapierWebhook = newUrl.hostname === "hooks.zapier.com";
    const pathRegex = /^\/hooks\/catch\/\w+\/\w+\/?$/;
    const hasValidPath = pathRegex.test(newUrl.pathname);

    if (!usesHttpsProtocol) {
      return { isValid: false, error: "Must use https." } as const;
    } else if (!isZapierWebhook) {
      return { isValid: false, error: "Must be a Zapier webhook." } as const;
    } else if (!hasValidPath) {
      return { isValid: false, error: "Invalid Zapier webhook path." } as const;
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
    return { ready: false as const, notificationConfig: null };
  }

  let isReady = false;
  if (notificationConfig.type === "webhook") {
    isReady = notificationConfig.url.length > 0 && validateHttpsWebhookUrl(notificationConfig.url).isValid;
  }

  if (!isReady) {
    return { ready: false as const, notificationConfig: null };
  } else {
    return { ready: true as const, notificationConfig };
  }
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

  const isNotificationConfigReadyResult = isNotificationConfigReady(notificationConfig);

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
              <Button
                className="w-full"
                disabled={!(isNotificationConfigReadyResult.ready && receiveBuilderConfiguration.fields.length > 0)}
                onClick={() => setShowLinkGeneration(true)}
              >
                {linkText}
              </Button>
            </ConfirmPopover>
          </div>
        </div>

        {/* Link generation dialog. */}
        {isNotificationConfigReadyResult.ready === false || showLinkGeneration === false ? null : (
          <CreateReceiveDialog
            receiveBuilderConfiguration={{
              ...receiveBuilderConfiguration,
              notificationConfig: isNotificationConfigReadyResult.notificationConfig,
            }}
          />
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
              <LightningBoltIcon className="h-4 w-4 mr-1" />
              <span className="text-slate-500 text-xs">Configure Notifications</span>
            </>
          ) : isInWebhookErrorState ? (
            <>
              <Cross2Icon className="h-4 w-4 mr-1 text-red-700" />
              <span className="text-red-500 text-xs">Invalid Webhook</span>
            </>
          ) : (
            <span className="flex items-center font-medium text-sm">
              <LightningBoltIcon className="h-4 w-4 mr-1" /> Webhook Set
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-1">
          <h5 className="font-medium leading-none">Configure Zapier Webhook</h5>
          <p className="text-xs text-muted-foreground pb-0">
            You will receive a Zapier Catch Hook event when someone completes this form.
          </p>
          <p className="text-xs link text-blue-500">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks"
            >
              How to configure catch webhooks on Zapier.
            </a>
          </p>
        </div>

        <small>Enter Zapier Catch Webhook URL</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input
          className={isInWebhookErrorState ? "border-red-500 text-red-500 focus-visible:ring-red-500" : ""}
          placeholder="https://hooks.zapier.com/hooks/catch/12345678/abcdefg/"
          type="url"
          value={webhookUrl}
          onChange={handleChange}
        />
        {
          // if the webhook is not valid, show an error message.
          isInWebhookErrorState ? (
            <div className="mt-1">
              <p className="text-xs text-red-500 pt-1">{validateHttpsWebhookResult.error}</p>
            </div>
          ) : null
        }
        <p className="text-xs pt-2">Want more webhooks supported?</p>
        <Link className="text-sm text-blue-500" to={"https://tally.so/r/w7D9oz"} target="_blank" rel="noreferrer">
          Let us know!
        </Link>
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
              <LightningBoltIcon className="flex-none h-3 w-3 mr-2" />
              <span className="break-all">
                You will be notified of responses at <b> {receiveBuilderConfiguration.notificationConfig?.url}</b>.
              </span>
            </li>
          ) : (
            <li className="flex items-center">
              <Cross2Icon className="flex-none h-3 w-3 mr-2" />
              <span>You must configure a notification webhook.</span>
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
