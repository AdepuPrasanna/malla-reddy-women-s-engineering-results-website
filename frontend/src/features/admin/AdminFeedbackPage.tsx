import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
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
    <div className="admin-page">
      <AdminPageHeader
        title="Feedback"
        description="Suggestions submitted from the Help Center"
      />

      {error && <div className="rounded-card border border-error/30 bg-error/10 px-5 py-4 text-sm text-error">{(error as Error).message}</div>}

      {isLoading ? (
        <div className="admin-panel-card py-16 text-center text-muted">Loading feedback…</div>
      ) : items.length === 0 ? (
        <div className="admin-panel-card flex flex-col items-center py-16 text-center text-muted">
          <MessageSquare className="mb-4 h-12 w-12 opacity-40" />
          No feedback submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="admin-panel-card space-y-4">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
