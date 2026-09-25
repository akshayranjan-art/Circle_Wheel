import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Gem,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Star,
  Gift,
  Crown,
  Play,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { soundFX } from "@/lib/sound-fx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diamonds")({
  head: () => ({
    meta: [
      { title: "Diamond Stock Market, Free Yield & VIP Neon Club — Orbit" },
      {
        name: "description",
        content:
          "Hourly Diamond Stock Exchange, Free-Play Star yields, Instant Cashout Vouchers, and VIP Neon Club subscription.",
      },
      { property: "og:title", content: "Diamond Stock Market, Free Yield & VIP Neon Club — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiamondsPage,
});

const CASHOUT_VOUCHERS = [
  { id: "v1", title: "Amazon $10 Gift Card", cost: 1000, icon: "🛒" },
  { id: "v2", title: "Google Play / App Store $10", cost: 1000, icon: "🎮" },
  { id: "v3", title: "Cyber Dragon 4D Vehicle", cost: 2500, icon: "🐉" },
  { id: "v4", title: "Diamond Mafia Elite Crown", cost: 5000, icon: "👑" },
];

function DiamondsPage() {
  const {
    diamonds,
    earn,
    spend,
    stockPrice,
    stockTrend,
    stockShares,
    buyStock,
    sellStock,
    freeStars,
    earnFreeStars,
    convertStarsToDiamonds,
    isVip,
    toggleVip,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<"store" | "stock" | "freeYield" | "cashout" | "vip">(
    "stock",
  );
  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [watchingAd, setWatchingAd] = useState<boolean>(false);

  const watchDemoAd = () => {
    setWatchingAd(true);
    soundFX.playLiquidRipple();
    setTimeout(() => {
      setWatchingAd(false);
      earnFreeStars(20);
      soundFX.playSpectatorBomb("cheer");
      toast.success("⭐ Quest Complete! +20 Free Stars earned! Ready to convert into Diamonds!");
    }, 2000);
  };

  const isPriceRising =
    stockTrend.length >= 2 &&
    (stockTrend[stockTrend.length - 1] ?? 0) >= (stockTrend[stockTrend.length - 2] ?? 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-48 pt-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> 11-Diamond Economy &
            Loot
          </p>
          <h1 className="neon-text mt-1 text-3xl font-black text-white sm:text-4xl">
            Diamond Exchange Hub 💎
          </h1>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 border border-slate-800">
          <Gem className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Active Balance</p>
            <p className="font-mono text-base font-black text-white">
              {diamonds.toLocaleString()} 💎
            </p>
          </div>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            soundFX.playTick();
            setActiveTab("stock");
          }}
          className={cn(
            "rounded-xl px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "stock"
              ? "bg-primary text-slate-950 font-black shadow"
              : "bg-slate-900 text-slate-400",
          )}
        >
          📈 Stock Market
        </button>
        <button
          onClick={() => {
            soundFX.playTick();
            setActiveTab("freeYield");
          }}
          className={cn(
            "rounded-xl px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "freeYield"
              ? "bg-primary text-slate-950 font-black shadow"
              : "bg-slate-900 text-slate-400",
          )}
        >
          ⭐ Free Stars Yield
        </button>
        <button
          onClick={() => {
            soundFX.playTick();
            setActiveTab("cashout");
          }}
          className={cn(
            "rounded-xl px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "cashout"
              ? "bg-primary text-slate-950 font-black shadow"
              : "bg-slate-900 text-slate-400",
          )}
        >
          🎁 Instant Cashout
        </button>
        <button
          onClick={() => {
            soundFX.playTick();
            setActiveTab("vip");
          }}
          className={cn(
            "rounded-xl px-4 py-1.5 text-xs font-bold transition-all",
            activeTab === "vip"
              ? "bg-primary text-slate-950 font-black shadow"
              : "bg-slate-900 text-slate-400",
          )}
        >
          👑 VIP Neon Club
        </button>
      </div>

      {/* FEATURE #17: DIAMOND STOCK MARKET */}
      {activeTab === "stock" && (
        <div className="mt-6 rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Diamond Index Ticker
              </p>
              <h2 className="neon-text text-3xl font-black text-white flex items-center gap-2">
                1 SHARE = {stockPrice} 💎
                {isPriceRising ? (
                  <TrendingUp className="h-6 w-6 text-emerald-400 animate-pulse" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400 animate-pulse" />
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Prices fluctuate every minute based on goti kill strike volume and arena activity.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500">Your Portfolio</span>
              <p className="font-mono text-xl font-black text-cyan-300">{stockShares} Shares</p>
              <span className="text-xs text-slate-400 font-mono">
                Value: {(stockShares * stockPrice).toLocaleString()} 💎
              </span>
            </div>
          </div>

          {/* Simulated Candlestick / Trend Bar Graph */}
          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 block">
              Recent Price Fluctuations (Live Feed)
            </span>
            <div className="flex h-32 items-end gap-3 border-b border-slate-800 pb-2">
              {stockTrend.map((price, idx) => {
                const heightPercent = Math.max(15, Math.min(100, ((price - 30) / 220) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <span className="text-[9px] font-mono text-slate-500">{price}</span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        "w-full rounded-t-md transition-all duration-500",
                        idx === stockTrend.length - 1
                          ? isPriceRising
                            ? "bg-emerald-400 shadow-[0_0_12px_#34d399]"
                            : "bg-red-400 shadow-[0_0_12px_#f87171]"
                          : "bg-cyan-600/50",
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade Buy / Sell Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Shares Quantity:</span>
              {[1, 5, 10].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    soundFX.playTick();
                    setTradeAmount(amt);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold",
                    tradeAmount === amt
                      ? "bg-primary text-slate-950 font-black"
                      : "bg-slate-800 text-slate-300",
                  )}
                >
                  {amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                className="liquid-btn !bg-emerald-600 text-xs font-black uppercase"
                onClick={() => {
                  if (buyStock(tradeAmount)) {
                    soundFX.playSpectatorBomb("cheer");
                    toast.success(`📈 Bought ${tradeAmount} share(s) @ ${stockPrice} 💎!`);
                  } else {
                    toast.error("Diamonds kam hain!");
                  }
                }}
              >
                Buy {tradeAmount} ({tradeAmount * stockPrice} 💎)
              </Button>

              <Button
                className="liquid-btn !bg-red-600 text-xs font-black uppercase"
                disabled={stockShares < tradeAmount}
                onClick={() => {
                  if (sellStock(tradeAmount)) {
                    soundFX.playSpectatorBomb("cheer");
                    toast.success(
                      `📉 Sold ${tradeAmount} share(s) for ${tradeAmount * stockPrice} 💎!`,
                    );
                  } else {
                    toast.error("Shares kam hain!");
                  }
                }}
              >
                Sell {tradeAmount} (+{tradeAmount * stockPrice} 💎)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE #19: FREE-PLAY YIELDING SYSTEM */}
      {activeTab === "freeYield" && (
        <div className="mt-6 rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-6">
          <div>
            <h2 className="neon-text text-2xl font-black text-amber-300 flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-400 animate-spin-slow" /> Free-Play Yielding
              System
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Paise lagane ki zarurat nahi! Complete daily mini challenges or watch quick sci-fi
              demos to earn Free Stars and convert them to Diamonds.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Free Stars Bank
              </span>
              <p className="font-mono text-2xl font-black text-amber-400 flex items-center gap-1.5">
                ⭐ {freeStars} Stars
              </p>
              <span className="text-[11px] text-slate-400">Rate: 20 Stars = 15 💎</span>
            </div>

            <Button
              className="liquid-btn text-xs font-black"
              disabled={freeStars < 20}
              onClick={() => {
                if (convertStarsToDiamonds()) {
                  soundFX.playKillStrike();
                  toast.success("⭐ Stars converted into Diamonds successfully!");
                } else {
                  toast.error("Kam se kam 20 Stars chahiye!");
                }
              }}
            >
              Convert Stars to 💎
            </Button>
          </div>

          {/* Daily Quests List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-xs font-bold text-white">Watch Sci-Fi Promo Reel</p>
                  <p className="text-[10px] text-slate-400">
                    2-second interactive demo ad • +20 Stars
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="liquid-btn text-xs font-bold"
                disabled={watchingAd}
                onClick={watchDemoAd}
              >
                {watchingAd ? "Streaming..." : "Watch Demo"}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-white">Daily Login Bonus</p>
                  <p className="text-[10px] text-slate-400">Claim your daily 10 free stars</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold"
                onClick={() => {
                  earnFreeStars(10);
                  toast.success("+10 Free Stars claimed!");
                }}
              >
                Claim +10 ⭐
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE #44: INSTANT CASHOUT EXCHANGE */}
      {activeTab === "cashout" && (
        <div className="mt-6 rounded-3xl bg-slate-900/60 p-6 border border-slate-800 space-y-4">
          <div>
            <h2 className="neon-text text-2xl font-black text-cyan-300 flex items-center gap-2">
              <Gift className="h-6 w-6 text-pink-400" /> Instant Cashout Rewards Exchange
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Redeem your hard-earned diamonds from goti kill-strikes into gaming vouchers, store
              perks, and rare cosmetics!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CASHOUT_VOUCHERS.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{v.icon}</span>
                  <div>
                    <p className="text-xs font-black text-white">{v.title}</p>
                    <p className="text-[11px] text-cyan-400 font-mono font-bold">{v.cost} 💎</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="liquid-btn text-xs font-bold"
                  onClick={() => {
                    if (spend(v.cost, `Redeemed: ${v.title}`)) {
                      soundFX.playSpectatorBomb("cheer");
                      toast.success(`🎉 ${v.title} REDEEMED INSTANTLY! Voucher code dispatched!`);
                    } else {
                      toast.error("Diamonds kam hain!");
                    }
                  }}
                >
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE #49: VIP NEON CLUB SUBSCRIPTION */}
      {activeTab === "vip" && (
        <div className="mt-6 flex flex-col items-center">
          <div className="w-full max-w-lg rounded-3xl border-2 border-amber-400 bg-slate-950 p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-scale-in">
            <Crown className="mx-auto h-16 w-16 text-amber-400 stroke-[2] animate-bounce" />
            <h2 className="neon-text mt-3 text-3xl font-black text-amber-300 uppercase">
              VIP Neon Club Pass
            </h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Unlock the highest tier in the Orbit Ludo universe:
            </p>

            <div className="mt-4 space-y-2 text-left text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <b>1.25X Multiplier</b> on all diamond loot & kill strikes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <b>Ad-Free Experience</b> & Double Daily Fate Wheel Spins
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <b>Golden Hypercar Entry</b> with exclusive screen shake
                </span>
              </div>
            </div>

            <Button
              className={cn(
                "liquid-btn mt-6 w-full font-black text-xs uppercase",
                isVip ? "!bg-emerald-600" : "!bg-amber-500 text-slate-950",
              )}
              onClick={() => {
                soundFX.playSpectatorBomb("cheer");
                toggleVip();
                toast.success(
                  isVip
                    ? "VIP Membership Deactivated"
                    : "👑 VIP Neon Club Activated! 1.25x Multiplier & Golden Perks Unlocked!",
                );
              }}
            >
              {isVip ? "VIP Club Member (Active)" : "Activate VIP Pass (Free Demo)"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
