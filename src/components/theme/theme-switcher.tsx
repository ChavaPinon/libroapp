"use client";

import { Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/themes";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";

/** Quick theme picker in the topbar. Full editor lives in /settings. */
export function ThemeSwitcher() {
  const { baseId, setBaseTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cambiar tema"
        className="flex h-9 w-9 items-center justify-center rounded-app text-muted hover:bg-surface-2 hover:text-text"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-app border border-border-app bg-surface-1 p-2 shadow-xl">
          <p className="px-2 py-1 text-xs font-medium text-subtle">Temas</p>
          <div className="grid grid-cols-1 gap-0.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setBaseTheme(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2",
                  baseId === t.id ? "text-primary" : "text-text"
                )}
              >
                <span className="flex gap-0.5">
                  {[t.tokens.bg, t.tokens.surface2, t.tokens.primary, t.tokens.accent].map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-2 rounded-sm ring-1 ring-black/20"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                {t.name}
              </button>
            ))}
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-md px-2 py-1.5 text-xs text-accent hover:bg-surface-2"
          >
            Personalizar tema →
          </Link>
        </div>
      )}
    </div>
  );
}
