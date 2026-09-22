import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORBIT_ITEMS } from "@/lib/orbit-items";
import { useOrbit } from "@/components/orbit-provider";

const LAYOUT_ARC: Record<string, [number, number]> = {
  fan: [182, 358],
  arc: [205, 335],
  full: [0, 344],
};

export function RadialNav() {
  const { config } = useOrbit();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = ORBIT_ITEMS.slice(0, config.iconCount);
  const count = items.length;
  const speed = Math.max(0.4, config.speed);

  // Split into two rings once the fan gets crowded.
  const twoRings = count > 12;
  const innerCount = twoRings ? Math.ceil(count / 2) : count;
  const size = count > 14 ? 40 : count > 9 ? 44 : 48;

  const [startAngle, endAngle] = LAYOUT_ARC[config.layout] ?? LAYOUT_ARC.fan!;

  const place = (index: number) => {
    const ring = twoRings && index >= innerCount ? 1 : 0;
    const ringIndex = ring === 0 ? index : index - innerCount;
    const ringTotal = ring === 0 ? innerCount : count - innerCount;
    const span = endAngle - startAngle;
    const step = ringTotal > 1 ? span / (ringTotal - 1) : 0;
    const offset = ringTotal > 1 ? 0 : span / 2;
    const deg = startAngle + step * ringIndex + offset;
    const rad = (deg * Math.PI) / 180;
    const radius = config.radius + ring * (size + 24);
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
      ring,
    };
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-background/75 backdrop-blur-md transition-opacity duration-500 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        aria-label="Radial navigation"
        className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
      >
        {/* orbit rings */}
        <span
          aria-hidden="true"
          className={cn(
            "orbit-ring pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-primary/30 transition-all duration-700 ease-out",
            open ? "opacity-70" : "opacity-0",
            config.spin && open && "orbit-ring--spin",
          )}
          style={{
            width: config.radius * 2,
            height: config.radius * 2,
            transform: `translate(-50%, -50%) scale(${open ? 1 : 0.5})`,
          }}
        />
        {twoRings && (
          <span
            aria-hidden="true"
            className={cn(
              "orbit-ring pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-primary/20 transition-all duration-700 ease-out",
              open ? "opacity-60" : "opacity-0",
              config.spin && open && "orbit-ring--spin-rev",
            )}
            style={{
              width: (config.radius + size + 24) * 2,
              height: (config.radius + size + 24) * 2,
              transform: `translate(-50%, -50%) scale(${open ? 1 : 0.5})`,
            }}
          />
        )}

        {items.map((item, index) => {
          const { x, y } = place(index);
          const isActive = pathname === item.to;
          const delay = open ? (index * 38) / speed : ((count - index) * 16) / speed;

          return (
            <Link
              key={item.id}
              to={item.to}
              aria-label={item.label}
              onClick={() => setOpen(false)}
              className={cn(
                "group absolute left-1/2 top-1/2 flex items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground backdrop-blur-xl will-change-transform",
                "transition-[transform,opacity,box-shadow,background-color] duration-500 hover:scale-110 hover:border-primary/70 hover:bg-accent",
                config.glow && "orbit-node",
                isActive &&
                  "border-primary bg-primary text-primary-foreground hover:bg-primary",
                isActive && config.glow && "orbit-node--active",
              )}
              style={{
                width: size,
                height: size,
                transitionTimingFunction: open
                  ? "cubic-bezier(0.22, 1.4, 0.36, 1)"
                  : "cubic-bezier(0.4, 0, 0.2, 1)",
                transform: open
                  ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(0deg)`
                  : "translate(-50%, -50%) scale(0.2) rotate(-90deg)",
                opacity: open ? 1 : 0,
                transitionDelay: `${delay}ms`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              <item.icon
                style={{ width: size * 0.42, height: size * 0.42 }}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              {config.showLabels && (
                <span className="pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md border border-border/60 bg-card/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-200 group-hover:translate-y-0.5 group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1.4,0.36,1)] hover:scale-110 active:scale-90",
            config.glow && "orbit-core",
          )}
        >
          {config.glow && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 rounded-full",
                !open && "orbit-core-pulse",
              )}
            />
          )}
          <Plus
            className={cn(
              "relative h-7 w-7 transition-transform duration-500 ease-[cubic-bezier(0.22,1.4,0.36,1)]",
              open && "rotate-[135deg]",
            )}
          />
        </button>
      </nav>
    </>
  );
}
