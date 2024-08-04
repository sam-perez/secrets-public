import { ChevronRightIcon } from "@radix-ui/react-icons";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import AboutSidenav from "~/components/about-sidenav";
import { SendSecretBuilderRoot } from "~/components/sends/builder/SendSecretBuilderRoot";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";

import { SEND_BUILDER_TEMPLATES } from "../components/sends/builder/types";

type LoaderData =
  | {
      template: (typeof SEND_BUILDER_TEMPLATES)[keyof typeof SEND_BUILDER_TEMPLATES];
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
          <Link to="/sends/templates" className="mb-2 text-sm hover:text-slate-500 flex items-center">
            Templates <ChevronRightIcon />
          </Link>
        )}
      </div>

      <h2>{template.title}</h2>

      <p className="muted mb-4">{template.description}</p>
      <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* share content  */}
          <SendSecretBuilderRoot
            sendBuilderConfiguration={{
              title: template.title,
              password: null,
              expirationDate: {
                totalTimeUnits: 1,
                timeUnit: "weeks",
              },
              confirmationEmail: null,
              maxViews: 4,
              fields: template.fields.map((field) => ({ ...field, value: null })),
            }}
          />
        </div>
        <div>
          <aside className="sticky top-6">
            <div className="space-y-4 pb-10 mb-10">
              {!template.private && (
                <Link to={"https://tally.so/r/w7D9oz"} target="_blank" rel="noreferrer">
                  <Alert variant={"info"}>
                    Want to save your edits to this template? <span className="font-medium">Join our waitlist!</span>
                  </Alert>
                </Link>
              )}

              <AboutSidenav showAbout={true} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
