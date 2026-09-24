import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";

export const Route = createFileRoute("/spin")({
  head: () => ({
    meta: [
      { title: "Lucky Fate Wheel — Orbit Ludo" },
      { name: "description", content: "Spin the neon fate wheel daily for free diamonds, jackpots and mystery prizes." },
      { property: "og:title", content: "Lucky Fate Wheel — Orbit Ludo" },
      { property: "og:description", content: "Free daily spin plus paid spins for diamond jackpots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpinPage,
});

const PRIZES = [
  { label: "11 💎", value: 11 },
  { label: "50 💎", value: 50 },
  { label: "Try again", value: 0 },
  { label: "100 💎", value: 100 },
  { label: "25 💎", value: 25 },
  { label: "500 💎", value: 500 },
  { label: "5 💎", value: 5 },
  { label: "JACKPOT 2000", value: 2000 },
];
const WEIGHTS = [22, 14, 18, 8, 20, 3, 14, 1];
const KEY = "orbit-spin-day";
const PAID = 20;

function SpinPage() {
  const { diamonds, earn, spend } = useWallet();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);

  useEffect(() => {
    setFreeUsed(localStorage.getItem(KEY) === new Date().toDateString());
  }, []);

  const pick = () => {
    let r = Math.random() * WEIGHTS.reduce((a, b) => a + b, 0);
    for (let i = 0; i < WEIGHTS.length; i++) if ((r -= WEIGHTS[i]) < 0) return i;
    return 0;
  };

  const spin = (paid: boolean) => {
    if (spinning) return;
    if (paid && !spend(PAID, "Lucky wheel spin")) return toast.error("Diamonds kam hain");
    if (!paid) {
      localStorage.setItem(KEY, new Date().toDateString());
      setFreeUsed(true);
    }
    const i = pick();
    const seg = 360 / PRIZES.length;
    const target = angle + 360 * 6 + (360 - ((angle % 360) + i * seg + seg / 2)) % 360;
    setSpinning(true);
    setAngle(target);
    setTimeout(() => {
      setSpinning(false);
      const p = PRIZES[i];
      if (p.value) {
        earn(p.value, `Lucky wheel: ${p.label}`);
        toast.success(`🎉 Jeet gaye ${p.label}!`);
      } else toast("Agli baar pakka! 🍀");
    }, 4200);
  };

  const seg = 360 / PRIZES.length;
  const bg = `conic-gradient(${PRIZES.map((_, i) =>
    `${i % 2 ? "var(--neon-2, var(--accent))" : "var(--neon-1, var(--primary))"} ${i * seg}deg ${(i + 1) * seg}deg`,
  ).join(",")})`;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-24 pt-12">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Fate wheel</p>
      <h1 className="neon-text mt-2 text-4xl font-black">Kismat ka Pahiya</h1>
      <p className="mt-2 text-sm text-muted-foreground">Balance: {diamonds.toLocaleString()} 💎</p>

      <div className="relative mt-10 h-80 w-80">
        <div className="absolute left-1/2 top-[-14px] z-10 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[26px] border-x-transparent border-t-foreground" />
        <div
          className="h-full w-full rounded-full border-4 border-foreground/20 shadow-[0_0_40px_var(--neon-1)]"
          style={{ background: bg, transform: `rotate(${angle}deg)`, transition: "transform 4s cubic-bezier(.15,.9,.2,1)" }}
        >
          {PRIZES.map((p, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 origin-left text-xs font-black text-primary-foreground"
              style={{ transform: `rotate(${i * seg + seg / 2 - 90}deg) translateX(58px)` }}
            >
              {p.label}
            </span>
          ))}
        </div>
        <div className="wheel-core absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-2xl">🎡</div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button className="liquid-btn" disabled={spinning || freeUsed} onClick={() => spin(false)}>
          {freeUsed ? "Free spin kal milega" : "FREE daily spin"}
        </button>
        <button className="liquid-btn" disabled={spinning} onClick={() => spin(true)}>
          Spin for {PAID} 💎
        </button>
      </div>
    </main>
  );
}
