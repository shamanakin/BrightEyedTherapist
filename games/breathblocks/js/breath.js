/**
 * BreathBlocks - breath.js
 * 16s cycle: INHALE → HOLD → EXHALE → REST
 * Tide line rises/falls with cubic easing
 */

export const PHASE = { INHALE: 0, HOLD: 1, EXHALE: 2, REST: 3 };
export const DURATION = 4000;
const HUES = [200, 280, 340, 200];

export function createBreath() {
  return {
    phase: PHASE.REST,
    t: 0,
    cycles: 0,
    tide: 0,      // 0 = bottom, 1 = top
    hue: HUES[PHASE.REST],
    running: false,
    onExhaleEnd: null,
    onPhaseChange: null  // callback(newPhase, oldPhase)
  };
}

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpHue(a, b, t) {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (a + d * t + 360) % 360;
}

export function updateBreath(b, dt) {
  if (!b.running) return;

  b.t += dt;
  const p = Math.min(b.t / DURATION, 1);

  // Tide position
  if (b.phase === PHASE.INHALE) b.tide = ease(p);
  else if (b.phase === PHASE.HOLD) b.tide = 1;
  else if (b.phase === PHASE.EXHALE) b.tide = 1 - ease(p);
  else b.tide = 0;

  // Hue lerp
  const next = (b.phase + 1) % 4;
  b.hue = lerpHue(HUES[b.phase], HUES[next], p * 0.25);

  // Transition
  if (b.t >= DURATION) {
    const old = b.phase;
    b.phase = (b.phase + 1) % 4;
    b.t = 0;

    // Phase change callback (for audio cues)
    if (b.onPhaseChange) b.onPhaseChange(b.phase, old);

    if (old === PHASE.EXHALE && b.onExhaleEnd) b.onExhaleEnd();
    if (b.phase === PHASE.INHALE) b.cycles++;
  }
}

export function resetBreath(b) {
  b.phase = PHASE.REST;
  b.t = 0;
  b.cycles = 0;
  b.tide = 0;
  b.hue = HUES[PHASE.REST];
  b.running = false;
}
