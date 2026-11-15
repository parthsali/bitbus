import { Suspense } from "react";
import { UserDetailContent } from "./user-detail";

export const instant = false;

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UserDetailContent />
    </Suspense>
  );
}
