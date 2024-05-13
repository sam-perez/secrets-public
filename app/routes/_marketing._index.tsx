import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "2Secure" },
    { name: "description", content: "2Secure is a simple yet powerful way to send and receive data securely." },
  ];
};

export default function Index() {
  return (
    <>
      <div className="max-w-4xl p-10 space-y-4">
        <h1 className="">Send and receive sensitive data with end-to-end encryption</h1>
        <p className="lead">
          Stop risking passwords, API keys, banking info and other scary information by sharing over email. 2Secure is a
          simple yet powerful way to send and receive data securely.
        </p>
        <div className="space-x-2">
          <Link to="/sends">
            <Button>Get Started</Button>
          </Link>
          <Link to="/templates">
            <Button variant={"outline"}>Browse Templates</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
