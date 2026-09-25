"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-slate-800 bg-slate-900 shadow-inner transition-all duration-300 core-switch",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950",
      "disabled:cursor-not-allowed disabled:opacity-40",
      // Toggle ON hote hi cyberpunk electric gradient background trigger ho jayegi!
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-transparent data-[state=checked]:shadow-[0_0_15px_rgba(6,182,212,0.4)]",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 will-change-transform",
        "data-[state=checked]:translate-x-4 data-[state=checked]:scale-105 data-[state=checked]:bg-slate-950 data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-slate-400",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
