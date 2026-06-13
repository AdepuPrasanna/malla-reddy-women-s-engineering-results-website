export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgb(var(--border)/0.06)] py-10">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          {["Privacy Policy", "Terms of Service", "Disclaimer", "Contact Us"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[rgb(var(--text-muted))] transition hover:text-brand-400"
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs text-[rgb(var(--text-muted))]">
          © {year} MRECW Results · Malla Reddy Engineering College for Women · Hyderabad
        </p>
      </div>
    </footer>
  );
}
