import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useWallet } from "@/components/wallet-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Orbit Ludo Champions" },
      { name: "description", content: "Top winners and highest spenders — daily, weekly and monthly Ludo rankings." },
      { property: "og:title", content: "Leaderboard — Orbit Ludo Champions" },
      { property: "og:description", content: "Daily, weekly and monthly winners and top spenders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Board,
});

const NAMES = ["Raja King", "Neon Queen", "Ludo Baadshah", "Priya ✨", "Viking Ak", "Cyber Sher", "Goti Killer", "Rani 💖", "Dice Don", "Toofan", "Chand Tara", "Blaze"];
const PERIODS = { Daily: 1, Weekly: 7, Monthly: 30 } as const;

function seeded(seed: number) {
  return () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
}

function Board() {
  const { wins, diamonds, history } = useWallet();
  const [period, setPeriod] = useState<keyof typeof PERIODS>("Weekly");
  const [kind, setKind] = useState<"Winners" | "Spenders">("Winners");

  const rows = useMemo(() => {
    const m = PERIODS[period];
    const rnd = seeded(m * 17 + (kind === "Winners" ? 1 : 2));
    const list = NAMES.map((n) => ({
      name: n,
      score: Math.floor((kind === "Winners" ? 20 : 3000) * m * (0.3 + rnd())),
      you: false,
    }));
    const spent = history.filter((h) => h.amount < 0).reduce((a, h) => a - h.amount, 0);
    list.push({ name: "You", score: kind === "Winners" ? wins : spent, you: true });
    return list.sort((a, b) => b.score - a.score);
  }, [period, kind, wins, history]);

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-12">
      <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-primary">Hall of fame</p>
      <h1 className="neon-text mt-2 text-center text-4xl font-black">Leaderboard</h1>

      <div className="mt-6 flex justify-center gap-2">
        {(["Winners", "Spenders"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("rounded-full px-4 py-1.5 text-sm font-bold", kind === k ? "liquid-btn py-1.5" : "bg-muted")}>{k === "Winners" ? "🏆 Top Winners" : "💸 High Spenders"}</button>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={cn("rounded-full border px-3 py-1 text-xs font-bold", period === p ? "border-primary text-primary" : "border-border text-muted-foreground")}>{p}</button>
        ))}
      </div>

      <ol className="mt-6 space-y-2">
        {rows.map((r, i) => (
          <li key={r.name} className={cn("neon-panel flex items-center gap-3 rounded-2xl px-4 py-3", r.you && "ring-2 ring-primary")}>
            <span className="w-8 text-center text-lg font-black">{medal[i] ?? i + 1}</span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 font-bold">{r.name[0]}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
            <span className="font-black text-primary">{r.score.toLocaleString()} {kind === "Winners" ? "wins" : "💎"}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-bold">Your history</h2>
      <p className="text-xs text-muted-foreground">Balance {diamonds.toLocaleString()} 💎</p>
      <ul className="mt-3 space-y-1 text-sm">
        {history.length === 0 && <li className="text-muted-foreground">Abhi koi history nahi — Ludo khelo!</li>}
        {history.slice(0, 15).map((h) => (
          <li key={h.id} className="flex justify-between rounded-lg bg-muted/40 px-3 py-2">
            <span className="truncate">{h.label}</span>
            <span className={h.amount >= 0 ? "text-primary" : "text-destructive"}>{h.amount > 0 ? "+" : ""}{h.amount}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
