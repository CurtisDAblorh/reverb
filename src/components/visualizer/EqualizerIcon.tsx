import { cn } from "@/lib/utils";

/** Animated "now playing" bars. Pauses when `playing` is false. */
export function EqualizerIcon({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span
      aria-label={playing ? "Now playing" : "Paused"}
      role="img"
      className={cn("inline-flex h-4 w-4 items-end justify-between", className)}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-full bg-primary"
          style={{
            animationDelay: `${i * -0.22}s`,
            animationPlayState: playing ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}
