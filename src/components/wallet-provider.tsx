import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WalletEntry = {
  id: string;
  label: string;
  amount: number;
  at: number;
};

// State ko expand kiya taaki real-time prizes aur reward badges track ho sakein
type WalletState = {
  diamonds: number;
  history: WalletEntry[];
  gifts: Record<string, number>;
  wins: number;
  captures: number;
  megaPrizeTier: number;    // Tracking custom unlock tiers
  jackpotStreak: number;    // Daily continuous win streak multiplier
};

const INITIAL: WalletState = {
  diamonds: 1000, // Shuruat mein hi player ko heavy welcome bonus points diye!
  history: [],
  gifts: {},
  wins: 0,
  captures: 0,
  megaPrizeTier: 1,
  jackpotStreak: 0,
};

const KEY = "orbit-wallet-v1";
type Ctx = WalletState & {
  earn: (amount: number, label: string) => void;
  spend: (amount: number, label: string) => boolean;
  addGift: (giftId: string) => void;
  recordWin: () => void;
  recordCapture: (count: number) => void;
  claimMegaPrize: (tierReward: number) => void; // Naya method premium rewards engine trigger ke liye
  resetJackpotStreak: () => void;
};

const WalletContext = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as WalletState) }));
    } catch {
      /* ignore storage sync failures */
    }
  }, []);

  const commit = useCallback(
    (fn: (s: WalletState) => WalletState) =>
      setState((s) => {
        const next = fn(s);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore storage sync failures */
        }
        return next;
      }),
    [],
  );
  const log = (s: WalletState, label: string, amount: number): WalletEntry[] =>
    [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, amount, at: Date.now() },
      ...s.history,
    ].slice(0, 40);

  const earn = useCallback(
    (amount: number, label: string) =>
      commit((s) => {
        // Multiplier Logic: Streak ke hisab se har earning par bonus badhega
        const streakBonus = s.jackpotStreak > 0 ? Math.floor(amount * (s.jackpotStreak * 0.1)) : 0;
        const totalEarned = amount + streakBonus;
        
        return {
          ...s,
          diamonds: s.diamonds + totalEarned,
          history: log(s, streakBonus > 0 ? `${label} (+Streak Bonus)` : label, totalEarned),
        };
      }),
    [commit],
  );

  const spend = useCallback(
    (amount: number, label: string) => {
      let ok = false;
      commit((s) => {
        if (s.diamonds < amount) return s;
        ok = true;
        return {
          ...s,
          diamonds: s.diamonds - amount,
          history: log(s, label, -amount),
        };
      });
      return ok;
    },
    [commit],
  );
  const addGift = useCallback(
    (giftId: string) =>
      commit((s) => ({
        ...s,
        gifts: { ...s.gifts, [giftId]: (s.gifts[giftId] ?? 0) + 1 },
      })),
    [commit],
  );

  const recordWin = useCallback(
    () =>
      commit((s) => ({
        ...s,
        wins: s.wins + 1,
        jackpotStreak: s.jackpotStreak + 1, // Har win par streak badhegi aur prize double hoga
      })),
    [commit],
  );

  const recordCapture = useCallback(
    (count: number) => commit((s) => ({ ...s, captures: s.captures + count })),
    [commit],
  );

  const claimMegaPrize = useCallback(
    (tierReward: number) =>
      commit((s) => ({
        ...s,
        diamonds: s.diamonds + tierReward,
        megaPrizeTier: s.megaPrizeTier + 1,
        history: log(s, `🎁 Unlocked Tier ${s.megaPrizeTier} Mega Reward!`, tierReward),
      })),
    [commit],
  );

  const resetJackpotStreak = useCallback(
    () => commit((s) => ({ ...s, jackpotStreak: 0 })),
    [commit],
  );

  const value = useMemo(
    () => ({
      ...state,
      earn,
      spend,
      addGift,
      recordWin,
      recordCapture,
      claimMegaPrize,
      resetJackpotStreak,
    }),
    [state, earn, spend, addGift, recordWin, recordCapture, claimMegaPrize, resetJackpotStreak],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
