import { LayoutDashboard, Link2, LogOut, MessageSquare, Shield, Users } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { adminLogout } from "@/shared/lib/adminApi";
import { cn } from "@/shared/lib/cn";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/footer", label: "Footer Links", icon: Link2 },
];

export function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    adminLogout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass-nav sticky top-0 z-20 flex h-[72px] items-center justify-between px-4 lg:px-8">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-sm font-bold">MRECW Admin</div>
            <div className="text-xs text-muted">Portal control panel</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/" className="rounded-btn px-3 py-2 text-sm text-muted hover:bg-foreground/5 hover:text-foreground">
            Student Portal
          </Link>
          <button type="button" onClick={handleLogout} className="btn-secondary !px-3 !py-2 text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-content gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition",
                    isActive ? "bg-primary/15 text-primary-light" : "text-muted hover:bg-foreground/5 hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
                    isActive ? "bg-primary/15 text-primary-light" : "bg-foreground/5 text-muted"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
