import { TemplateCard } from "~/components/ui/TemplateCard";

const templates = [
  {
    name: "API Key",
    slug: "api-key",
    uses: 4231,
  },
  {
    name: "Password",
    slug: "password",
    uses: 64231,
  },
  {
    name: "Social Security Number",
    slug: "social-security-number",
    uses: 192,
  },
  {
    name: "Bank Account",
    slug: "bank-account",
    uses: 34,
  },
  {
    name: "IRS I-9",
    slug: "i-9",
    uses: 9488,
  },
  {
    name: "Credit Card Number",
    slug: "credit-card-numbers",
    uses: 92,
  },
  {
    name: "Home Address",
    slug: "home-address",
    uses: 9232,
  },
];

export default function Templates() {
  return (
    <>
      <section className="mx-auto max-w-4xl text-center p-20 space-y-2">
        <h1>Explore templates</h1>
        <p className="lead mb-4">
          Start from one of these reusable forms to quickly send or receive encrypted information.
        </p>
      </section>
      {/* todo sort by tag */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:grid-cols-4">
        {templates.map((template, index) => (
          <div key={index}>
            <TemplateCard
              show_description={true}
              name={template.name}
              uses={template.uses}
              template_slug={template.slug}
            />
          </div>
        ))}
      </div>
    </>
  );
}
