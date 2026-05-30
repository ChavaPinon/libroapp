"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type ListFormState = { ok: boolean; message: string } | null;

/** Creates a new (empty) list for the current user. */
export async function createList(
  _prev: ListFormState,
  formData: FormData
): Promise<ListFormState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isPublic = formData.get("isPublic") === "on";

  if (name.length < 2) return { ok: false, message: "Ponle un nombre a tu lista." };

  const { error } = await supabase.from("lists").insert({
    user_id: user.id,
    name,
    description: description || null,
    is_public: isPublic,
  });

  if (error) return { ok: false, message: "No se pudo crear la lista." };

  revalidatePath("/lists");
  return { ok: true, message: "Lista creada ✓" };
}

/** Deletes a list (and its items, via cascade) owned by the current user. */
export async function deleteList(listId: string): Promise<ListFormState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: "No se pudo borrar." };

  revalidatePath("/lists");
  return { ok: true, message: "Lista eliminada." };
}
