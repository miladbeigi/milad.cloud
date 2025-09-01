export const dynamic = "force-static";
import posts from "@/content/postsIndex";

export default function sitemap() {
  const base = "";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about/` },
    { url: `${base}/projects/` },
    { url: `${base}/blog/` },
    ...posts
      .filter((p) => p.published)
      .map(({ Component, ...meta }) => ({ url: `${base}/blog/${meta.slug}/` })),
  ];
}