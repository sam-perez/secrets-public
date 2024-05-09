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
import { ClockIcon, DotsVerticalIcon, EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

const form_definitions = [
  {
    id: 1,
    field_definition: [
      {
        type: "text",
        display_label: "API Key",
        text_value: "",
      },
      {
        type: "file",
        display_label: "Upload",
        file_value: "",
      },
      {
        type: "password",
        display_label: "Password",
        password_value: "",
      },
      {
        type: "phone",
        display_label: "Phone Number",
        phone_country: "",
        phone_number: "",
      },
      {
        type: "address",
        display_label: "Address",
        address1_value: "",
        address2_value: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
      },
      {
        type: "routing_number",
        display_label: "Routing Number",
        routing_number_value: "",
        valid: false,
      },
      {
        type: "bank_account_number",
        display_label: "Bank Account Number",
        routing_number_value: "",
        valid: true,
      },
      {
        type: "text",
        display_label: "API Secret",
        text_value: "",
      },
    ],
  },
];

export default function Builder() {
  const form_definition = form_definitions[0];
  return (
    <>
      <div className="max-w-2xl mx-auto mt-10">
        <div className="border rounded-xl shadow-xl">
          {/* wrapper */}
          <div className="px-2 py-2">
            {/* header */}
            <div className="px-2 pb-2">
              <div className="mb-2 flex items-center space-between">
                <Input placeholder="Untitled Secure Send" autoComplete="off" />
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <DotsVerticalIcon className="h-4 w-4 flex-none ml-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Save as template</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

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
            </div>

            {/* pass form definition, fix height it and scroll */}
            <div className="h-64 overflow-y-auto px-2">
              {/* empty state; if no fields */}
              <p className="muted my-4 hidden">Add fields to your encrypted link by clicking the Add Field button</p>
              {/* end empty state */}
              <div className="space-y-3">
                {form_definition.field_definition.map((field, index) => (
                  <div key={index}>
                    {/* text */}
                    {field.type == "text" && (
                      <div>
                        <small>{field.display_label}</small>
                        <Textarea autoComplete="off" />
                      </div>
                    )}
                    {/* file upload */}
                    {field.type == "file" && (
                      <div>
                        <small>{field.display_label}</small>
                        <Input type="file" />
                      </div>
                    )}
                    {/* password */}
                    {field.type == "password" && (
                      <div>
                        <small>{field.display_label}</small>
                        <Input type="text" placeholder="Enter Password" autoComplete="off" />
                      </div>
                    )}
                    {/* phone number */}
                    {field.type == "phone" && (
                      <div>
                        <small>{field.display_label}</small>
                        <div className="flex items-center space-x-2">
                          <Select>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">US</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="text" placeholder="555-555-5555" autoComplete="off" />
                        </div>
                      </div>
                    )}
                    {/* address */}
                    {field.type == "address" && (
                      <div>
                        <small>{field.display_label}</small>
                        <div className="flex items-center space-x-2 mb-4">
                          <Input type="text" placeholder="Address 1" autoComplete="off" className="w-3/4" />
                          <Input type="text" placeholder="Address 2" autoComplete="off" className="w-1/4" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input type="text" placeholder="City" autoComplete="off" className="w-1/4" />
                          <Input type="text" placeholder="State" autoComplete="off" className="w-1/4" />
                          <Input type="text" placeholder="Zipcode" autoComplete="off" className="w-1/4" />
                          <Input type="text" placeholder="Country" autoComplete="off" className="w-1/4" />
                        </div>
                      </div>
                    )}
                    {/* routing */}
                    {field.type == "routing_number" && (
                      <div>
                        <small>{field.display_label}</small>
                        <Input
                          type="text"
                          placeholder="Routing Number"
                          autoComplete="off"
                          className={field.valid ? "" : "error"}
                        />
                      </div>
                    )}
                    {/* bank account */}
                    {field.type == "bank_account_number" && (
                      <div>
                        <small>{field.display_label}</small>
                        <Input
                          type="text"
                          placeholder="Bank Account"
                          autoComplete="off"
                          className={field.valid ? "" : "error"}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* add new field */}
              <div className="my-4">{AddFieldDropdown()}</div>
            </div>
          </div>

          {/* footer */}
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

export function AddFieldDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="link">+ Add Field</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new encrypted field to this form</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
          <DropdownMenuItem>
            Phone Number
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
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
