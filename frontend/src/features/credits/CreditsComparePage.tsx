import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { CacheBadge } from "@/shared/components/CacheBadge";
import { CreditsProfileCard } from "@/shared/components/CreditsProfileCard";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ResultSkeleton } from "@/shared/components/ui/Skeleton";
import { fetchCreditsCompare, queryKeys } from "@/shared/lib/api";

export default function CreditsComparePage() {
  const [ticketA, setTicketA] = useState("");
  const [ticketB, setTicketB] = useState("");
  const [submitted, setSubmitted] = useState({ a: "", b: "" });

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.creditsCompare(submitted.a, submitted.b),
    queryFn: () => fetchCreditsCompare(submitted.a, submitted.b),
    enabled: !!submitted.a && !!submitted.b,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted({ a: ticketA.trim().toUpperCase(), b: ticketB.trim().toUpperCase() });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Credits Compare</h1>
        <p className="mt-2 text-muted">Compare credit completion and progression between two students</p>
      </header>

      <Card>
        <form onSubmit={handleCompare} className="grid gap-4 sm:grid-cols-2">
          <Input value={ticketA} onChange={(e) => setTicketA(e.target.value.toUpperCase())} placeholder="First hall ticket" required />
          <Input value={ticketB} onChange={(e) => setTicketB(e.target.value.toUpperCase())} placeholder="Second hall ticket" required />
          <div className="sm:col-span-2">
            <Button type="submit" loading={isFetching && !data} className="sm:w-auto">Compare Credits</Button>
          </div>
        </form>
      </Card>

      {error && <div className="rounded-card border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{(error as Error).message}</div>}
      {isLoading && <ResultSkeleton />}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <CacheBadge meta={data._meta} />

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Credits Summary</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.comparison.creditsDifference != null && (
                <Card className="flex flex-col items-center justify-center text-center lg:col-span-2">
                  <div className="text-xs uppercase tracking-wider text-muted">Credits Earned Difference</div>
                  <div
                    className={`mt-2 font-display text-3xl font-bold ${
                      data.comparison.creditsDifference >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {data.comparison.creditsDifference > 0 ? "+" : ""}
                    {data.comparison.creditsDifference}
                  </div>
                  {data.comparison.completionPercentDifference != null && (
                    <p className="mt-2 text-sm text-muted">
                      Completion gap: {data.comparison.completionPercentDifference > 0 ? "+" : ""}
                      {data.comparison.completionPercentDifference}%
                    </p>
                  )}
                </Card>
              )}
            </div>

            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 bg-foreground/5 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Metric</th>
                    <th className="px-4 py-3">{data.first.hallTicket}</th>
                    <th className="px-4 py-3">{data.second.hallTicket}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comparison.metrics.map((row) => (
                    <tr key={row.label} className="border-b border-foreground/5">
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      <td className="px-4 py-3">{row.first ?? "—"}</td>
                      <td className="px-4 py-3">{row.second ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section className="grid gap-10 lg:grid-cols-2">
            <CreditsProfileCard profile={data.first} label="Student 1" />
            <CreditsProfileCard profile={data.second} label="Student 2" />
          </section>
        </motion.div>
      )}
    </div>
  );
}
