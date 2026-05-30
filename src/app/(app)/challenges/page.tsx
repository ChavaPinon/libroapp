import Link from "next/link";
import { Trophy } from "lucide-react";
import { PROFILE } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getChallenge } from "@/lib/data/challenges";
import { GoalEditor } from "./goal-editor";

const YEAR = new Date().getFullYear();

const DEMO_BADGES = [
  { label: "Primer libro leído", earned: true },
  { label: "10 libros leídos", earned: true },
  { label: "Primera reseña", earned: true },
  { label: "10 reseñas", earned: false },
  { label: "50 libros leídos", earned: false },
  { label: `Meta ${YEAR} cumplida`, earned: false },
];

export default async function ChallengesPage() {
  const demo = !isSupabaseConfigured;

  // ---- demo mode ----
  if (demo) {
    const pct = (PROFILE.booksThisYear / PROFILE.challengeGoal) * 100;
    return (
      <div>
        <PageHeader title="Retos de lectura" subtitle="Ponte metas y desbloquea logros (demo)" />
        <ChallengeCard
          year={YEAR}
          goal={PROFILE.challengeGoal}
          read={PROFILE.booksThisYear}
          pct={pct}
          editor={null}
        />
        <BadgeGrid badges={DEMO_BADGES} />
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div>
        <PageHeader title="Retos de lectura" subtitle="Ponte metas y desbloquea logros" />
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">Inicia sesión para fijar tu reto de lectura.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const challenge = await getChallenge(YEAR);
  const goal = challenge?.goal ?? null;
  const read = challenge?.read ?? 0;
  const pct = goal ? (read / goal) * 100 : 0;

  return (
    <div>
      <PageHeader title="Retos de lectura" subtitle="Ponte metas y desbloquea logros" />
      <ChallengeCard
        year={YEAR}
        goal={goal}
        read={read}
        pct={pct}
        editor={<GoalEditor year={YEAR} goal={goal} />}
      />
      <BadgeGrid badges={challenge?.badges ?? DEMO_BADGES} />
    </div>
  );
}

function ChallengeCard({
  year,
  goal,
  read,
  pct,
  editor,
}: {
  year: number;
  goal: number | null;
  read: number;
  pct: number;
  editor: React.ReactNode;
}) {
  return (
    <div className="mb-8 rounded-app border border-border-app bg-surface-1 p-6">
      <div className="mb-3 flex items-center gap-3">
        <Trophy className="text-primary" size={28} />
        <div>
          <h3 className="font-semibold">Reto {year}</h3>
          <p className="text-sm text-muted">
            {goal ? `${read} de ${goal} libros` : "Aún no has fijado una meta"}
          </p>
        </div>
        {goal != null && (
          <span className="ml-auto text-2xl font-bold text-primary">{Math.round(pct)}%</span>
        )}
      </div>
      {goal != null && <ProgressBar value={pct} />}
      <div className="mt-3">{editor}</div>
    </div>
  );
}

function BadgeGrid({ badges }: { badges: { label: string; earned: boolean }[] }) {
  return (
    <>
      <h3 className="mb-4 text-lg font-semibold">Logros</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`flex flex-col items-center gap-2 rounded-app border p-5 text-center ${
              b.earned ? "border-primary/30 bg-primary/5" : "border-border-app bg-surface-1 opacity-50"
            }`}
          >
            <Trophy size={28} className={b.earned ? "text-star" : "text-subtle"} />
            <span className="text-sm font-medium">{b.label}</span>
            <Badge variant={b.earned ? "success" : "default"}>
              {b.earned ? "Desbloqueado" : "Bloqueado"}
            </Badge>
          </div>
        ))}
      </div>
    </>
  );
}
