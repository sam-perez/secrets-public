import { ClockIcon, EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

export default function BuilderFooter() {
  return (
    <>
      <div className="border-t">
        <div className="px-4 py-2 flex justify-between items-center">
          {/* actions  */}
          <div className="flex text-sm space-x-4">
            {LinkExpirationPopover()}
            {RestrictEmailPopover()}
            {AddPasswordPopover()}
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
  return (
    <Popover>
      <PopoverTrigger>
        <small className="flex items-center muted hover:text-slate-400">
          <ClockIcon className="h-4 w-4 mr-1" /> <span className="hidden sm:block">Link Expiration</span>
        </small>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Set Expiration</h5>
          <p className="text-sm text-muted-foreground">The link will expire when either is true.</p>
        </div>
        <small>Time</small>
        <div className="flex space-x-2 mt-1 mb-3">
          <Input placeholder="Number" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <small>Total View Count</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input />
        <span className="muted text-xs">Leave blank for unlimited views</span>
      </PopoverContent>
    </Popover>
  );
}

export function RestrictEmailPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <small className="flex items-center muted hover:text-slate-400">
          <EnvelopeClosedIcon className="h-4 w-4 mr-1" /> <span className="hidden sm:block">Restrict Email</span>
        </small>
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
        <Input placeholder="example@test.com" type="email" />
      </PopoverContent>
    </Popover>
  );
}

export function AddPasswordPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <small className="flex items-center muted hover:text-slate-400">
          <LockClosedIcon className="h-4 w-4 mr-1" /> <span className="hidden sm:block">Add Password</span>
        </small>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1 mb-2">
          <h5 className="font-medium leading-none">Add Password</h5>
          <p className="text-sm text-muted-foreground">The recipient will have to enter this password to view.</p>
        </div>

        <small>Create Password</small>
        <div className="flex space-x-2 mt-1"></div>
        <Input placeholder="" type="text" />
      </PopoverContent>
    </Popover>
  );
}
