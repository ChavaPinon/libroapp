"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { addBookToList } from "./list-actions";

export function AddToList({
  bookId,
  lists,
}: {
  bookId: string;
  lists: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function add(listId: string) {
    setOpen(false);
    startTransition(async () => {
      const res = await addBookToList(listId, bookId);
      if (res.ok) setDone(listId);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-app border border-border-app px-3 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-60"
      >
        <Plus size={15} /> Añadir a lista
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-20 w-52 overflow-hidden rounded-app border border-border-app bg-surface-1 shadow-xl">
          {lists.length === 0 ? (
            <p className="px-3 py-3 text-xs text-subtle">
              No tienes listas. Crea una en la sección Listas.
            </p>
          ) : (
            lists.map((l) => (
              <button
                key={l.id}
                onClick={() => add(l.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                <span className="truncate">{l.name}</span>
                {done === l.id && <Check size={14} className="text-success" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
