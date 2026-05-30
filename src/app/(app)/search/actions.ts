"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { OpenLibraryBook } from "@/lib/openlibrary";
import type { ShelfStatus } from "@/lib/types";

export type AddBookResult = { ok: boolean; message: string };

/**
 * Adds an Open Library book to the current user's shelf.
 *  1. Upsert the book into `books` (deduped by external_id).
 *  2. Upsert the user_books row with the chosen shelf status.
 * RLS guarantees the user can only write their own user_books row.
 */
export async function addBookToShelf(
  book: OpenLibraryBook,
  status: ShelfStatus
): Promise<AddBookResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión para guardar libros." };

  // 1) Upsert the book; return its id whether it was inserted or already existed.
  const { data: bookRow, error: bookErr } = await supabase
    .from("books")
    .upsert(
      {
        external_id: book.externalId,
        title: book.title,
        author: book.author,
        year: book.year ?? null,
        pages: book.pages ?? null,
        cover_url: book.coverUrl ?? null,
        genres: book.genres,
      },
      { onConflict: "external_id" }
    )
    .select("id")
    .single();

  if (bookErr || !bookRow) {
    return { ok: false, message: "No se pudo guardar el libro." };
  }

  // 2) Upsert the shelf entry for this user.
  const { error: shelfErr } = await supabase.from("user_books").upsert(
    {
      user_id: user.id,
      book_id: bookRow.id,
      status,
    },
    { onConflict: "user_id,book_id" }
  );

  if (shelfErr) {
    return { ok: false, message: "No se pudo añadir a tu estantería." };
  }

  revalidatePath("/library");
  revalidatePath("/home");
  return { ok: true, message: "Añadido a tu estantería ✓" };
}
