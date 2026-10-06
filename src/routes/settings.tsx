import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Eye, EyeOff, Lock, Moon, RotateCcw, Settings2, Sparkles, Sun, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_LAUNCHER_PREFERENCES, loadLauncherPreferences, saveLauncherPreferences, type LauncherIconPack, type LauncherPreferences } from "@/lib/wheel-apps";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Launcher Settings — Orbit Menu" },
      { name: "description", content: "Adjust Orbit Menu icon size, labels, appearance, brightness, sound, and app lock." },
      { property: "og:title", content: "Launcher Settings — Orbit Menu" },
      { property: "og:description", content: "Personalize the circular phone launcher and its quick controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [preferences, setPreferences] = useState<LauncherPreferences>(DEFAULT_LAUNCHER_PREFERENCES);

  useEffect(() => setPreferences(loadLauncherPreferences()), []);
  useEffect(() => {
    saveLauncherPreferences(preferences);
    document.documentElement.classList.toggle("dark", preferences.darkMode);
  }, [preferences]);

  const update = (patch: Partial<LauncherPreferences>) => setPreferences((value) => ({ ...value, ...patch }));

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center gap-3 border-b border-border pb-5">
          <Button asChild variant="outline" size="icon"><Link to="/" aria-label="Back to launcher"><ArrowLeft /></Link></Button>
          <div><p className="text-xs font-semibold uppercase text-primary">Orbit Menu</p><h1 className="text-3xl font-semibold">Launcher settings</h1></div>
        </header>

        <section className="mt-7 space-y-4">
          <SettingCard icon={preferences.darkMode ? <Moon /> : <Sun />} title="Appearance" description="Switch between light and dark launcher surfaces.">
            <Switch checked={preferences.darkMode} onCheckedChange={(checked) => update({ darkMode: checked })} aria-label="Dark appearance" />
          </SettingCard>
          <RangeCard icon={<Settings2 />} title="Orbit icon size" description="Changes icons on the circular rail." value={preferences.iconSize} min={46} max={82} suffix="px" onChange={(iconSize) => update({ iconSize })} />
          <RangeCard icon={<Settings2 />} title="Edge icon size" description="Changes icons on the independent left rail." value={preferences.leftIconSize} min={40} max={68} suffix="px" onChange={(leftIconSize) => update({ leftIconSize })} />
          <RangeCard icon={<Settings2 />} title="Icon opacity" description="Kam karo to icons transparent, zyada karo to solid." value={preferences.iconOpacity} min={30} max={100} suffix="%" onChange={(iconOpacity) => update({ iconOpacity })} />
          <RangeCard icon={<Settings2 />} title="Side apps visible" description="Side rail me ek saath kitne apps dikhein (3–10)." value={preferences.edgeVisible} min={3} max={10} suffix="" onChange={(edgeVisible) => update({ edgeVisible })} />
          <RangeCard icon={<Sun />} title="Wallpaper brightness" description="Dims only the wallpaper so icons stay readable." value={preferences.brightness} min={40} max={100} suffix="%" onChange={(brightness) => update({ brightness })} />
          <RangeCard icon={<Volume2 />} title="Launcher sound" description="Controls launcher interaction sound level." value={preferences.volume} min={0} max={100} suffix="%" onChange={(volume) => update({ volume })} />
          <SettingCard icon={preferences.showLabels ? <Eye /> : <EyeOff />} title="App labels" description="Show names below icons around the orbit.">
            <Switch checked={preferences.showLabels} onCheckedChange={(checked) => update({ showLabels: checked })} aria-label="Show app labels" />
          </SettingCard>
          <SettingCard icon={<Lock />} title="App lock" description="Prevents shortcut adding, editing, deleting, and reordering.">
            <Switch checked={preferences.appLocked} onCheckedChange={(checked) => update({ appLocked: checked })} aria-label="Lock app editing" />
          </SettingCard>
          <div className="rounded-lg border border-primary/35 bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3"><Sparkles className="mt-1 h-5 w-5 text-primary" /><div><h2 className="font-semibold">Icon packs</h2><p className="text-sm text-muted-foreground">Neon Line · Free. Premium packs · ₹99 each.</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{(["neon-line", "glossy-3d", "midnight-gold", "liquid-4d"] as LauncherIconPack[]).map((pack) => { const paid = pack !== "neon-line"; const active = preferences.iconPack === pack; return <Button key={pack} variant={active ? "default" : "outline"} aria-pressed={active} className="h-auto min-h-28 flex-col gap-2 px-2 py-3" onClick={() => { update({ iconPack: pack }); if (paid && !preferences.premiumPreview) toast.info("₹99 pack preview applied — checkout unavailable, no payment charged."); }}><span className={`launcher-pack-sample launcher-icon-pack--${pack}`} data-tone="emerald"><Sparkles className="h-5 w-5" /></span><span className="text-xs capitalize">{pack.replace("-", " ")}</span><small>{paid ? "₹99" : "Free"}</small>{active && <Check className="h-3 w-3" />}</Button>; })}</div>
            <p className="mt-3 text-xs text-muted-foreground">Preview only · Purchases unavailable</p>
          </div>
          <div className="rounded-lg border border-primary/40 bg-card p-4 shadow-sm"><div className="flex items-start gap-3"><Crown className="mt-1 h-5 w-5 text-primary" /><div className="min-w-0 flex-1"><h2 className="font-semibold">Dual-scroll Lifetime</h2><p className="text-sm text-muted-foreground">40 orbit apps + 40 edge apps, premium icon packs, larger sizing, and independent customization.</p></div><b className="text-primary">₹499</b></div><Button className="mt-4 w-full" onClick={() => update({ premiumPreview: !preferences.premiumPreview })}>{preferences.premiumPreview ? "Disable premium preview" : "Preview lifetime access"}</Button><p className="mt-2 text-center text-[11px] text-muted-foreground">Preview only — no payment is charged.</p></div>
        </section>

        <Button variant="outline" className="mt-7 w-full" onClick={() => { setPreferences(DEFAULT_LAUNCHER_PREFERENCES); toast.success("Launcher settings reset"); }}><RotateCcw /> Reset launcher settings</Button>
      </div>
    </main>
  );
}

function SettingCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"><span className="text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>{children}</div>;
}

function RangeCard({ icon, title, description, value, min, max, suffix, onChange }: { icon: React.ReactNode; title: string; description: string; value: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) {
  return <div className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="flex items-start gap-3"><span className="text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><h2 className="font-semibold">{title}</h2><b className="text-sm text-primary">{value}{suffix}</b></div><p className="text-sm text-muted-foreground">{description}</p></div></div><input className="mt-4 w-full accent-primary" type="range" min={min} max={max} step="2" value={value} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}