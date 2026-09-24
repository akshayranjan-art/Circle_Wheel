import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
// Plus, Rotate3d, Flame, Sparkles aur MessageSquare jaise premium controls ko add kiya
import { Dice5, Gem, RotateCcw, Trophy, Rotate3d, Flame, Sparkles, MessageSquare, Compass } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
// Slider ko add kiya taaki player 4 se 10 tak custom limit drag kar sake
import { Slider } from "@/components/ui/slider";
import {
  HOME_PATH,
  LAST_STEP,
  SAFE_TRACK_INDEXES,
  START_INDEX,
  TRACK,
  YARD,
  applyMove,
  createTokens,
  hasWon,
  legalMoves,
  pickBotMove,
  rollDie,
  tokenCell,
  type PlayerId,
  type Token,
} from "@/lib/ludo-engine";
export const Route = createFileRoute("/ludo")({
  head: () => ({
    meta: [
      { title: "Super Ludo 360 Arena — Orbit" },
      {
        name: "description",
        content: "Play live Ludo with 360° rotation, 4-10 Mega Dice power-ups, and massive prize vault drops.",
      },
      { property: "og:title", content: "Super Ludo 360 Arena — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LudoPage,
});

const PLAYERS = [
  { id: 0 as PlayerId, name: "You", color: "var(--ludo-0)", bot: false },
  { id: 1 as PlayerId, name: "Nova (Bot)", color: "var(--ludo-1)", bot: true },
  { id: 2 as PlayerId, name: "Zex (Bot)", color: "var(--ludo-2)", bot: true },
  { id: 3 as PlayerId, name: "Kiro (Bot)", color: "var(--ludo-3)", bot: true },
];

const CAPTURE_REWARD = 11;
const HOME_REWARD = 25;
const WIN_REWARD = 111;

const cellKey = (r: number, c: number) => `${r},${c}`;

type CellStyle = { bg: string; border?: boolean; safe?: boolean };

const CELL_MAP = new Map<string, CellStyle>();

TRACK.forEach(([r, c], index) => {
  const owner = ([0, 1, 2, 3] as PlayerId[]).find(
    (p) => START_INDEX[p] === index
  );

  CELL_MAP.set(cellKey(r, c), {
    bg: owner !== undefined ? `var(--ludo-${owner})` : "var(--card)",
    border: true,
    safe: SAFE_TRACK_INDEXES.has(index),
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

function LudoPage() {
  const { diamonds, earn, recordCapture, recordWin } = useWallet();
  const [tokens, setTokens] = useState<Token[]>(createTokens);
  const [turn, setTurn] = useState<PlayerId>(0);
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [phase, setPhase] = useState<"roll" | "move">("roll");
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [message, setMessage] = useState("Your turn — roll the dice!");
  const [lastEarned, setLastEarned] = useState(0);

  // NAYE DASHU FEATURES KE STATES CONFIGURATION
  const [boardRotation, setBoardRotation] = useState<number>(0); 
  const [dicePowerCap, setDicePowerCap] = useState<number>(6); 
  const [cameraViewMode, setCameraViewMode] = useState<"Standard" | "Drone" | "Token-Eye">("Standard"); 
  const [bountyTarget, setBountyTarget] = useState<PlayerId | null>(null); 
  
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const nextTurn = useCallback((from: PlayerId, again: boolean) => {
    setDie(null);
    setPhase("roll");
    setTurn(again ? from : (((from + 1) % 4) as PlayerId));
  }, []);

  const resolveMove = useCallback(
    (state: Token[], tokenId: string, value: number, player: PlayerId) => {
      const result = applyMove(state, tokenId, value);
      setTokens(result.tokens);

      // Super high numbers (9 aur 10) par bhi player ko extra bonus turn milega!
      let again = value === 6 || value >= 9;
      if (result.captured.length) {
        again = true;
        // Agar kisi bot ne aapki goti kaati, toh us bot par Revenge Bounty lock ho jayegi
        if (player !== 0 && result.captured.some(c => c.player === 0)) {
          setBountyTarget(player);
          toast.error(`🔥 BOUNTY LOCK: Player ${PLAYERS[player]?.name} targeted for revenge!`);
        }
      }
      if (result.reachedHome) again = true;

      if (player === 0) {
        let reward = 0;
        if (result.captured.length) {
          // Badla multiplier logic: target bot ki goti kaatne par 3x triple rewards milenge!
          const isBountyHit = bountyTarget !== null && result.captured.some(c => c.player === bountyTarget);
          const calculatedReward = isBountyHit ? CAPTURE_REWARD * 3 : CAPTURE_REWARD;
          
          reward += result.captured.length * calculatedReward;
          recordCapture(result.captured.length);
          
          if (isBountyHit) {
            setBountyTarget(null); // Badla pura hone par target hat jayega
            toast.success("💥 REVENGE TAKEN! Triple Diamond Bounty Claimed!");
          }
        }
        if (result.reachedHome) reward += HOME_REWARD;
        if (reward > 0) {
          earn(reward, result.captured.length ? "Token cut bounty win" : "Token reached home base");
          setLastEarned(reward);
          later(() => setLastEarned(0), 1600);
          toast.success(`+${reward} 💎 Dynamic Prize Added!`);
        }
      }

      if (hasWon(result.tokens, player)) {
        setWinner(player);
        setDie(null);
        if (player === 0) {
          earn(WIN_REWARD, "Ludo match won");
          recordWin();
          toast.success(`Victory! Mega Prize Vault Unlocked: +${WIN_REWARD} 💎`);
        }
        return;
      }

      later(() => nextTurn(player, again), 350);
    },
    [earn, later, nextTurn, recordCapture, recordWin, bountyTarget],
  );

  const roll = useCallback(
    (player: PlayerId) => {
      if (winner !== null || rolling) return;
      setRolling(true);
      let ticks = 0;
      const spin = setInterval(() => {
        setDie(Math.floor(Math.random() * dicePowerCap) + 1);
        ticks += 1;
        if (ticks > 7) {
          clearInterval(spin);
          const value = Math.floor(Math.random() * dicePowerCap) + 1;
          setDie(value);
          setRolling(false);
          
          const moves = legalMoves(tokens, player, value);
          if (moves.length === 0) {
            setMessage(
              player === 0 
                ? `Rolled a massive ${value} — no move tracks available` 
                : `${PLAYERS[player]!.name} rolled ${value}, stuck`
            );
            later(() => nextTurn(player, false), 700);
            return;
          }
          setPhase("move");
          setMessage(
            player === 0
              ? `Rolled ${value} — pick your premium token`
              : `${PLAYERS[player]!.name} rolled ${value}`,
          );
        }
      }, 60);
    },
    [later, nextTurn, rolling, tokens, winner, dicePowerCap],
  );

  // Bot process loop animations
  useEffect(() => {
    if (winner !== null) return;
    const player = PLAYERS[turn]!;
    if (!player.bot) {
      if (phase === "roll") setMessage("Your ultimate turn — roll the dice booster!");
      return;
    }
    if (phase === "roll") {
      later(() => roll(turn), 650);
    } else if (phase === "move" && die) {
      later(() => {
        const choice = pickBotMove(tokens, turn, die);
        if (!choice) {
          nextTurn(turn, false);
          return;
        }
        resolveMove(tokens, choice.id, die, turn);
      }, 600);
    }
  }, [turn, phase, die, tokens, winner, roll, later, nextTurn, resolveMove]);

  const movable =
    turn === 0 && phase === "move" && die
      ? new Set(legalMoves(tokens, 0, die).map((t) => t.id))
      : new Set<string>();

  const onTokenClick = (token: Token) => {
    if (!movable.has(token.id) || !die) return;
    resolveMove(tokens, token.id, die, 0);
  };

  const triggerMemeSound = (memeText: string) => {
    toast.info(`🎭 Sound Emoji Triggered: "${memeText}"`, { duration: 1500 });
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
    setMessage("Board reset. Roll for victory!");
  };

  const slotOf = (token: Token) => Number(token.id.split("-")[1]);
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-56 pt-12 transition-all duration-700">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> 360° Quantum Ludo Live Arena
          </p>
          <h1 className="neon-text mt-2 text-3xl font-black tracking-tight sm:text-4xl bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            Super Ludo Arena
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {bountyTarget !== null && (
            <div className="bg-red-950/60 border border-red-500/40 text-red-400 text-xs px-3 py-1.5 rounded-full font-bold animate-bounce">
              🎯 REVENGE BOUNTY ON: {PLAYERS[bountyTarget]?.name}
            </div>
          )}
          <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-2.5 bg-slate-900/80 border border-primary/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Gem className="h-5 w-5 text-primary animate-spin-slow" />
            <span className="text-base font-black tabular-nums text-white">{diamonds}</span>
            {lastEarned > 0 && (
              <span className="animate-fade-in text-xs font-bold text-primary">
                +{lastEarned}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
  <div className="flex flex-col items-center justify-center">
    <div
      style={{
        transform: `rotate(${boardRotation}deg) scale(${
          cameraViewMode === "Drone"
            ? 0.9
            : cameraViewMode === "Token-Eye"
            ? 1.05
            : 1
        })`,
        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className={cn(
        "neon-panel relative aspect-square w-full overflow-hidden rounded-3xl p-3 bg-slate-950 transition-all duration-500",
        cameraViewMode === "Token-Eye" &&
          "border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.35)]"
      )}
    >
      <div className="relative h-full w-full">
        {/* Sabhi 4 players ke Yards */}
        {([0, 1, 2, 3] as PlayerId[]).map((p) => {
          const [top, left] =
            p === 0
              ? [0, 0]
              : p === 1
              ? [0, 9]
              : p === 2
              ? [9, 9]
              : [9, 0];

          return (
            <div
              key={`yard-${p}`}
              className={cn(
                "absolute rounded-2xl border-2 transition-all duration-500",
                turn === p &&
                  winner === null &&
                  "shadow-[0_0_32px_var(--ludo-glow)] border-white scale-[1.01]"
              )}
              style={
                {
                  top: `${(top / 15) * 100}%`,
                  left: `${(left / 15) * 100}%`,
                  width: `${(6 / 15) * 100}%`,
                  height: `${(6 / 15) * 100}%`,
                  background: `color-mix(in oklab, var(--ludo-${p}) 22%, transparent)`,
                  borderColor: `var(--ludo-${p})`,
                  "--ludo-glow": `var(--ludo-${p})`,
                } as React.CSSProperties
              }
            >
              <div className="absolute inset-[18%] rounded-xl border border-border/40 bg-slate-950/40" />
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>
{/* 360° Orbit Rotational Controls Dock Bar */}
<div className="w-full max-w-[520px] mt-4 flex items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 backdrop-blur">
  <div className="flex items-center gap-1">
    <Rotate3d className="w-4 h-4 text-cyan-400 mr-1 animate-spin-slow" />

    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs font-bold"
      onClick={() => setBoardRotation((prev) => prev - 90)}
    >
      -90°
    </Button>

    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs font-bold"
      onClick={() => setBoardRotation(0)}
    >
      Center
    </Button>

    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs font-bold"
      onClick={() => setBoardRotation((prev) => prev + 90)}
    >
      +90°
    </Button>
  </div>

  <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
    <Compass className="w-4 h-4 text-purple-400 mr-1" />

    {(["Standard", "Drone", "Token-Eye"] as const).map((mode) => (
      <Button
        key={mode}
        size="sm"
        variant={cameraViewMode === mode ? "default" : "ghost"}
        onClick={() => setCameraViewMode(mode)}
        className="text-[11px] h-7 px-2.5 font-bold"
      >
        {mode}
      </Button>
    ))}
  </div>
</div>

{/* Right Dynamic Controls & Soundboards Panel */}
<div className="space-y-4">
  <div className="neon-panel rounded-2xl p-4 bg-slate-900/80 border border-slate-800">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
      Match Status
    </p>

    <p className="text-sm font-semibold text-white border-l-2 border-primary pl-2 mb-4">
      {message}
    </p>

    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-primary bg-slate-950 text-3xl font-black tabular-nums transition-all text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-300 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]",
          rolling && "animate-spin scale-110 border-amber-400"
        )}
      >
        {rolling ? "?" : (die ?? <Dice5 className="h-8 w-8 text-purple-400/80" />)}
      </div>

      <Button
        className="flex-1 h-20 text-base font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-xl border border-purple-400/20"
        disabled={turn !== 0 || phase !== "roll" || rolling || winner !== null}
        onClick={() => roll(0)}
      >
        {rolling ? "BOOSTING..." : "BOOSTER ROLL"}
      </Button>
    </div>
  </div>
</div>

          {/* Custom 4 to 10 Dice Maximum Power Slider Bar */}
<div className="mt-5 border-t border-slate-800/80 pt-4">
  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
    <span className="text-amber-400 flex items-center gap-1">
      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
      Dice Custom Limit:
    </span>

    <span className="text-cyan-400 font-black">
      {dicePowerCap} Max Bound
    </span>
  </div>

  <Slider
    value={[dicePowerCap]}
    min={6}
    max={10}
    step={1}
    onValueChange={([v]) => {
      setDicePowerCap(v ?? 6);
      toast.success(`🎲 Dice Max Output set to ${v}!`);
    }}
    className="py-1"
  />

  <p className="text-[10px] text-slate-500 mt-1">
    Boost boundary counts up to 10 for lightning fast terminal progression.
  </p>
</div>

{/* Interactive Meme Audio Drop Soundboard Trigger Grid */}
<div className="neon-panel rounded-2xl p-4 bg-slate-900/40 border border-slate-800">
  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
    Live Chat Sound Memes
  </p>

  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => triggerMemeSound("Kya Gunda Banega Re Tu 🎭")}
      className="text-[11px] bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 p-2.5 rounded-xl transition-all font-semibold truncate hover:text-white"
    >
      😂 Kya Gunda Banega
    </button>

    <button
      type="button"
      onClick={() => triggerMemeSound("Arre Mujhe Chakkar Aane Laga 🌀")}
      className="text-[11px] bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 p-2.5 rounded-xl transition-all font-semibold truncate hover:text-white"
    >
      🌀 Chakkar Aane Laga
    </button>

    <button
      type="button"
      onClick={() => triggerMemeSound("Waah Beta Mauj Kardi 🔥")}
      className="text-[11px] bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 p-2.5 rounded-xl transition-all font-semibold truncate hover:text-white"
    >
      🔥 Mauj Kardi
    </button>

    <button
      type="button"
      onClick={() => triggerMemeSound("Bhaisaab Yeh Kya Hua 😳")}
      className="text-[11px] bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 p-2.5 rounded-xl transition-all font-semibold truncate hover:text-white"
    >
      😳 Yeh Kya Hua
    </button>
  </div>
</div>

          {/* Score Ledger Board list tracking */}
          <div className="neon-panel space-y-2 rounded-2xl p-4 bg-slate-900/50 border border-slate-800">
            {PLAYERS.map((p) => {
              const home = tokens.filter(
                (t) => t.player === p.id && t.pos === LAST_STEP,
              ).length;
              const isTargeted = bountyTarget === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-300 border border-transparent",
                    turn === p.id && winner === null && "bg-slate-950 border-purple-500/20 shadow-sm",
                    isTargeted && "border-red-500/40 bg-red-950/20"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                    />
                    <span className={cn(p.id === 0 ? "text-cyan-400 font-bold" : "text-slate-200")}>{p.name}</span>
                  </span>
                  <span className="text-xs font-black text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800/60 font-mono">
                    {home}/4 HOME
                  </span>
                </div>
              );
            })}
          </div>

          {/* Premium Vault Reward Descriptions Ledger Grid */}
          <div className="neon-panel rounded-2xl p-4 text-xs leading-relaxed text-slate-400 bg-slate-950/90 border border-slate-800/80 shadow-inner">
            <p className="mb-2 text-sm font-black text-white uppercase tracking-wider flex items-center gap-1">
              🎁 Prize Engine Ledger
            </p>
            Base Token Cut: <b className="text-primary font-bold">+11 💎</b>
            <br />
            Active Revenge Target Cut: <b className="text-amber-400 font-extrabold">+33 💎 (3x Multiplier Boost)</b>
            <br />
            Token Home Base Safe: <b className="text-primary font-bold">+25 💎</b>
            <br />
            Ultimate Match Victory Drop: <b className="text-amber-400 font-black">+111 💎 Cash Drop</b>
          </div>

       <Button
  variant="outline"
  className="w-full border-slate-800 hover:bg-slate-900 font-bold text-xs uppercase"
  onClick={restart}
>
  <RotateCcw className="mr-2 h-4 w-4" />
  Reset Super Arena
</Button>

{winner !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
    <div className="neon-panel animate-scale-in mx-4 rounded-3xl p-8 text-center bg-slate-950 border border-primary/40 max-w-sm shadow-[0_0_40px_rgba(168,85,247,0.35)]">
      <Trophy className="mx-auto h-14 w-14 text-amber-400 stroke-[2] animate-bounce" />

      <h2 className="neon-text mt-4 text-2xl font-black tracking-tight text-white uppercase">
        {winner === 0
          ? "🏆 Match Victory!"
          : `${PLAYERS[winner]!.name} Wins!`}
      </h2>

      <p className="mt-2 text-sm text-slate-400 leading-normal">
        {winner === 0
          ? "Ultimate Match Prize Vault unlocked successfully. +111 diamonds updated in active session."
          : "Opponent token cleared the perimeter terminal first. Re-adjust setups for the next battle!"}
      </p>

      <Button
        className="mt-6 w-full font-black text-sm tracking-wide bg-primary text-white hover:bg-primary/90"
        onClick={restart}
      >
        Launch Next Match
      </Button>
    </div>
  </div>
)}
    </main>
  );
}
