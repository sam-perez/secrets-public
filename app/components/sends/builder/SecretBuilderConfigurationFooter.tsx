import {
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  LinkBreak2Icon,
  LinkNone2Icon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { useState } from "react";

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
  const sharedClasses = "max-w-1/3 sm:max-w-[140px] overflow-hidden";
  return (
    <>
      <div className="border-t bg-slate-50 rounded-b-xl">
        <div className="px-4 py-2 sm:flex flex-wrap justify-between items-center text-sm overflow-hidden">
          {/* actions  */}
          <div className="flex items-center space-x-4">
            <div className={[sharedClasses, "truncate"].join(" ")}>{LinkExpirationConfigurationPopover()}</div>
            <div className={[sharedClasses, "text-ellipsis"].join(" ")}>{ConfirmationEmailConfigurationPopover()}</div>
            <div className={[sharedClasses, "text-ellipsis"].join(" ")}>{PasswordConfigurationPopover()}</div>
          </div>
          {/* button */}
          <div>
            <Button className="w-full">Generate Encrypted Link</Button>
          </div>
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
export function LinkExpirationConfigurationPopover() {
  const [views, setViews] = useState<number | undefined>(undefined);
  const [expirationNumber, setExpirationNumber] = useState<number | undefined>(undefined);
  const [expirationUnit, setExpirationUnit] = useState<string>("");

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setViews(value === "" ? undefined : parseInt(value, 10));
  };

  const handleExpirationNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setExpirationNumber(value === "" ? undefined : parseInt(value, 10));
  };

  const handleExpirationUnitChange = (value: string) => {
    setExpirationUnit(value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="px-0">
          {(expirationNumber && expirationUnit) || views ? (
            <span className="flex items-center">
              <LinkBreak2Icon className="h-4 w-4 mr-1" />
              {expirationNumber && expirationUnit ? `${expirationNumber}${expirationUnit}` : ""}
              {expirationNumber && views ? " ·" : ""}
              {views !== undefined ? ` ${views} views` : ""}
            </span>
          ) : (
            <>
              <LinkNone2Icon className="h-4 w-4 mr-1" />
              <span className="hidden sm:block text-slate-500 text-xs">Link Expiration</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Set Expiration</h5>
          <p className="text-sm text-muted-foreground">The link will expire when either is true.</p>
        </div>
        <small>Time</small>
        <div className="flex space-x-2 mt-1 mb-3">
          <Input
            placeholder="Number"
            type="number"
            value={expirationNumber !== undefined ? expirationNumber.toString() : ""}
            onChange={handleExpirationNumberChange}
          />
          <Select onValueChange={handleExpirationUnitChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="min">Minutes</SelectItem>
              <SelectItem value="hr">Hours</SelectItem>
              <SelectItem value="d">Days</SelectItem>
              <SelectItem value="w">Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <small>Total View Count</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input
          className=""
          type="number"
          placeholder="Enter max views"
          value={views !== undefined ? views.toString() : ""}
          onChange={handleViewChange}
        />
        <span className="muted text-xs">Leave blank for unlimited views</span>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The email confirmation configuration popover. Reports any changes back to the parent.
 */
export function ConfirmationEmailConfigurationPopover() {
  const [email, setEmail] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="px-0">
          {email ? (
            <span className="flex items-center font-medium text-sm">
              <EnvelopeOpenIcon className="h-4 w-4 mr-1" /> {email}
            </span>
          ) : (
            <>
              <EnvelopeClosedIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:block text-slate-500 text-xs">Restrict Email</span>
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
        <Input placeholder="example@test.com" type="email" value={email} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  );
}

/**
 * The password configuration popover. Reports any changes back to the parent.
 */
export function PasswordConfigurationPopover() {
  const [password, setPassword] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="px-0">
          {password ? (
            <span className="flex items-center text-sm font-medium">
              <LockClosedIcon className="h-4 w-4 mr-1 flex-none" /> Password Set
            </span>
          ) : (
            <>
              <LockOpen1Icon className="h-4 w-4 mr-1" />{" "}
              <span className="hidden sm:block text-slate-500 text-xs">Add Password</span>
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
        <Input placeholder="" type="text" value={password} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  );
}
