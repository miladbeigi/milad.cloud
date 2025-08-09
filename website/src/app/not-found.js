import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Page not found</h1>
      <p className="mt-4 max-w-prose text-gray-700">
        Sorry, the page you’re looking for doesn’t exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Go back home
        </Link>
        <Link href="/sitemap/" className="text-sm text-blue-600 hover:underline">
          View sitemap
        </Link>
        <Link href="/blog/" className="text-sm text-blue-600 hover:underline">
          Read the blog
        </Link>
        <Link href="/projects/" className="text-sm text-blue-600 hover:underline">
          Browse projects
        </Link>
      </div>
    </main>
  );
}


