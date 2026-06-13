import IndividualResults from "./IndividualResults";
import ClassResults from "./ClassResults";

export default function Hero({ tab, setTab }) {
  return (
    <header className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-950/40 via-surface to-surface" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <p className="gradient-text font-display text-lg font-semibold sm:text-xl">MRECW Results</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Check Your Academic Performance
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[rgb(var(--text-muted))] sm:text-lg">
            Access your MRECW exam results instantly. Calculate CGPA, review semester grades, analyze performance trends,
            and compare class rankings — all in one place.
          </p>
        </div>

        <section id="results" className="card p-6 shadow-glow lg:p-7" aria-labelledby="get-started-title">
          <h2 id="get-started-title" className="font-display text-xl font-bold">
            Get Started
          </h2>

          <div className="mt-4 flex gap-1 rounded-xl border border-[rgb(var(--border)/0.08)] bg-[rgb(var(--surface-elevated)/0.5)] p-1" role="tablist">
            {[
              { id: "individual", label: "Individual" },
              { id: "class", label: "Class Results" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 ${tab === t.id ? "tab-btn tab-btn-active" : "tab-btn tab-btn-inactive"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5" role="tabpanel">
            {tab === "individual" ? <IndividualResults embedded /> : <ClassResults embedded />}
          </div>
        </section>
      </div>
    </header>
  );
}
