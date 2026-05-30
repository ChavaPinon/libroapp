import { getCurrentUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SearchClient } from "./search-client";

export default async function SearchPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <SearchClient isLoggedIn={!!user} backendReady={isSupabaseConfigured} />
    </div>
  );
}
