import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FontSize = "small" | "normal" | "large" | "xlarge";
export type Contrast = "normal" | "high";
export type Motion = "full" | "reduced";

export interface Preferences {
  fontSize: FontSize;
  contrast: Contrast;
  motion: Motion;
}

const STORAGE_KEY = "isl-co…ence";
const DEFAULTS: Preferences = {
  fontSize: "normal",
  contrast: "normal",
  motion: "full",
};

function readStored(): Preferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      fontSize: parsed.fontSize ?? DEFAULTS.fontSize,
      contrast: parsed.contrast ?? DEFAULTS.contrast,
      motion: parsed.motion ?? DEFAULTS.motion,
    };
  } catch {
    return DEFAULTS;
  }
}

interface PreferencesContextValue extends Preferences {
  setFontSize: (value: FontSize) => void;
  setContrast: (value: Contrast) => void;
  setMotion: (value: Motion) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * Stores the reader's text-size, contrast and motion choices, applies them as
 * data attributes on <html> (styled in src/styles.css) and keeps them in the
 * browser so the settings survive a page reload.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    const stored = readStored();
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefs({
      ...stored,
      motion: stored.motion === "full" && prefersReduced ? "reduced" : stored.motion,
    });
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset["fontSize"] = prefs.fontSize;
    el.dataset["contrast"] = prefs.contrast;
    el.dataset["motion"] = prefs.motion;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* storage may be unavailable in private mode — settings still apply */
    }
  }, [prefs]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      setFontSize: (fontSize) => setPrefs((p) => ({ ...p, fontSize })),
      setContrast: (contrast) => setPrefs((p) => ({ ...p, contrast })),
      setMotion: (motion) => setPrefs((p) => ({ ...p, motion })),
    }),
    [prefs],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  }
  return ctx;
}
