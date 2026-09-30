import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Lock, Moon, RotateCcw, Settings2, Sun, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_LAUNCHER_PREFERENCES, loadLauncherPreferences, saveLauncherPreferences, type LauncherPreferences } from "@/lib/wheel-apps";

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
          <RangeCard icon={<Settings2 />} title="Icon size" description="Changes both circular orbit and favorite card icons." value={preferences.iconSize} min={46} max={74} suffix="px" onChange={(iconSize) => update({ iconSize })} />
          <RangeCard icon={<Sun />} title="Wallpaper brightness" description="Dims only the wallpaper so icons stay readable." value={preferences.brightness} min={40} max={100} suffix="%" onChange={(brightness) => update({ brightness })} />
          <RangeCard icon={<Volume2 />} title="Launcher sound" description="Controls launcher interaction sound level." value={preferences.volume} min={0} max={100} suffix="%" onChange={(volume) => update({ volume })} />
          <SettingCard icon={preferences.showLabels ? <Eye /> : <EyeOff />} title="App labels" description="Show names below icons around the orbit.">
            <Switch checked={preferences.showLabels} onCheckedChange={(checked) => update({ showLabels: checked })} aria-label="Show app labels" />
          </SettingCard>
          <SettingCard icon={<Lock />} title="App lock" description="Prevents shortcut adding, editing, deleting, and reordering.">
            <Switch checked={preferences.appLocked} onCheckedChange={(checked) => update({ appLocked: checked })} aria-label="Lock app editing" />
          </SettingCard>
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