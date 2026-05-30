"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";

/** Blurs review text marked as containing spoilers until clicked. */
export function SpoilerText({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <p>{children}</p>;

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="group relative w-full text-left"
      aria-label="Mostrar contenido con spoilers"
    >
      <p className="select-none blur-sm">{children}</p>
      <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-medium text-warning">
        <EyeOff size={14} /> Contiene spoilers — toca para revelar
      </span>
    </button>
  );
}
