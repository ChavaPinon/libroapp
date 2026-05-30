import Link from "next/link";
import { BookHeart, BarChart3, Users, Palette } from "lucide-react";

const FEATURES = [
  { icon: BookHeart, title: "Tu biblioteca", text: "Organiza por leer, leyendo y leídos. Reseña y puntúa cada libro." },
  { icon: BarChart3, title: "Estadísticas", text: "Mira tu progreso, géneros favoritos y tu año en libros." },
  { icon: Users, title: "Comunidad", text: "Perfil público compartible, sigue lectores y descubre reseñas." },
  { icon: Palette, title: "Temas a tu gusto", text: "Modo oscuro con temas personalizables hasta el último color." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <BookHeart className="text-primary" size={24} />
          <span className="text-lg font-bold">LibroApp</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-app px-4 py-2 text-sm hover:bg-surface-2">
            Iniciar sesión
          </Link>
          <Link
            href="/home"
            className="rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Entrar a la demo
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Tu bitácora de lectura, <span className="text-primary">bonita</span> y{" "}
          <span className="text-accent">tuya</span>.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Lleva el rastro de tus libros, escribe reseñas, sigue tu progreso y comparte tu perfil
          lector con la comunidad.
        </p>
        <Link
          href="/home"
          className="mt-8 rounded-app bg-primary px-6 py-3 font-medium text-primary-fg hover:bg-primary-hover"
        >
          Explorar la app →
        </Link>

        <div className="mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-app border border-border-app bg-surface-1 p-5 text-left">
              <Icon className="text-primary" size={22} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border-app py-6 text-center text-xs text-subtle">
        LibroApp — prototipo de UI · construido con Next.js + Tailwind
      </footer>
    </div>
  );
}
