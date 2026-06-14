import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyAdminSession } from "@/shared/lib/adminApi";

export function AdminRoute() {
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");

  useEffect(() => {
    verifyAdminSession().then((ok) => setStatus(ok ? "authed" : "guest"));
  }, []);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-surface text-muted">Checking session…</div>;
  }

  if (status === "guest") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
