import { LoaderFunction } from "@remix-run/node";
import { downloadFromS3 } from "../lib/s3";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    throw new Response("Key is required", { status: 400 });
  }

  try {
    const { data } = await downloadFromS3({ bucket: "MARKETING_BUCKET", key });
    return new Response(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${key}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
