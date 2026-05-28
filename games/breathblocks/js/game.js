/**
 * BreathBlocks - game.js
 * 15x15 grid, 5 custom pieces, 3x3 detection
 */

export const COLS = 15;
export const ROWS = 15;
const HIDDEN = 2;

const PIECES = [
  { shape: [[1,1,1]], c: 1 },                           // Trio
  { shape: [[1,0],[1,1]], c: 2 },                       // Corner
  { shape: [[1,1],[1,1]], c: 3 },                       // Cube
  { shape: [[1,0],[1,0],[1,1]], c: 4 },                 // L
  { shape: [[0,1,0],[1,1,1],[0,1,0]], c: 5 }            // Cross
];

export function createGame() {
  return {
    grid: Array.from({ length: ROWS + HIDDEN }, () => Array(COLS).fill(0)),
    piece: null,
    px: 0,
    py: 0,
    bag: [],
    next: [],
    squares: 0,
    found: [],
    state: 'idle',
    gt: 0,
    gi: 900,
    lockTimer: 0,
    lockDelay: 500,
    locking: false,
    fallingBlocks: [],
    // Streak system
    streak: 0,
    bestStreak: 0,
    lastClearCount: 0,
    // Dissolve animation state
    dissolving: [],  // {x, y, c, t} — blocks currently in dissolve animation
    screenBloom: 0   // 0-1, fades down each frame
  };
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillBag(g) {
  g.bag = shuffle([0,1,2,3,4]);
}

function getPiece(g) {
  if (!g.bag.length) fillBag(g);
  const p = PIECES[g.bag.shift()];
  return { shape: p.shape.map(r => [...r]), c: p.c };
}

export function ensureNext(g, n = 3) {
  while (g.next.length < n) g.next.push(getPiece(g));
}

export function spawn(g) {
  ensureNext(g, 4);
  g.piece = g.next.shift();
  g.px = ((COLS - g.piece.shape[0].length) / 2) | 0;
  g.py = 0;
  if (!valid(g, g.piece.shape, g.px, g.py)) overflow(g);
}

function overflow(g) {
  for (let y = HIDDEN; y < HIDDEN + 3; y++)
    for (let x = 0; x < COLS; x++) g.grid[y][x] = 0;
}

function valid(g, s, x, y) {
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = x + c, ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS + HIDDEN) return false;
      if (ny >= 0 && g.grid[ny][nx]) return false;
    }
  }
  return true;
}

export function move(g, dx, dy) {
  if (!g.piece || g.state !== 'playing') return false;
  if (valid(g, g.piece.shape, g.px + dx, g.py + dy)) {
    g.px += dx;
    g.py += dy;
    return true;
  }
  return false;
}

export function rotate(g) {
  if (!g.piece || g.state !== 'playing') return false;
  const s = g.piece.shape;
  const isCube = s.length === 2 && s[0].length === 2 && s.every(row => row.every(cell => cell === 1));
  if (isCube) return true;
  const rot = s[0].map((_, c) => s.map(r => r[c]).reverse());
  for (const [kx, ky] of [[0,0],[-1,0],[1,0],[0,-1]]) {
    if (valid(g, rot, g.px + kx, g.py + ky)) {
      g.piece.shape = rot;
      g.px += kx;
      g.py += ky;
      return true;
    }
  }
  return false;
}

export function rotateCCW(g) {
  if (!g.piece || g.state !== 'playing') return false;
  const s = g.piece.shape;
  const isCube = s.length === 2 && s[0].length === 2 && s.every(row => row.every(cell => cell === 1));
  if (isCube) return true;
  const rot = s[0].map((_, c) => s.map(r => r[s[0].length - 1 - c]));
  for (const [kx, ky] of [[0,0],[-1,0],[1,0],[0,-1]]) {
    if (valid(g, rot, g.px + kx, g.py + ky)) {
      g.piece.shape = rot;
      g.px += kx;
      g.py += ky;
      return true;
    }
  }
  return false;
}

export function lock(g) {
  if (!g.piece) return;
  const bottomRow = g.py + g.piece.shape.length - 1;
  const inHidden = bottomRow < HIDDEN;
  if (inHidden) return;
  g.piece.shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v) {
        const gy = g.py + r, gx = g.px + c;
        if (gy >= 0) g.grid[gy][gx] = g.piece.c;
      }
    });
  });
  g.piece = null;
  scan(g);
}

export function drop(g) {
  if (!g.piece) return;
  while (move(g, 0, 1));
  lock(g);
}

function scan(g) {
  g.found = [];
  for (let y = HIDDEN; y <= ROWS + HIDDEN - 3; y++) {
    for (let x = 0; x <= COLS - 3; x++) {
      let ok = true;
      for (let dy = 0; dy < 3 && ok; dy++)
        for (let dx = 0; dx < 3 && ok; dx++)
          if (!g.grid[y + dy][x + dx]) ok = false;
      if (ok) g.found.push({ x, y: y - HIDDEN });
    }
  }
}

/**
 * Dissolve found 3x3 squares — now creates animated dissolving blocks
 * instead of instant removal. Returns the cleared blocks for particles.
 */
export function dissolve(g) {
  if (!g.found.length) return [];
  const set = new Set();
  g.found.forEach(sq => {
    for (let dy = 0; dy < 3; dy++)
      for (let dx = 0; dx < 3; dx++)
        set.add(`${sq.x + dx},${sq.y + dy + HIDDEN}`);
  });
  const blocks = [];
  set.forEach(k => {
    const [x, y] = k.split(',').map(Number);
    const c = g.grid[y][x];
    blocks.push({ x, y: y - HIDDEN, c });
    // Add to dissolving animation list
    g.dissolving.push({ x, y: y - HIDDEN, c, t: 0 });
    g.grid[y][x] = 0;
  });

  // Track clear count for streak
  g.lastClearCount = g.found.length;
  g.squares += g.found.length;

  // Screen bloom effect
  g.screenBloom = Math.min(0.15 + g.found.length * 0.03, 0.3);

  g.found = [];
  gravity(g);
  scan(g);
  return blocks;
}

/**
 * Update dissolving block timers. Returns true if any are still active.
 */
export function updateDissolving(g, dt) {
  if (!g.dissolving.length) return false;
  g.dissolving = g.dissolving.filter(d => {
    d.t += dt;
    return d.t < 500; // 500ms dissolve duration
  });
  // Decay screen bloom
  if (g.screenBloom > 0) {
    g.screenBloom = Math.max(0, g.screenBloom - dt * 0.001);
  }
  return g.dissolving.length > 0;
}

function gravity(g) {
  g.fallingBlocks = [];
  for (let x = 0; x < COLS; x++) {
    let w = ROWS + HIDDEN - 1;
    for (let y = ROWS + HIDDEN - 1; y >= 0; y--) {
      if (g.grid[y][x]) {
        if (y !== w) {
          const fallDistance = w - y;
          g.fallingBlocks.push({
            x: x,
            y: w,
            color: g.grid[y][x],
            offset: fallDistance,
            velocity: 0
          });
          g.grid[w][x] = g.grid[y][x];
          g.grid[y][x] = 0;
        }
        w--;
      }
    }
  }
}

export function tick(g, dt) {
  if (!g.piece || g.state !== 'playing') return;
  g.gt += dt;
  if (g.gt >= g.gi) {
    g.gt = 0;
    const moved = move(g, 0, 1);
    if (!moved) g.locking = true;
  }
  if (g.locking) {
    g.lockTimer += dt;
    if (g.lockTimer >= g.lockDelay) {
      lock(g);
      g.locking = false;
      g.lockTimer = 0;
    }
  }
}

export function resetLock(g) {
  if (g.locking) {
    g.lockTimer = 0;
    if (valid(g, g.piece.shape, g.px, g.py + 1)) {
      g.locking = false;
    }
  }
}

export function ghostY(g) {
  if (!g.piece) return g.py;
  let y = g.py;
  while (valid(g, g.piece.shape, g.px, y + 1)) y++;
  return y;
}

export function resetGame(g) {
  g.grid = Array.from({ length: ROWS + HIDDEN }, () => Array(COLS).fill(0));
  g.piece = null;
  g.px = 0;
  g.py = 0;
  g.bag = [];
  g.next = [];
  g.squares = 0;
  g.found = [];
  g.state = 'idle';
  g.gt = 0;
  g.gi = 900;
  g.lockTimer = 0;
  g.locking = false;
  g.fallingBlocks = [];
  g.streak = 0;
  g.bestStreak = 0;
  g.lastClearCount = 0;
  g.dissolving = [];
  g.screenBloom = 0;
}
