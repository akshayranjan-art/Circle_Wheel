import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FREE_THEME_IDS, getTheme } from "@/lib/orbit-themes";

export type OrbitConfig = {
  themeId: string;
  unlocked: string[];
  iconCount: number;
  radius: number;
  layout: "fan" | "full" | "arc";
  showLabels: boolean;
  glow: boolean;
  spin: boolean;
  speed: number;
};

const DEFAULTS: OrbitConfig = {
  themeId: "aurora-amber",
  unlocked: FREE_THEME_IDS,
  iconCount: 6,
  radius: 140,
  layout: "fan",
  showLabels: true,
  glow: true,
  spin: true,
  speed: 1,
};

const STORAGE_KEY = "orbit-config-v1";

type Ctx = {
  config: OrbitConfig;
  update: (patch: Partial<OrbitConfig>) => void;
  unlock: (themeId: string) => void;
  reset: () => void;
};

const OrbitContext = createContext<Ctx | null>(null);

export function OrbitProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<OrbitConfig>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OrbitConfig>;
        setConfig((c) => ({
          ...c,
          ...parsed,
          unlocked: Array.from(
            new Set([...FREE_THEME_IDS, ...(parsed.unlocked ?? [])]),
          ),
        }));
      }
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  useEffect(() => {
    const theme = getTheme(config.themeId);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value);
    }
    root.style.setProperty("--orbit-speed", String(config.speed));
  }, [config.themeId, config.speed]);

  const persist = useCallback((next: OrbitConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const update = useCallback(
    (patch: Partial<OrbitConfig>) =>
      setConfig((c) => {
        const next = { ...c, ...patch };
        persist(next);
        return next;
      }),
    [persist],
  );

  const unlock = useCallback(
    (themeId: string) =>
      setConfig((c) => {
        const next = {
          ...c,
          unlocked: Array.from(new Set([...c.unlocked, themeId])),
          themeId,
        };
        persist(next);
        return next;
      }),
    [persist],
  );

  const reset = useCallback(() => {
    setConfig(DEFAULTS);
    persist(DEFAULTS);
  }, [persist]);

  const value = useMemo(
    () => ({ config, update, unlock, reset }),
    [config, update, unlock, reset],
  );

  return (
    <OrbitContext.Provider value={value}>{children}</OrbitContext.Provider>
  );
}

export function useOrbit() {
  const ctx = useContext(OrbitContext);
  if (!ctx) throw new Error("useOrbit must be used inside OrbitProvider");
  return ctx;
}
