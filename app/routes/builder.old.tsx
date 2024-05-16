import { Button } from "~/components/ui/button";

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

import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import BuilderFooter from "~/components/builder/footer";
import BuilderHeader from "~/components/builder/header";
import BuilderFields from "~/components/builder/fields";
import BuilderWrapper from "~/components/builder/wrapper";

type FieldType = "text" | "file" | "password" | "phone" | "routing_number" | "bank_account_number" | "address";

type FieldDefinition = {
  type: FieldType;
  display_label: string;
  value: string;
  file_value?: File | null; //im not sure if this is correct for a file
  valid: boolean; //this means the value is valid using validation (like a routing # has to be 9 )
};

type FormDefinition = {
  id: number;
  field_definition: FieldDefinition[];
};

const form_definitions: FormDefinition[] = [
  {
    id: 1,
    field_definition: [
      {
        type: "text",
        display_label: "API Key",
        value: "",
        valid: true,
      },
      {
        type: "file",
        display_label: "Upload",
        value: "",
        valid: true,
      },
      {
        type: "password",
        display_label: "Password",
        value: "",
        valid: true,
      },
      {
        type: "phone",
        display_label: "Phone Number",
        value: "",
        valid: true,
      },
      {
        type: "address",
        display_label: "Address",
        value: "",
        valid: true,
      },
      {
        type: "routing_number",
        display_label: "Routing Number",
        value: "",
        valid: false,
      },
      {
        type: "bank_account_number",
        display_label: "Bank Account Number",
        value: "",
        valid: true,
      },
      {
        type: "text",
        display_label: "API Secret",
        value: "",
        valid: true,
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
              <BuilderHeader title="" />
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
          <BuilderFooter />
        </div>
      </div>

      {/* new builder */}
      <div className="max-w-2xl mx-auto mt-10">
        <BuilderWrapper>
          <BuilderFields />
          <BuilderFooter />
        </BuilderWrapper>
      </div>
    </>
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
          <DropdownMenuItem onClick={() => addNewField("text")}>
            Text Field
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addNewField("file")}>
            File Upload
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addNewField("password")}>
            Password
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addNewField("address")}>
            Address
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addNewField("phone")}>
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
                <DropdownMenuItem onClick={() => addNewField("routing_number")}>Routing Number</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNewField("bank_account_number")}>
                  Bank Account Number
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function addNewField(type: FieldType): void {
  const newField: FieldDefinition = {
    type,
    display_label: type === "text" ? "Text Field" : "TODO", //TODO
    value: "",
    valid: true,
    file_value: type === "file" ? null : undefined,
  };
  form_definitions[0].field_definition.push(newField);
  console.log(form_definitions[0]);
}
