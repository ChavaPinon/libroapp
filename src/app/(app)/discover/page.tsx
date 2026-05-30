import Link from "next/link";
import { Heart, MessageCircle, Compass } from "lucide-react";
import { BOOKS, REVIEWS } from "@/lib/mock-data";
import { BookCover } from "@/components/book/book-cover";
import { StarRating } from "@/components/ui/star-rating";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SpoilerText } from "@/components/book/spoiler-text";
import { PageHeader } from "@/components/ui/page-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getRecentReviews, getTrendingBooks, type TrendingBook } from "@/lib/data/discover";
import type { Review } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export default async function DiscoverPage() {
  const demo = !isSupabaseConfigured;

  // Trending + recent reviews (real or mock).
  const trending: TrendingBook[] = demo
    ? [...BOOKS]
        .sort((a, b) => (b.communityRating ?? 0) - (a.communityRating ?? 0))
        .slice(0, 6)
        .map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          coverUrl: b.coverUrl,
          readers: 0,
          avgRating: b.communityRating ?? null,
        }))
    : await getTrendingBooks();

  const reviews: Review[] = demo ? REVIEWS : await getRecentReviews();

  const empty = trending.length === 0 && reviews.length === 0;

  return (
    <div className="space-y-10">
      <PageHeader title="Descubrir" subtitle="Lo más leído y reseñas de la comunidad" />

      {empty ? (
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <Compass className="mx-auto text-subtle" size={28} />
          <p className="mt-3 text-muted">
            Aún no hay actividad en la comunidad. ¡Sé de los primeros en agregar y reseñar libros!
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Buscar libros
          </Link>
        </div>
      ) : (
        <>
          {trending.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Tendencia en la comunidad</h2>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                {trending.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group">
                    <BookCover
                      src={book.coverUrl}
                      title={book.title}
                      className="transition-transform group-hover:-translate-y-1"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                      {book.avgRating != null ? (
                        <StarRating value={book.avgRating} size={12} />
                      ) : (
                        <span className="text-subtle">sin valorar</span>
                      )}
                      {book.readers > 0 && <span className="text-subtle">{book.readers}👤</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {reviews.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Reseñas recientes</h2>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-app border border-border-app bg-surface-1 p-4"
                  >
                    <div className="flex gap-3">
                      <UserAvatar name={review.user.name} color={review.user.avatarColor} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/u/${review.user.username}`}
                            className="font-semibold hover:text-primary"
                          >
                            {review.user.name}
                          </Link>
                          <StarRating value={review.rating} size={14} />
                        </div>
                        <Link
                          href={`/book/${review.book.id}`}
                          className="text-sm text-muted hover:text-primary"
                        >
                          sobre <span className="font-medium">{review.book.title}</span> ·{" "}
                          {review.book.author}
                        </Link>
                        <div className="mt-2 text-sm text-text">
                          {review.hasSpoilers ? (
                            <SpoilerText>{review.body}</SpoilerText>
                          ) : (
                            <p>{review.body}</p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-subtle">
                          <span>{relativeTime(review.createdAt)}</span>
                          <button className="flex items-center gap-1 hover:text-danger">
                            <Heart size={13} /> me gusta
                          </button>
                          <button className="flex items-center gap-1 hover:text-text">
                            <MessageCircle size={13} /> comentar
                          </button>
                        </div>
                      </div>
                      <div className="hidden w-12 shrink-0 sm:block">
                        <BookCover src={review.book.coverUrl} title={review.book.title} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
