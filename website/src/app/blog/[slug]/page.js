import Link from "next/link";
import posts from "@/content/postsIndex";

export function generateStaticParams() {
  return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return { title: `${post?.title || "Post"} – Milad Beigi` };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const index = posts.findIndex((p) => p.slug === slug);
  const post = posts[index];
  const prev = posts[index + 1];
  const next = posts[index - 1];

  if (!post) {
    return (
      <main className="pb-16">
        <h1 className="text-2xl font-semibold">Not found</h1>
      </main>
    );
  }

  return (
    <main className="prose prose-neutral max-w-none pb-16">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">{new Date(post.date).toDateString()}</p>
      <article className="mt-6">
        <post.Component />
      </article>

      <hr className="my-10" />
      <div className="flex items-center justify-between text-sm">
        <div>
          {prev && (
            <Link href={`/blog/${prev.slug}/`} className="hover:underline">
              ← {prev.title}
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link href={`/blog/${next.slug}/`} className="hover:underline">
              {next.title} →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}