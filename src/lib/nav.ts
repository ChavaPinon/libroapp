import {
  BarChart3,
  BookMarked,
  BookOpen,
  Compass,
  Home,
  ListChecks,
  type LucideIcon,
  Trophy,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Show in the mobile bottom bar (max 5). */
  mobile?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Inicio", icon: Home, mobile: true },
  { href: "/library", label: "Biblioteca", icon: BookMarked, mobile: true },
  { href: "/reading", label: "Leyendo", icon: BookOpen },
  { href: "/stats", label: "Estadísticas", icon: BarChart3, mobile: true },
  { href: "/challenges", label: "Retos", icon: Trophy },
  { href: "/lists", label: "Listas", icon: ListChecks },
  { href: "/discover", label: "Descubrir", icon: Compass, mobile: true },
];
