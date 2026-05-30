import Link from "next/link";
import { ListChecks, Lock, Globe } from "lucide-react";
import { BOOKS } from "@/lib/mock-data";
import { BookCover } from "@/components/book/book-cover";
import { PageHeader } from "@/components/ui/page-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getLists } from "@/lib/data/lists";
import { ListsClient } from "./lists-client";

// Demo fallback so the page still showcases the UI without a backend.
const DEMO_LISTS = [
  { id: "scifi", name: "Mi top ciencia ficción", isPublic: true, bookIds: ["dune", "1984", "fahrenheit"] },
  { id: "magia", name: "Realismo mágico esencial", isPublic: true, bookIds: ["cien-anos", "casa-espiritus"] },
  { id: "pendientes", name: "Para el verano", isPublic: false, bookIds: ["hobbit", "name-wind", "principito"] },
];

export default async function ListsPage() {
  const demo = !isSupabaseConfigured;

  if (demo) {
    return (
      <div>
        <PageHeader title="Mis listas" subtitle="Colecciones curadas (demo)" />
        <div className="space-y-4">
          {DEMO_LISTS.map((list) => {
            const books = list.bookIds.map((id) => BOOKS.find((b) => b.id === id)!).filter(Boolean);
            return (
              <div key={list.id} className="rounded-app border border-border-app bg-surface-1 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ListChecks className="text-primary" size={18} />
                  <h3 className="font-semibold">{list.name}</h3>
                  <span className="ml-auto flex items-center gap-1 text-xs text-subtle">
                    {list.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                    {list.isPublic ? "Pública" : "Privada"} · {books.length} libros
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {books.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} className="w-16 shrink-0">
                      <BookCover src={book.coverUrl} title={book.title} />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div>
        <PageHeader title="Mis listas" subtitle="Colecciones curadas por ti" />
        <div className="rounded-app border border-dashed border-border-app py-16 text-center">
          <p className="text-muted">Inicia sesión para crear tus listas.</p>
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

  const lists = await getLists();
  return <ListsClient lists={lists} />;
}
