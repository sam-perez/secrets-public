import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Security | 2Secured" },
    {
      name: "description",
      content:
        // eslint-disable-next-line max-len
        "2Secured offers a simple yet powerful way to send and receive information securely using end-to-end encryption. Encrypt text or files, and share via links that can expire, require MFA, or a password to view.",
    },
  ];
};

export default function Security() {
  return (
    <div className="max-w-5xl mx-auto mb-24 px-4">
      <h1 className="mt-4">Zapier Webhook</h1>
      <p className="lead mt-2">How to configure zapier webhooks.</p>

      <p className="text-base mt-2">
        We currently only support receive notification via Zapier via webhooks. In order to configure a Zapier webhook,
        you will need to create a new Zap and select the webhook trigger. You will then be provided with a webhook URL
        that you can copy and paste into the webhook URL field in the receive notification configuration.
      </p>
      <p className="text-base link text-blue-500 mt-2">
        <a
          target="_blank"
          rel="noreferrer"
          href="https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks"
        >
          Here is the official Zapier documentation on how to trigger Zaps from webhooks.
        </a>
      </p>
      <p className="text-base mt-2">
        The data we send to the webhook is a JSON object with the following structure:
        <pre className="bg-gray-100 p-2 rounded-md mt-2">
          {`{
  "receiveResponseLink": "https://2secured.com/rr/123/456#password"
}`}
        </pre>
      </p>
      <p className="text-base mt-2">
        Once you have configured the webhook, you can test it by filling out the receive form at the link generated by
        the receive form builder. The links that are sent to the webhook are unique to each receive response and are
        only valid for 30 days. The webhooks are invoked from the browser of the respondent, and the password that is
        used to encrypt and decrypt the response is included in the URL fragment. This means that the password is never
        sent to the backend server, and can only be accessed by you via the zapier webhook.
      </p>

      <Link className="text-base text-blue-500" to={"https://tally.so/r/w7D9oz"} target="_blank" rel="noreferrer">
        Let us know if you would like more webhooks supported!
      </Link>
    </div>
  );
}
