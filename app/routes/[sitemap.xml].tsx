import { LoaderFunction } from "@remix-run/node";
import { SEND_BUILDER_TEMPLATES } from "~/components/sends/builder/types";

export const loader: LoaderFunction = async () => {
  const lastModifiedToday = new Date().toISOString();

  //loop through all send templates and add into sitemap
  const sendTemplates = Object.entries(SEND_BUILDER_TEMPLATES)
    .filter(([, template]) => !template.private)
    .map(
      ([slug]) => `
    <url>
    <loc>https://2secured.link/sends/templates/${slug}</loc>
    <lastmod>${lastModifiedToday}</lastmod>
    </url>
    `
    );

  const content = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
      <loc>https://2secured.link/</loc>
      <lastmod>${lastModifiedToday}</lastmod>
      </url>
      <url>
      <loc>https://2secured.link/security</loc>
      <lastmod>${lastModifiedToday}</lastmod>
      </url>
      <url>
      <loc>https://2secured.link/sends/templates</loc>
      <lastmod>${lastModifiedToday}</lastmod>
      </url>
      ${sendTemplates.join("")}
      </urlset>
      `;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
