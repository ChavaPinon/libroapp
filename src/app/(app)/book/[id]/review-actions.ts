"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type ReviewFormState = { ok: boolean; message: string } | null;

/**
 * Creates or updates the current user's review for a book (one per user/book,
 * enforced by the unique constraint). Also records an activity entry so the
 * review shows up in the community feed.
 */
export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión para reseñar." };

  const bookId = String(formData.get("bookId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();
  const hasSpoilers = formData.get("hasSpoilers") === "on";

  if (!bookId) return { ok: false, message: "Libro inválido." };
  if (rating < 0.5 || rating > 5) return { ok: false, message: "Pon una puntuación." };
  if (body.length < 3) return { ok: false, message: "Escribe algo en tu reseña." };

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      rating,
      body,
      has_spoilers: hasSpoilers,
    },
    { onConflict: "user_id,book_id" }
  );

  if (error) return { ok: false, message: "No se pudo publicar la reseña." };

  // Record activity for the community feed (best-effort; ignore failures).
  await supabase.from("activity").insert({
    user_id: user.id,
    type: "reviewed",
    book_id: bookId,
    rating,
    snippet: body.slice(0, 160),
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath("/home");
  revalidatePath(`/u/${user.profile?.username ?? ""}`);
  return { ok: true, message: "Reseña publicada ✓" };
}

/** Deletes the current user's review for a book. */
export async function deleteReview(bookId: string): Promise<ReviewFormState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (error) return { ok: false, message: "No se pudo borrar." };

  revalidatePath(`/book/${bookId}`);
  return { ok: true, message: "Reseña eliminada." };
}
