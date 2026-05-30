"use client";

import { useState, useTransition } from "react";
import { updateProgress } from "./actions";

export function ProgressUpdater({
  bookId,
  currentPage,
  totalPages,
}: {
  bookId: string;
  currentPage: number;
  totalPages: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateProgress(bookId, page, totalPages);
      if (res.ok) setOpen(false);
      else setError(res.message ?? "Error");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1 w-fit rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover"
      >
        Actualizar progreso
      </button>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={0}
        max={totalPages ?? undefined}
        value={page}
        onChange={(e) => setPage(Number(e.target.value))}
        className="h-9 w-24 rounded-app border border-border-app bg-bg px-2 text-sm outline-none focus:border-primary"
      />
      {totalPages && <span className="text-xs text-subtle">/ {totalPages}</span>}
      <button
        onClick={save}
        disabled={pending}
        className="rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="rounded-app border border-border-app px-3 py-1.5 text-sm hover:bg-surface-2"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
