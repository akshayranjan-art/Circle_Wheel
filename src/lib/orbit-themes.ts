export type OrbitTheme = {
  id: string;
  name: string;
  tagline: string;
  premium: boolean;
  price: number;
  swatch: [string, string, string];
  vars: Record<string, string>;
};

function theme(
  id: string,
  name: string,
  tagline: string,
  premium: boolean,
  price: number,
  v: {
    background: string;
    card: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    neon1: string;
    neon2: string;
  },
): OrbitTheme {
  return {
    id,
    name,
    tagline,
    premium,
    price,
    swatch: [v.primary, v.neon2, v.card],
    vars: {
      "--background": v.background,
      "--card": v.card,
      "--popover": v.card,
      "--foreground": v.foreground,
      "--card-foreground": v.foreground,
      "--popover-foreground": v.foreground,
      "--muted": v.muted,
      "--muted-foreground": v.mutedForeground,
      "--secondary": v.muted,
      "--secondary-foreground": v.foreground,
      "--primary": v.primary,
      "--primary-foreground": v.primaryForeground,
      "--accent": v.accent,
      "--accent-foreground": v.foreground,
      "--ring": v.primary,
      "--border": "oklch(1 0 0 / 14%)",
      "--input": "oklch(1 0 0 / 16%)",
      "--neon-1": v.neon1,
      "--neon-2": v.neon2,
    },
  };
}

export const ORBIT_THEMES: OrbitTheme[] = [
  theme("aurora-amber", "Aurora Amber", "Warm reactor glow", false, 0, {
    background: "oklch(0.16 0.015 270)",
    card: "oklch(0.21 0.018 270)",
    foreground: "oklch(0.94 0.02 90)",
    muted: "oklch(0.26 0.02 270)",
    mutedForeground: "oklch(0.7 0.02 270)",
    primary: "oklch(0.84 0.16 85)",
    primaryForeground: "oklch(0.2 0.05 80)",
    accent: "oklch(0.3 0.04 85)",
    neon1: "oklch(0.84 0.16 85)",
    neon2: "oklch(0.75 0.19 45)",
  }),
  theme("cyber-teal", "Cyber Teal", "Deep-space terminal", false, 0, {
    background: "oklch(0.15 0.03 220)",
    card: "oklch(0.2 0.035 220)",
    foreground: "oklch(0.95 0.02 200)",
    muted: "oklch(0.25 0.035 220)",
    mutedForeground: "oklch(0.72 0.03 210)",
    primary: "oklch(0.82 0.16 190)",
    primaryForeground: "oklch(0.16 0.04 220)",
    accent: "oklch(0.3 0.06 200)",
    neon1: "oklch(0.82 0.16 190)",
    neon2: "oklch(0.7 0.19 240)",
  }),
  theme("neon-magenta", "Neon Magenta", "Night-market signage", false, 0, {
    background: "oklch(0.15 0.03 320)",
    card: "oklch(0.2 0.04 320)",
    foreground: "oklch(0.95 0.02 320)",
    muted: "oklch(0.25 0.04 320)",
    mutedForeground: "oklch(0.72 0.03 320)",
    primary: "oklch(0.72 0.24 330)",
    primaryForeground: "oklch(0.97 0.01 320)",
    accent: "oklch(0.3 0.08 330)",
    neon1: "oklch(0.72 0.24 330)",
    neon2: "oklch(0.75 0.2 200)",
  }),
  theme("toxic-lime", "Toxic Lime", "Reactor coolant leak", false, 0, {
    background: "oklch(0.15 0.02 150)",
    card: "oklch(0.2 0.025 150)",
    foreground: "oklch(0.95 0.03 140)",
    muted: "oklch(0.25 0.03 150)",
    mutedForeground: "oklch(0.72 0.03 150)",
    primary: "oklch(0.87 0.2 140)",
    primaryForeground: "oklch(0.18 0.05 150)",
    accent: "oklch(0.3 0.06 145)",
    neon1: "oklch(0.87 0.2 140)",
    neon2: "oklch(0.82 0.17 110)",
  }),
  theme("ion-violet", "Ion Violet", "Warp-core hum", false, 0, {
    background: "oklch(0.14 0.03 290)",
    card: "oklch(0.19 0.04 290)",
    foreground: "oklch(0.95 0.02 290)",
    muted: "oklch(0.25 0.04 290)",
    mutedForeground: "oklch(0.72 0.03 290)",
    primary: "oklch(0.7 0.23 300)",
    primaryForeground: "oklch(0.97 0.01 300)",
    accent: "oklch(0.3 0.08 300)",
    neon1: "oklch(0.7 0.23 300)",
    neon2: "oklch(0.78 0.17 260)",
  }),
  theme("plasma-crimson", "Plasma Crimson", "Red-alert protocol", true, 199, {
    background: "oklch(0.14 0.03 20)",
    card: "oklch(0.19 0.04 20)",
    foreground: "oklch(0.95 0.02 30)",
    muted: "oklch(0.25 0.04 20)",
    mutedForeground: "oklch(0.72 0.03 20)",
    primary: "oklch(0.68 0.24 22)",
    primaryForeground: "oklch(0.97 0.01 30)",
    accent: "oklch(0.3 0.09 22)",
    neon1: "oklch(0.68 0.24 22)",
    neon2: "oklch(0.8 0.19 60)",
  }),
  theme("quantum-gold", "Quantum Gold", "Obsidian and bullion", true, 249, {
    background: "oklch(0.12 0.008 80)",
    card: "oklch(0.17 0.012 80)",
    foreground: "oklch(0.96 0.02 90)",
    muted: "oklch(0.23 0.015 80)",
    mutedForeground: "oklch(0.72 0.02 85)",
    primary: "oklch(0.88 0.15 95)",
    primaryForeground: "oklch(0.16 0.03 90)",
    accent: "oklch(0.28 0.04 90)",
    neon1: "oklch(0.88 0.15 95)",
    neon2: "oklch(0.72 0.12 70)",
  }),
  theme("holo-frost", "Holo Frost", "Cryo-lab hologram", true, 299, {
    background: "oklch(0.17 0.02 240)",
    card: "oklch(0.23 0.025 240)",
    foreground: "oklch(0.97 0.01 240)",
    muted: "oklch(0.28 0.025 240)",
    mutedForeground: "oklch(0.75 0.02 240)",
    primary: "oklch(0.93 0.08 210)",
    primaryForeground: "oklch(0.18 0.03 240)",
    accent: "oklch(0.32 0.04 220)",
    neon1: "oklch(0.93 0.08 210)",
    neon2: "oklch(0.85 0.14 320)",
  }),
  theme("void-runner", "Void Runner", "Pure black, laser edges", true, 349, {
    background: "oklch(0.08 0 0)",
    card: "oklch(0.13 0.005 260)",
    foreground: "oklch(0.97 0 0)",
    muted: "oklch(0.19 0.005 260)",
    mutedForeground: "oklch(0.68 0.01 260)",
    primary: "oklch(0.86 0.18 165)",
    primaryForeground: "oklch(0.1 0.02 165)",
    accent: "oklch(0.24 0.05 165)",
    neon1: "oklch(0.86 0.18 165)",
    neon2: "oklch(0.7 0.24 330)",
  }),
  theme("solar-flare", "Solar Flare", "Prism burn, top tier", true, 499, {
    background: "oklch(0.13 0.025 300)",
    card: "oklch(0.18 0.035 300)",
    foreground: "oklch(0.96 0.02 60)",
    muted: "oklch(0.24 0.04 300)",
    mutedForeground: "oklch(0.73 0.03 300)",
    primary: "oklch(0.8 0.2 55)",
    primaryForeground: "oklch(0.16 0.04 60)",
    accent: "oklch(0.3 0.09 320)",
    neon1: "oklch(0.8 0.2 55)",
    neon2: "oklch(0.7 0.25 320)",
  }),
];

export const FREE_THEME_IDS = ORBIT_THEMES.filter((t) => !t.premium).map(
  (t) => t.id,
);

export function getTheme(id: string) {
  return ORBIT_THEMES.find((t) => t.id === id) ?? ORBIT_THEMES[0]!;
}
