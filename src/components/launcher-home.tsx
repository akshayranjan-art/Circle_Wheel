import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { launchNative } from "@/lib/native-launch";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Calculator, CalendarDays, Camera, ChevronUp, Clock3, CloudSun, ContactRound, Crown, Download, Facebook, FolderOpen, GalleryHorizontal, Globe2, GripVertical, Home, ImagePlus, Instagram, Languages, Lock, Mail, Map, MessageCircle, Moon, Music2, Pencil, Phone, Play, Plus, Search, Settings2, ShoppingBag, Sparkles, StickyNote, Sun, Trash2, Upload, Users, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import cityWallpaper from "@/assets/wallpaper-neon-city.jpg";
import orbitWallpaper from "@/assets/wallpaper-orbit-space.jpg";
import metalWallpaper from "@/assets/wallpaper-liquid-metal.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  APP_PICKER_CATALOG, DEFAULT_APPS, DEFAULT_EDGE_APPS, DEFAULT_LAUNCHER_PREFERENCES, MAX_APPS, RING_SIZES, ORBIT_MAX, EDGE_MAX,
  loadLauncherApps, loadLauncherEdgeApps, loadLauncherPreferences,
  saveLauncherApps, saveLauncherEdgeApps, saveLauncherPreferences,
  type LauncherPreferences, type LauncherRail, type WheelApp,
} from "@/lib/wheel-apps";
import { cn } from "@/lib/utils";
import { soundFX } from "@/lib/sound-fx";

const WALLPAPER_KEY = "orbit-launcher-wallpaper-v2";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const WALLPAPERS = [
  { id: "city", name: "Neon City", src: cityWallpaper },
  { id: "orbit", name: "Deep Orbit", src: orbitWallpaper },
  { id: "metal", name: "Liquid Metal", src: metalWallpaper },
];
type Wallpaper = (typeof WALLPAPERS)[number];
type EditDraft = { id?: string; label: string; to: string; emoji: string; iconImage: string | undefined; rail: LauncherRail; slot?: number; ring?: number };
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

function normalizedTarget(value: string) {
  const target = value.trim();
  if (target.startsWith("/")) return target;
  if (/^(https?:|tel:|sms:|mailto:|geo:|market:|intent:|whatsapp:)/i.test(target)) return target;
  return `https://${target.replace(/^\/+/, "")}`;
}

function AppIcon({ app, size, pack }: { app: WheelApp; size: number; pack: LauncherPreferences["iconPack"] }) {
  const key = app.id.replace(/^(edge-|orbit-)/, "").replace(/-\d{10,}$/, "").replace(/^p-/, "");
  const Icon = ({
    home: Home, phone: Phone, camera: Camera, messages: MessageCircle, chrome: Globe2,
    calculator: Calculator, clock: Clock3, gallery: GalleryHorizontal, settings: Settings2,
    contacts: ContactRound, calendar: CalendarDays, drive: FolderOpen, notes: StickyNote,
    "system-settings": Settings2, "file-manager": FolderOpen,
    weather: CloudSun, music: Music2, maps: Map, files: FolderOpen, photos: GalleryHorizontal,
    translate: Languages, yt: Play, wa: MessageCircle, ig: Instagram, sp: Music2, play: ShoppingBag,
    fb: Facebook, x: X, gm: Mail, map: Map,
  } as Record<string, typeof Sparkles>)[key] ?? Sparkles;
  return <span className={cn("launcher-app-icon", `launcher-icon-pack--${pack}`)} style={{ width: size, height: size, fontSize: size * .58 }}>{app.iconImage ? <img src={app.iconImage} alt="" /> : app.custom ? app.emoji : <Icon aria-hidden="true" style={{ width: size * .52, height: size * .52 }} />}</span>;
}

const ROTATION_KEY = "orbit-launcher-rotation-v1";
/** Outer ring spins with the finger, middle ring counter-rotates, inner ring spins faster. */
const RINGS = [{ radius: 258, dir: 1, scale: .78 }, { radius: 138, dir: -1.2, scale: .78 }, { radius: 64, dir: 1.6, scale: .74 }];

export function LauncherHome() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<WheelApp[]>(DEFAULT_APPS);
  const [edgeApps, setEdgeApps] = useState<WheelApp[]>(DEFAULT_EDGE_APPS);
  const [search, setSearch] = useState("");
  const [rotation, setRotation] = useState(0);
  const [activeLetter, setActiveLetter] = useState("A");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wallpaperOpen, setWallpaperOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [draft, setDraft] = useState<EditDraft>({ label: "", to: "", emoji: "✦", iconImage: undefined, rail: "orbit" });
  const [wallpaper, setWallpaper] = useState<Wallpaper>(WALLPAPERS[0] ?? { id: "city", name: "Neon City", src: cityWallpaper });
  const [customWallpaper, setCustomWallpaper] = useState("");
  const [preferences, setPreferences] = useState<LauncherPreferences>(DEFAULT_LAUNCHER_PREFERENCES);
  const [time, setTime] = useState("");
  const [online, setOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const arcRef = useRef<HTMLDivElement | null>(null);
  const alphabetRef = useRef<HTMLDivElement | null>(null);
  const edgeScrollRef = useRef<HTMLDivElement | null>(null);
  const edgeLettersRef = useRef<HTMLDivElement | null>(null);
  const [edgeLetter, setEdgeLetter] = useState("");
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const pointerRef = useRef<{ angle: number; time: number } | null>(null);
  const swipeRef = useRef<number | null>(null);
  const movedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = Number(sessionStorage.getItem(ROTATION_KEY));
    if (Number.isFinite(saved) && saved !== 0) { rotationRef.current = saved; setRotation(saved); }
    const persist = () => sessionStorage.setItem(ROTATION_KEY, String(rotationRef.current));
    const onShow = (event: PageTransitionEvent) => { if (event.persisted) { const value = Number(sessionStorage.getItem(ROTATION_KEY)); if (Number.isFinite(value)) { rotationRef.current = value; setRotation(value); } } };
    document.addEventListener("visibilitychange", persist);
    window.addEventListener("pagehide", persist);
    window.addEventListener("pageshow", onShow);
    return () => { document.removeEventListener("visibilitychange", persist); window.removeEventListener("pagehide", persist); window.removeEventListener("pageshow", onShow); };
  }, []);

  useEffect(() => {
    setApps(loadLauncherApps());
    setEdgeApps(loadLauncherEdgeApps());
    setPreferences(loadLauncherPreferences());
    try {
      const saved = JSON.parse(localStorage.getItem(WALLPAPER_KEY) ?? "null") as { id?: string; custom?: string } | null;
      const preset = WALLPAPERS.find((item) => item.id === saved?.id);
      if (preset) setWallpaper(preset);
      if (saved?.custom) setCustomWallpaper(saved.custom);
    } catch { /* Keep launcher defaults. */ }
  }, []);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const markInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", capture); window.addEventListener("appinstalled", markInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", markInstalled); };
  }, []);

  useEffect(() => { document.documentElement.classList.toggle("dark", preferences.darkMode); saveLauncherPreferences(preferences); }, [preferences]);
  useEffect(() => { soundFX.setEnabled(preferences.volume > 0); }, [preferences.volume]);
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    const updateNetwork = () => setOnline(navigator.onLine);
    updateTime(); updateNetwork();
    const timer = window.setInterval(updateTime, 30_000);
    window.addEventListener("online", updateNetwork); window.addEventListener("offline", updateNetwork);
    return () => { window.clearInterval(timer); window.removeEventListener("online", updateNetwork); window.removeEventListener("offline", updateNetwork); };
  }, []);

  const saveRail = useCallback((rail: LauncherRail, next: WheelApp[]) => {
    if (rail === "orbit") setApps(saveLauncherApps(next));
    else setEdgeApps(saveLauncherEdgeApps(next));
  }, []);

  const filterApps = useCallback((items: WheelApp[]) => {
    const needle = search.trim().toLowerCase();
    return items.filter((app) => !needle || app.label.toLowerCase().includes(needle));
  }, [search]);
  const visibleApps = useMemo(() => filterApps(apps), [apps, filterApps]);
  const visibleEdgeApps = useMemo(() => filterApps(edgeApps), [edgeApps, filterApps]);
  /** Side rail loops 360°: the list renders 3x and scroll stays centered on the middle copy. */
  const edgeLoopApps = useMemo(() => [...visibleEdgeApps, ...visibleEdgeApps, ...visibleEdgeApps], [visibleEdgeApps]);
  const edgeLetters = useMemo(() => new Set(visibleEdgeApps.map((app) => app.label.trim().charAt(0).toUpperCase())), [visibleEdgeApps]);

  const centerEdgeLoop = useCallback(() => {
    const el = edgeScrollRef.current;
    if (!el) return;
    const third = el.scrollHeight / 3;
    if (el.scrollTop < third * .45) el.scrollTop += third;
    else if (el.scrollTop > third * 1.55) el.scrollTop -= third;
  }, []);

  useEffect(() => {
    const el = edgeScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight / 3;
  }, [visibleEdgeApps.length, preferences.edgeVisible]);

  const jumpEdgeLetter = useCallback((letter: string) => {
    setEdgeLetter(letter);
    const el = edgeScrollRef.current;
    if (!el) return;
    const index = visibleEdgeApps.findIndex((app) => app.label.trim().toUpperCase().startsWith(letter));
    if (index < 0) { toast.info(`${letter} se koi app nahi hai`); return; }
    const card = el.querySelectorAll<HTMLElement>(".launcher-edge-card")[visibleEdgeApps.length + index];
    if (card) el.scrollTo({ top: card.offsetTop - el.clientHeight / 2 + card.offsetHeight / 2, behavior: "smooth" });
  }, [visibleEdgeApps]);

  const pickEdgeLetter = useCallback((clientY: number) => {
    const el = edgeLettersRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const index = Math.min(25, Math.max(0, Math.floor((clientY - rect.top) / rect.height * 26)));
    jumpEdgeLetter(ALPHABET[index] ?? "A");
  }, [jumpEdgeLetter]);
  const ringSlots = useMemo<(WheelApp | null)[][]>(() => {
    if (search.trim()) return [visibleApps, [], []];
    const rings = RING_SIZES.map((size) => Array.from({ length: size }, () => null as WheelApp | null));
    const pending: WheelApp[] = [];
    apps.forEach((app) => {
      const ring = typeof app.ring === "number" && rings[app.ring] ? app.ring : 0;
      const slots = rings[ring]!;
      const preferred = typeof app.slot === "number" && app.slot >= 0 && app.slot < slots.length && !slots[app.slot] ? app.slot : slots.findIndex((item) => item === null);
      if (preferred >= 0) slots[preferred] = app; else pending.push(app);
    });
    pending.forEach((app) => { for (const slots of rings) { const free = slots.findIndex((item) => item === null); if (free >= 0) { slots[free] = app; return; } } });
    return rings;
  }, [apps, search, visibleApps]);
  const orbitSlots = ringSlots[0] ?? [];
  const firstFree = (): [number, number] => { for (let r = 0; r < ringSlots.length; r++) { const i = (ringSlots[r] ?? []).findIndex((item) => item === null); if (i >= 0) return [i, r]; } return [-1, 0]; };
  const pickerApps = useMemo(() => { const needle = pickerSearch.trim().toLowerCase(); return APP_PICKER_CATALOG.filter((app) => !needle || app.label.toLowerCase().includes(needle)); }, [pickerSearch]);

  const stop = useCallback(() => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); rafRef.current = null; }, []);
  const apply = useCallback((value: number) => { rotationRef.current = value; setRotation(value); }, []);
  const inertia = useCallback(() => { velocityRef.current *= .965; if (Math.abs(velocityRef.current) < .04) return stop(); apply(rotationRef.current + velocityRef.current); rafRef.current = requestAnimationFrame(inertia); }, [apply, stop]);

  useEffect(() => {
    const element = arcRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => { event.preventDefault(); stop(); velocityRef.current = Math.max(-7.5, Math.min(7.5, event.deltaY * .028)); rafRef.current = requestAnimationFrame(inertia); };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [inertia, stop]);
  useEffect(() => () => stop(), [stop]);

  const jumpToLetter = useCallback((letter: string) => {
    setActiveLetter(letter);
    const sorted = [...visibleApps].sort((a, b) => a.label.localeCompare(b.label));
    const index = sorted.findIndex((app) => app.label.toUpperCase().startsWith(letter));
    if (index >= 0 && sorted.length) apply(-(index * 360) / sorted.length);
  }, [apply, visibleApps]);
  const pickLetter = (clientY: number) => {
    const rect = alphabetRef.current?.getBoundingClientRect();
    if (!rect) return;
    const letter = ALPHABET[Math.floor(Math.max(0, Math.min(.999, (clientY - rect.top) / rect.height)) * ALPHABET.length)];
    if (letter) jumpToLetter(letter);
  };
  const pointerAngle = (x: number, y: number) => {
    const rect = arcRef.current?.getBoundingClientRect();
    return rect ? Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2)) * 180 / Math.PI : 0;
  };

  const launch = (app: WheelApp) => {
    if (movedRef.current > 7) return;
    sessionStorage.setItem(ROTATION_KEY, String(rotationRef.current));
    if (app.to.startsWith("/")) { void navigate({ to: app.to }); return; }
    if (!launchNative(app)) toast.info(`${app.label} phone par native app se khulega — desktop par ye shortcut available nahi.`);
  };
  const openEditor = (rail: LauncherRail, app?: WheelApp) => {
    setDraft(app ? { id: app.id, label: app.label, to: app.to, emoji: app.emoji, iconImage: app.iconImage, rail, ...(typeof app.slot === "number" ? { slot: app.slot, ring: app.ring ?? 0 } : {}) } : { label: "", to: "", emoji: "✦", iconImage: undefined, rail });
    setEditorOpen(true);
  };
  const openPicker = (slot: number, ring = 0) => { setDraft({ label: "", to: "", emoji: "✦", iconImage: undefined, rail: "orbit", slot, ring }); setPickerSearch(""); setPickerOpen(true); };
  const choosePickerApp = (choice: WheelApp) => {
    if (apps.length >= ORBIT_MAX) return;
    const app: WheelApp = { ...choice, id: `orbit-${choice.id}-${Date.now()}`, ...(typeof draft.slot === "number" ? { slot: draft.slot, ring: draft.ring ?? 0 } : {}) };
    saveRail("orbit", [...apps, app]); setPickerOpen(false); toast.success(`${choice.label} orbit me add ho gaya`);
  };
  const createCustomFromPicker = () => { setPickerOpen(false); setDraft((value) => ({ ...value, label: "", to: "", emoji: "✦", iconImage: undefined, rail: "orbit" })); setEditorOpen(true); };
  const saveDraft = () => {
    if (preferences.appLocked) { toast.error("Unlock launcher before editing apps"); return; }
    if (!draft.label.trim() || !draft.to.trim()) { toast.error("App name aur link dono daalo"); return; }
    const source = draft.rail === "orbit" ? apps : edgeApps;
    const cap = draft.rail === "orbit" ? ORBIT_MAX : EDGE_MAX;
    if (!draft.id && source.length >= cap) { toast.error(`${cap} apps capacity full hai`); return; }
    const app: WheelApp = { id: draft.id ?? `${draft.rail}-${Date.now()}`, label: draft.label.trim(), to: normalizedTarget(draft.to), emoji: draft.emoji.trim() || "✦", ...(draft.iconImage ? { iconImage: draft.iconImage } : {}), ...(typeof draft.slot === "number" ? { slot: draft.slot, ring: draft.ring ?? 0 } : {}), custom: true };
    saveRail(draft.rail, draft.id ? source.map((item) => item.id === draft.id ? app : item) : [...source, app]);
    setEditorOpen(false);
    toast.success(draft.id ? "Shortcut update ho gaya" : `Shortcut ${draft.rail === "orbit" ? "orbit" : "edge rail"} me add ho gaya`);
  };
  const moveApp = (rail: LauncherRail, index: number, direction: -1 | 1) => {
    const source = rail === "orbit" ? apps : edgeApps;
    const target = index + direction;
    const current = source[index];
    const other = source[target];
    if (!current || !other) return;
    const next = [...source]; next[index] = other; next[target] = current;
    saveRail(rail, next);
  };
  const uploadIcon = (file?: File) => {
    if (!file?.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Icon 3 MB se chhota rakho"); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setDraft((value) => ({ ...value, iconImage: reader.result as string })); };
    reader.readAsDataURL(file);
  };
  const uploadWallpaper = (file?: File) => {
    if (!file?.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Wallpaper 10 MB se chhota rakho"); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result !== "string") return; setCustomWallpaper(reader.result); try { localStorage.setItem(WALLPAPER_KEY, JSON.stringify({ custom: reader.result })); } catch { toast.info("Wallpaper is session ke liye set hai"); } };
    reader.readAsDataURL(file);
  };
  const installLauncher = async () => {
    if (installed) { toast.success("Orbit already installed hai"); return; }
    if (installPrompt) { await installPrompt.prompt(); const result = await installPrompt.userChoice; if (result.outcome === "accepted") setInstallPrompt(null); return; }
    const apple = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast.info(apple ? "Share button → Add to Home Screen choose karo" : "Browser menu → Add to Home screen choose karo");
  };

  return (
    <div className={cn("launcher-stage", `launcher-pack--${preferences.iconPack}`)} onPointerDown={(event) => { if (event.clientY > window.innerHeight * .72) swipeRef.current = event.clientY; }} onPointerUp={(event) => { if (swipeRef.current !== null && swipeRef.current - event.clientY > 65) setDrawerOpen(true); swipeRef.current = null; }}>
      <img src={customWallpaper || wallpaper.src} alt="" className={cn("launcher-wallpaper", `launcher-brightness-${Math.round(preferences.brightness / 10) * 10}`)} width={1080} height={1920} />
      <div className="launcher-shade" />
      <header className="launcher-topbar">
        <div className="launcher-search"><Search className="h-5 w-5 shrink-0" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Application" aria-label="Search Application" />{search && <Button variant="ghost" size="icon" onClick={() => setSearch("")} aria-label="Clear search"><X /></Button>}</div>
        <Button variant="ghost" size="icon" className="launcher-icon-button" onClick={() => setWallpaperOpen(true)} aria-label="Choose wallpaper"><ImagePlus /></Button>
        <Link to="/settings" className="launcher-icon-button" aria-label="Open settings"><Settings2 className="h-4 w-4" /></Link>
      </header>
      <div className="launcher-quick-status" aria-label="Quick status"><span suppressHydrationWarning>{time}</span><i className={cn(online && "launcher-status-online")} /> <small>{online ? "Online" : "Offline"}</small></div>

      <main className="relative z-10 min-h-screen overflow-hidden">
        <aside className="launcher-edge-rail" aria-label="Independent edge apps">
          <div ref={edgeScrollRef} className="launcher-edge-scroll" style={{ ["--edge-count" as string]: preferences.edgeVisible }} onScroll={centerEdgeLoop}>
            <Button variant="ghost" className="launcher-edge-add" onClick={() => openEditor("edge")} disabled={edgeApps.length >= EDGE_MAX || preferences.appLocked} aria-label="Add edge app"><Plus /></Button>
            {edgeLoopApps.map((app, copyIndex) => <Button key={`${app.id}-${copyIndex}`} variant="ghost" className="launcher-edge-card" style={{ height: "calc((100cqh - 2.9rem) / var(--edge-count) - .45rem)", minHeight: 0 }} onClick={() => launch(app)} onContextMenu={(event) => { event.preventDefault(); openEditor("edge", app); }}><AppIcon app={app} size={Math.min(28, preferences.leftIconSize * .55, 240 / preferences.edgeVisible)} pack={preferences.iconPack} />{preferences.showLabels && preferences.edgeVisible <= 6 && <small>{app.label}</small>}</Button>)}
          </div>
          <span className="launcher-edge-count">{edgeApps.length}/{EDGE_MAX}</span>
        </aside>
        <div ref={edgeLettersRef} className="launcher-edge-letters" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); pickEdgeLetter(event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pickEdgeLetter(event.clientY); }} aria-label="Edge apps A to Z quick jump">{ALPHABET.map((letter) => <button key={letter} type="button" className={cn("launcher-letter", edgeLetter === letter && "launcher-letter--active", !edgeLetters.has(letter) && "launcher-letter--empty")} onClick={() => jumpEdgeLetter(letter)}>{letter}</button>)}</div>

        <section className="launcher-arc-zone" aria-label="Scrollable circular application launcher">
          <div className="launcher-orbit-rail launcher-orbit-rail--outer" /><div className="launcher-orbit-rail launcher-orbit-rail--middle" /><div className="launcher-orbit-rail launcher-orbit-rail--inner" />
          <div ref={arcRef} className="launcher-arc-surface" onPointerDown={(event) => { stop(); movedRef.current = 0; pointerRef.current = { angle: pointerAngle(event.clientX, event.clientY), time: performance.now() }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { const previous = pointerRef.current; if (!previous) return; const now = performance.now(); const angle = pointerAngle(event.clientX, event.clientY); let delta = angle - previous.angle; if (delta > 180) delta -= 360; if (delta < -180) delta += 360; movedRef.current += Math.abs(delta); velocityRef.current = delta / Math.max(1, now - previous.time) * 13; pointerRef.current = { angle, time: now }; apply(rotationRef.current + delta); }} onPointerUp={() => { pointerRef.current = null; rafRef.current = requestAnimationFrame(inertia); }} onPointerCancel={() => { pointerRef.current = null; }}>
            {RINGS.map(({ radius, dir, scale }, ring) => (ringSlots[ring] ?? []).map((app, index, list) => { const angle = index * 360 / list.length + rotation * dir + 180; const radians = angle * Math.PI / 180; const x = Math.cos(radians) * radius; const y = Math.sin(radians) * radius; const depth = (Math.cos(radians) + 1) / 2; const size = preferences.iconSize * scale; const base = preferences.iconOpacity / 100; const pos = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0)`; return app ? <Button key={app.id} variant="ghost" onClick={() => launch(app)} onContextMenu={(event) => { event.preventDefault(); openEditor("orbit", app); }} className="launcher-app-node" style={{ width: size, height: size, transform: `${pos} scale(${(.8 + depth * .2).toFixed(3)})`, opacity: Number((base * (.6 + depth * .4)).toFixed(3)), zIndex: Math.round(depth * 20) + ring * 30 }}><AppIcon app={app} size={size * .52} pack={preferences.iconPack} />{preferences.showLabels && ring === 0 && <span className="launcher-app-label">{app.label}</span>}</Button> : <Button key={`empty-${ring}-${index}`} variant="ghost" size="icon" onPointerDown={(event) => event.stopPropagation()} onClick={() => openPicker(index, ring)} disabled={preferences.appLocked} aria-label={`Add app to ring ${ring + 1} slot ${index + 1}`} className="launcher-empty-slot" style={{ width: size * .7, height: size * .7, transform: `${pos} scale(${(.7 + depth * .25).toFixed(3)})`, opacity: Number((.3 + depth * .5).toFixed(3)), zIndex: Math.round(depth * 20) + ring * 30 }}><Plus /></Button>; }))}
            {!orbitSlots.length && <div className="launcher-empty">No apps found</div>}
          </div>
          <Button variant="ghost" size="icon" className="launcher-orbit-add" onClick={() => { const [i, r] = firstFree(); openPicker(i, r); }} disabled={apps.length >= ORBIT_MAX || preferences.appLocked} aria-label="Add orbit app"><Plus /></Button>
          <span className="launcher-orbit-count">{apps.length}/{ORBIT_MAX}</span>
        </section>
        <div ref={alphabetRef} className="launcher-alphabet" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); pickLetter(event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pickLetter(event.clientY); }} aria-label="A to Z quick jump">{ALPHABET.map((letter) => <button key={letter} type="button" className={cn("launcher-letter", activeLetter === letter && "launcher-letter--active")} onClick={() => jumpToLetter(letter)}>{letter}</button>)}</div>
      </main>

      <div className="launcher-dock">{apps.slice(0, 4).map((app) => <button key={app.id} type="button" onClick={() => launch(app)} className="launcher-dock-app"><AppIcon app={app} size={34} pack={preferences.iconPack} />{preferences.showLabels && <small>{app.label}</small>}</button>)}</div>
      <Button className="launcher-drawer-handle" variant="ghost" onClick={() => setDrawerOpen(true)}><ChevronUp className="h-5 w-5" /><span>Swipe up</span></Button>
      <div className={cn("launcher-drawer-backdrop", drawerOpen && "launcher-drawer-backdrop--open")} onClick={() => setDrawerOpen(false)} />
      <aside className={cn("launcher-drawer", drawerOpen && "launcher-drawer--open")}><div className="launcher-drawer-grip" /><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pb-4"><div><h2 className="text-lg font-semibold">Quick drawer</h2><p className="text-xs text-muted-foreground">Two independent rails · 40 + 40 shortcuts</p></div><Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}><X /></Button></div>
        <div className="launcher-tools px-5"><Button onClick={() => { const [i, r] = firstFree(); openPicker(i, r); }} disabled={apps.length >= ORBIT_MAX || preferences.appLocked}><Plus /> Orbit app</Button><Button onClick={() => openEditor("edge")} disabled={edgeApps.length >= EDGE_MAX || preferences.appLocked}><Plus /> Edge app</Button><Button variant="outline" onClick={() => void installLauncher()}><Download /> {installed ? "Installed" : "Install Orbit"}</Button><Button variant="outline" onClick={() => setWallpaperOpen(true)}><ImagePlus /> Wallpaper</Button><Button variant="outline" onClick={() => setPreferences((value) => ({ ...value, darkMode: !value.darkMode }))}>{preferences.darkMode ? <Sun /> : <Moon />} Appearance</Button><Button variant={preferences.appLocked ? "default" : "outline"} onClick={() => setPreferences((value) => ({ ...value, appLocked: !value.appLocked }))}><Lock /> {preferences.appLocked ? "Unlock" : "App lock"}</Button><Button variant="outline" asChild><Link to="/settings"><Sparkles /> Icon packs</Link></Button></div>
        <div className="launcher-control-panel mx-5 mt-4"><label><Sun className="h-4 w-4" /><span>Brightness</span><input type="range" min="40" max="100" step="10" value={preferences.brightness} onChange={(event) => setPreferences((value) => ({ ...value, brightness: Number(event.target.value) }))} /><b>{preferences.brightness}%</b></label><label>{preferences.volume ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}<span>Sound</span><input type="range" min="0" max="100" step="10" value={preferences.volume} onChange={(event) => setPreferences((value) => ({ ...value, volume: Number(event.target.value) }))} /><b>{preferences.volume}%</b></label><label><Settings2 className="h-4 w-4" /><span>Orbit size</span><input type="range" min="46" max="82" step="2" value={preferences.iconSize} onChange={(event) => setPreferences((value) => ({ ...value, iconSize: Number(event.target.value) }))} /><b>{preferences.iconSize}px</b></label></div>
        <div className="launcher-premium mx-5 mt-4"><Crown /><div><b>Dual-scroll Lifetime</b><small>80 slots · premium packs · full customization</small></div><strong>₹499</strong></div>
        <ManageList title="Orbit apps" rail="orbit" apps={apps} locked={preferences.appLocked} onMove={moveApp} onEdit={openEditor} onRemove={(rail, id) => saveRail(rail, apps.filter((app) => app.id !== id))} />
        <ManageList title="Edge apps" rail="edge" apps={edgeApps} locked={preferences.appLocked} onMove={moveApp} onEdit={openEditor} onRemove={(rail, id) => saveRail(rail, edgeApps.filter((app) => app.id !== id))} />
      </aside>

      <WallpaperDialog open={wallpaperOpen} onOpenChange={setWallpaperOpen} activeId={customWallpaper ? "custom" : wallpaper.id} onChoose={(choice) => { setWallpaper(choice); setCustomWallpaper(""); localStorage.setItem(WALLPAPER_KEY, JSON.stringify({ id: choice.id })); }} onUrl={(url) => { if (!/^https:\/\//i.test(url)) { toast.error("Valid https image URL daalo"); return; } setCustomWallpaper(url); localStorage.setItem(WALLPAPER_KEY, JSON.stringify({ custom: url })); }} onUpload={uploadWallpaper} />
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent className="neon-panel launcher-picker max-w-md"><DialogHeader><DialogTitle>Choose app · Ring {(draft.ring ?? 0) + 1} · Slot {(draft.slot ?? 0) + 1}</DialogTitle></DialogHeader><div className="launcher-picker-search"><Search /><Input value={pickerSearch} onChange={(event) => setPickerSearch(event.target.value)} placeholder="Search built-in apps" autoFocus /></div><div className="launcher-picker-grid">{pickerApps.map((app) => <Button key={app.id} variant="ghost" className="launcher-picker-app" onClick={() => choosePickerApp(app)}><AppIcon app={app} size={42} pack={preferences.iconPack} /><span>{app.label}</span></Button>)}</div><Button variant="outline" onClick={createCustomFromPicker}><Plus /> Custom app, name or link</Button></DialogContent></Dialog>
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent className="neon-panel max-w-sm"><DialogHeader><DialogTitle>{draft.id ? "Customize shortcut" : `Add to ${draft.rail} rail`}</DialogTitle></DialogHeader><div className="launcher-icon-editor"><div className="launcher-icon-preview">{draft.iconImage ? <img src={draft.iconImage} alt="Custom app icon" /> : draft.emoji}</div><div className="grid gap-2"><Input value={draft.emoji} onChange={(event) => setDraft((value) => ({ ...value, emoji: event.target.value.slice(0, 3), iconImage: undefined }))} aria-label="App icon emoji" placeholder="Emoji" /><label className="launcher-upload launcher-upload--small"><Upload className="h-4 w-4" /> Own icon<input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadIcon(event.target.files?.[0])} /></label></div></div><Input value={draft.label} onChange={(event) => setDraft((value) => ({ ...value, label: event.target.value }))} placeholder="App name" /><Input value={draft.to} onChange={(event) => setDraft((value) => ({ ...value, to: event.target.value }))} placeholder="Website URL or app path" /><Button onClick={saveDraft}>{draft.id ? "Save changes" : "Add to launcher"}</Button></DialogContent></Dialog>
    </div>
  );
}

function ManageList({ title, rail, apps, locked, onMove, onEdit, onRemove }: { title: string; rail: LauncherRail; apps: WheelApp[]; locked: boolean; onMove: (rail: LauncherRail, index: number, direction: -1 | 1) => void; onEdit: (rail: LauncherRail, app?: WheelApp) => void; onRemove: (rail: LauncherRail, id: string) => void }) {
  return <details className="launcher-manage-group mx-5 mt-4"><summary>{title}<span>{apps.length}/{ORBIT_MAX}</span></summary><div className="mt-2 max-h-[30vh] space-y-2 overflow-y-auto">{apps.map((app, index) => <div key={app.id} className="launcher-manage-row"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="text-xl">{app.iconImage ? <img src={app.iconImage} alt="" className="h-7 w-7 rounded-md object-cover" /> : app.emoji}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{app.label}</span><Button variant="ghost" size="icon" onClick={() => onMove(rail, index, -1)} disabled={locked || index === 0}><ArrowUp /></Button><Button variant="ghost" size="icon" onClick={() => onMove(rail, index, 1)} disabled={locked || index === apps.length - 1}><ArrowDown /></Button><Button variant="ghost" size="icon" onClick={() => onEdit(rail, app)} disabled={locked}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => onRemove(rail, app.id)} disabled={locked}><Trash2 className="text-destructive" /></Button></div>)}</div></details>;
}

function WallpaperDialog({ open, onOpenChange, activeId, onChoose, onUrl, onUpload }: { open: boolean; onOpenChange: (open: boolean) => void; activeId: string; onChoose: (choice: Wallpaper) => void; onUrl: (url: string) => void; onUpload: (file?: File) => void }) {
  const [url, setUrl] = useState("");
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="neon-panel max-w-lg"><DialogHeader><DialogTitle>Wallpaper studio</DialogTitle></DialogHeader><div className="grid grid-cols-3 gap-2">{WALLPAPERS.map((choice) => <button key={choice.id} type="button" onClick={() => onChoose(choice)} className={cn("launcher-wallpaper-option", activeId === choice.id && "launcher-wallpaper-option--active")}><img src={choice.src} alt="" loading="lazy" width={1080} height={1920} /><span>{choice.name}</span></button>)}</div><label className="launcher-upload"><ImagePlus className="h-5 w-5" /><span>Upload from phone</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => onUpload(event.target.files?.[0])} /></label><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://... wallpaper URL" /><Button onClick={() => onUrl(url)}>Set URL</Button></div></DialogContent></Dialog>;
}