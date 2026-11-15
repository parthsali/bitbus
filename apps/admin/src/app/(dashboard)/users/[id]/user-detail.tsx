"use client";

import { ArrowLeft, Loader2, Music2, Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";

interface UserDetail {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  google_id: string;
  is_activated: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  device_count: number;
  has_spotify: boolean;
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

export function UserDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setUser(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function toggleActivation() {
    if (!user) return;
    const res = await apiFetch(`/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_activated: !user.is_activated }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser((prev) => (prev ? { ...prev, ...data.data } : prev));
      toast.success(
        `${user.name} ${!user.is_activated ? "activated" : "deactivated"}`,
      );
    }
  }

  async function deleteUser() {
    if (!user) return;
    if (
      !confirm(`Delete ${user.name}? This will cascade delete all their data.`)
    )
      return;
    const res = await apiFetch(`/admin/users/${user.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success(`${user.name} deleted`);
      router.push("/users");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Link href="/users" className="text-sm hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-8 py-6">
        <div className="flex items-center gap-4">
          <Link
            href="/users"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={deleteUser}
        >
          <Trash2 className="size-3.5" />
          Delete User
        </Button>
      </div>

      <div className="flex flex-col gap-8 px-8 py-6">
        {/* Avatar + badges */}
        <div className="flex items-center gap-5">
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
              {user.is_admin && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  <Shield className="size-2.5 mr-0.5" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Account details */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Account
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <InfoRow
              label="User ID"
              value={<span className="font-mono text-xs">{user.id}</span>}
            />
            <InfoRow label="Email" value={user.email} />
            <InfoRow
              label="Google ID"
              value={
                <span className="font-mono text-xs">{user.google_id}</span>
              }
            />
            <div className="flex items-center border-b border-border px-5 py-3.5">
              <p className="w-44 shrink-0 text-sm text-muted-foreground">
                Activated
              </p>
              <div className="flex flex-1 items-center gap-3">
                <Switch
                  checked={user.is_activated}
                  onCheckedChange={toggleActivation}
                />
                <span className="text-sm">
                  {user.is_activated ? "Yes" : "No"}
                </span>
              </div>
            </div>
            <InfoRow label="Admin" value={user.is_admin ? "Yes" : "No"} />
            <InfoRow
              label="Member since"
              value={new Date(user.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow
              label="Last updated"
              value={new Date(user.updated_at).toLocaleString()}
            />
          </div>
        </div>

        {/* Usage */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Usage
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <InfoRow
              label="Devices"
              value={`${user.device_count} registered`}
            />
            <InfoRow
              label="Spotify"
              value={
                user.has_spotify ? (
                  <span className="flex items-center gap-1.5">
                    <Music2 className="size-3.5 text-emerald-500" />
                    Connected
                  </span>
                ) : (
                  "Not connected"
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
