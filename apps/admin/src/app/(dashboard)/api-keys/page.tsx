"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  owner_email: string | null;
  owner_name: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/api-keys")
      .then((r) => r.json())
      .then((d) => {
        setKeys(d.data ?? []);
        setLoading(false);
      });
  }, []);

  async function revokeKey(key: ApiKey) {
    if (!confirm(`Revoke API key "${key.name}" (${key.key_prefix}…)?`)) return;
    const res = await apiFetch(`/admin/api-keys/${key.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== key.id));
      toast.success(`API key "${key.name}" revoked`);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-8 py-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">API Keys</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All API keys across users.
          </p>
        </div>
        <Badge variant="secondary">{keys.length} total</Badge>
      </div>

      <div className="px-8 py-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg border border-border bg-muted/30"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {keys.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No API keys created.
              </div>
            ) : (
              keys.map((key, i) => (
                <div
                  key={key.id}
                  className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium">{key.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {key.owner_name ?? "Unknown"} ({key.owner_email ?? "—"})
                    </p>
                  </div>

                  <span className="text-xs font-mono text-muted-foreground">
                    {key.key_prefix}…
                  </span>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {key.last_used_at
                      ? `Used ${new Date(key.last_used_at).toLocaleDateString()}`
                      : "Never used"}
                  </span>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(key.created_at).toLocaleDateString()}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => revokeKey(key)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
