"use client";

import {
  Cpu,
  FolderOpen,
  HardDrive,
  Key,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Stats {
  total_users: number;
  active_users: number;
  total_devices: number;
  online_devices: number;
  total_assets: number;
  storage_bytes: number;
  total_api_keys: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch("/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data));
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
          icon: Users,
        },
        {
          label: "Active Users",
          value: stats.active_users,
          icon: UserCheck,
        },
        {
          label: "Total Devices",
          value: stats.total_devices,
          icon: Cpu,
        },
        {
          label: "Online Devices",
          value: stats.online_devices,
          icon: HardDrive,
          dot: true,
        },
        {
          label: "Total Assets",
          value: stats.total_assets,
          icon: FolderOpen,
        },
        {
          label: "Storage Used",
          value: formatBytes(stats.storage_bytes),
          icon: HardDrive,
        },
        {
          label: "API Keys",
          value: stats.total_api_keys,
          icon: Key,
        },
      ]
    : [];

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          System overview and statistics.
        </p>
      </div>

      <div className="px-8 py-6">
        {!stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-border bg-muted/30"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{card.value}</p>
                      {card.dot && (
                        <span className="relative flex size-1.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
