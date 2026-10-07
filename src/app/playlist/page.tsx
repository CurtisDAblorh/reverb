import type { Metadata } from "next";
import { Suspense } from "react";
import { PlaylistView } from "@/components/views/PlaylistView";

export const metadata: Metadata = { title: "Playlist" };

// PlaylistView reads search params, which need a Suspense boundary in a static export.
export default function Page() {
  return (
    <Suspense>
      <PlaylistView />
    </Suspense>
  );
}
