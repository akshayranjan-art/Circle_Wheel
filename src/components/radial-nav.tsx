import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Compass,
  Home,
  MessageCircle,
  Plus,
  PlusCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/create", label: "Create", icon: PlusCircle },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const RADIUS = 136;
const START_ANGLE = 188;
const END_ANGLE = 352;

export function RadialNav() {
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

  const count = items.length;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        aria-label="Radial navigation"
        className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
      >
        {items.map((item, index) => {
          const angle =
            ((START_ANGLE + ((END_ANGLE - START_ANGLE) * index) / (count - 1)) *
              Math.PI) /
            180;
          const x = Math.cos(angle) * RADIUS;
          const y = Math.sin(angle) * RADIUS;
          const isActive = pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              onClick={() => setOpen(false)}
              className={cn(
                "group absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center rounded-full border bg-card text-foreground shadow-lg transition-all duration-300 ease-out hover:bg-accent hover:text-accent-foreground",
                isActive &&
                  "border-primary bg-primary text-primary-foreground hover:bg-primary",
              )}
              style={{
                transform: open
                  ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                  : "translate(-50%, -50%) scale(0.3)",
                opacity: open ? 1 : 0,
                transitionDelay: open
                  ? `${index * 45}ms`
                  : `${(count - 1 - index) * 20}ms`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-xs font-medium text-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <Plus
            className={cn(
              "h-7 w-7 transition-transform duration-300",
              open && "rotate-45",
            )}
          />
        </button>
      </nav>
    </>
  );
}
