import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ChangeEvent, useState } from "react";

import { RECEIVE_BUILDER_TEMPLATES } from "~/components/receives/builder/types";
import { Input } from "~/components/ui/input";
import { TemplateCard } from "~/components/ui/TemplateCard";

export const meta: MetaFunction = () => {
  return [
    { title: "Encrypted Form Builder Templates | 2Secured" },
    {
      name: "description",
      content:
        // eslint-disable-next-line max-len
        "Start from one of these reusable templates to quickly send or receive encrypted information. Encrypt text or files, and share via links that can expire, require MFA, or a password to view.",
    },
  ];
};

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  const filteredTemplates = Object.entries(RECEIVE_BUILDER_TEMPLATES).filter(([, template]) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultTemplate = RECEIVE_BUILDER_TEMPLATES["new"];

  return (
    <>
      <section className="mx-auto max-w-5xl text-center p-20 space-y-2">
        <h1>Explore encrypted form templates</h1>
        <p className="lead pb-4">
          Start from one of these reusable forms to request encrypted information from someone else.
        </p>
        <Input placeholder="Search templates" onChange={handleSearchChange} className="max-w-lg mx-auto" />
      </section>
      {/* todo sort by tag */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:grid-cols-4">
        {filteredTemplates.map(([slug, template]) => (
          <div key={slug}>
            <TemplateCard
              showDescription={true}
              name={template.title}
              templateSlug={slug}
              description={template.description}
              numberFields={template.fields.length}
              cardType="receives"
            />
          </div>
        ))}
      </div>
      {filteredTemplates.length == 0 && (
        <div>
          <p className="text-base mx-auto max-w-xl text-center">
            Build your own starting from a{" "}
            <Link to={"/receives/templates/new"} className="font-medium hover:text-slate-600">
              blank receive
            </Link>{" "}
            or email{" "}
            <a href="mailto:templates@2secured.link" className="font-medium hover:text-slate-600">
              templates@2secured.link
            </a>{" "}
            and we will create a private one for you within 1 day.
          </p>
          <div className="mt-4 mx-auto w-1/2 sm:w-1/3 md:w-1/4">
            <TemplateCard
              showDescription={true}
              name={defaultTemplate.title}
              templateSlug={"new"}
              description={defaultTemplate.description}
              numberFields={defaultTemplate.fields.length}
              cardType="receives"
            />
          </div>
        </div>
      )}
    </>
  );
}
