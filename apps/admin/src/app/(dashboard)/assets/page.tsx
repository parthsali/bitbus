"use client";

import { FileVideo, ImageIcon, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface Asset {
  id: string;
  user_id: string;
  name: string;
  filename: string;
  gcs_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  owner_email: string | null;
  owner_name: string | null;
  url: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Asset | null>(null);

  useEffect(() => {
    apiFetch("/admin/assets")
      .then((r) => r.json())
      .then((d) => {
        setAssets(d.data ?? []);
        setLoading(false);
      });
  }, []);

  const totalSize = assets.reduce((sum, a) => sum + a.size_bytes, 0);

  async function deleteAsset(asset: Asset) {
    if (!confirm(`Delete asset "${asset.name}"?`)) return;
    const res = await apiFetch(`/admin/assets/${asset.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      setPreview(null);
      toast.success(`Asset "${asset.name}" deleted`);
    }
  }

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      (a.owner_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-8 py-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Assets</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All uploaded assets across users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{assets.length} files</Badge>
          <Badge variant="outline">{formatBytes(totalSize)}</Badge>
        </div>
      </div>

      <div className="px-8 py-6">
        <Input
          placeholder="Search by name, filename, or owner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />

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
            {filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No assets found.
              </div>
            ) : (
              filtered.map((asset, i) => {
                const isImage = asset.mime_type.startsWith("image/");
                const isVideo = asset.mime_type.startsWith("video/");
                const Icon = isVideo ? FileVideo : ImageIcon;
                return (
                  <div
                    key={asset.id}
                    className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    {isImage && asset.url ? (
                      <button
                        type="button"
                        className="size-10 shrink-0 overflow-hidden rounded-md bg-muted"
                        onClick={() => setPreview(asset)}
                      >
                        <img
                          src={asset.url}
                          alt={asset.filename}
                          className="size-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted"
                        onClick={() => asset.url && setPreview(asset)}
                      >
                        <Icon className="size-4 text-muted-foreground" />
                      </button>
                    )}

                    <button
                      type="button"
                      className="flex min-w-0 flex-1 flex-col text-left"
                      onClick={() => asset.url && setPreview(asset)}
                    >
                      <p className="truncate text-sm font-medium">
                        {asset.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {asset.owner_name ?? "Unknown"} &middot;{" "}
                        {asset.filename}
                      </p>
                    </button>

                    <Badge variant="outline" className="text-xs">
                      {asset.mime_type}
                    </Badge>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatBytes(asset.size_bytes)}
                    </span>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteAsset(asset)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {preview && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreview(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreview(null)}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation on modal content */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled on parent */}
          <div
            className="relative mx-4 max-h-[85vh] max-w-3xl overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {preview.filename}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {preview.owner_name ?? "Unknown"} &middot;{" "}
                  {formatBytes(preview.size_bytes)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteAsset(preview)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setPreview(null)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center p-4">
              {preview.mime_type.startsWith("video/") ? (
                // biome-ignore lint/a11y/useMediaCaption: user-uploaded content has no captions
                <video
                  src={preview.url}
                  controls
                  className="max-h-[70vh] rounded"
                />
              ) : (
                <img
                  src={preview.url}
                  alt={preview.filename}
                  className="max-h-[70vh] rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
