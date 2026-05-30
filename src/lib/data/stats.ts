import type { UserBook } from "@/lib/types";

export type ReadingStats = {
  booksThisYear: number;
  avgRating: number | null;
  pagesThisYear: number;
  totalRead: number;
  booksPerMonth: number[]; // 12 entries, current year
  genres: { genre: string; count: number; pct: number }[];
};

/**
 * Derives reading stats from a user's library (UserBook[]). Pure function — no
 * DB access — so it works for both the current user (/stats) and public
 * profiles (/u/[username]). `year` lets callers pin the reporting year.
 */
export function computeStats(books: UserBook[], year: number): ReadingStats {
  const read = books.filter((b) => b.status === "read");

  const booksPerMonth = new Array(12).fill(0);
  let booksThisYear = 0;
  let pagesThisYear = 0;

  for (const b of read) {
    if (!b.finishedAt) continue;
    const d = new Date(b.finishedAt);
    if (d.getFullYear() === year) {
      booksThisYear++;
      booksPerMonth[d.getMonth()]++;
      pagesThisYear += b.book.pages ?? 0;
    }
  }

  const rated = books.filter((b) => typeof b.rating === "number");
  const avgRating =
    rated.length > 0
      ? Math.round((rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length) * 10) / 10
      : null;

  // Genre breakdown across all read books.
  const counts = new Map<string, number>();
  for (const b of read) for (const g of b.book.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  const total = [...counts.values()].reduce((a, c) => a + c, 0) || 1;
  const genres = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count, pct: Math.round((count / total) * 100) }));

  return {
    booksThisYear,
    avgRating,
    pagesThisYear,
    totalRead: read.length,
    booksPerMonth,
    genres,
  };
}
