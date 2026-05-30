"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type ProfileFormState = { ok: boolean; message: string } | null;

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/**
 * Updates the current user's profile. Validates and normalizes the username
 * (lowercase, 3-20 chars, [a-z0-9_]) and checks uniqueness before saving.
 */
export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Backend no conectado." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Inicia sesión." };

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarColor = String(formData.get("avatarColor") ?? "").trim();
  const isPublic = formData.get("isPublic") === "on";

  if (!name) return { ok: false, message: "El nombre no puede estar vacío." };
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      message: "Usuario inválido: 3-20 caracteres, solo letras, números y _ (minúsculas).",
    };
  }

  // Username uniqueness check (excluding the current user).
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (taken) return { ok: false, message: "Ese nombre de usuario ya está en uso." };

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      username,
      bio: bio || null,
      avatar_color: avatarColor || "#6f4e2e",
      is_public: isPublic,
    })
    .eq("id", user.id);

  if (error) return { ok: false, message: "No se pudo guardar el perfil." };

  revalidatePath("/settings");
  revalidatePath(`/u/${username}`);
  revalidatePath("/home");
  return { ok: true, message: "Perfil actualizado ✓" };
}
