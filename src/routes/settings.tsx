import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ORBIT_THEMES, type OrbitTheme } from "@/lib/orbit-themes";
import { ORBIT_ITEMS } from "@/lib/orbit-items";
import { useOrbit } from "@/components/orbit-provider";
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
      { title: "Control Deck — Orbit" },
      {
        name: "description",
        content:
          "Pick one of 10 sci-fi neon themes and tune your radial menu up to 20 icons.",
      },
      { property: "og:title", content: "Control Deck — Orbit" },
      {
        property: "og:description",
        content:
          "Pick one of 10 sci-fi neon themes and tune your radial menu up to 20 icons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { config, update, unlock, reset } = useOrbit();
  const [pending, setPending] = useState<OrbitTheme | null>(null);

  const free = ORBIT_THEMES.filter((t) => !t.premium);
  const premium = ORBIT_THEMES.filter((t) => t.premium);

  const pick = (theme: OrbitTheme) => {
    if (theme.premium && !config.unlocked.includes(theme.id)) {
      setPending(theme);
      return;
    }
    update({ themeId: theme.id });
    toast.success(`${theme.name} engaged`);
  };

  const confirmUnlock = () => {
    if (!pending) return;
    unlock(pending.id);
    toast.success(`${pending.name} unlocked`, {
      description: "Premium skin activated on this device.",
    });
    setPending(null);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-56 pt-16">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
        Control Deck
      </p>
      <h1 className="neon-text mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Build your orbit.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Ten sci-fi neon skins, five free and five premium, plus full control of
        the radial menu — up to 20 icons in orbit.
      </p>

      <Section title="Free skins" hint="5 included">
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

      <Section title="Premium skins" hint="5 unlockable">
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

      <Section title="Orbit layout" hint={`${config.iconCount} / 20 icons`}>
        <div className="neon-panel space-y-7 rounded-2xl p-6">
          <Control
            label="Icons in orbit"
            value={`${config.iconCount}`}
            hint={`Next up: ${ORBIT_ITEMS[config.iconCount]?.label ?? "max reached"}`}
          >
            <Slider
              value={[config.iconCount]}
              min={3}
              max={20}
              step={1}
              onValueChange={([v]) => update({ iconCount: v ?? 6 })}
            />
          </Control>

          <Control label="Orbit radius" value={`${config.radius}px`}>
            <Slider
              value={[config.radius]}
              min={100}
              max={220}
              step={4}
              onValueChange={([v]) => update({ radius: v ?? 140 })}
            />
          </Control>

          <Control
            label="Animation speed"
            value={`${config.speed.toFixed(1)}x`}
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
            <p className="mb-3 text-sm font-medium">Spread</p>
            <div className="flex flex-wrap gap-2">
              {(["arc", "fan", "full"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update({ layout: l })}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300",
                    config.layout === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Toggle
            label="Neon glow"
            description="Halo and pulse effects around the core."
            checked={config.glow}
            onChange={(v) => update({ glow: v })}
          />
          <Toggle
            label="Spinning rings"
            description="Slow rotating orbit guides."
            checked={config.spin}
            onChange={(v) => update({ spin: v })}
          />
          <Toggle
            label="Icon labels"
            description="Show a name under each icon on hover."
            checked={config.showLabels}
            onChange={(v) => update({ showLabels: v })}
          />

          <Button variant="outline" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
      </Section>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Unlock {pending?.name}
            </DialogTitle>
            <DialogDescription>
              {pending?.tagline} — a premium neon skin for ₹{pending?.price}.
              This is a demo unlock: no payment is taken and the skin is saved
              on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Not now
            </Button>
            <Button onClick={confirmUnlock}>Unlock skin</Button>
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
    <section className="mt-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && (
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
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
      <div className="flex h-16 items-center justify-center gap-1.5 rounded-xl"
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
      <p
        className="mt-3 text-sm font-semibold"
        style={{ color: theme.vars["--foreground"] }}
      >
        {theme.name}
      </p>
      <p
        className="mt-0.5 text-[11px]"
        style={{ color: theme.vars["--muted-foreground"] }}
      >
        {theme.tagline}
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
        {selected ? (
          <span className="flex items-center gap-1" style={{ color: theme.vars["--primary"] }}>
            <Check className="h-3.5 w-3.5" /> Active
          </span>
        ) : locked ? (
          <span className="flex items-center gap-1" style={{ color: theme.vars["--primary"] }}>
            <Lock className="h-3.5 w-3.5" /> ₹{theme.price}
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
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs font-semibold text-primary">{value}</p>
      </div>
      {children}
      {hint && <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>}
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
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
