# Life Map — Improvement Audit

**Date:** May 27, 2026
**Source:** `tool_timeline.html` (1,689 lines, schema v2)
**Author:** Claude (Cowork session with Matthew)
**Purpose:** Prioritized, opinionated assessment of what's worth fixing in Life Map, with rationale and scope estimates. Once you flag targets, follow-up artifacts will be Composer-ready build specs.

---

## Top-line take

The tool is more sophisticated than it presents. The clinical model (touchstones → targets → SUDS-prioritized queue → session logs → target card export) is genuinely useful and not what the README implies. The pain points are concentrated in **three areas**: data durability, the EMDR-target form (NC/PC custom field handling has an actual data-loss bug), and the integration with the BLS tools (which currently doesn't exist beyond opening a new tab).

If this were mine and I had a single afternoon, I'd ship Tier-1 items 1, 2, and 3 below. Together they remove the ways the tool currently silently loses clinician work.

---

## Tier 1 — Data-loss and clinical-safety bugs

These are not stylistic preferences. They cause work to disappear.

### 1. Click-outside-modal discards changes silently
**Size:** S

The details modal closes on backdrop click with no save and no confirmation:

```js
detailsOverlay.addEventListener('click', (e) => {
    if (e.target === detailsOverlay) closeDetails();
});
```

A therapist can spend 5 minutes filling out a target's NC/PC/SUDS/VoC/body location/notes, accidentally click outside the panel, and lose all of it. There's no draft, no warning, no autosave. The `closeDetails()` path doesn't even check whether the form is dirty.

**Fix shape:** Either (a) remove backdrop-close entirely and require an explicit Close/Cancel button, or (b) prompt "Discard changes?" if the form has been edited. (a) is simpler and safer. Backdrop-close on a heavyweight clinical form is the wrong pattern.

---

### 2. NC / PC custom-field logic has a data-loss bug
**Size:** S

In `saveDetails()`:

```js
const nc = document.getElementById('emdr-nc-custom').value
        || document.getElementById('emdr-nc').value;
```

In `openDetails()`:

```js
document.getElementById('emdr-nc').value = data.emdrTarget.negCognition || '';
document.getElementById('emdr-nc-custom').value = '';
```

The bug chain:
- Save: custom value wins over dropdown if both are present (fine).
- Re-open a target whose saved NC was a **custom string** (e.g. "I am defective in a way no one can see"): the dropdown gets set to that exact string, but the dropdown has no matching `<option>`, so it silently falls back to empty. The custom box is also blanked. **The saved NC is now invisible in the UI.**
- If the clinician then makes any edit and hits Save, NC is wiped because both fields are empty.

Same bug applies to PC.

**Fix shape:** On open, detect whether the stored value matches any dropdown option. If yes, set the dropdown. If no, set the custom field and leave the dropdown on the placeholder. On save, prefer whichever the clinician most recently interacted with, or merge sensibly (a single combined input with autocomplete-from-suggestions would be cleaner than the current dropdown-plus-custom-textbox split).

---

### 3. No draft recovery — full timeline can vanish on tab close / crash
**Size:** M

The current model: in-memory `state`, JSON export to keep. `beforeunload` warns if dirty. Theme preference persists; map data does not. This is the privacy-first stance (and the right default for a clinical tool that may carry PHI), but the implementation has no recovery floor — a crashed tab is total loss.

The Guided EMDR tool already solved this elegantly with `sessionStorage` (tab-scoped, debounced ~2s, cleared on explicit "new session", restored on reload). Life Map should use the same pattern.

**Fix shape:**
- Debounced (~2s) `sessionStorage` persist of `state` whenever it changes.
- On boot, if a draft exists, show a non-modal banner: "Recovered unsaved Life Map from this tab. [Keep] [Discard]"
- Clear on explicit "Import" or after successful "Export JSON."
- **Critical guardrail for Composer:** must use `sessionStorage`, not `localStorage`. Tab-scoped means PHI doesn't outlive the tab. This matches the existing Guided EMDR pattern and the privacy stance.

---

## Tier 2 — High-value UX fixes

These don't lose data, but they create friction every session.

### 4. Add-Event always defaults to current year
**Size:** S

```js
const currentYear = new Date().getFullYear();
// ...
date: currentYearStr,
startDate: currentYearStr,
endDate: currentYearStr,
```

The vast majority of trauma timeline events are historical — typically 5–40 years ago. Defaulting to current year means every single event requires the clinician to immediately clear and retype the year. The modal opens with focus on Title, so the year field isn't even adjacent in the tab flow.

**Fix shape:** Default to the **middle of the visible timeline range** (`Math.round((state.startYear + state.endYear) / 2)`). Or default to the year of the most recently added node. Or — best — open the year field already selected so a single keystroke replaces it.

---

### 5. Launching EMDR carries no target context
**Size:** M

```js
function openEMDRTool() {
    window.open('tool_emdr.html', '_blank');
}
```

Click "EMDR" on a target card → new tab opens BLS suite with zero awareness of which target you're working on. The therapist has to mentally hold the NC / image / SUDS across tabs. After the set, they manually fill in the log-session modal. The integration is a button, not a data flow.

**Fix shape (smaller):** Pass target context via URL params and display a non-intrusive header strip in the BLS tool: "Processing: [Target Title] · NC: [...] · Initial SUDS: 8."

**Fix shape (bigger):** Route to `tool_emdr_guided.html` with the target pre-loaded as a session, so post-set, set count and notes flow back. This means coordinating with the guided EMDR storage layer (`guided-storage.js`). Defer unless you want it.

**Recommendation:** Start with the smaller version. It removes 80% of the cognitive load. The bigger version is a separate epic.

---

### 6. Custom NC / PC field UX is split when it doesn't need to be
**Size:** S

Currently: a dropdown of preset NCs, AND a custom-text input below it. Two inputs for one value. Adds confusion, enables bug #2 above.

**Fix shape:** Single combobox — type to filter presets, free-text fallback. Or a single textarea with a "Pick from presets ▾" disclosure button. Either consolidation kills the bug class and simplifies the visual.

---

### 7. "Touchstone" and "Target" checkbox labels carry no context
**Size:** S

EMDR practitioners know these terms. The labels alone read as jargon-without-explanation. A therapist scanning quickly during a session shouldn't have to remember which is which.

**Fix shape:** Add tooltips or 1-line helper text:
- "Touchstone Memory" → "Earliest related event in this thread"
- "Processing Target" → "Plan to process this in EMDR"

Small UX, cheap, removes a moment of friction.

---

### 8. Filter view "Targets" hides their touchstones
**Size:** S

When you filter to Targets, related touchstone memories (which are *not* themselves targets) get hidden. Clinically this is wrong — touchstones are part of the target's processing context.

**Fix shape:** When filter = 'targets', also show any node where `isTouchstone === true`. Or add a separate "Targets + Touchstones" combined view.

---

### 9. No undo for delete
**Size:** S

`deleteNode()` uses a `confirm()` dialog and gone. No undo. Browser confirm dialogs are also disruptive — you can't see the canvas while you decide.

**Fix shape:** Soft-delete pattern — node hides immediately, toast shows "Deleted '[title]'. [Undo]" with 5-second timeout. Restore on click. Hard-delete after timeout. Standard Gmail/Slack pattern, no library needed.

---

## Tier 3 — Polish and quality-of-life

### 10. No keyboard shortcuts
**Size:** S–M

- `Esc` to close any open modal (currently only backdrop-click closes)
- `Cmd/Ctrl + S` to trigger Export JSON
- `/` to focus a node-search input (which doesn't exist yet — see #11)
- `+` to open Add Event

Cheap and clinical-tool-appropriate. Therapists who use it often will internalize them.

---

### 11. No way to search or jump to a node
**Size:** S

With 30+ events the only way to find one is visually. A simple find-as-you-type input in the sidebar that filters and centers a matching node would help. Bonus: matches highlight on the canvas.

---

### 12. Year-only granularity
**Size:** M

Some events are sharp ("the assault, March 2019") and some are eras ("dad's drinking, ~1995–2002"). Right now everything is year-resolution. For recent and acute events this loses information.

**Fix shape:** Optional month input alongside year. If month set, display "Mar 2019" in tooltips and target cards. Storage: a single `dateString` field is fine; UI splits year/month inputs. Migration: existing nodes keep year-only.

This is a bigger lift because it touches data model, render layer, tooltip, target card, print card, and session log dates. Possibly too much to bundle into this round.

---

### 13. Print card path goes through browser print dialog
**Size:** S

```js
window.print();
```

Works, but lands the user in their OS print dialog with no built-in "save as PDF" labeling. Not bad, just dated. A second action — "Download PDF" — that uses `html2pdf.js` or similar would feel more modern and explicit. Defer unless aesthetic matters.

---

### 14. Default dark mode is unusual for clinical sessions
**Size:** S

```html
<body class="tt-dark">
```

Most clinical sessions happen in normally-lit offices where dark-mode contrast is harder to read at a glance during a paced moment. Therapists who prefer dark mode will toggle it. Defaulting to light would also match the rest of the BET tools' light surface.

**Fix shape:** Default to light. Theme toggle still works. Saved preference still respected. Worth checking what your own preference is in actual use — if you've been using it dark in sessions and it works, ignore this one.

---

### 15. Analytics tag mismatch
**Size:** S

```js
Auth.trackAppUsage('timeline', 'start');
```

App name is tracked as 'timeline' but the user-facing name is 'Life Map' (and the feedback URL uses `app=lifemap`). Inconsistency will fragment your admin analytics across two strings. Pick one, change the other to match.

---

## Tier 4 — Architecture (defer)

### 16. Single-file monolith
1,690 lines of HTML + CSS + JS in one file. The Guided EMDR pattern (split into `bls-core.js`, `bls-host.js`, `bls-sync.js`, `guided-engine.js`, `guided-panel.js`, etc.) is the right model, but refactoring Life Map into modules is a multi-session undertaking and risks breaking working clinical logic without strong test coverage (which doesn't exist).

**Defer.** Revisit when there's a second feature that needs to share code with Life Map (e.g. embedding a mini-timeline into the guided EMDR panel).

### 17. Inline `onclick` handlers
Stylistic. Works. Defer.

### 18. Empty-state monkey-patching at boot
The pattern of `_origRenderAllNodes = renderAllNodes; renderAllNodes = ...wrapped` is fragile but isolated. Defer.

---

## What to do next

Three reasonable paths from here:

**Path A — Highest-leverage afternoon:** Ship items **1, 2, 3, 4, 7, 8, 15** as a single Composer task. These are all small, low-risk, high-clinical-value, and don't conflict. Combined they fix the data-loss bug, prevent silent change-discard, add draft recovery, smooth the Add-Event flow, clarify two confusing labels, fix one wrong filter behavior, and reconcile analytics naming. ~half a day of Composer work, plus your review.

**Path B — Maximum clinical impact:** Ship Tier 1 (1, 2, 3) plus **5 (small version)**. Adds the EMDR target context bridge. This requires touching `tool_emdr.html` as well as `tool_timeline.html`, so Composer's blast radius is larger and the spec needs to be tighter.

**Path C — Cherry-pick:** Tell me which specific items, in any order.

Once you pick, I'll produce a Composer-ready build spec per item or per batch. Specs will include: exact files to touch, exact files NOT to touch, function-level scope, acceptance criteria, regression risks to test, and explicit guardrails ("do not rename existing functions; do not refactor adjacent code; do not change schema version unless explicitly listed").

---

*End of audit.*
