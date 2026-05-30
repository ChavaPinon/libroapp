"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ListChecks, Plus, Lock, Globe, Trash2 } from "lucide-react";
import { BookCover } from "@/components/book/book-cover";
import type { ListSummary } from "@/lib/data/lists";
import { createList, deleteList } from "./actions";

export function ListsClient({ lists }: { lists: ListSummary[] }) {
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await createList(null, fd);
      if (res?.ok) setCreating(false);
      else setError(res?.message ?? "Error");
    });
  }

  function onDelete(id: string) {
    startTransition(() => {
      void deleteList(id);
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis listas</h1>
          <p className="mt-1 text-sm text-muted">Colecciones curadas por ti</p>
        </div>
        <button
          onClick={() => setCreating((c) => !c)}
          className="flex items-center gap-2 rounded-app bg-primary px-3 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
        >
          <Plus size={16} /> Nueva lista
        </button>
      </div>

      {creating && (
        <form
          onSubmit={onCreate}
          className="mb-6 space-y-3 rounded-app border border-border-app bg-surface-1 p-4"
        >
          <input
            name="name"
            autoFocus
            placeholder="Nombre de la lista (ej. Mi top fantasía)"
            className="w-full rounded-app border border-border-app bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            name="description"
            placeholder="Descripción (opcional)"
            className="w-full rounded-app border border-border-app bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublic" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
            Pública
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60"
            >
              {pending ? "Creando…" : "Crear lista"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-app border border-border-app px-4 py-2 text-sm hover:bg-surface-2"
            >
              Cancelar
            </button>
            {error && <span className="text-xs text-danger">{error}</span>}
          </div>
        </form>
      )}

      {lists.length === 0 ? (
        <div className="rounded-app border border-dashed border-border-app py-16 text-center text-muted">
          Aún no tienes listas. Crea tu primera colección curada.
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <div key={list.id} className="rounded-app border border-border-app bg-surface-1 p-5">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="text-primary" size={18} />
                <h3 className="font-semibold">{list.name}</h3>
                <span className="ml-auto flex items-center gap-1 text-xs text-subtle">
                  {list.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                  {list.isPublic ? "Pública" : "Privada"} · {list.books.length} libros
                </span>
                <button
                  onClick={() => onDelete(list.id)}
                  disabled={pending}
                  aria-label="Borrar lista"
                  className="text-subtle hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {list.description && <p className="mb-3 text-sm text-muted">{list.description}</p>}
              {list.books.length === 0 ? (
                <p className="text-xs text-subtle">
                  Lista vacía — añade libros desde la página de cada libro.
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {list.books.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} className="w-16 shrink-0">
                      <BookCover src={book.coverUrl} title={book.title} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
