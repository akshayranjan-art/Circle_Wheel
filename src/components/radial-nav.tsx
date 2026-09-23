import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { 
  Plus, Rotate3d, Dices, MessageSquare, Compass, Gamepad2, Coins, 
  ShieldAlert, Sparkles, MessageCircle, Tv, Radio, Wallet, Share2, 
  Flame, UserCheck, Zap, HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrbit } from "@/components/orbit-provider";
import { toast } from "sonner";

// Database representing 40 custom applications and prize systems mapped across 3 dynamic layers
const QUANTUM_40_APPS = [
  // Layer 1: Core Navigation & Interface Controls (8 Items)
  { id: "core_360", label: "360° Cam View", to: "/ludo", icon: Rotate3d, layer: 0, color: "text-cyan-400" },
  { id: "core_boost", label: "4-10 Dice Booster", to: "/ludo", icon: Dices, layer: 0, color: "text-amber-400" },
  { id: "core_chat", label: "Voice Changer Chat", to: "/messages", icon: MessageSquare, layer: 0, color: "text-emerald-400" },
  { id: "core_orbit", label: "Orbit Controller", to: "/settings", icon: Compass, layer: 0, color: "text-purple-400" },
  { id: "core_wallet", label: "Prize Wallet", to: "/diamonds", icon: Wallet, layer: 0, color: "text-yellow-400" },
  { id: "core_bounty", label: "Bounty Board", to: "/ludo", icon: Flame, layer: 0, color: "text-red-400" },
  { id: "core_skins", label: "Gotti Skins Shop", to: "/settings", icon: Sparkles, layer: 0, color: "text-pink-400" },
  { id: "core_help", label: "Arena Guide", to: "/", icon: HelpCircle, layer: 0, color: "text-blue-400" },

  // Layer 2: Entertainment, Media & Social Utilities (16 Items)
  { id: "soc_music", label: "Spotify Player", to: "/explore", icon: Zap, layer: 1, color: "text-green-400" },
  { id: "soc_yt", label: "YouTube Arena", to: "/explore", icon: Tv, layer: 1, color: "text-red-500" },
  { id: "soc_dc", label: "Discord Server", to: "/messages", icon: MessageCircle, layer: 1, color: "text-indigo-400" },
  { id: "soc_stream", label: "Live Broadcast", to: "/explore", icon: Radio, layer: 1, color: "text-orange-400" },
  { id: "soc_share", label: "Share Lobby", to: "/", icon: Share2, layer: 1, color: "text-teal-400" },
  { id: "soc_clan", label: "Ludo Clan Hub", to: "/create", icon: UserCheck, layer: 1, color: "text-purple-300" },
  { id: "soc_games", label: "Mini Games Arcade", to: "/explore", icon: Gamepad2, layer: 1, color: "text-pink-500" },
  { id: "soc_alerts", label: "Match Feeds", to: "/messages", icon: ShieldAlert, layer: 1, color: "text-rose-400" },
  { id: "soc_m2", label: "Sound Effects Pro", to: "/explore", icon: Zap, layer: 1, color: "text-green-300" },
  { id: "soc_yt2", label: "Twitch Streaming", to: "/explore", icon: Tv, layer: 1, color: "text-rose-500" },
  { id: "soc_dc2", label: "WhatsApp Connect", to: "/messages", icon: MessageCircle, layer: 1, color: "text-emerald-500" },
  { id: "soc_stream2", label: "Ludo Radio station", to: "/explore", icon: Radio, layer: 1, color: "text-yellow-500" },
  { id: "soc_share2", label: "Quick Room Invite", to: "/", icon: Share2, layer: 1, color: "text-cyan-500" },
  { id: "soc_clan2", label: "Guild War Battles", to: "/create", icon: UserCheck, layer: 1, color: "text-indigo-300" },
  { id: "soc_games2", label: "Retro Games Hub", to: "/explore", icon: Gamepad2, layer: 1, color: "text-amber-500" },
  { id: "soc_alerts2", label: "Security Console", to: "/messages", icon: ShieldAlert, layer: 1, color: "text-red-500" },

  // Layer 3: Premium Perks, Stores & Prize Engines (16 Items)
  { id: "prz_gold", label: "Mega Jackpot Wheel", to: "/gifts", icon: Coins, layer: 2, color: "text-amber-400" },
  { id: "prz_diamond", label: "Diamond Vault Shop", to: "/diamonds", icon: Coins, layer: 2, color: "text-cyan-300" },
  { id: "prz_claim", label: "Daily Surprise Box", to: "/gifts", icon: Sparkles, layer: 2, color: "text-amber-500" },
  { id: "prz_wheel", label: "Kismat Fate Wheel", to: "/ludo", icon: Compass, layer: 2, color: "text-fuchsia-400" },
  { id: "prz_token", label: "Legendary Skins", to: "/settings", icon: Flame, layer: 2, color: "text-red-500" },
  { id: "prz_g2", label: "Hourly Multipiler", to: "/gifts", icon: Coins, layer: 2, color: "text-yellow-300" },
  { id: "prz_d2", label: "Elite Chest Drops", to: "/diamonds", icon: Coins, layer: 2, color: "text-blue-300" },
  { id: "prz_c2", label: "Scratch Gold Cards", to: "/gifts", icon: Sparkles, layer: 2, color: "text-orange-500" },
  { id: "prz_w2", label: "Spin Win Vault", to: "/ludo", icon: Compass, layer: 2, color: "text-purple-500" },
  { id: "prz_t2", label: "Blast Kill Animations", to: "/settings", icon: Flame, layer: 2, color: "text-rose-500" },
  { id: "prz_b1", label: "Bounty Booster Pack", to: "/ludo", icon: Flame, layer: 2, color: "text-orange-600" },
  { id: "prz_b2", label: "Rank Progression", to: "/diamonds", icon: Sparkles, layer: 2, color: "text-yellow-400" },
  { id: "prz_b3", label: "Weekly Mega Raffle", to: "/gifts", icon: Coins, layer: 2, color: "text-cyan-400" },
  { id: "prz_b4", label: "Tournament Tickets", to: "/explore", icon: Gamepad2, layer: 2, color: "text-indigo-500" },
  { id: "prz_b5", label: "Secret Mystery Code", to: "/messages", icon: ShieldAlert, layer: 2, color: "text-red-400" },
  { id: "prz_b6", label: "VIP Club Pass", to: "/settings", icon: UserCheck, layer: 2, color: "text-amber-300" }
];
export function RadialNav() {
  const { config } = useOrbit();
  const [open, setOpen] = useState(false);
  
  // Interactive continuous radial navigation wheel scroll tracking
  const [scrollAngleOffset, setScrollAngleOffset] = useState(0);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Controls the rotation shifts of complex multi-ring modules via interface buttons
  const spinWheel = (direction: "left" | "right") => {
    setScrollAngleOffset(prev => direction === "left" ? prev - 22.5 : prev + 22.5);
    toast.info("⚙️ 360° Quantum Ring Interface Shifted", { duration: 800 });
  };

  // Node position calculation layout distributed symmetrically across 3 geometric rings
  const calculateNodePosition = (index: number, layer: number) => {
    let itemsInRing = layer === 0 ? 8 : 16;
    let ringOffsetIndex = layer === 0 ? index : index - (layer === 1 ? 8 : 24);
    
    // Distribute full circular mapping calculations
    const baseAngle = (ringOffsetIndex * 360) / itemsInRing;
    // Layer 0 is stabilized, outer custom rings receive kinetic scroll rotation values
    const dynamicAngle = layer === 0 ? baseAngle : baseAngle + scrollAngleOffset;
    const rad = (dynamicAngle * Math.PI) / 180;
    
    // Radial boundary multipliers
    const baseRadius = config.radius;
    let computedRadius = baseRadius;
    if (layer === 1) computedRadius = baseRadius + 75;  // Middle Ring
    if (layer === 2) computedRadius = baseRadius + 145; // Outer Premium Ring
    
    return {
      x: Math.cos(rad) * computedRadius,
      y: Math.sin(rad) * computedRadius,
    };
  };

  const speed = Math.max(0.4, config.speed);
  const coreNodeSize = 44;

  return (
    <>
      {/* Immersive Glassmorphism Background Dimming Shield */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <nav
        aria-label="Quantum Radial Menu Navigation"
        className="fixed bottom-12 left-1/2 z-50 -translate-x-1/2"
      >
        {/* Layer 1 Ring Interface Guide Line */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 rounded-full border border-cyan-500/30 transition-all duration-700 pointer-events-none",
            open ? "opacity-70 scale-100" : "opacity-0 scale-50",
            config.spin && open && "animate-spin-slow"
          )}
          style={{
            width: config.radius * 2,
            height: config.radius * 2,
            transform: "translate(-50%, -50%)",
            borderStyle: "dashed"
          }}
        />

        {/* Layer 2 Ring Interface Guide Line */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 rounded-full border border-purple-500/20 transition-all duration-700 pointer-events-none",
            open ? "opacity-60 scale-100" : "opacity-0 scale-50"
          )}
          style={{
            width: (config.radius + 75) * 2,
            height: (config.radius + 75) * 2,
            transform: `translate(-50%, -50%) rotate(${scrollAngleOffset}deg)`,
            borderStyle: "dashed",
            transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
          }}
        />

        {/* Layer 3 Ring Interface Guide Line */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 rounded-full border border-amber-500/10 transition-all duration-700 pointer-events-none",
            open ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )}
          style={{
            width: (config.radius + 145) * 2,
            height: (config.radius + 145) * 2,
            transform: `translate(-50%, -50%) rotate(${-scrollAngleOffset}deg)`,
            borderStyle: "solid",
            transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
          }}
        />

        {/* 40 Apps Node Generators Mapping Loop */}
        {QUANTUM_40_APPS.map((item, index) => {
          const { x, y } = calculateNodePosition(index, item.layer);
          const isActive = pathname === item.to;
          const staggerDelay = open ? (index * 20) / speed : ((40 - index) * 10) / speed;

          return (
            <Link
              key={item.id}
              to={item.to}
              aria-label={item.label}
              onClick={() => {
                if (item.id.startsWith("prz_")) {
                  toast.success(`🎁 Premium Vault Bonus Action: ${item.label} Activated!`);
                }
                setOpen(false);
              }}
              className={cn(
                "group absolute left-1/2 top-1/2 flex items-center justify-center rounded-full border bg-slate-900/95 text-white shadow-2xl transition-all duration-500",
                "hover:scale-125 border-slate-800 hover:bg-slate-950",
                item.layer === 0 && "hover:border-cyan-400 shadow-cyan-950/40",
                item.layer === 1 && "hover:border-purple-400 shadow-purple-950/40",
                item.layer === 2 && "hover:border-amber-400 shadow-amber-950/40 ring-1 ring-amber-500/10",
                isActive && "border-primary bg-primary text-slate-950 font-black shadow-md scale-105"
              )}
              style={{
                width: coreNodeSize - (item.layer * 4), // Gradually steps sizes smaller for exterior layers
                height: coreNodeSize - (item.layer * 4),
                transform: open
                  ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                  : "translate(-50%, -50%) scale(0.1)",
                opacity: open ? 1 : 0,
                transitionDelay: `${staggerDelay}ms`,
                transitionTimingFunction: open ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease-in",
                pointerEvents: open ? "auto" : "none",
              }}
            >
              <item.icon
                className={cn("w-4 h-4 transition-transform duration-300 group-hover:rotate-12", item.color)}
              />
              
              {/* Floating Dynamic Title Tooltip Labels */}
              <span className="pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md border border-slate-800 bg-slate-950/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-200 opacity-0 shadow-2xl backdrop-blur transition-all duration-150 group-hover:translate-y-0.5 group-hover:opacity-100 z-50">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Central Glowing Primary Activation Knob */}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white transition-transform duration-500 hover:scale-110 active:scale-90 shadow-[0_0_25px_rgba(147,51,234,0.6)] border-2 border-white/10 z-50"
        >
          <span className={cn("absolute inset-0 rounded-full bg-cyan-400/20 animate-ping", open && "hidden")} />
          <Plus
            className={cn(
              "relative h-7 w-7 transition-transform duration-500 ease-[cubic-bezier(0.34, 1.56, 0.64, 1)]",
              open && "rotate-[135deg]"
            )}
          />
        </button>

        {/* 360° Scrolling Controller Controls UI (Claws visible upon expand) */}
        {open && (
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
            <button 
              type="button"
              onClick={() => spinWheel("left")}
              className="text-[10px] font-black text-cyan-400 hover:text-white transition-colors"
            >
              ◀ ROTATE HUB
            </button>
            <span className="h-3 w-px bg-slate-800"/>
            <button 
              type="button"
              onClick={() => spinWheel("right")}
              className="text-[10px] font-black text-cyan-400 hover:text-white transition-colors"
            >
              ROTATE HUB ▶
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
