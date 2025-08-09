import projects from "@/data/projects";
import ProjectsClient from "@/components/ProjectsClient";

export const metadata = { title: "Projects – Milad Beigi" };

export default function ProjectsPage() {
  return (
    <main className="pb-16">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <ProjectsClient projects={projects} />
    </main>
  );
}