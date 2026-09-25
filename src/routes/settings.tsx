import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
// Palette aur Gem icons ko wallet framework integration ke liye import kiya
import { Check, Lock, Sparkles, Palette, Gem } from "lucide-react";
import { toast } from "sonner";
import { ORBIT_THEMES, type OrbitTheme } from "@/lib/orbit-themes";
import { ORBIT_ITEMS } from "@/lib/orbit-items";
import { useOrbit } from "@/components/orbit-provider";
import { useWallet } from "@/components/wallet-provider"; // Wallet hooks inject kiya
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Control Deck & Custom Skins — Orbit" },
      {
        name: "description",
        content:
          "Unlock 10 ultra sci-fi neon board skins, configure custom gotti models, and scale radial dashboard options up to 40 icons.",
      },
      { property: "og:title", content: "Control Deck & Custom Skins — Orbit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { config, update, unlock, reset } = useOrbit();
  const { diamonds, spend } = useWallet(); // Wallet connectivity links
  const [pending, setPending] = useState<OrbitTheme | null>(null);

  const free = ORBIT_THEMES.filter((t) => !t.premium);
  const premium = ORBIT_THEMES.filter((t) => t.premium);

  const pick = (theme: OrbitTheme) => {
    if (theme.premium && !config.unlocked.includes(theme.id)) {
      setPending(theme);
      return;
    }
    update({ themeId: theme.id });
    toast.success(`${theme.name} Board Skin Engaged!`);
  };
  const confirmUnlock = () => {
    if (!pending) return;

    // Check points deduction calculation logic directly from your wallet
    if (!spend(pending.price, `Unlocked ${pending.name} Board Skin`)) {
      toast.error("Not enough diamonds in your vault!", {
        description: "Win more Ludo matches or top up inside the store.",
      });
      setPending(null);
      return;
    }

    unlock(pending.id);
    toast.success(`${pending.name} Premium Skin Actived!`, {
      description: "Premium cyber aesthetic skin engaged on this device session.",
    });
    setPending(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16 transition-all duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Quantum Control Deck
          </p>
          <h1 className="neon-text mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Build your orbit.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Ten ultra sci-fi neon themes, five free and five premium unlockable via live gaming
            diamonds, plus complete terminal parameter adjustments.
          </p>
        </div>

        {/* Real-time diamond value panel tracking */}
        <div className="neon-panel flex items-center gap-2 rounded-full px-5 py-2.5 bg-slate-900/60 border border-primary/30">
          <Gem className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-black tabular-nums text-white">
            {diamonds} 💎 AVAILABLE
          </span>
        </div>
      </div>

      <Section title="Free Arena Skins" hint="5 Skins Included">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {free.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              selected={config.themeId === t.id}
              locked={false}
              onClick={() => pick(t)}
            />
          ))}
        </div>
      </Section>

      <Section title="Premium Bounty Skins" hint="5 Unlockable Packs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {premium.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              selected={config.themeId === t.id}
              locked={!config.unlocked.includes(t.id)}
              onClick={() => pick(t)}
            />
          ))}
        </div>
      </Section>
      <Section title="Quantum Radial Layout Settings" hint="Fine-tune variables">
        <div className="neon-panel space-y-7 rounded-2xl p-6 bg-slate-900/40 border border-slate-800">
          {/* Expanded slider nodes to easily match the massive 40-app integration limit */}
          <Control
            label="Total active nodes in circular layout"
            value={`${config.iconCount} / 40 Active Slots`}
            hint="Supports up to 40 hyper-responsive interactive icons mapping paths seamlessly."
          >
            <Slider
              value={[config.iconCount]}
              min={3}
              max={40} // Stretched bounds limits up to 40 app spaces
              step={1}
              onValueChange={([v]) => update({ iconCount: v ?? 8 })}
            />
          </Control>

          <Control label="Layout peripheral diameter span" value={`${config.radius}px`}>
            <Slider
              value={[config.radius]}
              min={100}
              max={260} // Upgraded dimensions limit parameter mapping for crowded rings
              step={4}
              onValueChange={([v]) => update({ radius: v ?? 140 })}
            />
          </Control>

          <Control
            label="Kinetic rotational animation speed pace"
            value={`${config.speed.toFixed(1)}x Velocity`}
          >
            <Slider
              value={[config.speed * 10]}
              min={5}
              max={25}
              step={1}
              onValueChange={([v]) => update({ speed: (v ?? 10) / 10 })}
            />
          </Control>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Layout distribution geometry spread
            </p>
            <div className="flex flex-wrap gap-2">
              {(["arc", "fan", "full"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update({ layout: l })}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                    config.layout === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
                  )}
                >
                  {l} Design Mode
                </button>
              ))}
            </div>
          </div>

          <Toggle
            label="Sci-Fi Holographic Glowing halo effects"
            description="Engages ambient high-energy light filters underneath active controls wheels."
            checked={config.glow}
            onChange={(v) => update({ glow: v })}
          />
          <Toggle
            label="360° Clockwise Spinning ring vectors guides"
            description="Slow rotational micro-motions tracking layout alignment circles lines."
            checked={config.spin}
            onChange={(v) => update({ spin: v })}
          />
          <Toggle
            label="Floating tooltip titles badges overlay"
            description="Instantly render metadata descriptions text on cursor active intersections."
            checked={config.showLabels}
            onChange={(v) => update({ showLabels: v })}
          />

          <Button
            variant="outline"
            className="border-slate-800 hover:bg-slate-900 text-xs font-bold uppercase"
            onClick={reset}
          >
            Reset Terminal to Factory Defaults
          </Button>
        </div>
      </Section>
      {/* Confirmation modal prompt windows configuration blocks */}
      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="bg-slate-950 border border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white font-black uppercase text-lg">
              <Sparkles className="h-5 w-5 text-primary animate-bounce" /> Unlock {pending?.name}{" "}
              Pack
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs leading-normal pt-2">
              {pending?.tagline} — High intensity active cyber premium skin. Unlocks directly by
              spending <span className="text-primary font-bold">{pending?.price} diamonds</span>{" "}
              collected during live gaming sessions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              className="border-slate-800 hover:bg-slate-900 text-xs font-bold"
              onClick={() => setPending(null)}
            >
              Abort Protocol
            </Button>
            <Button
              className="bg-primary text-slate-950 font-black text-xs uppercase"
              onClick={confirmUnlock}
            >
              Deduct Gems & Engage Skin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-slate-900 pt-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white uppercase">{title}</h2>
        {hint && (
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function ThemeCard({
  theme,
  selected,
  locked,
  onClick,
}: {
  theme: OrbitTheme;
  selected: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-1",
        selected
          ? "border-primary shadow-[0_0_30px_-8px_var(--primary)]"
          : "border-border/70 hover:border-primary/60",
      )}
      style={{ background: theme.vars["--card"] }}
    >
      <div
        className="flex h-16 items-center justify-center gap-1.5 rounded-xl"
        style={{ background: theme.vars["--background"] }}
      >
        {theme.swatch.map((c, i) => (
          <span
            key={i}
            className="h-7 w-7 rounded-full"
            style={{ background: c, boxShadow: `0 0 14px ${c}` }}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color: theme.vars["--foreground"] }}>
        {theme.name}
      </p>
      <p className="mt-0.5 text-[11px]" style={{ color: theme.vars["--muted-foreground"] }}>
        {theme.tagline}
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
        {selected ? (
          <span className="flex items-center gap-1" style={{ color: theme.vars["--primary"] }}>
            <Check className="h-3.5 w-3.5" /> Active
          </span>
        ) : locked ? (
          <span className="flex items-center gap-1 text-primary font-extrabold font-mono">
            <Lock className="h-3.5 w-3.5 text-primary" /> {theme.price} 💎
          </span>
        ) : (
          <span style={{ color: theme.vars["--muted-foreground"] }}>
            {theme.premium ? "Owned" : "Free"}
          </span>
        )}
      </div>
    </button>
  );
}

function Control({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs font-black text-primary">{value}</p>
      </div>
      {children}
      {hint && <p className="mt-2 text-[10px] text-muted-foreground font-medium">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
      <div>
        <p className="text-sm font-bold text-slate-200">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
