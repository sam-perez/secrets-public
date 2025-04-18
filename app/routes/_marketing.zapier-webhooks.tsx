import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import zapierImg from "~/images/zapier-webhooks.jpeg";

export const meta: MetaFunction = () => {
  return [
    { title: "Zapier Webhook | 2Secured" },
    {
      name: "description",
      content:
        // eslint-disable-next-line max-len
        ".",
    },
  ];
};

export default function Security() {
  return (
    <div className="max-w-5xl mx-auto mb-24 px-4">
      <h1 className="mt-4">Notifications via Zapier Webhook</h1>
      <p className="lead mt-2">
        How to configure zapier webhooks to enable notifications when someone submits a secure form.
      </p>

      <p className="text-base mt-2">
        2Secured currently only supports secure form submission notifications via Zapier via webhooks. In order to
        configure a Zapier webhook, you will need to create a new Zap and select the webhook trigger. You will then be
        provided with a webhook URL that you can copy and paste into the webhook URL field in the receive notification
        configuration on 2Secured.
      </p>
      <h4>Steps to configure a Zapier webhook notification</h4>
      <ol className="list-disc list-inside mt-2">
        <li>Go to Zapier and create a new Zap</li>
        <li>
          Select the Webhook Trigger (more info{" "}
          <a
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
            href="https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks"
          >
            here
          </a>
          )
        </li>
        <li>
          Copy the webhook URL from Zapier and paste it into the webhook URL field in the receive notification
          configuration on 2Secured
          <img src={zapierImg} alt="Zapier Webhook" className="p-4 max-w-lg" />
        </li>
        <li>
          <p className="text-base mt-2">
            The webhook will be invoked using a <b>GET</b> request and will have a single query parameter called{" "}
            <b>receiveResponseLink</b> that will contain the link to the receive response.{" "}
            <i>
              Note: we use a GET request because it works well with CORS + Zapier and the webhooks are invoked from the
              browser of the respondent.
            </i>
          </p>
        </li>
        <li>
          Once you have configured the webhook, you can test it by using the link created by the{" "}
          <Link to={"/receives/templates/new"} className="text-blue-500">
            Receive Form Builder
          </Link>
          . The links that are sent to the webhook are unique to each receive response and are only valid for 30 days.
          The webhooks are invoked from the browser of the respondent, and the password that is used to encrypt and
          decrypt the response is included in the URL fragment. This means that the password is never sent to the
          backend server, and can only be accessed by you via the zapier webhook.
        </li>
      </ol>
      <div className="mt-4">
        <Link className="text-base text-blue-500" to={"https://tally.so/r/w7D9oz"} target="_blank" rel="noreferrer">
          Let us know if you would like more webhooks supported!
        </Link>
      </div>
    </div>
  );
}
