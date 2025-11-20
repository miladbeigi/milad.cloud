import posts from "@/content/postsIndex";
import BlogIndexClient from "@/components/BlogIndexClient";

export const metadata = { title: "Blog – Milad Beigi" };

export default function BlogIndex() {
  const allPosts = posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(({ Component, ...meta }) => meta);

  return (
    <main className="pb-16">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <BlogIndexClient posts={allPosts} />
    </main>
  );
}