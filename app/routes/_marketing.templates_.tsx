import { Link } from "@remix-run/react";

const templates = [
  {
    name: "API Key",
    slug: "bank-account",
    uses: 4231,
  },
  {
    name: "Social Security Number",
    slug: "bank-account",
    uses: 192,
  },
  {
    name: "Bank Account",
    slug: "bank-account",
    uses: 34,
  },
  {
    name: "Bank Account",
    slug: "bank-account",
    uses: 9488,
  },
  {
    name: "Bank Account",
    slug: "bank-account",
    uses: 422,
  },
];

export default function Templates() {
  return (
    <>
      <h2>Explore Templates</h2>
      <p className="lead mb-4">
        Start from one of these reusable forms to quickly send or receive encrypted information.
      </p>
      {/* todo sort by tag */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 ">
        {templates.map((template, index) => (
          <Link key={index} to={"/templates/" + template.slug}>
            <div className="col-span-1 p-4 border rounded-lg hover:bg-slate-50">{template.name}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
