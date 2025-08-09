"use client";
import { useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsClient({ projects }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  const tags = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return ["all", ...Array.from(set).sort()];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesTag = activeTag === "all" || p.tags?.includes(activeTag);
      const matchesQuery = !query || (
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      return matchesTag && matchesQuery;
    });
  }, [projects, activeTag, query]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`rounded-full px-3 py-1 text-sm ${
              activeTag === t
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          className="ml-auto w-full max-w-xs rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}