"use client";

import { useState } from "react";
import Link from "next/link";
import { BookHeart, BookOpen, Sparkles } from "lucide-react";
import { MagicLinkForm } from "./magic-link-form";

/**
 * "Open book" auth experience. A closed cover flips open in 3D to reveal a
 * two-page spread: welcome on the left, access (magic link) on the right.
 * Pure CSS 3D transforms (rotateY + perspective) — no animation library.
 */
export function BookAuth({ hasError }: { hasError: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="book-scene">
        <div className={`book ${open ? "is-open" : ""}`}>
          {/* ---- Inside spread (revealed when open) ---- */}
          <div className="book-spread">
            {/* Left page: welcome */}
            <div className="book-page book-page--left">
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <BookHeart className="text-primary" size={40} />
                <h1 className="font-display text-2xl font-bold">LibroApp</h1>
                <p className="text-sm leading-relaxed text-muted">
                  Tu bitácora de lectura. Lleva el rastro de tus libros, escribe reseñas y
                  comparte tu viaje lector con la comunidad.
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
                  <Sparkles size={13} /> Sin contraseñas — solo tu correo
                </div>
              </div>
            </div>

            {/* Center fold/spine */}
            <div className="book-fold" />

            {/* Right page: access */}
            <div className="book-page book-page--right">
              <div className="flex h-full flex-col justify-center">
                <h2 className="font-display text-lg font-semibold">Inicia sesión o regístrate</h2>
                <p className="mb-5 text-sm text-muted">
                  Te enviaremos un enlace mágico. Si es tu primera vez, creamos tu cuenta al
                  instante.
                </p>

                {hasError && (
                  <p className="mb-4 rounded-app bg-danger/10 px-3 py-2 text-xs text-danger">
                    Hubo un problema al iniciar sesión. Intenta de nuevo.
                  </p>
                )}

                <MagicLinkForm />

                <p className="mt-4 text-center text-xs text-subtle">
                  ¿Solo curioseando?{" "}
                  <Link href="/home" className="text-accent hover:underline">
                    Explorar →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* ---- Front cover (flips open) ---- */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="book-cover"
            aria-label="Abrir el libro"
          >
            <div className="book-cover__inner">
              <BookHeart size={56} className="text-primary-fg/90" />
              <span className="font-display text-3xl font-bold text-primary-fg">LibroApp</span>
              <span className="text-sm text-primary-fg/70">Tu bitácora de lectura</span>
              <span className="mt-6 flex items-center gap-2 rounded-full border border-primary-fg/30 px-4 py-1.5 text-sm text-primary-fg/90">
                <BookOpen size={15} /> Abrir el libro
              </span>
            </div>
            <span className="book-cover__spine" />
          </button>
        </div>
      </div>
    </div>
  );
}
