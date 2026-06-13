import { useState } from "react";
import { GradCapIcon, MenuIcon, MoonIcon, SunIcon } from "./Icons";

export default function Navbar({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#results", label: "Results" },
    { href: "#features", label: "Features" },
    { href: "#about", label: "About" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgb(var(--border)/0.08)] bg-[rgb(var(--surface)/0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <a href="/" className="flex items-center gap-3" aria-label="MRECW Results home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
            <GradCapIcon />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">MRECW Results</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border)/0.12)] bg-[rgb(var(--surface-card)/0.5)] px-3 py-2 text-sm font-medium transition hover:bg-[rgb(var(--border)/0.06)]"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-[rgb(var(--text-muted))] transition hover:bg-[rgb(var(--border)/0.06)] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[rgb(var(--border)/0.08)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--border)/0.05)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
