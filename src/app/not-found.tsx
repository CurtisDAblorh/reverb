import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-gradient font-display text-7xl font-extrabold">404</p>
      <h1 className="text-2xl font-bold">This track skipped</h1>
      <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button render={<Link href="/" />}>Back home</Button>
    </div>
  );
}
