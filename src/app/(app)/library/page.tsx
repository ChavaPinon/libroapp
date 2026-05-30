import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getLibrary } from "@/lib/data/library";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MY_BOOKS } from "@/lib/mock-data";
import { LibraryGrid } from "./library-grid";

export default async function LibraryPage() {
  // Demo mode (no backend): keep showing the mock library so the UI still demoes.
  if (!isSupabaseConfigured) {
    return (
      <div>
        <PageHeader
          title="Mi Biblioteca"
          subtitle={`${MY_BOOKS.length} libros · (demo — backend no conectado)`}
        />
        <LibraryGrid books={MY_BOOKS} />
      </div>
    );
  }

  const user = await getCurrentUser();

  // Backend ready but not logged in.
  if (!user) {
    return (
      <div>
        <PageHeader title="Mi Biblioteca" subtitle="Tu estantería personal" />
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">Inicia sesión para ver y construir tu biblioteca.</p>
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

  // Real data.
  const books = await getLibrary();

  return (
    <div>
      <PageHeader
        title="Mi Biblioteca"
        subtitle={`${books.length} ${books.length === 1 ? "libro" : "libros"} en tu estantería`}
      />

      {books.length === 0 ? (
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">Tu estantería está vacía. ¡Agrega tu primer libro!</p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            <Search size={16} /> Buscar libros
          </Link>
        </div>
      ) : (
        <LibraryGrid books={books} />
      )}
    </div>
  );
}
