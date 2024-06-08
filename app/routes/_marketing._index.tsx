import "highlight.js/styles/lightfair.css";

import { PaperPlaneIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import hljs from "highlight.js";
import { marked } from "marked";
import { useEffect } from "react";

import { SecretBuilderRoot } from "~/components/sends/builder/SecretBuilderRoot";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TemplateCard } from "~/components/ui/TemplateCard";

import { SEND_BUILDER_TEMPLATES } from "../components/sends/builder/types";

export const meta: MetaFunction = () => {
  return [
    { title: "2Secured" },
    {
      name: "description",
      content: "2Secured is a simple yet powerful way to send and receive info securely using end-to-end encryption.",
    },
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

  const defaultTemplate = SEND_BUILDER_TEMPLATES["new"];
  const allTemplates = Object.entries(SEND_BUILDER_TEMPLATES);
  const slugsToIncludeForWork = [
    "aws-api-key",
    "api-key",
    "stripe-api-key",
    "contract-agreement",
    "background-check",
    "google-cloud-api-key",
    "employment-verification",
    "credit-card-number",
  ];
  const slugsToIncludeForPersonal = [
    "password",
    "social-security-number",
    "email-login",
    "tax-return",
    "marriage-certificate",
    "birth-certificate",
    "bank-account",
  ];
  const filteredWorkTemplates = allTemplates.filter(([slug]) => slugsToIncludeForWork.includes(slug));
  const filteredPersonalTemplates = allTemplates.filter(([slug]) => slugsToIncludeForPersonal.includes(slug));

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
              <Link to="/sends/templates/new">
                <Button className="">
                  <PaperPlaneIcon className="mr-2 h-3 w-3" />
                  Try for yourself
                </Button>
              </Link>
              <Link to="/sends/templates">
                <Button variant={"outline"}>Browse Templates</Button>
              </Link>
            </div>
          </div>
          <div>
            <SecretBuilderRoot
              sendBuilderConfiguration={{
                title: defaultTemplate.title,
                password: null,
                expirationDate: null,
                confirmationEmail: null,
                maxViews: null,
                fields: defaultTemplate.fields.map((field) => ({ ...field, value: null })),
              }}
            />
          </div>
        </div>
      </section>

      <section id="howItWorks">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-8 px-4">
          {howItWorks.map((item, index) => (
            <div className="" key={index}>
              <div className="flex justify-center items-center size-12 bg-slate-100 rounded-xl">{index + 1}</div>
              <div className="mt-4">
                <h4>{item.title}</h4>
                <p className="pt-2 text-base">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="useCases" className="my-24 bg-slate-50">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 gap-24 items-center px-4">
          <div className="sm:pt-0 pt-14">
            <h2>2Secured helps you keep your data safe at work, and at home.</h2>
            <p className="text-lg mt-0 mb-4">
              Perfect anytime you are sending or requesting sensitive information from someone else.
            </p>
            <Link to="/sends/templates">
              <Button>Browse All Templates</Button>
            </Link>
          </div>
          <div>
            <Tabs defaultValue="business" className="min-h-[400px] bg-slate-50 p-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="business">For Work</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
              </TabsList>
              <TabsContent value="business" className="space-y-4 overflow-y-auto h-[400px]">
                {filteredWorkTemplates.map(([slug, template]) => (
                  <div key={slug}>
                    <TemplateCard
                      show_description={false}
                      template_slug={slug}
                      name={template.title}
                      number_fields={template.fields.length}
                    />
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="personal" className="space-y-4 overflow-y-auto h-[400px]">
                {filteredPersonalTemplates.map(([slug, template]) => (
                  <div key={slug}>
                    <TemplateCard
                      show_description={false}
                      template_slug={slug}
                      name={template.title}
                      number_fields={template.fields.length}
                    />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section id="formEditor" className="my-12">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 sm:gap-24 items-center px-4">
          <div className="sm:pt-0 pt-14">
            <h2>A powerful form editor lets you quickly send or request encrypted files and text to anyone.</h2>
            <p className="text-lg mt-0 mb-4">
              Create your own reusable 2Secured forms and save them as templates to quickly reuse them.
            </p>
            <Link to="/sends/templates/new">
              <Button>Build your own form</Button>
            </Link>
          </div>
          <div>
            <div className="border h-[500px]">sdfasdfasf</div>
          </div>
        </div>
      </section>

      <section id="securitySettings" className="my-12 bg-slate-50">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 sm:gap-24 items-center px-4">
          <div className="sm:pt-0 pt-14">
            <h2>Control access and set permissions to your 2Secured link.</h2>
            <p className="text-lg mt-0 mb-4">
              Restrict the email addresses that can view your links, set how many times a link can be viewed, require a
              password and more.
            </p>
            <Link to="/sends/templates/new">
              <Button>Try for yourself</Button>
            </Link>
          </div>
          <div className="border h-[500px]">sdfasdfasf</div>
        </div>
      </section>

      <section id="curlExample" className="my-12">
        <div className="sm:p-20 grid grid-cols-1 sm:grid-cols-2 sm:gap-24 items-center px-4">
          <div className="sm:pt-0 pt-14">
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
