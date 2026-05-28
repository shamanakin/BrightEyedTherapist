/**
 * BreathBlocks - audio.js
 * Web Audio API: background music with fades + generative SFX
 */

let ctx, musicGain, sfxGain, musicSource, musicBuffer;
const FADE_IN = 2000;
const FADE_OUT = 1500;

// Phase constants mirrored from breath.js (avoid circular import)
const PH_INHALE = 0, PH_HOLD = 1, PH_EXHALE = 2, PH_REST = 3;

/**
 * Initialize Web Audio context and gain nodes
 */
export function initAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  musicGain = ctx.createGain();
  sfxGain = ctx.createGain();
  musicGain.connect(ctx.destination);
  sfxGain.connect(ctx.destination);
  musicGain.gain.value = 0;
  sfxGain.gain.value = 0.48;
}

/**
 * Resume audio context (required after user interaction)
 */
export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

/**
 * Load music file (OGG primary, MP3 fallback)
 * @param {string} basePath - Path without extension
 * @returns {Promise<AudioBuffer|null>}
 */
export async function loadMusic(basePath) {
  const formats = ['.ogg', '.mp3'];
  for (const ext of formats) {
    try {
      const res = await fetch(basePath + ext);
      if (res.ok) {
        const buf = await ctx.decodeAudioData(await res.arrayBuffer());
        musicBuffer = buf;
        return buf;
      }
    } catch (e) { /* try next format */ }
  }
  console.warn('Could not load music from', basePath);
  return null;
}

/**
 * Play background music with fade in
 * @param {AudioBuffer} buffer - Decoded audio buffer
 */
export function playMusic(buffer) {
  if (!ctx || !buffer) return;
  
  if (musicSource) {
    try { musicSource.stop(); } catch (e) {}
  }
  
  musicSource = ctx.createBufferSource();
  musicSource.buffer = buffer;
  musicSource.loop = true;
  musicSource.connect(musicGain);
  musicSource.start();
  
  // Fade in
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(0, now);
  musicGain.gain.linearRampToValueAtTime(0.24, now + FADE_IN / 1000);
}

/**
 * Stop music with fade out
 */
export function stopMusic() {
  if (!ctx || !musicSource) return;
  
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.linearRampToValueAtTime(0, now + FADE_OUT / 1000);
  
  const src = musicSource;
  setTimeout(() => {
    try { src.stop(); } catch (e) {}
  }, FADE_OUT);
  
  musicSource = null;
}

/**
 * Get the loaded music buffer
 */
export function getMusicBuffer() {
  return musicBuffer;
}

// ─────────────────────────────────────────────────────────
// GENERATIVE SOUND EFFECTS
// ─────────────────────────────────────────────────────────

/**
 * Game Start Confirmation - Two-tone ascending chime (C5 → E5)
 */
export function sfxStart() {
  if (!ctx) return;
  resumeAudio();
  
  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.value = 523.25; // C5
  osc2.frequency.value = 659.25; // E5
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(sfxGain);
  
  osc1.start(now);
  osc2.start(now + 0.15);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.8);
}

/**
 * Block Rotate - Soft whoosh with filtered pitch sweep
 */
export function sfxRotate() {
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
  
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Block Drop/Lock - Soft low-frequency thud
 */
export function sfxDrop() {
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  
  osc.connect(gain);
  gain.connect(sfxGain);
  
  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Block Clear - Streak-aware dissolve shimmer
 * Chord literally gets richer as streak grows — more harmonics = warmer sound = more dopamine
 * @param {number} streak - Current streak count (1 = first clear)
 */
export function sfxClear(streak = 1) {
  if (!ctx) return;
  
  const now = ctx.currentTime;
  // Base A major 7 chord
  const freqs = [440, 554, 659, 784]; // A4, C#5, E5, G5
  
  // Streak 3+: add B5 (warmer)
  if (streak >= 3) freqs.push(988);
  // Streak 5+: add D5 (even warmer, richer)
  if (streak >= 5) freqs.push(587);
  
  // Scale sustain with streak
  const sustainMult = Math.min(1 + streak * 0.15, 2.0);
  // Scale volume slightly with streak (subtle)
  const volMult = Math.min(1 + streak * 0.05, 1.3);
  
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = f;
    
    const delay = i * 0.06;
    const peak = 0.025 * volMult;
    const release = 0.9 * sustainMult;
    
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(peak, now + delay + 0.12);
    gain.gain.setValueAtTime(peak, now + delay + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + release);
    
    osc.connect(gain);
    gain.connect(sfxGain);
    
    osc.start(now + delay);
    osc.stop(now + delay + release + 0.1);
  });
}

/**
 * Phase transition audio cues — extremely subtle, barely perceptible
 * Works subconsciously to guide breathing without being annoying
 * @param {number} phase - New phase constant (0=INHALE, 1=HOLD, 2=EXHALE, 3=REST)
 */
export function sfxPhaseTransition(phase) {
  if (!ctx) return;
  
  const now = ctx.currentTime;
  
  if (phase === PH_INHALE) {
    // Soft ascending sine sweep 200Hz → 400Hz over 300ms
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (phase === PH_HOLD) {
    // Single gentle bell tone E5 sine, 200ms
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 659.25; // E5
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (phase === PH_EXHALE) {
    // Warm descending sweep 400Hz → 200Hz over 300ms
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }
  // REST: near-silence — do nothing (natural fade of previous cues is enough)
}