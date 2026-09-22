import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gem, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DIAMOND_PACKS, type DiamondPack } from "@/lib/diamond-shop";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diamonds")({
  head: () => ({
    meta: [
      { title: "Diamond Store — Orbit" },
      {
        name: "description",
        content: "20 diamond packs, from a 10-gem starter to the 99,999 legend vault.",
      },
      { property: "og:title", content: "Diamond Store — Orbit" },
      {
        property: "og:description",
        content: "20 diamond packs, from a 10-gem starter to the 99,999 legend vault.",
      },
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
    earn(total, `Bought ${pending.amount} diamond pack`);
    toast.success(`+${total} 💎 added`, {
      description: "Demo purchase — no real payment was taken.",
    });
    setPending(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Diamond Store
          </p>
          <h1 className="neon-text mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Load your vault.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Twenty packs with bonus gems. Every Ludo cut also pays you 11 💎 free.
          </p>
        </div>
        <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-3">
          <Gem className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tabular-nums">{diamonds}</span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {DIAMOND_PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setPending(pack)}
            className={cn(
              "neon-panel group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary",
              pack.tag && "ring-1 ring-primary/50",
            )}
          >
            {pack.tag && (
              <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                {pack.tag}
              </span>
            )}
            <Gem className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-3 text-xl font-black tabular-nums">
              {pack.amount.toLocaleString()}
            </p>
            {pack.bonus > 0 && (
              <p className="text-[11px] font-semibold text-primary">
                +{pack.bonus.toLocaleString()} bonus
              </p>
            )}
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              ₹{pack.price.toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
          <div className="neon-panel divide-y divide-border/60 rounded-2xl">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">{h.label}</span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    h.amount > 0 ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {h.amount > 0 ? "+" : ""}
                  {h.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {pending?.amount.toLocaleString()} diamonds
            </DialogTitle>
            <DialogDescription>
              {pending && pending.bonus > 0
                ? `Includes ${pending.bonus.toLocaleString()} bonus gems. `
                : ""}
              Price ₹{pending?.price.toLocaleString()}. This is a demo store — no
              real payment is taken and gems are saved on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={buy}>Get diamonds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
