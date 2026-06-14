import { Badge } from "@/shared/components/ui/Badge";
import type { ResultMeta } from "@/shared/types/results";

export function CacheBadge({ meta }: { meta?: ResultMeta }) {
  if (!meta?.cached) return null;

  const parts = ["Cached from Firebase"];
  if (meta.responseMs != null) parts.push(`${meta.responseMs}ms`);
  if (meta.cachedAt) parts.push(new Date(meta.cachedAt).toLocaleString());

  return <Badge variant="default">{parts.join(" · ")}</Badge>;
}
