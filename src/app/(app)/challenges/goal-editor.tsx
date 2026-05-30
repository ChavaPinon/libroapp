"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { setChallengeGoal } from "./actions";

export function GoalEditor({ year, goal }: { year: number; goal: number | null }) {
  const [editing, setEditing] = useState(goal == null);
  const [value, setValue] = useState(goal ?? 24);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await setChallengeGoal(year, value);
      if (res.ok) setEditing(false);
      else setError(res.message ?? "Error");
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 text-xs text-accent hover:underline"
      >
        <Pencil size={12} /> Cambiar meta
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={1}
        max={1000}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-9 w-24 rounded-app border border-border-app bg-bg px-2 text-sm outline-none focus:border-primary"
      />
      <span className="text-sm text-muted">libros en {year}</span>
      <button
        onClick={save}
        disabled={pending}
        className="rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar meta"}
      </button>
      {goal != null && (
        <button
          onClick={() => setEditing(false)}
          className="rounded-app border border-border-app px-3 py-1.5 text-sm hover:bg-surface-2"
        >
          Cancelar
        </button>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
