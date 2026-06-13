export default function ResultPageShell({ title, disclaimer, children, error, loading, loadingMessage, results }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <div className="result-shell-card w-full">
        <h1 className="result-shell-title">{title}</h1>
        {children}
      </div>

      {disclaimer && <p className="mt-4 text-center text-sm text-red-400">{disclaimer}</p>}

      {error && (
        <div className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-4 w-full rounded-xl border border-[rgb(var(--border)/0.12)] bg-[rgb(var(--border)/0.04)] px-4 py-3 text-sm text-[rgb(var(--text-muted))]">
          {loadingMessage || "Fetching results… this may take up to 30 seconds."}
        </div>
      )}

      {results && <div className="mt-8 w-full max-w-4xl">{results}</div>}

      <PageFootnotes />
    </div>
  );
}

export function PageFootnotes() {
  return (
    <div className="mt-6 w-full text-center">
      <p className="text-xs leading-relaxed text-[rgb(var(--text-muted))]">
        Results include supplementary / revaluation updates when available.
      </p>
      <p className="text-xs leading-relaxed text-[rgb(var(--text-muted))]">
        Supports hall tickets from recent MRECW batches (R18 and above format).
      </p>
      <div className="my-6 border-t border-[rgb(var(--border)/0.08)]" />
      <p className="text-sm text-[rgb(var(--text-muted))]">
        Join us on{" "}
        <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="font-medium text-sky-400 underline-offset-2 hover:underline">
          Telegram
        </a>
        , thanks!
      </p>
    </div>
  );
}

export function ResultButton({ loading, label = "Result" }) {
  return (
    <button type="submit" className="btn-result" disabled={loading}>
      {loading ? "Loading…" : label}
    </button>
  );
}

export function ShellInput({ id, value, onChange, placeholder = "Enter your hallticket no", className = "" }) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input-shell ${className}`}
      required
      autoComplete="off"
    />
  );
}
