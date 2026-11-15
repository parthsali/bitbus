import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Suspense>
        <TopNav />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <Suspense>
          <Sidebar />
        </Suspense>
        <main className="flex flex-1 flex-col overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
