import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Reads/writes the session cookies via Next's async cookie store.
 *
 * Returns `null` when Supabase isn't configured yet (demo mode) — callers
 * should fall back to mock data / decorative behavior.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — cookies can't be written here.
          // The proxy refreshes the session instead.
        }
      },
    },
  });
}
