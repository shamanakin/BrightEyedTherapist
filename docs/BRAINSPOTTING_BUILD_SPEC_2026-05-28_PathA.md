# Brainspotting — Build Spec (Path A)

**Target file:** `tool_brainspotting.html` (single file; ~1,931 lines)
**Scope:** Production-cost bug fix + data-safety parity with Life Map/Genogram + matched UX polish. Eight items.
**Date:** May 28, 2026

This spec is the source of truth. Audit context is in `docs/BRAINSPOTTING_AUDIT_2026-05-28.md`. Execute items in the order given. Acceptance criteria are code-level so no manual browser testing is required to confirm each item; the post-execution walkthrough at the end lists what *would* benefit from eventual visual confirmation (low urgency).

---

## Global guardrails

1. Only `tool_brainspotting.html` is modified.
2. Do not rename existing functions, variables, or DOM ids — except where this spec explicitly says to.
3. Do not refactor adjacent code.
4. No new external dependencies.
5. New CSS goes inside the existing `<style>` block in `<head>`.
6. Hard-coded dark theme stays as-is (Brainspotting is intentionally dark; no light-mode parity work here).
7. No changes to the `sessionData` schema beyond what's listed below.
8. The viewer (`tool_brainspotting_viewer.html`) and API endpoints (`api/brainspotting/*.php`) are NOT modified in this batch.

---

## Pre-flight check

Confirm:
- `tool_brainspotting.html` exists at the repo root.
- Current line count is in the ~1,930 range.
- The file contains: `animateXScan`, `animateYScan`, `handleMouseMove`, `sendSessionUpdate`, `togglePause`, `centerPointer`, `currentPhase`, the `setupModal` and `checkinModal` backdrop-click listeners.

If anything is missing, stop and report.

---

## Item 1 — Remove per-frame session updates (PRODUCTION COST FIX)

**Goal:** Stop hitting `/api/brainspotting/update_session.php` on every animation frame and every mousemove. The existing 250ms `setInterval` (created in `createSharingSession`) already provides 4Hz update cadence, which is faster than the viewer polls (333ms). The per-frame calls generate ~60 requests/second per active scan and would not scale beyond 2–3 concurrent therapists on shared hosting.

**What changes:**

Remove the `sendSessionUpdate()` call from FOUR specific high-frequency paths. Do NOT remove it from user-event paths (drag, nudge, click-to-lock, phase transitions) — those are low frequency and the immediate feedback is worth it.

(a) Inside `animateXScan` (around line 815). Find:

```js
updateBiolateralAudio(positionFactor);
sendSessionUpdate();

animationFrameId = requestAnimationFrame(animateXScan);
```

Remove the `sendSessionUpdate();` line. Final shape:

```js
updateBiolateralAudio(positionFactor);

animationFrameId = requestAnimationFrame(animateXScan);
```

(b) Inside `animateYScan` (around line 844). Find:

```js
updateBiolateralAudio(positionFactor);
sendSessionUpdate();

animationFrameId = requestAnimationFrame(animateYScan);
```

Remove the `sendSessionUpdate();` line. Same shape as (a).

(c) Inside `handleMouseMove` (around line 867). Find:

```js
// Update audio based on X position
const positionFactor = (x + pointerSize / 2) / rect.width;
updateBiolateralAudio(positionFactor);
sendSessionUpdate();
}
```

Remove the `sendSessionUpdate();` line. Final shape:

```js
// Update audio based on X position
const positionFactor = (x + pointerSize / 2) / rect.width;
updateBiolateralAudio(positionFactor);
}
```

(d) Inside the touch handler for manual mode (around line 1779). Find:

```js
bsContainer.addEventListener('touchmove', (e) => {
    if (currentPhase === 'manual') {
        e.preventDefault();
        const t = getTouchPos(e);
        const rect = bsContainer.getBoundingClientRect();
        pointer.style.left = `${t.clientX - rect.left - pointerSize / 2}px`;
        pointer.style.top = `${t.clientY - rect.top - pointerSize / 2}px`;
        sendSessionUpdate();
    }
}, { passive: false });
```

Remove the `sendSessionUpdate();` line. Final shape:

```js
bsContainer.addEventListener('touchmove', (e) => {
    if (currentPhase === 'manual') {
        e.preventDefault();
        const t = getTouchPos(e);
        const rect = bsContainer.getBoundingClientRect();
        pointer.style.left = `${t.clientX - rect.left - pointerSize / 2}px`;
        pointer.style.top = `${t.clientY - rect.top - pointerSize / 2}px`;
    }
}, { passive: false });
```

**Do not touch:**
- The `setInterval(sendSessionUpdate, 250)` call inside `createSharingSession` (line ~1400). That's the new primary update mechanism.
- `sendSessionUpdate()` calls in: `startHolding`, `handleNudge`, `handleDrag`, `startManualMode`, `createSharingSession` (the initial single-shot send). These are all low-frequency, user-initiated, or one-shot — they stay.
- The `sendSessionUpdate` function definition itself.
- The viewer-side polling (separate file, not in scope).

**Acceptance criteria (code-level):**
1. `sendSessionUpdate()` is no longer called inside `animateXScan`, `animateYScan`, `handleMouseMove`, or the manual-mode `touchmove` handler.
2. `sendSessionUpdate()` IS still called inside `startHolding`, `handleNudge`, `handleDrag`, `startManualMode`, and `createSharingSession`.
3. The `setInterval(sendSessionUpdate, 250)` line is unchanged.
4. Grep `sendSessionUpdate\(\)` should return 5–6 call sites in the file (down from 10+).

---

## Item 2 — Remove backdrop-close on setup and checkin modals

**Goal:** Match the Life Map Path A pattern. Heavy modals with in-progress content shouldn't dismiss on a backdrop click.

**Where:** Find the existing backdrop-close listeners (around line 1729–1734):

```js
setupModal.addEventListener('click', (e) => {
    if (e.target === setupModal) setupModal.classList.add('hidden');
});
checkinModal.addEventListener('click', (e) => {
    if (e.target === checkinModal) checkinModal.classList.add('hidden');
});
```

Delete both listeners. Clean removal — no comment placeholder.

**Do not touch:**
- The `settingsModal` backdrop-close listener immediately above (line 1726–1728). That stays — settings/help/share is lightweight content.
- The Cancel button on the setup modal or the action buttons on the checkin modal — they continue to be the way to dismiss.
- The Esc handler in the keydown listener (line 1666–1674) which can dismiss any modal — also stays.

**Acceptance criteria (code-level):**
1. The `setupModal.addEventListener('click', ...)` and `checkinModal.addEventListener('click', ...)` blocks are gone.
2. The `settingsModal.addEventListener('click', ...)` block is unchanged.
3. The Esc handler still includes `setupModal` and `checkinModal` close branches.

---

## Item 3 — Tighten phase indicator text

**Goal:** Three sentences become three short instructions. Less to parse mid-session.

**Where:** Three places in the JS.

(a) Inside `startXScan` (around line 904). Find:

```js
phaseText.textContent = 'Therapist: watch for activation while the client follows horizontally. Click or SPACE to lock X.';
```

Replace with:

```js
phaseText.textContent = 'Lock the X axis when you see activation. Click or SPACE.';
```

(b) Inside `startYScan` (around line 935). Find:

```js
phaseText.textContent = 'Therapist: continue vertically, then click or SPACE to lock the brainspot.';
```

Replace with:

```js
phaseText.textContent = 'Lock the brainspot at the Y position. Click or SPACE.';
```

(c) Inside `startManualMode` (around line 1031). Find:

```js
phaseText.textContent = 'Therapist: guide the pointer manually, then click to lock the brainspot.';
```

Replace with:

```js
phaseText.textContent = 'Click anywhere to lock the brainspot.';
```

**Do not touch:**
- The HTML `<p id="phase-text">Follow the dot with your eyes</p>` initial text (line 487) — that's the empty-state default. Stays.
- The "Click or SPACE to mark the spot" subline (line 488) — also stays.

**Acceptance criteria (code-level):**
1. The three `phaseText.textContent` assignments inside `startXScan`, `startYScan`, `startManualMode` match the new strings.
2. The HTML default text is unchanged.

---

## Item 4 — Rename "Processing Complete" → "Session Review"

**Goal:** Stop calling the review modal "complete" when the user may still choose to process another round.

**Where:** The checkin modal HTML (around line 582). Find:

```html
<h2>Processing Complete</h2>
```

Replace with:

```html
<h2>Session Review</h2>
```

**Do not touch:**
- The session-summary div, the buttons, or any other text.

**Acceptance criteria (code-level):**
1. The checkin modal H2 reads "Session Review".

---

## Item 5 — Spacebar pauses during holding phase

**Goal:** Standard keyboard expectation. Space already serves a clinical purpose during scan phases (locks the axis); during holding it should toggle pause.

**Where:** Inside the existing keydown handler (around line 1651). Find:

```js
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        
        if (currentPhase === 'x-scan') {
            lockXPosition();
        } else if (currentPhase === 'y-scan') {
            lockYPosition();
        }
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || 
               e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleNudge(e.code);
    } else if (e.code === 'Escape') {
        ...
    }
});
```

Add a `holding` branch to the Space handler. Final shape for the Space block:

```js
if (e.code === 'Space') {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();

    if (currentPhase === 'x-scan') {
        lockXPosition();
    } else if (currentPhase === 'y-scan') {
        lockYPosition();
    } else if (currentPhase === 'holding') {
        togglePause();
    }
}
```

**Do not touch:**
- The arrow key handler.
- The Esc handler.
- `togglePause` itself.

**Acceptance criteria (code-level):**
1. The Space handler has a `currentPhase === 'holding'` branch that calls `togglePause()`.
2. Existing scan-phase behavior is unchanged.

---

## Item 6 — Persist preferences in localStorage + `prefers-reduced-motion` default

**Goal:** Therapist's choices for speed, color, audio, control mode persist across sessions. Additionally, when the OS reports `prefers-reduced-motion: reduce` and the user has no stored speed preference, default to Slow.

**What changes:**

(a) Add a preferences module inside the `<script>` block. Place after the SPEED_MAP / COLORS_MAP constants (around line 690), BEFORE the audio init code:

```js
/*************** Preferences ***************/
const PREF_KEYS = {
    speed: 'bet_bsp_speed',
    color: 'bet_bsp_color',
    audio: 'bet_bsp_audio',
    mode:  'bet_bsp_mode'
};

function savePref(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        // localStorage may be unavailable; non-fatal.
    }
}

function loadPref(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
    } catch (err) {
        return fallback;
    }
}

function applyStoredPreferences() {
    // Speed
    const storedSpeed = loadPref(PREF_KEYS.speed, null);
    if (storedSpeed !== null && SPEED_MAP[storedSpeed]) {
        currentSpeedIndex = storedSpeed;
        scanDurationMs = SPEED_MAP[storedSpeed].ms;
    } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // No stored preference + OS prefers reduced motion → default to Slow.
        currentSpeedIndex = 1;
        scanDurationMs = SPEED_MAP[1].ms;
    }

    // Color
    const storedColor = loadPref(PREF_KEYS.color, null);
    if (storedColor && COLORS_MAP[storedColor]) {
        ballColor = storedColor;
        pointer.style.backgroundColor = ballColor;
        pointer.style.boxShadow = `0 0 30px ${ballColor}80`;
        updateColorBtnStyle();
    }

    // Audio
    const storedAudio = loadPref(PREF_KEYS.audio, null);
    if (storedAudio === true) {
        // Defer actual audio init until first user gesture; just remember the preference.
        // setAudioEnabled handles the UI update; initAudio is gated by user interaction.
        audioEnabled = true;
        audioBtn.classList.remove('text-gray-400');
        audioBtn.classList.add('text-indigo-300');
        audioOnIcon.classList.remove('hidden');
        audioOffIcon.classList.add('hidden');
    }

    // Mode
    const storedMode = loadPref(PREF_KEYS.mode, null);
    if (storedMode === 'manual' && controlMode !== 'manual') {
        toggleControlMode();
    } else if (storedMode === 'scan' && controlMode !== 'scan') {
        toggleControlMode();
    }
}
```

(b) Wire preference saving into the existing change handlers.

In `openSpeedModal`'s click handler, find:

```js
btn.addEventListener('click', e => {
    const newSpeed = parseInt(e.currentTarget.dataset.speed);
    currentSpeedIndex = newSpeed;
    scanDurationMs = SPEED_MAP[newSpeed].ms;
    closeModal();
});
```

Add the save call. Final shape:

```js
btn.addEventListener('click', e => {
    const newSpeed = parseInt(e.currentTarget.dataset.speed);
    currentSpeedIndex = newSpeed;
    scanDurationMs = SPEED_MAP[newSpeed].ms;
    savePref(PREF_KEYS.speed, newSpeed);
    closeModal();
});
```

In `openColorModal`'s click handler, find:

```js
btn.addEventListener('click', e => {
    ballColor = e.currentTarget.dataset.color;
    pointer.style.backgroundColor = ballColor;
    pointer.style.boxShadow = `0 0 30px ${ballColor}80`;
    updateColorBtnStyle();
    closeModal();
});
```

Add the save call. Final shape:

```js
btn.addEventListener('click', e => {
    ballColor = e.currentTarget.dataset.color;
    pointer.style.backgroundColor = ballColor;
    pointer.style.boxShadow = `0 0 30px ${ballColor}80`;
    updateColorBtnStyle();
    savePref(PREF_KEYS.color, ballColor);
    closeModal();
});
```

In `setAudioEnabled`, add the save call at the very top. Final shape:

```js
function setAudioEnabled(on) {
    audioEnabled = on;
    savePref(PREF_KEYS.audio, on);
    if (on) {
        // ... existing logic ...
    } else {
        // ... existing logic ...
    }
}
```

In `toggleControlMode`, add the save call at the end (after both branches). Final shape:

```js
function toggleControlMode() {
    if (controlMode === 'scan') {
        // ... existing scan→manual logic ...
    } else {
        // ... existing manual→scan logic ...
    }
    savePref(PREF_KEYS.mode, controlMode);
}
```

(c) Call `applyStoredPreferences()` on boot. Inside the existing `DOMContentLoaded` handler, find the first line:

```js
centerPointer();
```

Add the apply call immediately AFTER it:

```js
centerPointer();
applyStoredPreferences();
```

**Do not touch:**
- The constants `SPEED_MAP`, `COLORS_MAP`, `pointerSize`, `TRAVEL_PERCENTAGE`.
- The default values of `currentSpeedIndex`, `scanDurationMs`, `ballColor`, `audioEnabled`, `controlMode` — those remain as the fallback when nothing is stored.
- The `initAudio()` function — audio doesn't actually start until the user explicitly enables it via a gesture; restoring the preference only updates the UI flag.

**Acceptance criteria (code-level):**
1. `PREF_KEYS`, `savePref`, `loadPref`, `applyStoredPreferences` are defined.
2. `applyStoredPreferences()` is called inside the `DOMContentLoaded` handler, right after `centerPointer()`.
3. The four preference-change paths (speed click, color click, `setAudioEnabled`, `toggleControlMode`) each call `savePref()`.
4. The `prefers-reduced-motion` check happens only when no stored speed exists.

---

## Item 7 — sessionStorage draft + `beforeunload` guard

**Goal:** Match Life Map and Genogram's data-safety floor. Session content (type, SUDs log, notes, brainspot, processing time) persists in tab-scoped sessionStorage during the session. Crash recovery banner on reload. `beforeunload` prompts if there's substantive unsaved content.

**Critical guardrail specific to this item:** This is `sessionStorage`, NOT `localStorage`. Clinical content (SUDs log, notes, processing time) must not outlive the tab.

**What changes:**

(a) Add CSS for the recovery banner inside the existing `<style>` block. Place near the toast container styles (around line 27):

```css
#bsp-draft-banner {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(31, 41, 55, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0.7rem 1rem;
    z-index: 200;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #f3f4f6;
    display: none;
    align-items: center;
    gap: 0.85rem;
    max-width: calc(100vw - 2rem);
}
#bsp-draft-banner.visible { display: flex; }
#bsp-draft-banner .draft-text {
    line-height: 1.4;
}
#bsp-draft-banner button {
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid #4b5563;
    background: #1f2937;
    color: #f3f4f6;
    font-size: 0.8rem;
    font-family: inherit;
    white-space: nowrap;
}
#bsp-draft-banner button.draft-primary {
    background: #2C5558;
    color: #fff;
    border-color: #2C5558;
}
```

(b) Add a draft-recovery section inside the `<script>` block. Place right after the `PREF_KEYS` / preferences module from Item 6, BEFORE the `audio` init code (around line 692). The new section:

```js
/*************** Draft Recovery (sessionStorage) ***************/
const BSP_DRAFT_KEY = 'bet-brainspotting-draft';
const BSP_DRAFT_DEBOUNCE_MS = 2000;
let _draftPersistTimer = null;
let _hasUnsavedContent = false;

function hasSubstantiveContent() {
    if (!sessionData) return false;
    if (Array.isArray(sessionData.sudsLog) && sessionData.sudsLog.length > 0) return true;
    if (typeof sessionData.notes === 'string' && sessionData.notes.trim().length > 0) return true;
    if (typeof sessionData.processingTime === 'number' && sessionData.processingTime > 30) return true;
    return false;
}

function persistDraft() {
    if (_draftPersistTimer) clearTimeout(_draftPersistTimer);
    _draftPersistTimer = setTimeout(() => {
        try {
            const draft = {
                sessionData: sessionData,
                currentPhase: currentPhase,
                lockedX: lockedX,
                lockedY: lockedY,
                savedAt: Date.now()
            };
            sessionStorage.setItem(BSP_DRAFT_KEY, JSON.stringify(draft));
        } catch (err) {
            console.warn('Brainspotting draft persist failed:', err);
        }
    }, BSP_DRAFT_DEBOUNCE_MS);
}

function clearDraft() {
    if (_draftPersistTimer) {
        clearTimeout(_draftPersistTimer);
        _draftPersistTimer = null;
    }
    try {
        sessionStorage.removeItem(BSP_DRAFT_KEY);
    } catch (err) {
        // sessionStorage may be unavailable; silent.
    }
    _hasUnsavedContent = false;
}

function markSessionChanged() {
    _hasUnsavedContent = hasSubstantiveContent();
    persistDraft();
}

function maybeOfferDraftRecovery() {
    let raw;
    try {
        raw = sessionStorage.getItem(BSP_DRAFT_KEY);
    } catch (err) {
        return;
    }
    if (!raw) return;

    let draft;
    try {
        draft = JSON.parse(raw);
    } catch (err) {
        clearDraft();
        return;
    }

    if (!draft || !draft.sessionData) {
        clearDraft();
        return;
    }

    const sd = draft.sessionData;
    const sudsCount = Array.isArray(sd.sudsLog) ? sd.sudsLog.length : 0;
    const hasNotes = typeof sd.notes === 'string' && sd.notes.trim().length > 0;
    const hasTime = typeof sd.processingTime === 'number' && sd.processingTime > 30;

    if (sudsCount === 0 && !hasNotes && !hasTime) {
        clearDraft();
        return;
    }

    showDraftRecoveryBanner(draft, { sudsCount, hasNotes, hasTime });
}

function showDraftRecoveryBanner(draft, summary) {
    if (document.getElementById('bsp-draft-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'bsp-draft-banner';

    const bits = [];
    if (summary.sudsCount > 0) bits.push(`${summary.sudsCount} SUDs ${summary.sudsCount === 1 ? 'entry' : 'entries'}`);
    if (summary.hasNotes) bits.push('notes');
    if (summary.hasTime) bits.push('processing time');
    const summaryText = bits.length ? ` (${bits.join(' · ')})` : '';

    const text = document.createElement('span');
    text.className = 'draft-text';
    text.textContent = `Recovered unsaved brainspotting session from this tab${summaryText}.`;

    const keepBtn = document.createElement('button');
    keepBtn.className = 'draft-primary';
    keepBtn.textContent = 'Keep';

    const discardBtn = document.createElement('button');
    discardBtn.textContent = 'Discard';

    banner.appendChild(text);
    banner.appendChild(keepBtn);
    banner.appendChild(discardBtn);
    document.body.appendChild(banner);
    banner.classList.add('visible');

    keepBtn.addEventListener('click', () => {
        try {
            const restored = draft.sessionData || {};
            sessionData.date = restored.date || sessionData.date;
            sessionData.type = restored.type || sessionData.type;
            sessionData.brainspot = restored.brainspot || sessionData.brainspot;
            sessionData.processingTime = restored.processingTime || 0;
            sessionData.sudsLog = Array.isArray(restored.sudsLog) ? restored.sudsLog : [];
            sessionData.notes = typeof restored.notes === 'string' ? restored.notes : '';
            if (sessionNotesInput) sessionNotesInput.value = sessionData.notes;
            renderSudsLog();
            _hasUnsavedContent = hasSubstantiveContent();
            showToast('Session restored. Continue or export the summary when ready.', 'info');
        } catch (err) {
            console.error('Failed to apply recovered draft:', err);
            showToast('Could not restore draft.', 'error');
        }
        banner.remove();
    });

    discardBtn.addEventListener('click', () => {
        clearDraft();
        banner.remove();
    });
}
```

(c) Wire `markSessionChanged()` into the state-mutation paths.

In `logSuds` (around line 1883), after the existing `sessionData.sudsLog.push(entry); renderSudsLog();` calls, add `markSessionChanged();`:

```js
function logSuds(level) {
    const phaseLabels = { ... };
    const entry = { ... };
    sessionData.sudsLog.push(entry);
    renderSudsLog();
    markSessionChanged();
    showToast(`SUDs: ${level} logged`, 'info');
}
```

In the notes input handler (around line 1861), after `sessionData.notes = sessionNotesInput.value`, add `markSessionChanged();`:

```js
sessionNotesInput.addEventListener('input', () => {
    sessionData.notes = sessionNotesInput.value;
    markSessionChanged();
});
```

In `updateHoldingTimer` (around line 996), after `sessionData.processingTime = elapsed;`, add `markSessionChanged();` BUT gate it to once every 10 seconds to avoid excessive persistence churn. Easiest approach — only call it when elapsed crosses a 10-second boundary:

```js
function updateHoldingTimer() {
    if (isPaused) return;
    const elapsed = Math.floor((Date.now() - holdingStartTime) / 1000) - pausedElapsed;
    const prevElapsed = sessionData.processingTime || 0;
    sessionData.processingTime = elapsed;
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
    if (Math.floor(elapsed / 10) !== Math.floor(prevElapsed / 10)) {
        markSessionChanged();
    }
}
```

In `endSession` (around line 1276), after the existing cleanup, add `clearDraft();`:

```js
async function endSession() {
    // ... existing cleanup ...
    await endSharingSession();
    clearDraft();
    // ... existing state reset ...
}
```

(d) Wire `maybeOfferDraftRecovery()` into boot. Inside the `DOMContentLoaded` handler, AT THE VERY END (after all the other listeners are bound), add:

```js
maybeOfferDraftRecovery();
```

(e) Update the existing `beforeunload` handler (around line 1639) to also warn about unsaved content. Find:

```js
window.addEventListener('beforeunload', () => {
    if (currentSessionToken) {
        endSharingSessionBestEffort();
    }
});
```

Replace with:

```js
window.addEventListener('beforeunload', (event) => {
    if (currentSessionToken) {
        endSharingSessionBestEffort();
    }
    if (hasSubstantiveContent()) {
        event.preventDefault();
        event.returnValue = '';
    }
});
```

The second `beforeunload` handler near the bottom of the file (around line 1922, for analytics) stays unchanged — it doesn't need to participate in the dirty check.

**Do not touch:**
- The `sessionData` schema fields themselves.
- The `endSharingSessionBestEffort` function.
- The PNG / clipboard summary logic.

**Acceptance criteria (code-level):**
1. `BSP_DRAFT_KEY = 'bet-brainspotting-draft'` is defined.
2. `persistDraft`, `clearDraft`, `markSessionChanged`, `maybeOfferDraftRecovery`, `showDraftRecoveryBanner`, `hasSubstantiveContent` are all defined.
3. `markSessionChanged()` is called from `logSuds`, the notes input handler, and `updateHoldingTimer` (with the 10s gate).
4. `clearDraft()` is called from `endSession`.
5. `maybeOfferDraftRecovery()` is called at the end of the DOMContentLoaded handler.
6. The `beforeunload` handler at line 1639 includes `if (hasSubstantiveContent()) { event.preventDefault(); event.returnValue = ''; }`.
7. CSS for `#bsp-draft-banner` is present.

---

## Item 8 — `endSession` should also clear preferences-irrelevant state

This isn't a new item — it's a guardrail check. The existing `endSession` (line 1276) resets `sessionData` to a clean shape. After Item 7, it also calls `clearDraft()`. No additional changes needed here. Listed only as a reminder for Composer: when verifying Item 7, confirm `endSession` runs in this order: cleanup intervals → end sharing → clear draft → reset UI → reset state.

---

## Post-execution verification (Composer)

After all items implemented:

1. **No console errors at boot.** Reload the tool. No errors.
2. **Per-frame update calls removed.** Grep the file for `sendSessionUpdate()`. Should return 5–6 results (was 10+). The animation loops and `handleMouseMove` should have NO `sendSessionUpdate` call.
3. **`setInterval(sendSessionUpdate, 250)` is unchanged** in `createSharingSession`.
4. **Backdrop close removed.** The `setupModal.addEventListener('click', ...)` and `checkinModal.addEventListener('click', ...)` blocks are gone. The `settingsModal` one remains.
5. **Phase text matches new strings.** Search the file for `'Therapist:`. Should return zero results (or only in helper text that wasn't in scope — confirm none are in `phaseText.textContent` assignments).
6. **Checkin modal H2 reads "Session Review".**
7. **Space pause branch present** in keydown handler.
8. **Preferences module present.** `PREF_KEYS`, `savePref`, `loadPref`, `applyStoredPreferences` all defined and `applyStoredPreferences()` is called from `DOMContentLoaded`.
9. **Draft recovery module present.** `BSP_DRAFT_KEY`, `persistDraft`, `clearDraft`, `maybeOfferDraftRecovery`, `showDraftRecoveryBanner`, `hasSubstantiveContent` all defined. `maybeOfferDraftRecovery()` is the last call in `DOMContentLoaded`.
10. **beforeunload dirty check present.** The handler at line ~1639 includes the `hasSubstantiveContent()` check with `event.preventDefault()`.
11. **Line count.** `tool_brainspotting.html` should grow by ~150–220 lines (most from Items 6 and 7).

If all eleven pass, report DONE.

---

## What will benefit from eventual visual confirmation (low urgency)

When Matthew has bandwidth, eyeball:

- A complete scan + holding session with sharing on. Confirm the viewer still updates smoothly at 4Hz (it polls at 3Hz so this matches well).
- DevTools Network tab during scan: confirm `/api/brainspotting/update_session.php` is being hit ~4 times/second, not ~60.
- Open the tool, choose Slow speed, refresh. Speed should restore to Slow.
- Toggle dark-mode OS preference (`prefers-reduced-motion`), reload with no stored speed pref. Should default to Slow.
- Add some SUDs entries during a session, close the tab. Browser shows "Leave site?" confirmation. Open a new tab to the tool — recovery banner appears with the SUDs count.
- Clicking outside the checkin modal does NOT dismiss it.

---

## Out of scope

- The XSS hardening pattern (audit Item 4) — deferred to a later round. No current vector.
- Undo lock during scan (audit Item 10) — defer.
- Notes save indicator (audit Item 11) — defer.
- Setup modal remembers last type (audit Item 12) — defer.
- Viewer-connected indicator (audit Item 14) — requires backend change; defer.
- Configurable audio frequency, pointer size, body CSS variables, etc. — all defer.
- Life Map / Brainspotting integration — separate epic.
- Viewer (`tool_brainspotting_viewer.html`) and API endpoints — not touched in this batch.

---

*End of build spec.*
