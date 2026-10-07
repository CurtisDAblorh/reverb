import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/views/SearchView";

export const metadata: Metadata = { title: "Search" };

// SearchView reads search params, which need a Suspense boundary in a static export.
export default function Page() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
