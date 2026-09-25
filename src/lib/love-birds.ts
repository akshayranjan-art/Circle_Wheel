export type Gender = "male" | "female";

export type PlayStyle =
  | "Aggressive Bounty Hunter"
  | "Strategic Home Runner"
  | "High Roller Bettor"
  | "Dice Mathematician"
  | "Lucky Charmer"
  | "Royal Protector";

export type PlayerProfile = {
  id: string;
  name: string;
  gender: Gender;
  avatar: string;
  level: number;
  winRate: number; // percentage, e.g. 78
  cutGotis: number;
  matchesPlayed: number;
  playStyle: PlayStyle;
  seatIndex: number | null; // 0-7 or null for audience
  voiceVibe: string;
  dailyLiveMinutes: number;
  bio: string;
  favoriteColor: string;
};

export type CompatibilityResult = {
  male: PlayerProfile;
  female: PlayerProfile;
  overallScore: number; // 0 - 100
  breakdown: {
    styleSynergy: number; // 0 - 35
    winRateHarmony: number; // 0 - 30
    activitySynergy: number; // 0 - 20
    voiceChemistry: number; // 0 - 15
  };
  chemistryTitle: string;
  synergyReason: string;
  badge: "Cosmic Soulmates" | "Super Compatible" | "High Synergy" | "Promising Match";
};

// Default room players with rich stats
export const DEFAULT_ROOM_PLAYERS: PlayerProfile[] = [
  {
    id: "p_raja",
    name: "Raja King",
    gender: "male",
    avatar: "🦁",
    level: 46,
    winRate: 78,
    cutGotis: 412,
    matchesPlayed: 520,
    playStyle: "Aggressive Bounty Hunter",
    seatIndex: 0,
    voiceVibe: "Deep Voice & Confident",
    dailyLiveMinutes: 35,
    bio: "Main goti kaatne me vishwas rakhta hoon! Looking for a strategic partner to guard home base.",
    favoriteColor: "#06b6d4",
  },
  {
    id: "p_priya",
    name: "Priya ✨",
    gender: "female",
    avatar: "👸",
    level: 42,
    winRate: 82,
    cutGotis: 280,
    matchesPlayed: 440,
    playStyle: "Strategic Home Runner",
    seatIndex: 2,
    voiceVibe: "Sweet & Cheerful",
    dailyLiveMinutes: 40,
    bio: "Dice par hamesha 6 aate hain! Strategic runner needing a fierce goti cutter protector.",
    favoriteColor: "#ec4899",
  },
  {
    id: "p_dicedon",
    name: "Dice Don",
    gender: "male",
    avatar: "🎲",
    level: 50,
    winRate: 71,
    cutGotis: 490,
    matchesPlayed: 680,
    playStyle: "High Roller Bettor",
    seatIndex: 5,
    voiceVibe: "Chill Roaster & High-Roller",
    dailyLiveMinutes: 25,
    bio: "500 diamond pool specialist. Big risks, bigger rewards!",
    favoriteColor: "#f59e0b",
  },
  {
    id: "p_simran",
    name: "Simran 'LuckyQueen' ✨",
    gender: "female",
    avatar: "💃",
    level: 38,
    winRate: 85,
    cutGotis: 210,
    matchesPlayed: 320,
    playStyle: "Lucky Charmer",
    seatIndex: 4,
    voiceVibe: "Playful & Vibrant",
    dailyLiveMinutes: 50,
    bio: "Daily jackpot lucky star! Seeking high-stakes adrenaline partner.",
    favoriteColor: "#a855f7",
  },
  {
    id: "p_kabir",
    name: "Kabir 'QuantumBoss' 🏎️",
    gender: "male",
    avatar: "🥷",
    level: 48,
    winRate: 86,
    cutGotis: 530,
    matchesPlayed: 610,
    playStyle: "Royal Protector",
    seatIndex: null, // In lounge audience
    voiceVibe: "Tactical & Calm",
    dailyLiveMinutes: 30,
    bio: "Clan leader of Neon Vikings. Grand entries with Cyber Dragon!",
    favoriteColor: "#3b82f6",
  },
  {
    id: "p_ananya",
    name: "Ananya 'NeonAngel' 💖",
    gender: "female",
    avatar: "🧚",
    level: 39,
    winRate: 84,
    cutGotis: 245,
    matchesPlayed: 390,
    playStyle: "Dice Mathematician",
    seatIndex: null, // In lounge audience
    voiceVibe: "Analytical & Melodic",
    dailyLiveMinutes: 45,
    bio: "Calculated moves only! Perfect pairing with bold goti slayers.",
    favoriteColor: "#f43f5e",
  },
];

/**
 * Calculates Love-Birds compatibility between a Male and Female player based on stats.
 */
export function calculateLoveBirdsCompatibility(
  male: PlayerProfile,
  female: PlayerProfile,
): CompatibilityResult {
  // 1. Style Synergy (Max 35 pts)
  let styleSynergy = 26;
  let reason = "Complementary playstyles in 4D arena matches.";

  const mStyle = male.playStyle;
  const fStyle = female.playStyle;

  if (
    (mStyle === "Aggressive Bounty Hunter" && fStyle === "Strategic Home Runner") ||
    (mStyle === "Royal Protector" && fStyle === "Strategic Home Runner")
  ) {
    styleSynergy = 35;
    reason = `${male.name}'s goti-cutting aggression perfectly clears the track for ${female.name}'s 82%+ home-run tactics!`;
  } else if (
    (mStyle === "High Roller Bettor" && fStyle === "Lucky Charmer") ||
    (mStyle === "Aggressive Bounty Hunter" && fStyle === "Lucky Charmer")
  ) {
    styleSynergy = 34;
    reason = `${male.name}'s fearless high-stakes betting is supercharged by ${female.name}'s lucky streak dice energy!`;
  } else if (
    (mStyle === "Royal Protector" && fStyle === "Dice Mathematician") ||
    (mStyle === "High Roller Bettor" && fStyle === "Dice Mathematician")
  ) {
    styleSynergy = 33;
    reason = `${female.name}'s probability calculation brings surgical precision to ${male.name}'s heavy arena firepower!`;
  } else {
    styleSynergy = 28;
    reason = `Dynamic tactical synergy: ${male.name} & ${female.name} balance speed, defense, and coin stakes.`;
  }

  // 2. Win Rate Harmony (Max 30 pts)
  const avgWinRate = (male.winRate + female.winRate) / 2;
  const winRateDiff = Math.abs(male.winRate - female.winRate);
  let winRateHarmony = 22;

  if (avgWinRate >= 80 && winRateDiff <= 10) {
    winRateHarmony = 30;
  } else if (avgWinRate >= 75) {
    winRateHarmony = 27;
  } else {
    winRateHarmony = Math.min(25, Math.max(18, Math.round(25 - winRateDiff * 0.5)));
  }

  // 3. Activity & Live Room Synergy (Max 20 pts)
  const minLive = Math.min(male.dailyLiveMinutes, female.dailyLiveMinutes);
  let activitySynergy = 15;
  if (minLive >= 30) {
    activitySynergy = 20;
  } else if (minLive >= 15) {
    activitySynergy = 18;
  } else {
    activitySynergy = 14;
  }

  // 4. Voice Vibe Chemistry (Max 15 pts)
  let voiceChemistry = 14;
  if (
    (male.voiceVibe.includes("Deep") && female.voiceVibe.includes("Sweet")) ||
    (male.voiceVibe.includes("Chill") && female.voiceVibe.includes("Vibrant")) ||
    (male.voiceVibe.includes("Tactical") && female.voiceVibe.includes("Analytical"))
  ) {
    voiceChemistry = 15;
  }

  const overallScore = Math.min(
    99,
    styleSynergy + winRateHarmony + activitySynergy + voiceChemistry,
  );

  let chemistryTitle = "💖 Destined Soulmates";
  let badge: CompatibilityResult["badge"] = "Cosmic Soulmates";

  if (overallScore >= 95) {
    chemistryTitle = "⚡ Cosmic Power Couple (God Tier)";
    badge = "Cosmic Soulmates";
  } else if (overallScore >= 90) {
    chemistryTitle = "🔥 Destined Arena Soulmates";
    badge = "Super Compatible";
  } else if (overallScore >= 82) {
    chemistryTitle = "🛡️ Guardian & Strategist Synergy";
    badge = "High Synergy";
  } else {
    chemistryTitle = "✨ Promising Duo";
    badge = "Promising Match";
  }

  return {
    male,
    female,
    overallScore,
    breakdown: {
      styleSynergy,
      winRateHarmony,
      activitySynergy,
      voiceChemistry,
    },
    chemistryTitle,
    synergyReason: reason,
    badge,
  };
}

/**
 * Monitors all players in the room and finds all possible Male-Female pairings sorted by compatibility.
 */
export function findRoomLoveBirdsPairings(players: PlayerProfile[]): CompatibilityResult[] {
  const males = players.filter((p) => p.gender === "male");
  const females = players.filter((p) => p.gender === "female");

  const pairings: CompatibilityResult[] = [];

  for (const m of males) {
    for (const f of females) {
      pairings.push(calculateLoveBirdsCompatibility(m, f));
    }
  }

  // Sort descending by overallScore
  return pairings.sort((a, b) => b.overallScore - a.overallScore);
}
