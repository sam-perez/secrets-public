import { CheckIcon, DotFilledIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const meta: MetaFunction = () => {
  return [
    { title: "2Secure" },
    { name: "description", content: "2Secure is a simple yet powerful way to send and receive data securely." },
  ];
};

const howItWorks = [
  {
    title: "Start with a 2Secured form",
    description: "Build a 2Secured form in seconds to send or request text and files securely. ",
  },
  {
    title: "Get an encrypted link",
    description: "2Secured encrypts the data using the SHA-256 algorithm and generates a link.",
  },
  {
    title: "Share, decrypt and view",
    description:
      "Only you and the recipient have the decryption token, no other system or human can view it (not even us).",
  },
];

const useCases = {
  work: [
    {
      title: "Rotating API Keys",
      type: "Send",
    },
    {
      title: "Collecting bank account info from a client",
      type: "Request",
    },
    {
      title: "Sharing your password with a coworker",
      type: "Send",
    },
    {
      title: "Sharing your password with a coworker",
      type: "Send",
    },
  ],
  personal: [
    {
      title: "Sharing tax documents with your Accountant",
      type: "Send",
    },
    {
      title: "Sharing WIFI Password",
      type: "Send",
    },
  ],
};

export default function Index() {
  return (
    <>
      <section>
        <div className="max-w-3xl py-20 space-y-3 mx-auto text-center">
          <h1 className="">Send and receive sensitive data with end-to-end encryption</h1>
          <p className="lead">
            Stop risking passwords, API keys, banking info and other scary information by sharing over email. 2Secure is
            a simple yet powerful way to send and receive data securely.
          </p>
          <div className="space-x-2">
            <Link to="/builder">
              <Button className="">
                <PaperPlaneIcon className="mr-2 h-3 w-3" />
                New Encrypted Send
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant={"outline"}>Browse Templates</Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="howItWorks">
        <div className="grid grid-cols-3 gap-8">
          {howItWorks.map((item, index) => (
            <div className="p-4 border rounded" key={index}>
              <div>
                <h4>{item.title}</h4>
                <p className="pt-2 text-base">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="useCases" className="my-24">
        <div className="grid grid-cols-2 gap-24 items-center">
          <div className="p-20">
            <h2>2Secured helps you keep your data safe at work, and at home.</h2>
            <p className="text-lg mt-4">
              Perfect anytime you are sending or requesting sensitive information from someone else.
            </p>
          </div>
          <div>
            <Tabs defaultValue="business" className="h-[400px] bg-slate-50 p-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business">For Work</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
              </TabsList>
              <TabsContent value="business">
                {useCases.work.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border p-4 rounded-md mb-4 bg-white">
                    <h5>{item.title}</h5>
                    <Badge variant={"secondary"}>{item.type}</Badge>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="personal">
                {useCases.personal.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border p-4 rounded-md mb-4 bg-white">
                    <h5>{item.title}</h5>
                    <Badge variant={"secondary"}>{item.type}</Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section id="formEditor" className="my-24">
        <div className="grid grid-cols-2 gap-24 items-center">
          <div className="p-20">
            <h2>Powerful form editor lets you quickly send or request encrypted files and text to anyone.</h2>
            <p className="text-lg mt-4">
              Create your own reusable 2Secured forms and save them as templates to quickly reuse them.
            </p>
          </div>
          <div>
            <img src="https://place-hold.it/500" alt="" />
          </div>
        </div>
      </section>

      <section id="securitySettings" className="my-24">
        <div className="grid grid-cols-2 gap-24 items-center">
          <div className="p-20">
            <h2>Control access and set permissions to your 2Secured link.</h2>
            <p className="text-lg mt-4">
              Restrict the email addresses that can view your links, set how many times a link can be viewed, require a
              password and more.
            </p>
          </div>
          <div>
            <img src="https://place-hold.it/500" alt="" />
          </div>
        </div>
      </section>

      <section id="curlExample" className="my-24">
        <h3>Built with developers in mind.</h3>
        <p className="text-lg">Use the web app or integrate 2Secure into your development or application workflow.</p>
      </section>

      <section id="integrations" className="my-24">
        <h3>Add 2Secured to your workflow for sensitive data</h3>
        <p className="text-lg">
          Pull data from, or push data to, other applications you may use. Want something not listed? Tell us
        </p>
      </section>
    </>
  );
}
