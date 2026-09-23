import { createFileRoute, Link } from "@tanstack/react-router";
// Gaming aur trophy elements render karne ke liye icons import kiye
import { Gamepad2, Zap, Trophy, Shield, Swords, Users, Target, Sparkles, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider"; // Wallet hooks data balance sync ke liye
import { toast } from "sonner";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Super Ludo Mini-Games Arena — Orbit" },
      { name: "description", content: "Explore custom 4-10 super dice game formats, speed matches, and elite cash pools." },
      { property: "og:title", content: "Super Ludo Mini-Games Arena — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

// Dhamakedar Custom Mini-Games and Tournament Modes data grids
const ARENA_CHALLENGES = [
  {
    id: "speed_rush",
    title: "Lightning Speed Rush",
    desc: "Fast-paced action logic mapping. First token to reach home safe triggers total pot payout victory!",
    icon: Zap,
    entry: 50,
    prize: 180,
    players: "1v1 Quick Dual",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-950/50 hover:border-cyan-400"
  },
  {
    id: "super_10_chaos",
    title: "Super 10 Chaos Mode",
    desc: "Enages custom sliders extending max dice outputs up to 10 bounds! Crazy board teleports portals active.",
    icon: Swords,
    entry: 100,
    prize: 360,
    players: "4-Player Battle",
    color: "from-purple-500 to-indigo-600",
    glow: "shadow-purple-950/50 hover:border-purple-400"
  },
  {
    id: "bounty_hunters",
    title: "Bounty Hunters Syndicate",
    desc: "Every token capture pays out 3x triple multiplier drops automatically. High intensity revenge tracker arena.",
    icon: Target,
    entry: 250,
    prize: 900,
    players: "4-Player FFA",
    color: "from-red-500 to-orange-600",
    glow: "shadow-red-950/50 hover:border-red-400"
  },
  {
    id: "vip_grandmaster",
    title: "VIP Grandmaster Crate",
    desc: "Elite tournament grid for top tier players. Guaranteed high-tier token skin cards drop parameters.",
    icon: Trophy,
    entry: 500,
    prize: 2000,
    players: "Championship Grid",
    color: "from-amber-500 to-yellow-600",
    glow: "shadow-amber-950/50 hover:border-amber-400"
  }
];
function ExplorePage() {
  const { diamonds, spend } = useWallet();

  const handleJoinLobby = (lobbyName: string, entryFee: number) => {
    if (diamonds < entryFee) {
      toast.error("Insufficient Diamonds inside your vault!", {
        description: "Please top up or complete standard practice runs first.",
      });
      return;
    }

    toast.success(`⚔️ MATCHMAKING LOCKED`, {
      description: `Entering ${lobbyName}. Preparing game tracks framework loops...`,
      icon: "🎮"
    });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16 transition-all duration-500">
      {/* Dynamic Immersive Gaming Section Header Layout */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-primary animate-pulse" /> Battle Arena Hub
          </p>
          <h1 className="neon-text mt-3 text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            Wander the collection.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Fresh picks, trending pieces, high-tech formats and hidden gems — all one single tap away from the custom rotating radial hub controls wheel.
          </p>
        </div>

        {/* Real-time diamond profile card display balance counters */}
        <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-2.5 bg-slate-900/60 border border-primary/30">
          <Gem className="h-4 w-4 text-primary animate-spin-slow" />
          <span className="text-sm font-black tabular-nums text-white">{diamonds} 💎 SECURE</span>
        </div>
      </div>

      {/* Modern High-End Tournament Grid Dashboard Layout */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ARENA_CHALLENGES.map((challenge) => {
          const Icon = challenge.icon;
          return (
            <div
              key={challenge.id}
              className={cn(
                "neon-panel group relative overflow-hidden rounded-2xl p-6 bg-slate-950/90 border border-slate-900/80 transition-all duration-300 hover:-translate-y-1 shadow-xl",
                challenge.glow
              )}
            >
              {/* Backside abstract dynamic styling vector shadows masks */}
              <div className={cn("absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-10", challenge.color)} />

              <div className="flex items-start justify-between gap-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white shadow-lg", challenge.color)}>
                  <Icon className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                </div>
                <span className="text-[10px] font-black uppercase bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md tracking-widest flex items-center gap-1">
                  <Users className="w-3 h-3 text-primary" /> {challenge.players}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-200 mt-4 tracking-wide group-hover:text-white transition-colors">
                {challenge.title}
              </h3>
              
              <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed h-12 overflow-hidden">
                {challenge.desc}
              </p>

              {/* Price specifications metadata layout tags container */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-900/60 pt-4 bg-slate-900/10 rounded-xl px-2">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Entry Fee</span>
                    <span className="text-sm font-black text-slate-300 flex items-center gap-0.5 font-mono">
                      {challenge.entry} 💎
                    </span>
                  </div>
                  <div className="border-l border-slate-900 h-6 pl-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Prize Pool</span>
                    <span className="text-sm font-black text-amber-400 flex items-center gap-0.5 font-mono animate-pulse">
                      {challenge.prize} 💎
                    </span>
                  </div>
                </div>

                <Button 
                  size="sm"
                  onClick={() => handleJoinLobby(challenge.title, challenge.entry)}
                  className="bg-slate-900 hover:bg-primary border border-slate-800 hover:border-transparent text-slate-200 hover:text-slate-950 font-black text-xs px-4 h-8 uppercase tracking-wider rounded-lg transition-all"
                >
                  Engage Mode
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Quick Actions Footer Shortcuts */}
      <div className="mt-12 flex justify-center items-center gap-4 animate-in fade-in duration-700">
        <Button asChild variant="ghost" className="text-xs font-bold uppercase text-slate-500 hover:text-white tracking-widest">
          <Link to="/ludo">◀ Return to Arena Base</Link>
        </Button>
        <span className="h-4 w-px bg-slate-800" />
        <Button asChild variant="ghost" className="text-xs font-bold uppercase text-slate-500 hover:text-white tracking-widest">
          <Link to="/settings">Deck Settings ▶</Link>
        </Button>
      </div>
    </main>
  );
}
