import { createClient } from "@/lib/supabase/server";
import { getLibrary } from "./library";
import { computeStats } from "./stats";

export type ChallengeView = {
  year: number;
  goal: number | null; // null = no challenge set yet
  read: number; // books finished this year
  badges: { label: string; earned: boolean }[];
};

/**
 * Builds the challenge view for the current user: their yearly goal (if any),
 * real progress, and achievement badges derived from their data. Returns null
 * in demo mode / when logged out.
 */
export async function getChallenge(year: number): Promise<ChallengeView | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: challenge }, library, { count: reviewCount }] = await Promise.all([
    supabase
      .from("challenges")
      .select("goal")
      .eq("user_id", user.id)
      .eq("year", year)
      .maybeSingle<{ goal: number }>(),
    getLibrary(user.id),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const stats = computeStats(library, year);
  const totalRead = stats.totalRead;
  const reviews = reviewCount ?? 0;

  // Badges computed live from real activity (no separate table needed).
  const badges = [
    { label: "Primer libro leído", earned: totalRead >= 1 },
    { label: "10 libros leídos", earned: totalRead >= 10 },
    { label: "50 libros leídos", earned: totalRead >= 50 },
    { label: "Primera reseña", earned: reviews >= 1 },
    { label: "10 reseñas", earned: reviews >= 10 },
    { label: `Meta ${year} cumplida`, earned: challenge?.goal != null && stats.booksThisYear >= challenge.goal },
  ];

  return {
    year,
    goal: challenge?.goal ?? null,
    read: stats.booksThisYear,
    badges,
  };
}
