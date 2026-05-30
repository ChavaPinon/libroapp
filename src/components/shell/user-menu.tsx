"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { signOut } from "@/app/login/actions";

export type MenuUser = {
  name: string;
  username: string;
  avatarColor: string;
} | null;

/** Avatar dropdown in the topbar: profile, settings, sign out. */
export function UserMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Logged out → a simple link to /login.
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Tu cuenta">
        <UserAvatar name={user.name} color={user.avatarColor} size={34} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-app border border-border-app bg-surface-1 shadow-xl">
          <div className="border-b border-border-app px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted">@{user.username}</p>
          </div>
          <Link
            href={`/u/${user.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
          >
            <User size={15} /> Mi perfil público
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
          >
            <Settings size={15} /> Ajustes
          </Link>
          <button
            onClick={() => startTransition(() => signOut())}
            disabled={pending}
            className="flex w-full items-center gap-2 border-t border-border-app px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            <LogOut size={15} /> {pending ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}
