import experience from "@/data/experience";

export const metadata = { title: "About – Milad Beigi" };

export default function AboutPage() {
  return (
    <main className="pb-16">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="mt-4 max-w-none text-justify text-gray-600">
        Hey, I’m Milad 👋<br/>
        <br />
        With a background in computer engineering. I've worked as a System Administrator, DevOps Engineer and now as a Platform Engineer. My work experience has been focused on the infrastructure and platform side of the software development lifecycle. From traditional infrastructure to modern cloud architectures, I've worked with a variety of technologies and tools to help me build scalable and reliable systems.<br />
        <br /> But my curiosity and passion hasn't been limited to only the infrastructure side, I've always had an urge for building and designing software solutions too. In my academic journey, I've studied Data Analytics and Machine Learning at Polytechnic University of Turin. This has given me a framework to understand the data science and understand how it can be used to solve real problems.<br />
        <br /> I'm always looking for new challenges and opportunities to learn and grow. If you have any questions or want to work together, feel free to reach out.<br />
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Work Experience</h2>
        <ol className="mt-4 space-y-6">
          {experience.map((item) => (
            <li key={item.company} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.role}</div>
                  <div className="text-sm text-gray-600">{item.company}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {item.start} – {item.end}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.summary}</p>
            </li>
          ))}
          <li>
            <a href="https://www.linkedin.com/in/miladbeigi/" className="text-blue-500 hover:underline">
              Find out more about my work experience on LinkedIn
            </a>
          </li>
        </ol>
      </section>
    </main>
  );
}
