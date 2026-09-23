"use client";

import { GripVertical, Sparkles } from "lucide-react"; // System visuals align karne ke liye template icon connect kiya
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof Group>) => (
  <Group
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col text-slate-100", className)}
    {...props}
  />
);

const ResizablePanel = Panel;
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-slate-800 transition-colors duration-300 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500",
      // Active dragging par splitter edge lines cyan-neon neon flash pulses ban jayengi!
      "data-[resize-handle-state=drag]:bg-gradient-to-b data-[resize-handle-state=drag]:from-cyan-400 data-[resize-handle-state=drag]:to-purple-500 data-[resize-handle-state=drag]:shadow-[0_0_15px_rgba(6,182,212,0.6)]",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-2 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-20 flex h-5 w-3.5 items-center justify-center rounded-md border border-slate-700 bg-slate-950 shadow-2xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] group-data-[resize-handle-state=drag]:border-purple-400">
        <GripVertical className="h-2.5 w-2.5 text-slate-400 transition-colors group-hover:text-cyan-400" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
