"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface Device {
  id: string;
  user_id: string;
  name: string;
  agent_version: string | null;
  last_seen_at: string | null;
  created_at: string;
  owner_email: string | null;
  owner_name: string | null;
  is_online: boolean | null;
  display_mode: string | null;
  brightness: number | null;
  cpu_percent: number | null;
  mem_mb: number | null;
  temp_c: number | null;
  uptime_s: number | null;
  wifi_dbm: number | null;
  ip_address: string | null;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/devices")
      .then((r) => r.json())
      .then((d) => {
        setDevices(d.data ?? []);
        setLoading(false);
      });
  }, []);

  async function deleteDevice(device: Device) {
    if (!confirm(`Delete device "${device.name}"?`)) return;
    const res = await apiFetch(`/admin/devices/${device.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
      toast.success(`Device "${device.name}" deleted`);
    }
  }

  const filtered = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.owner_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.owner_email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const onlineCount = devices.filter((d) => d.is_online).length;

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-8 py-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Devices</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All registered devices across users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{devices.length} total</Badge>
          {onlineCount > 0 && (
            <Badge variant="outline" className="gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              {onlineCount} online
            </Badge>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        <Input
          placeholder="Search by device name or owner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border border-border bg-muted/30"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No devices found.
              </div>
            ) : (
              filtered.map((device, i) => (
                <div
                  key={device.id}
                  className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span
                        className={`relative inline-flex size-2 rounded-full ${device.is_online ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                      />
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium">
                      {device.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {device.owner_name ?? "Unknown"} (
                      {device.owner_email ?? "—"})
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {device.display_mode ?? "—"}
                  </Badge>

                  {device.agent_version && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {device.agent_version}
                    </span>
                  )}

                  {device.ip_address && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {device.ip_address}
                    </span>
                  )}

                  {device.uptime_s != null && device.uptime_s > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {formatUptime(device.uptime_s)}
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteDevice(device)}
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
