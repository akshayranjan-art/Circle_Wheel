import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, Mic, MicOff, Send, UserPlus, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Voice Rooms & Chat — Orbit Ludo" },
      { name: "description", content: "8-seat lockable voice rooms, group chat, private chat, friends and grand vehicle entries." },
      { property: "og:title", content: "Voice Rooms & Chat — Orbit Ludo" },
      { property: "og:description", content: "Lock rooms, grab a seat, chat with friends and make a grand entry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rooms,
});

const VEHICLES = [
  { id: "bike", name: "Superbike", emoji: "🏍️", price: 0 },
  { id: "car", name: "Sports Car", emoji: "🏎️", price: 300 },
  { id: "lion", name: "Royal Lion", emoji: "🦁", price: 800 },
  { id: "jet", name: "Fighter Jet", emoji: "✈️", price: 1500 },
  { id: "ufo", name: "Neon UFO", emoji: "🛸", price: 3000 },
  { id: "dragon", name: "Fire Dragon", emoji: "🐉", price: 6000 },
];
const BOTS: string[] = ["Priya ✨", "Raja King", "Neon Queen", "Dice Don", "Rani 💖"];
const REPLIES = ["Haha 😂", "Chalo ek match ho jaye 🎲", "Gift bhejo na 🎁", "Goti kaat dunga 😎", "Welcome bhai 🔥", "Kya scene hai?"];

type Msg = { from: string; text: string };

function Rooms() {
  const { spend } = useWallet();
  const [seats, setSeats] = useState<(string | null)[]>(["Raja King", null, "Priya ✨", null, null, "Dice Don", null, null]);
  const [locked, setLocked] = useState<boolean[]>(Array(8).fill(false));
  const [roomLocked, setRoomLocked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [owned, setOwned] = useState<string[]>(["bike"]);
  const [ride, setRide] = useState("bike");
  const [entry, setEntry] = useState<string | null>(null);
  const [tab, setTab] = useState<"room" | "private">("room");
  const [dm, setDm] = useState<string>("Priya ✨");
  const [friends, setFriends] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({ room: [{ from: "Raja King", text: "Swagat hai room me! 🔥" }] });
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const key = tab === "room" ? "room" : dm;
  const mySeat = seats.indexOf("You");

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, key]);

  const push = (k: string, m: Msg) => setMsgs((s) => ({ ...s, [k]: [...(s[k] ?? []), m] }));

  const send = () => {
    if (!text.trim()) return;
    push(key, { from: "You", text });
    setText("");
    const who = (tab === "room" ? BOTS[Math.floor(Math.random() * BOTS.length)] : dm) ?? "Bot";
    setTimeout(() => push(key, { from: who, text: REPLIES[Math.floor(Math.random() * REPLIES.length)] ?? "🔥" }), 900);
  };

  const sit = (i: number) => {
    if (seats[i] && seats[i] !== "You") { toast("Seat bhari hai"); return; }
    if (locked[i] && seats[i] !== "You") { toast.error("Seat locked 🔒"); return; }
    if (seats[i] === "You") {
      setSeats((s) => s.map((v) => (v === "You" ? null : v)));
      return;
    }
    setSeats((s) => s.map((v, j) => (j === i ? "You" : v === "You" ? null : v)));
    if (mySeat === -1) {
      setEntry(ride);
      setTimeout(() => setEntry(null), 2800);
    }
  };

  const buyRide = (v: (typeof VEHICLES)[number]) => {
    if (owned.includes(v.id)) { setRide(v.id); return; }
    if (!spend(v.price, `Entry vehicle: ${v.name}`)) { toast.error("Diamonds kam hain"); return; }
    setOwned((o) => [...o, v.id]);
    setRide(v.id);
    toast.success(`${v.emoji} ${v.name} unlocked!`);
  };

  const vehicle = VEHICLES.find((v) => v.id === entry);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-10">
      {vehicle && (
        <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center">
          <div className="entry-vehicle text-center">
            <div className="text-8xl drop-shadow-[0_0_30px_var(--neon-1)]">{vehicle.emoji}</div>
            <p className="neon-text mt-2 text-xl font-black">You ne grand entry maari!</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Live voice room</p>
          <h1 className="neon-text truncate text-3xl font-black">Viking Adda 🔥</h1>
        </div>
        <button className="liquid-btn shrink-0 !px-4 !py-2 text-sm" onClick={() => { setRoomLocked((v) => !v); toast(roomLocked ? "Room unlocked" : "Room locked — sirf friends aa sakte hain"); }}>
          {roomLocked ? <Lock className="inline h-4 w-4" /> : <Unlock className="inline h-4 w-4" />} {roomLocked ? "Private" : "Public"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {seats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <button
              onClick={() => sit(i)}
              className={cn("wheel-node relative grid h-16 w-16 place-items-center rounded-full text-lg font-black", s === "You" && !muted && "orbit-core-pulse")}
            >
              {locked[i] && !s ? <Lock className="h-5 w-5" /> : s ? s[0] : <span className="text-xs opacity-70">+{i + 1}</span>}
            </button>
            <span className="max-w-full truncate text-[11px]">{s ?? (locked[i] ? "Locked" : "Empty")}</span>
            <button className="text-[10px] text-muted-foreground underline" onClick={() => setLocked((l) => l.map((v, j) => (j === i ? !v : v)))}>
              {locked[i] ? "unlock" : "lock"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button className="liquid-btn" disabled={mySeat === -1} onClick={() => setMuted((m) => !m)}>
          {muted ? <MicOff className="inline h-4 w-4" /> : <Mic className="inline h-4 w-4" />} {mySeat === -1 ? "Pehle seat lo" : muted ? "Unmute" : "Mute"}
        </button>
      </div>

      <h2 className="mt-8 font-bold">Entry vehicle</h2>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
        {VEHICLES.map((v) => (
          <button key={v.id} onClick={() => buyRide(v)} className={cn("neon-panel shrink-0 rounded-2xl px-4 py-3 text-center", ride === v.id && "ring-2 ring-primary")}>
            <div className="text-3xl">{v.emoji}</div>
            <div className="text-xs font-bold">{v.name}</div>
            <div className="text-[10px] text-muted-foreground">{owned.includes(v.id) ? "Owned" : `${v.price} 💎`}</div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        <button onClick={() => setTab("room")} className={cn("rounded-full px-4 py-1.5 text-sm font-bold", tab === "room" ? "bg-primary text-primary-foreground" : "bg-muted")}>Room chat</button>
        <button onClick={() => setTab("private")} className={cn("rounded-full px-4 py-1.5 text-sm font-bold", tab === "private" ? "bg-primary text-primary-foreground" : "bg-muted")}>Private chat 🔒</button>
      </div>

      {tab === "private" && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {BOTS.map((b) => (
            <div key={b} className={cn("flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs", dm === b ? "border-primary" : "border-border")}>
              <button onClick={() => setDm(b)}>{b}</button>
              <button aria-label={`Add ${b}`} onClick={() => { setFriends((f) => f.includes(b) ? f : [...f, b]); toast.success(`${b} ab aapka dost hai 🤝`); }}>
                <UserPlus className={cn("h-3.5 w-3.5", friends.includes(b) && "text-primary")} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="neon-panel mt-3 h-72 overflow-y-auto rounded-2xl p-3">
        {(msgs[key] ?? []).map((m, i) => (
          <div key={i} className={cn("mb-2 flex", m.from === "You" && "justify-end")}>
            <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm", m.from === "You" ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {m.from !== "You" && <div className="text-[10px] font-bold text-primary">{m.from}</div>}
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={tab === "room" ? "Room me likho…" : `${dm} ko message…`} />
        <button className="liquid-btn !px-4" aria-label="Send"><Send className="h-4 w-4" /></button>
      </form>
    </main>
  );
}
