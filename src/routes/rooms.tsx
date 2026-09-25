import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Lock,
  Mic,
  MicOff,
  Send,
  UserPlus,
  Unlock,
  Volume2,
  Sparkles,
  Gift,
  Flame,
  Fingerprint,
  Heart,
  X,
  Users,
  Radio,
  Clock,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { useLanguage } from "@/lib/language-context";
import { soundFX } from "@/lib/sound-fx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameRulesDialog } from "@/components/game-rules-dialog";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "8-Seat Cyber Lounge & Social — Orbit Ludo" },
      {
        name: "description",
        content:
          "8-seat bio-locked voice rooms, spectator betting, 3D spatial audio, AI voice modulators, Tinder matchmaking, and clan lounge.",
      },
      { property: "og:title", content: "8-Seat Cyber Lounge & Social — Orbit Ludo" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rooms,
});

const VEHICLES = [
  { id: "bike", name: "Superbike", emoji: "🏍️", price: 0 },
  { id: "car", name: "Sports Car", emoji: "🏎️", price: 300 },
  { id: "lion", name: "Royal Lion", emoji: "🦁", price: 800 },
  { id: "jet", name: "Fighter Jet", emoji: "✈️", price: 1500 },
  { id: "ufo", name: "Neon UFO", emoji: "🛸", price: 3000 },
  { id: "dragon", name: "Fire Dragon", emoji: "🐉", price: 6000 },
];

const GIFTS = [
  { id: "tulip", name: "Neon Tulip", emoji: "🌷", price: 20, theme: "cyan" },
  { id: "car", name: "Hypercar", emoji: "🏎️", price: 250, theme: "purple" },
  { id: "castle", name: "Neon Castle", emoji: "🏰", price: 600, theme: "amber" },
  { id: "dragon", name: "Cyber Dragon", emoji: "🐉", price: 1200, theme: "red" },
];

const MATCHMAKING_PROFILES = [
  {
    id: "p1",
    name: "Aarav 'GotiKiller' ⚡",
    gender: "male" as const,
    age: "Level 42",
    style: "Aggressive Bounty Hunter",
    bio: "Main goti kaatne me vishwas rakhta hoon, win me nahi. 11-Diamond loot king! 👑",
    avatar: "🥷",
    winRate: "78%",
  },
  {
    id: "p2",
    name: "Simran 'LuckyQueen' ✨",
    gender: "female" as const,
    age: "Level 38",
    style: "Strategic Home Runner",
    bio: "Dice par hamesha 6 aate hain! Daily spin jackpot winner. Looking for voice chat duo 🎙️",
    avatar: "👸",
    winRate: "82%",
  },
  {
    id: "p3",
    name: "Kabir 'QuantumBoss' 🏎️",
    gender: "male" as const,
    age: "Level 50",
    style: "High Roller Bettor",
    bio: "500 diamond pool only. Clan leader of Neon Vikings. Grand entries with Cyber Dragon!",
    avatar: "🦁",
    winRate: "89%",
  },
  {
    id: "p4",
    name: "Ananya 'NeonAngel' 💖",
    gender: "female" as const,
    age: "Level 35",
    style: "Love Birds Romantic Pro",
    bio: "50 Love Birds milestone daily! Claiming 50 💎 bonus with 10m live routine. Need Male ♂ partner!",
    avatar: "💃",
    winRate: "85%",
  },
];

const PAST_MATCH_RIVALS = [
  { id: "pm1", name: "Raja King (Defeated -33 💎)", when: "12m ago", won: true },
  { id: "pm2", name: "Neon Queen (Victory +111 💎)", when: "1h ago", won: true },
  { id: "pm3", name: "Dice Don (Revenge Needed)", when: "Yesterday", won: false },
];

const BOTS: string[] = ["Priya ✨", "Raja King", "Neon Queen", "Dice Don", "Rani 💖"];
const REPLIES = [
  "Haha 😂",
  "Chalo ek 500 diamond match ho jaye! 🎲",
  "Gift bhejo na 🎁",
  "Meri goti kaat ke dikhao 😎",
  "Welcome bhai 🔥 Swagat hai room me!",
  "Voice modulator on hai mera!",
];

type Msg = { from: string; text: string; whisper?: boolean };

function Rooms() {
  const {
    diamonds,
    spend,
    earn,
    addGift,
    userGender,
    setUserGender,
    activeChatFrame,
    pairLoveBirds,
    loveBirdsPartner,
    loveBirdsCount,
    dailyLiveSeconds,
    claimLoveDividend,
  } = useWallet();
  const { t } = useLanguage();

  // 8-Seat Cyber Lounge: 0-3 = Players, 4-7 = VIP Spectators
  const [seats, setSeats] = useState<(string | null)[]>([
    "Raja King",
    null,
    "Priya ✨",
    null,
    "VIP Spectator 1",
    "Dice Don",
    null,
    null,
  ]);
  const [locked, setLocked] = useState<boolean[]>(Array(8).fill(false));
  const [roomLocked, setRoomLocked] = useState(false);
  const [biometricModal, setBiometricModal] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [muted, setMuted] = useState(true);

  // Modulator & Spatial Audio
  const [voicePreset, setVoicePreset] = useState<
    "Robot" | "Anime" | "Monster" | "Mafia" | "Standard"
  >("Standard");
  const [spatialAudio, setSpatialAudio] = useState(true);

  // Entry vehicles & Gift Themes
  const [owned, setOwned] = useState<string[]>(["bike"]);
  const [ride, setRide] = useState("bike");
  const [entry, setEntry] = useState<string | null>(null);
  const [activeGiftExplosion, setActiveGiftExplosion] = useState<string | null>(null);
  const [roomThemeOverride, setRoomThemeOverride] = useState<string | null>(null);

  // Chat & Whisper
  const [tab, setTab] = useState<"room" | "whisper" | "matchmaking" | "clan">("room");
  const [whisperTarget, setWhisperTarget] = useState<string>("Priya ✨");
  const [friends, setFriends] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({
    room: [
      {
        from: "Raja King",
        text: "Welcome to 8-Seat Cyber Lounge! 4 Players + 4 VIP Spectators 🔥",
      },
    ],
  });
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Matchmaking Profile Index
  const [matchCardIdx, setMatchCardIdx] = useState(0);

  const mySeat = seats.indexOf("You");
  const [betStake, setBetStake] = useState<number>(50);

  const reenterRoom = () => {
    if (spend(5, "Room Re-entry Fee")) {
      soundFX.playUnlock();
      soundFX.playLiquidRipple();
      const openSeat = seats.findIndex((s, idx) => s === null && !locked[idx]);
      if (openSeat !== -1 && mySeat === -1) {
        setSeats((s) => s.map((v, j) => (j === openSeat ? "You" : v)));
      }
      toast.success("🚪 Re-entered 8-Seat Cyber Lounge! (5 💎 paid)");
    } else {
      toast.error("Diamonds kam hain! Re-entry ke liye 5 💎 chahiye.");
    }
  };

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, tab]);

  const push = (k: string, m: Msg) => setMsgs((s) => ({ ...s, [k]: [...(s[k] ?? []), m] }));

  const send = () => {
    if (!text.trim()) return;
    const isWhisper = tab === "whisper";
    const dest = isWhisper ? whisperTarget : "room";

    push(dest, { from: "You", text, whisper: isWhisper });
    setText("");

    // AI voice modulation speech playback
    soundFX.speakWithModulator(text, voicePreset);

    // Simulated reply
    const who = isWhisper
      ? whisperTarget
      : (BOTS[Math.floor(Math.random() * BOTS.length)] ?? "Bot");
    setTimeout(() => {
      push(dest, {
        from: who,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)] ?? "🔥",
        whisper: isWhisper,
      });
      // Spatial Audio panning simulation based on seat position
      const seatIdx = seats.indexOf(who);
      const pan = seatIdx !== -1 ? (seatIdx / 7) * 2 - 1 : 0;
      if (spatialAudio) {
        soundFX.playSpatialAudio(pan, 500);
      }
    }, 1100);
  };

  const sit = (i: number) => {
    soundFX.playWheelNode(i);
    if (seats[i] && seats[i] !== "You") {
      toast("Seat bhari hui hai");
      return;
    }
    if (locked[i] && seats[i] !== "You") {
      toast.error("Seat locked 🔒 (Biometric auth required)");
      return;
    }
    if (seats[i] === "You") {
      setSeats((s) => s.map((v) => (v === "You" ? null : v)));
      return;
    }
    setSeats((s) => s.map((v, j) => (j === i ? "You" : v === "You" ? null : v)));
    if (mySeat === -1) {
      setEntry(ride);
      soundFX.playHypercarEngine();
      setTimeout(() => setEntry(null), 2800);
    }
  };

  const unlockWithBiometrics = () => {
    setBiometricScanning(true);
    soundFX.playLiquidRipple();
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricModal(false);
      setRoomLocked(false);
      soundFX.playSpectatorBomb("cheer");
      toast.success("🔓 Biometric Scan Verified: Fingerprint Matched! Room Unlocked!");
    }, 1400);
  };

  const sendVirtualGift = (g: (typeof GIFTS)[number]) => {
    if (!spend(g.price, `Sent gift: ${g.name}`)) {
      toast.error("Diamonds kam hain");
      return;
    }
    addGift(g.id);
    setActiveGiftExplosion(g.name);
    setRoomThemeOverride(g.theme);
    soundFX.playKillStrike();
    toast.success(`🎁 4D VIRTUAL GIFT EXPLOSION! ${g.emoji} ${g.name} sent! Room Theme Changed!`);

    setTimeout(() => {
      setActiveGiftExplosion(null);
      setRoomThemeOverride(null);
    }, 5000);
  };

  const triggerSpectatorCheer = (type: "laugh" | "cry" | "cheer" | "horn", emoji: string) => {
    soundFX.playSpectatorBomb(type);
    toast(`📣 Spectator Sound Bomb Drop: ${emoji}`, { duration: 1500 });
  };

  const buyRide = (v: (typeof VEHICLES)[number]) => {
    if (owned.includes(v.id)) {
      setRide(v.id);
      return;
    }
    if (!spend(v.price, `Entry vehicle: ${v.name}`)) {
      toast.error("Diamonds kam hain");
      return;
    }
    setOwned((o) => [...o, v.id]);
    setRide(v.id);
    toast.success(`${v.emoji} ${v.name} unlocked!`);
  };

  const currentMatchCard = MATCHMAKING_PROFILES[matchCardIdx % MATCHMAKING_PROFILES.length];
  const vehicle = VEHICLES.find((v) => v.id === entry);

  return (
    <main
      className={cn(
        "mx-auto max-w-4xl px-4 pb-48 pt-10 transition-colors duration-700",
        roomThemeOverride === "cyan" && "bg-cyan-950/30",
        roomThemeOverride === "purple" && "bg-purple-950/30",
        roomThemeOverride === "amber" && "bg-amber-950/30",
        roomThemeOverride === "red" && "bg-red-950/30",
      )}
    >
      {/* 4D Vehicle Grand Entry */}
      {vehicle && (
        <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center">
          <div className="entry-vehicle text-center">
            <div className="text-9xl drop-shadow-[0_0_40px_var(--neon-1)]">{vehicle.emoji}</div>
            <p className="neon-text mt-3 text-3xl font-black uppercase text-cyan-300">
              You entered with {vehicle.name}!
            </p>
          </div>
        </div>
      )}

      {/* Gift Explosion Screen Flash */}
      {activeGiftExplosion && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="text-8xl animate-bounce">🎁💥✨</div>
            <h2 className="neon-text mt-3 text-3xl font-black text-amber-300 uppercase">
              {activeGiftExplosion} EXPLOSION!
            </h2>
            <p className="text-sm font-bold text-slate-300">
              Room atmosphere upgraded for 5 seconds!
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> 8-Seat Bio-Locked Voice
            Lounge
          </p>
          <h1 className="neon-text mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Viking Cyber Adda 🔥
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Game Rules Dialog */}
          <GameRulesDialog />

          {/* Gender Profile Switcher */}
          <button
            type="button"
            onClick={() => {
              soundFX.playTick();
              const nextG = userGender === "female" ? "male" : "female";
              setUserGender(nextG);
              toast.info(
                `Profile gender switched to: ${nextG === "female" ? "Female ♀" : "Male ♂"}`,
              );
            }}
            className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black border border-slate-700 text-slate-300 hover:text-white"
          >
            You: {userGender === "female" ? "♀ Female" : "♂ Male"}
          </button>

          {/* Live Requirement Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-cyan-300 border border-slate-800">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>Live: {Math.floor(dailyLiveSeconds / 60)}m / 10m</span>
          </div>

          {/* Biometric Lock Button (Feature #22) */}
          <button
            className="liquid-btn !px-4 !py-2 text-xs font-black flex items-center gap-1.5"
            onClick={() => {
              if (roomLocked) {
                setBiometricModal(true);
              } else {
                setRoomLocked(true);
                toast("🔒 Room Bio-Locked! Fingerprint/Face ID required to enter!");
              }
            }}
          >
            {roomLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {roomLocked ? "Bio-Locked" : "Public"}
          </button>
        </div>
      </div>

      {/* 8-Seat Cyber Lounge Grid: 4 Players + 4 VIP Spectators (Feature #21) */}
      <div className="mt-6 rounded-3xl bg-slate-900/60 p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>🎮 4 Match Players (Seats 1-4)</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">👑 4 VIP Spectator Betting Seats (Seats 5-8)</span>
          </h2>
          <span className="text-[10px] text-cyan-400 font-bold">
            Spatial 3D Audio: {spatialAudio ? "Stereo Panning ON" : "OFF"}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {seats.map((s, i) => {
            const isSpectatorSeat = i >= 4;
            const isMe = s === "You";

            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => sit(i)}
                  className={cn(
                    "wheel-node relative grid h-16 w-16 place-items-center rounded-2xl text-base font-black transition-all",
                    isSpectatorSeat
                      ? "border-amber-500/40 bg-amber-950/20"
                      : "border-cyan-500/40 bg-slate-950",
                    isMe && !muted && "orbit-core-pulse ring-2 ring-cyan-400",
                    isMe && "ring-2 ring-primary",
                  )}
                >
                  {locked[i] && !s ? (
                    <Lock className="h-5 w-5 text-red-400" />
                  ) : s ? (
                    <span className="text-lg">{s[0]}</span>
                  ) : (
                    <span className="text-xs opacity-60">+{i + 1}</span>
                  )}
                  {isSpectatorSeat && (
                    <span className="absolute -top-1.5 -right-1 text-[10px]">👑</span>
                  )}
                </button>

                <span className="max-w-[70px] truncate text-[11px] font-bold text-slate-300">
                  {s ?? (locked[i] ? "Locked" : isSpectatorSeat ? "VIP Seat" : "Open")}
                </span>

                <button
                  className="text-[10px] text-slate-500 underline hover:text-cyan-400"
                  onClick={() => setLocked((l) => l.map((v, j) => (j === i ? !v : v)))}
                >
                  {locked[i] ? "unlock" : "lock"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Audio Controls: Mute, AI Voice Modulator, Spatial Audio */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2">
            <button
              className="liquid-btn !px-4 !py-2 text-xs font-black flex items-center gap-2"
              disabled={mySeat === -1}
              onClick={() => {
                soundFX.playLiquidRipple();
                setMuted((m) => !m);
              }}
            >
              {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {mySeat === -1 ? "Pehle Seat Lo" : muted ? "Unmute Mic" : "Muted"}
            </button>

            {/* AI Voice Modulator Selector (Feature #24) */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <span className="px-2 font-bold text-slate-400">Modulator:</span>
              {(["Standard", "Robot", "Anime", "Monster", "Mafia"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    soundFX.playTick();
                    setVoicePreset(p);
                    soundFX.speakWithModulator(`Modulator set to ${p}`, p);
                    toast.info(`AI Voice Modulator: ${p}`);
                  }}
                  className={cn(
                    "rounded-lg px-2 py-0.5 font-bold transition-all text-[11px]",
                    voicePreset === p
                      ? "bg-cyan-500 text-slate-950 font-black"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Spatial 3D Audio Toggle */}
          <button
            onClick={() => {
              setSpatialAudio((s) => !s);
              toast.info(
                spatialAudio
                  ? "Spatial 3D Audio Disabled"
                  : "🎧 Spatial 3D Audio Enabled: Stereo Panning active!",
              );
            }}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold border",
              spatialAudio
                ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                : "border-slate-800 text-slate-500",
            )}
          >
            Spatial 3D Sound
          </button>
        </div>
      </div>

      {/* LIVE ROOM CHAT & ENCRYPTED WHISPERS DIRECTLY AFTER 8 SEATS (User Request: lock room me 8 seat k baad hi chat box rahe) */}
      <div className="mt-5 rounded-3xl bg-slate-900/80 p-5 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        {/* Chat Header with Re-enter & Betting Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              8-Seat Lounge Chat & Encrypted Whispers
            </span>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800">
              {(msgs[tab === "whisper" ? whisperTarget : "room"] ?? []).length} msgs
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Re-enter Room for 5 Diamonds (User Request: 5 diamond me hi room repenter rahe) */}
            <button
              type="button"
              onClick={reenterRoom}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 px-3.5 py-1 text-xs font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 flex items-center gap-1.5 transition-all"
            >
              <span>🚪 Re-Enter Room (5 💎)</span>
            </button>

            {/* Whisper or Room chat toggle */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTab("room")}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-bold transition-all text-[11px]",
                  tab === "room" ? "bg-cyan-500 text-slate-950 font-black" : "text-slate-400",
                )}
              >
                Room Chat
              </button>
              <button
                type="button"
                onClick={() => setTab("whisper")}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-bold transition-all text-[11px]",
                  tab === "whisper" ? "bg-cyan-500 text-slate-950 font-black" : "text-slate-400",
                )}
              >
                Whisper 🔒
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Betting Stake Presets: 5, 10, 20, 50, 80, 100 (User Request: 510205080100 means baki change kar de) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-950/70 p-2.5 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <span className="text-amber-400 font-black">💎 Spectator Bet / Stake:</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {[5, 10, 20, 50, 80, 100].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  soundFX.playTick();
                  setBetStake(amt);
                  toast.success(`Room Bet / Stake set to ${amt} 💎!`);
                }}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all",
                  betStake === amt
                    ? "bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_#f59e0b]"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800",
                )}
              >
                {amt} 💎
              </button>
            ))}
          </div>
        </div>

        {/* Whisper Recipient Bar if in whisper mode */}
        {tab === "whisper" && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 shrink-0">Whisper To:</span>
            {BOTS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setWhisperTarget(b)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold border transition-all shrink-0",
                  whisperTarget === b
                    ? "border-cyan-400 bg-cyan-950 text-cyan-300"
                    : "border-slate-800 bg-slate-950 text-slate-400",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {/* Live Messages Stream with VIP Frames */}
        <div className="mt-3 h-52 overflow-y-auto rounded-2xl p-4 bg-slate-950/90 border border-slate-800">
          {(msgs[tab === "whisper" ? whisperTarget : "room"] ?? []).map((m, i) => {
            const frameClass =
              m.from === "You"
                ? activeChatFrame === "cyber"
                  ? "chat-frame-cyber"
                  : activeChatFrame === "dragon"
                    ? "chat-frame-dragon"
                    : activeChatFrame === "love"
                      ? "chat-frame-love"
                      : activeChatFrame === "royal"
                        ? "chat-frame-royal"
                        : activeChatFrame === "flame"
                          ? "chat-frame-flame"
                          : ""
                : "";

            return (
              <div key={i} className={cn("mb-2 flex", m.from === "You" && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-xs transition-all",
                    frameClass,
                    m.from === "You"
                      ? "bg-cyan-600 text-white font-medium"
                      : "bg-slate-800 text-slate-200",
                  )}
                >
                  {m.from !== "You" && (
                    <div className="text-[10px] font-black text-cyan-400 mb-0.5">{m.from}</div>
                  )}
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Chat Input & Send Form */}
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              tab === "whisper"
                ? `Encrypted whisper to ${whisperTarget}...`
                : "Type message in 8-seat room..."
            }
            className="bg-slate-950 border-slate-800 text-xs"
          />
          <button className="liquid-btn !px-4" aria-label="Send Message">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Spectator Sound-Bombs Grid (Feature #27) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-900/40 p-3 border border-slate-800">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> Spectator Sound Bombs:
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => triggerSpectatorCheer("laugh", "😂 Laugh Bomb")}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1 text-xs font-bold hover:border-emerald-500"
          >
            😂 Laugh
          </button>
          <button
            onClick={() => triggerSpectatorCheer("cheer", "👏 Applause Bomb")}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1 text-xs font-bold hover:border-emerald-500"
          >
            👏 Cheer
          </button>
          <button
            onClick={() => triggerSpectatorCheer("cry", "😭 Cry Bomb")}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1 text-xs font-bold hover:border-emerald-500"
          >
            😭 Cry
          </button>
          <button
            onClick={() => triggerSpectatorCheer("horn", "📣 Airhorn Bomb")}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1 text-xs font-bold hover:border-emerald-500"
          >
            📣 Airhorn
          </button>
        </div>
      </div>

      {/* 4D Virtual Gifting Bar (Feature #26) */}
      <div className="mt-4 rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-pink-400" /> Send 4D Virtual Gifts (Theme Takeover)
          </p>
          <span className="text-xs font-mono font-bold text-primary">{diamonds} 💎 Balance</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GIFTS.map((g) => (
            <button
              key={g.id}
              onClick={() => sendVirtualGift(g)}
              className="flex items-center gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800 hover:border-primary transition-all text-left"
            >
              <span className="text-3xl">{g.emoji}</span>
              <div>
                <p className="text-xs font-bold text-white">{g.name}</p>
                <p className="text-[10px] text-cyan-400 font-mono font-bold">{g.price} 💎</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Tab Social Sections: Matchmaking Friend Finder, Clan Lounge */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab("matchmaking")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            tab === "matchmaking"
              ? "bg-primary text-slate-950 font-black shadow"
              : "bg-slate-900 text-slate-400",
          )}
        >
          Ludo Match Finder 🔥
        </button>
        <button
          onClick={() => setTab("clan")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            tab === "clan"
              ? "bg-primary text-slate-950 font-black shadow"
              : "bg-slate-900 text-slate-400",
          )}
        >
          Tribal Clan Lounge (50-Seat) 🛡️
        </button>
      </div>

      {/* TAB 3: Tinder-Style Matchmaking Friend Finder (Feature #29) */}
      {tab === "matchmaking" && (
        <div className="mt-4 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-3xl border-2 border-primary bg-slate-950 p-6 text-center shadow-[0_0_35px_rgba(168,85,247,0.3)] animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-full bg-pink-950/80 px-2.5 py-0.5 text-[10px] font-black text-pink-400 border border-pink-500/30">
                {currentMatchCard?.gender === "female" ? "♀ Female Partner" : "♂ Male Partner"}
              </span>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                You are: {userGender === "female" ? "♀ Female" : "♂ Male"}
              </span>
            </div>

            <div className="text-7xl mb-3">{currentMatchCard?.avatar}</div>
            <h3 className="neon-text text-xl font-black text-white">{currentMatchCard?.name}</h3>
            <p className="text-xs font-bold text-cyan-400 mt-0.5">
              {currentMatchCard?.age} • Win Rate: {currentMatchCard?.winRate}
            </p>
            <span className="inline-block mt-2 rounded-full bg-purple-950/80 border border-purple-500/40 px-3 py-0.5 text-[11px] font-bold text-purple-300">
              Style: {currentMatchCard?.style}
            </span>
            <p className="mt-3 text-xs text-slate-300 italic leading-relaxed">
              "{currentMatchCard?.bio}"
            </p>

            <div className="mt-4 rounded-xl bg-pink-950/30 p-2.5 border border-pink-500/30 text-[11px] text-pink-200 text-left space-y-1">
              <p className="font-bold flex items-center gap-1 text-pink-300">
                <Heart className="h-3 w-3 fill-current text-pink-400" />
                Love Birds Rule: Male ♂ ✕ Female ♀ Only
              </p>
              <p className="text-[10px] text-slate-400">
                Matched female partner ko roz <b>50 💎 Daily Love Bonus</b> milta hai (Condition:
                Roz kam se kam 10 mins game me live rehna mandatory hai).
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                onClick={() => {
                  soundFX.playTick();
                  setMatchCardIdx((i) => i + 1);
                  toast("Pass! Next partner...");
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-red-400 hover:scale-110 transition-transform shadow-lg"
              >
                <X className="h-6 w-6" />
              </button>

              <button
                onClick={() => {
                  if (!currentMatchCard) return;
                  const res = pairLoveBirds(currentMatchCard.name, currentMatchCard.gender);
                  if (!res.ok) {
                    soundFX.playSpectatorBomb("horn");
                    toast.error(res.reason ?? "Cannot match same gender profile!");
                  } else {
                    soundFX.playSpectatorBomb("cheer");
                    setMatchCardIdx((i) => i + 1);
                    toast.success(
                      `🎉 IT'S A MATCH! You & ${currentMatchCard.name} are Love Birds! (${userGender === "female" ? "♀" : "♂"} ✕ ${currentMatchCard.gender === "female" ? "♀" : "♂"})!`,
                    );
                  }
                }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white hover:scale-110 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.6)]"
              >
                <Heart className="h-8 w-8 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Tribal Clan 50-Member Mega Lounge (Feature #30) */}
      {tab === "clan" && (
        <div className="mt-4 rounded-3xl bg-slate-900/60 p-6 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="neon-text text-xl font-black text-amber-400 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" /> Neon Vikings Clan Hub
              </h3>
              <p className="text-xs text-slate-400">50 Seats Mega Voice Arena • Clan War Rank #1</p>
            </div>
            <Button
              className="liquid-btn !px-4 text-xs font-black"
              onClick={() => {
                soundFX.playSpectatorBomb("cheer");
                toast.success("Joined 50-Seat Clan Voice Mega Stage!");
              }}
            >
              Join Clan Stage
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                  {i === 0 ? "👑" : `V${i + 1}`}
                </div>
                <span className="text-[9px] text-slate-500 mt-1">
                  {i === 0 ? "Leader" : `Member`}
                </span>
              </div>
            ))}
          </div>

          {/* Past Match Rivals Quick Re-Open (Feature #28) */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Match History Quick Voice Re-Open (1-Click)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PAST_MATCH_RIVALS.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{pm.name}</p>
                    <p className="text-[10px] text-slate-400">{pm.when}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] font-bold"
                    onClick={() => {
                      soundFX.playSpectatorBomb("cheer");
                      toast.success(`Voice room instantly generated with ${pm.name}!`);
                    }}
                  >
                    Re-Chat
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC SCANNER MODAL (Feature #22) */}
      {biometricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="mx-4 max-w-sm rounded-3xl border-2 border-cyan-400 bg-slate-950 p-8 text-center shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-scale-in">
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-950/40 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer",
                  biometricScanning && "animate-pulse scale-105 border-white",
                )}
                onClick={unlockWithBiometrics}
              >
                <Fingerprint className="h-14 w-14" />
              </div>
            </div>
            <h3 className="neon-text text-xl font-black uppercase text-white">
              Biometric Room Access
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              Hold the fingerprint sensor above or use simulated Face ID to unlock this private
              room.
            </p>
            <Button
              className="liquid-btn mt-6 w-full text-xs font-black uppercase"
              onClick={unlockWithBiometrics}
            >
              {biometricScanning ? "Authenticating Scan..." : "Verify Fingerprint"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
