import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Index() {
  return (
    <>
      <div className="max-w-4xl p-10 space-y-4">
        <h1 className="">Send and receive sensitive data with end-to-end encryption</h1>
        <p className="lead">
          Stop risking sharing passwords, API keys, banking info and other scary information over email. Access a simple
          yet powerful way to send and receive data securely.
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
