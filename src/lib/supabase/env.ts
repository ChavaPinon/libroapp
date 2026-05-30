// Single source of truth for whether Supabase is configured. Until the user
// creates their project and fills .env.local, the app stays in "demo mode"
// (mock data, decorative auth) instead of crashing on missing env vars.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Accept either the new publishable key (sb_publishable_...) or the classic
// anon JWT (eyJ...). Supabase exposes both; whichever the user pasted works.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
