import { getCollection } from "astro:content";
import { MAIN_URL, SITE_NAME } from "../../../site.config.mjs";

const escape = (s) =>
  s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c],
  );

export async function GET() {
  const posts = (await getCollection("posts")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const items = posts.map((post) => {
    const link = `${MAIN_URL}/blog/${post.id}/`;
    const description = post.data.subtitle
      ? `<description>${escape(post.data.subtitle)}</description>`
      : "";
    return `<item><title>${escape(post.data.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${post.data.date.toUTCString()}</pubDate>${description}</item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${escape(SITE_NAME)}</title><link>${MAIN_URL}/blog/</link><description>${escape(SITE_NAME)}</description>${items.join("")}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
