import type { Metadata } from "next";
import { Suspense } from "react";
import { LibraryView } from "@/components/views/LibraryView";

export const metadata: Metadata = { title: "Your Library" };

// LibraryView reads search params, which need a Suspense boundary in a static export.
export default function Page() {
  return (
    <Suspense>
      <LibraryView />
    </Suspense>
  );
}
