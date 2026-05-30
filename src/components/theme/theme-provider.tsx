"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  applyTokens,
  DEFAULT_THEME_ID,
  getTheme,
  type ThemeTokens,
} from "@/lib/themes";

const STORAGE_KEY = "libroapp:theme";

type StoredTheme = {
  baseId: string;
  overrides: Partial<ThemeTokens>;
};

type ThemeContextValue = {
  baseId: string;
  overrides: Partial<ThemeTokens>;
  /** Effective tokens = base theme merged with user overrides. */
  effective: ThemeTokens;
  /** Switch the base theme; clears overrides unless `keepOverrides`. */
  setBaseTheme: (id: string, keepOverrides?: boolean) => void;
  /** Override a single token live. */
  setToken: (key: keyof ThemeTokens, value: string) => void;
  /** Drop all overrides, back to the pristine base theme. */
  resetOverrides: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): StoredTheme {
  if (typeof window === "undefined") {
    return { baseId: DEFAULT_THEME_ID, overrides: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredTheme;
      if (parsed.baseId) return { baseId: parsed.baseId, overrides: parsed.overrides ?? {} };
    }
  } catch {
    /* ignore malformed storage */
  }
  return { baseId: DEFAULT_THEME_ID, overrides: {} };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredTheme>(() => readStored());

  const effective: ThemeTokens = {
    ...getTheme(stored.baseId).tokens,
    ...stored.overrides,
  };

  // Persist + apply whenever the stored theme changes.
  useEffect(() => {
    applyTokens(effective);
    document.documentElement.dataset.themeMode = getTheme(stored.baseId).mode;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage may be unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);

  const setBaseTheme = (id: string, keepOverrides = false) =>
    setStored((s) => ({ baseId: id, overrides: keepOverrides ? s.overrides : {} }));

  const setToken = (key: keyof ThemeTokens, value: string) =>
    setStored((s) => ({ ...s, overrides: { ...s.overrides, [key]: value } }));

  const resetOverrides = () => setStored((s) => ({ ...s, overrides: {} }));

  return (
    <ThemeContext.Provider
      value={{
        baseId: stored.baseId,
        overrides: stored.overrides,
        effective,
        setBaseTheme,
        setToken,
        resetOverrides,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
