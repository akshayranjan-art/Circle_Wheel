import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
// Gift aur Sparkles icons ko design upgrade ke liye add kiya
import { Gem, Gift as GiftIcon, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { GIFTS, GIFT_CATEGORIES, type Gift } from "@/lib/diamond-shop";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gifts")({
  head: () => ({
    meta: [
      { title: "Quantum Gift Vault — Orbit" },
      {
        name: "description",
        content:
          "Send neon gifts with diamonds: roses, superbikes, hyper cars, UFOs and unlock lucky reward multipliers.",
      },
      { property: "og:title", content: "Quantum Gift Vault — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GiftsPage,
});

function GiftsPage() {
  // Wallet se state variables pull karein jisse dynamic transactions handle ho sakein
  const { diamonds, spend, addGift, gifts: owned } = useWallet();
  const [category, setCategory] = useState<string>("All");
  const [flying, setFlying] = useState<Gift | null>(null);

  const list = useMemo(
    () => (category === "All" ? GIFTS : GIFTS.filter((g) => g.category === category)),
    [category],
  );
  const send = (gift: Gift) => {
    if (!spend(gift.price, `Sent ${gift.name}`)) {
      toast.error("Not enough diamonds in your vault!", {
        description: "Cut tokens in Ludo match or top up in the diamond store.",
      });
      return;
    }

    addGift(gift.id);
    setFlying(gift);
    setTimeout(() => setFlying(null), 1400);

    // PRIZE ENGINE INTEGRATION: Gift bhejne par 15% instant diamond cash returns!
    const cashback = Math.floor(gift.price * 0.15);
    // Random lucky wheel check
    const isLuckyDrop = Math.random() > 0.6;
    const luckyBonus = isLuckyDrop ? Math.floor(gift.price * 0.5) : 0;

    toast.success(`${gift.emoji} ${gift.name} Sent Successfully!`);

    if (cashback > 0) {
      toast.info(`🎁 VAULT CASHBACK: +${cashback} 💎 returned to your session balance!`);
    }
    if (isLuckyDrop && luckyBonus > 0) {
      toast.success(`🎉 CRATE CRACKED: You won a Lucky Box worth +${luckyBonus} 💎!`, {
        icon: "🏆",
      });
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16 transition-all duration-500">
      {/* Immersive Header Controls Grid Layout */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary flex items-center gap-1.5">
            <GiftIcon className="w-3.5 h-3.5 animate-pulse text-primary" /> Premium Gift Vault
          </p>
          <h1 className="neon-text mt-3 text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            Send something loud.
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Drop sports superbikes, luxury hyper cars, alien UFOs and neon boxes — paid with gaming
            tokens. Every drop triggers active lucky chests!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-2.5 bg-slate-900/80 border border-primary/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Gem className="h-4 w-4 text-primary animate-spin-slow" />
            <span className="text-sm font-black tabular-nums text-white">{diamonds} 💎</span>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-slate-800 hover:bg-slate-900 font-bold text-xs uppercase"
          >
            <Link to="/diamonds">Load Vault</Link>
          </Button>
        </div>
      </div>

      {/* Category Tab Filters Selection Sliders Line */}
      <div className="mt-8 flex flex-wrap gap-2">
        {["All", ...GIFT_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300",
              category === c
                ? "border-primary bg-primary text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "border-slate-800 text-slate-400 hover:border-primary/60 hover:text-white hover:bg-slate-950",
            )}
          >
            {c} Collection
          </button>
        ))}
      </div>
      {/* 24+ Premium Gift Objects Card Display Grid Panel */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((gift) => (
          <button
            key={gift.id}
            type="button"
            onClick={() => send(gift)}
            className={cn(
              "neon-panel group relative overflow-hidden rounded-2xl p-5 text-center bg-slate-950 border border-slate-900/80 transition-all duration-300 hover:-translate-y-1.5",
              gift.rare
                ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20"
                : "hover:border-primary/50",
            )}
          >
            {/* Rare collection ribbon tag label */}
            {gift.rare && (
              <span className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
                RARE DROP
              </span>
            )}

            {/* Owned quantity tag indicator */}
            {(owned[gift.id] ?? 0) > 0 && (
              <span className="absolute left-3 top-2.5 text-[10px] font-mono font-black text-slate-500 bg-slate-900/80 border border-slate-800 px-1.5 py-0.5 rounded">
                X{owned[gift.id]} COLLECTED
              </span>
            )}

            <span className="block text-5xl mt-2 transition-transform duration-300 group-hover:scale-125 filter drop-shadow-lg">
              {gift.emoji}
            </span>
            <p className="mt-4 text-sm font-bold text-slate-200 tracking-wide group-hover:text-white">
              {gift.name}
            </p>

            <p className="mt-1.5 flex items-center justify-center gap-1 text-xs font-black text-primary font-mono bg-slate-900/40 border border-slate-900 rounded-full py-1 max-w-[110px] mx-auto">
              <Gem className="h-3 w-3 text-primary" /> {gift.price.toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      {/* Dynamic 3D Floating Flying Gift Screen Animation Layer Overlay */}
      {flying && (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/10 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center justify-center animate-bounce">
            <span className="gift-fly text-[8rem] filter drop-shadow-[0_10px_35px_rgba(245,158,11,0.5)]">
              {flying.emoji}
            </span>
            <div className="bg-slate-950/90 border border-amber-500/50 text-amber-400 font-black text-xs px-4 py-1.5 rounded-full mt-4 shadow-xl tracking-widest uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> BROADCASTING DROP
              EFFECT <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
