import type { Metadata } from "next";
import { Suspense } from "react";
import { CallbackView } from "@/components/views/CallbackView";

export const metadata: Metadata = { title: "Connecting" };

// Keeps the callback page consistent with the other client-routed pages.
export default function Page() {
  return (
    <Suspense>
      <CallbackView />
    </Suspense>
  );
}
