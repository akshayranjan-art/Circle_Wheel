import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ChevronUp, GripVertical, ImagePlus, Lock, Moon, Pencil, Plus, Search, Settings2, Sun, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import cityWallpaper from "@/assets/wallpaper-neon-city.jpg";
import orbitWallpaper from "@/assets/wallpaper-orbit-space.jpg";
import metalWallpaper from "@/assets/wallpaper-liquid-metal.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEFAULT_APPS, DEFAULT_LAUNCHER_PREFERENCES, MAX_APPS, loadLauncherApps, loadLauncherPreferences, saveLauncherApps, saveLauncherPreferences, type LauncherPreferences, type WheelApp } from "@/lib/wheel-apps";
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
type EditDraft = { id?: string; label: string; to: string; emoji: string };

function normalizedTarget(value: string) {
  const target = value.trim();
  return target.startsWith("/") || /^[a-z]+:/i.test(target) ? target : `https://${target}`;
}

export function LauncherHome() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<WheelApp[]>(DEFAULT_APPS);
  const [search, setSearch] = useState("");
  const [rotation, setRotation] = useState(0);
  const [activeLetter, setActiveLetter] = useState("A");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wallpaperOpen, setWallpaperOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<EditDraft>({ label: "", to: "", emoji: "✨" });
  const [wallpaper, setWallpaper] = useState<Wallpaper>(WALLPAPERS[0] ?? { id: "city", name: "Neon City", src: cityWallpaper });
  const [customWallpaper, setCustomWallpaper] = useState("");
  const [time, setTime] = useState("05:03");
  const [preferences, setPreferences] = useState<LauncherPreferences>(DEFAULT_LAUNCHER_PREFERENCES);
  const arcRef = useRef<HTMLDivElement | null>(null);
  const alphabetRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const pointerRef = useRef<{ angle: number; time: number } | null>(null);
  const swipeRef = useRef<number | null>(null);
  const movedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setApps(loadLauncherApps());
    setPreferences(loadLauncherPreferences());
    try {
      const saved = JSON.parse(localStorage.getItem(WALLPAPER_KEY) ?? "null") as { id?: string; custom?: string } | null;
      const preset = WALLPAPERS.find((item) => item.id === saved?.id);
      if (preset) setWallpaper(preset);
      if (saved?.custom) setCustomWallpaper(saved.custom);
    } catch {
      // Keep defaults when saved launcher data is invalid.
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", preferences.darkMode);
    saveLauncherPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    soundFX.setEnabled(preferences.volume > 0);
  }, [preferences.volume]);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const saveApps = useCallback((next: WheelApp[]) => {
    const limited = saveLauncherApps(next);
    setApps(limited);
  }, []);

  const visibleApps = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return apps.filter((app) => !needle || app.label.toLowerCase().includes(needle)).sort((a, b) => a.label.localeCompare(b.label));
  }, [apps, search]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);
  const apply = useCallback((value: number) => {
    rotationRef.current = value;
    setRotation(value);
  }, []);
  const inertia = useCallback(() => {
    velocityRef.current *= 0.94;
    if (Math.abs(velocityRef.current) < 0.04) return stop();
    apply(rotationRef.current + velocityRef.current);
    rafRef.current = requestAnimationFrame(inertia);
  }, [apply, stop]);

  useEffect(() => {
    const element = arcRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      stop();
      const dy = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      velocityRef.current = Math.max(-9, Math.min(9, dy * 0.035));
      rafRef.current = requestAnimationFrame(inertia);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [inertia, stop]);

  useEffect(() => () => stop(), [stop]);

  const jumpToLetter = useCallback((letter: string) => {
    setActiveLetter(letter);
    const index = visibleApps.findIndex((app) => app.label.toUpperCase().startsWith(letter));
    if (index >= 0 && visibleApps.length) {
      apply(-(index * 360) / visibleApps.length);
    }
  }, [apply, visibleApps]);

  const pickLetter = (clientY: number) => {
    const element = alphabetRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(0.999, (clientY - rect.top) / rect.height));
    const letter = ALPHABET[Math.floor(ratio * ALPHABET.length)];
    if (letter) jumpToLetter(letter);
  };

  const pointerAngle = (clientX: number, clientY: number) => {
    const rect = arcRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
  };

  const launch = (app: WheelApp) => {
    if (movedRef.current > 7) return;
    if (app.to.startsWith("/")) {
      void navigate({ to: app.to });
    } else if (["camera", "calculator", "clock", "gallery"].includes(app.to)) {
      toast.info(`${app.label} shortcut ready hai — browser phone app directly nahi khol sakta.`);
    } else {
      window.open(app.to, "_blank", "noopener,noreferrer");
    }
  };

  const openEditor = (app?: WheelApp) => {
    setDraft(app ? { id: app.id, label: app.label, to: app.to, emoji: app.emoji } : { label: "", to: "", emoji: "✨" });
    setEditorOpen(true);
  };

  const saveDraft = () => {
    if (preferences.appLocked) { toast.error("Unlock launcher before editing apps"); return; }
    if (!draft.label.trim() || !draft.to.trim()) { toast.error("App name aur link dono daalo"); return; }
    if (!draft.id && apps.length >= MAX_APPS) { toast.error("40 apps capacity full hai"); return; }
    const app: WheelApp = { id: draft.id ?? `custom-${Date.now()}`, label: draft.label.trim(), to: normalizedTarget(draft.to), emoji: draft.emoji.trim() || "✨", custom: true };
    saveApps(draft.id ? apps.map((item) => item.id === draft.id ? app : item) : [...apps, app]);
    setEditorOpen(false);
    toast.success(draft.id ? "Shortcut update ho gaya" : "Shortcut arc me add ho gaya");
  };

  const moveApp = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    const current = apps[index];
    const other = apps[target];
    if (!current || !other) return;
    const next = [...apps];
    next[index] = other;
    next[target] = current;
    saveApps(next);
  };

  const chooseWallpaper = (choice: Wallpaper) => {
    setWallpaper(choice);
    setCustomWallpaper("");
    localStorage.setItem(WALLPAPER_KEY, JSON.stringify({ id: choice.id }));
  };

  const useWallpaperUrl = (url: string) => {
    if (!/^https:\/\//i.test(url)) { toast.error("Valid https image URL daalo"); return; }
    setCustomWallpaper(url);
    localStorage.setItem(WALLPAPER_KEY, JSON.stringify({ custom: url }));
    toast.success("Custom wallpaper set ho gaya");
  };

  const uploadWallpaper = (file?: File) => {
    if (!file?.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Wallpaper 10 MB se chhota rakho"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1080 / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const value = canvas.toDataURL("image/jpeg", 0.76);
        setCustomWallpaper(value);
        try { localStorage.setItem(WALLPAPER_KEY, JSON.stringify({ custom: value })); } catch { toast.info("Wallpaper is session ke liye set hai"); }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="launcher-stage" onPointerDown={(event) => { if (event.clientY > window.innerHeight * 0.72) swipeRef.current = event.clientY; }} onPointerUp={(event) => { if (swipeRef.current !== null && swipeRef.current - event.clientY > 65) setDrawerOpen(true); swipeRef.current = null; }}>
      <img src={customWallpaper || wallpaper.src} alt="" className={cn("launcher-wallpaper", `launcher-brightness-${Math.round(preferences.brightness / 10) * 10}`)} width={1080} height={1920} />
      <div className="launcher-shade" />
      <header className="launcher-status">
        <div><p className="text-[11px] font-semibold uppercase text-foreground/65">Orbit OS</p><p suppressHydrationWarning className="text-2xl font-semibold">{time}</p></div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="launcher-icon-button" onClick={() => setPreferences((value) => ({ ...value, darkMode: !value.darkMode }))} aria-label="Toggle light and dark mode">{preferences.darkMode ? <Sun /> : <Moon />}</Button>
          <Button variant="ghost" size="icon" className="launcher-icon-button" onClick={() => setWallpaperOpen(true)} aria-label="Choose wallpaper"><ImagePlus /></Button>
          <Link to="/settings" className="launcher-icon-button" aria-label="Open settings"><Settings2 className="h-4 w-4" /></Link>
        </div>
      </header>
      <main className="relative z-10 min-h-screen overflow-hidden px-4 pb-24 pt-24 sm:px-8">
        <div className="launcher-search mx-auto max-w-lg"><Search className="h-5 w-5 shrink-0" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Application" aria-label="Search Application" />{search && <Button variant="ghost" size="icon" onClick={() => setSearch("")} aria-label="Clear search"><X /></Button>}</div>
        <div className="mx-auto mt-4 flex max-w-lg items-center justify-end pr-6"><span className="launcher-chip shrink-0">{apps.length}/{MAX_APPS}</span></div>
        <div className="launcher-left-stack" aria-label="Favorite apps">
          {apps.slice(0, 5).map((app) => <Button key={app.id} variant="ghost" className="launcher-left-card" onClick={() => launch(app)}><span style={{ fontSize: `${preferences.iconSize * .46}px` }}>{app.emoji}</span>{preferences.showLabels && <small>{app.label}</small>}</Button>)}
        </div>
        <section className="launcher-arc-zone" aria-label="Scrollable edge application launcher">
          <div className="launcher-orbit-rail launcher-orbit-rail--outer" />
          <div className="launcher-orbit-rail launcher-orbit-rail--middle" />
          <div className="launcher-orbit-rail launcher-orbit-rail--inner" />
          <div ref={arcRef} className="launcher-arc-surface" onPointerDown={(event) => { stop(); movedRef.current = 0; pointerRef.current = { angle: pointerAngle(event.clientX, event.clientY), time: performance.now() }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { const previous = pointerRef.current; if (!previous) return; const now = performance.now(); const angle = pointerAngle(event.clientX, event.clientY); let delta = angle - previous.angle; if (delta > 180) delta -= 360; if (delta < -180) delta += 360; movedRef.current += Math.abs(delta); velocityRef.current = delta / Math.max(1, now - previous.time) * 16; pointerRef.current = { angle, time: now }; apply(rotationRef.current + delta); }} onPointerUp={() => { pointerRef.current = null; rafRef.current = requestAnimationFrame(inertia); }} onPointerCancel={() => { pointerRef.current = null; }}>
            {visibleApps.length ? visibleApps.map((app, index) => { const angle = index * 360 / visibleApps.length + rotation + 180; const radians = angle * Math.PI / 180; const x = Math.cos(radians) * 248; const y = Math.sin(radians) * 248; const depth = (Math.cos(radians) + 1) / 2; return <Button key={app.id} variant="ghost" onClick={() => launch(app)} className="launcher-app-node" style={{ width: `${preferences.iconSize}px`, height: `${preferences.iconSize}px`, transform: `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0) scale(${(.74 + depth * .28).toFixed(3)})`, opacity: Number((.32 + depth * .68).toFixed(3)), zIndex: Math.round(depth * 20) }}><span className="launcher-app-icon" style={{ fontSize: `${preferences.iconSize * .4}px` }}>{app.emoji}</span>{preferences.showLabels && <span className="launcher-app-label">{app.label}</span>}</Button>; }) : <div className="launcher-empty">No apps found</div>}
          </div>
          <Button variant="ghost" size="icon" className="launcher-orbit-add" onClick={() => openEditor()} disabled={apps.length >= MAX_APPS || preferences.appLocked} aria-label="Add app"><Plus /></Button>
        </section>
        <div ref={alphabetRef} className="launcher-alphabet" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); pickLetter(event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pickLetter(event.clientY); }} aria-label="A to Z quick jump">{ALPHABET.map((letter) => <button key={letter} type="button" className={cn("launcher-letter", activeLetter === letter && "launcher-letter--active")} onClick={() => jumpToLetter(letter)}>{letter}</button>)}</div>
      </main>
      <div className="launcher-dock">{apps.slice(0, 4).map((app) => <button key={app.id} type="button" onClick={() => launch(app)} className="launcher-dock-app"><span>{app.emoji}</span><small>{app.label}</small></button>)}</div>
      <Button className="launcher-drawer-handle" variant="ghost" onClick={() => setDrawerOpen(true)}><ChevronUp className="h-5 w-5" /><span>Swipe up</span></Button>
      <div className={cn("launcher-drawer-backdrop", drawerOpen && "launcher-drawer-backdrop--open")} onClick={() => setDrawerOpen(false)} />
      <aside className={cn("launcher-drawer", drawerOpen && "launcher-drawer--open")}><div className="launcher-drawer-grip" /><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pb-4"><div className="min-w-0"><h2 className="truncate text-lg font-semibold">Quick drawer</h2><p className="text-xs text-muted-foreground">Reorder, edit, remove, or add up to 40 apps.</p></div><Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}><X /></Button></div>
        <div className="launcher-tools px-5"><Button onClick={() => openEditor()} disabled={apps.length >= MAX_APPS || preferences.appLocked}><Plus /> Add shortcut</Button><Button variant="outline" onClick={() => setWallpaperOpen(true)}><ImagePlus /> Wallpaper</Button><Button variant="outline" onClick={() => setPreferences((value) => ({ ...value, darkMode: !value.darkMode }))}>{preferences.darkMode ? <Sun /> : <Moon />} Appearance</Button><Button variant={preferences.appLocked ? "default" : "outline"} onClick={() => setPreferences((value) => ({ ...value, appLocked: !value.appLocked }))}><Lock /> {preferences.appLocked ? "Unlock" : "App lock"}</Button></div>
        <div className="launcher-control-panel mx-5 mt-4">
          <label><Sun className="h-4 w-4" /><span>Brightness</span><input type="range" min="40" max="100" step="10" value={preferences.brightness} onChange={(event) => setPreferences((value) => ({ ...value, brightness: Number(event.target.value) }))} /><b>{preferences.brightness}%</b></label>
          <label>{preferences.volume ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}<span>Launcher sound</span><input type="range" min="0" max="100" step="10" value={preferences.volume} onChange={(event) => setPreferences((value) => ({ ...value, volume: Number(event.target.value) }))} /><b>{preferences.volume}%</b></label>
          <label><Settings2 className="h-4 w-4" /><span>Icon size</span><input type="range" min="46" max="74" step="2" value={preferences.iconSize} onChange={(event) => setPreferences((value) => ({ ...value, iconSize: Number(event.target.value) }))} /><b>{preferences.iconSize}px</b></label>
        </div>
        <div className="mt-5 max-h-[46vh] space-y-2 overflow-y-auto px-5 pb-8">{apps.map((app, index) => <div key={app.id} className="launcher-manage-row"><GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="text-xl">{app.emoji}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{app.label}</span><Button variant="ghost" size="icon" onClick={() => moveApp(index, -1)} disabled={preferences.appLocked || index === 0}><ArrowUp /></Button><Button variant="ghost" size="icon" onClick={() => moveApp(index, 1)} disabled={preferences.appLocked || index === apps.length - 1}><ArrowDown /></Button><Button variant="ghost" size="icon" onClick={() => openEditor(app)} disabled={preferences.appLocked}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => saveApps(apps.filter((item) => item.id !== app.id))} disabled={preferences.appLocked}><Trash2 className="text-destructive" /></Button></div>)}</div>
      </aside>
      <WallpaperDialog open={wallpaperOpen} onOpenChange={setWallpaperOpen} activeId={customWallpaper ? "custom" : wallpaper.id} onChoose={chooseWallpaper} onUrl={useWallpaperUrl} onUpload={uploadWallpaper} />
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent className="neon-panel max-w-sm"><DialogHeader><DialogTitle>{draft.id ? "Customize shortcut" : "Add shortcut"}</DialogTitle></DialogHeader><div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2"><Input value={draft.emoji} onChange={(event) => setDraft((value) => ({ ...value, emoji: event.target.value.slice(0, 3) }))} aria-label="App icon emoji" /><Input value={draft.label} onChange={(event) => setDraft((value) => ({ ...value, label: event.target.value }))} placeholder="App name" /></div><Input value={draft.to} onChange={(event) => setDraft((value) => ({ ...value, to: event.target.value }))} placeholder="Website URL or app path" /><Button onClick={saveDraft}>{draft.id ? "Save changes" : "Add to launcher"}</Button></DialogContent></Dialog>
    </div>
  );
}

function WallpaperDialog({ open, onOpenChange, activeId, onChoose, onUrl, onUpload }: { open: boolean; onOpenChange: (open: boolean) => void; activeId: string; onChoose: (choice: Wallpaper) => void; onUrl: (url: string) => void; onUpload: (file?: File) => void }) {
  const [url, setUrl] = useState("");
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="neon-panel max-w-lg"><DialogHeader><DialogTitle>Wallpaper studio</DialogTitle></DialogHeader><div className="grid grid-cols-3 gap-2">{WALLPAPERS.map((choice) => <button key={choice.id} type="button" onClick={() => onChoose(choice)} className={cn("launcher-wallpaper-option", activeId === choice.id && "launcher-wallpaper-option--active")}><img src={choice.src} alt="" loading="lazy" width={1080} height={1920} /><span>{choice.name}</span></button>)}</div><label className="launcher-upload"><ImagePlus className="h-5 w-5" /><span>Upload from phone</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => onUpload(event.target.files?.[0])} /></label><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://... wallpaper URL" /><Button onClick={() => onUrl(url)}>Set URL</Button></div></DialogContent></Dialog>;
}