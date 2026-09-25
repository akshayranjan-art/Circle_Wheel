import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Heart,
  Gem,
  Shield,
  Clock,
  Sparkles,
  Users,
  Flame,
  Radio,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { soundFX } from "@/lib/sound-fx";

export function GameRulesDialog() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) soundFX.playWheelHandle();
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={() => soundFX.playWheelHandle()}
          className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-black text-cyan-400 border border-cyan-500/40 hover:bg-cyan-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
          <span>
            {language === "hi"
              ? "गेम नियम गाइड"
              : language === "hi-en"
                ? "Official Game Rules (नियम)"
                : "Official Game Rules"}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border-2 border-cyan-500/50 text-white rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300">
              <BookOpen className="h-4 w-4" />
            </span>
            <DialogTitle className="neon-text text-xl font-black uppercase text-cyan-300">
              Orbit 4D Quantum Ludo — Complete Official Rules & Guidelines
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs text-slate-300 mt-2">
          {/* Rule 1: Love Birds & Female 50 Diamonds Daily */}
          <div className="rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 p-4 border border-pink-500/40 space-y-2">
            <div className="flex items-center gap-2 text-pink-400 font-black text-sm">
              <Heart className="h-4 w-4 fill-current text-pink-500 animate-pulse" />
              <span>Rule 1: Love Birds Matching & Female 50 💎 Daily Rule</span>
            </div>
            <p className="leading-relaxed">
              • <b>Strict Male-Female Matching:</b> Players select their gender profile. Love Birds
              matches strictly pair Male ♂ and Female ♀ partners based on compatibility.
            </p>
            <p className="leading-relaxed">
              • <b>50 Diamonds Daily Bonus for Girls:</b> Matched female players receive an
              automatic <b>50 Diamonds Daily Love Dividend</b>!
            </p>
            <p className="leading-relaxed">
              • <b className="text-amber-300">10-Minute Daily Live Requirement (Mandatory):</b> To
              claim the 50 💎 bonus, the player must be active / live in the arena or voice room for{" "}
              <b>at least 10 minutes daily</b>. The live timer automatically tracks minutes.
            </p>
            <p className="leading-relaxed">
              • <b>Milestone Announcement:</b> When 50 Love Birds matches occur, a global broadcast
              announces the celebration across all player screens!
            </p>
          </div>

          {/* Rule 2: Top 20 Live Items & Unique Chat Frames */}
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Rule 2: Top 20 Live Items Ticker & Animated Chat Frames</span>
            </div>
            <p className="leading-relaxed">
              • <b>100-User Live Board Ticker:</b> The top of the board features a real-time 20-item
              live feed showing active purchases, VIP plan unlocks, and player milestones.
            </p>
            <p className="leading-relaxed">
              • <b>Unique Chat Frames:</b> When players buy plans, VIP club, or special frames
              (Cyber ⚡, Dragon 🐉, Love Bird 💖, Emperor 👑, Inferno 🔥), their messages in chat
              appear with glowing animated borders!
            </p>
          </div>

          {/* Rule 3: 11-Diamond Kill Strike */}
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <Gem className="h-4 w-4 text-amber-400" />
              <span>Rule 3: The 11-Diamond Kill Strike</span>
            </div>
            <p className="leading-relaxed">
              • Whenever a player captures (cuts) an opponent's token, exactly <b>11 Diamonds</b>{" "}
              are instantly transferred from the victim's wallet to the attacker with sub-bass audio
              and matrix zoom!
            </p>
            <p className="leading-relaxed">
              • If you eliminate your marked <b>Revenge Bounty Target</b>, you earn{" "}
              <b>3X Triple Bounty (33 💎)</b>!
            </p>
          </div>

          {/* Rule 4: Diamond Insurance Shield */}
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Rule 4: Diamond Insurance Shield (30 💎)</span>
            </div>
            <p className="leading-relaxed">
              • Protect your wallet before battle! Activating the Insurance Shield prevents losing
              any diamonds even if your token gets captured.
            </p>
          </div>

          {/* Rule 5: Bankruptcy Revenge Mode */}
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-black text-sm">
              <Flame className="h-4 w-4 text-red-400" />
              <span>Rule 5: Bankruptcy Revenge Mode</span>
            </div>
            <p className="leading-relaxed">
              • If an opponent loots you down to fewer than 20 diamonds, the system triggers{" "}
              <b>Bankruptcy Revenge Mode</b>, granting a guaranteed Free Revenge Spin on the Fortune
              Wheel.
            </p>
          </div>

          {/* Rule 6: 8-Seat Lounge & Spatial Audio */}
          <div className="rounded-2xl bg-slate-900/80 p-4 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-black text-sm">
              <Users className="h-4 w-4 text-purple-400" />
              <span>Rule 6: 8-Seat Cyber Lounge & Biometric Lock</span>
            </div>
            <p className="leading-relaxed">
              • Seats 1-4 are reserved for active match players; Seats 5-8 are VIP Spectator Betting
              Seats.
            </p>
            <p className="leading-relaxed">
              • Private rooms can be locked with simulated Biometric Fingerprint / Face ID.
            </p>
          </div>

          {/* Summary checklist */}
          <div className="rounded-2xl bg-slate-900 p-3 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle className="h-4 w-4" /> Rules Verified & Active in Version 4D-v2.5
            </span>
            <Button
              size="sm"
              className="liquid-btn text-xs font-black uppercase"
              onClick={() => {
                soundFX.playLiquidRipple();
                setOpen(false);
              }}
            >
              Understood (Got it!)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
