"use client";

import { useActionState, useState } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { updateProfile, type ProfileFormState } from "./profile-actions";

type Initial = {
  name: string;
  username: string;
  bio: string | null;
  avatarColor: string;
  isPublic: boolean;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    null
  );
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.avatarColor);

  return (
    <form action={formAction} className="space-y-4 rounded-app border border-border-app bg-surface-1 p-5">
      <div className="flex items-center gap-4">
        <UserAvatar name={name || "?"} color={color} size={64} />
        <div>
          <p className="text-sm font-medium">Color de avatar</p>
          <input
            type="color"
            name="avatarColor"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-9 w-14 cursor-pointer rounded border border-border-app bg-transparent"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-app border border-border-app bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre de usuario</label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-subtle">@</span>
          <input
            name="username"
            defaultValue={initial.username}
            className="w-full rounded-app border border-border-app bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="mt-1 text-xs text-subtle">3-20 caracteres · letras, números y _ · es tu URL pública</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Biografía</label>
        <textarea
          name="bio"
          defaultValue={initial.bio ?? ""}
          rows={3}
          maxLength={280}
          placeholder="Cuéntale a la comunidad qué te gusta leer…"
          className="w-full resize-none rounded-app border border-border-app bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={initial.isPublic}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        Perfil público (visible para la comunidad)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar perfil"}
        </button>
        {state && (
          <span className={`text-xs ${state.ok ? "text-success" : "text-danger"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
