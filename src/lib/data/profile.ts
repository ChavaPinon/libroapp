import { createClient } from "@/lib/supabase/server";
import type { Review, UserBook } from "@/lib/types";
import { getLibrary } from "./library";

export type PublicProfile = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatarColor: string;
  isPublic: boolean;
  followers: number;
  following: number;
  library: UserBook[];
  reviews: Review[];
  /** Viewer context for the follow button. */
  isSelf: boolean;
  isFollowing: boolean;
  viewerLoggedIn: boolean;
};

type ProfileRow = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar_color: string;
  is_public: boolean;
};

type ReviewRow = {
  id: string;
  rating: number;
  body: string;
  has_spoilers: boolean;
  created_at: string;
  books: { id: string; title: string; author: string; cover_url: string | null } | null;
};

/** Fetch a public profile by username, or null if missing / not configured. */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, name, bio, avatar_color, is_public")
    .eq("username", username)
    .maybeSingle<ProfileRow>();

  if (!profile) return null;

  // Viewer context (for the follow button).
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();
  const isSelf = viewer?.id === profile.id;

  let isFollowing = false;
  if (viewer && !isSelf) {
    const { data: rel } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", viewer.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    isFollowing = !!rel;
  }

  // Reuse the library loader for this user (RLS already enforces visibility).
  const library = await getLibrary(profile.id);

  const [{ count: followers }, { count: following }, { data: reviewRows }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase
      .from("reviews")
      .select("id, rating, body, has_spoilers, created_at, books ( id, title, author, cover_url )")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const reviews: Review[] = ((reviewRows as unknown as ReviewRow[]) ?? [])
    .filter((r) => r.books)
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      hasSpoilers: r.has_spoilers,
      likes: 0,
      comments: 0,
      createdAt: r.created_at,
      user: { username: profile.username, name: profile.name, avatarColor: profile.avatar_color },
      book: {
        id: r.books!.id,
        title: r.books!.title,
        author: r.books!.author,
        coverUrl: r.books!.cover_url ?? undefined,
      },
    }));

  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    avatarColor: profile.avatar_color,
    isPublic: profile.is_public,
    followers: followers ?? 0,
    following: following ?? 0,
    library,
    reviews,
    isSelf,
    isFollowing,
    viewerLoggedIn: !!viewer,
  };
}
