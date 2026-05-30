"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { deleteReview, submitReview, type ReviewFormState } from "./review-actions";

type Existing = { rating: number; body: string; hasSpoilers: boolean } | null;

export function ReviewForm({ bookId, existing }: { bookId: string; existing: Existing }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [spoilers, setSpoilers] = useState(existing?.hasSpoilers ?? false);
  const [state, setState] = useState<ReviewFormState>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("bookId", bookId);
    fd.set("rating", String(rating));
    fd.set("body", body);
    if (spoilers) fd.set("hasSpoilers", "on");
    startTransition(async () => setState(await submitReview(null, fd)));
  }

  function onDelete() {
    startTransition(async () => {
      const res = await deleteReview(bookId);
      setState(res);
      if (res?.ok) {
        setRating(0);
        setBody("");
        setSpoilers(false);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-app border border-border-app bg-surface-1 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{existing ? "Tu reseña" : "Escribe tu reseña"}</h3>
        <StarRating value={rating} onChange={setRating} size={20} />
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="¿Qué te pareció? Comparte tu opinión con la comunidad…"
        className="w-full resize-none rounded-app border border-border-app bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={spoilers}
            onChange={(e) => setSpoilers(e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Contiene spoilers
        </label>

        <div className="ml-auto flex items-center gap-2">
          {existing && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="rounded-app border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-60"
            >
              Borrar
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-app bg-primary px-4 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Publicando…" : existing ? "Actualizar" : "Publicar reseña"}
          </button>
        </div>
      </div>

      {state && (
        <p className={`text-xs ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>
      )}
    </form>
  );
}
