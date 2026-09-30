export type WheelApp = {
  id: string;
  label: string;
  /** Internal route or external link, including supported phone URL schemes. */
  to: string;
  emoji: string;
  custom?: boolean;
};

export type LauncherPreferences = {
  darkMode: boolean;
  brightness: number;
  volume: number;
  iconSize: number;
  showLabels: boolean;
};

export const MAX_APPS = 40;
export const LAUNCHER_APPS_KEY = "orbit-launcher-apps-v3";
export const LAUNCHER_PREFERENCES_KEY = "orbit-launcher-preferences-v1";
export const DEFAULT_LAUNCHER_PREFERENCES: LauncherPreferences = {
  darkMode: true,
  brightness: 100,
  volume: 70,
  iconSize: 58,
  showLabels: true,
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

export const DEFAULT_APPS = [...BUILT_IN_APPS, ...PRESET_APPS].slice(0, MAX_APPS);

export function loadLauncherApps(): WheelApp[] {
  if (typeof window === "undefined") return DEFAULT_APPS;
  try {
    const raw = localStorage.getItem(LAUNCHER_APPS_KEY);
    if (!raw) return DEFAULT_APPS;
    const parsed = JSON.parse(raw) as WheelApp[];
    if (!Array.isArray(parsed)) return DEFAULT_APPS;
    const safe = parsed.filter((app) => app && typeof app.id === "string" && typeof app.label === "string" && typeof app.to === "string" && !["/ludo", "/rooms", "/spin", "/diamonds", "/leaderboard", "/gifts"].includes(app.to));
    const existing = new Set(safe.map((app) => app.id));
    return [...safe, ...DEFAULT_APPS.filter((app) => !existing.has(app.id))].slice(0, MAX_APPS);
  } catch {
    return DEFAULT_APPS;
  }
}

export function saveLauncherApps(apps: WheelApp[]) {
  const limited = apps.slice(0, MAX_APPS);
  localStorage.setItem(LAUNCHER_APPS_KEY, JSON.stringify(limited));
  window.dispatchEvent(new CustomEvent("orbit-launcher-apps", { detail: limited }));
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
