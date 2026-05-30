import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

export type TrendingBook = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  readers: number; // how many users have it on a shelf
  avgRating: number | null; // average user rating
};

type ShelfRow = {
  book_id: string;
  rating: number | null;
  books: { id: string; title: string; author: string; cover_url: string | null } | null;
};

/**
 * Trending books = most-shelved across the community, ranked by reader count
 * then average rating. Computed in-app by aggregating user_books (no precomputed
 * column needed). RLS limits rows to public profiles + the viewer's own.
 */
export async function getTrendingBooks(limit = 6): Promise<TrendingBook[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  // Pull a bounded window of recent shelf entries and aggregate in memory.
  const { data, error } = await supabase
    .from("user_books")
    .select("book_id, rating, books ( id, title, author, cover_url )")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error || !data) return [];

  const map = new Map<
    string,
    { book: NonNullable<ShelfRow["books"]>; readers: number; ratingSum: number; ratingCount: number }
  >();

  for (const row of data as unknown as ShelfRow[]) {
    if (!row.books) continue;
    const entry =
      map.get(row.book_id) ?? { book: row.books, readers: 0, ratingSum: 0, ratingCount: 0 };
    entry.readers += 1;
    if (typeof row.rating === "number") {
      entry.ratingSum += row.rating;
      entry.ratingCount += 1;
    }
    map.set(row.book_id, entry);
  }

  return [...map.values()]
    .map((e) => ({
      id: e.book.id,
      title: e.book.title,
      author: e.book.author,
      coverUrl: e.book.cover_url ?? undefined,
      readers: e.readers,
      avgRating:
        e.ratingCount > 0 ? Math.round((e.ratingSum / e.ratingCount) * 10) / 10 : null,
    }))
    .sort((a, b) => b.readers - a.readers || (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, limit);
}

type ReviewRow = {
  id: string;
  rating: number;
  body: string;
  has_spoilers: boolean;
  created_at: string;
  profiles: { username: string; name: string; avatar_color: string } | null;
  books: { id: string; title: string; author: string; cover_url: string | null } | null;
};

/** Recent community reviews (most recent first). RLS limits to public profiles. */
export async function getRecentReviews(limit = 10): Promise<Review[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, body, has_spoilers, created_at, " +
        "profiles ( username, name, avatar_color ), " +
        "books ( id, title, author, cover_url )"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as ReviewRow[])
    .filter((r) => r.profiles && r.books)
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
        id: r.books!.id,
        title: r.books!.title,
        author: r.books!.author,
        coverUrl: r.books!.cover_url ?? undefined,
      },
    }));
}
