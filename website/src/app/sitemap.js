export const dynamic = "force-static";

export default function sitemap() {
  const base = "https://milad.cloud";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/projects/` },
  ];
}
