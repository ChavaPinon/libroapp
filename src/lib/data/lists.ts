import { createClient } from "@/lib/supabase/server";

export type ListSummary = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  books: { id: string; title: string; coverUrl?: string }[];
};

type ListRow = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  list_books: {
    position: number;
    books: { id: string; title: string; cover_url: string | null } | null;
  }[];
};

/**
 * Fetch a user's lists with their books. Pass userId for someone else's public
 * lists; omit for the current user's own. Returns [] in demo mode / logged out.
 */
export async function getLists(userId?: string): Promise<ListSummary[]> {
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
    .from("lists")
    .select(
      "id, name, description, is_public, " +
        "list_books ( position, books ( id, title, cover_url ) )"
    )
    .eq("user_id", targetId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as ListRow[]).map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    isPublic: l.is_public,
    books: (l.list_books ?? [])
      .filter((lb) => lb.books)
      .sort((a, b) => a.position - b.position)
      .map((lb) => ({
        id: lb.books!.id,
        title: lb.books!.title,
        coverUrl: lb.books!.cover_url ?? undefined,
      })),
  }));
}
