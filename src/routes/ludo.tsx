import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Dice5,
  Gem,
  RotateCcw,
  Trophy,
  Rotate3d,
  Flame,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  Eye,
  Radio,
  CloudRain,
  Flame as LavaIcon,
  Sun,
  Crown,
  Volume2,
  VolumeX,
  Heart,
  Send,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useWallet,
  type DiceSkin,
  type TokenSkin,
  type ChatFrame,
  type Gender,
} from "@/components/wallet-provider";
import { useLanguage } from "@/lib/language-context";
import { soundFX } from "@/lib/sound-fx";
import { Slider } from "@/components/ui/slider";
import { BoardLiveTicker } from "@/components/board-live-ticker";
import { GameRulesDialog } from "@/components/game-rules-dialog";
import {
  HOME_PATH,
  LAST_STEP,
  SAFE_TRACK_INDEXES,
  START_INDEX,
  TRACK,
  applyMove,
  createTokens,
  hasWon,
  legalMoves,
  pickBotMove,
  fairRoll,
  tokenCell,
  PORTAL_TILES,
  type PlayerId,
  type Token,
} from "@/lib/ludo-engine";

export const Route = createFileRoute("/ludo")({
  head: () => ({
    meta: [
      { title: "4D Neon Super Ludo Arena — Orbit" },
      {
        name: "description",
        content:
          "4D holographic dice, liquid mercury buttons, 11-diamond kill strike, weather arenas, and zero-gravity gameplay.",
      },
      { property: "og:title", content: "4D Neon Super Ludo Arena — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LudoPage,
});

const PLAYERS = [
  { id: 0 as PlayerId, name: "You", color: "var(--ludo-0)", bot: false },
  { id: 1 as PlayerId, name: "Cyber Nova (Bot)", color: "var(--ludo-1)", bot: true },
  { id: 2 as PlayerId, name: "Zex Mafia (Bot)", color: "var(--ludo-2)", bot: true },
  { id: 3 as PlayerId, name: "Kiro Dragon (Bot)", color: "var(--ludo-3)", bot: true },
];

const CAPTURE_REWARD = 10; // 10 diamonds awarded when cutting goti
const HOME_REWARD = 25;
const BASE_WIN_REWARD = 111;

const cellKey = (r: number, c: number) => `${r},${c}`;

type CellStyle = {
  bg: string;
  border?: boolean;
  safe?: boolean;
  portal?: boolean;
  suddenDeath?: boolean;
};

const CELL_MAP = new Map<string, CellStyle>();

TRACK.forEach(([r, c], index) => {
  const owner = ([0, 1, 2, 3] as PlayerId[]).find((p) => START_INDEX[p] === index);
  CELL_MAP.set(cellKey(r, c), {
    bg: owner !== undefined ? `var(--ludo-${owner})` : "var(--card)",
    border: true,
    safe: SAFE_TRACK_INDEXES.has(index),
    portal: PORTAL_TILES[index] !== undefined,
  });
});

([0, 1, 2, 3] as PlayerId[]).forEach((p) => {
  HOME_PATH[p].slice(0, 5).forEach(([r, c]) => {
    CELL_MAP.set(cellKey(r, c), {
      bg: `var(--ludo-${p})`,
      border: true,
    });
  });
});

function pct(v: number) {
  return `${((v + 0.5) / 15) * 100}%`;
}

type WeatherType = "Clear" | "Neon Rain" | "Liquid Lava" | "Cyber Snow";

export function LudoPage() {
  const {
    diamonds,
    earn,
    spend,
    recordCapture,
    recordWin,
    recordLoss,
    insuranceActive,
    setInsuranceActive,
    activeDiceSkin,
    setActiveDiceSkin,
    tokenSkin,
    setTokenSkin,
    activeBadge,
    soundEnabled,
    toggleSound,
    userGender,
    setUserGender,
    activeChatFrame,
    setActiveChatFrame,
    unlockedFrames,
    unlockChatFrame,
    loveBirdsPartner,
    loveBirdsCount,
    dailyLiveSeconds,
    claimLoveDividend,
    recentMilestoneAnnouncement,
    dismissAnnouncement,
  } = useWallet();

  const { t, language, setLanguage } = useLanguage();

  const [tokens, setTokens] = useState<Token[]>(createTokens);
  const [turn, setTurn] = useState<PlayerId>(0);
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [phase, setPhase] = useState<"roll" | "move">("roll");
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [message, setMessage] = useState("Your turn — roll the dice!");
  const [lastEarned, setLastEarned] = useState(0);

  // In-Match Live Chat with Unique Animated Chat Frames
  const [matchChatText, setMatchChatText] = useState("");
  const [matchChatList, setMatchChatList] = useState<
    Array<{ from: string; text: string; frame: ChatFrame; isYou: boolean }>
  >([
    {
      from: "Kabir_Boss",
      text: "11 diamonds kill strike active hai! Goti bachao! 🔥",
      frame: "cyber",
      isYou: false,
    },
    {
      from: "Simran ✨",
      text: "Today's Love Birds 50 milestone reached! 💖",
      frame: "love",
      isYou: false,
    },
  ]);

  // 4D Visual & Gameplay Additions
  const [boardRotation, setBoardRotation] = useState<number>(0);
  const [dicePowerCap, setDicePowerCap] = useState<number>(6);
  const [bountyTarget, setBountyTarget] = useState<PlayerId | null>(null);
  const [weather, setWeather] = useState<WeatherType>("Clear");
  const [ghostMode, setGhostMode] = useState<boolean>(false);
  const [suddenDeath, setSuddenDeath] = useState<boolean>(false);
  const [timeWarp, setTimeWarp] = useState<boolean>(false);
  const [zeroGravity, setZeroGravity] = useState<boolean>(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [spectatorTips, setSpectatorTips] = useState<number>(142);
  const [betrayalAlert, setBetrayalAlert] = useState<string | null>(null);

  // FX States
  const [hypercarEntry, setHypercarEntry] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [killCamActive, setKillCamActive] = useState<boolean>(false);
  const [victoryShockwave, setVictoryShockwave] = useState<boolean>(false);
  const [screenCrack, setScreenCrack] = useState<boolean>(false);
  const [bettingPool, setBettingPool] = useState<number>(50); // Dynamic betting pool
  const [totalTurnCount, setTotalTurnCount] = useState<number>(1);
  const [grandJackpotModal, setGrandJackpotModal] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(true);

  // Biometric / Insurance Prompt
  const [insuranceModal, setInsuranceModal] = useState<boolean>(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback(
    (fn: () => void, ms: number) => {
      const adjustedMs = timeWarp ? Math.round(ms / 2) : ms;
      const tId = setTimeout(fn, adjustedMs);
      timers.current.push(tId);
    },
    [timeWarp],
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Trigger Hypercar Entry on Match launch
  const launchHypercar = useCallback(() => {
    soundFX.playHypercarEngine();
    setHypercarEntry(true);
    setScreenShake(true);
    setTimeout(() => {
      setHypercarEntry(false);
      setScreenShake(false);
    }, 2800);
  }, []);

  useEffect(() => {
    // Initial entrance effect
    launchHypercar();
  }, [launchHypercar]);

  // Turn management
  const nextTurn = useCallback((from: PlayerId, again: boolean) => {
    setDie(null);
    setPhase("roll");
    setTurn(again ? from : (((from + 1) % 4) as PlayerId));
    setTotalTurnCount((c) => {
      const nextCount = c + 1;
      if (nextCount % 100 === 0) {
        setGrandJackpotModal(true);
      }
      return nextCount;
    });

    // Occasional simulated AI betrayal detection
    if (Math.random() < 0.08) {
      setBetrayalAlert("⚠️ AI Colleague Alert: Bot 1 and Bot 2 suspicious coordination detected!");
      setTimeout(() => setBetrayalAlert(null), 3500);
    }
  }, []);

  const resolveMove = useCallback(
    (state: Token[], tokenId: string, value: number, player: PlayerId) => {
      soundFX.playTokenStep();
      const result = applyMove(state, tokenId, value, true);
      setTokens(result.tokens);

      if (result.teleported) {
        soundFX.playPortalTeleport();
        toast.info("🌀 WORMHOLE PORTAL ACTIVATED! Token Teleported!");
      }

      let again = value === 6 || value >= 9;

      // Kill Strike Handling (Feature #11)
      if (result.captured.length) {
        again = true;

        // Cinematic Kill-Cam slow motion zoom & flash (Feature #8)
        setKillCamActive(true);
        setTimeout(() => setKillCamActive(false), 1400);

        // Sub-bass sound & coin spray (Feature #11)
        soundFX.playKillStrike();

        if (player !== 0 && result.captured.some((c) => c.player === 0)) {
          // Player's goti was cut by a bot!
          if (insuranceActive) {
            toast.success("🛡️ Diamond Insurance Shield protected your 10 diamonds!");
          } else {
            spend(10, "Token cut penalty (-10 💎)");
            toast.error("💥 GOTI CUT! 10 Diamonds lost to bot!");
          }
          setBountyTarget(player);
          toast.error(`🔥 REVENGE TARGET LOCKED ON ${PLAYERS[player]?.name}!`);
        }
      }

      if (result.reachedHome) {
        again = true;
        soundFX.playDiceResult(6);
      }

      if (player === 0) {
        let reward = 0;
        if (result.captured.length) {
          const isBountyHit =
            bountyTarget !== null && result.captured.some((c) => c.player === bountyTarget);
          const calculatedReward = isBountyHit ? CAPTURE_REWARD * 3 : CAPTURE_REWARD;

          reward += result.captured.length * calculatedReward;
          recordCapture(result.captured.length);

          if (isBountyHit) {
            setBountyTarget(null);
            toast.success("💥 REVENGE STRIKE COMPLETE! 3X Triple Bounty Claimed (+30 💎)!");
          } else {
            toast.success(`💥 GOTI CUT! +${CAPTURE_REWARD} 💎 Looted to Wallet!`);
          }
        }

        if (result.reachedHome) {
          reward += HOME_REWARD;
        }

        if (reward > 0) {
          earn(
            reward,
            result.captured.length ? "11-Diamond Kill Strike" : "Token reached home base",
          );
          setLastEarned(reward);
          later(() => setLastEarned(0), 1600);
        }
      }

      // Check Victory
      if (hasWon(result.tokens, player)) {
        setWinner(player);
        setDie(null);

        if (player === 0) {
          soundFX.playSpectatorBomb("cheer");
          setVictoryShockwave(true);
          const totalPrize = BASE_WIN_REWARD + bettingPool * 3;
          earn(totalPrize, `Victory in Ludo Arena (+Pool: ${bettingPool * 4} 💎)`);
          recordWin();
          toast.success(`🏆 VICTORY SHOCKWAVE! Vault Prize: +${totalPrize} 💎!`);
        } else {
          // Defeat screen crack effect (Feature #6)
          soundFX.playSpectatorBomb("horn");
          setScreenCrack(true);
          const lossResult = recordLoss();
          if (lossResult.consolationAwarded) {
            toast.success(
              `🎁 LOSS-TO-PROFIT ACTIVATED! 3 consecutive losses = +${lossResult.prize} 💎 Consolation Reward!`,
            );
          } else {
            toast.error(`${PLAYERS[player]?.name} Won the Match!`);
          }
        }
        return;
      }

      later(() => nextTurn(player, again), 350);
    },
    [
      earn,
      spend,
      later,
      nextTurn,
      recordCapture,
      recordWin,
      recordLoss,
      bountyTarget,
      insuranceActive,
      bettingPool,
    ],
  );

  const roll = useCallback(
    (player: PlayerId) => {
      if (winner !== null || rolling) return;
      setRolling(true);
      soundFX.playDiceRoll();

      let ticks = 0;
      const spin = setInterval(() => {
        soundFX.playDiceRoll();
        setDie(Math.floor(Math.random() * dicePowerCap) + 1);
        ticks += 1;
        if (ticks > 7) {
          clearInterval(spin);
          const value = fairRoll(dicePowerCap);
          setDie(value);
          setRolling(false);
          soundFX.playDiceResult(value);

          const moves = legalMoves(tokens, player, value);
          if (moves.length === 0) {
            setMessage(
              player === 0
                ? `Rolled a ${value} — no legal moves`
                : `${PLAYERS[player]!.name} rolled ${value} (stuck)`,
            );
            later(() => nextTurn(player, false), 600);
            return;
          }
          setPhase("move");
          setMessage(
            player === 0
              ? `Rolled ${value} — select your goti`
              : `${PLAYERS[player]!.name} rolled ${value}`,
          );
        }
      }, 55);
    },
    [later, nextTurn, rolling, tokens, winner, dicePowerCap],
  );

  // Bot automation
  useEffect(() => {
    if (winner !== null) return;
    const player = PLAYERS[turn]!;
    if (!player.bot) {
      if (phase === "roll") setMessage(t.yourTurn);
      return;
    }
    if (phase === "roll") {
      later(() => roll(turn), 600);
    } else if (phase === "move" && die) {
      later(() => {
        const choice = pickBotMove(tokens, turn, die);
        if (!choice) {
          nextTurn(turn, false);
          return;
        }
        resolveMove(tokens, choice.id, die, turn);
      }, 550);
    }
  }, [turn, phase, die, tokens, winner, roll, later, nextTurn, resolveMove, t.yourTurn]);

  const movable =
    turn === 0 && phase === "move" && die
      ? new Set(legalMoves(tokens, 0, die).map((t) => t.id))
      : new Set<string>();

  const movableList = useMemo(() => Array.from(movable), [movable]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  // Auto-select first movable goti
  useEffect(() => {
    if (movableList.length > 0) {
      if (!selectedTokenId || !movable.has(selectedTokenId)) {
        setSelectedTokenId(movableList[0]);
      }
    } else {
      setSelectedTokenId(null);
    }
  }, [movableList, selectedTokenId, movable]);

  // Keyboard Arrow Key Navigation & Action triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (movableList.length > 0) {
          e.preventDefault();
          soundFX.playArrowNav();
          const currentIndex = movableList.indexOf(selectedTokenId ?? "");
          const nextIndex = (currentIndex - 1 + movableList.length) % movableList.length;
          setSelectedTokenId(movableList[nextIndex]);
        }
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (movableList.length > 0) {
          e.preventDefault();
          soundFX.playArrowNav();
          const currentIndex = movableList.indexOf(selectedTokenId ?? "");
          const nextIndex = (currentIndex + 1) % movableList.length;
          setSelectedTokenId(movableList[nextIndex]);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        if (turn === 0) {
          if (phase === "roll" && !rolling && winner === null) {
            e.preventDefault();
            roll(0);
          } else if (phase === "move" && selectedTokenId && movable.has(selectedTokenId) && die) {
            e.preventDefault();
            resolveMove(tokens, selectedTokenId, die, 0);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movableList, selectedTokenId, turn, phase, rolling, winner, die, tokens, roll, resolveMove, movable]);

  const onTokenClick = (token: Token) => {
    if (!movable.has(token.id) || !die) return;
    setSelectedTokenId(token.id);
    resolveMove(tokens, token.id, die, 0);
  };

  const triggerTrashTalk = (
    phrase: string,
    preset: "Robot" | "Anime" | "Monster" | "Mafia" = "Mafia",
  ) => {
    soundFX.speakWithModulator(phrase, preset);
    toast.info(`🗣️ Trash-Talk Sent: "${phrase}"`, { duration: 2000 });
  };

  const restart = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTokens(createTokens());
    setTurn(0);
    setDie(null);
    setPhase("roll");
    setWinner(null);
    setBountyTarget(null);
    setVictoryShockwave(false);
    setScreenCrack(false);
    setMessage("Arena reset! Roll your 4D Holographic Dice!");
    launchHypercar();
  };

  const slotOf = (token: Token) => Number(token.id.split("-")[1]);

  return (
    <main
      className={cn(
        "relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-48 pt-10 transition-all duration-700 select-none",
        screenShake && "screen-hypercar-shake",
        killCamActive && "matrix-killcam-active",
        zeroGravity && "zero-gravity-floating",
      )}
    >
      {/* Hypercar Entry Overlay (Feature #4) */}
      {hypercarEntry && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="entry-vehicle text-center">
            <div className="text-9xl drop-shadow-[0_0_60px_#06b6d4]">🏎️💨</div>
            <h2 className="neon-text mt-3 text-4xl font-black uppercase text-cyan-300 tracking-widest">
              4D NEON HYPERCAR ENTRY!
            </h2>
            <p className="text-sm font-bold text-amber-300 tracking-wider">
              {PLAYERS[0]?.name} entered the Super Arena with 1,500 Horsepower
            </p>
          </div>
        </div>
      )}

      {/* Screen Crack Overlay upon Defeat (Feature #6) */}
      {screenCrack && (
        <div
          onClick={() => setScreenCrack(false)}
          className="screen-crack-overlay pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-950/40 p-4 backdrop-blur-sm"
        >
          <div className="max-w-md rounded-3xl border-2 border-red-500 bg-slate-950/90 p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.7)] animate-scale-in">
            <div className="text-6xl">💔⚡</div>
            <h2 className="neon-text mt-3 text-3xl font-black text-red-500 uppercase">
              CRITICAL SCREEN CRACK!
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              The opponent shattered your defense perimeter! Tap to clear cracks and rematch!
            </p>
            <Button
              className="liquid-btn mt-6 w-full !bg-red-600 font-black"
              onClick={() => {
                setScreenCrack(false);
                restart();
              }}
            >
              Rematch & Revenge
            </Button>
          </div>
        </div>
      )}

      {/* Victory Shockwave Ring Effect (Feature #6) */}
      {victoryShockwave && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div className="victory-shockwave h-64 w-64 border-cyan-400" />
        </div>
      )}

      {/* Weather Backdrop Overlay (Feature #7) */}
      {weather === "Neon Rain" && (
        <div className="weather-rain-overlay pointer-events-none fixed inset-0 z-10" />
      )}
      {weather === "Liquid Lava" && (
        <div className="weather-lava-overlay pointer-events-none fixed inset-0 z-10" />
      )}

      {/* Top Header Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-[11px] font-bold text-cyan-400 border border-cyan-500/30">
              <Zap className="h-3 w-3 text-cyan-400 animate-pulse" /> 4D QUANTUM ARENA
            </span>
            <span className="rounded-full bg-purple-950/80 px-2.5 py-0.5 text-[11px] font-bold text-purple-400 border border-purple-500/30">
              {activeBadge}
            </span>
            {insuranceActive && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                <Shield className="h-3 w-3 text-emerald-400" /> {t.insuranceActive}
              </span>
            )}
          </div>
          <h1 className="neon-text mt-1 text-3xl font-black tracking-tight sm:text-4xl bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            {t.ludoArena}
          </h1>
        </div>

        {/* Global Language & Audio & Diamond Wallet Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            {(["en", "hi", "hi-en"] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => {
                  soundFX.playTick();
                  setLanguage(lng);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                  language === lng
                    ? "bg-primary text-slate-950 shadow"
                    : "text-slate-400 hover:text-white",
                )}
              >
                {lng === "en" ? "English" : lng === "hi" ? "हिंदी" : "Hinglish"}
              </button>
            ))}
          </div>

          {/* Game Rules Dialog */}
          <GameRulesDialog />

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-cyan-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* Wallet Balance */}
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 border border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Gem className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-mono text-base font-black text-white">
              {diamonds.toLocaleString()}
            </span>
            {lastEarned > 0 && (
              <span className="text-xs font-extrabold text-cyan-400 animate-bounce">
                +{lastEarned}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TOP 20 LIVE ITEMS & PURCHASES FEED (100 USERS LIVE) */}
      <div className="mt-4">
        <BoardLiveTicker />
      </div>

      {/* GLOBAL MILESTONE ANNOUNCEMENT BANNER */}
      {recentMilestoneAnnouncement && (
        <div className="relative z-30 mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-pink-950/90 via-purple-950/90 to-cyan-950/90 px-4 py-2.5 border-2 border-pink-500/70 text-pink-200 text-xs font-black animate-pulse shadow-[0_0_25px_rgba(236,72,153,0.4)]">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-400 fill-current animate-bounce shrink-0" />
            <span>{recentMilestoneAnnouncement}</span>
          </div>
          <button
            onClick={() => {
              soundFX.playTick();
              dismissAnnouncement();
            }}
            className="ml-3 rounded-full bg-slate-900/80 p-1 text-slate-400 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Betrayal Alert Banner (Feature #40) */}
      {betrayalAlert && (
        <div className="relative z-30 mt-3 flex items-center justify-between rounded-xl bg-amber-950/80 px-4 py-2.5 border border-amber-500/60 text-amber-200 text-xs font-black animate-bounce shadow-lg">
          <span>{betrayalAlert}</span>
          <button onClick={() => setBetrayalAlert(null)} className="ml-2 font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* IN-MATCH LIVE CHAT AT TOP (User Request: chat box upar kar de) */}
      <div className="relative z-30 mt-4 rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-400">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              Live Arena Chat & VIP Unique Frames
            </span>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800">
              {matchChatList.length} Messages
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* VIP Frame Selector */}
            <div className="hidden sm:flex items-center gap-1">
              {(["none", "cyber", "love", "dragon", "royal", "flame"] as ChatFrame[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    soundFX.playTick();
                    setActiveChatFrame(f);
                    toast.info(`Chat Frame: ${f.toUpperCase()}`);
                  }}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold border transition-all",
                    activeChatFrame === f
                      ? "border-cyan-400 bg-cyan-950 text-cyan-300 shadow"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white",
                  )}
                >
                  {f === "none" ? "Default" : f}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setChatOpen((c) => !c)}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-lg"
            >
              {chatOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {chatOpen ? "Minimize" : "Expand Chat"}
            </button>
          </div>
        </div>

        {chatOpen && (
          <div className="mt-2 space-y-2">
            {/* Messages Stream */}
            <div className="max-h-28 overflow-y-auto space-y-1.5 rounded-xl bg-slate-950/90 p-2 border border-slate-800 text-xs">
              {matchChatList.slice(-6).map((m, idx) => {
                const frameClass =
                  m.frame === "cyber"
                    ? "chat-frame-cyber"
                    : m.frame === "dragon"
                      ? "chat-frame-dragon"
                      : m.frame === "love"
                        ? "chat-frame-love"
                        : m.frame === "royal"
                          ? "chat-frame-royal"
                          : m.frame === "flame"
                            ? "chat-frame-flame"
                            : "border-slate-800";

                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs transition-all flex items-baseline gap-2",
                      frameClass,
                      m.isYou ? "bg-cyan-950/40 text-cyan-100" : "bg-slate-900/60 text-slate-200",
                    )}
                  >
                    <span className="font-black text-[11px] text-cyan-300 shrink-0">{m.from}:</span>
                    <span className="text-[11px] leading-snug">{m.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Chat Send Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!matchChatText.trim()) return;
                soundFX.playLiquidRipple();
                setMatchChatList((prev) => [
                  ...prev,
                  {
                    from: "You",
                    text: matchChatText.trim(),
                    frame: activeChatFrame,
                    isYou: true,
                  },
                ]);
                setMatchChatText("");
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={matchChatText}
                onChange={(e) => setMatchChatText(e.target.value)}
                placeholder={`Chat in arena with ${activeChatFrame} VIP frame...`}
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                aria-label="Send Arena Message"
                className="liquid-btn !px-3 !py-1 text-xs font-black flex items-center gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Main Board & Controls Grid */}
      <div className="relative z-20 mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* LUDO BOARD CONTAINER */}
        <div className="flex flex-col items-center justify-center">
          <div
            style={{
              transform: `rotate(${boardRotation}deg)`,
              transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className={cn(
              "sound-reactive-border relative aspect-square w-full max-w-[540px] overflow-hidden rounded-3xl p-3 bg-slate-950 border-2 border-slate-800 shadow-[0_0_40px_rgba(6,182,212,0.2)]",
              suddenDeath && "border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)]",
            )}
          >
            <div className="relative h-full w-full">
              {/* Sabhi 4 players ke Yards */}
              {([0, 1, 2, 3] as PlayerId[]).map((p) => {
                const [top, left] = p === 0 ? [0, 0] : p === 1 ? [0, 9] : p === 2 ? [9, 9] : [9, 0];
                return (
                  <div
                    key={`yard-${p}`}
                    className={cn(
                      "absolute rounded-2xl border-2 transition-all duration-500",
                      turn === p &&
                        winner === null &&
                        "shadow-[0_0_35px_var(--ludo-glow)] border-white scale-[1.02]",
                    )}
                    style={
                      {
                        top: `${(top / 15) * 100}%`,
                        left: `${(left / 15) * 100}%`,
                        width: `${(6 / 15) * 100}%`,
                        height: `${(6 / 15) * 100}%`,
                        background: `color-mix(in oklab, var(--ludo-${p}) 18%, transparent)`,
                        borderColor: `var(--ludo-${p})`,
                        "--ludo-glow": `var(--ludo-${p})`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="absolute inset-[15%] rounded-xl border border-white/20 bg-slate-950/60 flex items-center justify-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {p === 0 ? "HQ" : `B${p}`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Center Home Triangle Pad */}
              <div
                className="absolute rounded-xl bg-slate-900 border border-primary/40 shadow-inner flex items-center justify-center overflow-hidden"
                style={{
                  top: `${(6 / 15) * 100}%`,
                  left: `${(6 / 15) * 100}%`,
                  width: `${(3 / 15) * 100}%`,
                  height: `${(3 / 15) * 100}%`,
                }}
              >
                <Crown className="h-8 w-8 text-amber-400 animate-pulse drop-shadow-[0_0_15px_#f59e0b]" />
              </div>

              {/* 52 Track Cells */}
              {TRACK.map(([r, c], index) => {
                const style = CELL_MAP.get(cellKey(r, c));
                const isPortal = PORTAL_TILES[index] !== undefined;
                const isSafe = SAFE_TRACK_INDEXES.has(index);

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={cn(
                      "absolute rounded-md border text-[9px] font-bold flex items-center justify-center transition-colors",
                      isSafe
                        ? "border-amber-400/80 bg-amber-400/10 text-amber-300"
                        : "border-slate-800/80 bg-slate-900/60",
                      isPortal && "border-cyan-400 bg-cyan-950/60 animate-pulse text-cyan-300",
                      suddenDeath &&
                        (r === 0 || r === 14 || c === 0 || c === 14) &&
                        "bg-red-950/80 border-red-500/80 text-red-400",
                    )}
                    style={{
                      top: `${(r / 15) * 100}%`,
                      left: `${(c / 15) * 100}%`,
                      width: `${(1 / 15) * 100}%`,
                      height: `${(1 / 15) * 100}%`,
                      background: style?.bg,
                    }}
                  >
                    {isPortal ? "🌀" : isSafe ? "⭐" : ""}
                  </div>
                );
              })}

              {/* Home Path Cells */}
              {([0, 1, 2, 3] as PlayerId[]).map((p) =>
                HOME_PATH[p].slice(0, 5).map(([r, c]) => (
                  <div
                    key={`home-${p}-${r}-${c}`}
                    className="absolute rounded-md border border-white/20"
                    style={{
                      top: `${(r / 15) * 100}%`,
                      left: `${(c / 15) * 100}%`,
                      width: `${(1 / 15) * 100}%`,
                      height: `${(1 / 15) * 100}%`,
                      background: `var(--ludo-${p})`,
                    }}
                  />
                )),
              )}

              {/* TOKENS (GOTI): Fluid motion jelly squash & stretch (Feature #5) with Arrow Targeting */}
              {tokens.map((token) => {
                const [r, c] = tokenCell(token, slotOf(token));
                const isMovable = movable.has(token.id);
                const isSelected = selectedTokenId === token.id;
                const tokenNum = slotOf(token) + 1;
                const isGhostHidden =
                  ghostMode && totalTurnCount % 3 === 0 && token.player !== 0 && token.pos >= 0;

                return (
                  <button
                    key={token.id}
                    type="button"
                    disabled={!isMovable}
                    onClick={() => onTokenClick(token)}
                    className={cn(
                      "jelly-token absolute -translate-x-1/2 -translate-y-1/2 rounded-full font-black text-[10px] text-white flex items-center justify-center transition-all duration-300",
                      isMovable &&
                        "cursor-pointer ring-4 ring-cyan-300 animate-bounce scale-110 z-30",
                      isSelected &&
                        "ring-4 ring-amber-400 scale-125 z-40 shadow-[0_0_25px_#f59e0b]",
                      isGhostHidden && "opacity-15 blur-[1px]",
                      tokenSkin === "dragon" && "drop-shadow-[0_0_12px_#f97316]",
                    )}
                    style={{
                      top: pct(r),
                      left: pct(c),
                      width: "6.2%",
                      height: "6.2%",
                      background: `var(--ludo-${token.player})`,
                      boxShadow: isSelected
                        ? "0 0 25px #f59e0b, 0 0 10px #fff"
                        : `0 0 15px var(--ludo-${token.player})`,
                    }}
                  >
                    {/* Bouncing Arrow Cursor above selected goti */}
                    {isSelected && (
                      <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black text-amber-300 animate-bounce drop-shadow-[0_0_8px_#f59e0b] whitespace-nowrap">
                        ▼
                      </span>
                    )}

                    {token.player === 0 ? (
                      <span className="font-extrabold text-[11px] drop-shadow-md">
                        {tokenSkin === "dragon" ? "🐉" : tokenSkin === "cyber" ? "⚡" : tokenNum}
                      </span>
                    ) : (
                      <span className="font-bold text-[10px]">
                        {tokenSkin === "dragon" ? "🐉" : tokenSkin === "cyber" ? "⚡" : "💧"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Board Quick Utility Bar: 360° Rotate, Weather, Zero-G */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 w-full max-w-[540px] rounded-2xl bg-slate-900/80 p-3 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Rotate3d className="h-4 w-4 text-cyan-400" />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-bold"
                onClick={() => setBoardRotation((r) => r - 90)}
              >
                -90°
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-bold"
                onClick={() => setBoardRotation(0)}
              >
                0°
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-bold"
                onClick={() => setBoardRotation((r) => r + 90)}
              >
                +90°
              </Button>
            </div>

            {/* Weather Selector */}
            <div className="flex items-center gap-1">
              {(["Clear", "Neon Rain", "Liquid Lava"] as WeatherType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    soundFX.playTick();
                    setWeather(w);
                    toast.info(`Weather Arena: ${w}`);
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all",
                    weather === w
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {w === "Clear" ? (
                    <Sun className="h-3 w-3" />
                  ) : w === "Neon Rain" ? (
                    <CloudRain className="h-3 w-3" />
                  ) : (
                    <LavaIcon className="h-3 w-3" />
                  )}
                  {w}
                </button>
              ))}
            </div>

            {/* Zero Gravity Mode */}
            <button
              onClick={() => {
                soundFX.playTick();
                setZeroGravity((z) => !z);
                toast(
                  zeroGravity
                    ? "Zero-G Disabled"
                    : "🚀 Zero-Gravity Space Station Lobby Activated!",
                );
              }}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-bold",
                zeroGravity ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400",
              )}
            >
              Zero-G
            </button>
          </div>

          {/* CYBER ARROW CONTROLS & GOTI STEER PAD (User Request: arrow key wala goti daal) */}
          <div className="mt-3 w-full max-w-[540px] rounded-2xl bg-slate-900/90 p-3.5 border-2 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                Arrow Key Goti Control HUD
              </span>
              <span className="text-[10px] text-slate-300 font-bold">
                {movableList.length > 0
                  ? `Targeted: Goti #${selectedTokenId ? Number(selectedTokenId.split("-")[1]) + 1 : "None"}`
                  : turn === 0 && phase === "roll"
                    ? "Roll Dice (Press Space)"
                    : "Wait for Turn"}
              </span>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <button
                type="button"
                disabled={movableList.length <= 1}
                onClick={() => {
                  if (movableList.length > 0) {
                    soundFX.playArrowNav();
                    const currentIndex = movableList.indexOf(selectedTokenId ?? "");
                    const nextIndex = (currentIndex - 1 + movableList.length) % movableList.length;
                    setSelectedTokenId(movableList[nextIndex]);
                  }
                }}
                className="flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-black text-amber-300 border border-slate-800 hover:border-amber-400 disabled:opacity-40 transition-all cursor-pointer"
                title="Previous Goti (Arrow Left / Up)"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev Goti</span>
              </button>

              <button
                type="button"
                disabled={turn !== 0 || (phase === "move" && (!selectedTokenId || !die))}
                onClick={() => {
                  if (turn === 0) {
                    if (phase === "roll" && !rolling && winner === null) {
                      roll(0);
                    } else if (phase === "move" && selectedTokenId && die) {
                      resolveMove(tokens, selectedTokenId, die, 0);
                    }
                  }
                }}
                className={cn(
                  "liquid-btn !py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2",
                  phase === "move" && selectedTokenId
                    ? "!bg-gradient-to-r !from-amber-500 !to-yellow-500 !text-slate-950 shadow-[0_0_20px_#f59e0b]"
                    : "",
                )}
              >
                {phase === "move" && selectedTokenId ? (
                  <>
                    <Crosshair className="h-4 w-4 text-slate-950 animate-spin" />
                    <span>
                      Move Goti #{Number(selectedTokenId.split("-")[1]) + 1} (Enter / Space)
                    </span>
                  </>
                ) : turn === 0 && phase === "roll" ? (
                  <>
                    <Dice5 className="h-4 w-4 text-cyan-300" />
                    <span>Roll 4D Dice (Space / Enter)</span>
                  </>
                ) : (
                  <span>Wait for Turn</span>
                )}
              </button>

              <button
                type="button"
                disabled={movableList.length <= 1}
                onClick={() => {
                  if (movableList.length > 0) {
                    soundFX.playArrowNav();
                    const currentIndex = movableList.indexOf(selectedTokenId ?? "");
                    const nextIndex = (currentIndex + 1) % movableList.length;
                    setSelectedTokenId(movableList[nextIndex]);
                  }
                }}
                className="flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-black text-amber-300 border border-slate-800 hover:border-amber-400 disabled:opacity-40 transition-all cursor-pointer"
                title="Next Goti (Arrow Right / Down)"
              >
                <span className="hidden sm:inline">Next Goti</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-slate-400">
              ⌨️ Keyboard Controls:{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">←</kbd>{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">→</kbd>{" "}
              switch goti •{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                Space
              </kbd>{" "}
              /{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                Enter
              </kbd>{" "}
              roll & move!
            </p>
          </div>
        </div>

        {/* RIGHT CONTROLS PANEL */}
        <div className="space-y-4">
          {/* Match Status & 4D Holographic Dice (Feature #2) */}
          <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Match Terminal
            </p>
            <p className="text-sm font-semibold text-white border-l-2 border-primary pl-2 mb-4">
              {message}
            </p>

            <div className="flex items-center gap-4">
              {/* 4D Holographic Dice */}
              <div
                className={cn(
                  "dice-4d-holo flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-slate-950 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-300 to-purple-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]",
                  rolling && "rolling border-amber-400",
                  activeDiceSkin === "flame" && "border-orange-500 shadow-[0_0_30px_#f97316]",
                  activeDiceSkin === "electric" && "border-cyan-400 shadow-[0_0_30px_#22d3ee]",
                )}
              >
                {rolling ? "?" : (die ?? <Dice5 className="h-8 w-8 text-cyan-400" />)}
              </div>

              {/* Liquid Mercury Button (Feature #1) */}
              <button
                type="button"
                disabled={turn !== 0 || phase !== "roll" || rolling || winner !== null}
                onClick={() => {
                  soundFX.playLiquidRipple();
                  roll(0);
                }}
                className={cn(
                  "liquid-mercury-btn flex-1 h-20 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2",
                  (turn !== 0 || phase !== "roll" || rolling || winner !== null) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                <Sparkles className="h-4 w-4 text-cyan-300" />
                {rolling ? t.rolling : t.rollDice}
              </button>
            </div>
          </div>

          {/* Special Game Modes Toggles: Ghost Mode, Sudden Death, Time-Warp */}
          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800 space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Game Mode Power-Ups</span>
              <span className="text-[10px] text-cyan-400 font-mono">Turn: #{totalTurnCount}</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playTick();
                  setGhostMode((g) => !g);
                  toast.info(
                    ghostMode
                      ? "Ghost Mode Off"
                      : "👻 Ghost Mode On: Invisible Tokens every 3 turns!",
                  );
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition-all",
                  ghostMode
                    ? "border-purple-500 bg-purple-950/50 text-purple-300"
                    : "border-slate-800 bg-slate-950 text-slate-400",
                )}
              >
                <Eye className="h-4 w-4 mb-1" />
                Ghost
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playTick();
                  setSuddenDeath((s) => !s);
                  toast.warning(
                    suddenDeath
                      ? "Sudden Death Off"
                      : "🔥 Sudden Death Activated! Outer tiles burning!",
                  );
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition-all",
                  suddenDeath
                    ? "border-red-500 bg-red-950/50 text-red-300"
                    : "border-slate-800 bg-slate-950 text-slate-400",
                )}
              >
                <Flame className="h-4 w-4 mb-1 text-orange-400" />
                Sudden Death
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playTick();
                  setTimeWarp((w) => !w);
                  toast.info(timeWarp ? "Time-Warp Off" : "⚡ 2X Time-Warp Speed Activated!");
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition-all",
                  timeWarp
                    ? "border-amber-500 bg-amber-950/50 text-amber-300"
                    : "border-slate-800 bg-slate-950 text-slate-400",
                )}
              >
                <Zap className="h-4 w-4 mb-1 text-amber-400" />
                Time-Warp
              </button>
            </div>

            {/* Dynamic Betting Pool Selector (Feature #16) */}
            <div className="border-t border-slate-800/80 pt-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">Betting Pool Stakes (💎):</span>
                <span className="font-mono font-bold text-amber-400">
                  Pot: {bettingPool * 4} 💎
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[5, 10, 20, 50, 80, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      soundFX.playTick();
                      setBettingPool(amt);
                      toast.success(
                        `Betting Pool set to ${amt} 💎 each! Winner Pot: ${amt * 4} 💎!`,
                      );
                    }}
                    className={cn(
                      "py-1 rounded text-[11px] font-bold transition-all text-center",
                      bettingPool === amt
                        ? "bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_#f59e0b]"
                        : "bg-slate-800 text-slate-300 hover:text-white",
                    )}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Diamond Insurance Shield Toggle (Feature #12) */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-400" /> Insurance Shield
              </span>
              <button
                type="button"
                onClick={() => {
                  if (insuranceActive) {
                    setInsuranceActive(false);
                    toast.info("Diamond Insurance turned off");
                  } else {
                    if (spend(30, "Diamond Insurance Purchase")) {
                      setInsuranceActive(true);
                      toast.success(
                        "🛡️ Insurance Activated! Your diamonds are protected from token kills!",
                      );
                    } else {
                      toast.error("Diamonds kam hain (Needs 30 💎)");
                    }
                  }
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-black uppercase transition-all",
                  insuranceActive ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400",
                )}
              >
                {insuranceActive ? "Active" : "Buy (30 💎)"}
              </button>
            </div>
          </div>

          {/* Trash-Talk Audio Synthesizer Soundboard (Feature #36) */}
          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              {t.soundboard}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => triggerTrashTalk("Kya gunda banega re tu!", "Mafia")}
                className="liquid-btn !p-2 text-[11px] font-bold text-center !bg-slate-950 border border-slate-800 hover:border-cyan-400 truncate"
              >
                😂 Kya Gunda Banega
              </button>
              <button
                type="button"
                onClick={() => triggerTrashTalk("Waah beta mauj kardi!", "Anime")}
                className="liquid-btn !p-2 text-[11px] font-bold text-center !bg-slate-950 border border-slate-800 hover:border-cyan-400 truncate"
              >
                🔥 Mauj Kardi
              </button>
              <button
                type="button"
                onClick={() => triggerTrashTalk("Khatam, tata, bye bye, gaya!", "Robot")}
                className="liquid-btn !p-2 text-[11px] font-bold text-center !bg-slate-950 border border-slate-800 hover:border-cyan-400 truncate"
              >
                💀 Khatam Bye Bye
              </button>
              <button
                type="button"
                onClick={() => triggerTrashTalk("Goti kaat ke diamond loot liye!", "Monster")}
                className="liquid-btn !p-2 text-[11px] font-bold text-center !bg-slate-950 border border-slate-800 hover:border-cyan-400 truncate"
              >
                💎 11 Diamond Loot
              </button>
            </div>
          </div>

          {/* Live Streaming Dashboard & Tips (Feature #39) */}
          <div className="rounded-2xl bg-slate-900/60 p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio
                className={cn(
                  "h-4 w-4",
                  isLiveStreaming ? "text-red-500 animate-pulse" : "text-slate-500",
                )}
              />
              <div>
                <p className="text-xs font-bold text-white">Live Stream Broadcast</p>
                <p className="text-[10px] text-slate-400">
                  {isLiveStreaming ? "842 Spectators watching" : "Stream offline"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsLiveStreaming((s) => !s);
                if (!isLiveStreaming) {
                  toast.success("🔴 Broadcast Live! Spectators can send diamond tips!");
                  soundFX.playSpectatorBomb("cheer");
                }
              }}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-bold",
                isLiveStreaming ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300",
              )}
            >
              {isLiveStreaming ? "End Stream" : "Go Live"}
            </button>
          </div>

          {/* LOVE BIRDS ROMANCE & FEMALE 50 DIAMONDS DAILY BONUS */}
          <div className="rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-900/60 p-4 border border-pink-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-pink-500 fill-current animate-pulse" />
                Love Birds (Male ♂ ✕ Female ♀)
              </span>
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
                className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black border border-slate-700 text-slate-300 hover:text-white"
              >
                You: {userGender === "female" ? "♀ Female" : "♂ Male"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950/80 p-2.5 border border-pink-500/20 text-xs">
              <div>
                <p className="font-bold text-white flex items-center gap-1">
                  Partner:{" "}
                  <span className="text-pink-300">{loveBirdsPartner ?? "Simran ✨ (Matched)"}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Milestone: {loveBirdsCount} / 50 Matches Today
                </p>
              </div>
              <span className="text-2xl animate-bounce">🕊️💕</span>
            </div>

            {/* Live 10-Minute Requirement Timer */}
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3 text-cyan-400" /> Live Requirement (10m rule):
                </span>
                <span className="text-cyan-300 font-mono">
                  {Math.floor(dailyLiveSeconds / 60)}m {dailyLiveSeconds % 60}s / 10m
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (dailyLiveSeconds / 600) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                {dailyLiveSeconds >= 600
                  ? "✅ 10-minute live requirement completed! Ready to claim 50 💎!"
                  : "⏳ Roz kam se kam 10 minutes live rehna zaroori hai!"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                className="liquid-btn flex-1 !bg-gradient-to-r !from-pink-600 !to-purple-600 text-xs font-black uppercase text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                onClick={() => {
                  const res = claimLoveDividend();
                  if (res.ok) {
                    toast.success(res.message);
                  } else {
                    toast.error(res.message);
                  }
                }}
              >
                Claim 50 💎 Daily Bonus
              </Button>
              <Button
                variant="outline"
                className="border-pink-500/40 text-pink-300 hover:bg-pink-950/40 text-xs font-bold"
                onClick={() => {
                  if (spend(20, "Sent Love Fireworks to partner")) {
                    soundFX.playSpectatorBomb("cheer");
                    toast.success("💖 Love Fireworks sent to your Love Bird partner!");
                  } else {
                    toast.error("Diamonds kam hain!");
                  }
                }}
              >
                Gift 💖 (20 💎)
              </Button>
            </div>
          </div>

          {/* GLOBAL DESI TRASH-TALK SOUNDBOARD (Feature #36) */}
          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-400" />
                Desi Trash-Talk Voice Clips
              </span>
              <span className="text-[10px] text-slate-500 font-bold">1-Tap Audio</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                {
                  label: "Meri goti mat chhoona! 😎",
                  text: "Meri goti mat chhoona, varna 10 diamonds gayab!",
                  voice: "Mafia" as const,
                },
                {
                  label: "10 Diamonds Lootूंगा! 💎",
                  text: "Tayyar hoja! Teri goti kaat ke 10 diamonds lootunga!",
                  voice: "Monster" as const,
                },
                {
                  label: "Chakka laake dikha! 🎲",
                  text: "Dam hai toh abhi chakka laake dikha!",
                  voice: "Robot" as const,
                },
                {
                  label: "Bhai maaf karde! 😭",
                  text: "Bhai please goti mat kaatna, insurance nahi hai!",
                  voice: "Anime" as const,
                },
              ].map((taunt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    triggerTrashTalk(taunt.text, taunt.voice);
                    setMatchChatList((prev) => [
                      ...prev,
                      { from: "You 🗣️", text: taunt.label, frame: activeChatFrame, isYou: true },
                    ]);
                  }}
                  className="rounded-xl bg-slate-950 p-2 text-left text-[11px] font-bold text-slate-300 border border-slate-800 hover:border-amber-400 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span className="shrink-0">🎙️</span>
                  <span className="truncate">{taunt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Board */}
          <Button
            variant="outline"
            className="w-full border-slate-800 hover:bg-slate-900 text-xs font-bold uppercase tracking-wider"
            onClick={restart}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t.resetArena}
          </Button>
        </div>
      </div>

      {/* VICTORY MODAL WITH BREAKDANCE CELEBRATION (Feature #35) */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="mx-4 max-w-sm rounded-3xl border-2 border-cyan-400 bg-slate-950 p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-scale-in">
            <div className="text-6xl animate-bounce">🕺⚡🏆</div>
            <h2 className="neon-text mt-4 text-3xl font-black uppercase text-white tracking-tight">
              {winner === 0 ? "🏆 MATCH VICTORY!" : `${PLAYERS[winner]?.name} WINS!`}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-normal">
              {winner === 0
                ? `You crushed the opposition! Vault + Winner Pot of ${bettingPool * 4} 💎 credited to wallet!`
                : "Defeated this round! Activate Revenge Wheel or Rematch immediately."}
            </p>
            <Button
              className="liquid-mercury-btn mt-6 w-full font-black text-sm tracking-wider uppercase text-white"
              onClick={restart}
            >
              Play Next Match
            </Button>
          </div>
        </div>
      )}

      {/* GRAND JACKPOT WHEEL MODAL (Feature #50) */}
      {grandJackpotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="mx-4 max-w-sm rounded-3xl border-2 border-amber-400 bg-slate-950 p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-scale-in">
            <div className="text-6xl">🎰✨</div>
            <h2 className="neon-text mt-3 text-2xl font-black text-amber-400 uppercase">
              100-TURN MEGA JACKPOT!
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              You completed 100 turns in the Super Arena! Spin the Mega Crate for rare Dragon Skin &
              500 💎!
            </p>
            <Button
              className="liquid-btn mt-6 w-full !bg-amber-500 font-black text-slate-950"
              onClick={() => {
                earn(500, "100-Turn Mega Jackpot Crate");
                setTokenSkin("dragon");
                setGrandJackpotModal(false);
                soundFX.playSpectatorBomb("cheer");
                toast.success("🐉 Rare Fire Dragon Skin & 500 💎 Unlocked!");
              }}
            >
              Claim Mega Reward
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
