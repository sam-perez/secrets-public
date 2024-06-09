import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import AboutSidenav from "~/components/about-sidenav";
import { SecretBuilderRoot } from "~/components/sends/builder/SecretBuilderRoot";
import { Badge } from "~/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "~/components/ui/breadcrumb";

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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: "Encrypted " + data.template.title + " Template | 2Secured" },
    { name: "description", content: data.template.description },
  ];
};

export default function TemplateDetails() {
  const data = useLoaderData<LoaderData>();

  if ("error" in data) {
    return <p>Invalid template.</p>;
  }

  const { template } = data;

  return (
    <div className="mx-auto px-4 max-w-5xl">
      <div className="flex items-center">
        {template.private ? (
          <Badge className="mb-2">Private Template</Badge>
        ) : (
          <Breadcrumb className="flex items-center mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/sends/templates">Templates /</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <h2>{template.title}</h2>

      <p className="muted mb-4">{template.description}</p>
      <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* share content  */}
          <SecretBuilderRoot
            sendBuilderConfiguration={{
              title: template.title,
              password: null,
              expirationDate: null,
              confirmationEmail: null,
              maxViews: null,
              fields: template.fields.map((field) => ({ ...field, value: null })),
            }}
          />
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
