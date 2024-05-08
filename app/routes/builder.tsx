import { EditorState } from "prosemirror-state";
import { schema } from "prosemirror-schema-basic";
import { ProseMirror } from "@nytimes/react-prosemirror";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ClockIcon, EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";

export default function Builder() {
  // It's important that mount is stored as state,
  // rather than a ref, so that the ProseMirror component
  // is re-rendered when it's set
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [state, setState] = useState(EditorState.create({ schema }));

  return (
    <>
      <div className="max-w-2xl mx-auto mt-10">
        <div className="border rounded">
          <div className="px-2">
            {/* headline */}
            <ProseMirror
              mount={mount}
              state={state}
              dispatchTransaction={(tr) => {
                setState((s) => s.apply(tr));
              }}
            >
              <div ref={setMount} />
            </ProseMirror>

            {/* tags */}
            <Popover>
              <PopoverTrigger>
                <Badge variant="outline">
                  <span className="text-xs muted">Add Tag</span>
                </Badge>
              </PopoverTrigger>
              <PopoverContent>
                <Input placeholder="Add Tag" />
              </PopoverContent>
            </Popover>

            <p className="muted my-4">Start typing or add fields, and set rules encrypted data.</p>

            {/* builder */}
            <div className="my-4">{AddFieldDropdown()}</div>
          </div>

          {/* footer */}
          <div className="border-t">
            <div className="p-2 flex justify-between items-center">
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
          <ClockIcon className="h-4 w-4 mr-1" /> Link Expiration
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
          <EnvelopeClosedIcon className="h-4 w-4 mr-1" /> Restrict Email
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
          <LockClosedIcon className="h-4 w-4 mr-1" /> Add Password
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

export function AddFieldDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">+ Add Field</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Add Field</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Text Field
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            File Upload
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Password
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Address
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Banking</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Routing Number</DropdownMenuItem>
                <DropdownMenuItem>Bank Account Number</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
