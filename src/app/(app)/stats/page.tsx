import Link from "next/link";
import { BookOpen, Star, FileText, Library } from "lucide-react";
import { MY_BOOKS } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getLibrary } from "@/lib/data/library";
import { computeStats } from "@/lib/data/stats";

const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Reporting year. Passed in from the server's clock (Server Components can use
// Date freely; this avoids hardcoding 2026).
const YEAR = new Date().getFullYear();

function StatWidget({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-app border border-border-app bg-surface-1 p-4">
      <Icon className="text-primary" size={20} />
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export default async function StatsPage() {
  const demo = !isSupabaseConfigured;
  const user = demo ? null : await getCurrentUser();

  if (!demo && !user) {
    return (
      <div>
        <PageHeader title="Tus estadísticas" subtitle="Tu año en libros" />
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">Inicia sesión para ver tus estadísticas de lectura.</p>
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

  const library = demo ? MY_BOOKS : await getLibrary();
  const stats = computeStats(library, YEAR);
  const maxMonth = Math.max(1, ...stats.booksPerMonth);

  return (
    <div>
      <PageHeader title="Tus estadísticas" subtitle={`Tu año en libros, ${YEAR}`} />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatWidget icon={BookOpen} label={`Libros en ${YEAR}`} value={`${stats.booksThisYear}`} />
        <StatWidget
          icon={Star}
          label="Puntuación media"
          value={stats.avgRating != null ? `${stats.avgRating}` : "—"}
        />
        <StatWidget
          icon={FileText}
          label={`Páginas en ${YEAR}`}
          value={stats.pagesThisYear.toLocaleString("es")}
        />
        <StatWidget icon={Library} label="Total leídos" value={`${stats.totalRead}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-app border border-border-app bg-surface-1 p-5">
          <h3 className="mb-4 text-sm font-semibold">Libros por mes</h3>
          <div className="flex h-40 items-end gap-1.5">
            {stats.booksPerMonth.map((n, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${(n / maxMonth) * 100}%`, minHeight: n ? 4 : 0 }}
                  title={`${n} libros`}
                />
                <span className="text-[10px] text-subtle">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-app border border-border-app bg-surface-1 p-5">
          <h3 className="mb-4 text-sm font-semibold">Géneros más leídos</h3>
          {stats.genres.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Aún no hay suficientes datos. Marca libros como leídos para ver tus géneros.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.genres.map(({ genre, pct }) => (
                <div key={genre}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-text">{genre}</span>
                    <span className="text-muted">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {demo && (
        <p className="mt-6 text-center text-xs text-subtle">(demo — backend no conectado)</p>
      )}
    </div>
  );
}
