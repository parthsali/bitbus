"use client";

import {
  Cpu,
  FolderOpen,
  HardDrive,
  Key,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
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
          sub: `${stats.active_users} activated`,
          icon: Users,
          href: "/users",
        },
        {
          label: "Active Users",
          value: stats.active_users,
          sub: `of ${stats.total_users} registered`,
          icon: UserCheck,
          href: "/users",
        },
        {
          label: "Total Devices",
          value: stats.total_devices,
          sub: `${stats.online_devices} online`,
          icon: Cpu,
          href: "/devices",
        },
        {
          label: "Online Devices",
          value: stats.online_devices,
          sub: stats.online_devices > 0 ? "connected" : "none connected",
          icon: HardDrive,
          href: "/devices",
          dot: stats.online_devices > 0,
        },
        {
          label: "Total Assets",
          value: stats.total_assets,
          sub: formatBytes(stats.storage_bytes),
          icon: FolderOpen,
          href: "/assets",
        },
        {
          label: "Storage Used",
          value: formatBytes(stats.storage_bytes),
          sub: `across ${stats.total_assets} files`,
          icon: HardDrive,
          href: "/assets",
        },
        {
          label: "API Keys",
          value: stats.total_api_keys,
          sub: "issued",
          icon: Key,
          href: "/api-keys",
        },
      ]
    : null;

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System statistics and platform health.
        </p>
      </div>

      <div className="flex w-full flex-col divide-y divide-border">
        {/* Stats */}
        <div className="px-8 py-6">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Platform
          </p>
          {!stats ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg border border-border bg-muted/30"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {cards?.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/40"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {card.label}
                      </span>
                      <Icon className="size-3.5 text-muted-foreground/40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-semibold tabular-nums tracking-tight">
                        {card.value}
                      </p>
                      {card.dot && (
                        <span className="relative flex size-1.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.sub}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
