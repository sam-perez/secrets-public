import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.VERCEL_MARKETING_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.VERCEL_MARKETING_AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKETS = {
  MARKETING_BUCKET: "secret-sausage-marketing",
} as const;

type BUCKET_OPTIONS = keyof typeof BUCKETS;

/**
 * Uploads a file to S3.
 */
export async function uploadToS3({ bucket, key, body }: { bucket: BUCKET_OPTIONS; key: string; body: Buffer }) {
  const command = new PutObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: key,
    Body: body,
  });

  return await s3Client.send(command);
}

export async function downloadFromS3({ bucket, key }: { bucket: BUCKET_OPTIONS; key: string }) {
  const command = new GetObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: key,
  });

  const { Body } = await s3Client.send(command);

  if (!Body) {
    throw new Error("No body found in response");
  }

  const buffer = await Body.transformToByteArray();

  return {
    data: buffer,
  };
}
