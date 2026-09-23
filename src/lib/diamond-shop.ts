// ==========================================
// PART 1: DIAMOND PACKS SCHEMAS & UTILITIES
// ==========================================

export type DiamondPack = {
  id: string;
  amount: number;
  bonus: number;
  price: number;
  tag?: string;
};

/** 20 premium purchase options, from mini starter crystals to the legendary infinite vault. */
export const DIAMOND_PACKS: DiamondPack[] = [
  { id: "p1", amount: 15, bonus: 2, price: 9 }, // Base numbers are buffed up for high player attraction
  { id: "p2", amount: 30, bonus: 5, price: 19 },
  { id: "p3", amount: 75, bonus: 10, price: 45 },
  { id: "p4", amount: 150, bonus: 25, price: 89, tag: "Popular Hot" },
  { id: "p5", amount: 220, bonus: 40, price: 129 },
  { id: "p6", amount: 300, bonus: 60, price: 169 },
  { id: "p7", amount: 450, bonus: 90, price: 249 },
  { id: "p8", amount: 600, bonus: 120, price: 329 },
  { id: "p9", amount: 750, bonus: 180, price: 399 },
  { id: "p10", amount: 900, bonus: 250, price: 479, tag: "Mega Saver" },
  { id: "p11", amount: 1100, bonus: 320, price: 599 },
  { id: "p12", amount: 1400, bonus: 450, price: 699 },
  { id: "p13", amount: 1800, bonus: 600, price: 899 },
  { id: "p14", amount: 2500, bonus: 900, price: 1299 },
  { id: "p15", amount: 3800, bonus: 1400, price: 1799, tag: "Best Value" },
  { id: "p16", amount: 6000, bonus: 2500, price: 2799 },
  { id: "p17", amount: 9000, bonus: 4000, price: 3999 },
  { id: "p18", amount: 15000, bonus: 7500, price: 6499, tag: "Whale Choice" },
  { id: "p19", amount: 35000, bonus: 18000, price: 14999 },
  { id: "p20", amount: 99999, bonus: 55000, price: 49999, tag: "Legend Vault" },
];

export type Gift = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: "Love" | "Bikes" | "Luxury" | "Sci-Fi" | "Party";
  rare?: boolean;
};
export const GIFTS: Gift[] = [
  // Love Category Items
  { id: "rose", name: "Neon Rose", emoji: "🌹", price: 11, category: "Love" },
  { id: "heart", name: "Pulse Heart", emoji: "💖", price: 25, category: "Love" },
  { id: "kiss", name: "Hot Kiss", emoji: "💋", price: 40, category: "Love" },
  { id: "ring", name: "Promise Ring", emoji: "💍", price: 250, category: "Love" },
  { id: "cupid", name: "Cupid Strike", emoji: "💘", price: 500, category: "Love", rare: true },
  { id: "loveletter", name: "Love Letter", emoji: "💌", price: 60, category: "Love" },

  // Bikes Category Items
  { id: "scooter", name: "Street Scooter", emoji: "🛵", price: 90, category: "Bikes" },
  { id: "bike", name: "Racer Bike", emoji: "🏍️", price: 300, category: "Bikes" },
  { id: "cycle", name: "Turbo Cycle", emoji: "🚲", price: 55, category: "Bikes" },
  { id: "superbike", name: "Neon Superbike", emoji: "🏁", price: 1200, category: "Bikes", rare: true },
  { id: "helmet", name: "Chrome Helmet", emoji: "⛑️", price: 120, category: "Bikes" },
  { id: "fuel", name: "Nitro Can", emoji: "⛽", price: 35, category: "Bikes" },

  // Luxury Category Items
  { id: "crown", name: "Diamond Crown", emoji: "👑", price: 900, category: "Luxury", rare: true },
  { id: "car", name: "Hyper Car", emoji: "🏎️", price: 2500, category: "Luxury", rare: true },
  { id: "watch", name: "Gold Watch", emoji: "⌚", price: 450, category: "Luxury" },
  { id: "yacht", name: "Sky Yacht", emoji: "🛥️", price: 5000, category: "Luxury", rare: true },
  { id: "gem", name: "Raw Gem", emoji: "💎", price: 150, category: "Luxury" },
  { id: "cash", name: "Cash Rain", emoji: "💸", price: 700, category: "Luxury" },

  // Sci-Fi Category Items
  { id: "ufo", name: "UFO Drop", emoji: "🛸", price: 800, category: "Sci-Fi", rare: true },
  { id: "rocket", name: "Ion Rocket", emoji: "🚀", price: 650, category: "Sci-Fi" },
  { id: "robot", name: "Combat Droid", emoji: "🤖", price: 400, category: "Sci-Fi" },
  { id: "galaxy", name: "Galaxy Orb", emoji: "🌌", price: 1500, category: "Sci-Fi", rare: true },
  { id: "laser", name: "Laser Blast", emoji: "⚡", price: 75, category: "Sci-Fi" },

  // Party Category Items
  { id: "fire", name: "Fire Burst", emoji: "🔥", price: 20, category: "Party" },
  { id: "cake", name: "Party Cake", emoji: "🎂", price: 65, category: "Party" },
  { id: "fireworks", name: "Sky Fireworks", emoji: "🎆", price: 220, category: "Party" },
  { id: "confetti", name: "Confetti Bomb", emoji: "🎉", price: 45, category: "Party" },
  { id: "trophy", name: "Champion Cup", emoji: "🏆", price: 350, category: "Party" },
];

export const GIFT_CATEGORIES = [
  "Love",
  "Bikes",
  "Luxury",
  "Sci-Fi",
  "Party",
] as const;
