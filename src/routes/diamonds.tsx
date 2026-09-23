import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
// Design details badhane ke liye ArrowLeft, Trophy, aur Coins icons add kiye
import { Gem, Sparkles, ArrowLeft, Trophy, Coins } from "lucide-react";
import { toast } from "sonner";
import { DIAMOND_PACKS, type DiamondPack } from "@/lib/diamond-shop";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/diamonds")({
  head: () => ({
    meta: [
      { title: "Quantum Diamond Store — Orbit" },
      {
        name: "description",
        content: "Load your premium gaming vault. 20 exclusive sci-fi packs with massive bonus gems structure.",
      },
      { property: "og:title", content: "Quantum Diamond Store — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiamondsPage,
});

function DiamondsPage() {
  const { diamonds, earn, history } = useWallet();
  const [pending, setPending] = useState<DiamondPack | null>(null);

  const buy = () => {
    if (!pending) return;
    const total = pending.amount + pending.bonus;
    earn(total, `Loaded Vault: ${pending.amount} Gems`);
    toast.success(`+${total.toLocaleString()} 💎 Deposited Successfully!`, {
      description: "Demo instant transaction — no real payment was processed.",
    });
    setPending(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16 transition-all duration-500">
      {/* Dynamic Immersive Store Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-primary animate-pulse" /> Cyber Diamond Store
          </p>
          <h1 className="neon-text mt-3 text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Load your vault.
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Twenty premium matrix packs loaded with maximum bonus gems. Remember, every single Ludo token capture pays you <span className="text-primary font-bold">+11 💎 free</span> automatically!
          </p>
        </div>
        
        {/* Real-time core balance counter indicator */}
        <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-2.5 bg-slate-900/80 border border-primary/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Gem className="h-4 w-4 text-primary animate-spin-slow" />
          <span className="text-base font-black tabular-nums text-white">{diamonds.toLocaleString()}</span>
        </div>
      </div>
      {/* 20 Premium Diamond Vault Packs Grid Matrix */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {DIAMOND_PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setPending(pack)}
            className={cn(
              "neon-panel group relative overflow-hidden rounded-2xl p-5 text-left bg-slate-950 border border-slate-900 transition-all duration-300 hover:-translate-y-1.5",
              pack.tag ? "border-primary/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-primary/30" : "hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]",
            )}
          >
            {/* Custom premium badge ribbons label */}
            {pack.tag && (
              <span className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
                {pack.tag}
              </span>
            )}
            
            <Gem className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-125 filter drop-shadow-[0_0_8px_var(--primary)]" />
            
            <p className="mt-4 text-2xl font-black tabular-nums text-slate-100 group-hover:text-white tracking-tight">
              {pack.amount.toLocaleString()}
            </p>
            
            {pack.bonus > 0 && (
              <p className="text-[10px] font-black text-cyan-400 mt-0.5 uppercase tracking-wide flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> +{pack.bonus.toLocaleString()} Bonus Gems
              </p>
            )}
            
            <p className="mt-3 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 inline-block font-mono">
              ₹{pack.price.toLocaleString()} INR
            </p>
          </button>
        ))}
      </div>
      {/* Recent Activity Transaction History Ledger List */}
      {history.length > 0 && (
        <section className="mt-12 border-t border-slate-900 pt-6 animate-in fade-in duration-500">
          <h2 className="mb-4 text-base font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-primary animate-pulse" /> Vault Statement Logs
          </h2>
          <div className="neon-panel divide-y divide-slate-900/60 rounded-2xl bg-slate-950/40 border border-slate-900 overflow-hidden">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-900/20">
                <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">{h.label}</span>
                <span
                  className={cn(
                    "text-sm font-black tabular-nums font-mono px-2.5 py-0.5 rounded-full border bg-slate-900",
                    h.amount > 0 
                      ? "text-primary border-primary/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]" 
                      : "text-slate-500 border-slate-800"
                  )}
                >
                  {h.amount > 0 ? "+" : ""}
                  {h.amount.toLocaleString()} 💎
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Popups Prompt Execution Window Layer Modals */}
      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="bg-slate-950 border border-slate-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white font-black uppercase tracking-wide text-lg">
              <Sparkles className="h-5 w-5 text-primary animate-bounce" /> Deposit Matrix Order
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs leading-normal pt-2">
              You are ordering <span className="text-white font-black">{pending?.amount.toLocaleString()} Diamonds</span>.
              {pending && pending.bonus > 0
                ? ` This configuration packages bundles an additional extra +${pending.bonus.toLocaleString()} free credits bonus gems layout internally.`
                : ""}
              <br /><br />
              Total Gate Charge: <span className="text-primary font-black font-mono">₹{pending?.price.toLocaleString()} INR</span>. This is a secure local simulation sandbox store session — no real fiat credentials will be billed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 gap-2">
            <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-xs font-bold" onClick={() => setPending(null)}>
              Cancel Order
            </Button>
            <Button className="bg-primary text-slate-950 font-black text-xs uppercase shadow-lg shadow-purple-950/40" onClick={buy}>
              Authorize Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Quick Action Return Anchors Grid Links */}
      <div className="mt-12 flex justify-center items-center gap-4 animate-in fade-in duration-700">
        <Button asChild variant="ghost" className="text-xs font-bold uppercase text-slate-500 hover:text-white tracking-widest">
          <Link to="/ludo">◀ Return to Arena Base</Link>
        </Button>
        <span className="h-4 w-px bg-slate-800" />
        <Button asChild variant="ghost" className="text-xs font-bold uppercase text-slate-500 hover:text-white tracking-widest">
          <Link to="/gifts">Premium Gift Vault ▶</Link>
        </Button>
      </div>
    </main>
  );
}
