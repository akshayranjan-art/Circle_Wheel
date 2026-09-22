import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dice5, Gem, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
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
      { title: "Ludo Live — Orbit" },
      {
        name: "description",
        content:
          "Play live Ludo against three bots, earn 11 diamonds for every token you cut.",
      },
      { property: "og:title", content: "Ludo Live — Orbit" },
      {
        property: "og:description",
        content:
          "Play live Ludo against three bots, earn 11 diamonds for every token you cut.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LudoPage,
});

const PLAYERS = [
  { id: 0 as PlayerId, name: "You", color: "var(--ludo-0)", bot: false },
  { id: 1 as PlayerId, name: "Nova", color: "var(--ludo-1)", bot: true },
  { id: 2 as PlayerId, name: "Zex", color: "var(--ludo-2)", bot: true },
  { id: 3 as PlayerId, name: "Kiro", color: "var(--ludo-3)", bot: true },
];

const CAPTURE_REWARD = 11;
const HOME_REWARD = 25;
const WIN_REWARD = 111;

const cellKey = (r: number, c: number) => `${r},${c}`;

type CellStyle = { bg: string; border?: boolean; safe?: boolean };

const CELL_MAP = new Map<string, CellStyle>();
TRACK.forEach(([r, c], index) => {
  const owner = ([0, 1, 2, 3] as PlayerId[]).find(
    (p) => START_INDEX[p] === index,
  );
  CELL_MAP.set(cellKey(r, c), {
    bg: owner !== undefined ? `var(--ludo-${owner})` : "var(--card)",
    border: true,
    safe: SAFE_TRACK_INDEXES.has(index),
  });
});
([0, 1, 2, 3] as PlayerId[]).forEach((p) => {
  HOME_PATH[p].slice(0, 5).forEach(([r, c]) => {
    CELL_MAP.set(cellKey(r, c), { bg: `var(--ludo-${p})`, border: true });
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

      let again = value === 6;
      if (result.captured.length) again = true;
      if (result.reachedHome) again = true;

      if (player === 0) {
        let reward = 0;
        if (result.captured.length) {
          reward += result.captured.length * CAPTURE_REWARD;
          recordCapture(result.captured.length);
        }
        if (result.reachedHome) reward += HOME_REWARD;
        if (reward > 0) {
          earn(reward, result.captured.length ? "Token cut in Ludo" : "Token reached home");
          setLastEarned(reward);
          later(() => setLastEarned(0), 1600);
          toast.success(`+${reward} 💎`, {
            description: result.captured.length
              ? `${result.captured.length} token cut — ${CAPTURE_REWARD} diamonds each`
              : "Token home safe",
          });
        }
      }

      if (hasWon(result.tokens, player)) {
        setWinner(player);
        setDie(null);
        if (player === 0) {
          earn(WIN_REWARD, "Ludo match won");
          recordWin();
          toast.success(`Victory! +${WIN_REWARD} 💎`);
        }
        return;
      }

      later(() => nextTurn(player, again), 350);
    },
    [earn, later, nextTurn, recordCapture, recordWin],
  );

  const roll = useCallback(
    (player: PlayerId) => {
      if (winner !== null || rolling) return;
      setRolling(true);
      let ticks = 0;
      const spin = setInterval(() => {
        setDie(rollDie());
        ticks += 1;
        if (ticks > 7) {
          clearInterval(spin);
          const value = rollDie();
          setDie(value);
          setRolling(false);
          const moves = legalMoves(tokens, player, value);
          if (moves.length === 0) {
            setMessage(
              player === 0 ? `Rolled ${value} — no move available` : `${PLAYERS[player]!.name} rolled ${value}, stuck`,
            );
            later(() => nextTurn(player, value === 6 && false), 700);
            return;
          }
          setPhase("move");
          setMessage(
            player === 0
              ? `Rolled ${value} — pick a token`
              : `${PLAYERS[player]!.name} rolled ${value}`,
          );
        }
      }, 60);
    },
    [later, nextTurn, rolling, tokens, winner],
  );

  // Bot loop
  useEffect(() => {
    if (winner !== null) return;
    const player = PLAYERS[turn]!;
    if (!player.bot) {
      if (phase === "roll") setMessage("Your turn — roll the dice!");
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

  const restart = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTokens(createTokens());
    setTurn(0);
    setDie(null);
    setPhase("roll");
    setWinner(null);
    setMessage("Your turn — roll the dice!");
  };

  const slotOf = (token: Token) => Number(token.id.split("-")[1]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-56 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Live Arena
          </p>
          <h1 className="neon-text mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Ludo Live
          </h1>
        </div>
        <div className="neon-panel flex items-center gap-2 rounded-full px-4 py-2">
          <Gem className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold tabular-nums">{diamonds}</span>
          {lastEarned > 0 && (
            <span className="animate-fade-in text-xs font-bold text-primary">
              +{lastEarned}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Board */}
        <div className="neon-panel relative aspect-square w-full overflow-hidden rounded-3xl p-2">
          <div className="relative h-full w-full">
            {/* yards */}
            {([0, 1, 2, 3] as PlayerId[]).map((p) => {
              const [top, left] =
                p === 0 ? [0, 0] : p === 1 ? [0, 9] : p === 2 ? [9, 9] : [9, 0];
              return (
                <div
                  key={`yard-${p}`}
                  className={cn(
                    "absolute rounded-2xl border-2 transition-shadow duration-500",
                    turn === p && winner === null && "shadow-[0_0_28px_var(--ludo-glow)]",
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
                  <div className="absolute inset-[18%] rounded-xl border border-border/50 bg-background/40" />
                </div>
              );
            })}

            {/* track + home cells */}
            {Array.from({ length: 15 }).flatMap((_, r) =>
              Array.from({ length: 15 }).map((_, c) => {
                const style = CELL_MAP.get(cellKey(r, c));
                if (!style) return null;
                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className="absolute rounded-[3px] border border-border/60"
                    style={{
                      top: `${(r / 15) * 100}%`,
                      left: `${(c / 15) * 100}%`,
                      width: `${(1 / 15) * 100}%`,
                      height: `${(1 / 15) * 100}%`,
                      background: style.bg,
                      boxShadow: style.safe
                        ? "inset 0 0 0 2px color-mix(in oklab, var(--primary) 70%, transparent)"
                        : undefined,
                    }}
                  />
                );
              }),
            )}

            {/* center home */}
            <div
              className="absolute flex items-center justify-center rounded-lg border border-border/60"
              style={{
                top: `${(6 / 15) * 100}%`,
                left: `${(6 / 15) * 100}%`,
                width: `${(3 / 15) * 100}%`,
                height: `${(3 / 15) * 100}%`,
                background:
                  "conic-gradient(var(--ludo-0) 0 25%, var(--ludo-1) 0 50%, var(--ludo-2) 0 75%, var(--ludo-3) 0)",
              }}
            >
              <Trophy className="h-1/3 w-1/3 text-background" />
            </div>

            {/* tokens */}
            {tokens.map((token) => {
              const [r, c] = tokenCell(token, slotOf(token));
              const active = movable.has(token.id);
              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => onTokenClick(token)}
                  disabled={!active}
                  aria-label={`${PLAYERS[token.player]!.name} token`}
                  className={cn(
                    "absolute z-10 rounded-full border-2 border-background/70 transition-all duration-500 ease-[cubic-bezier(0.22,1.2,0.36,1)]",
                    active && "z-20 animate-pulse ring-2 ring-primary",
                    token.pos === LAST_STEP && "opacity-80",
                  )}
                  style={{
                    top: pct(r),
                    left: pct(c),
                    width: "5.4%",
                    height: "5.4%",
                    transform: "translate(-50%, -50%)",
                    background: `var(--ludo-${token.player})`,
                    boxShadow: `0 0 12px var(--ludo-${token.player})`,
                    cursor: active ? "pointer" : "default",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="neon-panel rounded-2xl p-4">
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="mt-4 flex items-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary/60 bg-card text-2xl font-black tabular-nums transition-transform duration-200",
                  rolling && "scale-110",
                )}
              >
                {die ?? <Dice5 className="h-7 w-7 text-muted-foreground" />}
              </div>
              <Button
                className="flex-1"
                disabled={turn !== 0 || phase !== "roll" || rolling || winner !== null}
                onClick={() => roll(0)}
              >
                Roll dice
              </Button>
            </div>
          </div>

          <div className="neon-panel space-y-2 rounded-2xl p-4">
            {PLAYERS.map((p) => {
              const home = tokens.filter(
                (t) => t.player === p.id && t.pos === LAST_STEP,
              ).length;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 transition-colors duration-300",
                    turn === p.id && winner === null && "bg-accent",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                    />
                    {p.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{home}/4 home</span>
                </div>
              );
            })}
          </div>

          <div className="neon-panel rounded-2xl p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-2 text-sm font-semibold text-foreground">Rewards</p>
            Cut a token: <b className="text-primary">+11 💎</b>
            <br />
            Token reaches home: <b className="text-primary">+25 💎</b>
            <br />
            Win the match: <b className="text-primary">+111 💎</b>
          </div>

          <Button variant="outline" className="w-full" onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" /> New match
          </Button>
        </div>
      </div>

      {winner !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 backdrop-blur-md">
          <div className="neon-panel animate-scale-in mx-4 rounded-3xl p-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-primary" />
            <h2 className="neon-text mt-4 text-2xl font-bold">
              {winner === 0 ? "You win!" : `${PLAYERS[winner]!.name} wins`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {winner === 0
                ? `+${WIN_REWARD} diamonds added to your wallet.`
                : "Better luck in the next match."}
            </p>
            <Button className="mt-6" onClick={restart}>
              Play again
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
