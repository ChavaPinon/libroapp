"use client";

import { useActionState } from "react";
import { signInWithMagicLink } from "./actions";

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(signInWithMagicLink, null);

  return (
    <form action={formAction}>
      <input
        type="email"
        name="email"
        required
        placeholder="tu@correo.com"
        className="mb-3 w-full rounded-app border border-border-app bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-app bg-primary py-2.5 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar enlace mágico"}
      </button>

      {state && (
        <p className={`mt-3 text-center text-xs ${state.ok ? "text-success" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
