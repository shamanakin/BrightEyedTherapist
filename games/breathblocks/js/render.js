/**
 * BreathBlocks - render.js
 * SOTA: Bloom tide, fresnel glass blocks, breathing vignette, particles,
 *       breathing ring indicator, enhanced dissolve animation, floating text
 */

import { COLS, ROWS, ghostY } from './game.js';
import { PHASE, DURATION } from './breath.js';

let canvas, ctx, W, H, cell, ox, oy, dpr;
let particles = [];
let gridRight = 0;
let floatingTexts = []; // {text, x, y, alpha, vy, t}
let isMobile = false;

export function initRender() {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');
  dpr = devicePixelRatio || 1;
  isMobile = window.innerWidth < 600;
  resize();
  addEventListener('resize', () => {
    isMobile = window.innerWidth < 600;
    resize();
  });
}

// Sidebar width (next pieces + stats + buttons)
const SIDEBAR_WIDTH = 80;
const SIDEBAR_GAP = 24;

// Export layout info for HTML overlays
export function getLayout() {
  const gridHeight = ROWS * cell;
  const gridWidth = COLS * cell;
  const previewHeight = 130;
  const btnHeight = 36;
  const previewBottom = oy + previewHeight;
  const btnTop = oy + gridHeight - btnHeight;
  const statsY = previewBottom + (btnTop - previewBottom) / 2 - 40;
  return {
    sidebarX: gridRight + SIDEBAR_GAP,
    sidebarWidth: SIDEBAR_WIDTH,
    statsY: statsY,
    btnY: btnTop,
    gridBottom: oy + gridHeight,
    gridLeft: ox,
    gridTop: oy,
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    cell: cell,
    isMobile: isMobile
  };
}

function resize() {
  W = innerWidth;
  H = innerHeight;
  
  const padTop = 20;
  const padBottom = 50;
  const availH = H - padTop - padBottom;

  if (isMobile) {
    // Mobile: grid takes full width, no sidebar
    const topBarHeight = 60; // reserve space for compact stats strip above grid
    const mobileAvailH = availH - topBarHeight;
    cell = Math.min((W - 20) / COLS, mobileAvailH / ROWS, 34) | 0;
    const gridWidth = COLS * cell;
    const gridHeight = ROWS * cell;
    ox = (W - gridWidth) / 2;
    oy = padTop + topBarHeight + (mobileAvailH - gridHeight) / 2;
    gridRight = ox + gridWidth;
  } else {
    // Desktop: grid + sidebar
    const totalSidebarArea = SIDEBAR_GAP + SIDEBAR_WIDTH;
    cell = Math.min((W - 60 - totalSidebarArea) / COLS, availH / ROWS, 34) | 0;
    const gridWidth = COLS * cell;
    const gridHeight = ROWS * cell;
    const totalWidth = gridWidth + totalSidebarArea;
    ox = (W - totalWidth) / 2;
    oy = padTop + (availH - gridHeight) / 2;
    gridRight = ox + gridWidth;
  }
  
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// Colors
const col = (h, s, l, a) => `hsla(${h},${s}%,${l}%,${a})`;

function blockColor(c, hue, a = 0.7) {
  return col(hue + (c - 1) * 35, 40, 65, a);
}

// Breathing vignette
function drawVignette(b) {
  const { phase, tide, hue } = b;
  let intensity = 0;
  if (phase === PHASE.INHALE) intensity = tide * 0.3;
  else if (phase === PHASE.HOLD) intensity = 0.3;
  else if (phase === PHASE.EXHALE) intensity = (1 - tide) * 0.25 + 0.05;
  else intensity = 0.05;
  
  const cx = W / 2, cy = H / 2;
  const r = Math.max(W, H) * 0.8;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, col(hue, 60, 20, intensity * 0.5));
  grad.addColorStop(0.5, col(hue, 50, 15, intensity * 0.3));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  
  const edgeGrad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
  edgeGrad.addColorStop(0, 'transparent');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, W, H);
}

// Draw block (fresnel glass style with occlusion)
function drawBlock(x, y, c, hue, opts = {}) {
  const { pulse = 0, ghost = false, hasRight = false, hasBottom = false, yOffset = 0 } = opts;
  const bx = ox + x * cell + 2;
  const by = oy + y * cell + 2 - yOffset * cell;
  const s = cell - 4;
  const r = 5;

  ctx.save();

  if (ghost) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.roundRect(bx, by, s, s, r);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Occlusion shadow
  if (hasRight || hasBottom) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    if (hasRight) ctx.fillRect(bx + s - 1, by + 2, 3, s - 4);
    if (hasBottom) ctx.fillRect(bx + 2, by + s - 1, s - 4, 3);
  }

  // Glow for pulsing 3x3
  if (pulse > 0) {
    ctx.shadowBlur = 25 * pulse;
    ctx.shadowColor = col(hue + (c - 1) * 35, 90, 65, pulse);
  }

  ctx.fillStyle = blockColor(c, hue);
  ctx.beginPath();
  ctx.roundRect(bx, by, s, s, r);
  ctx.fill();

  // Inner highlight (fresnel edge)
  ctx.strokeStyle = col(hue + (c - 1) * 35, 60, 85, 0.5);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx + 2, by + 2, s - 4, s - 4, r - 1);
  ctx.stroke();

  // Top light gradient
  const grad = ctx.createLinearGradient(bx, by, bx, by + s);
  grad.addColorStop(0, 'rgba(255,255,255,0.15)');
  grad.addColorStop(0.4, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(bx, by, s, s, r);
  ctx.fill();

  ctx.restore();
}

// Draw dissolving block — multi-stage animation over 500ms
function drawDissolvingBlock(d, hue) {
  const { x, y, c, t } = d;
  const bx = ox + x * cell + 2;
  const by = oy + y * cell + 2;
  const s = cell - 4;
  const r = 5;
  const p = t / 500; // 0 → 1 over 500ms

  ctx.save();

  if (p < 0.16) {
    // Phase 1: FLASH (0-80ms) — white spike
    const flashP = p / 0.16;
    const flashAlpha = 0.8 * (1 - flashP);
    // Bright glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = col(hue + (c - 1) * 35, 90, 80, flashAlpha);
    // White-hot block
    ctx.fillStyle = `rgba(255,255,255,${0.5 + flashAlpha * 0.5})`;
    ctx.beginPath();
    ctx.roundRect(bx, by, s, s, r);
    ctx.fill();
  } else if (p < 0.8) {
    // Phase 2: FADE (80-400ms) — shrink + fade + bloom glow
    const fadeP = (p - 0.16) / 0.64;
    const alpha = 0.7 * (1 - fadeP);
    const shrink = fadeP * 0.3;
    const sx = bx + s * shrink * 0.5;
    const sy = by + s * shrink * 0.5;
    const ss = s * (1 - shrink);
    
    // Expanding glow halo
    const glowSize = 10 + fadeP * 20;
    ctx.shadowBlur = glowSize;
    ctx.shadowColor = col(hue + (c - 1) * 35, 80, 65, alpha * 0.6);
    
    ctx.fillStyle = blockColor(c, hue, alpha);
    ctx.beginPath();
    ctx.roundRect(sx, sy, ss, ss, r);
    ctx.fill();
  }
  // Phase 3 (p >= 0.6): Just particles — no block drawn, particles handled separately

  ctx.restore();
}

// Draw tide line with bloom
function drawTide(tide, hue) {
  const y = oy + ROWS * cell - tide * ROWS * cell;
  const gridWidth = COLS * cell;

  ctx.save();
  const grad = ctx.createLinearGradient(0, y - 50, 0, y + 50);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.5, col(hue, 100, 55, 0.2));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(ox, y - 50, gridWidth, 100);

  ctx.strokeStyle = col(hue, 100, 70, 0.9);
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 15;
  ctx.shadowColor = col(hue, 100, 60, 0.8);
  ctx.beginPath();
  ctx.moveTo(ox, y);
  ctx.lineTo(ox + gridWidth, y);
  ctx.stroke();

  ctx.strokeStyle = col(hue + 25, 100, 50, 0.35);
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(ox, y + 2);
  ctx.lineTo(ox + gridWidth, y + 2);
  ctx.stroke();

  ctx.restore();
}

// Particles — enhanced: more particles per block on dissolve, with trails
export function spawnParticles(blocks, hue, count = 6) {
  if (!blocks || !Array.isArray(blocks)) return;
  blocks.forEach(b => {
    if (b.c === undefined || b.c === 0) return;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: ox + b.x * cell + cell / 2,
        y: oy + b.y * cell + cell / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 1,
        life: 1,
        h: hue + (b.c - 1) * 35,
        size: 3 + Math.random() * 3 // variable size
      });
    }
  });
}

export function clearParticles() {
  particles = [];
  floatingTexts = [];
}

// Falling blocks animation
const FALL_SPEED = 0.012;
const FALL_ACCEL = 0.00003;

export function updateFalling(g, dt) {
  if (!g.fallingBlocks || g.fallingBlocks.length === 0) return;
  g.fallingBlocks = g.fallingBlocks.filter(fb => {
    fb.velocity += FALL_ACCEL * dt;
    fb.offset -= (FALL_SPEED + fb.velocity) * dt;
    if (fb.offset <= 0) {
      fb.offset = 0;
      return false;
    }
    return true;
  });
}

function drawParticles() {
  particles = particles.filter(p => {
    const decay = 0.96;
    p.vx *= decay;
    p.vy *= decay;
    p.vy += 0.08;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.015;
    
    const easedLife = p.life * p.life;
    ctx.fillStyle = col(p.h, 80, 70, easedLife);
    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.size || 4) * easedLife + 1, 0, Math.PI * 2);
    ctx.fill();
    return p.life > 0;
  });
}

// Floating text system — "+N", "flow", "deep flow"
export function addFloatingText(text, gridX, gridY, color = 'rgba(255,255,255,0.8)') {
  floatingTexts.push({
    text,
    x: ox + gridX * cell + cell / 2,
    y: oy + gridY * cell,
    alpha: 1,
    vy: -1.2,
    t: 0,
    color
  });
}

function drawFloatingTexts(dt) {
  floatingTexts = floatingTexts.filter(ft => {
    ft.t += dt;
    ft.y += ft.vy;
    ft.alpha = Math.max(0, 1 - ft.t / 1200);
    
    if (ft.alpha <= 0) return false;
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '200 18px system-ui, sans-serif';
    ctx.fillStyle = ft.color.replace(/[\d.]+\)$/, ft.alpha + ')');
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
    return true;
  });
}

// Arena glow
function drawArenaGlow(tide, phase, hue) {
  const gw = COLS * cell;
  const gh = ROWS * cell;
  let intensity = 0;
  if (phase === PHASE.INHALE) intensity = tide * 0.5;
  else if (phase === PHASE.HOLD) intensity = 0.5;
  else if (phase === PHASE.EXHALE) intensity = (1 - tide) * 0.35 + 0.15;
  else intensity = 0.15;
  
  ctx.save();
  const layers = [
    { offset: 20, blur: 40, alpha: 0.08 },
    { offset: 12, blur: 25, alpha: 0.12 },
    { offset: 6, blur: 15, alpha: 0.18 },
    { offset: 2, blur: 8, alpha: 0.25 }
  ];
  
  layers.forEach(layer => {
    const alpha = layer.alpha * intensity;
    if (alpha < 0.01) return;
    
    const topGrad = ctx.createLinearGradient(ox, oy - layer.offset, ox, oy + layer.offset);
    topGrad.addColorStop(0, 'transparent');
    topGrad.addColorStop(0.5, col(hue, 80, 60, alpha));
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(ox - layer.offset, oy - layer.offset, gw + layer.offset * 2, layer.offset * 2);
    
    const bottomGrad = ctx.createLinearGradient(ox, oy + gh - layer.offset, ox, oy + gh + layer.offset);
    bottomGrad.addColorStop(0, 'transparent');
    bottomGrad.addColorStop(0.5, col(hue, 80, 60, alpha));
    bottomGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(ox - layer.offset, oy + gh - layer.offset, gw + layer.offset * 2, layer.offset * 2);
    
    const leftGrad = ctx.createLinearGradient(ox - layer.offset, oy, ox + layer.offset, oy);
    leftGrad.addColorStop(0, 'transparent');
    leftGrad.addColorStop(0.5, col(hue, 80, 60, alpha));
    leftGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(ox - layer.offset, oy, layer.offset * 2, gh);
    
    const rightGrad = ctx.createLinearGradient(ox + gw - layer.offset, oy, ox + gw + layer.offset, oy);
    rightGrad.addColorStop(0, 'transparent');
    rightGrad.addColorStop(0.5, col(hue, 80, 60, alpha));
    rightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(ox + gw - layer.offset, oy, layer.offset * 2, gh);
  });
  
  const cornerAlpha = intensity * 0.15;
  const corners = [
    [ox, oy], [ox + gw, oy], [ox, oy + gh], [ox + gw, oy + gh]
  ];
  corners.forEach(([cx, cy]) => {
    const cornerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    cornerGrad.addColorStop(0, col(hue, 90, 65, cornerAlpha));
    cornerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cornerGrad;
    ctx.fillRect(cx - 30, cy - 30, 60, 60);
  });
  
  ctx.restore();
}

// Breathing guidance - first 2 cycles
function drawBreathingGuide(b) {
  if (b.cycles >= 2) return;
  
  const messages = [
    "breathe with the game — if you need to",
    "breathe in over 4 seconds, hold for 4, exhale for 4, wait for 4"
  ];
  const msg = messages[Math.min(b.cycles, 1)];
  
  const phaseIndex = b.phase;
  const cycleProgress = (phaseIndex * 4000 + b.t) / 16000;
  let alpha = 0.4;
  if (cycleProgress > 0.75) alpha = 0.4 * (1 - (cycleProgress - 0.75) / 0.25);
  if (cycleProgress < 0.1) alpha *= cycleProgress / 0.1;
  if (alpha < 0.01) return;
  
  const arenaCenterX = ox + (COLS * cell) / 2;
  const arenaCenterY = oy + (ROWS * cell) / 2;
  
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '300 16px system-ui, sans-serif';
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.fillText(msg, arenaCenterX, arenaCenterY);
  ctx.restore();
}

// ──────────────────────────────────────────────────
// BREATHING RING INDICATOR
// ──────────────────────────────────────────────────
function drawBreathRing(b) {
  const { phase, t, hue } = b;
  const progress = Math.min(t / DURATION, 1);
  
  // Position: top-left margin on desktop, top-center on mobile
  const ringR = 20;
  let ringX, ringY;
  if (isMobile) {
    ringX = W / 2;
    ringY = oy - 32;
  } else {
    ringX = ox - 40;
    ringY = oy + 40;
  }
  
  const ringAlpha = 0.35;
  const textAlpha = 0.5;
  
  ctx.save();
  
  // Background ring (track)
  ctx.strokeStyle = `rgba(255,255,255,0.06)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
  ctx.stroke();
  
  // Active arc
  ctx.strokeStyle = col(hue, 60, 65, ringAlpha);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  
  const startAngle = -Math.PI / 2;
  if (phase === PHASE.INHALE) {
    // Fill clockwise
    ctx.arc(ringX, ringY, ringR, startAngle, startAngle + Math.PI * 2 * progress);
  } else if (phase === PHASE.HOLD) {
    // Full ring, softly pulses
    const pulseAlpha = ringAlpha + Math.sin(t / 400 * Math.PI) * 0.1;
    ctx.strokeStyle = col(hue, 60, 65, pulseAlpha);
    ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
  } else if (phase === PHASE.EXHALE) {
    // Empty counterclockwise (draw remaining arc)
    const remaining = 1 - progress;
    ctx.arc(ringX, ringY, ringR, startAngle, startAngle + Math.PI * 2 * remaining);
  }
  // REST: empty ring — only track drawn above
  
  ctx.stroke();
  
  // Phase word inside ring
  const words = ['in', 'hold', 'out', '···'];
  const word = words[phase];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '100 11px system-ui, sans-serif';
  ctx.fillStyle = `rgba(255,255,255,${textAlpha})`;
  ctx.fillText(word, ringX, ringY + 1);
  
  ctx.restore();
}

// Screen bloom overlay
function drawScreenBloom(g) {
  if (g.screenBloom <= 0.005) return;
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${g.screenBloom})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Grid
function drawGrid(hue) {
  ctx.strokeStyle = `rgba(255,255,255,0.06)`;
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) {
    const x = ox + i * cell;
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.lineTo(x, oy + ROWS * cell);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    const y = oy + i * cell;
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(ox + COLS * cell, y);
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(255,255,255,0.12)`;
  for (let i = 0; i <= COLS; i += 3) {
    const x = ox + i * cell;
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.lineTo(x, oy + ROWS * cell);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i += 3) {
    const y = oy + i * cell;
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(ox + COLS * cell, y);
    ctx.stroke();
  }
}

// Next preview
function drawNext(queue, hue) {
  if (isMobile) return; // On mobile, next preview is omitted (compact layout)
  
  const nx = gridRight + SIDEBAR_GAP;
  const labelY = oy + 4;
  const startY = oy + 24;
  let ny = startY;
  
  ctx.save();
  ctx.font = '100 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.letterSpacing = '0.3em';
  ctx.fillText('NEXT', nx, labelY);
  ctx.restore();
  
  queue.slice(0, 3).forEach((p, idx) => {
    const sz = 13;
    const pieceH = p.shape.length * sz;
    p.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (v) {
          ctx.fillStyle = blockColor(p.c, hue, idx === 0 ? 0.7 : 0.35);
          ctx.beginPath();
          ctx.roundRect(nx + c * sz, ny + r * sz, sz - 2, sz - 2, 3);
          ctx.fill();
        }
      });
    });
    ny += pieceH + 14;
  });
}

// Main render
export function render(g, b, dt) {
  ctx.clearRect(0, 0, W, H);

  const hue = b.hue;
  const inExhale = b.phase === PHASE.EXHALE;
  const inHold = b.phase === PHASE.HOLD;

  // Breathing vignette
  drawVignette(b);
  drawArenaGlow(b.tide, b.phase, hue);
  drawGrid(hue);
  drawBreathingGuide(b);

  // Placed blocks with occlusion + hold/exhale pulse
  for (let y = 2; y < ROWS + 2; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = g.grid[y][x];
      if (c) {
        const inSq = g.found.some(sq =>
          x >= sq.x && x < sq.x + 3 && y - 2 >= sq.y && y - 2 < sq.y + 3
        );
        let pulse = 0;
        if (inSq) {
          if (inExhale) {
            pulse = 0.5 + Math.sin(Date.now() / 150) * 0.5;
          } else if (inHold) {
            // Anticipation pulse: gentle building glow 0 → 0.3 over hold duration
            const holdP = Math.min(b.t / DURATION, 1);
            pulse = holdP * 0.3;
          }
        }
        const hasRight = x < COLS - 1 && g.grid[y][x + 1];
        const hasBottom = y < ROWS + 1 && g.grid[y + 1] && g.grid[y + 1][x];
        const fallingBlock = g.fallingBlocks?.find(fb => fb.x === x && fb.y === y);
        const yOffset = fallingBlock ? fallingBlock.offset : 0;
        drawBlock(x, y - 2, c, hue, { pulse, hasRight, hasBottom, yOffset });
      }
    }
  }

  // Dissolving blocks (animated)
  if (g.dissolving && g.dissolving.length) {
    g.dissolving.forEach(d => drawDissolvingBlock(d, hue));
  }

  // Ghost
  if (g.piece) {
    const gy = ghostY(g);
    if (gy !== g.py) {
      g.piece.shape.forEach((row, r) => {
        row.forEach((v, c) => {
          if (v && gy + r >= 2) drawBlock(g.px + c, gy + r - 2, g.piece.c, hue, { ghost: true });
        });
      });
    }
  }

  // Current piece
  if (g.piece) {
    g.piece.shape.forEach((row, r) => {
      row.forEach((v, c) => {
        if (v && g.py + r >= 2) drawBlock(g.px + c, g.py + r - 2, g.piece.c, hue);
      });
    });
  }

  // Next preview (desktop only)
  drawNext(g.next, hue);

  // Tide line
  drawTide(b.tide, hue);

  // Screen bloom (brief white flash on clear)
  drawScreenBloom(g);

  // Particles
  drawParticles();

  // Floating texts
  drawFloatingTexts(dt || 16);

  // Breathing ring indicator
  if (b.running || b.phase !== PHASE.REST) {
    drawBreathRing(b);
  }
}
