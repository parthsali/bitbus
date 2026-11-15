"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { decodeJwt, getToken } from "@/lib/api";

interface JwtUser {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string;
  is_admin: boolean;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center border-b border-border px-5 py-3.5 last:border-0">
      <p className="w-44 shrink-0 text-sm text-muted-foreground">{label}</p>
      <p className="flex-1 text-sm">
        {value ?? <span className="text-muted-foreground/40">—</span>}
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<JwtUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) setUser(decodeJwt<JwtUser>(token));
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Admin profile and system information.
        </p>
      </div>

      <div className="flex flex-col gap-8 px-8 py-6">
        {/* Profile */}
        {user && (
          <div>
            <div className="flex items-center gap-5 mb-6">
              <Avatar className="size-14">
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-base font-semibold bg-muted">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{user.name}</p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Account
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow
                label="User ID"
                value={
                  <span className="font-mono text-xs">{user.user_id}</span>
                }
              />
              <InfoRow label="Role" value="Administrator" />
            </div>
          </div>
        )}

        <Separator />

        {/* System */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            System
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <InfoRow label="Platform" value="Bitbus" />
            <InfoRow
              label="Admin Panel"
              value={<span className="font-mono">v0.1.0</span>}
            />
            <InfoRow
              label="API URL"
              value={
                <span className="font-mono text-xs text-muted-foreground">
                  {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
