import type { WheelApp } from "./wheel-apps";

type NativeTarget = { pkg: string; scheme: string; path?: string; web: string };

/** Native app targets keyed by built-in id. Android uses intent:// with browser fallback; iOS uses the scheme with a timed web fallback. */
const NATIVE: Record<string, NativeTarget> = {
  "p-wa": { pkg: "com.whatsapp", scheme: "whatsapp", path: "send", web: "https://web.whatsapp.com" },
  "p-yt": { pkg: "com.google.android.youtube", scheme: "youtube", path: "", web: "https://youtube.com" },
  "p-ig": { pkg: "com.instagram.android", scheme: "instagram", path: "app", web: "https://instagram.com" },
  "p-sp": { pkg: "com.spotify.music", scheme: "spotify", path: "", web: "https://open.spotify.com" },
  "p-fb": { pkg: "com.facebook.katana", scheme: "fb", path: "feed", web: "https://facebook.com" },
  "p-x": { pkg: "com.twitter.android", scheme: "twitter", path: "timeline", web: "https://x.com" },
  "p-gm": { pkg: "com.google.android.gm", scheme: "googlegmail", path: "", web: "https://mail.google.com" },
  "p-play": { pkg: "com.android.vending", scheme: "itms-apps", path: "", web: "https://play.google.com" },
  "p-map": { pkg: "com.google.android.apps.maps", scheme: "comgooglemaps", path: "", web: "https://maps.google.com" },
  maps: { pkg: "com.google.android.apps.maps", scheme: "comgooglemaps", path: "", web: "https://maps.google.com" },
  chrome: { pkg: "com.android.chrome", scheme: "googlechrome", path: "google.com", web: "https://google.com" },
  music: { pkg: "com.google.android.apps.youtube.music", scheme: "youtubemusic", path: "", web: "https://music.youtube.com" },
  drive: { pkg: "com.google.android.apps.docs", scheme: "googledrive", path: "", web: "https://drive.google.com" },
  files: { pkg: "com.google.android.apps.docs", scheme: "googledrive", path: "", web: "https://drive.google.com" },
  photos: { pkg: "com.google.android.apps.photos", scheme: "googlephotos", path: "", web: "https://photos.google.com" },
  gallery: { pkg: "com.google.android.apps.photos", scheme: "photos-redirect", path: "", web: "https://photos.google.com" },
  calendar: { pkg: "com.google.android.calendar", scheme: "googlecalendar", path: "", web: "https://calendar.google.com" },
  notes: { pkg: "com.google.android.keep", scheme: "googlekeep", path: "", web: "https://keep.google.com" },
  translate: { pkg: "com.google.android.apps.translate", scheme: "googletranslate", path: "", web: "https://translate.google.com" },
  contacts: { pkg: "com.google.android.contacts", scheme: "contacts", path: "", web: "https://contacts.google.com" },
  telegram: { pkg: "org.telegram.messenger", scheme: "tg", path: "resolve", web: "https://t.me" },
  discord: { pkg: "com.discord", scheme: "discord", path: "", web: "https://discord.com/app" },
  linkedin: { pkg: "com.linkedin.android", scheme: "linkedin", path: "", web: "https://linkedin.com" },
  amazon: { pkg: "in.amazon.mShop.android.shopping", scheme: "com.amazon.mobile.shopping", path: "", web: "https://amazon.in" },
  flipkart: { pkg: "com.flipkart.android", scheme: "flipkart", path: "", web: "https://flipkart.com" },
  netflix: { pkg: "com.netflix.mediaclient", scheme: "nflx", path: "", web: "https://netflix.com" },
  meet: { pkg: "com.google.android.apps.tachyon", scheme: "googlemeet", path: "", web: "https://meet.google.com" },
  news: { pkg: "com.google.android.apps.magazines", scheme: "googlenews", path: "", web: "https://news.google.com" },
  reddit: { pkg: "com.reddit.frontpage", scheme: "reddit", path: "", web: "https://reddit.com" },
  pinterest: { pkg: "com.pinterest", scheme: "pinterest", path: "", web: "https://pinterest.com" },
  github: { pkg: "com.github.android", scheme: "github", path: "", web: "https://github.com" },
  zoom: { pkg: "us.zoom.videomeetings", scheme: "zoomus", path: "", web: "https://zoom.us/join" },
  weather: { pkg: "com.weather.Weather", scheme: "weather", path: "", web: "https://weather.com" },
};

const SYSTEM: Record<string, { android: string; ios?: string }> = {
  camera: { android: "intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end" },
  calculator: { android: "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_CALCULATOR;end" },
  clock: { android: "intent:#Intent;action=android.intent.action.SHOW_ALARMS;end", ios: "clock-alarm://" },
};

function baseId(id: string) {
  return id.replace(/^(edge-|orbit-)/, "").replace(/-\d{10,}$/, "");
}

export function platform(): "android" | "ios" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "other";
}

/** Opens the native app when installed, otherwise the web version. Returns false when nothing could be launched. */
export function launchNative(app: WheelApp): boolean {
  const id = baseId(app.id);
  const os = platform();
  const sys = SYSTEM[id];
  if (sys) {
    if (os === "android") { window.location.href = sys.android; return true; }
    if (os === "ios" && sys.ios) { window.location.href = sys.ios; return true; }
    return false;
  }
  const target = app.custom ? undefined : NATIVE[id];
  if (!target) {
    // Custom or plain links: schemes go straight to the OS, web links open in the system browser/app handler.
    if (/^[a-z][a-z0-9+.-]*:/i.test(app.to) && !/^https?:/i.test(app.to)) window.location.href = app.to;
    else window.open(app.to, "_blank", "noopener,noreferrer");
    return true;
  }
  if (os === "android") {
    const fallback = encodeURIComponent(target.web);
    window.location.href = `intent://${target.path ?? ""}#Intent;scheme=${target.scheme};package=${target.pkg};S.browser_fallback_url=${fallback};end`;
    return true;
  }
  if (os === "ios") {
    let left = false;
    const onHide = () => { left = true; };
    document.addEventListener("visibilitychange", onHide, { once: true });
    window.location.href = `${target.scheme}://${target.path ?? ""}`;
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onHide);
      if (!left && document.visibilityState === "visible") window.location.href = target.web;
    }, 1400);
    return true;
  }
  window.open(target.web, "_blank", "noopener,noreferrer");
  return true;
}
