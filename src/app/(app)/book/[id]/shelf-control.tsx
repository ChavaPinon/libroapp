"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { SHELF_LABELS, type ShelfStatus } from "@/lib/types";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { setRating, setShelfStatus } from "./actions";

const STATUSES: ShelfStatus[] = ["want", "reading", "read", "dnf", "reread"];

const STATUS_VARIANT = {
  want: "default",
  reading: "primary",
  read: "success",
  dnf: "danger",
  reread: "warning",
} as const;

export function ShelfControl({
  bookId,
  initialStatus,
  initialRating,
  isLoggedIn,
}: {
  bookId: string;
  initialStatus: ShelfStatus | null;
  initialRating: number | null;
  isLoggedIn: boolean;
}) {
  const [status, setStatus] = useState<ShelfStatus | null>(initialStatus);
  const [rating, setRatingState] = useState<number>(initialRating ?? 0);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3 rounded-app border border-border-app bg-surface-1 p-3">
        <Badge variant="outline">Sin estante</Badge>
        <Link
          href="/login"
          className="ml-auto rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover"
        >
          Inicia sesión para guardar
        </Link>
      </div>
    );
  }

  function changeStatus(next: ShelfStatus) {
    setOpen(false);
    const prev = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      const res = await setShelfStatus(bookId, next);
      if (!res.ok) setStatus(prev);
    });
  }

  function changeRating(next: number) {
    const prev = rating;
    setRatingState(next); // optimistic
    startTransition(async () => {
      const res = await setRating(bookId, next);
      if (!res.ok) setRatingState(prev);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-app border border-border-app bg-surface-1 p-3">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={pending}
          className="flex items-center gap-1.5"
        >
          <Badge variant={status ? STATUS_VARIANT[status] : "outline"}>
            {status ? SHELF_LABELS[status] : "Sin estante"}
          </Badge>
          <ChevronDown size={14} className="text-muted" />
        </button>
        {open && (
          <div className="absolute left-0 top-9 z-20 w-44 overflow-hidden rounded-app border border-border-app bg-surface-1 shadow-xl">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                {SHELF_LABELS[s]}
                {status === s && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Tu puntuación:</span>
        <StarRating value={rating} onChange={changeRating} size={18} />
      </div>

      {pending && <span className="text-xs text-subtle">guardando…</span>}
    </div>
  );
}
