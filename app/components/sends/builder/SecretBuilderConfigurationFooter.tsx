import {
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  LinkBreak2Icon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";
import { useCallback, useState } from "react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { SecretSender } from "./SecretSender";
import { useSendBuilderConfiguration } from "./SendBuilderConfigurationContextProvider";
import { EXPIRATION_DATE_TIME_UNIT_OPTIONS, ExpirationDateTimeUnits } from "./types";

/**
 * The secret builder configuration footer.
 *
 * This component is used to display the following configuration options as a footer
 * in the secret builder:
 *
 * - Link expiration settings (includes maximum views and expiration time)
 * - Confirmation email
 * - Password
 *
 * Each of these options are rendered in their own components, which will independently report back any changes
 * to their settings to this component. This component will then proxy those changes to the parent component.
 */
export default function SecretBuilderConfigurationFooter() {
  const { config: sendBuilderConfiguration, updateConfig } = useSendBuilderConfiguration();

  const [showLinkGeneration, setShowLinkGeneration] = useState<boolean>(false);

  const setExpirationConfiguration = useCallback(
    (expirationConfiguration: {
      maxViews?: number | null;
      expirationDate?: {
        totalTimeUnits: number;
        timeUnit: ExpirationDateTimeUnits;
      } | null;
    }) => {
      const updatedConfig = { ...sendBuilderConfiguration };
      if (expirationConfiguration.maxViews !== undefined) {
        updatedConfig.maxViews = expirationConfiguration.maxViews;
      }

      if (expirationConfiguration.expirationDate !== undefined) {
        updatedConfig.expirationDate = expirationConfiguration.expirationDate;
      }

      updateConfig(updatedConfig);
    },
    [sendBuilderConfiguration, updateConfig]
  );

  const setConfirmationEmail = useCallback(
    (email: string | null) => {
      const updatedConfig = { ...sendBuilderConfiguration, confirmationEmail: email };
      updateConfig(updatedConfig);
    },
    [sendBuilderConfiguration, updateConfig]
  );

  const setPassword = useCallback(
    (password: string | null) => {
      const updatedConfig = { ...sendBuilderConfiguration, password };
      updateConfig(updatedConfig);
    },
    [sendBuilderConfiguration, updateConfig]
  );

  const readyToGenerateLink =
    sendBuilderConfiguration.fields.length > 0 &&
    sendBuilderConfiguration.fields.every((field) => {
      // all fields are either a string or a file array, so funny enough they all have a length property.
      return field.value !== null && field.value.length > 0;
    });

  const sharedClasses = "max-w-1/3 sm:max-w-[140px] overflow-hidden";
  return (
    <>
      <div className="border-t bg-slate-50 rounded-b-xl">
        <div className="px-4 py-2 sm:flex flex-wrap justify-between items-center text-sm overflow-hidden">
          {/* Configuration popovers.  */}
          <div className="flex items-center space-x-4">
            <div className={[sharedClasses, "truncate"].join(" ")}>
              {<LinkExpirationConfigurationPopover setExpirationConfiguration={setExpirationConfiguration} />}
            </div>
            <div className={[sharedClasses, "text-ellipsis"].join(" ")}>
              {<ConfirmationEmailConfigurationPopover setConfirmationEmail={setConfirmationEmail} />}
            </div>
            <div className={[sharedClasses, "text-ellipsis"].join(" ")}>
              {<PasswordConfigurationPopover setPassword={setPassword} />}
            </div>
          </div>
          {/* Button to generate link. */}
          <div>
            <Button className="w-full" disabled={!readyToGenerateLink} onClick={() => setShowLinkGeneration(true)}>
              {"Get Encrypted Link"}
            </Button>
          </div>

          {/* Link generation dialog. */}
          {showLinkGeneration === false ? null : <SecretSender sendBuilderConfiguration={sendBuilderConfiguration} />}
        </div>
      </div>
    </>
  );
}

/**
 * The link expiration configuration popover.
 *
 * Manages the date expiration and view count settings. Reports any changes back to the parent.
 */
export function LinkExpirationConfigurationPopover({
  setExpirationConfiguration,
}: {
  setExpirationConfiguration: (expirationConfiguration: {
    maxViews?: number | null;
    expirationDate?: {
      totalTimeUnits: number;
      timeUnit: ExpirationDateTimeUnits;
    } | null;
  }) => void;
}) {
  const { config: sendBuilderConfiguration } = useSendBuilderConfiguration();

  const [views, setViews] = useState<number | null>(sendBuilderConfiguration.maxViews);
  const [expirationNumber, setExpirationNumber] = useState<number | null>(
    sendBuilderConfiguration.expirationDate?.totalTimeUnits || null
  );
  const [expirationUnit, setExpirationUnit] = useState<ExpirationDateTimeUnits | null>(
    sendBuilderConfiguration.expirationDate?.timeUnit || null
  );

  const reportExpirationDate = ({
    totalTimeUnits,
    timeUnit,
  }: {
    totalTimeUnits: number | null;
    timeUnit: ExpirationDateTimeUnits | null;
  }) => {
    if (totalTimeUnits !== null && timeUnit !== null) {
      setExpirationConfiguration({
        expirationDate: {
          timeUnit,
          totalTimeUnits,
        },
      });
    } else {
      setExpirationConfiguration({ expirationDate: null });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="px-2">
          {
            <span className="flex items-center">
              <LinkBreak2Icon className="h-4 w-4 mr-1" />
              {expirationNumber && expirationUnit ? `${expirationNumber}${expirationUnit[0]}` : ""}
              {expirationNumber ? " · " : ""}
              {/* 1 view is the default, so always render that here. */}
              {views !== null ? `${views} view${views === 1 ? "" : "s"}` : "1 view"}
            </span>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Set Expiration</h5>
          <p className="text-sm text-muted-foreground">The link will expire when either is true.</p>
        </div>
        <small>Time</small>
        <div className="flex space-x-2 mt-1 mb-3">
          {(() => {
            // a hack using scoping to determine if the backspace key was pressed.
            let hasBackspaceBeenPressedInExpirationNumberInput = false;

            return (
              <Input
                placeholder="Number"
                type="number"
                value={expirationNumber !== null ? expirationNumber.toString() : ""}
                onChange={(e) => {
                  const value = e.target.value;

                  // if we are going from some value to an empty string, we should clear the expiration date.
                  if (hasBackspaceBeenPressedInExpirationNumberInput && value.length === 0 && views !== null) {
                    setExpirationNumber(null);
                    reportExpirationDate({
                      totalTimeUnits: null,
                      timeUnit: expirationUnit,
                    });
                    return;
                  }

                  const parsedValue = parseInt(value, 10);
                  if (isNaN(parsedValue)) {
                    return;
                  }

                  if (parsedValue < 0) {
                    return;
                  }

                  if (parsedValue === 0) {
                    setExpirationNumber(null);
                    reportExpirationDate({
                      totalTimeUnits: null,
                      timeUnit: expirationUnit,
                    });
                    return;
                  }

                  setExpirationNumber(parsedValue);
                  reportExpirationDate({
                    totalTimeUnits: parsedValue,
                    timeUnit: expirationUnit,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    hasBackspaceBeenPressedInExpirationNumberInput = true;

                    if (expirationNumber !== null && expirationNumber < 10) {
                      e.preventDefault();
                      setExpirationNumber(null);
                      reportExpirationDate({
                        totalTimeUnits: null,
                        timeUnit: expirationUnit,
                      });
                    }
                  }
                }}
              />
            );
          })()}
          <Select
            onValueChange={(value) => {
              setExpirationUnit(value as ExpirationDateTimeUnits);
              reportExpirationDate({
                totalTimeUnits: expirationNumber,
                timeUnit: value as ExpirationDateTimeUnits,
              });
            }}
            value={expirationUnit || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {EXPIRATION_DATE_TIME_UNIT_OPTIONS.map((unit, index) => (
                <SelectItem key={index} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <small>Total View Count</small>
        <div className="flex space-x-2 mt-1"></div>
        {(() => {
          // a hack using scoping to determine if the backspace key was pressed.
          let hasBackspaceBeenPressedInViewInput = false;

          return (
            <Input
              className=""
              type="number"
              placeholder="Enter max views"
              value={views !== null ? views.toString() : ""}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  hasBackspaceBeenPressedInViewInput = true;

                  // if we are going from some value to an empty string, we should clear the views.
                  if (views !== null && views < 10) {
                    e.preventDefault();
                    setViews(null);
                    setExpirationConfiguration({ maxViews: null });
                  }
                }
              }}
              onChange={(e) => {
                const value = e.target.value;

                // if we are going from some value to an empty string, we should clear the expiration date.
                if (hasBackspaceBeenPressedInViewInput && value.length === 0 && views !== null) {
                  setViews(null);
                  setExpirationConfiguration({ maxViews: null });
                  return;
                }

                const parsedValue = parseInt(value, 10);

                if (isNaN(parsedValue)) {
                  return;
                }

                if (parsedValue < 0) {
                  return;
                }

                if (parsedValue === 0) {
                  setViews(null);
                  setExpirationConfiguration({ maxViews: null });
                } else {
                  setViews(parsedValue);
                  setExpirationConfiguration({ maxViews: parsedValue });
                }
              }}
            />
          );
        })()}
        <span className="muted text-xs">Leave blank for only a single view.</span>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Helper function to validate an email address.
 */
function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * The email confirmation configuration popover. Reports any changes back to the parent.
 */
export function ConfirmationEmailConfigurationPopover({
  setConfirmationEmail,
}: {
  setConfirmationEmail: (email: string | null) => void;
}) {
  const [emailInputTextValue, setEmailInputTextValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInputTextValue(event.target.value);

    if (event.target.value === "") {
      setConfirmationEmail(null);
    } else {
      // check if the email is valid
      if (validateEmail(event.target.value)) {
        setConfirmationEmail(event.target.value);
      } else {
        // if the email is not valid, clear the email
        setConfirmationEmail(null);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="px-2">
          {validateEmail(emailInputTextValue) === true ? (
            <span className="flex items-center font-medium text-sm">
              <EnvelopeOpenIcon className="h-4 w-4 mr-1" /> Email Set
            </span>
          ) : (
            <>
              <EnvelopeClosedIcon className="h-4 w-4 mr-1" />
              <span className="text-slate-500 text-xs">Restrict Email</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Restrict Email</h5>
          <p className="text-sm text-muted-foreground">
            The recipient will have to confirm their email address to view.
          </p>
        </div>

        {emailInputTextValue.length > 0 && validateEmail(emailInputTextValue) === false ? (
          <small className="text-red-500">Email not set until email is valid</small>
        ) : emailInputTextValue.length > 0 && validateEmail(emailInputTextValue) === true ? (
          <small className="text-green-500">Email Set</small>
        ) : (
          <small>Enter Email</small>
        )}
        <div className="flex space-x-2 mt-1"></div>
        <Input placeholder="example@test.com" type="email" value={emailInputTextValue} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  );
}

/**
 * The password configuration popover. Reports any changes back to the parent.
 */
export function PasswordConfigurationPopover({ setPassword }: { setPassword: (password: string | null) => void }) {
  const [internalPassword, setInternalPassword] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInternalPassword(event.target.value);

    if (event.target.value === "") {
      setPassword(null);
    } else {
      setPassword(event.target.value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="px-2">
          {internalPassword ? (
            <span className="flex items-center text-sm font-medium">
              <LockClosedIcon className="h-4 w-4 mr-1 flex-none" /> Password Set
            </span>
          ) : (
            <>
              <LockOpen1Icon className="h-4 w-4 mr-1" /> <span className="text-slate-500 text-xs">Add Password</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Add Password</h5>
          <p className="text-sm text-muted-foreground">The recipient will have to enter this password to view.</p>
        </div>

        <small>Create Password</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input placeholder="" type="text" value={internalPassword} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  );
}
