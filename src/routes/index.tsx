import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Phone,
  MessageSquare,
  Camera,
  Globe,
  Calculator,
  Clock,
  Image as ImageIcon,
  Settings,
  Search,
  Lock,
  Unlock,
  Fingerprint,
  BatteryCharging,
  Wifi,
  Signal,
  Sparkles,
  Radio,
  RotateCcw,
  X,
  Flame,
  Zap,
  Shield,
  Heart,
  Palette,
  Play,
  Share2,
  Folder,
  Sliders,
  Send,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { soundFX } from "@/lib/sound-fx";
import { useWallet } from "@/components/wallet-provider";
import { useLanguage } from "@/lib/language-context";
import { BUILT_IN_APPS, PRESET_APPS, isExternal, type WheelApp } from "@/lib/wheel-apps";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit Cyber Launcher — 4D Arc Wheel & Dashboard" },
      {
        name: "description",
        content:
          "Cybernetic mobile home screen with live 3D arc rotator, biometric screen lock, mobile apps, and 4D Ludo ecosystem.",
      },
      { property: "og:title", content: "Orbit Cyber Launcher — 4D Arc Wheel & Dashboard" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardLauncher,
});

// All Mobile Phone Apps matching user's phone screenshot
const MOBILE_PHONE_APPS = [
  {
    id: "dialer",
    name: "Phone",
    icon: "📞",
    category: "phone",
    action: "dialer",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: "messages",
    name: "Messages",
    icon: "💬",
    category: "phone",
    action: "messages",
    to: "/messages",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "camera",
    name: "Camera",
    icon: "📷",
    category: "media",
    action: "camera",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "chrome",
    name: "Chrome",
    icon: "🌐",
    category: "tool",
    action: "external",
    to: "https://google.com",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: "🧮",
    category: "tool",
    action: "calc",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "clock",
    name: "Clock",
    icon: "⏰",
    category: "tool",
    action: "clock",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "gallery",
    name: "Gallery",
    icon: "🖼️",
    category: "media",
    action: "gallery",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "playstore",
    name: "Play Store",
    icon: "🛍️",
    category: "tool",
    action: "external",
    to: "https://play.google.com",
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "🟢",
    category: "social",
    action: "external",
    to: "https://web.whatsapp.com",
    color: "from-green-500 to-emerald-700",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶️",
    category: "media",
    action: "external",
    to: "https://youtube.com",
    color: "from-red-500 to-rose-700",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: "🎧",
    category: "media",
    action: "external",
    to: "https://open.spotify.com",
    color: "from-emerald-400 to-green-600",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    category: "social",
    action: "external",
    to: "https://instagram.com",
    color: "from-pink-500 to-purple-600",
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    category: "tool",
    action: "route",
    to: "/settings",
    color: "from-slate-500 to-zinc-700",
  },
  {
    id: "files",
    name: "Files",
    icon: "📁",
    category: "tool",
    action: "files",
    color: "from-amber-600 to-yellow-600",
  },
  // Orbit Ludo Games & Features
  {
    id: "ludo",
    name: "Ludo 4D Arena",
    icon: "🎲",
    category: "game",
    action: "route",
    to: "/ludo",
    color: "from-cyan-400 via-blue-500 to-purple-600",
    featured: true,
  },
  {
    id: "rooms",
    name: "Voice Lounge",
    icon: "🎙️",
    category: "game",
    action: "route",
    to: "/rooms",
    color: "from-purple-500 to-pink-600",
    featured: true,
  },
  {
    id: "spin",
    name: "Fortune Wheel",
    icon: "🎡",
    category: "game",
    action: "route",
    to: "/spin",
    color: "from-amber-400 to-orange-500",
    featured: true,
  },
  {
    id: "diamonds",
    name: "Diamond Bank",
    icon: "💎",
    category: "game",
    action: "route",
    to: "/diamonds",
    color: "from-sky-400 to-blue-600",
    featured: true,
  },
  {
    id: "board",
    name: "Hall of Fame",
    icon: "🏆",
    category: "game",
    action: "route",
    to: "/leaderboard",
    color: "from-yellow-400 to-amber-600",
    featured: true,
  },
  {
    id: "gifts",
    name: "Gifts Store",
    icon: "🎁",
    category: "game",
    action: "route",
    to: "/gifts",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "profile",
    name: "Cyber Profile",
    icon: "👤",
    category: "game",
    action: "route",
    to: "/profile",
    color: "from-indigo-500 to-purple-600",
  },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const WALLPAPERS = [
  {
    id: "cyber-city",
    name: "Cyberpunk City",
    bg: "radial-gradient(ellipse at top, #1e1b4b 0%, #030712 70%)",
  },
  {
    id: "neon-void",
    name: "Neon Matrix",
    bg: "radial-gradient(circle at center, #064e3b 0%, #022c22 40%, #020617 90%)",
  },
  {
    id: "deep-space",
    name: "Deep Space Orbit",
    bg: "radial-gradient(ellipse at bottom, #3b0764 0%, #09090b 80%)",
  },
  {
    id: "liquid-mercury",
    name: "Liquid Mercury",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
  },
];

export function DashboardLauncher() {
  const { diamonds } = useWallet();
  const { t } = useLanguage();

  // Screen Lock State (Feature: lock wala bhi rahe)
  const [isLocked, setIsLocked] = useState(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);

  // Time & Status
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("05:14");
  const [currentDate, setCurrentDate] = useState("Today");

  // Wallpaper Theme
  const [activeWallpaper, setActiveWallpaper] = useState(0);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Screen Rotater Wheel State (Feature: srcee pe bhi rotater laga rahe)
  const [wheelRotation, setWheelRotation] = useState(0);
  const rotRef = useRef(0);
  const vel = useRef(0);
  const lastPointer = useRef<{ y: number; time: number } | null>(null);
  const isDragging = useRef(false);
  const movedDist = useRef(0);

  // Simulated Mini Apps Dialogs
  const [dialerOpen, setDialerOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Mini App States
  const [dialNumber, setDialNumber] = useState("");
  const [inCall, setInCall] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [cameraFilter, setCameraFilter] = useState<"neon" | "matrix" | "thermal">("neon");
  const [cameraFlash, setCameraFlash] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);

  // Clock Ticker
  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch Ticker
  useEffect(() => {
    if (!stopwatchActive) return;
    const interval = setInterval(() => {
      setStopwatchSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [stopwatchActive]);

  // Rotator apps list sorted for the curved arc
  const rotatorApps = useMemo(() => {
    return [...MOBILE_PHONE_APPS].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filtered center apps
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return MOBILE_PHONE_APPS;
    const q = searchQuery.toLowerCase();
    return MOBILE_PHONE_APPS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Handle Rotater Wheel Drag & Kinetic Spin
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    movedDist.current = 0;
    lastPointer.current = { y: e.clientY, time: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !lastPointer.current) return;
    const now = performance.now();
    const dy = e.clientY - lastPointer.current.y;
    const dt = Math.max(1, now - lastPointer.current.time);
    movedDist.current += Math.abs(dy);
    vel.current = (dy / dt) * 15;
    lastPointer.current = { y: e.clientY, time: now };
    const nextRot = rotRef.current + dy * 0.45;
    rotRef.current = nextRot;
    setWheelRotation(nextRot);
    if (Math.abs(dy) > 4) {
      soundFX.playTick();
    }
  };

  const onPointerUp = () => {
    isDragging.current = false;
    lastPointer.current = null;
  };

  // Jump rotator to letter
  const jumpToLetter = (letter: string) => {
    soundFX.playArrowNav();
    const idx = rotatorApps.findIndex((a) => a.name.toUpperCase().startsWith(letter));
    if (idx !== -1) {
      const step = 360 / rotatorApps.length;
      const targetRot = -idx * step;
      rotRef.current = targetRot;
      setWheelRotation(targetRot);
      toast.info(`Rotated to '${letter}' — ${rotatorApps[idx].name}`);
    }
  };

  // Launch app handler
  const handleAppClick = (app: (typeof MOBILE_PHONE_APPS)[number]) => {
    soundFX.playWheelNode(1);
    if (app.action === "dialer") {
      setDialerOpen(true);
    } else if (app.action === "calc") {
      setCalcOpen(true);
    } else if (app.action === "camera") {
      setCameraOpen(true);
    } else if (app.action === "clock") {
      setClockOpen(true);
    } else if (app.action === "gallery") {
      setGalleryOpen(true);
    } else if (app.action === "files") {
      toast.info("📁 File Manager: 128 GB Storage Clean & Encrypted!");
    } else if (app.action === "external" && app.to) {
      window.open(app.to, "_blank");
    }
  };

  // Screen Lock triggers
  const triggerScreenLock = () => {
    soundFX.playLock();
    setIsLocked(true);
    toast("🔒 Biometric Screen Locked! Touch scanner to unlock.");
  };

  const handleFingerprintUnlock = () => {
    if (isScanningFingerprint) return;
    setIsScanningFingerprint(true);
    soundFX.playLiquidRipple();
    setTimeout(() => {
      soundFX.playUnlock();
      setIsScanningFingerprint(false);
      setIsLocked(false);
      toast.success("🔓 Biometric Scan Verified: Access Granted!");
    }, 1100);
  };

  // Calculator button click
  const handleCalcPress = (char: string) => {
    soundFX.playTick();
    if (char === "C") {
      setCalcDisplay("0");
    } else if (char === "=") {
      try {
        // Safe evaluation
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, "");
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcDisplay(String(res));
      } catch {
        setCalcDisplay("Error");
      }
    } else {
      setCalcDisplay((prev) => (prev === "0" || prev === "Error" ? char : prev + char));
    }
  };

  // Phone dialer DTMF tone
  const handleDialPress = (digit: string) => {
    soundFX.playTick();
    setDialNumber((prev) => prev + digit);
  };

  return (
    <div
      style={{ background: WALLPAPERS[activeWallpaper].bg }}
      className="relative min-h-screen w-full select-none overflow-x-hidden transition-colors duration-700 text-slate-100"
    >
      {/* HOLOGRAPHIC BIOMETRIC LOCKSCREEN (User Request: lock wala bhi rahe) */}
      {isLocked && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/90 backdrop-blur-xl p-6 text-center animate-fade-in">
          {/* Top Lock Status */}
          <div className="flex w-full items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Shield className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              CYBER SHIELD ACTIVE
            </span>
            <div className="flex items-center gap-2">
              <Wifi className="h-3.5 w-3.5 text-cyan-400" />
              <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-400">98%</span>
            </div>
          </div>

          {/* Center Holographic Clock */}
          <div className="flex flex-col items-center mt-10">
            <h1
              suppressHydrationWarning
              className="text-7xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(6,182,212,0.8)] sm:text-8xl font-mono"
            >
              {currentTime}
            </h1>
            <p
              suppressHydrationWarning
              className="mt-2 text-base font-bold uppercase tracking-widest text-cyan-300"
            >
              {currentDate}
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-1.5 border border-cyan-500/40 text-xs font-bold text-slate-300">
              <Lock className="h-3.5 w-3.5 text-red-400 animate-pulse" />
              <span>Biometric Security Locked</span>
            </div>
          </div>

          {/* Bottom Biometric Fingerprint Sensor */}
          <div className="flex flex-col items-center mb-8">
            <button
              type="button"
              onClick={handleFingerprintUnlock}
              aria-label="Scan Fingerprint to Unlock"
              className={cn(
                "relative flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-300",
                isScanningFingerprint
                  ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_40px_rgba(16,185,129,0.8)] scale-110"
                  : "border-cyan-400 bg-slate-950/80 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95",
              )}
            >
              {/* Laser scanning sweep */}
              {isScanningFingerprint && (
                <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce" />
              )}
              <Fingerprint
                className={cn(
                  "h-12 w-12 transition-colors",
                  isScanningFingerprint ? "text-emerald-400 animate-pulse" : "text-cyan-400",
                )}
              />
            </button>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              {isScanningFingerprint
                ? "Scanning Biometrics..."
                : "Tap Fingerprint Sensor to Unlock"}
            </p>
          </div>
        </div>
      )}

      {/* TOP CYBER STATUS BAR */}
      <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-4 py-3 border-b border-white/10 text-xs">
        {/* Left: Clock & Network */}
        <div className="flex items-center gap-3">
          <span
            suppressHydrationWarning
            className="font-mono text-sm font-bold text-white drop-shadow"
          >
            {currentTime}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-bold">
            <Signal className="h-3 w-3 text-cyan-400" />
            <span>5G Ultra</span>
            <Wifi className="h-3 w-3 text-cyan-400" />
          </div>
        </div>

        {/* Center: Wallpaper Switcher & Bio-Lock Button */}
        <div className="flex items-center gap-2">
          {/* Wallpaper Theme Picker */}
          <button
            type="button"
            onClick={() => {
              soundFX.playTick();
              setActiveWallpaper((w) => (w + 1) % WALLPAPERS.length);
              toast.info(`Theme: ${WALLPAPERS[(activeWallpaper + 1) % WALLPAPERS.length].name}`);
            }}
            className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold border border-white/10 text-slate-300 hover:text-white"
            title="Change Wallpaper Theme"
          >
            <Palette className="h-3 w-3 text-cyan-400" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* BIO-LOCK SCREEN BUTTON (User Request: lock wala bhi rahe) */}
          <button
            type="button"
            onClick={triggerScreenLock}
            className="flex items-center gap-1.5 rounded-full bg-red-950/60 px-3 py-1 text-[11px] font-bold border border-red-500/40 text-red-300 hover:bg-red-900/60 hover:text-white transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)]"
          >
            <Lock className="h-3 w-3 text-red-400" />
            <span>Lock Screen</span>
          </button>
        </div>

        {/* Right: Diamonds Balance & Battery */}
        <div className="flex items-center gap-3">
          <Link
            to="/diamonds"
            className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 border border-primary/50 text-[11px] font-mono font-bold text-primary shadow"
          >
            <span>💎</span>
            <span>{diamonds.toLocaleString()}</span>
          </Link>
          <div className="flex items-center gap-1 text-slate-300">
            <BatteryCharging className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-[11px]">98%</span>
          </div>
        </div>
      </header>

      {/* MAIN LAUNCHER CONTENT AREA */}
      <main className="relative z-20 mx-auto max-w-6xl px-4 pt-6 pb-40">
        {/* HERO WIDGET: Digital Clock & Search Bar */}
        <div className="flex flex-col items-center text-center mb-8">
          <h2
            suppressHydrationWarning
            className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            {currentTime}
          </h2>
          <p
            suppressHydrationWarning
            className="mt-1 text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-300"
          >
            {currentDate} • Cyber Hub
          </p>

          {/* Quick App Search Bar */}
          <div className="relative mt-5 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps, dialer, 4D games, camera..."
              className="w-full rounded-2xl bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 border border-white/15 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 backdrop-blur-md shadow-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2-COLUMN VIEWPORT: Center Apps Grid + Screen Rotator Wheel Arc */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* CENTER APPS GRID (User Request: bich me bhi app rahe) */}
          <div className="rounded-3xl bg-slate-950/60 p-5 sm:p-7 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Mobile & Cyber Apps ({filteredApps.length})
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">1-Tap to Launch</span>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {filteredApps.map((app) => {
                const isInternalRoute = app.action === "route" && app.to;

                const content = (
                  <div className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-white/5 transition-all duration-200 cursor-pointer">
                    {/* Glowing App Icon Frame */}
                    <div
                      className={cn(
                        "relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br p-0.5 shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-200",
                        app.color,
                        app.featured &&
                          "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]",
                      )}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950/90 text-2xl sm:text-3xl">
                        {app.icon}
                      </div>
                      {app.featured && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                        </span>
                      )}
                    </div>

                    {/* App Label */}
                    <span className="mt-2 text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate max-w-[80px]">
                      {app.name}
                    </span>
                  </div>
                );

                if (isInternalRoute) {
                  return (
                    <Link
                      key={app.id}
                      to={app.to}
                      onClick={() => soundFX.playWheelNode(2)}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleAppClick(app)}
                    className="block text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>

            {/* Quick Dock Shortcuts at bottom of central grid */}
            <div className="mt-6 border-t border-white/10 pt-4 flex flex-wrap items-center justify-around gap-2 bg-slate-900/50 p-3 rounded-2xl">
              <button
                type="button"
                onClick={() => setDialerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/80"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Dialer</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900/80"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-900/80"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Camera</span>
              </button>
              <Link
                to="/ludo"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/80"
              >
                <span>🎲</span>
                <span>Play Ludo</span>
              </Link>
            </div>
          </div>

          {/* SCREEN ROTATOR WHEEL ARC & ALPHABET SLIDER (User Request: srcee pe bhi rotater laga rahe) */}
          <div className="relative flex flex-col items-center rounded-3xl bg-slate-950/60 p-4 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex w-full items-center justify-between mb-2 pb-2 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                3D Arc Rotater Wheel
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Flick / Drag</span>
            </div>

            {/* Interactive Arc Wheel Container */}
            <div
              className="relative h-72 w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Outer guide ring */}
              <div className="absolute right-0 h-80 w-80 rounded-full border border-cyan-500/20 pointer-events-none" />
              <div className="absolute right-4 h-64 w-64 rounded-full border border-dashed border-cyan-500/30 pointer-events-none" />

              {/* Rotator Nodes positioned in curved arc */}
              <div
                className="relative h-full w-full"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isDragging.current
                    ? "none"
                    : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {rotatorApps.map((app, idx) => {
                  const angle = (idx * 360) / rotatorApps.length;
                  const rad = (angle * Math.PI) / 180;
                  const radius = 110;
                  const posX = Math.round(130 + Math.cos(rad) * radius);
                  const posY = Math.round(140 + Math.sin(rad) * radius);

                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        if (movedDist.current < 5) {
                          handleAppClick(app);
                        }
                      }}
                      style={{
                        transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`,
                      }}
                      className="absolute left-1/2 top-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 border-2 border-cyan-400 text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-125 transition-transform"
                      title={app.name}
                    >
                      <span>{app.icon}</span>
                    </button>
                  );
                })}
              </div>

              {/* Center Core Indicator */}
              <div className="pointer-events-none absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_20px_#06b6d4]">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            {/* A-Z Alphabet Quick Scroller Strip (matching screenshot) */}
            <div className="mt-3 flex w-full flex-wrap justify-center gap-1 border-t border-white/10 pt-2 text-[10px] font-mono font-bold text-slate-400">
              {ALPHABET.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => jumpToLetter(char)}
                  className="h-5 w-5 rounded hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                >
                  {char}
                </button>
              ))}
            </div>

            <p className="mt-2 text-center text-[10px] text-slate-400">
              Spin the arc wheel or tap letters A-Z for instant navigation
            </p>
          </div>
        </div>
      </main>

      {/* SIMULATED PHONE DIALER MODAL */}
      <Dialog open={dialerOpen} onOpenChange={setDialerOpen}>
        <DialogContent className="max-w-xs rounded-3xl bg-slate-950 border border-cyan-500/40 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase text-cyan-400 flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> Cyber Phone Dialer
            </DialogTitle>
          </DialogHeader>

          {inCall ? (
            <div className="flex flex-col items-center py-6 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-3xl animate-pulse">
                📞
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {dialNumber || "Calling Orbit Server..."}
                </p>
                <p className="text-xs font-mono text-emerald-400">
                  Encrypted Call Connected (00:24)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playLock();
                  setInCall(false);
                }}
                className="rounded-full bg-red-600 px-6 py-2 text-xs font-black uppercase text-white shadow-lg"
              >
                End Call
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dialed Display */}
              <div className="h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between px-3">
                <span className="font-mono text-lg font-bold tracking-widest text-cyan-300 truncate">
                  {dialNumber || "Enter number..."}
                </span>
                {dialNumber && (
                  <button
                    type="button"
                    onClick={() => setDialNumber((d) => d.slice(0, -1))}
                    className="text-slate-400 hover:text-white"
                  >
                    ⌫
                  </button>
                )}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDialPress(d)}
                    className="h-12 rounded-xl bg-slate-900 border border-slate-800 font-mono text-lg font-bold text-white hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Call Button */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playUnlock();
                  setInCall(true);
                }}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-emerald-500 flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" /> Call Number
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SIMULATED CALCULATOR MODAL */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-xs rounded-3xl bg-slate-950 border border-purple-500/40 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase text-purple-400 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" /> Cyber Calculator
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Calc Display */}
            <div className="h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-end px-4 font-mono text-2xl font-black text-cyan-300">
              {calcDisplay}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2">
              {[
                "C",
                "/",
                "*",
                "⌫",
                "7",
                "8",
                "9",
                "-",
                "4",
                "5",
                "6",
                "+",
                "1",
                "2",
                "3",
                "=",
                "0",
                ".",
              ].map((btn) => {
                const isOp = ["/", "*", "-", "+", "="].includes(btn);
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === "⌫") {
                        setCalcDisplay((p) => (p.length > 1 ? p.slice(0, -1) : "0"));
                      } else {
                        handleCalcPress(btn);
                      }
                    }}
                    className={cn(
                      "h-11 rounded-xl font-mono text-base font-bold transition-all",
                      isOp
                        ? "bg-purple-600 text-white hover:bg-purple-500"
                        : btn === "C"
                          ? "bg-red-950 text-red-300 hover:bg-red-900"
                          : "bg-slate-900 text-slate-200 hover:bg-slate-800",
                    )}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SIMULATED CAMERA VIEW VIEWFINDER */}
      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="max-w-sm rounded-3xl bg-slate-950 border border-rose-500/40 p-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase text-rose-400 flex items-center gap-1.5">
              <Camera className="h-4 w-4" /> 4D Cyber Camera HUD
            </DialogTitle>
          </DialogHeader>

          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-black border border-white/20 flex items-center justify-center">
            {/* Viewfinder overlay */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity",
                cameraFilter === "matrix" && "bg-emerald-950/30",
                cameraFilter === "thermal" &&
                  "bg-gradient-to-tr from-blue-950/40 via-red-950/40 to-yellow-950/40",
              )}
            />
            {cameraFlash && <div className="absolute inset-0 bg-white animate-fade-out" />}

            {/* Target Crosshair */}
            <div className="pointer-events-none relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/80">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="absolute -top-4 font-mono text-[9px] text-cyan-400">
                FOCUS 108MP
              </span>
            </div>

            {/* Filter Toggle */}
            <div className="absolute top-2 left-2 flex gap-1">
              {(["neon", "matrix", "thermal"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCameraFilter(f)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    cameraFilter === f
                      ? "bg-rose-500 text-white"
                      : "bg-slate-900/80 text-slate-400",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={() => {
                soundFX.playKillStrike();
                setCameraFlash(true);
                setTimeout(() => setCameraFlash(false), 300);
                toast.success("📸 Cyber Snapshot Captured to Gallery!");
              }}
              className="absolute bottom-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_0_20px_#fff] active:scale-90 transition-transform"
            >
              <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-rose-500" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SIMULATED CLOCK & STOPWATCH */}
      <Dialog open={clockOpen} onOpenChange={setClockOpen}>
        <DialogContent className="max-w-xs rounded-3xl bg-slate-950 border border-cyan-500/40 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase text-cyan-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> World Clock & Stopwatch
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
              <p className="text-xs font-bold text-slate-400">New Delhi / Mumbai (IST)</p>
              <p className="font-mono text-4xl font-black text-cyan-300 mt-1">{currentTime}</p>
            </div>

            {/* Stopwatch */}
            <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
              <p className="text-xs font-bold text-slate-400">Tactical Stopwatch</p>
              <p className="font-mono text-3xl font-black text-amber-300 mt-1">
                {Math.floor(stopwatchSeconds / 60)}:{String(stopwatchSeconds % 60).padStart(2, "0")}
              </p>

              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setStopwatchActive((a) => !a)}
                  className="rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-black text-slate-950"
                >
                  {stopwatchActive ? "Pause" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStopwatchActive(false);
                    setStopwatchSeconds(0);
                  }}
                  className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
