import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export default function Index() {
    return (
        <>
            <div className="container">
                <div className="max-w-4xl p-10 space-y-4">
                    <h1 className="">
                        Send and receive sensitive data with end-to-end
                        encryption
                    </h1>
                    <p className="lead">
                        Stop sharing passwords, api creds, banking info and
                        other scary info over email. Access a simple yet
                        powerful to send and receive data securely via web or
                        cli.
                    </p>
                    <div className="space-x-2">
                        <Link to="/sends">
                            <Button>Get Started</Button>
                        </Link>
                        <Button variant={"outline"}>Browse Templates</Button>
                    </div>
                </div>
            </div>
        </>
    );
}
