import Link from "next/link";
import posts from "@/data/posts";
import postsContent from "@/content/postsContent";

export function generateStaticParams() {
  return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = posts.find((p) => p.slug === params.slug);
  return { title: `${post?.title || "Post"} – Milad Beigi` };
}

export default function PostPage({ params }) {
  const index = posts.findIndex((p) => p.slug === params.slug);
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
      <article className="mt-6" dangerouslySetInnerHTML={{ __html: markdownToHtml(postsContent[post.slug] || "") }} />

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

function markdownToHtml(md) {
  // Extremely small markdown subset renderer for demo purposes only
  let html = md;
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/\n\n/g, '<p></p>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}