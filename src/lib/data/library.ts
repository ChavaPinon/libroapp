import { createClient } from "@/lib/supabase/server";
import type { ShelfStatus, UserBook } from "@/lib/types";

type Row = {
  status: ShelfStatus;
  rating: number | null;
  current_page: number | null;
  started_at: string | null;
  finished_at: string | null;
  tags: string[] | null;
  books: {
    id: string;
    title: string;
    author: string;
    year: number | null;
    pages: number | null;
    cover_url: string | null;
    synopsis: string | null;
    genres: string[] | null;
  } | null;
};

/**
 * Fetch a user's shelf as UserBook[]. Pass a userId to read someone else's
 * public library; omit it to read the current session's own library.
 * Returns [] in demo mode or when not logged in.
 */
export async function getLibrary(userId?: string): Promise<UserBook[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let targetId = userId;
  if (!targetId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetId = user.id;
  }

  const { data, error } = await supabase
    .from("user_books")
    .select(
      "status, rating, current_page, started_at, finished_at, tags, " +
        "books ( id, title, author, year, pages, cover_url, synopsis, genres )"
    )
    .eq("user_id", targetId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  // Supabase can't infer the embedded-row shape without generated DB types,
  // so we cast through unknown to our hand-written Row type.
  return (data as unknown as Row[])
    .filter((r) => r.books)
    .map((r) => ({
      book: {
        id: r.books!.id,
        title: r.books!.title,
        author: r.books!.author,
        year: r.books!.year ?? undefined,
        pages: r.books!.pages ?? undefined,
        coverUrl: r.books!.cover_url ?? undefined,
        synopsis: r.books!.synopsis ?? undefined,
        genres: r.books!.genres ?? [],
      },
      status: r.status,
      rating: r.rating ?? undefined,
      currentPage: r.current_page ?? undefined,
      startedAt: r.started_at ?? undefined,
      finishedAt: r.finished_at ?? undefined,
      tags: r.tags ?? undefined,
    }));
}
