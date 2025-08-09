export const dynamic = "force-static";
import posts from "@/data/posts";

export default function sitemap() {
  const base = "";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about/` },
    { url: `${base}/projects/` },
    { url: `${base}/blog/` },
    ...posts.filter((p) => p.published).map((p) => ({ url: `${base}/blog/${p.slug}/` })),
  ];
}