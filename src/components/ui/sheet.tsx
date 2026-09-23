"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X, Sparkles } from "lucide-react"; // Custom design animations sync karne ke liye icon add kiya

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

// Custom Class Variance Authority rules update kiya taaki cyber-neon designs sync ho sakein
const sheetVariants = cva(
  "fixed z-50 gap-4 p-6 shadow-2xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out bg-slate-950/90 backdrop-blur-xl border-slate-800",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-cyan-500/20 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top shadow-[0_10px_40px_rgba(6,182,212,0.15)]",
        bottom:
          "inset-x-0 bottom-0 border-t border-purple-500/20 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom shadow-[0_-10px_40px_rgba(168,85,247,0.15)]",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-cyan-500/20 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-md shadow-[10px_0_40px_rgba(6,182,212,0.15)]",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l border-purple-500/20 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md shadow-[-10px_0_40px_rgba(168,85,247,0.15)]",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);
interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content 
      ref={ref} 
      className={cn(sheetVariants({ side }), "text-slate-100 ring-1 ring-white/10", className)} 
      {...props}
    >
      {/* Premium glowing mechanical close claw trigger */}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-full bg-slate-900 border border-slate-800 p-1.5 text-slate-400 opacity-80 cursor-pointer transition-all hover:opacity-100 hover:text-white hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:pointer-events-none">
        <X className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
        <span className="sr-only">Close Panel</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2.5 text-center sm:text-left border-b border-slate-900 pb-4 mb-4", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 border-t border-slate-900 pt-4 mt-6", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 flex items-center gap-1.5 uppercase", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-xs font-semibold text-slate-400 uppercase tracking-wider leading-relaxed", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
