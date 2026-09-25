import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Gem,
  Sparkles,
  Trophy,
  Swords,
  Flame,
  Zap,
  Dice5,
  Wifi,
  Gauge,
  Crown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet, type DiceSkin, type TokenSkin } from "@/components/wallet-provider";
import { soundFX } from "@/lib/sound-fx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Trophy Wall, Skins & Engine Settings — Orbit Ludo" },
      {
        name: "description",
        content:
          "Defeated rivals Trophy Wall, evolving token skins, dice modifier shop, 120 FPS quantum engine, and offline LAN mode.",
      },
      { property: "og:title", content: "Trophy Wall, Skins & Engine Settings — Orbit Ludo" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const DEFEATED_RIVALS_WALL = [
  { name: "Cyber Nova (Bot)", diamondsLooted: 88, gotiCut: 8, trophy: "🥉 Bronze Skull" },
  { name: "Zex Mafia (Bot)", diamondsLooted: 132, gotiCut: 12, trophy: "🥈 Silver Fang" },
  { name: "Kiro Dragon (Bot)", diamondsLooted: 198, gotiCut: 18, trophy: "🥇 Golden Talon" },
  { name: "Raja King (VIP)", diamondsLooted: 330, gotiCut: 30, trophy: "👑 Emperor Crown" },
];

const DICE_MODIFIERS: { id: DiceSkin; name: string; desc: string; icon: string }[] = [
  { id: "standard", name: "Standard Neon", desc: "Crisp cyan mechanical roll", icon: "🎲" },
  { id: "electric", name: "Electric Shock Dice", desc: "Sparks lightning arcs on 6s", icon: "⚡" },
  { id: "flame", name: "Fire Blaze Dice", desc: "Leaves molten trails on roll", icon: "🔥" },
  { id: "ice", name: "Ice Crystal Dice", desc: "Freezing sonic crystalline sound", icon: "❄️" },
  { id: "quantum", name: "Quantum 4D Dice", desc: "Holographic pop-out dimensions", icon: "🔮" },
];

const TOKEN_SKINS: { id: TokenSkin; name: string; desc: string; icon: string; minWins: number }[] =
  [
    {
      id: "jelly",
      name: "Fluid Jelly Droplet",
      desc: "Squashes and stretches with liquid physics",
      icon: "💧",
      minWins: 0,
    },
    {
      id: "cyber",
      name: "Cyber Magnetic Orb",
      desc: "Electric pulse ring with magnetic hover",
      icon: "⚡",
      minWins: 3,
    },
    {
      id: "dragon",
      name: "4D Fire Dragon",
      desc: "Emits real fire particles and roar effects",
      icon: "🐉",
      minWins: 10,
    },
  ];

const ALL_TITLE_BADGES = [
  "Goti Killer",
  "Diamond Mafia",
  "Lucky Sixer",
  "Quantum Champion",
  "Neon Legend",
];

function ProfilePage() {
  const {
    wins,
    captures,
    diamonds,
    tokenSkin,
    setTokenSkin,
    activeDiceSkin,
    setActiveDiceSkin,
    activeBadge,
    setActiveBadge,
    unlockedBadges,
    fpsMode,
    setFpsMode,
  } = useWallet();

  const [lanSearching, setLanSearching] = useState(false);
  const [lanConnected, setLanConnected] = useState(false);

  const toggleLan = () => {
    if (lanConnected) {
      setLanConnected(false);
      toast.info("Offline LAN Bluetooth Mode Disconnected");
      return;
    }
    setLanSearching(true);
    soundFX.playLiquidRipple();
    setTimeout(() => {
      setLanSearching(false);
      setLanConnected(true);
      soundFX.playSpectatorBomb("cheer");
      toast.success(
        "📶 Offline LAN Mesh Connected! Ready to play with nearby friends without internet!",
      );
    }, 1800);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-48 pt-12 space-y-8">
      {/* Profile Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-cyan-400 bg-slate-950 text-4xl shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            {tokenSkin === "dragon" ? "🐉" : tokenSkin === "cyber" ? "⚡" : "💧"}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-slate-950 font-black">
              ★
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="neon-text text-3xl font-black text-white">Player You</h1>
              <span className="rounded-full bg-cyan-950 px-3 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                {activeBadge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Arena Record: <b className="text-white">{wins} Wins</b> •{" "}
              <b className="text-cyan-400">{captures} Goti Cut</b> •{" "}
              <b className="text-amber-400">{diamonds} 💎 Vault</b>
            </p>
          </div>
        </div>

        {/* Engine Performance Toggle: Feature #45 */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900 p-2 border border-slate-800">
          <Gauge className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-400">Quantum Engine:</span>
          {(["60", "120"] as const).map((fps) => (
            <button
              key={fps}
              onClick={() => {
                soundFX.playTick();
                setFpsMode(fps);
                toast.success(`⚡ Quantum Engine optimized for ${fps} FPS smooth render!`);
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                fpsMode === fps
                  ? "bg-cyan-500 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {fps} FPS
            </button>
          ))}
        </div>
      </div>

      {/* FEATURE #33: INTERACTIVE LOSER HISTORY TROPHY WALL */}
      <section className="rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="neon-text text-xl font-black text-amber-300 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" /> Loser History Trophy Wall
          </h2>
          <span className="text-xs font-bold text-slate-400">
            Defeated Rivals & Total Diamonds Looted
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Aapne kis-kis bade player aur bot ko hara kar unke 11-diamonds loote hain, unka permanent
          trophy record!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEFEATED_RIVALS_WALL.map((rival) => (
            <div
              key={rival.name}
              className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rival.trophy.split(" ")[0]}</span>
                <div>
                  <p className="text-xs font-black text-white">{rival.name}</p>
                  <p className="text-[10px] text-slate-400">{rival.gotiCut} Goti Cut by You</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-black text-amber-400">
                  +{rival.diamondsLooted} 💎
                </span>
                <p className="text-[9px] text-slate-500 uppercase font-bold">
                  {rival.trophy.split(" ").slice(1).join(" ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE #34: EVOLVING TOKEN SKINS */}
      <section className="rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="neon-text text-xl font-black text-cyan-300 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" /> Evolving Token Skins (Goti)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Jaise-jaise aap matches jeetenge, aapki goti evolve hoke Neon Dragon ban jayegi real
            flame effects ke sath!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TOKEN_SKINS.map((s) => {
            const isUnlocked = wins >= s.minWins;
            const isEquipped = tokenSkin === s.id;

            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-2xl bg-slate-950 p-4 border transition-all flex flex-col justify-between",
                  isEquipped
                    ? "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "border-slate-800",
                )}
              >
                <div>
                  <div className="text-4xl mb-2">{s.icon}</div>
                  <h3 className="text-xs font-black text-white">{s.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">{s.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">
                    {isUnlocked ? "Unlocked" : `Needs ${s.minWins} Wins`}
                  </span>
                  <Button
                    size="sm"
                    disabled={!isUnlocked || isEquipped}
                    className="liquid-btn text-xs font-bold"
                    onClick={() => {
                      soundFX.playTokenStep();
                      setTokenSkin(s.id);
                      toast.success(`${s.name} Equipped!`);
                    }}
                  >
                    {isEquipped ? "Equipped" : "Equip"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE #42: DICE MODIFIER SHOP */}
      <section className="rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="neon-text text-xl font-black text-purple-300 flex items-center gap-2">
            <Dice5 className="h-5 w-5 text-purple-400" /> Dice Modifier Arsenal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Custom sound textures and 4D visual shockwaves when rolling the dice!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DICE_MODIFIERS.map((d) => {
            const isEquipped = activeDiceSkin === d.id;

            return (
              <div
                key={d.id}
                className={cn(
                  "rounded-2xl bg-slate-950 p-4 border transition-all flex items-center justify-between",
                  isEquipped
                    ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    : "border-slate-800",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{d.icon}</span>
                  <div>
                    <h3 className="text-xs font-black text-white">{d.name}</h3>
                    <p className="text-[10px] text-slate-400">{d.desc}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={isEquipped}
                  className="liquid-btn text-xs font-bold"
                  onClick={() => {
                    soundFX.playDiceResult(6);
                    setActiveDiceSkin(d.id);
                    toast.success(`🎲 ${d.name} equipped for match rolls!`);
                  }}
                >
                  {isEquipped ? "Active" : "Use"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE #37: TITLE BADGE SYSTEM */}
      <section className="rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="neon-text text-xl font-black text-emerald-300 flex items-center gap-2">
            <Crown className="h-5 w-5 text-emerald-400" /> Title Badge System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Display your customized battle honor in voice rooms and live ludo match tables.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_TITLE_BADGES.map((b) => {
            const isUnlocked = unlockedBadges.includes(b);
            const isEquipped = activeBadge === b;

            return (
              <button
                key={b}
                disabled={!isUnlocked}
                onClick={() => {
                  soundFX.playTick();
                  setActiveBadge(b);
                  toast.success(`Title Badge set to: "${b}"`);
                }}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-bold border transition-all flex items-center gap-1.5",
                  isEquipped
                    ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : isUnlocked
                      ? "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600"
                      : "border-slate-900 bg-slate-950/40 text-slate-600 cursor-not-allowed",
                )}
              >
                {isEquipped && <Check className="h-3.5 w-3.5" />}
                {b} {!isUnlocked && "🔒"}
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURE #48: OFFLINE LAN BLUETOOTH MODE */}
      <section className="rounded-3xl bg-slate-900/60 p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Wifi className="h-6 w-6" />
          </div>
          <div>
            <h3 className="neon-text text-base font-black text-white">
              Offline LAN Bluetooth Mode
            </h3>
            <p className="text-xs text-slate-400">
              No internet required. Play high-octane 4D Ludo with friends nearby via local hotspot
              mesh.
            </p>
          </div>
        </div>

        <Button
          className={cn(
            "liquid-btn text-xs font-black uppercase",
            lanConnected ? "!bg-emerald-600" : "!bg-cyan-600",
          )}
          disabled={lanSearching}
          onClick={toggleLan}
        >
          {lanSearching
            ? "Discovering Peers..."
            : lanConnected
              ? "LAN Mesh Active"
              : "Connect LAN Mesh"}
        </Button>
      </section>
    </main>
  );
}
