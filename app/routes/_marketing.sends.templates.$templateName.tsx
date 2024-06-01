import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AboutSidenav from "~/components/about-sidenav";
import BuilderFooter from "~/components/sends/builder/footer";

import BuilderWrapper from "~/components/sends/builder/wrapper";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import BuilderFields from "~/components/sends/builder/fields";

import { SEND_BUILDER_TEMPLATES, SendBuilderTemplate } from "../components/sends/builder/types";

type LoaderData =
  | {
      template: SendBuilderTemplate;
    }
  | { error: string };

export const loader: LoaderFunction = async ({ params }) => {
  const { templateName } = params;
  let loaderData: LoaderData;

  if (!templateName) {
    loaderData = { error: "Invalid template." };
  } else {
    const matchedTemplate = SEND_BUILDER_TEMPLATES[templateName];

    if (!matchedTemplate) {
      loaderData = { error: "Template not found." };
    } else {
      loaderData = { template: matchedTemplate };
    }

    return json<LoaderData>(loaderData);
  }
};

export default function TemplateDetails() {
  const data = useLoaderData<LoaderData>();

  if ("error" in data) {
    return <p>Invalid template.</p>;
  }

  const { template } = data;

  return (
    <div className="mx-auto px-4 max-w-5xl">
      <div>
        <Breadcrumb className="flex items-center mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Badge variant={"secondary"} className="">
                Send
              </Badge>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/sends/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <h2>{template.title}</h2>
      <p className="muted mb-4">{template.description}</p>
      <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* share content  */}
          <BuilderWrapper>
            <BuilderFields
              // this will have to be modified so that we can change its state
              builderConfiguration={{
                title: template.title,
                password: null,
                expirationDate: null,
                confirmationEmail: null,
                maxViews: null,
                fields: template.fields.map((field) => ({ ...field, value: null })),
              }}
            />
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
