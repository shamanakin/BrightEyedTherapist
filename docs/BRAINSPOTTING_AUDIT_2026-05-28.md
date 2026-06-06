# Brainspotting — Improvement Audit

**Date:** May 28, 2026
**Source:** `tool_brainspotting.html` (1,931 lines), `tool_brainspotting_viewer.html` (450 lines), `api/brainspotting/*.php` (4 files, ~260 lines total)
**Author:** Claude (Cowork session with Matthew)
**Purpose:** Tiered, opinionated assessment of what's worth fixing. Once you flag targets, follow-up artifact will be a Composer-ready build spec.

---

## Top-line take

Brainspotting is in **better shape than I expected for the least-touched app**. The clinical workflow is well-structured: Scan mode does X-axis sweep → lock → Y-axis sweep along locked X → lock → holding phase with timer, pause, SUDS log, notes, and a clean review/end flow. Manual mode is fast for clinicians who prefer to guide directly. Session sharing reuses the EMDR `emdr_sessions` table cleanly. The viewer is genuinely good — non-blocking error handling, status indicator, pre-watch lock to defer audio init until client gesture.

But there is **one real production-cost issue I want to flag prominently** before anything else: the session-sharing update endpoint is hit **on every animation frame** during scan mode, which means ~60 requests/second to `/api/brainspotting/update_session.php` while sharing is active. On DreamHost shared hosting, this is unsustainable at any meaningful scale — a single therapist running a 30-minute brainspotting session with sharing on generates ~100,000 requests against the same MySQL row. It happens to work today because the user base is small. It will break (or get throttled, or surprise-bill) the moment two or three clinicians use Brainspotting simultaneously with sharing. This is Item 1 below.

Beyond that, the gaps mirror what we've already addressed in Life Map and Genogram: no draft recovery, no persisted preferences, click-outside-modal can lose context, no `prefers-reduced-motion` accommodation for a visually-stimulating tool. Tractable, mostly small.

If this were mine and I had a single afternoon, I'd ship the bug fix (Item 1) plus the cheap UX wins as a Path A bundle. The performance fix alone is enough reason to ship today.

---

## Tier 1 — Bugs and production-cost issues

### 1. Session-update endpoint hit at 60 fps during scan (PRODUCTION COST)

**Size:** S
**Severity:** Real — would create unsustainable load on shared hosting at modest concurrency.

`animateXScan` and `animateYScan` call `sendSessionUpdate()` on every `requestAnimationFrame` invocation. That's ~60 frames/second × the full scan duration (10s default at Medium speed). For a single brainspotting session with sharing active, this hits the update endpoint ~600 times during the X-scan, another ~600 during the Y-scan, plus a 250ms `setInterval` doing 4 more per second on top of that during all phases.

Per-session that's roughly 1,200 update calls just for the brainspot-finding phase, before any holding-phase nudging. The endpoint writes to MySQL (`UPDATE emdr_sessions SET state_json = ...`). On DreamHost shared MySQL, this is sustainable for 1–2 concurrent therapists. At 5 concurrent it would start showing up as connection limits / slow queries. At 10+ it could trip shared-hosting protections.

The 250ms interval was clearly added with shared-hosting cost in mind ("shared-hosting-friendly cadence" per the code comment). The per-frame update appears to be a leftover from an earlier iteration.

**Fix shape:** Remove `sendSessionUpdate()` calls from inside `animateXScan`, `animateYScan`, and `handleMouseMove`. Rely exclusively on the existing 250ms `setInterval`. The viewer polls every 333ms, so anything faster than ~3–4Hz on the host side is wasted bandwidth anyway. Visually identical from the client's perspective; the only thing lost is theoretical jitter-reduction that the existing transition CSS smooths over.

If you want slightly higher fidelity, bump the interval to 100ms — that's still 25× cheaper than the current per-frame call.

**Recommendation:** Just remove the per-frame calls. The 250ms interval is plenty.

---

### 2. No draft recovery for in-progress sessions

**Size:** M
**Severity:** Real — a clinician 40 minutes into a session who closes the tab accidentally loses all SUDs entries, notes, brainspot location, and processing duration with no recovery.

Brainspotting is the **only** clinical tool in the suite without sessionStorage-backed draft recovery (Life Map and Genogram both have it after their Path A passes). Session data (`sessionData` object: type, brainspot, processingTime, sudsLog, notes) lives entirely in-memory. Crash, tab close, browser update — all of it gone unless the clinician had reached the end-of-session checkin modal and clicked "Copy Summary to Clipboard."

The `beforeunload` handler only ends the sharing session and tracks analytics. It does NOT prompt the user to confirm closing.

**Fix shape:** Mirror the Life Map / Genogram pattern:
- Debounced (~2s) `sessionStorage` persist of `sessionData` + phase + brainspot coords whenever state changes.
- On boot, if a draft exists for an in-progress session, offer a Keep/Discard banner.
- `beforeunload` guard prompts "Leave the session?" if there's substantive unsaved content (any SUDs logged or any non-empty notes).
- Clear draft on explicit "End Session."

Slight wrinkle: brainspotting sessions are typically discrete, not multi-day. So recovery is mostly about within-session crash protection, not across-day persistence. The sessionStorage choice is correct for this — it's tab-scoped, which matches the clinical reality.

---

### 3. Click-outside backdrop dismisses the checkin modal silently

**Size:** S
**Severity:** Mild — modal can be re-opened (no data loss), but the user-experience break is real.

The checkin modal (Review/End flow) closes when the user clicks outside it. They might have intended to highlight something in the summary text and clicked outside the panel by accident. Modal vanishes, summary view lost, but session data is still in memory so they can re-open via End Session button.

This is the same pattern Life Map Path A item 1 fixed for the details modal. The checkin modal here is a heavier surface (summary + copy button + two action buttons) and worth giving the same treatment.

**Fix shape:** Remove the `setupModal` and `checkinModal` backdrop-close handlers (line 1729–1734). Setup modal already has a Cancel button. Checkin modal already has both action buttons. Backdrop-close was the wrong default for both.

The `settingsModal` backdrop-close (line 1726–1728) is fine to keep — that's the settings/help/share modal, lightweight content, no in-progress work.

---

### 4. XSS risk pattern (latent, not currently exploitable)

**Size:** S
**Severity:** Low today, structural risk for future features.

`modalContent.innerHTML = \`...\`` is used in `openModal`, `openSpeedModal`, `openColorModal`, `openHelpModal`, `showShareModal`. The viewer URL is interpolated into `showShareModal` (line 1441): `value="${viewerUrl}"`. The viewer URL is currently server-generated from a server-generated token, so not user-controllable — no current XSS vector.

But the pattern is the same one that bit Genogram — `innerHTML` template literals with values that might one day include user input. If a future feature (e.g. naming brainspots, custom session labels, client-name field) flows through any of these modals, the XSS becomes real.

**Fix shape:** Add the same `escapeHtml` helper Genogram now has and apply it whenever a non-literal string is interpolated. Lower urgency than Genogram's because no current input flows through, but worth the small defense-in-depth investment.

---

## Tier 2 — High-value UX fixes

### 5. Preferences don't persist across sessions

**Size:** S

Speed (Slow/Medium/Fast), color (White/Turquoise/Lavender/Yellow), audio on/off, and control mode (Scan/Manual) all reset to defaults on page reload. A therapist who consistently prefers Slow + Manual + Yellow has to set those every single session.

**Fix shape:** Store preferences in localStorage on change, restore on init. Key prefix `bet_bsp_*` (e.g. `bet_bsp_speed`, `bet_bsp_color`, `bet_bsp_audio`, `bet_bsp_mode`). Five lines of save + five lines of restore. Trivial.

This is technically a non-clinical preference (no PHI), so localStorage is fine.

---

### 6. No `prefers-reduced-motion` accommodation

**Size:** S

Brainspotting **specifically uses moving visual stimuli** — that's the entire mechanism. Most users want the motion; that's why they're here. But:
- Some clients have photosensitivity, vestibular issues, or post-concussion symptoms where pointer motion can trigger headaches or dizziness.
- Some clinicians using the tool with such clients would benefit from a "Reduced Motion" preference that slows scan speed dramatically (or extends transitions).

The OS-level `prefers-reduced-motion` media query is the right hook. Not as a hard override (the moving stimulus IS the tool), but as a stronger Slow speed and gentler transitions.

**Fix shape:** Detect `(prefers-reduced-motion: reduce)` on boot. If set, default `currentSpeedIndex` to `1` (Slow → 15s) and add a 4th speed option "Very Slow" (25s). Display a subtle hint near the speed control noting the OS preference was detected.

Recommendation: ship this. It's clinically relevant for a non-trivial portion of users.

---

### 7. Phase-text language is wordy mid-session

**Size:** S

During X-scan: `Therapist: watch for activation while the client follows horizontally. Click or SPACE to lock X.` That's a full sentence to parse during the work. Compare to "Lock X when ready · Click or SPACE."

**Fix shape:** Tighten the strings:
- X-scan: `Lock the X axis when you see activation. Click or SPACE.`
- Y-scan: `Lock the brainspot at the Y position. Click or SPACE.`
- Manual: `Click anywhere to lock the brainspot.`

Removing the `Therapist:` prefix is fine — this text only appears on the therapist's screen, not in the viewer.

---

### 8. Spacebar doesn't pause during holding

**Size:** S

Spacebar is used to lock X during X-scan and Y during Y-scan. During the holding phase, Space does nothing. Standard expectation in any pause-able tool is that Space toggles pause.

**Fix shape:** During `holding` phase, Spacebar toggles pause (calls `togglePause()`). During scan phases, behavior unchanged.

---

### 9. Session summary headline says "Processing Complete" before user has decided

**Size:** XS

The checkin modal opens via `Review / End` — at which point the user may still choose `Process Another Round`. Calling the modal "Processing Complete" is presumptuous and contradicts the available action.

**Fix shape:** Rename to "Session Review" (more accurate — they're reviewing, not concluding). Trivial copy change.

---

### 10. No way to undo an accidental brainspot lock

**Size:** S–M

Once X is locked, the only path back is to abandon and start a new round via the implicit reset. Once Y is locked (entering holding phase), same. A clinician who SPACEd a fraction too early has no graceful recovery.

**Fix shape:** Add an "Undo lock" affordance for ~5 seconds after each lock. Button could replace the timer area briefly, or be tucked into the existing controls. Esc could also serve as the undo trigger during this short window.

Defensible to defer; the existing "Another Round" already exists as a heavier reset.

---

### 11. Notes textarea has no save indication

**Size:** S

Notes auto-save to `sessionData.notes` on every keystroke. No visual cue that they're being captured. A clinician who's used to "click Save or lose your work" tools might keep wondering.

**Fix shape:** Small "auto-saving" or "saved" indicator below the textarea. Updates on input (debounced) to "saved" after ~1s of no typing.

---

## Tier 3 — Polish

### 12. Setup modal doesn't remember last session type

Three options each time. Could default to the last-selected option (in localStorage alongside other preferences from item 5).

### 13. No keyboard shortcut for Start Session

You can scan/lock with the keyboard but you can't START with it. Pressing SPACE or ENTER on the page should be able to trigger Start Session when no modal is open.

### 14. No "viewer connected" indicator

When the therapist creates a sharing session and the client opens the viewer link, the therapist has no visual confirmation that anyone is actually watching. The share button just pulses red. Adding a "1 viewer connected" indicator (when get_session.php has been hit recently) would close the loop. Requires a small backend change to track last_poll_at.

### 15. Audio frequency fixed at 440Hz

Standard A4 sine tone. Some clients prefer lower frequencies (more grounding). A future tweak.

### 16. Body lacks CSS variable system

Hard-coded dark gray. Other tools use `--tt-*` or `--col-*` variables. Inconsistent. Defer — Brainspotting is intentionally dark, no light-mode use case here.

### 17. Brainspot lock in manual mode uses click position; in scan mode uses pointer center

Tiny inconsistency in how `lockedX` is computed between the two modes (line 879 vs 919). Within a few pixels. Defer.

---

## Tier 4 — Features (defer)

- **Life Map integration.** A "Use this in Brainspotting" button on Life Map resource/trauma nodes that would pre-populate the session type and any contextual notes. Same shape as the EMDR target context bridge.
- **Export session as file** (markdown / PDF / plain-text) in addition to clipboard copy.
- **SUDs trend mini-chart** in the session summary (small inline sparkline of SUDs over time).
- **Multi-session history** with explicit opt-in to localStorage retention. Privacy posture conversation parallel to Genogram's.
- **Rolling brainspotting automation** — actually progress through multiple rounds automatically rather than just labeling the session.
- **Customizable audio frequency** (alternative tones, binaural beats option).

---

## Tier 5 — Architecture (defer)

- 1,931-line monolith. Same shape as Life Map / Genogram. Refactor only when something needs to share code with Brainspotting.
- No retry/backoff on API calls. Sufficient for current usage; the next session_update succeeds anyway.

---

## What to do next

Three reasonable paths:

**Path A — Production-cost fix + matched UX baseline.** Items **1, 2, 3, 5, 6, 7, 8, 9**. Ships the critical performance fix, brings Brainspotting up to Life Map / Genogram's data-safety standard, adds preference persistence, fills the `prefers-reduced-motion` gap, polishes the mid-session language. ~half a day of Composer work plus your verification.

**Path B — Just the bug.** Item 1 only. Tightest possible scope. Defensible if you want to ship a hotfix before everything else.

**Path C — Cherry-pick.** Tell me which items.

**My recommendation: Path A.** Item 1 alone justifies a ship today. Items 2, 3, 5, 6 bring Brainspotting to parity with the data-safety floor we established for the other tools. Items 7, 8, 9 are sentence-level polish that costs nothing.

The XSS defense (Item 4) I'd defer to a future round — no current vector, and adding `escapeHtml` to a tool that doesn't have a current XSS risk reads as bookkeeping rather than urgency. Worth doing eventually as a consistency thing across tools, but not in this Path A bundle.

Once you pick, I'll write the Composer-ready spec.

---

*End of audit.*
