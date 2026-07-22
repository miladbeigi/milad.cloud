import Link from "next/link";
import Image from "next/image";
import projects from "@/data/projects";
import posts from "@/content/postsIndex";
import social from "@/data/social";
import ProjectCard from "@/components/ProjectCard";
import ThoughtsCarousel from "@/components/ThoughtsCarousel";

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
      <ThoughtsCarousel />
    </section>
  );
}

function SocialIcon({ href, label, icon }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="transition"
      target="_blank"
      rel="noreferrer"
    >
      <span className="sr-only">{label}</span>
      <Icon name={icon} className="h-6 w-6" />
    </a>
  );
}

function Icon({ name, className }) {
  const props = { className };

  switch (name) {
    case "x":
      // Official X logomark (filled)
      return (
        <svg viewBox="0 0 24 24" role="img" aria-label="X" xmlns="http://www.w3.org/2000/svg" {...props}>
          <title>X</title>
          <path fill="#000000" d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
        </svg>
      );
    case "github":
      // Official GitHub filled mark (from SimpleIcons) — reliable sizing
      return (
        <svg role="img" aria-label="GitHub" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}>
          <title>GitHub</title>
          <path fill="#181717" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case "linkedin":
      // LinkedIn - #0A66C2
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props} xmlns="http://www.w3.org/2000/svg">
          <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85v5.5H9.49V9h3.4v1.56h.05c.47-.9 1.6-1.85 3.29-1.85 3.52 0 4.17 2.32 4.17 5.35v6.4zM5.34 7.43a2.06 2.06 0 11.001-4.12 2.06 2.06 0 01-.001 4.12zM3.88 20.45h2.93V9H3.88v11.45z" />
        </svg>
      );
    case "instagram":
      // Instagram glyph with simplified gradient-like fill (best-effort)
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="igGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="50%" stopColor="#e6683c" />
              <stop offset="100%" stopColor="#cc2a8d" />
            </linearGradient>
          </defs>
          <path fill="url(#igGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 7.838a4.162 4.162 0 100 8.324 4.162 4.162 0 000-8.324zm0 6.824a2.662 2.662 0 110-5.324 2.662 2.662 0 010 5.324zM17.8 6.2a.96.96 0 11-1.92 0 .96.96 0 011.92 0z" />
        </svg>
      );
    default:
      return null;
  }
}
