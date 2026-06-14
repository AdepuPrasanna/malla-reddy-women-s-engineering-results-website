import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import type { CreditsProfile } from "@/shared/types/results";

interface CreditsProfileCardProps {
  profile: CreditsProfile;
  label: string;
}

export function CreditsProfileCard({ profile, label }: CreditsProfileCardProps) {
  const obtained = parseFloat(profile.creditsObtained || "0") || 0;
  const total = parseFloat(profile.creditsTotal || "1") || 1;
  const remaining = profile.creditsRemaining ?? Math.max(total - obtained, 0);
  const pct = profile.completionPercent ?? (total ? Math.round((obtained / total) * 100) : 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-light">{label}</p>
        <h3 className="font-display text-xl font-bold">{profile.studentName || "Student"}</h3>
        <p className="text-sm text-muted">{profile.hallTicket}{profile.branch ? ` · ${profile.branch}` : ""}</p>
      </div>

      <Card className="text-center">
        <div className="font-display text-4xl font-extrabold gradient-text sm:text-5xl">
          {profile.creditsObtained}/{profile.creditsTotal}
        </div>
        <p className="mt-2 text-sm text-muted">Credits earned vs required</p>
        <div className="mx-auto mt-6 h-3 max-w-lg overflow-hidden rounded-full bg-foreground/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
          />
        </div>
        <p className="mt-2 text-sm font-semibold text-primary-light">{pct}% complete</p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Remaining", value: remaining },
          { label: "Subjects Due", value: profile.subjectsDue ?? "—" },
          { label: "CGPA", value: profile.cgpa || "—" },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
            <div className="mt-2 font-display text-xl font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

      {profile.subjects && profile.subjects.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-foreground/10 px-4 py-3">
            <h4 className="font-display text-sm font-semibold">Subject Credits</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/5 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {profile.subjects.map((sub) => (
                  <tr key={`${sub.sno}-${sub.code}`} className="border-b border-foreground/5">
                    <td className="px-4 py-3 font-mono text-xs">{sub.code}</td>
                    <td className="px-4 py-3">{sub.name}</td>
                    <td className="px-4 py-3">{sub.credits || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sub.status === "P" ? "success" : sub.status === "F" ? "error" : "default"}>
                        {sub.status || "—"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
