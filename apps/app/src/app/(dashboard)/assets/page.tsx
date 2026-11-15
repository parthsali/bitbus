"use client";

import { FileVideo, ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

function getToken() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)bitbus_token=([^;]+)/);
  return m?.[1] ?? "";
}

async function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...opts?.headers,
    },
  });
}

type Asset = {
  id: string;
  name: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
};

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Asset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const r = await apiFetch("/assets");
    if (r.ok) {
      const j = await r.json();
      setAssets(j.data?.assets ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const urlRes = await apiFetch("/assets/upload-url", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, mime_type: file.type }),
      });
      if (!urlRes.ok) {
        const j = await urlRes.json().catch(() => ({}));
        throw new Error(j?.error?.message ?? "Failed to get upload URL");
      }
      const { data } = await urlRes.json();
      const { upload_url, gcs_path } = data as {
        upload_url: string;
        gcs_path: string;
      };

      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error("GCS upload failed");

      await apiFetch("/assets/meta", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          filename: file.name,
          gcs_path: gcs_path,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      });
      toast.success(`${file.name} uploaded`);
      load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  async function remove(id: string) {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    const r = await apiFetch(`/assets/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Asset deleted");
      setPreview(null);
      load();
    } else toast.error("Failed to delete asset");
  }

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full items-center justify-between border-b border-border px-8 py-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Assets</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Images and media files used in your scenes.
          </p>
        </div>
        <Button
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <div className="flex flex-col gap-4 px-8 py-6">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {assets.length > 0 && (
          <Input
            placeholder="Search assets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        )}

        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assets yet. Click <strong>Upload</strong> to add an image or
            video.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No assets match your search.
              </div>
            ) : (
              filtered.map((a) => {
                const isImage = a.mime_type.startsWith("image/");
                const isVideo = a.mime_type.startsWith("video/");
                const Icon = isVideo ? FileVideo : ImageIcon;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
                  >
                    {isImage && a.url ? (
                      <button
                        type="button"
                        className="size-10 shrink-0 overflow-hidden rounded-md bg-muted"
                        onClick={() => setPreview(a)}
                      >
                        <img
                          src={a.url}
                          alt={a.filename}
                          className="size-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="flex flex-1 flex-col gap-0.5 text-left"
                      onClick={() => a.url && setPreview(a)}
                    >
                      <p className="truncate text-sm font-medium">
                        {a.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.mime_type.split("/")[1]?.toUpperCase()} &middot;{" "}
                        {fmtBytes(a.size_bytes)}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
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
              <p className="truncate text-sm font-medium">{preview.filename}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(preview.id)}
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
