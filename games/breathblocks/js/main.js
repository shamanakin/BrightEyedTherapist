/**
 * BreathBlocks - main.js
 * Orchestrator: input, loop, UI state, touch, overlays, streak, session
 */

import { createGame, spawn, move, rotate, rotateCCW, drop, tick, dissolve, ensureNext, resetLock, resetGame, updateDissolving, COLS, ROWS } from './game.js';
import { createBreath, updateBreath, resetBreath, PHASE, DURATION } from './breath.js';
import { initRender, render, spawnParticles, clearParticles, getLayout, updateFalling, addFloatingText } from './render.js';
import { initAudio, loadMusic, playMusic, stopMusic, getMusicBuffer, resumeAudio, sfxStart, sfxRotate, sfxDrop, sfxClear, sfxPhaseTransition } from './audio.js';

// ──────────────────────────────────────────
// STATE
// ──────────────────────────────────────────
const g = createGame();
const b = createBreath();
let last = performance.now();
let paused = false;
let prevSquares = 0;
let sessionStart = 0;        // performance.now() when game started
let inputCount = 0;           // for controls auto-fade
let controlsFaded = false;
const isTouch = 'ontouchstart' in window;

// ──────────────────────────────────────────
// DOM ELEMENTS
// ──────────────────────────────────────────
const $ = id => document.getElementById(id);
const startEl = $('start');
const goBtn = $('go');
const pauseBtn = $('pause-btn');
const closeBtn = $('close-btn');
const sqEl = $('sq');
const cyEl = $('cy');
const skEl = $('sk');
const skLabel = $('sk-label');
const streakStat = $('streak-stat');
const statsOverlay = $('stats-overlay');
const btnOverlay = $('btn-overlay');
const controlsEl = $('controls');
const touchOverlay = $('touch-overlay');

// Pause overlay
const pauseOverlay = $('pause-overlay');
const resumeBtn = $('resume-btn');
const endBtn = $('end-btn');
const pauseDur = $('pause-dur');
const pauseCy = $('pause-cy');
const pauseSq = $('pause-sq');

// Summary overlay
const summaryOverlay = $('summary-overlay');
const sumDur = $('sum-dur');
const sumCy = $('sum-cy');
const sumSq = $('sum-sq');
const sumSk = $('sum-sk');
const sumSkLabel = $('sum-sk-label');
const sumPb = $('sum-pb');
const sumMsg = $('sum-msg');
const sumBackBtn = $('sum-back-btn');

// Start screen hint and ring
const startHint = $('start-hint');
const startRingCanvas = $('start-ring');

// ──────────────────────────────────────────
// TOUCH SETUP
// ──────────────────────────────────────────
if (isTouch) {
  touchOverlay.style.display = 'block';
  startHint.textContent = 'tap to start';
  // Show touch controls hint, hide keyboard hints
  document.querySelectorAll('.ctrl-kb').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.ctrl-touch').forEach(el => el.style.display = 'inline');
}

// ──────────────────────────────────────────
// START RING ANIMATION (on start screen)
// ──────────────────────────────────────────
let startRingPhase = 0;
let startRingT = 0;
let startRingAnim = null;

function animateStartRing() {
  const srCtx = startRingCanvas.getContext('2d');
  const size = 60;
  const r = 22;
  const cx = size / 2, cy = size / 2;
  
  startRingT += 16;
  if (startRingT >= DURATION) {
    startRingT = 0;
    startRingPhase = (startRingPhase + 1) % 4;
  }
  const p = startRingT / DURATION;
  
  srCtx.clearRect(0, 0, size, size);
  
  // Track
  srCtx.strokeStyle = 'rgba(255,255,255,0.08)';
  srCtx.lineWidth = 1.5;
  srCtx.beginPath();
  srCtx.arc(cx, cy, r, 0, Math.PI * 2);
  srCtx.stroke();
  
  // Active arc
  srCtx.strokeStyle = 'rgba(255,255,255,0.3)';
  srCtx.lineWidth = 2;
  srCtx.lineCap = 'round';
  srCtx.beginPath();
  const startAngle = -Math.PI / 2;
  if (startRingPhase === 0) {
    srCtx.arc(cx, cy, r, startAngle, startAngle + Math.PI * 2 * p);
  } else if (startRingPhase === 1) {
    srCtx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (startRingPhase === 2) {
    const rem = 1 - p;
    srCtx.arc(cx, cy, r, startAngle, startAngle + Math.PI * 2 * rem);
  }
  srCtx.stroke();
  
  // Phase word
  const words = ['in', 'hold', 'out', '···'];
  srCtx.textAlign = 'center';
  srCtx.textBaseline = 'middle';
  srCtx.font = '100 10px system-ui, sans-serif';
  srCtx.fillStyle = 'rgba(255,255,255,0.4)';
  srCtx.fillText(words[startRingPhase], cx, cy + 1);
  
  startRingAnim = requestAnimationFrame(animateStartRing);
}

// Start the ring animation
animateStartRing();

// ──────────────────────────────────────────
// POSITION OVERLAYS
// ──────────────────────────────────────────
function positionOverlays() {
  const layout = getLayout();
  
  if (layout.isMobile) {
    // Mobile: stats as compact strip above grid
    statsOverlay.style.left = 'auto';
    statsOverlay.style.right = 'auto';
    statsOverlay.style.top = (layout.gridTop - 50) + 'px';
    statsOverlay.style.width = '100%';
    statsOverlay.style.justifyContent = 'center';
    statsOverlay.style.display = 'flex';
    
    // Buttons: top-right corner
    btnOverlay.style.left = 'auto';
    btnOverlay.style.right = '12px';
    btnOverlay.style.top = (layout.gridTop - 48) + 'px';
    btnOverlay.style.width = 'auto';
  } else {
    statsOverlay.style.left = layout.sidebarX + 'px';
    statsOverlay.style.top = layout.statsY + 'px';
    statsOverlay.style.width = layout.sidebarWidth + 'px';
    statsOverlay.style.right = 'auto';
    statsOverlay.style.justifyContent = 'flex-start';
    
    btnOverlay.style.left = layout.sidebarX + 'px';
    btnOverlay.style.top = layout.btnY + 'px';
    btnOverlay.style.width = layout.sidebarWidth + 'px';
    btnOverlay.style.right = 'auto';
  }
}

addEventListener('resize', positionOverlays);

// ──────────────────────────────────────────
// BREATH CALLBACKS
// ──────────────────────────────────────────

// On exhale end: dissolve, streak logic
b.onExhaleEnd = () => {
  try {
    const blocks = dissolve(g);
    if (blocks.length) {
      // Streak: consecutive exhales with clears
      g.streak++;
      if (g.streak > g.bestStreak) g.bestStreak = g.streak;
      
      // Enhanced particles: more at higher streaks
      const particleCount = Math.min(6 + g.streak * 2, 16);
      spawnParticles(blocks, b.hue, particleCount);
      
      // Audio: streak-aware clear chord
      sfxClear(g.streak);
      
      // Floating text: "+N" where N = number of 3x3s cleared
      const centerX = blocks.reduce((s, bl) => s + bl.x, 0) / blocks.length;
      const centerY = blocks.reduce((s, bl) => s + bl.y, 0) / blocks.length;
      addFloatingText('+' + g.lastClearCount, centerX, centerY, 'rgba(255,255,255,0.8)');
      
      // Flow text at streaks 3 and 5
      if (g.streak === 3) {
        addFloatingText('flow', COLS / 2, ROWS / 2, 'rgba(200,220,255,0.6)');
      } else if (g.streak === 5) {
        addFloatingText('deep flow', COLS / 2, ROWS / 2, 'rgba(200,220,255,0.7)');
      }
    } else {
      // No clears this exhale — break streak
      g.streak = 0;
    }
  } catch (err) {
    console.error('Dissolve error:', err);
  }
};

// On phase change: audio cues + difficulty curve
b.onPhaseChange = (newPhase, oldPhase) => {
  sfxPhaseTransition(newPhase);
  
  // Difficulty curve: on each new INHALE (start of cycle), decrease gravity interval
  if (newPhase === PHASE.INHALE && b.cycles > 0) {
    g.gi = Math.max(500, g.gi - 15);
  }
};

// ──────────────────────────────────────────
// SESSION HELPERS
// ──────────────────────────────────────────

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min + ':' + String(sec).padStart(2, '0');
}

function getSessionDuration() {
  if (!sessionStart) return 0;
  return performance.now() - sessionStart;
}

// ──────────────────────────────────────────
// START / RESTART
// ──────────────────────────────────────────

function start() {
  resumeAudio();
  resetGame(g);
  resetBreath(b);
  clearParticles();
  prevSquares = 0;
  inputCount = 0;
  controlsFaded = false;
  controlsEl.classList.remove('faded');
  sessionStart = performance.now();
  
  // Stop start ring animation
  if (startRingAnim) {
    cancelAnimationFrame(startRingAnim);
    startRingAnim = null;
  }
  
  startEl.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  summaryOverlay.classList.add('hidden');
  g.state = 'playing';
  b.running = true;
  last = performance.now();
  ensureNext(g, 4);
  spawn(g);
  
  sfxStart();
  const buf = getMusicBuffer();
  if (buf) playMusic(buf);
}

function showStart() {
  stopMusic();
  startEl.classList.remove('hidden');
  pauseOverlay.classList.add('hidden');
  summaryOverlay.classList.add('hidden');
  g.state = 'idle';
  b.running = false;
  paused = false;
  pauseBtn.textContent = '⏸';
  
  // Restart start ring animation
  if (!startRingAnim) {
    startRingPhase = 0;
    startRingT = 0;
    animateStartRing();
  }
}

// ──────────────────────────────────────────
// PAUSE
// ──────────────────────────────────────────

function togglePause() {
  if (g.state === 'idle') return;
  
  paused = !paused;
  g.state = paused ? 'paused' : 'playing';
  b.running = !paused;
  pauseBtn.textContent = paused ? '▶' : '⏸';
  
  if (paused) {
    // Show pause overlay with current stats
    pauseDur.textContent = formatDuration(getSessionDuration());
    pauseCy.textContent = b.cycles;
    pauseSq.textContent = g.squares;
    pauseOverlay.classList.remove('hidden');
  } else {
    pauseOverlay.classList.add('hidden');
    last = performance.now();
  }
}

// ──────────────────────────────────────────
// SESSION SUMMARY
// ──────────────────────────────────────────

const CLOSING_MESSAGES = [
  'nice reset',
  'take this calm with you',
  'breathe easy',
  'well done',
  'a moment well spent'
];

function showSummary() {
  stopMusic();
  g.state = 'idle';
  b.running = false;
  paused = false;
  pauseBtn.textContent = '⏸';
  pauseOverlay.classList.add('hidden');
  
  const dur = getSessionDuration();
  sumDur.textContent = formatDuration(dur);
  sumCy.textContent = b.cycles;
  sumSq.textContent = g.squares;
  sumSk.textContent = g.bestStreak;
  
  // Streak label with flow tier
  if (g.bestStreak >= 5) {
    sumSkLabel.textContent = 'best streak (deep flow)';
  } else if (g.bestStreak >= 3) {
    sumSkLabel.textContent = 'best streak (flow)';
  } else {
    sumSkLabel.textContent = 'best streak';
  }
  
  // Personal bests from localStorage
  let isPB = false;
  const prevBestSq = parseInt(localStorage.getItem('bb_best_squares') || '0');
  const prevBestSk = parseInt(localStorage.getItem('bb_best_streak') || '0');
  const prevTotalCy = parseInt(localStorage.getItem('bb_total_cycles') || '0');
  
  if (g.squares > prevBestSq) {
    localStorage.setItem('bb_best_squares', g.squares);
    isPB = true;
  }
  if (g.bestStreak > prevBestSk) {
    localStorage.setItem('bb_best_streak', g.bestStreak);
    isPB = true;
  }
  localStorage.setItem('bb_total_cycles', prevTotalCy + b.cycles);
  
  sumPb.style.display = isPB ? 'block' : 'none';
  sumMsg.textContent = CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)];
  
  summaryOverlay.classList.remove('hidden');
  
  // Auto-dismiss after 8 seconds if no interaction
  const autoDismiss = setTimeout(() => {
    if (!summaryOverlay.classList.contains('hidden')) {
      navigateBack();
    }
  }, 8000);
  
  // Clear timeout on any interaction
  summaryOverlay.addEventListener('click', () => clearTimeout(autoDismiss), { once: true });
}

function navigateBack() {
  if (document.referrer && document.referrer.includes('dashboard')) {
    history.back();
  } else {
    window.location.href = '/';
  }
}

// ──────────────────────────────────────────
// CONTROLS AUTO-FADE
// ──────────────────────────────────────────

function trackInput() {
  if (controlsFaded) return;
  inputCount++;
  if (inputCount >= 3) {
    controlsFaded = true;
    controlsEl.classList.add('faded');
  }
}

// ──────────────────────────────────────────
// GAME LOOP
// ──────────────────────────────────────────

function loop(t) {
  try {
    const dt = t - last;
    last = t;

    if (!paused && g.state === 'playing') {
      updateBreath(b, dt);
      tick(g, dt);
      updateFalling(g, dt);
      updateDissolving(g, dt);

      if (!g.piece) spawn(g);
    }

    // Update hue CSS var for ambient blobs
    document.documentElement.style.setProperty('--hue', b.hue);

    render(g, b, !paused && g.state === 'playing' ? dt : 0);

    // UI: stats
    sqEl.textContent = g.squares;
    cyEl.textContent = b.cycles;
    
    // Streak display
    if (g.streak > 0) {
      streakStat.style.display = '';
      skEl.textContent = g.streak;
      skLabel.textContent = g.streak >= 5 ? 'deep flow' : g.streak >= 3 ? 'flow' : 'streak';
    } else {
      streakStat.style.display = 'none';
    }
    
    // Pulse score counter on increase
    if (g.squares > prevSquares) {
      sqEl.classList.add('pulse');
      setTimeout(() => sqEl.classList.remove('pulse'), 350);
      prevSquares = g.squares;
    }
  } catch (err) {
    console.error('Game loop error:', err);
  }
  requestAnimationFrame(loop);
}

// ──────────────────────────────────────────
// KEYBOARD INPUT
// ──────────────────────────────────────────

addEventListener('keydown', e => {
  // Space to start from idle or summary
  if ((g.state === 'idle') && e.code === 'Space') {
    e.preventDefault();
    if (!summaryOverlay.classList.contains('hidden')) {
      navigateBack();
      return;
    }
    start();
    return;
  }
  
  // R to restart
  if (e.code === 'KeyR') {
    showStart();
    return;
  }
  
  // Escape from pause overlay
  if (e.code === 'Escape' && !pauseOverlay.classList.contains('hidden')) {
    togglePause();
    return;
  }
  
  if (g.state !== 'playing') return;
  
  let acted = false;
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': acted = move(g, -1, 0); break;
    case 'ArrowRight': case 'KeyD': acted = move(g, 1, 0); break;
    case 'ArrowDown': case 'KeyS': acted = move(g, 0, 1); break;
    case 'ArrowUp': case 'KeyW': case 'Space':
      e.preventDefault();
      drop(g);
      sfxDrop();
      acted = true;
      break;
    case 'KeyE': 
      acted = rotate(g); 
      if (acted) sfxRotate();
      break;
    case 'KeyQ': 
      acted = rotateCCW(g); 
      if (acted) sfxRotate();
      break;
    case 'Escape': case 'KeyP': togglePause(); break;
  }
  if (acted) {
    resetLock(g);
    trackInput();
  }
});

// ──────────────────────────────────────────
// TOUCH INPUT
// ──────────────────────────────────────────

if (isTouch) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchMoved = false;
  let lastTapTime = 0;

  touchOverlay.addEventListener('touchstart', e => {
    e.preventDefault();
    
    // Start from idle
    if (g.state === 'idle') {
      if (!summaryOverlay.classList.contains('hidden')) {
        navigateBack();
        return;
      }
      if (!startEl.classList.contains('hidden')) {
        start();
        return;
      }
      return;
    }
    
    // Unpause on touch
    if (paused) {
      togglePause();
      return;
    }
    
    if (g.state !== 'playing') return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    touchMoved = false;
    
    // Two-finger tap = rotate CCW
    if (e.touches.length >= 2) {
      const acted = rotateCCW(g);
      if (acted) { sfxRotate(); resetLock(g); trackInput(); }
      return;
    }
  }, { passive: false });

  touchOverlay.addEventListener('touchmove', e => {
    e.preventDefault();
    if (g.state !== 'playing' || paused) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const threshold = 30;
    
    if (Math.abs(dx) > threshold && !touchMoved) {
      touchMoved = true;
      const acted = move(g, dx > 0 ? 1 : -1, 0);
      if (acted) { resetLock(g); trackInput(); }
      touchStartX = touch.clientX;
    }
    
    if (dy > threshold && !touchMoved) {
      touchMoved = true;
      const acted = move(g, 0, 1);
      if (acted) { resetLock(g); trackInput(); }
      touchStartY = touch.clientY;
    }
  }, { passive: false });

  touchOverlay.addEventListener('touchend', e => {
    e.preventDefault();
    if (g.state !== 'playing' || paused) return;
    
    const elapsed = Date.now() - touchStartTime;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Fast swipe down = hard drop
    if (dy > 60 && elapsed < 300) {
      drop(g);
      sfxDrop();
      trackInput();
      return;
    }
    
    // Swipe up = rotate
    if (dy < -40 && elapsed < 400) {
      const acted = rotate(g);
      if (acted) { sfxRotate(); resetLock(g); trackInput(); }
      return;
    }
    
    // Double tap = hard drop
    const now = Date.now();
    if (now - lastTapTime < 300 && dist < 20) {
      drop(g);
      sfxDrop();
      trackInput();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
    
    // Tap (not a swipe)
    if (dist < 20 && elapsed < 250) {
      const layout = getLayout();
      
      // Tap above grid = rotate
      if (touch.clientY < layout.gridTop) {
        const acted = rotate(g);
        if (acted) { sfxRotate(); resetLock(g); trackInput(); }
        return;
      }
      
      // Tap left/right half of grid = move
      const gridCenterX = layout.gridLeft + layout.gridWidth / 2;
      if (touch.clientX < gridCenterX) {
        const acted = move(g, -1, 0);
        if (acted) { resetLock(g); trackInput(); }
      } else {
        const acted = move(g, 1, 0);
        if (acted) { resetLock(g); trackInput(); }
      }
    }
  }, { passive: false });
}

// ──────────────────────────────────────────
// BUTTON HANDLERS
// ──────────────────────────────────────────

goBtn.onclick = start;
pauseBtn.onclick = togglePause;
resumeBtn.onclick = () => {
  if (paused) togglePause();
};
endBtn.onclick = showSummary;
closeBtn.onclick = () => {
  if (g.state === 'playing' || paused) {
    showSummary();
  } else {
    navigateBack();
  }
};
sumBackBtn.onclick = navigateBack;

// ──────────────────────────────────────────
// INIT
// ──────────────────────────────────────────

initRender();
initAudio();
loadMusic('assets/BB-BGM-WhisperingEchoes').catch(err => console.warn('Music load failed:', err));

requestAnimationFrame(() => {
  positionOverlays();
  requestAnimationFrame(loop);
});
