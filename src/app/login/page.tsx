import Link from "next/link";
import { BookHeart } from "lucide-react";
import { signInWithGoogle } from "./actions";
import { MagicLinkForm } from "./magic-link-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const { error } = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <BookHeart className="text-primary" size={28} />
          <span className="text-xl font-bold">LibroApp</span>
        </div>

        <div className="rounded-app border border-border-app bg-surface-1 p-6">
          <h1 className="mb-1 text-lg font-semibold">Inicia sesión</h1>
          <p className="mb-5 text-sm text-muted">Continúa tu viaje lector</p>

          {error === "demo" ? (
            <p className="mb-4 rounded-app bg-warning/10 px-3 py-2 text-xs text-warning">
              El backend aún no está conectado. Configura Supabase (.env.local) para activar
              el inicio de sesión.
            </p>
          ) : error ? (
            <p className="mb-4 rounded-app bg-danger/10 px-3 py-2 text-xs text-danger">
              Hubo un problema al iniciar sesión. Intenta de nuevo.
            </p>
          ) : null}

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="mb-3 w-full rounded-app border border-border-app py-2.5 text-sm font-medium hover:bg-surface-2"
            >
              Continuar con Google
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-subtle">
            <span className="h-px flex-1 bg-border-app" /> o{" "}
            <span className="h-px flex-1 bg-border-app" />
          </div>

          <MagicLinkForm />

          <p className="mt-4 text-center text-xs text-subtle">
            ¿Aún sin backend conectado?{" "}
            <Link href="/home" className="text-accent hover:underline">
              Ver la demo →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
