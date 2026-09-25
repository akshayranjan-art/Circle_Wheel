import { useState } from "react";
import {
  Heart,
  Sparkles,
  Zap,
  Clock,
  Shield,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  Gift,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { soundFX } from "@/lib/sound-fx";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ROOM_PLAYERS,
  calculateLoveBirdsCompatibility,
  findRoomLoveBirdsPairings,
  PlayerProfile,
  CompatibilityResult,
} from "@/lib/love-birds";

interface LoveBirdsRadarProps {
  onHighlightSeats?: (seatA: number | null, seatB: number | null) => void;
}

export function LoveBirdsRadar({ onHighlightSeats }: LoveBirdsRadarProps) {
  const {
    diamonds,
    userGender,
    setUserGender,
    pairLoveBirds,
    loveBirdsPartner,
    loveBirdsPartnerGender,
    dailyLiveSeconds,
    claimLoveDividend,
    claimedLoveDividendToday,
    addLiveSeconds,
    spend,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<"pairings" | "my-match" | "rules">("pairings");
  const [selectedResult, setSelectedResult] = useState<CompatibilityResult | null>(null);

  // Construct current player profile for "You"
  const userProfile: PlayerProfile = {
    id: "you",
    name: "You",
    gender: userGender,
    avatar: userGender === "female" ? "👸" : "🥷",
    level: 45,
    winRate: 80,
    cutGotis: 350,
    matchesPlayed: 480,
    playStyle: userGender === "female" ? "Strategic Home Runner" : "Aggressive Bounty Hunter",
    seatIndex: 1,
    voiceVibe: userGender === "female" ? "Sweet & Vibrant" : "Deep Voice & Confident",
    dailyLiveMinutes: Math.floor(dailyLiveSeconds / 60),
    bio: "Looking for dedicated voice room duo to dominate 4D arenas!",
    favoriteColor: userGender === "female" ? "#ec4899" : "#06b6d4",
  };

  // All room players including user
  const allRoomPlayers = [userProfile, ...DEFAULT_ROOM_PLAYERS];

  // Top pairings between all male and female players in the room
  const detectedPairings = findRoomLoveBirdsPairings(allRoomPlayers);

  // Best matches for the current user (filtered to opposite gender)
  const oppositeGenderCandidates = DEFAULT_ROOM_PLAYERS.filter((p) => p.gender !== userGender);

  const myMatches = oppositeGenderCandidates
    .map((candidate) =>
      userGender === "male"
        ? calculateLoveBirdsCompatibility(userProfile, candidate)
        : calculateLoveBirdsCompatibility(candidate, userProfile),
    )
    .sort((a, b) => b.overallScore - a.overallScore);

  const today = new Date().toDateString();
  const alreadyClaimed = claimedLoveDividendToday === today;
  const is10MinsMet = dailyLiveSeconds >= 600;
  const liveMinutes = Math.floor(dailyLiveSeconds / 60);
  const remainingMins = Math.max(0, Math.ceil((600 - dailyLiveSeconds) / 60));

  const handleClaimBonus = () => {
    const res = claimLoveDividend();
    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handlePair = (partner: PlayerProfile) => {
    const res = pairLoveBirds(partner.name, partner.gender);
    if (!res.ok) {
      soundFX.playSpectatorBomb("horn");
      toast.error(res.reason ?? "Could not match profile!");
    } else {
      soundFX.playSpectatorBomb("cheer");
      toast.success(
        `🎉 LOVE-BIRDS CONNECTED! You & ${partner.name} are now paired! (${userGender === "female" ? "♀" : "♂"} ✕ ${partner.gender === "female" ? "♀" : "♂"})!`,
      );
      if (onHighlightSeats && partner.seatIndex !== null) {
        onHighlightSeats(userProfile.seatIndex, partner.seatIndex);
      }
    }
  };

  return (
    <div className="mt-6 rounded-3xl bg-slate-900/90 p-5 border-2 border-pink-500/40 shadow-[0_0_35px_rgba(236,72,153,0.25)] relative overflow-hidden">
      {/* Ambient background aura */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />

      {/* HEADER: Title & Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-pink-500/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.6)] text-white">
            <Heart className="h-6 w-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Love-Birds Live Matching Radar
                <span className="rounded-full bg-pink-950 px-2 py-0.5 text-[10px] font-black text-pink-400 border border-pink-500/30">
                  AI Stats Synergy
                </span>
              </h2>
            </div>
            <p className="text-xs text-pink-200/80">
              Monitors player stats & highlights compatible ♂ Male ✕ ♀ Female voice room pairings
            </p>
          </div>
        </div>

        {/* Current Active Pairing & Gender Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playTick();
              const nextG = userGender === "female" ? "male" : "female";
              setUserGender(nextG);
              toast.info(
                `Switched your profile gender to: ${nextG === "female" ? "Female ♀" : "Male ♂"}`,
              );
            }}
            className="flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 text-xs font-black border border-pink-500/40 text-pink-300 hover:text-white transition-colors"
          >
            <span>Your Profile:</span>
            <span className="text-white font-extrabold">
              {userGender === "female" ? "♀ Female" : "♂ Male"}
            </span>
          </button>

          {loveBirdsPartner ? (
            <div className="flex items-center gap-1.5 rounded-full bg-pink-950/80 px-3 py-1 text-xs font-bold text-pink-300 border border-pink-500/40">
              <Heart className="h-3.5 w-3.5 fill-current text-pink-400" />
              <span>Paired: {loveBirdsPartner}</span>
            </div>
          ) : (
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-400 border border-slate-800">
              No Partner Paired
            </span>
          )}
        </div>
      </div>

      {/* 50 DIAMOND DAILY BONUS HUD CARD */}
      <div className="relative z-10 mt-4 rounded-2xl bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-slate-950 p-4 border border-pink-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-300 uppercase tracking-wide">
                  50 💎 Daily Love-Birds Bonus
                </span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                  Daily Reward
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Condition: Stay active <b>10+ minutes</b> in voice rooms with your paired partner.
              </p>
            </div>
          </div>

          {/* Claim Action & Timer */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Timer Meter */}
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 border border-pink-500/30 text-xs">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-bold text-slate-300">
                Live:{" "}
                <span className="font-mono text-cyan-300 font-black">{liveMinutes}m / 10m</span>
              </span>
              {is10MinsMet && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            </div>

            {/* Fast-Forward / Add Minutes Test Button */}
            <button
              type="button"
              onClick={() => {
                soundFX.playTick();
                addLiveSeconds(300); // add 5 minutes
                toast.success("⚡ Added +5m to voice room live timer!");
              }}
              className="rounded-xl bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-cyan-400 border border-slate-700 hover:border-cyan-400"
              title="Add live minutes to test bonus"
            >
              +5m Test
            </button>

            {/* Main Claim Button */}
            {alreadyClaimed ? (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/80 px-4 py-2 text-xs font-black text-emerald-300 border border-emerald-500/50">
                <CheckCircle2 className="h-4 w-4" />
                <span>Claimed Today (+50 💎)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaimBonus}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase text-white shadow-lg transition-all",
                  is10MinsMet
                    ? "bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-105 animate-pulse"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700",
                )}
              >
                <Heart className="h-4 w-4 fill-current text-pink-200" />
                <span>
                  {is10MinsMet
                    ? "Claim 50 💎 Daily Bonus!"
                    : `Claim 50 💎 (${remainingMins}m left)`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-3 w-full rounded-full bg-slate-950 h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, (dailyLiveSeconds / 600) * 100)}%` }}
          />
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="relative z-10 mt-5 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playTick();
            setActiveTab("pairings");
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "pairings"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800",
          )}
        >
          <Zap className="h-3.5 w-3.5 text-pink-400" />
          <span>Room Pairings Monitor ({detectedPairings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playTick();
            setActiveTab("my-match");
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "my-match"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800",
          )}
        >
          <Heart className="h-3.5 w-3.5 fill-current text-pink-400" />
          <span>
            Your Best Matches (
            {userGender === "female" ? "♂ Male Candidates" : "♀ Female Candidates"})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFX.playTick();
            setActiveTab("rules");
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "rules"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800",
          )}
        >
          <Award className="h-3.5 w-3.5 text-amber-400" />
          <span>Love-Birds Rules & Synergy Formula</span>
        </button>
      </div>

      {/* TAB 1: ALL DETECTED MALE-FEMALE PAIRINGS IN ROOM */}
      {activeTab === "pairings" && (
        <div className="relative z-10 mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Real-time compatibility based on <b>Win Rate Harmony</b>, <b>Style Synergy</b> &{" "}
              <b>Voice Vibes</b>
            </span>
            <span className="text-pink-400 font-bold">Male ♂ ✕ Female ♀ Only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {detectedPairings.map((res, idx) => {
              const isTop = idx === 0;
              const isUserInvolved = res.male.name === "You" || res.female.name === "You";

              return (
                <div
                  key={`${res.male.id}-${res.female.id}`}
                  className={cn(
                    "rounded-2xl bg-slate-950/90 p-4 border transition-all hover:scale-[1.01]",
                    isTop
                      ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-gradient-to-br from-pink-950/30 to-slate-950"
                      : "border-slate-800 hover:border-pink-500/50",
                  )}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase flex items-center gap-1",
                        isTop
                          ? "bg-pink-500 text-white shadow"
                          : "bg-pink-950 text-pink-300 border border-pink-500/30",
                      )}
                    >
                      <Sparkles className="h-3 w-3" />
                      {res.chemistryTitle}
                    </span>

                    <span className="font-mono text-base font-black text-pink-400 drop-shadow">
                      {res.overallScore}% MATCH
                    </span>
                  </div>

                  {/* Couple Avatars & VS */}
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/70 p-2.5 border border-slate-800">
                    {/* Male Player */}
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative">
                        <span className="text-2xl">{res.male.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-cyan-400">
                          ♂
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-white">{res.male.name}</p>
                        <p className="text-[10px] text-cyan-400 font-bold truncate">
                          Lv.{res.male.level} • {res.male.winRate}% Win
                        </p>
                        <span className="inline-block text-[9px] text-slate-400 truncate">
                          {res.male.playStyle}
                        </span>
                      </div>
                    </div>

                    {/* Heart Center */}
                    <div className="flex flex-col items-center px-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40">
                        <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                      </div>
                      <span className="text-[9px] font-bold text-pink-300 mt-0.5">SYNERGY</span>
                    </div>

                    {/* Female Player */}
                    <div className="flex items-center justify-end gap-2 flex-1 text-right">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-white">{res.female.name}</p>
                        <p className="text-[10px] text-pink-400 font-bold truncate">
                          Lv.{res.female.level} • {res.female.winRate}% Win
                        </p>
                        <span className="inline-block text-[9px] text-slate-400 truncate">
                          {res.female.playStyle}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="text-2xl">{res.female.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 text-[10px] font-black text-pink-400">
                          ♀
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Synergy Reason */}
                  <p className="mt-2.5 text-[11px] text-slate-300 italic leading-relaxed">
                    "{res.synergyReason}"
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>
                        Seat:{" "}
                        {res.male.seatIndex !== null ? `#${res.male.seatIndex + 1}` : "Audience"}
                      </span>
                      <span>•</span>
                      <span>
                        Seat:{" "}
                        {res.female.seatIndex !== null
                          ? `#${res.female.seatIndex + 1}`
                          : "Audience"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playSpectatorBomb("cheer");
                          toast.success(`👏 Cheered for ${res.male.name} & ${res.female.name}!`);
                        }}
                        className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-800"
                      >
                        Cheer 👏
                      </button>

                      {isUserInvolved && (
                        <button
                          type="button"
                          onClick={() => {
                            const target = res.male.name === "You" ? res.female : res.male;
                            handlePair(target);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-2.5 py-1 text-[10px] font-black text-white hover:brightness-110 shadow"
                        >
                          <Heart className="h-3 w-3 fill-current" />
                          <span>Pair Love-Birds</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BEST MATCHES FOR CURRENT USER */}
      {activeTab === "my-match" && (
        <div className="relative z-10 mt-4 space-y-3">
          <div className="rounded-xl bg-slate-950/70 p-3 border border-pink-500/20 text-xs text-pink-200">
            Scanning room for prospective{" "}
            <b>{userGender === "female" ? "♂ Male Partners" : "♀ Female Partners"}</b> based on your
            play style (<span className="text-white font-bold">{userProfile.playStyle}</span>) and{" "}
            {userProfile.winRate}% win rate.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myMatches.map((res) => {
              const partner = userGender === "female" ? res.male : res.female;
              const isCurrentPartner = loveBirdsPartner === partner.name;

              return (
                <div
                  key={partner.id}
                  className={cn(
                    "rounded-2xl bg-slate-950 p-4 border flex flex-col justify-between transition-all",
                    isCurrentPartner
                      ? "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                      : "border-slate-800 hover:border-pink-500/50",
                  )}
                >
                  <div>
                    {/* Header: Score & Avatar */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full bg-pink-950 px-2 py-0.5 text-[10px] font-black text-pink-400 border border-pink-500/30">
                        {partner.gender === "female" ? "♀ Female" : "♂ Male"}
                      </span>
                      <span className="font-mono text-sm font-black text-pink-400">
                        {res.overallScore}% MATCH
                      </span>
                    </div>

                    <div className="flex items-center gap-3 my-2">
                      <div className="text-4xl">{partner.avatar}</div>
                      <div>
                        <h4 className="text-sm font-black text-white">{partner.name}</h4>
                        <p className="text-[11px] text-cyan-400 font-bold">
                          Lv.{partner.level} • {partner.winRate}% Win Rate
                        </p>
                        <p className="text-[10px] text-amber-400 font-bold">
                          🗡️ {partner.cutGotis} Gotis Cut
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800 text-[11px] text-slate-300">
                      <p className="font-bold text-purple-300">{partner.playStyle}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic">"{partner.bio}"</p>
                    </div>

                    {/* Stats Score Breakdown */}
                    <div className="mt-3 space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Style Synergy:</span>
                        <span className="font-mono font-bold text-pink-300">
                          {res.breakdown.styleSynergy}/35
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Win-Rate Balance:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {res.breakdown.winRateHarmony}/30
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Voice Vibe Chemistry:</span>
                        <span className="font-mono font-bold text-purple-300">
                          {res.breakdown.voiceChemistry}/15
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connect Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {isCurrentPartner ? (
                      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-pink-950/80 py-2 text-xs font-black text-pink-300 border border-pink-500/50">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Active Love-Bird Partner 💖</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePair(partner)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-2 text-xs font-black uppercase text-white shadow-md hover:brightness-110 transition-all"
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        <span>Connect Love-Birds 💖</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RULES & BONUS CRITERIA */}
      {activeTab === "rules" && (
        <div className="relative z-10 mt-4 rounded-2xl bg-slate-950 p-5 border border-pink-500/20 text-xs text-slate-300 space-y-3 leading-relaxed">
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <Heart className="h-4 w-4 fill-current text-pink-400" />
            Official Love-Birds Matching & 50 💎 Daily Bonus Policy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
              <span className="text-lg">👫</span>
              <h4 className="font-black text-pink-300 mt-1">1. Strict ♂ ✕ ♀ Pairing</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Love-Birds matching strictly monitors opposite-gender pairings (Male ♂ and Female
                ♀). Same-gender pairings are blocked by the rule engine.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
              <span className="text-lg">⏱️</span>
              <h4 className="font-black text-cyan-300 mt-1">2. 10-Minute Voice Live</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                You must stay active in the 8-seat voice rooms or game lobby for at least 10 minutes
                (600 seconds) each day to activate the daily reward.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
              <span className="text-lg">💎</span>
              <h4 className="font-black text-amber-300 mt-1">3. 50 Diamonds Bonus</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Once paired and 10 minutes live condition is met, claim your 50 💎 bonus directly to
                your wallet every single day!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
