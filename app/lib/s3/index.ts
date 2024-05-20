import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";

// Create an S3 client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.VERCEL_MARKETING_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.VERCEL_MARKETING_AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * The buckets that we use in our application.
 */
const BUCKETS = {
  MARKETING_BUCKET: "secret-sausage-marketing",
} as const;

export type BUCKET_OPTIONS = keyof typeof BUCKETS;

/**
 * Uploads a buffer to S3.
 */
export async function uploadToS3({ bucket, key, body }: { bucket: BUCKET_OPTIONS; key: string; body: Buffer }) {
  const command = new PutObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: key,
    Body: body,
  });

  return await s3Client.send(command);
}

/**
 * Downloads a buffer from S3.
 */
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

/**
 * Lists objects in an S3 bucket.
 */
export async function listObjectsInS3({ bucket, prefix }: { bucket: BUCKET_OPTIONS; prefix?: string }) {
  const command = new ListObjectsCommand({
    Bucket: BUCKETS[bucket],
    Prefix: prefix,
  });

  return await s3Client.send(command);
}
