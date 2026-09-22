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

type WalletState = {
  diamonds: number;
  history: WalletEntry[];
  gifts: Record<string, number>;
  wins: number;
  captures: number;
};

const INITIAL: WalletState = {
  diamonds: 100,
  history: [],
  gifts: {},
  wins: 0,
  captures: 0,
};

const KEY = "orbit-wallet-v1";

type Ctx = WalletState & {
  earn: (amount: number, label: string) => void;
  spend: (amount: number, label: string) => boolean;
  addGift: (giftId: string) => void;
  recordWin: () => void;
  recordCapture: (count: number) => void;
};

const WalletContext = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as WalletState) }));
    } catch {
      /* ignore */
    }
  }, []);

  const commit = useCallback(
    (fn: (s: WalletState) => WalletState) =>
      setState((s) => {
        const next = fn(s);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
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
      commit((s) => ({
        ...s,
        diamonds: s.diamonds + amount,
        history: log(s, label, amount),
      })),
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
    () => commit((s) => ({ ...s, wins: s.wins + 1 })),
    [commit],
  );

  const recordCapture = useCallback(
    (count: number) => commit((s) => ({ ...s, captures: s.captures + count })),
    [commit],
  );

  const value = useMemo(
    () => ({ ...state, earn, spend, addGift, recordWin, recordCapture }),
    [state, earn, spend, addGift, recordWin, recordCapture],
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
