import { Link } from "@remix-run/react";
import { useState, ChangeEvent } from "react";
import { SEND_BUILDER_TEMPLATES } from "~/components/sends/builder/types";
import { TemplateCard } from "~/components/ui/TemplateCard";
import { Input } from "~/components/ui/input";

const sendTemplates = SEND_BUILDER_TEMPLATES;

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  const filteredTemplates = Object.entries(sendTemplates).filter(([, template]) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <section className="mx-auto max-w-5xl text-center p-20 space-y-2">
        <h1>Explore templates</h1>
        <p className="lead pb-6">
          Start from one of these reusable forms to quickly send or receive encrypted information.
        </p>
        <Input placeholder="Search templates" onChange={handleSearchChange} className="max-w-lg mx-auto" />
      </section>
      {/* todo sort by tag */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:grid-cols-4">
        {filteredTemplates.map(([slug, template]) => (
          <div key={slug}>
            <TemplateCard
              show_description={true}
              name={template.title}
              template_slug={slug}
              description={template.description}
              number_fields={template.fields.length}
            />
          </div>
        ))}
      </div>
      {filteredTemplates.length == 0 && (
        <p className="text-base mx-auto max-w-xl text-center">
          Build your own starting from a{" "}
          <Link to={"/sends/templates/new"} className="font-medium hover:text-slate-600">
            blank send
          </Link>{" "}
          or email{" "}
          <a href="mailto:templates@2secured.link" className="font-medium hover:text-slate-600">
            templates@2secured.link
          </a>{" "}
          and we will create a private one for you within 1 day.
        </p>
      )}
    </>
  );
}
