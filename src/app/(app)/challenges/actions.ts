"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type ChallengeResult = { ok: boolean; message?: string };

/** Sets (or updates) the current user's reading goal for a given year. */
export async function setChallengeGoal(year: number, goal: number): Promise<ChallengeResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  if (!Number.isFinite(goal) || goal < 1 || goal > 1000) {
    return { ok: false, message: "Pon una meta entre 1 y 1000 libros." };
  }

  const { error } = await supabase
    .from("challenges")
    .upsert({ user_id: user.id, year, goal: Math.floor(goal) }, { onConflict: "user_id,year" });

  if (error) return { ok: false, message: "No se pudo guardar la meta." };

  revalidatePath("/challenges");
  return { ok: true };
}
