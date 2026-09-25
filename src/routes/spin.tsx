import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles, Trophy, Gem, RotateCcw } from "lucide-react";
import { useWallet } from "@/components/wallet-provider";
import { useLanguage } from "@/lib/language-context";
import { soundFX } from "@/lib/sound-fx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/spin")({
  head: () => ({
    meta: [
      { title: "Lucky Fortune & Bankruptcy Revenge Wheel — Orbit Ludo" },
      {
        name: "description",
        content:
          "Spin the neon fate wheel daily for free diamonds, jackpots, rare vehicle drops, and bankruptcy revenge mode.",
      },
      { property: "og:title", content: "Lucky Fortune & Bankruptcy Revenge Wheel — Orbit Ludo" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpinPage,
});

const PRIZES = [
  { label: "11 💎", value: 11, color: "#22d3ee" },
  { label: "50 💎", value: 50, color: "#a855f7" },
  { label: "🏎️ Sports Car", value: 300, color: "#ec4899" },
  { label: "100 💎", value: 100, color: "#3b82f6" },
  { label: "25 💎", value: 25, color: "#10b981" },
  { label: "500 💎", value: 500, color: "#f59e0b" },
  { label: "5 💎", value: 5, color: "#64748b" },
  { label: "JACKPOT 2000 💎", value: 2000, color: "#eab308" },
];

const WEIGHTS = [22, 14, 2, 8, 20, 3, 14, 1];
const KEY = "orbit-spin-day";
const PAID = 20;

function SpinPage() {
  const { diamonds, earn, spend } = useWallet();
  const { t } = useLanguage();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);

  // Feature #13: Bankruptcy Revenge Mode
  const isBankrupt = diamonds < 20;

  useEffect(() => {
    setFreeUsed(localStorage.getItem(KEY) === new Date().toDateString());
  }, []);

  const pick = () => {
    let r = Math.random() * WEIGHTS.reduce((a, b) => a + b, 0);
    for (let i = 0; i < WEIGHTS.length; i++) if ((r -= WEIGHTS[i] ?? 0) < 0) return i;
    return 0;
  };

  const spin = (mode: "free" | "paid" | "revenge") => {
    if (spinning) return;
    if (mode === "paid" && !spend(PAID, "Lucky wheel spin")) {
      toast.error("Diamonds kam hain");
      return;
    }
    if (mode === "free") {
      localStorage.setItem(KEY, new Date().toDateString());
      setFreeUsed(true);
    }

    soundFX.playDiceRoll();
    const i = pick();
    const seg = 360 / PRIZES.length;
    const target = angle + 360 * 6 + ((360 - ((angle % 360) + i * seg + seg / 2)) % 360);

    setSpinning(true);
    setAngle(target);

    // Audio rattle
    const ticker = setInterval(() => {
      soundFX.playTick();
    }, 120);

    setTimeout(() => {
      clearInterval(ticker);
      setSpinning(false);
      const p = PRIZES[i] ?? PRIZES[0]!;

      if (p.value) {
        soundFX.playSpectatorBomb("cheer");
        earn(p.value, `Lucky wheel: ${p.label}`);
        toast.success(`🎉 JEET GAYE! ${p.label}! Wallet me credit ho gaye!`);
      } else {
        toast("Agli baar pakka! 🍀");
      }
    }, 4200);
  };

  const seg = 360 / PRIZES.length;
  const bg = `conic-gradient(${PRIZES.map(
    (p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`,
  ).join(",")})`;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-48 pt-12">
      {/* Bankruptcy Revenge Alert Banner (Feature #13) */}
      {isBankrupt && (
        <div className="mb-6 w-full max-w-lg rounded-2xl border-2 border-red-500 bg-red-950/70 p-4 text-center shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-bounce">
          <h2 className="neon-text text-lg font-black text-red-400 uppercase">
            💥 BANKRUPTCY REVENGE MODE ACTIVATED!
          </h2>
          <p className="mt-1 text-xs text-red-200">
            Aap 11-Diamond Kill Strike se bankrupt ho gaye hain! Free Revenge Spin unlock ho gaya
            hai taaki aap wapsi kar sakein!
          </p>
        </div>
      )}

      <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> 4D Fortune Wheel
      </p>
      <h1 className="neon-text mt-2 text-4xl font-black text-white">Kismat ka Pahiya 🎡</h1>
      <p className="mt-2 text-sm text-slate-400">
        Balance:{" "}
        <span className="font-mono font-bold text-primary">{diamonds.toLocaleString()} 💎</span>
      </p>

      {/* 4D Neon Wheel */}
      <div className="relative mt-8 h-80 w-80">
        <div className="absolute left-1/2 top-[-14px] z-10 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[26px] border-x-transparent border-t-amber-400 drop-shadow-[0_0_10px_#f59e0b]" />
        <div
          className="h-full w-full rounded-full border-4 border-slate-700 shadow-[0_0_50px_rgba(6,182,212,0.4)]"
          style={{
            background: bg,
            transform: `rotate(${angle}deg)`,
            transition: "transform 4s cubic-bezier(.15,.9,.2,1)",
          }}
        >
          {PRIZES.map((p, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 origin-left text-[11px] font-black text-slate-950 drop-shadow"
              style={{ transform: `rotate(${i * seg + seg / 2 - 90}deg) translateX(46px)` }}
            >
              {p.label}
            </span>
          ))}
        </div>
        <div className="wheel-core absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-2xl shadow-xl">
          🎡
        </div>
      </div>

      {/* Spin Triggers */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {isBankrupt ? (
          <Button
            className="liquid-btn !bg-red-600 font-black text-sm uppercase animate-pulse shadow-[0_0_25px_#dc2626]"
            disabled={spinning}
            onClick={() => spin("revenge")}
          >
            🔥 Spin Free Revenge Wheel!
          </Button>
        ) : (
          <>
            <Button
              className="liquid-btn font-black text-xs uppercase"
              disabled={spinning || freeUsed}
              onClick={() => spin("free")}
            >
              {freeUsed ? "Free spin kal milega" : "FREE Daily Spin"}
            </Button>
            <Button
              className="liquid-btn font-black text-xs uppercase"
              disabled={spinning}
              onClick={() => spin("paid")}
            >
              Spin for {PAID} 💎
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
