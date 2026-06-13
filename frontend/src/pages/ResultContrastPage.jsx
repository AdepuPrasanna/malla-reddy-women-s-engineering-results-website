import { useState } from "react";
import { fetchIndividualResults } from "../lib/api";
import ResultPageShell, { ResultButton, ShellInput } from "../components/ResultPageShell";

export default function ResultContrastPage() {
  const [ticketA, setTicketA] = useState("");
  const [ticketB, setTicketB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const a = ticketA.trim().toUpperCase();
    const b = ticketB.trim().toUpperCase();
    if (!a || !b) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const [dataA, dataB] = await Promise.all([fetchIndividualResults(a), fetchIndividualResults(b)]);
      setResults({ a: dataA, b: dataB });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const cgpaDiff =
    results?.a?.cgpa && results?.b?.cgpa
      ? (parseFloat(results.a.cgpa) - parseFloat(results.b.cgpa)).toFixed(2)
      : null;

  return (
    <ResultPageShell
      title="Result Contrast"
      error={error}
      loading={loading}
      results={
        results && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {[results.a, results.b].map((r) => (
                <div key={r.hallTicket} className="card p-5">
                  <h3 className="font-display text-lg font-bold">{r.studentName || "Student"}</h3>
                  <p className="text-sm text-brand-400">{r.hallTicket}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <dt className="text-xs text-[rgb(var(--text-muted))]">CGPA</dt>
                      <dd className="font-display text-xl font-bold text-brand-300">{r.cgpa || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[rgb(var(--text-muted))]">Credits</dt>
                      <dd className="font-display text-xl font-bold">
                        {r.creditsObtained && r.creditsTotal ? `${r.creditsObtained}/${r.creditsTotal}` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[rgb(var(--text-muted))]">Due</dt>
                      <dd className="font-display text-xl font-bold">{r.subjectsDue ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            {cgpaDiff != null && (
              <div className="card p-4 text-center text-sm">
                CGPA difference (first − second):{" "}
                <span className={`font-display text-lg font-bold ${parseFloat(cgpaDiff) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {parseFloat(cgpaDiff) > 0 ? "+" : ""}
                  {cgpaDiff}
                </span>
              </div>
            )}
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ShellInput
            id="ticketA"
            value={ticketA}
            onChange={(e) => setTicketA(e.target.value.toUpperCase())}
            placeholder="Enter first hallticket no"
          />
          <ShellInput
            id="ticketB"
            value={ticketB}
            onChange={(e) => setTicketB(e.target.value.toUpperCase())}
            placeholder="Enter second hall ticket no"
          />
        </div>
        <ResultButton loading={loading} />
      </form>
    </ResultPageShell>
  );
}