import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-display text-xl font-bold tracking-tight",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#logo-g)" />
        {[7, 12, 17, 22].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={16 - [4, 8, 6, 3][i]}
            width="3"
            height={[4, 8, 6, 3][i] * 2}
            rx="1.5"
            fill="#fff"
          />
        ))}
      </svg>
      Reverb
    </span>
  );
}
