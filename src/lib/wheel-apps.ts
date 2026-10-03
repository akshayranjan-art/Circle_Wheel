export type WheelApp = {
  id: string;
  label: string;
  /** Internal route or external link, including supported phone URL schemes. */
  to: string;
  emoji: string;
  /** User supplied icon stored as a compressed data URL. */
  iconImage?: string;
  custom?: boolean;
  /** Fixed position in the 40-place orbit. Edge apps remain naturally ordered. */
  slot?: number;
  /** Orbit ring: 0 outer (40), 1 middle (20), 2 inner (4). */
  ring?: number;
};

export type LauncherRail = "orbit" | "edge";
export type LauncherIconPack = "neon-line" | "glossy-3d" | "midnight-gold";

export type LauncherPreferences = {
  darkMode: boolean;
  brightness: number;
  volume: number;
  iconSize: number;
  showLabels: boolean;
  appLocked: boolean;
  leftIconSize: number;
  iconPack: LauncherIconPack;
  premiumPreview: boolean;
  iconOpacity: number;
  edgeVisible: number;
};

export const MAX_APPS = 40;
export const RING_SIZES = [40, 20, 4] as const;
export const ORBIT_MAX = 64;
export const EDGE_MAX = 20;
export const LAUNCHER_APPS_KEY = "orbit-launcher-apps-v3";
export const LAUNCHER_EDGE_APPS_KEY = "orbit-launcher-edge-apps-v1";
export const LAUNCHER_PREFERENCES_KEY = "orbit-launcher-preferences-v2";
export const DEFAULT_LAUNCHER_PREFERENCES: LauncherPreferences = {
  darkMode: true,
  brightness: 100,
  volume: 70,
  iconSize: 58,
  showLabels: true,
  appLocked: false,
  leftIconSize: 52,
  iconPack: "neon-line",
  premiumPreview: false,
  iconOpacity: 92,
  edgeVisible: 4,
};

export const BUILT_IN_APPS: WheelApp[] = [
  { id: "home", label: "Home", to: "/", emoji: "🏠" },
  { id: "phone", label: "Phone", to: "tel:", emoji: "📞" },
  { id: "camera", label: "Camera", to: "camera", emoji: "📷" },
  { id: "messages", label: "Messages", to: "sms:", emoji: "💬" },
  { id: "chrome", label: "Chrome", to: "https://google.com", emoji: "🌐" },
  { id: "calculator", label: "Calculator", to: "calculator", emoji: "🧮" },
  { id: "clock", label: "Clock", to: "clock", emoji: "⏰" },
  { id: "gallery", label: "Gallery", to: "gallery", emoji: "🖼️" },
  { id: "settings", label: "Settings", to: "/settings", emoji: "⚙️" },
  { id: "contacts", label: "Contacts", to: "https://contacts.google.com", emoji: "👥" },
  { id: "calendar", label: "Calendar", to: "https://calendar.google.com", emoji: "📅" },
  { id: "drive", label: "Drive", to: "https://drive.google.com", emoji: "🗂️" },
  { id: "notes", label: "Notes", to: "https://keep.google.com", emoji: "📝" },
  { id: "weather", label: "Weather", to: "https://weather.com", emoji: "🌤️" },
  { id: "music", label: "Music", to: "https://music.youtube.com", emoji: "🎵" },
  { id: "maps", label: "Maps", to: "https://maps.google.com", emoji: "🗺️" },
  { id: "files", label: "Files", to: "https://drive.google.com", emoji: "📁" },
  { id: "photos", label: "Photos", to: "https://photos.google.com", emoji: "🌄" },
  { id: "translate", label: "Translate", to: "https://translate.google.com", emoji: "🌐" },
];

export const PRESET_APPS: WheelApp[] = [
  { id: "p-yt", label: "YouTube", to: "https://youtube.com", emoji: "▶️" },
  { id: "p-wa", label: "WhatsApp", to: "https://web.whatsapp.com", emoji: "🟢" },
  { id: "p-ig", label: "Instagram", to: "https://instagram.com", emoji: "📸" },
  { id: "p-sp", label: "Spotify", to: "https://open.spotify.com", emoji: "🎧" },
  { id: "p-play", label: "Play Store", to: "https://play.google.com", emoji: "🛍️" },
  { id: "p-fb", label: "Facebook", to: "https://facebook.com", emoji: "📘" },
  { id: "p-x", label: "X", to: "https://x.com", emoji: "✖️" },
  { id: "p-gm", label: "Gmail", to: "https://mail.google.com", emoji: "✉️" },
  { id: "p-map", label: "Maps", to: "https://maps.google.com", emoji: "🗺️" },
];

export const APP_PICKER_CATALOG: WheelApp[] = [
  ...BUILT_IN_APPS,
  ...PRESET_APPS,
  { id: "telegram", label: "Telegram", to: "https://t.me", emoji: "✈️" },
  { id: "discord", label: "Discord", to: "https://discord.com/app", emoji: "🎮" },
  { id: "linkedin", label: "LinkedIn", to: "https://linkedin.com", emoji: "💼" },
  { id: "amazon", label: "Amazon", to: "https://amazon.in", emoji: "📦" },
  { id: "flipkart", label: "Flipkart", to: "https://flipkart.com", emoji: "🛒" },
  { id: "netflix", label: "Netflix", to: "https://netflix.com", emoji: "🎬" },
  { id: "meet", label: "Meet", to: "https://meet.google.com", emoji: "🎥" },
  { id: "news", label: "News", to: "https://news.google.com", emoji: "📰" },
  { id: "reddit", label: "Reddit", to: "https://reddit.com", emoji: "👽" },
  { id: "pinterest", label: "Pinterest", to: "https://pinterest.com", emoji: "📌" },
  { id: "github", label: "GitHub", to: "https://github.com", emoji: "🐙" },
  { id: "zoom", label: "Zoom", to: "https://zoom.us/join", emoji: "📹" },
];

export const DEFAULT_APPS = [...BUILT_IN_APPS, ...PRESET_APPS].slice(0, MAX_APPS);
export const DEFAULT_EDGE_APPS = DEFAULT_APPS.slice(0, 12).map((app) => ({ ...app, id: `edge-${app.id}` }));

function safeApps(value: unknown, fallback: WheelApp[], cap = MAX_APPS) {
  if (!Array.isArray(value)) return fallback;
  const safe = value.filter((app): app is WheelApp => Boolean(app && typeof app.id === "string" && typeof app.label === "string" && typeof app.to === "string" && !["/ludo", "/rooms", "/spin", "/diamonds", "/leaderboard", "/gifts"].includes(app.to)));
  return safe.slice(0, cap);
}

export function loadLauncherApps(): WheelApp[] {
  if (typeof window === "undefined") return DEFAULT_APPS;
  try {
    const raw = localStorage.getItem(LAUNCHER_APPS_KEY);
    if (!raw) return DEFAULT_APPS;
    const safe = safeApps(JSON.parse(raw), DEFAULT_APPS, ORBIT_MAX);
    const existing = new Set(safe.map((app) => app.id));
    return [...safe, ...DEFAULT_APPS.filter((app) => !existing.has(app.id))].slice(0, ORBIT_MAX);
  } catch {
    return DEFAULT_APPS;
  }
}

export function loadLauncherEdgeApps(): WheelApp[] {
  if (typeof window === "undefined") return DEFAULT_EDGE_APPS;
  try {
    const raw = localStorage.getItem(LAUNCHER_EDGE_APPS_KEY);
    return raw ? safeApps(JSON.parse(raw), DEFAULT_EDGE_APPS, EDGE_MAX) : DEFAULT_EDGE_APPS;
  } catch {
    return DEFAULT_EDGE_APPS;
  }
}

export function saveLauncherApps(apps: WheelApp[]) {
  const limited = apps.slice(0, ORBIT_MAX);
  localStorage.setItem(LAUNCHER_APPS_KEY, JSON.stringify(limited));
  window.dispatchEvent(new CustomEvent("orbit-launcher-apps", { detail: limited }));
  return limited;
}

export function saveLauncherEdgeApps(apps: WheelApp[]) {
  const limited = apps.slice(0, EDGE_MAX);
  localStorage.setItem(LAUNCHER_EDGE_APPS_KEY, JSON.stringify(limited));
  window.dispatchEvent(new CustomEvent("orbit-launcher-edge-apps", { detail: limited }));
  return limited;
}

export function loadLauncherPreferences(): LauncherPreferences {
  if (typeof window === "undefined") return DEFAULT_LAUNCHER_PREFERENCES;
  try {
    const saved = JSON.parse(localStorage.getItem(LAUNCHER_PREFERENCES_KEY) ?? "null") as Partial<LauncherPreferences> | null;
    return { ...DEFAULT_LAUNCHER_PREFERENCES, ...saved };
  } catch {
    return DEFAULT_LAUNCHER_PREFERENCES;
  }
}

export function saveLauncherPreferences(preferences: LauncherPreferences) {
  localStorage.setItem(LAUNCHER_PREFERENCES_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent("orbit-launcher-preferences", { detail: preferences }));
}

export const isExternal = (to: string) => !to.startsWith("/");
