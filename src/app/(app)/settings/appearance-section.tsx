"use client";

import { RotateCcw } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import {
  contrastRating,
  contrastRatio,
  EDITABLE_TOKENS,
  THEMES,
  type ThemeTokens,
} from "@/lib/themes";
import { StarRating } from "@/components/ui/star-rating";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { baseId, effective, setBaseTheme, setToken, resetOverrides } = useTheme();

  // Accessibility guardrail: text on background contrast.
  const ratio = contrastRatio(effective.text, effective.bg);
  const rating = contrastRating(ratio);

  return (
    <div>
      {/* Base themes */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">Temas base</h2>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setBaseTheme(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-app border px-3 py-2 text-sm",
                baseId === t.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-app hover:bg-surface-2"
              )}
            >
              <span className="flex gap-0.5">
                {[t.tokens.bg, t.tokens.surface2, t.tokens.primary, t.tokens.accent].map((c, i) => (
                  <span key={i} className="h-5 w-2.5 rounded-sm ring-1 ring-black/20" style={{ background: c }} />
                ))}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Editor */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted">Personalizar</h2>
            <button
              onClick={resetOverrides}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <RotateCcw size={12} /> Restablecer
            </button>
          </div>

          <div className="space-y-3 rounded-app border border-border-app bg-surface-1 p-4">
            {EDITABLE_TOKENS.map(({ key, label, kind }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="text-sm">{label}</label>
                {kind === "color" ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-subtle">{effective[key]}</span>
                    <input
                      type="color"
                      value={effective[key]}
                      onChange={(e) => setToken(key as keyof ThemeTokens, e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-border-app bg-transparent"
                    />
                  </div>
                ) : (
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.125}
                    value={parseFloat(effective[key])}
                    onChange={(e) => setToken(key as keyof ThemeTokens, `${e.target.value}rem`)}
                    className="w-32 accent-[var(--primary)]"
                  />
                )}
              </div>
            ))}

            {/* Contrast guardrail */}
            <div className="flex items-center justify-between border-t border-border-app pt-3 text-xs">
              <span className="text-muted">Contraste texto / fondo</span>
              <Badge variant={rating === "fail" ? "danger" : "success"}>
                {ratio ? ratio.toFixed(1) : "—"} · {rating === "fail" ? "Bajo ⚠" : `${rating} ✓`}
              </Badge>
            </div>
          </div>

          <p className="mt-2 text-xs text-subtle">
            Los cambios se aplican y guardan al instante en este navegador.
          </p>
        </section>

        {/* Live preview */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted">Vista previa en vivo</h2>
          <div className="space-y-3 rounded-app border border-border-app bg-bg p-4">
            <div className="rounded-app border border-border-app bg-surface-1 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Dune</h3>
                <Badge variant="primary">Leyendo</Badge>
              </div>
              <p className="text-sm text-muted">Frank Herbert</p>
              <div className="mt-2">
                <StarRating value={4.5} size={16} />
              </div>
              <div className="mt-3">
                <ProgressBar value={62} showLabel />
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-app bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg">
                  Primario
                </button>
                <button className="rounded-app px-3 py-1.5 text-sm font-medium text-accent ring-1 ring-[var(--accent)]">
                  Acento
                </button>
              </div>
            </div>
            <p className="text-sm text-text">Texto principal de ejemplo.</p>
            <p className="text-sm text-muted">Texto secundario más tenue.</p>
            <p className="text-sm text-subtle">Texto sutil para captions.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
