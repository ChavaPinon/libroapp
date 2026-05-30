import { createClient } from "./server";

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: {
    username: string;
    name: string;
    avatarColor: string;
    bio: string | null;
    isPublic: boolean;
  } | null;
};

/**
 * Returns the logged-in user + their profile row, or null if anonymous /
 * Supabase not configured. Use in Server Components and Server Actions.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, name, avatar_color, bio, is_public")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile
      ? {
          username: profile.username,
          name: profile.name,
          avatarColor: profile.avatar_color,
          bio: profile.bio,
          isPublic: profile.is_public,
        }
      : null,
  };
}
