import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Loader2, TrendingUp } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { fetchResults, queryKeys } from "@/shared/lib/api";
import type { ClassStudent } from "@/shared/types/results";

interface ClassStudentCardProps {
  student: ClassStudent;
  rank: number;
}

export function ClassStudentCard({ student, rank }: ClassStudentCardProps) {
  const hasSubjects = (student.subjects?.length ?? 0) > 0;

  const { data: fetched, isLoading } = useQuery({
    queryKey: queryKeys.results(student.hallTicket),
    queryFn: () => fetchResults(student.hallTicket),
    enabled: !hasSubjects,
    staleTime: 30 * 60 * 1000,
  });

  const detail = hasSubjects
    ? student
    : fetched && !fetched.error
      ? { ...student, ...fetched, subjects: fetched.subjects }
      : student;

  const subjects = detail.subjects || [];
  const passed = subjects.filter((s) => s.status === "P").length;
  const failed = subjects.filter((s) => s.status === "F").length;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-br from-primary/15 via-transparent to-transparent px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 font-display font-bold text-primary-light">
              {rank}
            </div>
            <div className="flex items-start gap-3">
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary-light sm:flex">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold">{student.studentName || "Student"}</h4>
                <p className="mt-0.5 font-mono text-xs text-primary-light">{student.hallTicket}</p>
                {student.branch && <p className="mt-1 text-sm text-muted">{student.branch}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {subjects.length > 0 && (
                    <>
                      <Badge variant="success">{passed} Passed</Badge>
                      {failed > 0 && <Badge variant="error">{failed} Backlogs</Badge>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "CGPA", value: student.cgpa || "—" },
              { label: "Percentage", value: student.percentage || "—" },
              {
                label: "Credits",
                value:
                  student.creditsObtained && student.creditsTotal
                    ? `${student.creditsObtained}/${student.creditsTotal}`
                    : "—",
              },
              {
                label: "Due",
                value:
                  student.subjectsDue != null && student.subjectsTotal != null
                    ? `${student.subjectsDue}/${student.subjectsTotal}`
                    : "—",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-center"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted">{stat.label}</div>
                <div className="mt-1 font-display text-lg font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-foreground/10 px-4 py-4 sm:px-6">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary-light" />
          <span className="text-sm font-semibold">Subject Performance</span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading full marksheet…
          </div>
        )}

        {!isLoading && subjects.length === 0 && (
          <p className="py-4 text-sm text-muted">No subject marks available for this student.</p>
        )}

        {subjects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/5 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Grades</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={`${sub.sno}-${sub.code}`} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                    <td className="px-4 py-3">{sub.sno}</td>
                    <td className="px-4 py-3 font-mono text-xs">{sub.code}</td>
                    <td className="px-4 py-3">{sub.name}</td>
                    <td className="px-4 py-3">
                      {(sub.grades || []).map((g) => (
                        <Badge key={g} variant={g === "F" ? "error" : "primary"} className="mr-1">
                          {g}
                        </Badge>
                      ))}
                    </td>
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
        )}
      </div>
    </Card>
  );
}
