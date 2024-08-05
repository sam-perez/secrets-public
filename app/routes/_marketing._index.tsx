import "highlight.js/styles/nnfx-dark.min.css";

import { ArrowDownIcon, ArrowUpIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import hljs from "highlight.js";
import { marked } from "marked";
import { useEffect } from "react";

import { SendSecretBuilderRoot } from "~/components/sends/builder/SendSecretBuilderRoot";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TemplateCard } from "~/components/ui/TemplateCard";
import expire_img from "~/images/expire@2x.png";
import form_img from "~/images/form@2x.png";
import aws_icon from "~/images/icon_AWS.png";
import sheets_icon from "~/images/icon_GOOGLE_SHEETS.png";
import slack_icon from "~/images/icon_SLACK.png";
import webhooks_icon from "~/images/icon_WEBHOOKS.png";

import { SEND_BUILDER_TEMPLATES } from "../components/sends/builder/types";

export const meta: MetaFunction = () => {
  return [
    { title: "2Secured: Send & receive anything with end-to-end encryption" },
    {
      name: "description",
      content:
        // eslint-disable-next-line max-len
        "2Secured offers a simple yet powerful way to send and receive information securely using end-to-end encryption. Encrypt text or files, and share via links that can expire, require MFA, or a password to view.",
    },
  ];
};

const howItWorks = [
  {
    title: "Start with a 2Secured form",
    description:
      // eslint-disable-next-line max-len
      "Build a 2Secured form in seconds to send or request text and files securely. Set links to expire, restrict email, or set a password. ",
  },
  {
    title: "Get an encrypted link",
    description:
      // eslint-disable-next-line max-len
      "2Secured encrypts the data using the SHA-256 algorithm and generates a secret link with the only decryption token.",
  },
  {
    title: "Share, decrypt and view",
    description:
      // eslint-disable-next-line max-len
      "Share your link. Only you and the recipient have the decryption token, no other system or human can view it (not even us).",
  },
];

const markdown = `
  \`\`\`bash
  curl -X POST "https://2secured.link/api/initiate-send" \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
            "title": "Your title here",
            "confirmationEmail": "example@email.com",
            "expiresIn": "1 week",
            "maxViews": 4,
            "password": "supersecret",
            "fields": [
              {
                "title": "Prompt",
                "type": "single-line-text"
              },
              {
                "title": "Attachment",
                "type": "file"
              },
            ]
          }'

  #response

  {
    "sendId": "send-123",
    "link": "https://2secured.link/send-123#decryption-key"
  }
  \`\`\`
`;

const integrations = [
  {
    title: "AWS",
    description: "Push data into AWS secrets manager.",
    logo: aws_icon,
  },
  {
    title: "Webhooks",
    description: "Send events including link views, expiration, or data to HTTP endpoints.",
    logo: webhooks_icon,
  },
  {
    title: "Slack",
    description: "Send Slack messages for events such as link views, link expiration, or data to Slack.",
    logo: slack_icon,
  },
  {
    title: "Google Sheets",
    description: "Send data received to a sheet.",
    logo: sheets_icon,
  },
];

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
        <div className="sm:p-2 grid md:grid-cols-2 grid-cols-1 sm:gap-24 items-center">
          <div className="p-4">
            <h1 className="mb-4">Send and receive sensitive data with end-to-end encryption</h1>
            <p className="lead">
              Stop risking sensitive information like passwords, API keys, and banking details by sharing them over
              email. Create an end-to-end encrypted link with expiration controls, recipient restrictions, and password
              protection instead.
            </p>
            <div className="space-x-2 pt-4">
              <Link to="/sends/templates/new">
                <Button className="">
                  <ArrowUpIcon className="mr-2 h-3 w-3" />
                  Send
                </Button>
              </Link>
              <Link to="/receives/templates">
                <Button variant={"outline"}>
                  {" "}
                  <ArrowDownIcon className="mr-2 h-3 w-3" />
                  Receive{" "}
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <SendSecretBuilderRoot
              sendBuilderConfiguration={{
                title: defaultTemplate.title,
                password: null,
                expirationDate: {
                  totalTimeUnits: 1,
                  timeUnit: "weeks",
                },
                confirmationEmail: null,
                maxViews: 4,
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
                      showDescription={false}
                      templateSlug={slug}
                      name={template.title}
                      numberFields={template.fields.length}
                      cardType="sends"
                    />
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="personal" className="space-y-4 overflow-y-auto h-[400px]">
                {filteredPersonalTemplates.map(([slug, template]) => (
                  <div key={slug}>
                    <TemplateCard
                      showDescription={false}
                      templateSlug={slug}
                      name={template.title}
                      numberFields={template.fields.length}
                      cardType="sends"
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
            <div>
              <img src={form_img} alt="encrypted form editor" />
            </div>
          </div>
        </div>
      </section>

      <section id="securitySettings" className="my-12 bg-slate-50">
        <div className="sm:p-20 grid sm:grid-cols-2 grid-cols-1 sm:gap-24 items-center px-4">
          <div className="sm:pt-0 pt-14 pb-4">
            <h2>Control access and set permissions to your 2Secured link.</h2>
            <p className="text-lg mt-0 mb-4">
              Restrict the email addresses that can view your links, set how many times a link can be viewed, require a
              password and more.
            </p>
            <Link to="/sends/templates/new">
              <Button>Try for yourself</Button>
            </Link>
          </div>
          <div>
            <img src={expire_img} alt="encrypted form editor" />
          </div>
        </div>
      </section>

      <section id="curlExample" className="my-12">
        <div className="sm:p-20 grid grid-cols-1 sm:grid-cols-2 sm:gap-24 items-center px-4">
          <div className="sm:pt-0 pt-14 pb-4">
            <h2>Built with developers in mind.</h2>
            <p className="text-lg mb-4">
              Use the web app or integrate 2Secure into your development or application workflow.
            </p>
            <Link to={"https://tally.so/r/w7D9oz"}>
              <Button variant={"outline"}>Join waitlist</Button>
            </Link>
          </div>
          <div style={{ fontSize: "0.8rem" }} dangerouslySetInnerHTML={{ __html: marked(markdown) }}></div>
        </div>
      </section>

      <section id="integrations" className="my-12 bg-slate-50">
        <div className="sm:p-20 px-4">
          <div className="sm:pt-0 pt-14 max-w-lg">
            <h2>Add 2Secured to your workflow for sensitive data.</h2>

            <p className="text-lg mt-0 mb-4">
              Pull or push data to other applications you may use. <br />
              Need something not listed below?{" "}
              <Link to={"mailto:integrations@2secured.link"} className="underline">
                Contact us
              </Link>
            </p>
            <Link to={"https://tally.so/r/w7D9oz"}>
              <Button variant={"outline"}>Join waitlist</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 sm:gap-24 items-top mt-12">
            {integrations.map((integration, index) => (
              <div key={index} className="space-y-2 mb-4">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={integration.logo} className="h-6 w-6" />
                <h6 className="font-medium">{integration.title}</h6>
                <p>{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
