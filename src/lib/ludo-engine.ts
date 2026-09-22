export type PlayerId = 0 | 1 | 2 | 3;

export type Token = {
  id: string;
  player: PlayerId;
  /** -1 = in yard, 0..50 = main track steps, 51..56 = home column, 56 = home */
  pos: number;
};

export type LudoPlayer = {
  id: PlayerId;
  name: string;
  color: string;
  isBot: boolean;
};

/** 52 track cells as [row, col] on a 15x15 board, clockwise. */
export const TRACK: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

export const START_INDEX: Record<PlayerId, number> = { 0: 0, 1: 13, 2: 26, 3: 39 };

/** Home stretch cells per player (5 cells) + center. */
export const HOME_PATH: Record<PlayerId, [number, number][]> = {
  0: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  1: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  2: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  3: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

/** Yard slots (4 per player). */
export const YARD: Record<PlayerId, [number, number][]> = {
  0: [[1.8, 1.8], [1.8, 3.6], [3.6, 1.8], [3.6, 3.6]],
  1: [[1.8, 9.8], [1.8, 11.6], [3.6, 9.8], [3.6, 11.6]],
  2: [[9.8, 9.8], [9.8, 11.6], [11.6, 9.8], [11.6, 11.6]],
  3: [[9.8, 1.8], [9.8, 3.6], [11.6, 1.8], [11.6, 3.6]],
};

export const SAFE_TRACK_INDEXES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const LAST_STEP = 56; // reached home

export function trackIndexOf(token: Token) {
  if (token.pos < 0 || token.pos > 50) return null;
  return (START_INDEX[token.player] + token.pos) % 52;
}

export function cellOf(token: Token): [number, number] {
  if (token.pos < 0) return YARD[token.player][0]!;
  if (token.pos <= 50) return TRACK[trackIndexOf(token)!]!;
  const homeIdx = Math.min(token.pos - 51, 5);
  return HOME_PATH[token.player][homeIdx]!;
}

export function tokenCell(token: Token, slot: number): [number, number] {
  if (token.pos < 0) return YARD[token.player][slot]!;
  return cellOf(token);
}

export function createTokens(): Token[] {
  const tokens: Token[] = [];
  for (const p of [0, 1, 2, 3] as PlayerId[]) {
    for (let i = 0; i < 4; i++) tokens.push({ id: `${p}-${i}`, player: p, pos: -1 });
  }
  return tokens;
}

export function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

export function legalMoves(tokens: Token[], player: PlayerId, die: number) {
  return tokens.filter((t) => {
    if (t.player !== player) return false;
    if (t.pos === LAST_STEP) return false;
    if (t.pos < 0) return die === 6;
    return t.pos + die <= LAST_STEP;
  });
}

export type MoveResult = {
  tokens: Token[];
  captured: Token[];
  reachedHome: boolean;
};

export function applyMove(
  tokens: Token[],
  tokenId: string,
  die: number,
): MoveResult {
  const next = tokens.map((t) => ({ ...t }));
  const token = next.find((t) => t.id === tokenId)!;
  if (token.pos < 0) token.pos = 0;
  else token.pos = Math.min(token.pos + die, LAST_STEP);

  const captured: Token[] = [];
  const idx = trackIndexOf(token);
  if (idx !== null && !SAFE_TRACK_INDEXES.has(idx)) {
    for (const other of next) {
      if (other.player === token.player) continue;
      if (trackIndexOf(other) === idx) {
        other.pos = -1;
        captured.push({ ...other });
      }
    }
  }

  return { tokens: next, captured, reachedHome: token.pos === LAST_STEP };
}

/** Simple but competent bot: capture > home > release > furthest ahead. */
export function pickBotMove(tokens: Token[], player: PlayerId, die: number) {
  const options = legalMoves(tokens, player, die);
  if (options.length === 0) return null;
  let best = options[0]!;
  let bestScore = -Infinity;
  for (const option of options) {
    const result = applyMove(tokens, option.id, die);
    let score = 0;
    score += result.captured.length * 100;
    if (result.reachedHome) score += 80;
    if (option.pos < 0) score += 40;
    const moved = result.tokens.find((t) => t.id === option.id)!;
    if (moved.pos > 50) score += 25;
    const landIdx = trackIndexOf(moved);
    if (landIdx !== null && SAFE_TRACK_INDEXES.has(landIdx)) score += 15;
    score += moved.pos * 0.4;
    if (score > bestScore) {
      bestScore = score;
      best = option;
    }
  }
  return best;
}

export function hasWon(tokens: Token[], player: PlayerId) {
  return tokens
    .filter((t) => t.player === player)
    .every((t) => t.pos === LAST_STEP);
}
