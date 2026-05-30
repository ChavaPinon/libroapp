"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type FollowResult = { ok: boolean; following?: boolean; message?: string };

/** Follow or unfollow a target user by their profile id. Idempotent toggle. */
export async function toggleFollow(
  targetId: string,
  targetUsername: string,
  currentlyFollowing: boolean
): Promise<FollowResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión para seguir." };
  if (user.id === targetId) return { ok: false, message: "No puedes seguirte a ti mismo." };

  if (currentlyFollowing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
    if (error) return { ok: false, message: "No se pudo dejar de seguir." };
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetId });
    if (error) return { ok: false, message: "No se pudo seguir." };
  }

  revalidatePath(`/u/${targetUsername}`);
  revalidatePath("/home");
  return { ok: true, following: !currentlyFollowing };
}
