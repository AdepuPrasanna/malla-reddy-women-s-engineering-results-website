import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { adminLogin, verifyAdminSession } from "@/shared/lib/adminApi";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    verifyAdminSession().then((ok) => {
      if (ok) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary-light">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-muted">MRECW Results Portal control panel</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            </div>
            {error && <div className="rounded-btn border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
