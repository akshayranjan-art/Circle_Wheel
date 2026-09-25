import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Crown, Sparkles, Trophy, Flame, Swords, ShieldCheck } from "lucide-react";
import { useWallet } from "@/components/wallet-provider";
import { soundFX } from "@/lib/sound-fx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboards, Hall of Fame & Mega Tournaments — Orbit Ludo" },
      {
        name: "description",
        content:
          "Weekly Wealth Leaderboard with Emperor Gold Crown, Highest Spin Winner Hall of Fame, and Mega Knockout Tournaments.",
      },
      {
        property: "og:title",
        content: "Leaderboards, Hall of Fame & Mega Tournaments — Orbit Ludo",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Board,
});

const NAMES = [
  "Raja King",
  "Neon Queen",
  "Ludo Baadshah",
  "Priya ✨",
  "Viking Ak",
  "Cyber Sher",
  "Goti Killer",
  "Rani 💖",
  "Dice Don",
  "Toofan",
  "Chand Tara",
  "Blaze",
];

const PERIODS = { Daily: 1, Weekly: 7, Monthly: 30 } as const;

function seeded(seed: number) {
  return () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
}

function Board() {
  const { wins, captures, history } = useWallet();
  const [period, setPeriod] = useState<keyof typeof PERIODS>("Weekly");
  const [kind, setKind] = useState<"Winners" | "Looters" | "Spenders">("Looters");
  const [activeTab, setActiveTab] = useState<"leaderboard" | "hallOfFame" | "tournaments">(
    "leaderboard",
  );

  const rows = useMemo(() => {
    const m = PERIODS[period];
    const rnd = seeded(m * 17 + (kind === "Winners" ? 1 : kind === "Looters" ? 3 : 2));
    const list = NAMES.map((n) => ({
      name: n,
      score: Math.floor(
        (kind === "Winners" ? 25 : kind === "Looters" ? 480 : 3500) * m * (0.35 + rnd()),
      ),
      you: false,
    }));
    const spent = history.filter((h) => h.amount < 0).reduce((a, h) => a - h.amount, 0);
    const myScore = kind === "Winners" ? wins : kind === "Looters" ? captures * 11 : spent;
    list.push({ name: "You", score: myScore, you: true });
    list.sort((a, b) => b.score - a.score);
    return list;
  }, [period, kind, wins, captures, history]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-48 pt-10">
      {/* Hall of Fame & Emperor Crown Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-amber-400 animate-bounce" /> Hall of Champions
          </p>
          <h1 className="neon-text mt-1 text-3xl font-black text-white sm:text-4xl">
            Ludo Hall of Fame 🏆
          </h1>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              soundFX.playTick();
              setActiveTab("leaderboard");
            }}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "leaderboard"
                ? "bg-primary text-slate-950 font-black shadow"
                : "bg-slate-900 text-slate-400",
            )}
          >
            Unstoppable Board
          </button>
          <button
            onClick={() => {
              soundFX.playTick();
              setActiveTab("hallOfFame");
            }}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "hallOfFame"
                ? "bg-primary text-slate-950 font-black shadow"
                : "bg-slate-900 text-slate-400",
            )}
          >
            Spin Hall of Fame 🎰
          </button>
          <button
            onClick={() => {
              soundFX.playTick();
              setActiveTab("tournaments");
            }}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "tournaments"
                ? "bg-primary text-slate-950 font-black shadow"
                : "bg-slate-900 text-slate-400",
            )}
          >
            Mega Tournaments ⚔️
          </button>
        </div>
      </div>

      {/* SECTION 4: Highest Spin Winner Hall of Fame (Feature #31) */}
      {activeTab === "hallOfFame" && (
        <div className="mt-6 flex flex-col items-center">
          <div className="w-full max-w-md rounded-3xl border-2 border-amber-400 bg-slate-950 p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-scale-in">
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-950/40 text-6xl shadow-[0_0_30px_#f59e0b] animate-pulse">
              👑
              <span className="absolute -bottom-2 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black text-slate-950 uppercase">
                4D GOD TIER
              </span>
            </div>
            <h2 className="neon-text mt-4 text-2xl font-black text-amber-300">
              Viking Ak (Ludo Emperor)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Biggest Daily Fate Wheel Jackpot: <b className="text-amber-400">2,000 💎</b>
            </p>
            <div className="mt-4 rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Wearing the legendary <b>"Ludo Emperor Gold Crown"</b> in live 8-seat voice rooms! All
              players bow to the wheel master!
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Weekly Mega Tournaments Knockout Bracket (Feature #38) */}
      {activeTab === "tournaments" && (
        <div className="mt-6 rounded-3xl bg-slate-900/60 p-6 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="neon-text text-xl font-black text-white flex items-center gap-2">
                <Swords className="h-5 w-5 text-cyan-400" /> Sunday Knockout Mega Event
              </h3>
              <p className="text-xs text-slate-400">Prize Pool: 100,000 💎 • 64 Knockout Slots</p>
            </div>
            <Button
              className="liquid-btn text-xs font-black"
              onClick={() => {
                soundFX.playSpectatorBomb("cheer");
                toast.success(
                  "🏆 Registered for Sunday Mega Tournament! Knockout bracket slot reserved!",
                );
              }}
            >
              Free Tournament Entry
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-slate-950 p-3 border border-cyan-500/30">
              <span className="text-xs text-slate-500">Quarterfinals</span>
              <p className="text-sm font-bold text-white mt-1">You vs Zex Bot</p>
              <span className="text-[10px] text-emerald-400 font-bold">READY</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-xs text-slate-500">Semifinals</span>
              <p className="text-sm font-bold text-slate-400 mt-1">Winner of QF1/2</p>
              <span className="text-[10px] text-amber-400 font-bold">PENDING</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-xs text-slate-500">Grand Finals</span>
              <p className="text-sm font-bold text-slate-400 mt-1">Championship</p>
              <span className="text-[10px] text-purple-400 font-bold">50,000 💎 POT</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 border border-amber-500/50 bg-amber-950/20">
              <span className="text-xs text-amber-400 font-black">CHAMPION CROWN</span>
              <p className="text-sm font-bold text-amber-300 mt-1">Ludo Emperor</p>
              <span className="text-[10px] text-amber-300 font-bold">VIP Status</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: The Unstoppable Daily / Weekly / Monthly Boards (Feature #32 & #18) */}
      {activeTab === "leaderboard" && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
              {(["Daily", "Weekly", "Monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    soundFX.playTick();
                    setPeriod(p);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition-all",
                    period === p
                      ? "bg-primary text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
              {(["Looters", "Winners", "Spenders"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    soundFX.playTick();
                    setKind(k);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition-all",
                    kind === k
                      ? "bg-primary text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {k === "Looters" ? "11-Diamond Looters 💥" : k}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {rows.map((r, i) => (
              <div
                key={r.name}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 border transition-all",
                  r.you
                    ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "border-slate-800 bg-slate-900/60",
                  i === 0 && "border-amber-400/80 bg-amber-950/20",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
                      i === 0
                        ? "bg-amber-400 text-slate-950 shadow"
                        : i === 1
                          ? "bg-slate-300 text-slate-950"
                          : i === 2
                            ? "bg-amber-700 text-white"
                            : "text-slate-500",
                    )}
                  >
                    {i === 0 ? "👑" : i + 1}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-black",
                        r.you ? "text-cyan-300 font-extrabold" : "text-white",
                      )}
                    >
                      {r.name} {r.you && "(Aap)"}
                    </p>
                    {i === 0 && (
                      <span className="text-[10px] text-amber-400 font-bold">
                        Ludo Emperor Gold Crown Winner
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-mono text-xs font-black text-cyan-400">
                  {r.score.toLocaleString()} {kind === "Winners" ? "Wins" : "💎"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
