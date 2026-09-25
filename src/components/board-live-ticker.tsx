import { Sparkles, Users, Crown, Zap, Heart, Shield, Gem, Flame } from "lucide-react";
import { soundFX } from "@/lib/sound-fx";
import { cn } from "@/lib/utils";

export type LiveTickerItem = {
  id: string;
  icon: string;
  user: string;
  action: string;
  tag: string;
  color: string;
};

// Top 20 Live Items & Purchases for 100-User Board Feed
export const TOP_20_LIVE_ITEMS: LiveTickerItem[] = [
  {
    id: "1",
    icon: "⚡",
    user: "Kabir_Boss",
    action: "unlocked Neon Cyber Frame",
    tag: "VIP PLAN",
    color: "text-cyan-400",
  },
  {
    id: "2",
    icon: "💖",
    user: "Simran ✨",
    action: "claimed 50 💎 Daily Love Dividend (10m live)",
    tag: "LOVE BIRD",
    color: "text-pink-400",
  },
  {
    id: "3",
    icon: "🐉",
    user: "Rohan_X",
    action: "equipped 4D Fire Dragon Skin",
    tag: "SKIN",
    color: "text-orange-400",
  },
  {
    id: "4",
    icon: "👑",
    user: "Viking_Ak",
    action: "activated VIP Emperor Pass 1.25x",
    tag: "PASS",
    color: "text-amber-400",
  },
  {
    id: "5",
    icon: "🛡️",
    user: "Pooja_Queen",
    action: "activated Diamond Insurance Shield",
    tag: "SHIELD",
    color: "text-emerald-400",
  },
  {
    id: "6",
    icon: "🏎️",
    user: "Aryan_Speed",
    action: "bought 4D Hypercar Grand Entry",
    tag: "VEHICLE",
    color: "text-purple-400",
  },
  {
    id: "7",
    icon: "💥",
    user: "Goti_Don",
    action: "looted 33 💎 Triple Bounty Kill Strike",
    tag: "BOUNTY",
    color: "text-red-400",
  },
  {
    id: "8",
    icon: "🎰",
    user: "Lucky_Rahul",
    action: "won 2000 💎 Jackpot on Fate Wheel",
    tag: "JACKPOT",
    color: "text-amber-300",
  },
  {
    id: "9",
    icon: "🔥",
    user: "Shera_99",
    action: "equipped Inferno Flaming Chat Frame",
    tag: "FRAME",
    color: "text-rose-400",
  },
  {
    id: "10",
    icon: "📈",
    user: "Trader_Kunal",
    action: "bought 10 Diamond Stock Shares",
    tag: "MARKET",
    color: "text-cyan-300",
  },
  {
    id: "11",
    icon: "🌹",
    user: "Aarav_07",
    action: "sent 4D Neon Castle to Simran",
    tag: "GIFT",
    color: "text-pink-300",
  },
  {
    id: "12",
    icon: "⚡",
    user: "Cyber_Girl",
    action: "activated Electric Shock Dice Arsenal",
    tag: "DICE",
    color: "text-cyan-400",
  },
  {
    id: "13",
    icon: "👑",
    user: "Raja_Bhai",
    action: "won Sunday Mega Knockout Ticket",
    tag: "TOURNEY",
    color: "text-amber-400",
  },
  {
    id: "14",
    icon: "💖",
    user: "Ananya_Love",
    action: "hit 50 Love Birds Milestone today!",
    tag: "MILESTONE",
    color: "text-pink-500",
  },
  {
    id: "15",
    icon: "⭐",
    user: "Free_Player",
    action: "converted 100 Stars to 75 Diamonds",
    tag: "YIELD",
    color: "text-yellow-400",
  },
  {
    id: "16",
    icon: "🎁",
    user: "Karan_King",
    action: "redeemed Amazon $10 Voucher",
    tag: "CASHOUT",
    color: "text-emerald-300",
  },
  {
    id: "17",
    icon: "🔒",
    user: "Vip_Lounge_8",
    action: "enabled Biometric Face ID Lock",
    tag: "SECURITY",
    color: "text-blue-400",
  },
  {
    id: "18",
    icon: "🎤",
    user: "Monster_Voice",
    action: "switched AI Voice Modulator to Mafia",
    tag: "VOICE",
    color: "text-violet-400",
  },
  {
    id: "19",
    icon: "🌀",
    user: "Teleport_Max",
    action: "traversed Wormhole Portal on Tile 7",
    tag: "PORTAL",
    color: "text-teal-300",
  },
  {
    id: "20",
    icon: "🏆",
    user: "You",
    action: "joined 4D Quantum Super Arena",
    tag: "ACTIVE",
    color: "text-cyan-400",
  },
];

export function BoardLiveTicker() {
  return (
    <div className="relative z-20 w-full overflow-hidden rounded-2xl bg-slate-950/90 border border-cyan-500/30 py-2 px-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] select-none">
      <div className="flex items-center gap-2">
        {/* 100 Users Live Badge */}
        <div className="flex items-center gap-1.5 shrink-0 rounded-full bg-cyan-950 px-2.5 py-1 border border-cyan-500/50 text-[11px] font-black text-cyan-300 shadow">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <Users className="h-3 w-3 text-cyan-400" />
          <span>100 USERS LIVE</span>
        </div>

        <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-500 shrink-0">
          | Top 20 Items Feed:
        </span>

        {/* Ticker marquee */}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-ticker-marquee flex items-center gap-6">
            {TOP_20_LIVE_ITEMS.concat(TOP_20_LIVE_ITEMS).map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => soundFX.playTick()}
                className="flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="font-bold text-white">{item.user}</span>
                <span className="text-slate-400">{item.action}</span>
                <span
                  className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800",
                    item.color,
                  )}
                >
                  {item.tag}
                </span>
                <span className="text-slate-700 ml-2">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
