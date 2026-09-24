export type WheelApp = {
  id: string;
  label: string;
  /** Internal route ("/ludo") or external link ("https://…", "whatsapp://…") */
  to: string;
  emoji: string;
  custom?: boolean;
};

export const MAX_APPS = 40;

export const BUILT_IN_APPS: WheelApp[] = [
  { id: "home", label: "Home", to: "/", emoji: "🏠" },
  { id: "ludo", label: "Ludo Live", to: "/ludo", emoji: "🎲" },
  { id: "rooms", label: "Rooms", to: "/rooms", emoji: "🎙️" },
  { id: "spin", label: "Lucky Wheel", to: "/spin", emoji: "🎡" },
  { id: "board", label: "Leaderboard", to: "/leaderboard", emoji: "🏆" },
  { id: "profile", label: "Profile", to: "/profile", emoji: "👤" },
  { id: "diamonds", label: "Diamonds", to: "/diamonds", emoji: "💎" },
  { id: "gifts", label: "Gifts", to: "/gifts", emoji: "🎁" },
  { id: "messages", label: "Messages", to: "/messages", emoji: "💬" },
  { id: "explore", label: "Explore", to: "/explore", emoji: "🧭" },
  { id: "create", label: "Create", to: "/create", emoji: "✨" },
  { id: "stats", label: "Stats", to: "/stats", emoji: "📊" },
  { id: "settings", label: "Settings", to: "/settings", emoji: "⚙️" },
];

export const PRESET_APPS: WheelApp[] = [
  { id: "p-yt", label: "YouTube", to: "https://youtube.com", emoji: "▶️" },
  { id: "p-wa", label: "WhatsApp", to: "https://web.whatsapp.com", emoji: "🟢" },
  { id: "p-ig", label: "Instagram", to: "https://instagram.com", emoji: "📸" },
  { id: "p-sp", label: "Spotify", to: "https://open.spotify.com", emoji: "🎧" },
  { id: "p-fb", label: "Facebook", to: "https://facebook.com", emoji: "📘" },
  { id: "p-x", label: "X", to: "https://x.com", emoji: "✖️" },
  { id: "p-gm", label: "Gmail", to: "https://mail.google.com", emoji: "✉️" },
  { id: "p-map", label: "Maps", to: "https://maps.google.com", emoji: "🗺️" },
];

export const isExternal = (to: string) => !to.startsWith("/");
