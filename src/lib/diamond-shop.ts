export type DiamondPack = {
  id: string;
  amount: number;
  bonus: number;
  price: number;
  tag?: string;
};

/** 20 purchase options, small starter packs up to the mega vault. */
export const DIAMOND_PACKS: DiamondPack[] = [
  { id: "p1", amount: 10, bonus: 0, price: 9 },
  { id: "p2", amount: 20, bonus: 2, price: 19 },
  { id: "p3", amount: 50, bonus: 5, price: 45 },
  { id: "p4", amount: 100, bonus: 12, price: 89, tag: "Popular" },
  { id: "p5", amount: 150, bonus: 20, price: 129 },
  { id: "p6", amount: 200, bonus: 30, price: 169 },
  { id: "p7", amount: 300, bonus: 50, price: 249 },
  { id: "p8", amount: 400, bonus: 70, price: 329 },
  { id: "p9", amount: 500, bonus: 100, price: 399 },
  { id: "p10", amount: 600, bonus: 130, price: 479, tag: "Best value" },
  { id: "p11", amount: 750, bonus: 170, price: 599 },
  { id: "p12", amount: 900, bonus: 220, price: 699 },
  { id: "p13", amount: 1200, bonus: 320, price: 899 },
  { id: "p14", amount: 1800, bonus: 500, price: 1299 },
  { id: "p15", amount: 2500, bonus: 750, price: 1799 },
  { id: "p16", amount: 4000, bonus: 1300, price: 2799 },
  { id: "p17", amount: 6000, bonus: 2100, price: 3999 },
  { id: "p18", amount: 10000, bonus: 3800, price: 6499 },
  { id: "p19", amount: 25000, bonus: 10000, price: 14999 },
  { id: "p20", amount: 99999, bonus: 45000, price: 49999, tag: "Legend vault" },
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
  { id: "rose", name: "Neon Rose", emoji: "🌹", price: 11, category: "Love" },
  { id: "heart", name: "Pulse Heart", emoji: "💖", price: 25, category: "Love" },
  { id: "kiss", name: "Hot Kiss", emoji: "💋", price: 40, category: "Love" },
  { id: "ring", name: "Promise Ring", emoji: "💍", price: 250, category: "Love" },
  { id: "cupid", name: "Cupid Strike", emoji: "💘", price: 500, category: "Love", rare: true },
  { id: "loveletter", name: "Love Letter", emoji: "💌", price: 60, category: "Love" },

  { id: "scooter", name: "Street Scooter", emoji: "🛵", price: 90, category: "Bikes" },
  { id: "bike", name: "Racer Bike", emoji: "🏍️", price: 300, category: "Bikes" },
  { id: "cycle", name: "Turbo Cycle", emoji: "🚲", price: 55, category: "Bikes" },
  { id: "superbike", name: "Neon Superbike", emoji: "🏁", price: 1200, category: "Bikes", rare: true },
  { id: "helmet", name: "Chrome Helmet", emoji: "⛑️", price: 120, category: "Bikes" },
  { id: "fuel", name: "Nitro Can", emoji: "⛽", price: 35, category: "Bikes" },

  { id: "crown", name: "Diamond Crown", emoji: "👑", price: 900, category: "Luxury", rare: true },
  { id: "car", name: "Hyper Car", emoji: "🏎️", price: 2500, category: "Luxury", rare: true },
  { id: "watch", name: "Gold Watch", emoji: "⌚", price: 450, category: "Luxury" },
  { id: "yacht", name: "Sky Yacht", emoji: "🛥️", price: 5000, category: "Luxury", rare: true },
  { id: "gem", name: "Raw Gem", emoji: "💎", price: 150, category: "Luxury" },
  { id: "cash", name: "Cash Rain", emoji: "💸", price: 700, category: "Luxury" },

  { id: "ufo", name: "UFO Drop", emoji: "🛸", price: 800, category: "Sci-Fi", rare: true },
  { id: "rocket", name: "Ion Rocket", emoji: "🚀", price: 650, category: "Sci-Fi" },
  { id: "robot", name: "Combat Droid", emoji: "🤖", price: 400, category: "Sci-Fi" },
  { id: "galaxy", name: "Galaxy Orb", emoji: "🌌", price: 1500, category: "Sci-Fi", rare: true },
  { id: "laser", name: "Laser Blast", emoji: "⚡", price: 75, category: "Sci-Fi" },

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
