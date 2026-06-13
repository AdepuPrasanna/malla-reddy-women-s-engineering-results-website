import { useState } from "react";
import { exportClassCsv, streamClassResults } from "../lib/api";
import ResultPageShell, { ResultButton, ShellInput } from "../components/ResultPageShell";

const ROLL_DIGITS = 2;
const END_ROLL = 60;

export default function ClassResultPage() {
  const [hallTicket, setHallTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [data, setData] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const ticket = hallTicket.trim().toUpperCase();
    if (ticket.length < ROLL_DIGITS + 1) return;

    const prefix = ticket.slice(0, -ROLL_DIGITS);

    setLoading(true);
    setError("");
    setData(null);
    setProgress({ pct: 0, text: "Preparing class fetch…" });

    try {
      await streamClassResults(
        {
          prefix,
          sampleTicket: ticket,
          startRoll: 1,
          endRoll: END_ROLL,
          rollDigits: ROLL_DIGITS,
        },
        (event) => {
          if (event.type === "progress") {
            setProgress({
              pct: Math.round((event.current / event.total) * 100),
              text: `Checking ${event.hallTicket} (${event.current}/${event.total})`,
            });
          }
          if (event.type === "done") {
            setData(event.result);
            setProgress(null);
          }
        }
      );
    } catch (err) {
      setError(err.message);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResultPageShell
      title="Class Result"
      disclaimer="Class fetch may take several minutes depending on section size."
      error={error}
      loading={loading}
      loadingMessage={progress?.text || "Fetching class results…"}
      results={
        data && (
          <div id="class-output" className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              {data.students?.length > 0 && (
                <button type="button" className="btn-secondary" onClick={() => exportClassCsv(data)}>
                  Export CSV
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Students Found", value: data.successCount },
                { label: "Failed", value: data.failedCount },
                { label: "Class Avg CGPA", value: data.classAverageCgpa ?? "—" },
                { label: "Section", value: data.prefix },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <div className="text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-brand-300">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[rgb(var(--border)/0.08)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border)/0.08)] bg-[rgb(var(--border)/0.04)] text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Hall Ticket</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">CGPA</th>
                    <th className="px-4 py-3">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s, i) => (
                    <tr key={s.hallTicket} className="border-b border-[rgb(var(--border)/0.04)]">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.hallTicket}</td>
                      <td className="px-4 py-3">{s.studentName || "—"}</td>
                      <td className="px-4 py-3 font-bold text-brand-300">{s.cgpa || "—"}</td>
                      <td className="px-4 py-3">
                        {s.creditsObtained && s.creditsTotal ? `${s.creditsObtained}/${s.creditsTotal}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ShellInput id="classTicket" value={hallTicket} onChange={(e) => setHallTicket(e.target.value.toUpperCase())} />
        <ResultButton loading={loading} />
      </form>
    </ResultPageShell>
  );
}
