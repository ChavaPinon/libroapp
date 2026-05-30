"use client";

import { useState } from "react";
import { SHELF_LABELS, type ShelfStatus, type UserBook } from "@/lib/types";
import { BookCard } from "@/components/book/book-card";
import { cn } from "@/lib/utils";

type Tab = "all" | ShelfStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "want", label: SHELF_LABELS.want },
  { key: "reading", label: SHELF_LABELS.reading },
  { key: "read", label: SHELF_LABELS.read },
  { key: "dnf", label: SHELF_LABELS.dnf },
];

export function LibraryGrid({ books }: { books: UserBook[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const filtered = tab === "all" ? books : books.filter((b) => b.status === tab);
  const count = (t: Tab) =>
    t === "all" ? books.length : books.filter((b) => b.status === t).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border-app">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text"
            )}
          >
            {label}{" "}
            <span className="ml-1 rounded-full bg-surface-2 px-1.5 text-xs">{count(key)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-app border border-dashed border-border-app py-16 text-center text-muted">
          No tienes libros en esta estantería todavía.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filtered.map((item) => (
            <BookCard key={item.book.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
