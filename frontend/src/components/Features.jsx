import { ChartIcon, MedalIcon, UsersIcon, BoltIcon } from "./Icons";

const FEATURES = [
  {
    Icon: ChartIcon,
    title: "CGPA Calculator",
    desc: "Instantly calculate and view your cumulative grade point average with detailed semester breakdowns.",
  },
  {
    Icon: MedalIcon,
    title: "Performance Analysis",
    desc: "Track your academic progress across semesters with clear subject grades and credit summaries.",
  },
  {
    Icon: UsersIcon,
    title: "Class Rankings",
    desc: "Compare your performance with classmates through section-wide CGPA rankings and class averages.",
  },
  {
    Icon: BoltIcon,
    title: "Instant Results",
    desc: "Get your complete overall marks and grades within seconds — no account or login required.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-[rgb(var(--border)/0.06)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Everything You Need</h2>
          <p className="mt-3 text-[rgb(var(--text-muted))]">
            Powerful tools designed for MRECW students to track, analyze, and understand academic performance.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <article
              key={title}
              className="card group p-6 transition hover:border-brand-500/25 hover:shadow-glow"
            >
              <div className="feature-icon transition group-hover:bg-brand-600/30 group-hover:text-brand-300">
                <Icon />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-muted))]">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
