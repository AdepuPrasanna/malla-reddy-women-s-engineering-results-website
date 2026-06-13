import { useEffect, useState } from "react";
import { HomeIcon, HelpIcon, FileIcon, ChevronDownIcon } from "../components/Icons";
import { PAGES, RESULTS_PAGES, isResultsPage, navigateTo } from "../lib/routes";

const TOP_ITEMS = [
  { ...PAGES.home, Icon: HomeIcon },
  { id: "results-group", label: "Results", Icon: FileIcon, isGroup: true },
  { ...PAGES.helpCenter, Icon: HelpIcon },
];

export default function Sidebar({ activePage, mobileOpen, onClose }) {
  const [resultsOpen, setResultsOpen] = useState(isResultsPage(activePage));

  useEffect(() => {
    if (isResultsPage(activePage)) setResultsOpen(true);
  }, [activePage]);

  return (
    <>
      {mobileOpen && (
        <button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-label="Close menu" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[rgb(var(--border)/0.08)] bg-[rgb(var(--surface-elevated)/0.98)] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[rgb(var(--border)/0.08)] px-4 py-4 lg:hidden">
          <span className="text-sm font-bold tracking-wide">MRECW Results</span>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-[rgb(var(--border)/0.06)]" aria-label="Close">
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-4" aria-label="Main navigation">
          {TOP_ITEMS.map((item) => {
            if (item.isGroup) {
              const groupActive = isResultsPage(activePage);
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => setResultsOpen((v) => !v)}
                    className={`sidebar-link w-full ${groupActive ? "text-[rgb(var(--text-primary))]" : ""}`}
                    aria-expanded={resultsOpen}
                  >
                    <item.Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition ${resultsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {resultsOpen && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[rgb(var(--border)/0.08)] pl-2">
                      {RESULTS_PAGES.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            navigateTo(sub.id);
                            onClose?.();
                          }}
                          className={`sidebar-sublink ${activePage === sub.id ? "sidebar-sublink-active" : ""}`}
                          aria-current={activePage === sub.id ? "page" : undefined}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigateTo(item.id);
                  onClose?.();
                }}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <item.Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
