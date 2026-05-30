// Domain types. These mirror the planned Postgres schema so swapping mock
// data for Supabase later is a drop-in change.

export type ShelfStatus = "want" | "reading" | "read" | "dnf" | "reread";

export const SHELF_LABELS: Record<ShelfStatus, string> = {
  want: "Por leer",
  reading: "Leyendo",
  read: "Leído",
  dnf: "Abandonado",
  reread: "Relectura",
};

export type Book = {
  id: string;
  title: string;
  author: string;
  year?: number;
  pages?: number;
  coverUrl?: string;
  synopsis?: string;
  genres: string[];
  communityRating?: number;
};

export type UserBook = {
  book: Book;
  status: ShelfStatus;
  rating?: number; // user's rating 0..5
  currentPage?: number;
  startedAt?: string;
  finishedAt?: string;
  tags?: string[];
};

export type Review = {
  id: string;
  user: { username: string; name: string; avatarColor: string };
  book: Pick<Book, "id" | "title" | "author" | "coverUrl">;
  rating: number;
  body: string;
  hasSpoilers?: boolean;
  likes: number;
  comments: number;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  user: { username: string; name: string; avatarColor: string };
  type: "finished" | "started" | "reviewed" | "rated";
  book: Pick<Book, "id" | "title" | "coverUrl">;
  rating?: number;
  snippet?: string;
  at: string;
};
