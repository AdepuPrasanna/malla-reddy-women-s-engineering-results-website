import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Database,
  HardDriveDownload,
  RefreshCw,
  Search,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { fetchAdminStats, streamHardScrape } from "@/shared/lib/adminApi";

interface ScrapeLogEntry {
  id: string;
  type: "updated" | "unchanged" | "failed";
  hallTicket: string;
  message?: string;
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [scrapeLogs, setScrapeLogs] = useState<ScrapeLogEntry[]>([]);
  const [scrapeProgress, setScrapeProgress] = useState<{ current: number; total: number; ticket?: string } | null>(null);
  const [scrapeSummary, setScrapeSummary] = useState<{ updated: number; unchanged: number; failed: number; total: number } | null>(null);
  const logId = useRef(0);

  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    refetchInterval: (q) => (q.state.data?.hardScrapeRunning ? 3000 : false),
  });

  const hardScrape = useMutation({
    mutationFn: async () => {
      setScrapeLogs([]);
      setScrapeSummary(null);
      setScrapeProgress(null);

      await streamHardScrape((event) => {
        const type = event.type as string;

        if (type === "start") {
          setScrapeProgress({ current: 0, total: (event.total as number) || 0 });
        } else if (type === "progress") {
          setScrapeProgress({
            current: event.current as number,
            total: event.total as number,
            ticket: event.hallTicket as string,
          });
        } else if (type === "updated" || type === "unchanged" || type === "failed") {
          logId.current += 1;
          setScrapeLogs((prev) => [
            {
              id: String(logId.current),
              type: type as ScrapeLogEntry["type"],
              hallTicket: event.hallTicket as string,
              message: type === "failed" ? (event.error as string) : undefined,
            },
            ...prev.slice(0, 49),
          ]);
        } else if (type === "done") {
          setScrapeSummary({
            updated: (event.updated as number) || 0,
            unchanged: (event.unchanged as number) || 0,
            failed: (event.failed as number) || 0,
            total: (event.total as number) || 0,
          });
          setScrapeProgress(null);
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        } else if (type === "error") {
          throw new Error((event.message as string) || "Hard scrape failed");
        }
      });
    },
  });

  const statCards = [
    { label: "Stored Students", value: stats?.storedStudents ?? 0, icon: Users, color: "text-primary-light" },
    { label: "Total Searches", value: stats?.totalSearches ?? 0, icon: Search, color: "text-accent" },
    { label: "Unique Students Searched", value: stats?.uniqueStudentsSearched ?? 0, icon: Database, color: "text-success" },
    { label: "Stored Backlogs", value: stats?.storedBacklogs ?? 0, icon: HardDriveDownload, color: "text-warning" },
  ];

  const isScraping = hardScrape.isPending || stats?.hardScrapeRunning;

  const handleHardScrape = useCallback(() => {
    if (!window.confirm("Start hard scrape for all stored hall tickets? This may take a long time.")) return;
    hardScrape.mutate();
  }, [hardScrape]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted">Monitor portal usage and refresh cached student data</p>
        </div>
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 inline h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {!stats?.firebaseEnabled && (
        <div className="flex items-center gap-3 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Firebase is not configured on the backend. Stats and hard scrape require Firestore.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">{isLoading ? "—" : card.value.toLocaleString()}</div>
                <div className="text-sm text-muted">{card.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold">Cache Collections</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-foreground/5 pb-2">
              <dt className="text-muted">Class Results</dt>
              <dd className="font-mono">{stats?.storedClassResults ?? 0}</dd>
            </div>
            <div className="flex justify-between border-b border-foreground/5 pb-2">
              <dt className="text-muted">Result Compares</dt>
              <dd className="font-mono">{stats?.storedResultCompares ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Credits Compares</dt>
              <dd className="font-mono">{stats?.storedCreditsCompares ?? 0}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Hard Scrape</h2>
          <p className="mt-2 text-sm text-muted">
            Re-scrape every hall ticket stored in Firebase. Updated records are saved; unchanged records are skipped.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleHardScrape}
              loading={hardScrape.isPending}
              disabled={!stats?.firebaseEnabled || !!isScraping}
            >
              <HardDriveDownload className="mr-2 inline h-4 w-4" />
              Hard Scrape
            </Button>
            {stats?.hardScrapeRunning && <Badge variant="warning">Running on server</Badge>}
          </div>

          {scrapeProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Progress</span>
                <span className="font-mono">
                  {scrapeProgress.current} / {scrapeProgress.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: scrapeProgress.total
                      ? `${(scrapeProgress.current / scrapeProgress.total) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              {scrapeProgress.ticket && (
                <p className="font-mono text-xs text-muted">Current: {scrapeProgress.ticket}</p>
              )}
            </div>
          )}

          {scrapeSummary && (
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-4 w-4" /> {scrapeSummary.updated} updated
              </span>
              <span className="flex items-center gap-1 text-muted">
                <CheckCircle2 className="h-4 w-4" /> {scrapeSummary.unchanged} unchanged
              </span>
              <span className="flex items-center gap-1 text-error">
                <XCircle className="h-4 w-4" /> {scrapeSummary.failed} failed
              </span>
            </div>
          )}

          {hardScrape.isError && (
            <p className="mt-3 text-sm text-error">{(hardScrape.error as Error).message}</p>
          )}
        </Card>
      </div>

      {scrapeLogs.length > 0 && (
        <Card>
          <h2 className="font-display text-lg font-semibold">Scrape Activity</h2>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
            {scrapeLogs.map((entry) => (
              <li key={entry.id} className="flex items-center gap-2 font-mono">
                {entry.type === "updated" && <Badge variant="success">updated</Badge>}
                {entry.type === "unchanged" && <Badge>unchanged</Badge>}
                {entry.type === "failed" && <Badge variant="error">failed</Badge>}
                <span>{entry.hallTicket}</span>
                {entry.message && <span className="truncate text-error">— {entry.message}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
