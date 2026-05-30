import Link from "next/link";
import { Heart, MessageCircle, Search } from "lucide-react";
import { FEED, MY_BOOKS, PROFILE } from "@/lib/mock-data";
import { BookCover } from "@/components/book/book-cover";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StarRating } from "@/components/ui/star-rating";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getCurrentUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getActivityFeed, getCurrentlyReading } from "@/lib/data/home";
import type { ActivityItem, UserBook } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

const ACTIVITY_VERB: Record<string, string> = {
  finished: "terminó",
  started: "empezó",
  reviewed: "reseñó",
  rated: "puntuó",
};

export default async function HomePage() {
  const demo = !isSupabaseConfigured;
  const user = demo ? null : await getCurrentUser();

  // Backend ready but not logged in → invite to sign in.
  if (!demo && !user) {
    return (
      <div className="rounded-app border border-dashed border-border-app py-16 text-center">
        <p className="text-muted">Inicia sesión para ver tu progreso y el feed de la comunidad.</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const reading: UserBook[] = demo
    ? MY_BOOKS.filter((b) => b.status === "reading")
    : await getCurrentlyReading();
  const feed: ActivityItem[] = demo ? FEED : await getActivityFeed();
  const firstName = (user?.profile?.name ?? PROFILE.name).split(" ")[0];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Continúa leyendo</h2>
        {reading.length === 0 ? (
          <div className="rounded-app border border-dashed border-border-app py-10 text-center">
            <p className="text-sm text-muted">No estás leyendo nada ahora mismo.</p>
            <Link
              href="/search"
              className="mt-3 inline-flex items-center gap-2 rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover"
            >
              <Search size={15} /> Buscar un libro
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reading.map(({ book, currentPage }) => {
              const pct = book.pages && currentPage ? (currentPage / book.pages) * 100 : 0;
              return (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="flex gap-4 rounded-app border border-border-app bg-surface-1 p-3 hover:border-primary/40"
                >
                  <div className="w-16 shrink-0">
                    <BookCover src={book.coverUrl} title={book.title} />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-2">
                    <div>
                      <h3 className="line-clamp-1 font-semibold">{book.title}</h3>
                      <p className="text-sm text-muted">{book.author}</p>
                    </div>
                    {book.pages && currentPage ? (
                      <>
                        <ProgressBar value={pct} showLabel />
                        <p className="text-xs text-subtle">
                          pág {currentPage} de {book.pages}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-subtle">Sin progreso registrado aún</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Actividad de la comunidad</h2>
          <Link href="/discover" className="text-sm text-accent hover:underline">
            Descubrir más
          </Link>
        </div>
        {feed.length === 0 ? (
          <p className="rounded-app border border-dashed border-border-app py-10 text-center text-sm text-muted">
            Aún no hay actividad. Sigue a otros lectores para llenar tu feed.
          </p>
        ) : (
          <div className="space-y-3">
            {feed.map((item) => (
              <article
                key={item.id}
                className="flex gap-3 rounded-app border border-border-app bg-surface-1 p-4"
              >
                <UserAvatar name={item.user.name} color={item.user.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link href={`/u/${item.user.username}`} className="font-semibold hover:text-primary">
                      {item.user.name}
                    </Link>{" "}
                    <span className="text-muted">{ACTIVITY_VERB[item.type]}</span>{" "}
                    <Link href={`/book/${item.book.id}`} className="font-medium hover:text-primary">
                      {item.book.title}
                    </Link>
                  </p>
                  {item.rating != null && (
                    <div className="mt-1">
                      <StarRating value={item.rating} size={14} />
                    </div>
                  )}
                  {item.snippet && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted">“{item.snippet}”</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-subtle">
                    <span>{relativeTime(item.at)}</span>
                    <button className="flex items-center gap-1 hover:text-danger">
                      <Heart size={13} /> me gusta
                    </button>
                    <button className="flex items-center gap-1 hover:text-text">
                      <MessageCircle size={13} /> comentar
                    </button>
                  </div>
                </div>
                <div className="hidden w-10 shrink-0 sm:block">
                  <BookCover src={item.book.coverUrl} title={item.book.title} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-subtle">
        Hola {firstName}
        {demo && " · (demo — backend no conectado)"}
      </p>
    </div>
  );
}
