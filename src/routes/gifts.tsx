import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gem } from "lucide-react";
import { toast } from "sonner";
import { GIFTS, GIFT_CATEGORIES, type Gift } from "@/lib/diamond-shop";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gifts")({
  head: () => ({
    meta: [
      { title: "Gift Vault — Orbit" },
      {
        name: "description",
        content:
          "Send neon gifts with diamonds: roses, superbikes, hyper cars, UFOs and more.",
      },
      { property: "og:title", content: "Gift Vault — Orbit" },
      {
        property: "og:description",
        content:
          "Send neon gifts with diamonds: roses, superbikes, hyper cars, UFOs and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GiftsPage,
});

function GiftsPage() {
  const { diamonds, spend, addGift, gifts: owned } = useWallet();
  const [category, setCategory] = useState<string>("All");
  const [flying, setFlying] = useState<Gift | null>(null);

  const list = useMemo(
    () =>
      category === "All" ? GIFTS : GIFTS.filter((g) => g.category === category),
    [category],
  );

  const send = (gift: Gift) => {
    if (!spend(gift.price, `Sent ${gift.name}`)) {
      toast.error("Not enough diamonds", {
        description: "Cut tokens in Ludo or top up in the diamond store.",
      });
      return;
    }
    addGift(gift.id);
    setFlying(gift);
    setTimeout(() => setFlying(null), 1400);
    toast.success(`${gift.emoji} ${gift.name} sent!`);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Gift Vault
          </p>
          <h1 className="neon-text mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Send something loud.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Love, bikes, luxury, sci-fi and party drops — all paid with diamonds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-3">
            <Gem className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tabular-nums">{diamonds}</span>
          </div>
          <Button asChild variant="outline">
            <Link to="/diamonds">Top up</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {["All", ...GIFT_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((gift) => (
          <button
            key={gift.id}
            type="button"
            onClick={() => send(gift)}
            className={cn(
              "neon-panel group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary",
              gift.rare && "ring-1 ring-primary/50",
            )}
          >
            {gift.rare && (
              <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                Rare
              </span>
            )}
            {(owned[gift.id] ?? 0) > 0 && (
              <span className="absolute left-2 top-2 text-[10px] font-bold text-muted-foreground">
                x{owned[gift.id]}
              </span>
            )}
            <span className="block text-4xl transition-transform duration-300 group-hover:scale-125">
              {gift.emoji}
            </span>
            <p className="mt-3 text-sm font-semibold">{gift.name}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-primary">
              <Gem className="h-3 w-3" /> {gift.price.toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      {flying && (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
          <span className="gift-fly text-[7rem] drop-shadow-2xl">{flying.emoji}</span>
        </div>
      )}
    </main>
  );
}
