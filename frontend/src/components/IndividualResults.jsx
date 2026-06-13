import { useState } from "react";
import { fetchIndividualResults } from "../lib/api";
import ResultPageShell, { ResultButton, ShellInput } from "./ResultPageShell";
import { StudentSummary, SubjectsTable } from "./ResultDisplay";

export default function IndividualResults({ title = "Academic Result" }) {
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

  return (
    <ResultPageShell
      title={title}
      error={error}
      loading={loading}
      results={
        data && (
          <div id="results-output" className="space-y-4">
            <StudentSummary data={data} />
            <SubjectsTable subjects={data.subjects} />
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ShellInput id="hallTicket" value={hallTicket} onChange={(e) => setHallTicket(e.target.value.toUpperCase())} />
        <ResultButton loading={loading} />
      </form>
    </ResultPageShell>
  );
}
