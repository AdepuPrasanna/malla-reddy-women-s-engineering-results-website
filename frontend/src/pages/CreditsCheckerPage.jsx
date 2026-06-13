import { useState } from "react";
import { fetchIndividualResults } from "../lib/api";
import ResultPageShell, { ResultButton, ShellInput } from "../components/ResultPageShell";

export default function CreditsCheckerPage() {
  const [hallTicket, setHallTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const ticket = hallTicket.trim().toUpperCase();
    if (!ticket) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      setData(await fetchIndividualResults(ticket));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const obtained = parseFloat(data?.creditsObtained) || 0;
  const total = parseFloat(data?.creditsTotal) || 0;
  const remaining = total > obtained ? total - obtained : 0;
  const pct = total ? Math.round((obtained / total) * 100) : 0;

  return (
    <ResultPageShell title="Credits Checker" error={error} loading={loading}
      results={
        data && (
          <div className="space-y-4">
            <div className="card p-6 text-center">
              <p className="text-sm text-[rgb(var(--text-muted))]">{data.studentName} · {data.hallTicket}</p>
              <div className="mt-4 font-display text-5xl font-extrabold text-brand-300">
                {data.creditsObtained}/{data.creditsTotal}
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">Credits Obtained / Total Required</p>
              <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-[rgb(var(--border)/0.1)]">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "CGPA", value: data.cgpa || "—" },
                { label: "Remaining Credits", value: remaining || "0" },
                { label: "Subjects Due", value: data.subjectsDue ?? "—" },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <div className="text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">{s.label}</div>
                  <div className="mt-1 font-display text-xl font-bold text-brand-300">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ShellInput id="creditsTicket" value={hallTicket} onChange={(e) => setHallTicket(e.target.value.toUpperCase())} />
        <ResultButton loading={loading} />
      </form>
    </ResultPageShell>
  );
}
