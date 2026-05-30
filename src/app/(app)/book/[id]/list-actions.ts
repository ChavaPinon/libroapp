"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type ListActionResult = { ok: boolean; message?: string };

/** Adds a book to one of the current user's lists (idempotent). */
export async function addBookToList(
  listId: string,
  bookId: string
): Promise<ListActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  // Verify the list belongs to the user (defense in depth alongside RLS).
  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!list) return { ok: false, message: "Lista no encontrada." };

  const { error } = await supabase
    .from("list_books")
    .upsert({ list_id: listId, book_id: bookId }, { onConflict: "list_id,book_id" });

  if (error) return { ok: false, message: "No se pudo añadir a la lista." };

  revalidatePath("/lists");
  revalidatePath(`/book/${bookId}`);
  return { ok: true, message: "Añadido a la lista ✓" };
}
