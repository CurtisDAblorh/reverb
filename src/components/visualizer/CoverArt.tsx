/* eslint-disable @next/next/no-img-element -- static export, remote Spotify images */
import { useId } from "react";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/genres";
import type { GenreId } from "@/types/music";

type Props = {
  seed: number;
  genre: GenreId;
  src?: string;
  alt: string;
  className?: string;
};

/**
 * Album art. Uses the Spotify image when available, otherwise renders a
 * deterministic generative cover from the seed and genre palette.
 */
export function CoverArt({ seed, genre, src, alt, className }: Props) {
  const id = useId().replace(/:/g, "");
  const [a, b, c] = GENRES[genre].colors;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("aspect-square w-full rounded-md object-cover", className)}
      />
    );
  }

  const variant = seed % 4;
  const r = (n: number) => ((seed >>> n) % 100) / 100;

  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 100 100"
      className={cn("aspect-square w-full rounded-md", className)}
    >
      <defs>
        <linearGradient
          id={`g-${id}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
          gradientTransform={`rotate(${seed % 360} .5 .5)`}
        >
          <stop offset="0%" stopColor={a} />
          <stop offset="55%" stopColor={b} />
          <stop offset="100%" stopColor={c} />
        </linearGradient>
        <radialGradient id={`r-${id}`}>
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g-${id})`} />
      {variant === 0 &&
        [0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={50}
            cy={50}
            r={10 + i * 9}
            fill="none"
            stroke="#fff"
            strokeOpacity={0.12 + i * 0.05}
            strokeWidth={1.5}
          />
        ))}
      {variant === 1 && (
        <>
          <circle cx={20 + r(3) * 60} cy={20 + r(7) * 60} r={28} fill={`url(#r-${id})`} />
          <rect x="0" y={60 + r(5) * 20} width="100" height="40" fill="#000" fillOpacity="0.18" />
        </>
      )}
      {variant === 2 &&
        Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={8 + i * 10}
            y={50 - (10 + ((seed >>> i) % 30))}
            width="5"
            height={2 * (10 + ((seed >>> i) % 30))}
            rx="2.5"
            fill="#fff"
            fillOpacity="0.35"
          />
        ))}
      {variant === 3 && (
        <path
          d={`M0 ${60 + r(2) * 20} Q 25 ${20 + r(4) * 30} 50 ${55 + r(6) * 15} T 100 ${40 + r(8) * 30} V100 H0Z`}
          fill="#000"
          fillOpacity="0.2"
        />
      )}
      <circle cx="78" cy="22" r="14" fill={`url(#r-${id})`} />
    </svg>
  );
}
