import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { fetchAdminFeedback, updateFeedbackStatus } from "@/shared/lib/adminApi";
import type { FeedbackItem } from "@/shared/types/settings";

function statusVariant(status: FeedbackItem["status"]) {
  if (status === "new") return "primary" as const;
  if (status === "resolved") return "success" as const;
  return "default" as const;
}

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: fetchAdminFeedback,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackItem["status"] }) =>
      updateFeedbackStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Feedback</h1>
        <p className="mt-2 text-muted">Suggestions submitted from the Help Center</p>
      </div>

      {error && <div className="text-sm text-error">{(error as Error).message}</div>}

      {isLoading ? (
        <Card className="py-12 text-center text-muted">Loading feedback…</Card>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center py-12 text-center text-muted">
          <MessageSquare className="mb-3 h-10 w-10 opacity-50" />
          No feedback submitted yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                <span className="text-xs text-muted">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.message}</p>
              <div className="flex flex-wrap gap-2">
                {item.status !== "read" && (
                  <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => updateStatus.mutate({ id: item.id, status: "read" })}>
                    Mark Read
                  </Button>
                )}
                {item.status !== "resolved" && (
                  <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => updateStatus.mutate({ id: item.id, status: "resolved" })}>
                    Mark Resolved
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
