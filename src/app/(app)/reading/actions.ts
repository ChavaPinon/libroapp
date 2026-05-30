"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type ProgressResult = { ok: boolean; message?: string };

/**
 * Updates the current page of a book the user is reading. If the page reaches
 * the total, the book is auto-marked as finished.
 */
export async function updateProgress(
  bookId: string,
  currentPage: number,
  totalPages: number | null
): Promise<ProgressResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const page = Math.max(0, Math.floor(currentPage));
  const finished = totalPages != null && page >= totalPages;

  const { error } = await supabase
    .from("user_books")
    .update({
      current_page: page,
      ...(finished
        ? { status: "read", finished_at: new Date().toISOString().slice(0, 10) }
        : {}),
    })
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (error) return { ok: false, message: "No se pudo actualizar." };

  revalidatePath("/reading");
  revalidatePath("/home");
  revalidatePath("/library");
  return { ok: true };
}
