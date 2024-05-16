import { Share2Icon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";

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
        <h1>Explore Templates</h1>
        <p className="lead mb-4">
          Start from one of these reusable forms to quickly send or receive encrypted information.
        </p>
      </section>
      {/* todo sort by tag */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 ">
        {templates.map((template, index) => (
          <Link key={index} to={"/templates/" + template.slug}>
            <div className="col-span-1 p-4 border rounded-lg hover:bg-slate-50 space-y-1">
              <h5 className="font-medium">{template.name}</h5>
              <p className="">Send or request {template.name} details using e2e encryption.</p>
              <span className="muted block flex items-center text-xs">
                <Share2Icon className="h-3 w-3 mr-1" />
                {template.uses}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
