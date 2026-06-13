import { BellIcon, MenuIcon, MoonIcon, SunIcon } from "../components/Icons";

export default function TopBar({ theme, onToggleTheme, onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[rgb(var(--border)/0.08)] bg-[rgb(var(--surface)/0.95)] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg p-2 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--border)/0.06)] lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <span className="font-display text-base font-bold tracking-wide lg:text-lg">MRECW Results</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://mrecwexamcell.vercel.app/"
          className="hidden rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10 sm:inline-flex sm:items-center sm:gap-1.5"
        >
          <span aria-hidden="true">▶</span> Get the App
        </a>
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border)/0.1)] transition hover:bg-[rgb(var(--border)/0.06)]"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border)/0.1)] text-[rgb(var(--text-muted))] transition hover:bg-[rgb(var(--border)/0.06)]"
          aria-label="Notifications"
        >
          <BellIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
