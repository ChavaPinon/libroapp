import Link from "next/link";
import { notFound } from "next/navigation";
import { Share2, Plus } from "lucide-react";
import { BOOKS, MY_BOOKS, REVIEWS } from "@/lib/mock-data";
import { SHELF_LABELS, type Review } from "@/lib/types";
import { BookCover } from "@/components/book/book-cover";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SpoilerText } from "@/components/book/spoiler-text";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getBookDetail, type BookDetail } from "@/lib/data/book";
import { relativeTime } from "@/lib/utils";
import { getLists } from "@/lib/data/lists";
import { ShelfControl } from "./shelf-control";
import { ReviewForm } from "./review-form";
import { AddToList } from "./add-to-list";

// Builds a BookDetail from the mock data (slug ids) for demo mode.
function mockDetail(id: string): BookDetail | null {
  const book = BOOKS.find((b) => b.id === id);
  if (!book) return null;
  const mine = MY_BOOKS.find((b) => b.book.id === id);
  return {
    book,
    mine: mine ? { status: mine.status, rating: mine.rating ?? null } : null,
    reviews: REVIEWS.filter((r) => r.book.id === id),
    myReview: null,
    isLoggedIn: false,
  };
}

export default async function BookDetailPage(props: PageProps<"/book/[id]">) {
  const { id } = await props.params;

  const demo = !isSupabaseConfigured;
  const detail = demo ? mockDetail(id) : await getBookDetail(id);
  if (!detail) notFound();

  const user = demo ? null : await getCurrentUser();
  const { book, mine, reviews, myReview, isLoggedIn } = detail;

  // Lists the user can add this book to (only when logged in, real mode).
  const userLists = !demo && isLoggedIn ? (await getLists()).map((l) => ({ id: l.id, name: l.name })) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-40 shrink-0 self-center sm:self-start">
          <BookCover src={book.coverUrl} title={book.title} />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="text-muted">
              {book.author}
              {book.year && ` · ${book.year}`}
              {book.pages && ` · ${book.pages} págs`}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {book.communityRating != null && (
                <>
                  <StarRating value={book.communityRating} size={16} />
                  <span className="text-sm text-muted">{book.communityRating} comunidad</span>
                </>
              )}
              {book.genres.map((g) => (
                <Badge key={g}>{g}</Badge>
              ))}
            </div>
          </div>

          {/* Interactive shelf + rating (real) or static badge (demo). */}
          {demo ? (
            <div className="flex flex-wrap items-center gap-3 rounded-app border border-border-app bg-surface-1 p-3">
              <Badge variant={mine ? "primary" : "outline"}>
                {mine ? SHELF_LABELS[mine.status] : "Sin estante"}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Tu puntuación:</span>
                <StarRating value={mine?.rating ?? 0} size={18} />
              </div>
              <span className="ml-auto text-xs text-subtle">(demo)</span>
            </div>
          ) : (
            <ShelfControl
              bookId={book.id}
              initialStatus={mine?.status ?? null}
              initialRating={mine?.rating ?? null}
              isLoggedIn={!!user}
            />
          )}

          <div className="flex flex-wrap gap-2">
            {!demo && isLoggedIn ? (
              <AddToList bookId={book.id} lists={userLists} />
            ) : (
              <button className="flex items-center gap-1.5 rounded-app border border-border-app px-3 py-1.5 text-sm hover:bg-surface-2">
                <Plus size={15} /> Añadir a lista
              </button>
            )}
            <button className="flex items-center gap-1.5 rounded-app border border-border-app px-3 py-1.5 text-sm hover:bg-surface-2">
              <Share2 size={15} /> Compartir
            </button>
          </div>

          {book.synopsis && (
            <div>
              <h2 className="mb-1 text-sm font-semibold text-muted">Sinopsis</h2>
              <p className="text-sm leading-relaxed">{book.synopsis}</p>
            </div>
          )}
        </div>
      </div>

      {/* Write / edit your review (real mode only). */}
      {!demo &&
        (isLoggedIn ? (
          <ReviewForm bookId={book.id} existing={myReview} />
        ) : (
          <div className="rounded-app border border-dashed border-border-app p-4 text-center text-sm text-muted">
            <Link href="/login" className="text-accent hover:underline">
              Inicia sesión
            </Link>{" "}
            para escribir tu reseña.
          </div>
        ))}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reseñas de la comunidad</h2>
        {reviews.length === 0 ? (
          <p className="rounded-app border border-dashed border-border-app py-10 text-center text-sm text-muted">
            Todavía no hay reseñas. ¡Sé el primero en escribir una!
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r: Review) => (
              <article key={r.id} className="rounded-app border border-border-app bg-surface-1 p-4">
                <div className="flex items-center gap-2">
                  <UserAvatar name={r.user.name} color={r.user.avatarColor} size={30} />
                  <Link href={`/u/${r.user.username}`} className="text-sm font-semibold hover:text-primary">
                    {r.user.name}
                  </Link>
                  <StarRating value={r.rating} size={14} />
                  <span className="ml-auto text-xs text-subtle">{relativeTime(r.createdAt)}</span>
                </div>
                <div className="mt-2 text-sm">
                  {r.hasSpoilers ? <SpoilerText>{r.body}</SpoilerText> : <p>{r.body}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
