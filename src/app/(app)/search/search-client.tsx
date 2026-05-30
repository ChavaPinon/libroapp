"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Plus, Search } from "lucide-react";
import { BookCover } from "@/components/book/book-cover";
import { SHELF_LABELS, type ShelfStatus } from "@/lib/types";
import type { OpenLibraryBook } from "@/lib/openlibrary";
import { addBookToShelf } from "./actions";
import { cn } from "@/lib/utils";

const SHELVES: ShelfStatus[] = ["want", "reading", "read"];

export function SearchClient({
  isLoggedIn,
  backendReady,
}: {
  isLoggedIn: boolean;
  backendReady: boolean;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live search against /api/search (Open Library).
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: OpenLibraryBook[] };
        setResults(data.results);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 rounded-app border border-border-app bg-surface-1 px-4">
        <Search size={18} className="text-subtle" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca un libro o autor… (datos reales de Open Library)"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
        />
      </div>

      <p className="mb-4 text-xs text-subtle">
        {loading
          ? "Buscando…"
          : searched
            ? `${results.length} resultados de Open Library`
            : "Escribe para buscar en el catálogo mundial de Open Library"}
      </p>

      <div className="space-y-2">
        {results.map((book) => (
          <ResultRow
            key={book.externalId}
            book={book}
            isLoggedIn={isLoggedIn}
            backendReady={backendReady}
          />
        ))}
      </div>
    </div>
  );
}

function ResultRow({
  book,
  isLoggedIn,
  backendReady,
}: {
  book: OpenLibraryBook;
  isLoggedIn: boolean;
  backendReady: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<ShelfStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add(status: ShelfStatus) {
    setOpen(false);
    setError(null);
    startTransition(async () => {
      const res = await addBookToShelf(book, status);
      if (res.ok) setAdded(status);
      else setError(res.message);
    });
  }

  return (
    <div className="flex gap-4 rounded-app border border-border-app bg-surface-1 p-3">
      <div className="w-12 shrink-0">
        <BookCover src={book.coverUrl} title={book.title} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{book.title}</h3>
        <p className="text-sm text-muted">
          {book.author}
          {book.year ? ` · ${book.year}` : ""}
          {book.pages ? ` · ${book.pages} págs` : ""}
        </p>
        {book.genres.length > 0 && (
          <p className="mt-0.5 line-clamp-1 text-xs text-subtle">{book.genres.join(" · ")}</p>
        )}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>

      <div className="relative self-center">
        {added ? (
          <span className="flex items-center gap-1 rounded-app bg-success/15 px-3 py-1.5 text-sm text-success">
            <Check size={15} /> {SHELF_LABELS[added]}
          </span>
        ) : !backendReady ? (
          <span className="text-xs text-subtle">conecta backend</span>
        ) : !isLoggedIn ? (
          <Link
            href="/login"
            className="rounded-app border border-border-app px-3 py-1.5 text-sm hover:bg-surface-2"
          >
            Inicia sesión
          </Link>
        ) : (
          <>
            <button
              onClick={() => setOpen((o) => !o)}
              disabled={pending}
              className={cn(
                "flex items-center gap-1 rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover",
                pending && "opacity-60"
              )}
            >
              <Plus size={15} /> {pending ? "Guardando…" : "Añadir"}
            </button>
            {open && (
              <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-app border border-border-app bg-surface-1 shadow-xl">
                {SHELVES.map((s) => (
                  <button
                    key={s}
                    onClick={() => add(s)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    {SHELF_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
