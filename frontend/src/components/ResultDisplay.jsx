export function StudentSummary({ data }) {
  if (!data) return null;
  return (
    <div className="card flex flex-wrap items-start justify-between gap-6 p-6">
      <div>
        <h3 className="font-display text-2xl font-bold">{data.studentName || "Student"}</h3>
        <p className="mt-1 font-medium text-brand-400">{data.hallTicket}</p>
        {data.branch && <p className="text-sm text-[rgb(var(--text-muted))]">{data.branch}</p>}
      </div>
      <div className="flex gap-6">
        {[
          { label: "CGPA", value: data.cgpa || "—" },
          {
            label: "Credits",
            value: data.creditsObtained && data.creditsTotal ? `${data.creditsObtained}/${data.creditsTotal}` : "—",
          },
          { label: "Due", value: data.subjectsDue != null ? `${data.subjectsDue}/${data.subjectsTotal}` : "—" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">{s.label}</div>
            <div className="font-display text-2xl font-bold text-brand-300">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubjectsTable({ subjects }) {
  if (!subjects?.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[rgb(var(--border)/0.08)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgb(var(--border)/0.08)] bg-[rgb(var(--border)/0.04)] text-left text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Grades</th>
            <th className="px-4 py-3">Credits</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub) => (
            <tr key={`${sub.sno}-${sub.code}`} className="border-b border-[rgb(var(--border)/0.04)] hover:bg-[rgb(var(--border)/0.02)]">
              <td className="px-4 py-3">{sub.sno}</td>
              <td className="px-4 py-3 font-mono text-xs">{sub.code}</td>
              <td className="px-4 py-3">{sub.name}</td>
              <td className="px-4 py-3">
                {(sub.grades || []).map((g) => (
                  <span key={g} className="mr-1 rounded-md bg-brand-600/15 px-2 py-0.5 text-xs text-brand-300">
                    {g}
                  </span>
                ))}
              </td>
              <td className="px-4 py-3">{sub.credits || "—"}</td>
              <td className={`px-4 py-3 font-semibold ${sub.status === "P" ? "text-emerald-400" : sub.status === "F" ? "text-red-400" : ""}`}>
                {sub.status || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
      {message}
    </div>
  );
}

export function LoadingAlert({ message = "Fetching results… this may take up to 30 seconds." }) {
  return (
    <div className="mt-4 rounded-xl border border-[rgb(var(--border)/0.12)] bg-[rgb(var(--border)/0.04)] px-4 py-3 text-sm text-[rgb(var(--text-muted))]">
      {message}
    </div>
  );
}
