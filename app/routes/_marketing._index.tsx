import { PaperPlaneIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import "highlight.js/styles/tokyo-night-dark.css";
import hljs from "highlight.js";
import { useEffect } from "react";
import { marked } from "marked";
import BuilderWrapper from "~/components/sends/builder/wrapper";
import BuilderFields from "~/components/sends/builder/fields";
import BuilderFooter from "~/components/sends/builder/footer";
import { TemplateCard } from "~/components/ui/TemplateCard";
import { SEND_BUILDER_TEMPLATES } from "../components/sends/builder/types";

export const meta: MetaFunction = () => {
  return [
    { title: "2Secure" },
    { name: "description", content: "2Secure is a simple yet powerful way to send and receive data securely." },
  ];
};

const howItWorks = [
  {
    title: "1. Start with a 2Secured form",
    description: "Build a 2Secured form in seconds to send or request text and files securely. ",
  },
  {
    title: "2. Get an encrypted link",
    description: "2Secured encrypts the data using the SHA-256 algorithm and generates a link.",
  },
  {
    title: "3. Share, decrypt and view",
    description:
      "Only you and the recipient have the decryption token, no other system or human can view it (not even us).",
  },
];

const useCases = {
  work: [
    {
      title: "AWS API Keys",
      type: "Send",
      slug: "aws-api-key",
      uses: 234,
    },
    {
      title: "Rotating API Keys",
      type: "Send",
      slug: "api-key",
      uses: 234,
    },
    {
      title: "Collecting bank account info from a client",
      type: "Request",
      slug: "api-key",
      uses: 234,
    },
    {
      title: "Sharing your password with a coworker",
      type: "Send",
      slug: "api-key",
      uses: 1234,
    },
    {
      title: "Sharing your password with a coworker",
      type: "Send",
      slug: "api-key",
      uses: 234,
    },
  ],
  personal: [
    {
      title: "Sharing tax documents with your Accountant",
      type: "Send",
      slug: "api-key",
      uses: 234,
    },
    {
      title: "Sharing WIFI Password",
      type: "Send",
      slug: "api-key",
      uses: 234,
    },
  ],
};

const markdown = `
  \`\`\`bash
  > 2secured-cli send-secret
  --api-key XYZ
  --expiration "7 days"
  --confirmation-email "email@2secured.com"
  --template "template_name"
  --data "DATA_TO_ENCRYPT"
  --file "./file/to/encrypt"
  --message "some message for the user"
  --tag "tags"


  #response

  {
    "status": "success",
    "requestId": "req123",
    "link": "https://2secured.link/req123#decryptionkey"
  }
  \`\`\`
`;

export default function Index() {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  const defaultTemplate = SEND_BUILDER_TEMPLATES["aws-api-key"];

  return (
    <>
      <section className="py-14 mb-24">
        <div className="sm:p-2 grid sm:grid-cols-2 grid-cols-1 sm:gap-24 items-center">
          <div className="p-4">
            <h1 className="mb-4">Send and receive sensitive data with end-to-end encryption</h1>
            <p className="lead">
              Stop risking passwords, API keys, banking info and other scary information by sharing over email. 2Secure
              is a simple yet powerful way to send and receive data securely.
            </p>
            <div className="space-x-2 pt-4">
              <Link to="/builder">
                <Button className="">
                  <PaperPlaneIcon className="mr-2 h-3 w-3" />
                  New Encrypted Send
                </Button>
              </Link>
              <Link to="/sends/templates">
                <Button variant={"outline"}>Browse Templates</Button>
              </Link>
            </div>
          </div>
          <div>
            <BuilderWrapper>
              <BuilderFields
                builderConfiguration={{
                  title: defaultTemplate.title,
                  password: null,
                  expirationDate: null,
                  confirmationEmail: null,
                  maxViews: null,
                  fields: defaultTemplate.fields.map((field) => ({ ...field, value: null })),
                }}
              />
              <BuilderFooter />
            </BuilderWrapper>
          </div>
        </div>
      </section>

      <section id="howItWorks">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-8">
          {howItWorks.map((item, index) => (
            <div className="" key={index}>
              <div>
                <h4>{item.title}</h4>
                <p className="pt-2 text-base">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="useCases" className="my-24 bg-slate-50">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 gap-24 items-center">
          <div>
            <h2>2Secured helps you keep your data safe at work, and at home.</h2>
            <p className="text-lg mt-4">
              Perfect anytime you are sending or requesting sensitive information from someone else.
            </p>
          </div>
          <div>
            <Tabs defaultValue="business" className="min-h-[400px] bg-slate-50 p-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="business">For Work</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
              </TabsList>
              <TabsContent value="business" className="space-y-4">
                {useCases.work.map((item, index) => (
                  <div key={index}>
                    <TemplateCard show_description={false} template_slug={item.slug} name={item.title} />
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="personal" className="space-y-4">
                {useCases.personal.map((item, index) => (
                  <div key={index}>
                    <TemplateCard show_description={false} template_slug={item.slug} name={item.title} />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section id="formEditor" className="my-12">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 sm:gap-24 items-center">
          <div>
            <h2>Powerful form editor lets you quickly send or request encrypted files and text to anyone.</h2>
            <p className="text-lg mt-4">
              Create your own reusable 2Secured forms and save them as templates to quickly reuse them.
            </p>
          </div>
          <div>
            <div className="border h-[500px]">sdfasdfasf</div>
          </div>
        </div>
      </section>

      <section id="securitySettings" className="my-12 bg-slate-50">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 sm:gap-24 items-center">
          <div>
            <h2>Control access and set permissions to your 2Secured link.</h2>
            <p className="text-lg mt-4">
              Restrict the email addresses that can view your links, set how many times a link can be viewed, require a
              password and more.
            </p>
          </div>
          <div className="border h-[500px]">sdfasdfasf</div>
        </div>
      </section>

      <section id="curlExample" className="my-12">
        <div className="sm:p-20 grid grid-cols-1 sm:grid-cols-2 sm:gap-24 items-center">
          <div>
            <h2>Built with developers in mind.</h2>
            <p className="text-lg mb-4">
              Use the web app or integrate 2Secure into your development or application workflow.
            </p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: marked(markdown) }}></div>
        </div>
      </section>

      <section id="integrations" className="my-12 bg-slate-50">
        <h3>Add 2Secured to your workflow for sensitive data</h3>
        <p className="text-lg">
          Pull data from, or push data to, other applications you may use. Want something not listed? Tell us
        </p>
      </section>
    </>
  );
}
