import {
  ClockIcon,
  CounterClockwiseClockIcon,
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  LinkBreak1Icon,
  LinkBreak2Icon,
  LinkNone1Icon,
  LinkNone2Icon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useState } from "react";

export default function BuilderFooter() {
  return (
    <>
      <div className="border-t bg-slate-50 rounded-b-xl">
        <div className="px-4 py-2 flex justify-between items-center grow-0	text-sm">
          {/* actions  */}
          <div className="flex items-center space-x-4">
            <div className="max-w-[140px] overflow-hidden truncate ">{LinkExpirationPopover()}</div>
            <div className="max-w-[140px] text-ellipsis overflow-hidden">{RestrictEmailPopover()}</div>
            <div className="max-w-[140px] text-ellipsis overflow-hidden">{AddPasswordPopover()}</div>
          </div>
          {/* button */}
          <div>
            <Button>Generate Encrypted Link</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function LinkExpirationPopover() {
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
      <PopoverTrigger>
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
              <span className="hidden sm:block">Link Expiration</span>
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

export function RestrictEmailPopover() {
  const [email, setEmail] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="link" className="px-0">
          {email ? (
            <span className="flex items-center font-medium">
              <EnvelopeOpenIcon className="h-4 w-4 mr-1" /> {email}
            </span>
          ) : (
            <>
              <EnvelopeClosedIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">Restrict Email</span>
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

export function AddPasswordPopover() {
  const [password, setPassword] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="link" className="px-0">
          {password ? (
            <span className="flex items-center text-sm font-medium">
              <LockClosedIcon className="h-4 w-4 mr-1 flex-none" /> Password Set
            </span>
          ) : (
            <>
              <LockOpen1Icon className="h-4 w-4 mr-1" /> <span className="hidden sm:block">Add Password</span>
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
