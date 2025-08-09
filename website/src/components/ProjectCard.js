export default function ProjectCard({ project }) {
  return (
    <a
      href={project.url || `/projects/${project.slug}/`}
      className="block rounded-lg border border-gray-200 p-5 transition hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold">{project.title}</h3>
        {project.year && <div className="text-xs text-gray-500">{project.year}</div>}
      </div>
      {project.description && (
        <p className="mt-2 text-sm text-gray-600">{project.description}</p>
      )}
      {project.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </a>
  );
}