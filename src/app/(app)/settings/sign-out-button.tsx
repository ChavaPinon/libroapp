"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => signOut())}
      disabled={pending}
      className="flex items-center gap-2 rounded-app border border-danger/40 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
    >
      <LogOut size={15} /> {pending ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );
}
