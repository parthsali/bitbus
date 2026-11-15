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

export default function SettingsPage() {
  const [user, setUser] = useState<JwtUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) setUser(decodeJwt<JwtUser>(token));
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Admin profile and system information.
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div>
          <h2 className="text-sm font-medium mb-3">Your Profile</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            {user && (
              <div className="flex items-center gap-4 px-4 py-4">
                <Avatar className="size-12">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-sm font-semibold bg-muted">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      Admin
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-medium mb-3">System Information</h2>
          <div className="overflow-hidden rounded-lg border border-border divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm">Bitbus</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Admin Panel Version
              </span>
              <span className="text-sm font-mono">0.1.0</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">API URL</span>
              <span className="text-sm font-mono text-muted-foreground">
                {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
