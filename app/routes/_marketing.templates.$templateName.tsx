import AboutSidenav from "~/components/about-sidenav";
import BuilderFooter from "~/components/builder/footer";

import BuilderWrapper from "~/components/builder/wrapper";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import BuilderFields, { secretBlobProps } from "~/components/builder/fields";

//type FieldType = "text" | "file" | "password" | "phone" | "routing_number" | "bank_account_number" | "address";

type Template = {
  id: number;
  name: string;
  description: string;
  secretBlobId: secretBlobProps[];
};

const templates: Template[] = [
  {
    id: 1,
    description: "Use this template to securely send an API Key that is end-to-end encrypted.",
    name: "API Key",
    secretBlobId: 1,
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
            <BuilderFields />
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
