import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({ activePage, theme, onToggleTheme, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activePage={activePage} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <TopBar theme={theme} onToggleTheme={onToggleTheme} onMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
