import { createClient } from "@/lib/supabase/server";
import type { Book, Review, ShelfStatus } from "@/lib/types";

export type BookDetail = {
  book: Book;
  mine: { status: ShelfStatus; rating: number | null } | null;
  reviews: Review[];
  /** The current user's own review (prefills the form), or null. */
  myReview: { rating: number; body: string; hasSpoilers: boolean } | null;
  isLoggedIn: boolean;
};

type BookRow = {
  id: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  cover_url: string | null;
  synopsis: string | null;
  genres: string[] | null;
};

type ReviewRow = {
  id: string;
  rating: number;
  body: string;
  has_spoilers: boolean;
  created_at: string;
  user_id: string;
  profiles: { username: string; name: string; avatar_color: string } | null;
};

/** Full detail for one book (by UUID): the book, the user's shelf row, reviews. */
export async function getBookDetail(id: string): Promise<BookDetail | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: book } = await supabase
    .from("books")
    .select("id, title, author, year, pages, cover_url, synopsis, genres")
    .eq("id", id)
    .single<BookRow>();

  if (!book) return null;

  // The current user's shelf entry (if any).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let mine: BookDetail["mine"] = null;
  if (user) {
    const { data } = await supabase
      .from("user_books")
      .select("status, rating")
      .eq("user_id", user.id)
      .eq("book_id", id)
      .maybeSingle<{ status: ShelfStatus; rating: number | null }>();
    mine = data ?? null;
  }

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select(
      "id, rating, body, has_spoilers, created_at, user_id, profiles ( username, name, avatar_color )"
    )
    .eq("book_id", id)
    .order("created_at", { ascending: false });

  const rows = (reviewRows as unknown as ReviewRow[]) ?? [];

  // Pull out the current user's own review to prefill the form.
  const mineRow = user ? rows.find((r) => r.user_id === user.id) : undefined;
  const myReview = mineRow
    ? { rating: mineRow.rating, body: mineRow.body, hasSpoilers: mineRow.has_spoilers }
    : null;

  const reviews: Review[] = rows
    .filter((r) => r.profiles)
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      hasSpoilers: r.has_spoilers,
      likes: 0,
      comments: 0,
      createdAt: r.created_at,
      user: {
        username: r.profiles!.username,
        name: r.profiles!.name,
        avatarColor: r.profiles!.avatar_color,
      },
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.cover_url ?? undefined,
      },
    }));

  return {
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year ?? undefined,
      pages: book.pages ?? undefined,
      coverUrl: book.cover_url ?? undefined,
      synopsis: book.synopsis ?? undefined,
      genres: book.genres ?? [],
    },
    mine,
    reviews,
    myReview,
    isLoggedIn: !!user,
  };
}
