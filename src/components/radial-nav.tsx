import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BUILT_IN_APPS, MAX_APPS, PRESET_APPS, isExternal, type WheelApp } from "@/lib/wheel-apps";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { soundFX } from "@/lib/sound-fx";

const KEY = "orbit-apps-v1";
const INNER = 16;

export function RadialNav() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<WheelApp[]>(PRESET_APPS);
  const [adding, setAdding] = useState(false);
  const [rot, setRot] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const rotRef = useRef(0);
  const vel = useRef(0);
  const last = useRef<{ a: number; t: number } | null>(null);
  const raf = useRef<number | null>(null);
  const moved = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCustom(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const saveCustom = (next: WheelApp[]) => {
    setCustom(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const apps = [...BUILT_IN_APPS, ...custom].slice(0, MAX_APPS);
  const canAdd = apps.length < MAX_APPS;
  const slots: (WheelApp | "add")[] = canAdd ? [...apps, "add"] : apps;
  const inner = slots.slice(0, INNER);
  const outer = slots.slice(INNER);

  const apply = (r: number) => {
    rotRef.current = r;
    setRot(r);
  };

  const stopInertia = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
  };

  const inertia = useCallback(() => {
    vel.current *= 0.95;
    if (Math.abs(vel.current) < 0.02) return stopInertia();
    apply(rotRef.current + vel.current);
    raf.current = requestAnimationFrame(inertia);
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const angleAt = (x: number, y: number) =>
    (Math.atan2(y - window.innerHeight / 2, x - window.innerWidth) * 180) / Math.PI;

  const onDown = (e: React.PointerEvent) => {
    stopInertia();
    moved.current = 0;
    last.current = { a: angleAt(e.clientX, e.clientY), t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!last.current) return;
    const a = angleAt(e.clientX, e.clientY);
    let d = a - last.current.a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const now = performance.now();
    vel.current = (d / Math.max(1, now - last.current.t)) * 16;
    moved.current += Math.abs(d);
    last.current = { a, t: now };
    apply(rotRef.current + d);
    if (Math.abs(d) > 3) {
      soundFX.playTick();
    }
  };
  const onUp = () => {
    last.current = null;
    raf.current = requestAnimationFrame(inertia);
  };
  const onWheel = (e: React.WheelEvent) => {
    stopInertia();
    vel.current = e.deltaY * 0.08;
    raf.current = requestAnimationFrame(inertia);
  };

  const guardClick = (e: React.MouseEvent) => {
    if (moved.current > 4) {
      e.preventDefault();
      return false;
    }
    setOpen(false);
    return true;
  };

  const renderRing = (list: (WheelApp | "add")[], radius: number, dir: 1 | -1, size: number) =>
    list.map((app, i) => {
      const a = ((i * 360) / list.length + rot * dir + 90) * (Math.PI / 180);
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      const style: React.CSSProperties = {
        width: size,
        height: size,
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      };
      const cls =
        "wheel-node group absolute left-1/2 top-1/2 flex flex-col items-center justify-center rounded-full";
      if (app === "add") {
        return (
          <button
            key="add"
            type="button"
            style={style}
            className={cn(cls, "wheel-node--add")}
            onMouseEnter={() => soundFX.playTick()}
            onClick={(e) => {
              soundFX.playWheelNode(i);
              if (moved.current <= 4) setAdding(true);
              else e.preventDefault();
            }}
            aria-label="Add app"
          >
            <Plus className="h-5 w-5" />
          </button>
        );
      }
      const inner = (
        <>
          <span className="text-xl leading-none drop-shadow">{app.emoji}</span>
          <span className="wheel-label">{app.label}</span>
        </>
      );
      const active = pathname === app.to;
      return isExternal(app.to) ? (
        <a
          key={app.id}
          href={app.to}
          target="_blank"
          rel="noreferrer"
          style={style}
          className={cls}
          onMouseEnter={() => soundFX.playTick()}
          onClick={(e) => {
            soundFX.playWheelNode(i);
            guardClick(e);
          }}
          draggable={false}
        >
          {inner}
        </a>
      ) : (
        <Link
          key={app.id}
          to={app.to}
          style={style}
          className={cn(cls, active && "wheel-node--active")}
          onMouseEnter={() => soundFX.playTick()}
          onClick={(e) => {
            soundFX.playWheelNode(i);
            guardClick(e);
          }}
          draggable={false}
        >
          {inner}
        </Link>
      );
    });

  return (
    <>
      {/* Edge handle */}
      <button
        type="button"
        aria-label="Open app wheel"
        onClick={() => {
          soundFX.playWheelHandle();
          setOpen(true);
        }}
        onMouseEnter={() => soundFX.playTick()}
        className={cn("wheel-handle", open && "pointer-events-none opacity-0")}
      >
        <span className="wheel-handle-dot" />
      </button>

      <div
        onClick={() => {
          soundFX.playLiquidRipple();
          setOpen(false);
        }}
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-md transition-opacity duration-500",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <nav
        aria-label="App wheel"
        className={cn("wheel-shell", open && "wheel-shell--open")}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
      >
        <span className="wheel-ring" style={{ width: 300, height: 300 }} />
        <span className="wheel-ring wheel-ring--outer" style={{ width: 480, height: 480 }} />
        {renderRing(inner, 150, 1, 56)}
        {renderRing(outer, 240, -1, 52)}
        <button
          type="button"
          onClick={() => {
            soundFX.playLiquidRipple();
            setOpen(false);
          }}
          className="wheel-core absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          aria-label="Close"
        >
          <X className="h-7 w-7" />
        </button>
      </nav>

      <AddAppDialog
        open={adding}
        onOpenChange={setAdding}
        custom={custom}
        total={apps.length}
        onSave={saveCustom}
      />
    </>
  );
}

function AddAppDialog({
  open,
  onOpenChange,
  custom,
  total,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  custom: WheelApp[];
  total: number;
  onSave: (v: WheelApp[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [emoji, setEmoji] = useState("⭐");

  const add = () => {
    if (!label.trim() || !url.trim()) {
      toast.error("Naam aur link dono daalo");
      return;
    }
    if (total >= MAX_APPS) {
      toast.error("40 apps full ho gaye");
      return;
    }
    const to = /^[a-z]+:\/\//i.test(url) || url.startsWith("/") ? url : `https://${url}`;
    onSave([
      ...custom,
      { id: `c-${Date.now()}`, label: label.trim(), to, emoji: emoji || "⭐", custom: true },
    ]);
    setLabel("");
    setUrl("");
    toast.success(`${label} wheel me add ho gaya`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="neon-panel max-w-md">
        <DialogHeader>
          <DialogTitle>
            Apna app add karo ({total}/{MAX_APPS})
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <Input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
            aria-label="Emoji"
          />
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="App ka naam"
          />
        </div>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Link, jaise youtube.com ya whatsapp://"
        />
        <Button onClick={add}>Wheel me add karo</Button>
        <div className="max-h-56 space-y-1 overflow-auto">
          {custom.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1 text-sm"
            >
              <span>{a.emoji}</span>
              <span className="min-w-0 flex-1 truncate">{a.label}</span>
              <button
                aria-label={`Remove ${a.label}`}
                onClick={() => onSave(custom.filter((c) => c.id !== a.id))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
