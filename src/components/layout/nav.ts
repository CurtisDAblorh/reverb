import { BarChart3, Home, Library, Search } from "lucide-react";

export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search/", label: "Search", icon: Search },
  { href: "/library/", label: "Library", icon: Library },
  { href: "/stats/", label: "Stats", icon: BarChart3 },
] as const;

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
