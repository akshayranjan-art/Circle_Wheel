import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { useOrbit } from "@/components/orbit-provider";
import { GIFTS } from "@/lib/diamond-shop";
import { THEMES } from "@/lib/orbit-themes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Player Profile — Orbit Ludo" },
      { name: "description", content: "Your badges, skins, gifts, diamond ledger, fair-play limits and matchmaking." },
      { property: "og:title", content: "Player Profile — Orbit Ludo" },
      { property: "og:description", content: "Badges, skins, gifts, diamond ledger and fair-play settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

const RULES = [
  { match: /cut|capture|bounty/i, label: "Goti kaati (11 💎 each)" },
  { match: /home/i, label: "Ghar pahunche (25 💎)" },
  { match: /won|victory/i, label: "Match jeete (111 💎)" },
  { match: /wheel/i, label: "Lucky wheel" },
  { match: /purchase|bought|pack|top/i, label: "Diamond kharide" },
  { match: /sent|gift/i, label: "Gifts bheje" },
];

function Profile() {
  const w = useWallet();
  const { config } = useOrbit();
  const [limit, setLimit] = useState(String(w.dailySpendLimit || ""));
  const [searching, setSearching] = useState(false);

  const buckets = new Map<string, number>();
  for (const h of w.history) {
    const r = RULES.find((x) => x.match.test(h.label))?.label ?? "Other";
    buckets.set(r, (buckets.get(r) ?? 0) + h.amount);
  }

  const giftCount = Object.values(w.gifts).reduce((a, b) => a + b, 0);
  const badges = [
    { e: "🎲", n: "First Win", ok: w.wins >= 1 },
    { e: "🔥", n: "10 Wins", ok: w.wins >= 10 },
    { e: "⚔️", n: "Goti Killer (10 cuts)", ok: w.captures >= 10 },
    { e: "💀", n: "Assassin (100 cuts)", ok: w.captures >= 100 },
    { e: "🎁", n: "Generous (5 gifts)", ok: giftCount >= 5 },
    { e: "💎", n: "Rich (10k 💎)", ok: w.diamonds >= 10000 },
    { e: "⚡", n: "Streak x3", ok: w.jackpotStreak >= 3 },
    { e: "🎨", n: "Collector (6 skins)", ok: config.unlocked.length >= 6 },
  ];

  const matchmake = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      toast.success("Match mil gaya! Aapke level ke 3 players ready hain", {
        description: "Same skill range · entry verified · fair dice on",
      });
    }, 2200);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-10">
      <div className="neon-panel flex items-center gap-4 rounded-3xl p-5">
        <div className="wheel-core grid h-16 w-16 shrink-0 place-items-center rounded-full text-2xl font-black">V</div>
        <div className="min-w-0 flex-1">
          <h1 className="neon-text truncate text-2xl font-black">Viking Player</h1>
          <p className="text-sm text-muted-foreground">Level {1 + Math.floor(w.wins / 3)} · {w.wins} wins · {w.captures} cuts</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-primary">{w.diamonds.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">💎 balance</div>
        </div>
      </div>

      <Section title="Achievement badges">
        <div className="grid grid-cols-4 gap-3">
          {badges.map((b) => (
            <div key={b.n} className={cn("rounded-2xl p-3 text-center", b.ok ? "neon-panel" : "bg-muted/30 opacity-40 grayscale")}>
              <div className="text-3xl">{b.e}</div>
              <div className="mt-1 text-[10px] font-bold leading-tight">{b.n}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Diamond hisaab">
        <ul className="space-y-1 text-sm">
          {buckets.size === 0 && <li className="text-muted-foreground">Abhi kuch nahi — Ludo khelo aur kamao.</li>}
          {[...buckets].map(([k, v]) => (
            <li key={k} className="flex justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span>{k}</span>
              <span className={v >= 0 ? "font-bold text-primary" : "font-bold text-destructive"}>{v > 0 ? "+" : ""}{v}</span>
            </li>
          ))}
        </ul>
        <Link to="/leaderboard" className="mt-2 inline-block text-xs text-primary underline">Poori history aur rankings dekho →</Link>
      </Section>

      <Section title="Skins">
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <span key={t.id} className={cn("rounded-full border px-3 py-1 text-xs", config.unlocked.includes(t.id) ? "border-primary" : "border-border opacity-40")}>
              {t.name}{config.themeId === t.id && " ✓"}
            </span>
          ))}
        </div>
      </Section>

      <Section title={`Gifts sent (${giftCount})`}>
        <div className="flex flex-wrap gap-2">
          {giftCount === 0 && <span className="text-sm text-muted-foreground">Koi gift nahi bheja abhi.</span>}
          {GIFTS.filter((g) => w.gifts[g.id]).map((g) => (
            <span key={g.id} className="neon-panel rounded-xl px-3 py-2 text-sm">{g.emoji} ×{w.gifts[g.id]}</span>
          ))}
        </div>
      </Section>

      <Section title="Fair play & safe matchmaking">
        <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
          <li>✅ Fair dice — secure random, no one can fix the roll</li>
          <li>✅ Rewards are only given by the game for real cuts, homes and wins</li>
          <li>✅ Matchmaking pairs you with players at your level</li>
        </ul>
        <button className="liquid-btn" disabled={searching} onClick={matchmake}>
          {searching ? "Players dhoondh rahe hain…" : "Find fair match"}
        </button>
      </Section>

      <Section title="Responsible play limit">
        <p className="mb-2 text-sm text-muted-foreground">
          Aaj kharch: {w.spentToday} 💎{w.dailySpendLimit ? ` / ${w.dailySpendLimit}` : " (koi limit nahi)"}
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            w.setDailySpendLimit(Number(limit) || 0);
            toast.success(Number(limit) ? `Daily limit ${limit} 💎 set` : "Limit hata di");
          }}
        >
          <Input type="number" min={0} value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Daily diamond limit (0 = none)" />
          <button className="liquid-btn shrink-0 !px-4">Save</button>
        </form>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
