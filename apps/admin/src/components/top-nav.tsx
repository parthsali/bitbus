"use client";

import { Grip, LogOut, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { decodeJwt, getToken } from "@/lib/api";

interface JwtUser {
  name: string;
  email: string;
  avatar_url: string;
  is_admin: boolean;
}

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
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

  function handleLogout() {
    document.cookie = "bitbus_token=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <Grip className="size-4 text-foreground" />
        <span className="text-sm font-semibold tracking-tight">Bitbus</span>
        <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Admin
        </span>
      </Link>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme */}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          )}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 outline-none hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-6">
              <AvatarImage
                src={user?.avatar_url}
                alt={user?.name ?? ""}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-[9px] font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* User info header */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar className="size-8">
                <AvatarImage
                  src={user?.avatar_url}
                  alt={user?.name ?? ""}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="text-xs font-semibold bg-muted">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-sm font-medium">
                  {user?.name ?? "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <User className="size-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
