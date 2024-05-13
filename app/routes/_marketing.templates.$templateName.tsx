import AboutSidenav from "~/components/about-sidenav";
import BuilderFooter from "~/components/builder/footer";
import BuilderHeader from "~/components/builder/header";
import BuilderWrapper from "~/components/builder/wrapper";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

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

type Template = {
  id: number;
  name: string;
  description: string;
  form_definition: FormDefinition;
};

const form_definitions: FormDefinition[] = [
  {
    id: 1,
    field_definition: [
      {
        type: "text",
        display_label: "Public API Key",
        value: "",
        valid: true,
      },
      {
        type: "text",
        display_label: "Private API Key",
        value: "",
        valid: true,
      },
      {
        type: "file",
        display_label: "File Upload",
        value: "",
        valid: true,
      },
    ],
  },
];

const templates: Template[] = [
  {
    id: 1,
    description: "Use this template to securely send an API Key that is end-to-end encrypted.",
    name: "API Key",
    form_definition: form_definitions[0], //get first
  },
];

export default function TemplateDetails() {
  const template = templates[0];
  return (
    <div className="mx-auto px-4 max-w-5xl">
      <div>
        <Breadcrumb className="flex items-center mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Badge variant={"secondary"} className="">
                Send
              </Badge>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <h2>{template.name}</h2>
      <p className="muted mb-4">{template.description}</p>
      <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* share content  */}
          <BuilderWrapper>
            <div className="px-4 pt-4">
              <BuilderHeader title={template.name} />
            </div>
            {/* form definition fields TODO refactor */}
            <div className="space-y-3 mb-4 px-4 pt-2 pb-2">
              {template.form_definition.field_definition.map((field, index) => (
                <div key={index}>
                  {/* text */}
                  {field.type == "text" && (
                    <div>
                      <Label>{field.display_label}</Label>
                      <Textarea autoComplete="off" placeholder="Enter text" />
                    </div>
                  )}
                  {/* file upload */}
                  {field.type == "file" && (
                    <div>
                      <Label>{field.display_label}</Label>
                      <Input type="file" />
                    </div>
                  )}
                  {/* password */}
                  {field.type == "password" && (
                    <div>
                      <Label>{field.display_label}</Label>
                      <Input type="text" placeholder="Enter Password" autoComplete="off" />
                    </div>
                  )}
                  {/* phone number */}
                  {field.type == "phone" && (
                    <div>
                      <Label>{field.display_label}</Label>
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
                      <Label>{field.display_label}</Label>
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
                      <Label>{field.display_label}</Label>
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
                      <Label>{field.display_label}</Label>
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
            {/* end fields */}
            {/* builder footer */}
            <BuilderFooter />
          </BuilderWrapper>
        </div>
        <div>
          <aside className="sticky top-6">
            <div className="space-y-4 pb-10 mb-10">
              <AboutSidenav showAbout={true} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
