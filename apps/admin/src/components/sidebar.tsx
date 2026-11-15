"use client";

import {
  Cpu,
  FolderOpen,
  Key,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Users", href: "/users", icon: Users },
      { label: "Devices", href: "/devices", icon: Cpu },
      { label: "Assets", href: "/assets", icon: FolderOpen },
      { label: "API Keys", href: "/api-keys", icon: Key },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-6")}>
            {group.label && (
              <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/40">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] transition-colors duration-100",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "opacity-100" : "opacity-50",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground/30">Admin v0.1.0</p>
      </div>
    </aside>
  );
}
