import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mx-auto">
      <div className="sm:col-span-4">
        <Card>
          <Button>Click me!</Button>
        </Card>
      </div>
    </div>
  );
}
