// Theme system — every theme is a flat map of CSS variable values.
// The ThemeProvider applies these onto :root, and the theme editor
// lets the user override any single token (persisted in localStorage,
// later in users.theme_config). No component hardcodes a color; they
// only consume these semantic tokens via Tailwind utilities.

export type ThemeTokens = {
  bg: string;
  surface1: string;
  surface2: string;
  surface3: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryHover: string;
  primaryFg: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  star: string;
  progress: string;
  radius: string;
};

export type ThemeDef = {
  id: string;
  name: string;
  mode: "dark" | "light";
  tokens: ThemeTokens;
};

// Maps our token keys -> the CSS custom property names used in globals.css.
export const TOKEN_TO_CSSVAR: Record<keyof ThemeTokens, string> = {
  bg: "--bg",
  surface1: "--surface-1",
  surface2: "--surface-2",
  surface3: "--surface-3",
  border: "--border",
  text: "--text",
  textMuted: "--text-muted",
  textSubtle: "--text-subtle",
  primary: "--primary",
  primaryHover: "--primary-hover",
  primaryFg: "--primary-fg",
  accent: "--accent",
  success: "--success",
  warning: "--warning",
  danger: "--danger",
  info: "--info",
  star: "--star",
  progress: "--progress",
  radius: "--radius",
};

// Editable groups shown in the theme editor UI.
export const EDITABLE_TOKENS: { key: keyof ThemeTokens; label: string; kind: "color" | "size" }[] = [
  { key: "bg", label: "Fondo", kind: "color" },
  { key: "surface1", label: "Superficie", kind: "color" },
  { key: "surface2", label: "Superficie elevada", kind: "color" },
  { key: "border", label: "Borde", kind: "color" },
  { key: "text", label: "Texto", kind: "color" },
  { key: "textMuted", label: "Texto secundario", kind: "color" },
  { key: "primary", label: "Primario", kind: "color" },
  { key: "accent", label: "Acento", kind: "color" },
  { key: "star", label: "Estrellas", kind: "color" },
  { key: "progress", label: "Progreso", kind: "color" },
  { key: "radius", label: "Radio de borde", kind: "size" },
];

// Shared semantics tuned for the warm, classic "study / library" identity:
// muted, earthy success/info instead of neon; a warm gold for stars.
const base = {
  success: "#5c8a4a", // sage green
  warning: "#c98a3c", // amber
  danger: "#b04a3a", // brick red
  info: "#5a7a8c", // slate blue
  star: "#c9972b", // warm gold
  radius: "0.5rem", // slightly tighter, more "bookish"
};

// --- Family: amaderado / estudio clásico ------------------------------------
// Two daily drivers (Día / Noche) plus warm variants (Cuero / Salvia).
export const THEMES: ThemeDef[] = [
  {
    id: "study-day",
    name: "Estudio Día",
    mode: "light",
    tokens: {
      ...base,
      bg: "#f3eadb", // pergamino cálido
      surface1: "#fbf6ec", // papel
      surface2: "#efe3d0", // tarjeta hundida
      surface3: "#e6d8c0",
      border: "#ddccb0",
      text: "#3a2f25", // tinta sepia oscura
      textMuted: "#7a6a55",
      textSubtle: "#a3927a",
      primary: "#6f4e2e", // madera nogal
      primaryHover: "#5c3f24",
      primaryFg: "#fbf6ec",
      accent: "#4f6f52", // verde botella
      progress: "#6f4e2e",
    },
  },
  {
    id: "study-night",
    name: "Estudio Noche",
    mode: "dark",
    tokens: {
      ...base,
      bg: "#1c1712", // madera oscura
      surface1: "#26201a",
      surface2: "#322a22",
      surface3: "#3e342a",
      border: "#473b2f",
      text: "#ece0cf", // papel viejo
      textMuted: "#b8a589",
      textSubtle: "#8a7a63",
      primary: "#c08a4e", // madera iluminada / latón
      primaryHover: "#d49d60",
      primaryFg: "#1c1712",
      accent: "#8aa67a", // verde salvia
      progress: "#c08a4e",
    },
  },
  {
    id: "leather",
    name: "Cuero",
    mode: "dark",
    tokens: {
      ...base,
      bg: "#201512", // cuero envejecido
      surface1: "#2c1e19",
      surface2: "#3a2922",
      surface3: "#48342b",
      border: "#523c31",
      text: "#f0e2d4",
      textMuted: "#c2a991",
      textSubtle: "#917762",
      primary: "#a8553a", // cuero teñido / terracota
      primaryHover: "#bf6648",
      primaryFg: "#f0e2d4",
      accent: "#caa052", // dorado tenue
      star: "#caa052",
      progress: "#a8553a",
    },
  },
  {
    id: "sage",
    name: "Salvia",
    mode: "light",
    tokens: {
      ...base,
      bg: "#eef0e6", // verde herbario muy claro
      surface1: "#f7f8f1",
      surface2: "#e3e7d6",
      surface3: "#d6dbc4",
      border: "#cbd1b6",
      text: "#2f3a2a", // verde tinta
      textMuted: "#5f6d54",
      textSubtle: "#8a957c",
      primary: "#4f6f52", // verde botella
      primaryHover: "#425e45",
      primaryFg: "#f7f8f1",
      accent: "#8a6d3b", // madera/mostaza
      progress: "#4f6f52",
    },
  },
];

export const DEFAULT_THEME_ID = "study-day";

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

// Apply a token map onto the document root as CSS variables.
export function applyTokens(tokens: Partial<ThemeTokens>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  (Object.keys(tokens) as (keyof ThemeTokens)[]).forEach((key) => {
    const cssVar = TOKEN_TO_CSSVAR[key];
    const value = tokens[key];
    if (cssVar && value != null) root.style.setProperty(cssVar, value);
  });
}

// --- Contrast helper (WCAG) for the editor's accessibility guardrail ---
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "");
  if (m.length !== 6) return null;
  const n = parseInt(m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function contrastRatio(fg: string, bg: string): number | null {
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  if (!f || !b) return null;
  const l1 = luminance(f);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastRating(ratio: number | null): "AAA" | "AA" | "fail" {
  if (ratio == null) return "fail";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}
