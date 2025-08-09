"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

const PAGE_SIZE = 5;

export default function BlogIndexClient({ posts }) {
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState("all");

  const tags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return ["all", ...Array.from(set).sort()];
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => activeTag === "all" || p.tags?.includes(activeTag));
  }, [posts, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTag(t);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm ${
              activeTag === t
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="mt-8 space-y-4">
        {pageItems.map((p) => (
          <li key={p.slug} className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/blog/${p.slug}/`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <div className="text-sm text-gray-500">{new Date(p.date).toDateString()}</div>
            </div>
            <div className="shrink-0 text-sm text-gray-500">{p.readingTime} min</div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-md border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
        >
          Prev
        </button>
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded-md border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}