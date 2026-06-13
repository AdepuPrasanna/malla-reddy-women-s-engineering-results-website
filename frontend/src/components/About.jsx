export default function About() {
  const stats = [
    { value: "5,000+", label: "Students Served" },
    { value: "99.9%", label: "Accuracy" },
    { value: "24/7", label: "Available" },
  ];

  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <article className="card px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="section-title gradient-text">About MRECW Results</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[rgb(var(--text-muted))]">
            MRECW Results is a dedicated academic results platform built for students of Malla Reddy Engineering College
            for Women. We provide fast, reliable access to exam results, CGPA calculations, and class performance
            analytics — designed to help you stay on top of your academic journey.
          </p>

          <dl className="mt-10 grid gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-3xl font-extrabold gradient-text sm:text-4xl">{stat.value}</dt>
                <dd className="mt-1 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--text-muted))]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
