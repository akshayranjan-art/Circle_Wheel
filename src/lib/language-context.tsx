import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "hi-en";

export interface Translations {
  appName: string;
  ludoArena: string;
  rollDice: string;
  rolling: string;
  yourTurn: string;
  soundboard: string;
  diamonds: string;
  bountyTarget: string;
  revengeStrike: string;
  insuranceActive: string;
  weather: string;
  ghostMode: string;
  suddenDeath: string;
  timeWarp: string;
  streamLive: string;
  voiceRoom: string;
  clanLounge: string;
  spectatorSeats: string;
  biometricLock: string;
  fingerprintScan: string;
  voiceModulator: string;
  sendGift: string;
  stockMarket: string;
  trophyWall: string;
  hallOfFame: string;
  revengeWheel: string;
  neonClubVip: string;
  cashoutExchange: string;
  resetArena: string;
  languageSelect: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: "Orbit 4D Quantum Ludo",
    ludoArena: "4D Neon Super Ludo Arena",
    rollDice: "BOOSTER ROLL",
    rolling: "ROLLING...",
    yourTurn: "Your ultimate turn — roll the dice!",
    soundboard: "Trash Talk & Sound Memes",
    diamonds: "Diamonds",
    bountyTarget: "Bounty Target",
    revengeStrike: "11-Diamond Kill Strike",
    insuranceActive: "Diamond Insurance Active",
    weather: "Weather Arena",
    ghostMode: "Ghost Power Mode",
    suddenDeath: "Sudden Death Lava Zone",
    timeWarp: "Time-Warp 2X Speed",
    streamLive: "Live Stream Hub",
    voiceRoom: "8-Seat Cyber Lounge",
    clanLounge: "Tribal Clan 50-Seat Lounge",
    spectatorSeats: "VIP Spectator Betting Seats",
    biometricLock: "Biometric Touch & Face ID Lock",
    fingerprintScan: "Hold Fingerprint to Unlock",
    voiceModulator: "AI Voice Modulator",
    sendGift: "Send 4D Virtual Gift",
    stockMarket: "Diamond Stock Exchange",
    trophyWall: "Loser Trophy Wall",
    hallOfFame: "Daily Jackpot Hall of Fame",
    revengeWheel: "Bankruptcy Revenge Wheel",
    neonClubVip: "VIP Neon Club Pass",
    cashoutExchange: "Instant Rewards Cashout",
    resetArena: "Reset Arena",
    languageSelect: "Language",
  },
  hi: {
    appName: "ऑर्बिट 4D क्वांटम लूडो",
    ludoArena: "4D नियॉन सुपर लूडो अखाड़ा",
    rollDice: "पासा फेंको (बूस्टर)",
    rolling: "पासा घूम रहा है...",
    yourTurn: "आपकी बारी है — पासा फेंकें!",
    soundboard: "डायलॉग और साउंड मीम्स",
    diamonds: "हीरे (डायमंड्स)",
    bountyTarget: "बदला टारगेट",
    revengeStrike: "11-डायमंड किल स्ट्राइक",
    insuranceActive: "डायमंड बीमा सक्रिय",
    weather: "मौसम नियंत्रण क्षेत्र",
    ghostMode: "भूतिया मोड (अदृश्य गोटी)",
    suddenDeath: "सडन डेथ लावा ज़ोन",
    timeWarp: "टाइम-वार्प 2x रफ़्तार",
    streamLive: "लाइव स्ट्रीमिंग केंद्र",
    voiceRoom: "8-सीट साइबर वॉइस रूम",
    clanLounge: "ट्राइबल कबीला लाउंज",
    spectatorSeats: "VIP दर्शक सट्टा सीटें",
    biometricLock: "बायोमेट्रिक फिंगरप्रिंट लॉक",
    fingerprintScan: "अनलॉक करने के लिए फिंगरप्रिंट दबाएं",
    voiceModulator: "AI आवाज़ परिवर्तक",
    sendGift: "4D वर्चुअल उपहार भेजें",
    stockMarket: "डायमंड शेयर बाज़ार",
    trophyWall: "पराजित विरोधियों की ट्रॉफी दीवार",
    hallOfFame: "दैनिक जैकपॉट हॉल ऑफ़ फेम",
    revengeWheel: "कंगाल बदला स्पिन पहिया",
    neonClubVip: "VIP नियॉन क्लब पास",
    cashoutExchange: "त्वरित ईनाम रिडीम",
    resetArena: "बोर्ड रीसेट करें",
    languageSelect: "भाषा",
  },
  "hi-en": {
    appName: "Orbit 4D Quantum Ludo",
    ludoArena: "4D Neon Super Ludo Arena",
    rollDice: "Booster Roll Karo",
    rolling: "Dice ghoom raha hai...",
    yourTurn: "Aapki baari hai — Dice roll karo!",
    soundboard: "Trash Talk & Sound Memes",
    diamonds: "Diamonds (💎)",
    bountyTarget: "Revenge Target Bot",
    revengeStrike: "11-Diamond Kill Strike (Loot!)",
    insuranceActive: "Diamond Insurance Active",
    weather: "Weather Arena Controls",
    ghostMode: "Ghost Power Mode (Invisible Goti)",
    suddenDeath: "Sudden Death Lava Zone",
    timeWarp: "Time-Warp 2X Speed",
    streamLive: "Live Stream Hub & Tips",
    voiceRoom: "8-Seat Cyber Voice Lounge",
    clanLounge: "Clan Mega Voice Lounge",
    spectatorSeats: "VIP Spectator Betting Seats",
    biometricLock: "Biometric Touch & Face ID Lock",
    fingerprintScan: "Fingerprint daba kar room unlock karo",
    voiceModulator: "AI Voice Modulator (Robot/Anime/Monster)",
    sendGift: "4D Virtual Gift Send Karo",
    stockMarket: "Diamond Stock Market (Buy/Sell)",
    trophyWall: "Loser Trophy Wall (Kis-Kis ko haraya)",
    hallOfFame: "Daily Jackpot Hall of Fame",
    revengeWheel: "Bankruptcy Revenge Wheel (Free Spin)",
    neonClubVip: "VIP Neon Club Pass",
    cashoutExchange: "Instant Rewards Cashout",
    resetArena: "Super Arena Reset Karo",
    languageSelect: "Language (Bhasha)",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("hi-en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("orbit-app-lang") as Language;
      if (saved && (saved === "en" || saved === "hi" || saved === "hi-en")) {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("orbit-app-lang", lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
