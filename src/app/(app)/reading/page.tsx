import Link from "next/link";
import { Search } from "lucide-react";
import { MY_BOOKS } from "@/lib/mock-data";
import { BookCover } from "@/components/book/book-cover";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PageHeader } from "@/components/ui/page-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getCurrentlyReading } from "@/lib/data/home";
import type { UserBook } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { ProgressUpdater } from "./progress-updater";

export default async function ReadingPage() {
  const demo = !isSupabaseConfigured;
  const user = demo ? null : await getCurrentUser();

  if (!demo && !user) {
    return (
      <div>
        <PageHeader title="Leyendo ahora" subtitle="Tu foco de lectura actual" />
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">Inicia sesión para ver lo que estás leyendo.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const reading: UserBook[] = demo
    ? MY_BOOKS.filter((b) => b.status === "reading")
    : await getCurrentlyReading();

  return (
    <div>
      <PageHeader title="Leyendo ahora" subtitle="Tu foco de lectura actual" />

      {reading.length === 0 ? (
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">No estás leyendo ningún libro ahora mismo.</p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            <Search size={16} /> Buscar un libro
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reading.map(({ book, currentPage, startedAt }) => {
            const cp = currentPage ?? 0;
            const pct = book.pages && cp ? (cp / book.pages) * 100 : 0;
            const remaining = book.pages ? book.pages - cp : 0;
            return (
              <div
                key={book.id}
                className="flex gap-5 rounded-app border border-border-app bg-surface-1 p-5"
              >
                <Link href={`/book/${book.id}`} className="w-24 shrink-0">
                  <BookCover src={book.coverUrl} title={book.title} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                  <div>
                    <Link href={`/book/${book.id}`}>
                      <h3 className="text-lg font-semibold hover:text-primary">{book.title}</h3>
                    </Link>
                    <p className="text-sm text-muted">{book.author}</p>
                  </div>
                  <ProgressBar value={pct} showLabel />
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-subtle">
                    <span>
                      pág {cp}
                      {book.pages ? ` de ${book.pages}` : ""}
                    </span>
                    {book.pages ? <span>{remaining} páginas restantes</span> : null}
                    {startedAt && <span>desde {relativeTime(startedAt)}</span>}
                  </div>
                  {demo ? (
                    <button className="mt-1 w-fit rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover">
                      Actualizar progreso
                    </button>
                  ) : (
                    <ProgressUpdater
                      bookId={book.id}
                      currentPage={cp}
                      totalPages={book.pages ?? null}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
