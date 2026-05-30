import { createClient } from "@/lib/supabase/server";
import type { ActivityItem, UserBook } from "@/lib/types";
import { getLibrary } from "./library";

/** Books the current user is currently reading (for the "continue reading" row). */
export async function getCurrentlyReading(): Promise<UserBook[]> {
  const all = await getLibrary();
  return all.filter((b) => b.status === "reading");
}

type ActivityRow = {
  id: string;
  type: ActivityItem["type"];
  rating: number | null;
  snippet: string | null;
  created_at: string;
  profiles: { username: string; name: string; avatar_color: string } | null;
  books: { id: string; title: string; cover_url: string | null } | null;
};

/**
 * Community activity feed (most recent first). RLS already restricts this to
 * public profiles + the user's own activity. Returns [] in demo mode.
 */
export async function getActivityFeed(limit = 20): Promise<ActivityItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("activity")
    .select(
      "id, type, rating, snippet, created_at, " +
        "profiles ( username, name, avatar_color ), " +
        "books ( id, title, cover_url )"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as ActivityRow[])
    .filter((r) => r.profiles && r.books)
    .map((r) => ({
      id: r.id,
      type: r.type,
      rating: r.rating ?? undefined,
      snippet: r.snippet ?? undefined,
      at: r.created_at,
      user: {
        username: r.profiles!.username,
        name: r.profiles!.name,
        avatarColor: r.profiles!.avatar_color,
      },
      book: {
        id: r.books!.id,
        title: r.books!.title,
        coverUrl: r.books!.cover_url ?? undefined,
      },
    }));
}
