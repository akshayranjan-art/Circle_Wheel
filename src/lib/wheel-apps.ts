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

export const isExternal = (to: string) => !to.startsWith("/");
