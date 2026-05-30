"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ username }: { username: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-app bg-surface-1 md:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <BookHeart className="text-primary" size={24} />
        <span className="text-lg font-bold tracking-tight">LibroApp</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-app px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-app p-3">
        <Link
          href={username ? `/u/${username}` : "/login"}
          className="flex items-center gap-3 rounded-app px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text"
        >
          {username ? "Mi perfil público" : "Iniciar sesión"}
        </Link>
      </div>
    </aside>
  );
}
