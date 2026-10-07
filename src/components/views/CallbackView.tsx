"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeLogin } from "@/lib/spotify/auth";
import { useAppDispatch } from "@/store/hooks";
import { setToken } from "@/store/authSlice";

export function CallbackView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Strict mode runs effects twice in dev; the auth code can only be exchanged once.
    if (started.current) return;
    started.current = true;
    completeLogin(new URLSearchParams(window.location.search))
      .then((token) => {
        dispatch(setToken(token));
        router.replace("/");
      })
      .catch((e: Error) => setError(e.message));
  }, [dispatch, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold">Couldn&apos;t connect to Spotify</h1>
          <p className="max-w-md text-muted-foreground">{error}</p>
          <Button onClick={() => router.replace("/")}>Continue in demo mode</Button>
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting your Spotify account…</p>
        </>
      )}
    </div>
  );
}
