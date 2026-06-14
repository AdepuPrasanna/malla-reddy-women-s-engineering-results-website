import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { fetchAdminFooter, saveAdminFooter } from "@/shared/lib/adminApi";
import { queryKeys } from "@/shared/lib/api";
import type { FooterSection } from "@/shared/types/settings";

function newLinkId() {
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function newSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdminFooterPage() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [saved, setSaved] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-footer"],
    queryFn: fetchAdminFooter,
  });

  useEffect(() => {
    if (data?.sections) setSections(structuredClone(data.sections));
  }, [data]);

  const saveFooter = useMutation({
    mutationFn: () => saveAdminFooter(sections),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["admin-footer"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.footer() });
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function updateSection(index: number, patch: Partial<FooterSection>) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSection() {
    setSections((prev) => [...prev, { id: newSectionId(), title: "New Section", links: [] }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addLink(sectionIndex: number) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              links: [...section.links, { id: newLinkId(), label: "New Link", href: "/", external: false }],
            }
          : section
      )
    );
  }

  function updateLink(sectionIndex: number, linkIndex: number, patch: Partial<FooterSection["links"][0]>) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              links: section.links.map((link, j) => (j === linkIndex ? { ...link, ...patch } : link)),
            }
          : section
      )
    );
  }

  function removeLink(sectionIndex: number, linkIndex: number) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex ? { ...section, links: section.links.filter((_, j) => j !== linkIndex) } : section
      )
    );
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Footer Links"
        description="Manage footer sections and links — changes appear on the student portal immediately"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={addSection}>
              <Plus className="mr-2 inline h-4 w-4" />
              Add Section
            </Button>
            <Button onClick={() => saveFooter.mutate()} loading={saveFooter.isPending}>
              <Save className="mr-2 inline h-4 w-4" />
              {saved ? "Saved!" : "Save Footer"}
            </Button>
          </div>
        }
      />

      {error && <div className="rounded-card border border-error/30 bg-error/10 px-5 py-4 text-sm text-error">{(error as Error).message}</div>}
      {saveFooter.isError && <div className="rounded-card border border-error/30 bg-error/10 px-5 py-4 text-sm text-error">{(saveFooter.error as Error).message}</div>}

      {isLoading ? (
        <div className="admin-panel-card py-16 text-center text-muted">Loading footer settings…</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="admin-panel-card space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link2 className="h-5 w-5 text-primary-light" />
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                  placeholder="Section title"
                  className="max-w-xs font-semibold"
                />
                <Button variant="ghost" className="ml-auto text-error" onClick={() => removeSection(sectionIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <div key={link.id} className="grid gap-3 rounded-xl border border-foreground/10 bg-surface-elevated/30 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(sectionIndex, linkIndex, { label: e.target.value })}
                      placeholder="Label"
                    />
                    <Input
                      value={link.href}
                      onChange={(e) => updateLink(sectionIndex, linkIndex, { href: e.target.value })}
                      placeholder="/path or https://..."
                    />
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={!!link.external}
                        onChange={(e) => updateLink(sectionIndex, linkIndex, { external: e.target.checked })}
                      />
                      External
                    </label>
                    <Button variant="ghost" className="text-error" onClick={() => removeLink(sectionIndex, linkIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="secondary" className="text-sm" onClick={() => addLink(sectionIndex)}>
                <Plus className="mr-2 inline h-4 w-4" />
                Add Link
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
