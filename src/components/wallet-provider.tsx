import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { soundFX } from "@/lib/sound-fx";

export type WalletEntry = {
  id: string;
  label: string;
  amount: number;
  at: number;
};

export type DiceSkin = "standard" | "electric" | "flame" | "ice" | "quantum";
export type TokenSkin = "jelly" | "cyber" | "dragon";
export type ChatFrame = "none" | "cyber" | "dragon" | "love" | "royal" | "flame";
export type Gender = "male" | "female";

export type WalletState = {
  diamonds: number;
  history: WalletEntry[];
  gifts: Record<string, number>;
  wins: number;
  captures: number;
  megaPrizeTier: number;
  jackpotStreak: number;
  dailySpendLimit: number;
  // 50 Features Ecosystem Additions
  insuranceActive: boolean;
  consecutiveLosses: number;
  stockPrice: number;
  stockTrend: number[];
  stockShares: number;
  freeStars: number;
  isVip: boolean;
  tokenSkin: TokenSkin;
  activeDiceSkin: DiceSkin;
  activeBadge: string;
  unlockedBadges: string[];
  fpsMode: "60" | "120";
  soundEnabled: boolean;

  // NEW LOVE BIRDS & UNIQUE CHAT FRAMES EXTENSIONS
  userGender: Gender;
  activeChatFrame: ChatFrame;
  unlockedFrames: string[];
  loveBirdsPartner: string | null;
  loveBirdsPartnerGender: Gender | null;
  loveBirdsCount: number;
  dailyLiveSeconds: number; // Ticks up when app is active
  claimedLoveDividendToday: string | null; // Date string e.g. "Thu Sep 24 2026"
  recentMilestoneAnnouncement: string | null;
};

const INITIAL: WalletState = {
  diamonds: 1000,
  history: [],
  gifts: {},
  wins: 0,
  captures: 0,
  megaPrizeTier: 1,
  jackpotStreak: 0,
  dailySpendLimit: 0,
  insuranceActive: false,
  consecutiveLosses: 0,
  stockPrice: 100,
  stockTrend: [95, 98, 102, 99, 104, 100],
  stockShares: 0,
  freeStars: 50,
  isVip: false,
  tokenSkin: "jelly",
  activeDiceSkin: "electric",
  activeBadge: "Goti Killer",
  unlockedBadges: ["Goti Killer", "Diamond Mafia", "Lucky Sixer"],
  fpsMode: "120",
  soundEnabled: true,

  // Defaults for love birds & chat frames
  userGender: "female", // default profile can be toggled to Male or Female
  activeChatFrame: "cyber",
  unlockedFrames: ["none", "cyber", "love"],
  loveBirdsPartner: "Aarav 'GotiKiller' ⚡",
  loveBirdsPartnerGender: "male",
  loveBirdsCount: 49, // near 50 milestone!
  dailyLiveSeconds: 610, // 10 mins 10 secs so testing live requirement works smoothly
  claimedLoveDividendToday: null,
  recentMilestoneAnnouncement:
    "🎉 TODAY'S MILESTONE: Simran 💖 achieved 50 Love Birds matches and unlocked 50 💎 Daily Love Dividend!",
};

const KEY = "orbit-wallet-v3";

type Ctx = WalletState & {
  earn: (amount: number, label: string) => void;
  spend: (amount: number, label: string) => boolean;
  addGift: (giftId: string) => void;
  recordWin: () => void;
  recordLoss: () => { consolationAwarded: boolean; prize: number };
  recordCapture: (count: number) => void;
  claimMegaPrize: (tierReward: number) => void;
  resetJackpotStreak: () => void;
  setDailySpendLimit: (n: number) => void;
  setInsuranceActive: (v: boolean) => void;
  buyStock: (qty: number) => boolean;
  sellStock: (qty: number) => boolean;
  earnFreeStars: (n: number) => void;
  convertStarsToDiamonds: () => boolean;
  toggleVip: () => void;
  setTokenSkin: (skin: TokenSkin) => void;
  setActiveDiceSkin: (skin: DiceSkin) => void;
  setActiveBadge: (badge: string) => void;
  setFpsMode: (fps: "60" | "120") => void;
  toggleSound: () => void;
  spentToday: number;

  // New Love Birds & Unique Frame Actions
  setUserGender: (g: Gender) => void;
  setActiveChatFrame: (f: ChatFrame) => void;
  unlockChatFrame: (f: ChatFrame, price: number) => boolean;
  pairLoveBirds: (partnerName: string, partnerGender: Gender) => { ok: boolean; reason?: string };
  claimLoveDividend: () => { ok: boolean; message: string };
  addLiveSeconds: (sec: number) => void;
  dismissAnnouncement: () => void;
  triggerMilestoneBroadcast: (girlName: string) => void;
};

const WalletContext = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WalletState>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Live timer tracking daily active seconds (ticks up every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setState((s) => ({
        ...s,
        dailyLiveSeconds: s.dailyLiveSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hourly simulated stock market price tick
  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => {
        const delta = (Math.random() - 0.48) * 12;
        const newPrice = Math.max(40, Math.min(250, Math.round(s.stockPrice + delta)));
        const newTrend = [...s.stockTrend.slice(-9), newPrice];
        return {
          ...s,
          stockPrice: newPrice,
          stockTrend: newTrend,
        };
      });
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const commit = useCallback(
    (fn: (s: WalletState) => WalletState) =>
      setState((s) => {
        const next = fn(s);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      }),
    [],
  );

  const log = (s: WalletState, label: string, amount: number): WalletEntry[] =>
    [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        amount,
        at: Date.now(),
      },
      ...s.history,
    ].slice(0, 50);

  const earn = useCallback(
    (amount: number, label: string) => {
      soundFX.playWheelNode(1);
      commit((s) => {
        const vipMultiplier = s.isVip ? 1.25 : 1;
        const streakBonus = s.jackpotStreak > 0 ? Math.floor(amount * (s.jackpotStreak * 0.1)) : 0;
        const totalEarned = Math.round((amount + streakBonus) * vipMultiplier);

        return {
          ...s,
          diamonds: s.diamonds + totalEarned,
          consecutiveLosses: 0,
          history: log(
            s,
            s.isVip ? `${label} (VIP 1.25x)` : streakBonus > 0 ? `${label} (+Streak Bonus)` : label,
            totalEarned,
          ),
        };
      });
    },
    [commit],
  );

  const spend = useCallback(
    (amount: number, label: string) => {
      let ok = false;
      commit((s) => {
        if (s.diamonds < amount) return s;
        if (s.dailySpendLimit > 0) {
          const today = new Date().toDateString();
          const spent = s.history
            .filter((h) => h.amount < 0 && new Date(h.at).toDateString() === today)
            .reduce((a, h) => a - h.amount, 0);
          if (spent + amount > s.dailySpendLimit) return s;
        }
        ok = true;
        soundFX.playLiquidRipple();
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

  const recordWin = useCallback(() => {
    commit((s) => ({
      ...s,
      wins: s.wins + 1,
      consecutiveLosses: 0,
      jackpotStreak: s.jackpotStreak + 1,
      unlockedBadges: Array.from(new Set([...s.unlockedBadges, "Quantum Champion", "Neon Legend"])),
    }));
  }, [commit]);

  // Feature #15: Loss-to-Profit Conversion
  const recordLoss = useCallback(() => {
    let consolationAwarded = false;
    let prize = 0;
    commit((s) => {
      const nextLosses = s.consecutiveLosses + 1;
      let newDiamonds = s.diamonds;
      let newHist = s.history;
      if (nextLosses >= 3) {
        consolationAwarded = true;
        prize = 66; // Consolation diamond surprise grant!
        newDiamonds += prize;
        newHist = log(s, "🎁 Loss-to-Profit Surprise Consolation Prize", prize);
        return {
          ...s,
          diamonds: newDiamonds,
          consecutiveLosses: 0,
          jackpotStreak: 0,
          history: newHist,
        };
      }
      return {
        ...s,
        consecutiveLosses: nextLosses,
        jackpotStreak: 0,
      };
    });
    return { consolationAwarded, prize };
  }, [commit]);

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

  const setDailySpendLimit = useCallback(
    (n: number) => commit((s) => ({ ...s, dailySpendLimit: Math.max(0, n) })),
    [commit],
  );

  const setInsuranceActive = useCallback(
    (v: boolean) => commit((s) => ({ ...s, insuranceActive: v })),
    [commit],
  );

  // Feature #17: Diamond Stock Market buy / sell
  const buyStock = useCallback(
    (qty: number) => {
      let ok = false;
      commit((s) => {
        const cost = qty * s.stockPrice;
        if (s.diamonds < cost) return s;
        ok = true;
        return {
          ...s,
          diamonds: s.diamonds - cost,
          stockShares: s.stockShares + qty,
          history: log(s, `📈 Bought ${qty} Diamond Stock @ ${s.stockPrice} 💎`, -cost),
        };
      });
      return ok;
    },
    [commit],
  );

  const sellStock = useCallback(
    (qty: number) => {
      let ok = false;
      commit((s) => {
        if (s.stockShares < qty) return s;
        ok = true;
        const revenue = qty * s.stockPrice;
        return {
          ...s,
          diamonds: s.diamonds + revenue,
          stockShares: s.stockShares - qty,
          history: log(s, `📉 Sold ${qty} Diamond Stock @ ${s.stockPrice} 💎`, revenue),
        };
      });
      return ok;
    },
    [commit],
  );

  // Feature #19: Free-Play Yielding System
  const earnFreeStars = useCallback(
    (n: number) =>
      commit((s) => ({
        ...s,
        freeStars: s.freeStars + n,
      })),
    [commit],
  );

  const convertStarsToDiamonds = useCallback(() => {
    let ok = false;
    commit((s) => {
      if (s.freeStars < 20) return s;
      ok = true;
      const convertedDiamonds = Math.floor(s.freeStars / 20) * 15;
      const remainingStars = s.freeStars % 20;
      return {
        ...s,
        freeStars: remainingStars,
        diamonds: s.diamonds + convertedDiamonds,
        history: log(s, `⭐ Free Stars converted to Diamonds`, convertedDiamonds),
      };
    });
    return ok;
  }, [commit]);

  const toggleVip = useCallback(() => {
    commit((s) => ({
      ...s,
      isVip: !s.isVip,
      unlockedFrames: Array.from(new Set([...s.unlockedFrames, "royal", "cyber"])),
    }));
  }, [commit]);

  const setTokenSkin = useCallback(
    (skin: TokenSkin) => commit((s) => ({ ...s, tokenSkin: skin })),
    [commit],
  );

  const setActiveDiceSkin = useCallback(
    (skin: DiceSkin) => commit((s) => ({ ...s, activeDiceSkin: skin })),
    [commit],
  );

  const setActiveBadge = useCallback(
    (badge: string) => commit((s) => ({ ...s, activeBadge: badge })),
    [commit],
  );

  const setFpsMode = useCallback(
    (fps: "60" | "120") => commit((s) => ({ ...s, fpsMode: fps })),
    [commit],
  );

  const toggleSound = useCallback(() => {
    commit((s) => {
      const nextSound = !s.soundEnabled;
      soundFX.setEnabled(nextSound);
      return { ...s, soundEnabled: nextSound };
    });
  }, [commit]);

  // NEW LOVE BIRDS & UNIQUE CHAT FRAMES IMPLEMENTATION
  const setUserGender = useCallback(
    (gender: Gender) => commit((s) => ({ ...s, userGender: gender })),
    [commit],
  );

  const setActiveChatFrame = useCallback(
    (frame: ChatFrame) => commit((s) => ({ ...s, activeChatFrame: frame })),
    [commit],
  );

  const unlockChatFrame = useCallback(
    (frame: ChatFrame, price: number) => {
      let ok = false;
      commit((s) => {
        if (s.unlockedFrames.includes(frame)) {
          return { ...s, activeChatFrame: frame };
        }
        if (s.diamonds < price) return s;
        ok = true;
        soundFX.playSpectatorBomb("cheer");
        return {
          ...s,
          diamonds: s.diamonds - price,
          unlockedFrames: [...s.unlockedFrames, frame],
          activeChatFrame: frame,
          history: log(s, `Unlocked ${frame.toUpperCase()} Chat Frame`, -price),
        };
      });
      return ok;
    },
    [commit],
  );

  const pairLoveBirds = useCallback(
    (partnerName: string, partnerGender: Gender) => {
      let result = { ok: false, reason: "" };
      commit((s) => {
        // STRICT MALE - FEMALE MATCHING LOGIC
        if (s.userGender === partnerGender) {
          result = {
            ok: false,
            reason: `Love Birds matching strictly pairs Male ♂ and Female ♀! (You are ${s.userGender}, partner is ${partnerGender})`,
          };
          return s;
        }

        const nextCount = s.loveBirdsCount + 1;
        const reachedMilestone = nextCount === 50 || nextCount % 50 === 0;
        soundFX.playSpectatorBomb("cheer");

        result = { ok: true };
        const newAnnouncement = reachedMilestone
          ? `🎉 MILESTONE ANNOUNCEMENT: ${s.userGender === "female" ? "You" : partnerName} achieved 50 Love Birds matches today! Claim 50 💎 Daily Love Dividend!`
          : s.recentMilestoneAnnouncement;

        return {
          ...s,
          loveBirdsPartner: partnerName,
          loveBirdsPartnerGender: partnerGender,
          loveBirdsCount: nextCount,
          recentMilestoneAnnouncement: newAnnouncement,
        };
      });
      return result;
    },
    [commit],
  );

  // 50 Diamonds Daily Love-Birds Bonus Logic (Requires Male ♂ ✕ Female ♀ pairing & >= 10 mins active today)
  const claimLoveDividend = useCallback(() => {
    let result = { ok: false, message: "" };
    const today = new Date().toDateString();

    commit((s) => {
      if (!s.loveBirdsPartner) {
        result = {
          ok: false,
          message:
            "No active Love-Birds partner! Match with a compatible partner first in Voice Lounge.",
        };
        return s;
      }

      // Strictly enforce Male ♂ ✕ Female ♀ pairing
      if (s.userGender === s.loveBirdsPartnerGender) {
        result = {
          ok: false,
          message: `Love-Birds matching strictly pairs Male ♂ and Female ♀! (You are ${s.userGender}, partner is ${s.loveBirdsPartnerGender})`,
        };
        return s;
      }

      if (s.claimedLoveDividendToday === today) {
        result = {
          ok: false,
          message: "Already claimed your 50 💎 Daily Love-Birds Bonus today! Come back tomorrow.",
        };
        return s;
      }

      // 10 MINUTES LIVE REQUIREMENT CHECK (600 seconds)
      const MIN_LIVE_SECONDS = 600;
      if (s.dailyLiveSeconds < MIN_LIVE_SECONDS) {
        const remainingMinutes = Math.ceil((MIN_LIVE_SECONDS - s.dailyLiveSeconds) / 60);
        result = {
          ok: false,
          message: `Rule: Roz kam se kam 10 minutes voice room me live rehna zaroori hai! ${remainingMinutes} more minutes required. (Current: ${Math.floor(s.dailyLiveSeconds / 60)}m)`,
        };
        return s;
      }

      // Success! Grant 50 diamonds!
      soundFX.playSpectatorBomb("cheer");
      result = {
        ok: true,
        message: "💖 50 Diamonds Daily Love-Birds Bonus successfully credited to your wallet!",
      };

      return {
        ...s,
        diamonds: s.diamonds + 50,
        claimedLoveDividendToday: today,
        history: log(s, "💖 50 💎 Daily Love-Birds Bonus (10+ min live bonus)", 50),
        recentMilestoneAnnouncement: `📢 TODAY'S ANNOUNCEMENT: ${s.loveBirdsPartner} & You completed 10m voice room live and claimed 50 💎 Daily Love Dividend!`,
      };
    });

    return result;
  }, [commit]);

  const addLiveSeconds = useCallback(
    (sec: number) =>
      commit((s) => ({
        ...s,
        dailyLiveSeconds: s.dailyLiveSeconds + sec,
      })),
    [commit],
  );

  const dismissAnnouncement = useCallback(() => {
    commit((s) => ({ ...s, recentMilestoneAnnouncement: null }));
  }, [commit]);

  const triggerMilestoneBroadcast = useCallback(
    (girlName: string) => {
      commit((s) => ({
        ...s,
        recentMilestoneAnnouncement: `📢 TODAY'S ANNOUNCEMENT: ${girlName} completed 50 Love Birds matches and claimed 50 💎 Daily Love Dividend!`,
      }));
    },
    [commit],
  );

  const today = new Date().toDateString();
  const spentToday = state.history
    .filter((h) => h.amount < 0 && new Date(h.at).toDateString() === today)
    .reduce((a, h) => a - h.amount, 0);

  const value = useMemo(
    () => ({
      ...state,
      setDailySpendLimit,
      spentToday,
      earn,
      spend,
      addGift,
      recordWin,
      recordLoss,
      recordCapture,
      claimMegaPrize,
      resetJackpotStreak,
      setInsuranceActive,
      buyStock,
      sellStock,
      earnFreeStars,
      convertStarsToDiamonds,
      toggleVip,
      setTokenSkin,
      setActiveDiceSkin,
      setActiveBadge,
      setFpsMode,
      toggleSound,
      setUserGender,
      setActiveChatFrame,
      unlockChatFrame,
      pairLoveBirds,
      claimLoveDividend,
      addLiveSeconds,
      dismissAnnouncement,
      triggerMilestoneBroadcast,
    }),
    [
      state,
      setDailySpendLimit,
      spentToday,
      earn,
      spend,
      addGift,
      recordWin,
      recordLoss,
      recordCapture,
      claimMegaPrize,
      resetJackpotStreak,
      setInsuranceActive,
      buyStock,
      sellStock,
      earnFreeStars,
      convertStarsToDiamonds,
      toggleVip,
      setTokenSkin,
      setActiveDiceSkin,
      setActiveBadge,
      setFpsMode,
      toggleSound,
      setUserGender,
      setActiveChatFrame,
      unlockChatFrame,
      pairLoveBirds,
      claimLoveDividend,
      addLiveSeconds,
      dismissAnnouncement,
      triggerMilestoneBroadcast,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
