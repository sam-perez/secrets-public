import {
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  FileTextIcon,
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
import { EXPIRATION_DATE_TIME_UNIT_OPTIONS, ExpirationDateTimeUnits, MAXIMUM_SEND_SIZE_IN_MEGA_BYTES } from "./types";

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

  // track the email input text value so that we can show a warning if the email is invalid in the popover.
  const [emailInputTextValue, setEmailInputTextValue] = useState("");

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

  const numberOfFields = sendBuilderConfiguration.fields.length;
  const numberOfFieldsWithValues = sendBuilderConfiguration.fields.filter(
    // all fields are either a string or a file array, so funny enough they all have a length property.
    (field) => field.value !== null && field.value.length > 0
  ).length;

  const totalBytesOfFields = sendBuilderConfiguration.fields.reduce((acc, field) => {
    if (field.value === null) {
      return acc;
    }

    if (field.type === "multi-line-text" || field.type === "single-line-text") {
      return acc + new Blob([field.value]).size;
    } else {
      return acc + field.value.reduce((acc, file) => acc + file.size, 0);
    }
  }, 0);

  const readyToGenerateLink =
    numberOfFields > 0 &&
    numberOfFields === numberOfFieldsWithValues &&
    totalBytesOfFields < MAXIMUM_SEND_SIZE_IN_MEGA_BYTES * 1024 * 1024;

  let linkText =
    sendBuilderConfiguration.fields.length === 0
      ? "Please add a field"
      : numberOfFields !== numberOfFieldsWithValues
      ? `Complete ${numberOfFieldsWithValues} of ${numberOfFields} fields`
      : "Get Encrypted Link";

  if (totalBytesOfFields >= MAXIMUM_SEND_SIZE_IN_MEGA_BYTES * 1024 * 1024) {
    linkText = `Limit of ${MAXIMUM_SEND_SIZE_IN_MEGA_BYTES}MB exceeded`;
  }

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
              {
                <ConfirmationEmailConfigurationPopover
                  setConfirmationEmail={setConfirmationEmail}
                  onEmailInputValueChange={(updatedEmailInputTextValue) =>
                    setEmailInputTextValue(updatedEmailInputTextValue)
                  }
                />
              }
            </div>
            <div className={[sharedClasses, "text-ellipsis"].join(" ")}>
              {<PasswordConfigurationPopover setPassword={setPassword} />}
            </div>
          </div>
          {/* Button to generate link. */}
          <div>
            <ConfirmPopover emailIsValid={validateEmail(emailInputTextValue)}>
              <Button className="w-full" disabled={!readyToGenerateLink} onClick={() => setShowLinkGeneration(true)}>
                {linkText}
              </Button>
            </ConfirmPopover>
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
  onEmailInputValueChange,
}: {
  setConfirmationEmail: (email: string | null) => void;
  onEmailInputValueChange: (updatedEmailInputTextValue: string) => void;
}) {
  const [emailInputTextValue, setEmailInputTextValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInputTextValue(event.target.value);
    onEmailInputValueChange(event.target.value);

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

  const isInEmailErrorState = emailInputTextValue.length > 0 && validateEmail(emailInputTextValue) === false;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* TODO: Show something obvious when the email is in error state! */}
        <Button variant="ghost" className="px-2">
          {validateEmail(emailInputTextValue) === true ? (
            <span className="flex items-center font-medium text-sm">
              <EnvelopeOpenIcon className="h-4 w-4 mr-1" /> Email Set
            </span>
          ) : emailInputTextValue.length > 0 ? (
            <>
              <EnvelopeClosedIcon className="h-4 w-4 mr-1 text-red-700" />
              <span className="text-red-500 text-xs">Invalid Email</span>
            </>
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

        <small>Enter Email</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input
          className={isInEmailErrorState ? "border-red-500 text-red-500 focus-visible:ring-red-500" : ""}
          placeholder="example@test.com"
          type="email"
          value={emailInputTextValue}
          onChange={handleChange}
        />
        {
          // if the email is not valid, show an error message.
          isInEmailErrorState ? (
            <div className="mt-1">
              <span className="text-xs text-red-500">Enter a valid email address</span>
            </div>
          ) : null
        }
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

// this function handles the confirmation popover when hovering over the button
export function ConfirmPopover({ children, emailIsValid }: { children: React.ReactNode; emailIsValid: boolean }) {
  const { config: sendBuilderConfiguration } = useSendBuilderConfiguration();
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  const maxViews = sendBuilderConfiguration.maxViews || 1;

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
        <span className="font-medium">{sendBuilderConfiguration.title}</span>
        <p className="text-slate-500">A secure link will be generated with:</p>
        <ul className="text-xs space-y-2">
          <li className="flex items-center">
            <FileTextIcon className="flex-none h-3 w-3 mr-2" />
            {sendBuilderConfiguration.fields.length} encrypted field
            {sendBuilderConfiguration.fields.length === 1 ? "" : "s"}
          </li>
          {(sendBuilderConfiguration.expirationDate || maxViews) && (
            <li className="flex items-center">
              <LinkBreak2Icon className="flex-none h-3 w-3 mr-2" />
              <span>
                Expires after{" "}
                {sendBuilderConfiguration.expirationDate !== null && (
                  <b>
                    {sendBuilderConfiguration.expirationDate.totalTimeUnits}{" "}
                    {sendBuilderConfiguration.expirationDate.totalTimeUnits === 1
                      ? sendBuilderConfiguration.expirationDate.timeUnit.slice(0, -1)
                      : sendBuilderConfiguration.expirationDate.timeUnit}
                  </b>
                )}{" "}
                {sendBuilderConfiguration.expirationDate !== null ? "or " : ""}
                <b>
                  {maxViews} view{maxViews === 1 ? "" : "s"}
                </b>
              </span>
            </li>
          )}
          {sendBuilderConfiguration.confirmationEmail !== null ? (
            <li className="flex items-center">
              <EnvelopeClosedIcon className="flex-none h-3 w-3 mr-2" />
              <span>
                The recipient will need to enter a code emailed to
                <b> {sendBuilderConfiguration.confirmationEmail}</b> to view
              </span>
            </li>
          ) : (
            !emailIsValid && (
              <li className="flex items-center">
                <EnvelopeClosedIcon className="flex-none h-3 w-3 mr-2" />
                <span>
                  <b>WARNING:</b> Email is invalid. No email confirmation will be required.
                </span>
              </li>
            )
          )}
          {sendBuilderConfiguration.password && (
            <li className="flex items-center">
              <LockClosedIcon className="flex-none h-3 w-3 mr-2" />
              <span>
                The recipient must enter the password <b>{sendBuilderConfiguration.password}</b> to view
              </span>
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
