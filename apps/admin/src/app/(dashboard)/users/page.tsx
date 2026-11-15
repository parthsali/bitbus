"use client";

import { Shield, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  is_activated: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: load once on mount
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const res = await apiFetch("/admin/users");
    const data = await res.json();
    setUsers(data.data ?? []);
    setLoading(false);
  }

  async function toggleActivation(user: User) {
    const res = await apiFetch(`/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_activated: !user.is_activated }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.data : u)));
      toast.success(
        `${user.name} ${!user.is_activated ? "activated" : "deactivated"}`,
      );
    }
  }

  async function toggleAdmin(user: User) {
    const res = await apiFetch(`/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_admin: !user.is_admin }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.data : u)));
      toast.success(
        `${user.name} ${!user.is_admin ? "promoted to admin" : "removed from admin"}`,
      );
    }
  }

  async function deleteUser(user: User) {
    if (
      !confirm(`Delete ${user.name}? This will cascade delete all their data.`)
    )
      return;
    const res = await apiFetch(`/admin/users/${user.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.name} deleted`);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-8 py-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage all registered users.
          </p>
        </div>
        <Badge variant="secondary">{users.length} total</Badge>
      </div>

      <div className="px-8 py-6">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
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
                No users found.
              </div>
            ) : (
              filtered.map((user, i) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="text-[9px] font-semibold bg-muted">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
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
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Active
                    </span>
                    <Switch
                      checked={user.is_activated}
                      onCheckedChange={() => toggleActivation(user)}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Admin</span>
                    <Switch
                      checked={user.is_admin}
                      onCheckedChange={() => toggleAdmin(user)}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteUser(user)}
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
