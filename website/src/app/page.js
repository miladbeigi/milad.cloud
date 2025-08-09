import Link from "next/link";
import Image from "next/image";
import projects from "@/data/projects";
import posts from "@/data/posts";
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
    case "github":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58l-.01-2.04c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.32-1.74-1.32-1.74-1.08-.74.08-.72.08-.72 1.19.08 1.82 1.23 1.82 1.23 1.06 1.81 2.78 1.29 3.46.99.11-.77.42-1.29.76-1.59-2.67-.31-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.23-3.23-.12-.3-.53-1.55.12-3.23 0 0 1-.32 3.3 1.23a11.43 11.43 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.68.24 2.93.12 3.23.76.84 1.23 1.9 1.23 3.23 0 4.63-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58A12 12 0 0012 .5z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M20.45 20.45h-3.55v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85v5.5H9.49V9h3.4v1.56h.05c.47-.9 1.6-1.85 3.29-1.85 3.52 0 4.17 2.32 4.17 5.35v6.4zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    default:
      return null;
  }
}
