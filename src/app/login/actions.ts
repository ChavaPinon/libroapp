"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Resolve the public origin (works locally and on Vercel) for the magic-link
// redirect target.
async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Send a magic-link email. Returns a status the form can show. */
export async function signInWithMagicLink(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "Escribe tu correo." };

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Backend aún no conectado. Configura Supabase para activar el login.",
    };
  }
  const origin = await getOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { ok: false, message: "No se pudo enviar el enlace. Intenta de nuevo." };
  return { ok: true, message: "¡Listo! Revisa tu correo para el enlace de acceso." };
}

/** Sign the user out and return to the landing page. */
export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
