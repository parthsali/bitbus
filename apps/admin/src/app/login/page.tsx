"use client";

import { Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    auth_failed: "Authentication failed. Please try again.",
    not_activated: "Your account has not been activated yet.",
    not_admin: "You do not have admin access.",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-foreground" />
            <h1 className="text-xl font-semibold tracking-tight">
              Bitbus Admin
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in with your admin account
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessages[error] ?? "An error occurred."}
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          render={<a href={`${getApiUrl()}/auth/google?app=admin`} />}
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
