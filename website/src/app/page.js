import Link from "next/link";
import Image from "next/image";
import projects from "@/data/projects";
import posts from "@/content/postsIndex";
import social from "@/data/social";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 6);
  const latestPosts = posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <main className="pb-16">
      <Hero />
      <section className="mt-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Featured Projects</h2>
          <Link className="text-sm text-blue-600 hover:underline" href="/projects/">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featuredProjects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <section className="mt-16 flex min-h-[48vh] flex-col items-center justify-center text-center">
      <div className="relative mb-6 h-40 w-40 rounded-full bg-yellow-400">
        <Image
          src="/avatar_new.jpg"
          alt="Milad Beigi"
          fill
          className="rounded-full object-contain p-4"
          sizes="160px"
          priority
        />
      </div>
      <h1 className="text-3xl font-semibold md:text-4xl">Milad Beigi</h1>
      <div className="mt-4 flex items-center gap-5">
        {social.map((profile) => (
          <SocialIcon
            key={profile.name}
            href={profile.url}
            label={profile.name}
            icon={profile.name.toLowerCase()}
          />
        ))}
        <SocialIcon href="https://github.com/miladbeigi" label="GitHub" icon="github" />
        <SocialIcon href="https://linkedin.com/in/miladbeigi" label="LinkedIn" icon="linkedin" />
        <SocialIcon href="https://instagram.com/milad_beigiii" label="Instagram" icon="instagram" />
      </div>
    </section>
  );
}

function SocialIcon({ href, label, icon }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="text-gray-700 transition hover:text-gray-900"
      target="_blank"
      rel="noreferrer"
    >
      <span className="sr-only">{label}</span>
      <Icon name={icon} className="h-6 w-6" />
    </a>
  );
}

function Icon({ name, className }) {
  const props = { className: `${className} fill-current` };
  switch (name) {
    case "x":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.218-6.817-5.976 6.817h-3.308l7.732-8.835L.424 2.25h6.852l4.95 6.464 5.518-6.464zM17.534 20.766h1.828L6.455 3.812H4.529l13.005 16.954z" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58l-.01-2.04c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.32-1.74-1.32-1.74-1.08-.74.08-.72.08-.72 1.19.08 1.82 1.23 1.82 1.23 1.06 1.81 2.87 1.65 3.55 1.3.06-.82.41-1.64 1.1-2.16 1.04-.65 3.35-1 5.82-1 1.18 0 3.71.13 5.13.39 1.77.34 3.25 1.05 3.96 2.34.22.46.53 1.24 1.01 2.32l.33.82c.7 1.74.77 2.73.77 4.5v2.98c0 .32.22.69.83.58A12 12 0 0012 .5z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M20.45 20.45h-3.55v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85v5.5H9.49V9h3.4v1.56h.05c.47-.9 1.6-1.85 3.29-1.85 3.52 0 4.17 2.32 4.17 5.35v6.4zM5.34 7.43a2.06 2.06 0-1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM3.88 20.45h2.93V9H3.88v11.45zM22.22 0H1.78C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.78 24h20.44c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
        </svg>
      );
    default:
      return null;
  }
}
