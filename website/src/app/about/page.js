import experience from "@/data/experience";

export const metadata = { title: "About – Milad Beigi" };

export default function AboutPage() {
  return (
    <main className="pb-16">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="mt-4 max-w-none text-justify text-gray-600">
      Hey, I’m Milad 👋<br />
      I design and build cloud architectures that are scalable, reliable, and tailored to solve real problems. From mapping out the big picture to fine-tuning the details, I focus on creating solutions that make technology work seamlessly for people and businesses.
      I enjoy tackling complex challenges, simplifying them into clear strategies, and seeing them come to life in production. Outside of work, you’ll find me exploring new tech trends, refining my toolkit, or recharging over a good cup of coffee.
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
