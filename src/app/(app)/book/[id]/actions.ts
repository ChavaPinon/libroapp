"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { ShelfStatus } from "@/lib/types";

type Result = { ok: boolean; message?: string };

/**
 * Upserts the current user's shelf row for a book that already exists in the
 * catalog (by UUID). Used from the book detail page to change status / rating.
 */
async function upsertShelf(
  bookId: string,
  patch: { status?: ShelfStatus; rating?: number }
): Promise<Result> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase.from("user_books").upsert(
    { user_id: user.id, book_id: bookId, ...patch },
    { onConflict: "user_id,book_id" }
  );

  if (error) return { ok: false, message: "No se pudo guardar." };

  revalidatePath(`/book/${bookId}`);
  revalidatePath("/library");
  revalidatePath("/home");
  return { ok: true };
}

export async function setShelfStatus(bookId: string, status: ShelfStatus) {
  return upsertShelf(bookId, { status });
}

export async function setRating(bookId: string, rating: number) {
  return upsertShelf(bookId, { rating });
}
