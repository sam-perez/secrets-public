import { SendEmailCommand,SESClient } from "@aws-sdk/client-ses";

// Create an SES client
const s3Client = new SESClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.VERCEL_MARKETING_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.VERCEL_MARKETING_AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Sends an email using SES.
 */
export async function sendEmail({
  from,
  to,
  subject,
  body,
}: {
  from: string;
  to: string;
  subject: string;
  body: string;
}) {
  const params = {
    Source: from,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Text: {
          Data: body,
        },
      },
    },
  };

  return await s3Client.send(new SendEmailCommand(params));
}

/**
const emailResponse = await sendEmail({
  to: "samuel.e.perez@gmail.com",
  from: "support@2secured.link",
  subject: "Test Email",
  body: "This is a test email. The code is: 123123",
});

Email response: {
  '$metadata': {
    httpStatusCode: 200,
    requestId: 'bd37782e-3322-44dc-84e5-0bd8055e2bb3',
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0
  },
  MessageId: '0100018fa90f3ab7-055b34d1-30e6-42cb-a555-4672da573c6c-000000'
}
*/
