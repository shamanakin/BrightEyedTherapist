# Genogram Genie — Improvement Audit

**Date:** May 27, 2026
**Source:** `tool_genogram.html` (2,289 lines)
**Author:** Claude (Cowork session with Matthew)
**Purpose:** Prioritized, opinionated assessment with rationale and scope estimates. Companion to the Life Map audit. Once you flag targets, follow-up artifacts will be Composer-ready build specs.

---

## Top-line take

Genogram is in **better shape architecturally** than Life Map was before Path A. It already has features Life Map didn't have: localStorage autosave, PNG export, keyboard Delete shortcut, Spacebar pan mode, center-view auto-fit, custom confirmation modals, toast notifications, `crypto.randomUUID()` for IDs, ES module script tag. The code shows discipline (DEBUG flag, normalized helpers, modal-based confirmations).

But it has **two real bugs** I'd want fixed today regardless of anything else: an XSS vulnerability in tooltip and relationship-list rendering, and a broken quadrant renderer for the "other / nonbinary" gender shape. These aren't aesthetic — they're correctness.

It also has **one important question I can't answer for you** that should shape the privacy direction: this tool stores PHI in `localStorage` indefinitely, whereas Life Map (after Path A) deliberately uses tab-scoped `sessionStorage` because clinical content shouldn't outlive the tab. The two tools now have inconsistent privacy postures. That's a deliberate design call you should make, not a default I should patch. I've made it Item 3 below.

If this were mine and I had a single afternoon, I'd ship the items in Tier 1 (real bugs and the privacy decision) plus the cheap UX wins in Tier 2.

---

## Tier 1 — Bugs and the privacy posture question

### 1. XSS via tooltip and existing-relationships list rendering

**Size:** S
**Severity:** Real — would let a malicious JSON import execute arbitrary JS in the user's browser.

In `showTooltip` (around line 1722):

```js
if (person.notes) {
    const noteHtml = person.notes.replace(/\n/g, '<br>');
    infoItems.push(`<li class="mt-2 pt-2 border-t border-gray-600"><span class="font-semibold">Notes:</span><br>${noteHtml}</li>`);
}
tooltipInfo.innerHTML = infoItems.join('');
```

The `person.notes` string is interpolated into an `innerHTML` assignment without escaping. If a clinician types `<script>...</script>` into notes — or more realistically, opens a Genogram JSON exported by someone else (or built up over time and tampered with) — script tags or event handlers in notes/names would execute.

The same pattern appears in `populateExistingLinksList` (around line 1780):

```js
let text = `<strong>${p1.name} & ${p2.name}</strong>: ${link.quality}`;
// ...
div.innerHTML = `<span class="text-sm text-gray-800 dark:text-gray-100">${text}</span>`;
```

Person names get rendered into innerHTML without escaping.

**Risk model:** Low likelihood of self-attack (your own users typing `<script>` into a name), but the Import JSON flow is a real attack vector. A malicious genogram JSON could embed scripts that exfiltrate other localStorage data, log keystrokes, or call your APIs as the logged-in user.

**Fix shape:**
- Add a small `escapeHtml(str)` helper.
- Replace the tooltip note-rendering with text content + DOM construction for the line break (or use `textContent` plus CSS `white-space: pre-wrap;` and skip the `<br>` rewrite).
- Replace the relationships-list interpolation with `textContent` for names and a fixed `<strong>` wrapper built with DOM nodes.

Life Map's tooltip enrichment specifically used `textContent` (not innerHTML) for exactly this reason. Genogram should match.

---

### 2. "Other / nonbinary" gender quadrants are broken

**Size:** S
**Severity:** Visible rendering bug for any person whose gender is set to "other".

In `createQuadrant` (around line 964):

```js
case 'other':
    if (quadrant === 'tl') d = `M 0 0 L 0 -s L -s 0 Z`;
    if (quadrant === 'tr') d = `M 0 0 L 0 -s L s 0 Z`;
    if (quadrant === 'bl') d = `M 0 0 L -s 0 L 0 s Z`;
    if (quadrant === 'br') d = `M 0 0 L s 0 L 0 s Z`;
    break;
```

These are template literals (backticks), but `s` is **not interpolated** — it's just a literal letter `s` in the SVG path string. The intended `${-s}` and `${s}` substitutions are missing. The SVG path parser sees `M 0 0 L 0 -s L -s 0 Z`, fails to parse the non-numeric tokens, and silently renders nothing (or an empty/malformed shape).

Result: clinical indicators on nonbinary/other-gender people don't display. The four issue checkboxes save to state but visually do nothing on the canvas.

The `male` block in the same function uses pre-built variables (`squareTL`, `squareTR`, etc.) and works correctly. The `female` block uses `${-s}` / `${s}` interpolation and works. The `other` block is the only one broken — it has neither the variables nor the interpolation.

**Fix shape:** Add `${...}` interpolation to all four path strings in the `other` case. Pattern: `M 0 0 L 0 ${-s} L ${-s} 0 Z`. Verify visually that the four diamond-quadrant triangles render correctly.

This bug almost certainly went unnoticed because the trial-runs probably didn't include a nonbinary person with clinical indicators. Real users with diverse client populations would have found it eventually.

---

### 3. PHI is in localStorage — privacy posture conflict with Life Map

**Size:** Depends on the call you make. S if "leave it as-is + document," M if "match Life Map's sessionStorage posture."
**Severity:** Not a bug. A design question that has consequences.

Today: `saveToLocalStorage()` writes the entire `db` (people, relationships, emotional links — including names, birth years, deceased status, clinical indicators, notes) to a `localStorage` key called `genogramGenieSaveData`. This persists indefinitely on the device, survives tab close, browser restart, OS reboot. The sidebar disclaimer says "Autosaves on this device while you work" — accurate but optimistic about what "while you work" means in practice.

Compare Life Map after Path A: uses `sessionStorage` with explicit "Export JSON to keep" copy. Tab-scoped. Doesn't outlive the tab. Recovery is offered on reload with explicit Keep/Discard.

These are now **opposite** stances on the same question. The privacy implications:

- **localStorage upside:** Clinician opens their browser the next morning, work is still there. Great UX. Especially for genograms that accumulate over multiple sessions with the same client.
- **localStorage downside:** Shared computers (a clinic's spare laptop, a supervision room machine, a colleague's screen-share) carry residual PHI from prior sessions. The next user opens Genogram → previous client's family tree appears. No explicit clear-on-logout. No timeout. The disclaimer text doesn't fully cover this.

Three reasonable paths:

(a) **Leave it.** You're aware of the trade-off, the disclaimer is there, you trust your users to use it on their own devices. No work; document the rationale.

(b) **Match Life Map.** Switch to sessionStorage + draft recovery banner. Lose between-session persistence. Match the privacy posture across tools. Medium-size change.

(c) **Add explicit "Save Locally / Clear Local" controls** + an idle timeout that clears storage after N minutes of inactivity. Best-of-both, but more UI surface area and more for the user to think about.

I have a mild lean toward (b) for consistency, but (a) is defensible and (c) is the most clinically nuanced. Your call.

This item needs your decision before I write a spec for it.

---

### 4. Zoom-to-cursor math looks bugged

**Size:** S
**Severity:** Mild — zoom works but doesn't behave like standard zoom-to-cursor.

In `onCanvasWheel` (around line 1308):

```js
view.zoom *= zoomFactor;
view.panX = view.panX * zoomFactor + (pt.x * (1 - zoomFactor) * view.zoom);
view.panY = view.panY * zoomFactor + (pt.y * (1 - zoomFactor) * view.zoom);
```

`view.zoom` is mutated before the pan calculation, and then `view.zoom` (new value) appears multiplied into the offset term. Standard zoom-to-cursor logic is: `panX = pt.x - (pt.x - panX) * factor` where the factor is the **change** in zoom level. This doesn't match either pattern.

The `zoom()` function used by the sidebar buttons (line 1332) has the same shape. Likely the same bug.

**Visible symptom to test:** Place the cursor over a person near the canvas edge, scroll-zoom. The cursor should stay roughly anchored to that person. If the view drifts unexpectedly, this formula is the culprit.

**Fix shape:** Replace with standard zoom-to-cursor math:

```js
function onCanvasWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.05;
    const zoomFactor = e.deltaY < 0 ? (1 + zoomSpeed) : (1 - zoomSpeed);
    const newZoom = Math.max(0.1, Math.min(5, view.zoom * zoomFactor));
    const actualFactor = newZoom / view.zoom;
    // Anchor the SVG point under the cursor:
    view.panX = e.clientX - (e.clientX - view.panX) * actualFactor;
    view.panY = e.clientY - (e.clientY - view.panY) * actualFactor;
    view.zoom = newZoom;
    render();
}
```

This also gates zoom between 0.1× and 5× (audit item 9 below — bundles together).

I'm **less than 100% sure** the existing math is producing visibly-wrong behavior, because the math is just unusual enough that it might compute correctly in some narrow interpretation. Worth a manual test before assuming "broken."

---

### 5. `onImportFile` uses native `confirm()` instead of the app's modal

**Size:** S
**Severity:** Inconsistency, not a bug.

```js
if (db.people.length > 0) {
    const confirmed = confirm('Importing will replace your current genogram. This cannot be undone. Continue?');
    if (!confirmed) { e.target.value = null; return; }
}
```

The rest of the app uses `showConfirmModal()` for destructive confirmations (delete person, reset genogram). The import flow drops out to the browser's native confirm dialog, which looks out-of-place and can't be styled.

**Fix shape:** Replace with `showConfirmModal('import-genogram', ...)`, adding a new branch in `handleConfirmFormSubmit` that proceeds with the import. Requires holding the pending file in a closure or app-state variable across the modal interaction.

Easy fix, removes a visual inconsistency.

---

## Tier 2 — High-value UX fixes

### 6. Wheel-zoom hijacks page scroll

**Size:** S

Same friction as Life Map had pre-polish. Any wheel event over the canvas zooms. Trackpad users especially feel it. Fix matches the Life Map polish-spec pattern: require Cmd/Ctrl modifier to zoom, otherwise let the browser do its native thing.

```js
function onCanvasWheel(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    // ... (rest of zoom logic, ideally the fixed math from item 4)
}
```

Bundles naturally with Item 4 — same function, same edit.

---

### 7. Wheel-zoom step at 10% per tick is aggressive

**Size:** S

`const zoomSpeed = 0.1` → reduce to `0.05`. Bundles with Items 4 and 6.

---

### 8. No Esc to close modals

**Size:** S

Three modals exist (`person-modal`, `relationship-modal`, `structural-relationship-modal`, `confirm-modal`). None close on Esc. Add a single keydown listener that checks which modal is visible and calls its hide function.

Note: this tool already has a `keydown` listener for Space + Delete. The Esc handling can extend that listener.

---

### 9. Zoom is unbounded

**Size:** S

Bundles with Item 4 (`view.zoom = Math.max(0.1, Math.min(5, view.zoom * factor))`). Prevents the user from zooming to invisible-tiny or zooming so far in that one shape fills the screen and they can't recover.

---

### 10. No undo for delete

**Size:** S–M

Same as Life Map's deferred item. The `showConfirmModal` is the only safeguard, and confirmation fatigue is real. A soft-delete pattern (toast with Undo, 5-second timeout) is a known fix.

Deletes also cascade — removing a person also removes their structural relationships and emotional links. The undo would need to restore all three lists from a snapshot. Slightly heavier than the Life Map version.

---

### 11. Reset / New button doesn't suggest export first

**Size:** S

The "Reset / New" button in the sidebar opens a confirm modal that warns "this cannot be undone" but doesn't offer to export-then-reset. Clinicians who forget to export before clicking Reset lose their work permanently.

**Fix shape:** Confirmation modal grows a third button: "Export & Reset" that calls `exportJSON()` then `reset-genogram` action. Existing Cancel and Confirm remain.

---

### 12. `getRelationship()` collapses everything beyond immediate family to "Relative"

**Size:** M

The hover tooltip's "relationship to client" label only handles: self, partner, child, parent, sibling. Everyone else is "Relative." Grandparents, aunts/uncles, in-laws, cousins, step-relationships — all read the same.

Worth doing because genograms are specifically about extended family. Telling a clinician "this person is a Relative" of the client is useless information.

**Fix shape:** Recursive relationship classifier that walks the parent/child graph from the client. Could output strings like "Grandparent (paternal)", "Aunt/Uncle", "Cousin", "Sibling-in-law", etc. Bigger lift than Tier-1 items but tractable.

---

### 13. Notes textarea is 3 rows

**Size:** S

`<textarea id="notes" rows="3" ...>` — too small for substantive clinical notes. Bump to 5 or 6 rows. Trivial.

---

### 14. Only one genogram saved at a time

**Size:** M

`localStorage[genogramGenieSaveData]` holds a single `db` object. A clinician with two clients in active treatment must Export JSON for client A, Import JSON for client B, switch back later, etc. The autosave isn't multi-genogram-aware.

**Fix shape:** Named saved-genograms keyed by client identifier. Sidebar grows a "Saved genograms" list with Load / Rename / Delete. Adds local-storage retention controls (per Item 3's privacy conversation).

This is a real feature, not polish. Worth its own batch if you decide to do it. Defer.

---

## Tier 3 — Polish

### 15. Name field allows silent duplicates

Two "Mom" entries are possible with no warning. Cheap inline hint when an exact-name match exists: "Another person has this name — continue?" Could be just a soft warning, not a block.

### 16. Help tooltip lists Spacebar but not Delete/Backspace

The help tooltip documents the spacebar-pan and click-to-select shortcuts but omits the Delete/Backspace shortcut that the code supports. Add a line.

### 17. Default theme inconsistent across tools

Life Map defaults to dark, Genogram defaults to OS preference. Pick one model and apply across tools for consistency.

### 18. Export filename has no client identifier

Life Map exports as `LifeMap_{client}_{date}.json`. Genogram exports as `genogram_{date}.json`. The client's identifier exists on one person (`isClient: true`) — could pull their name (or initials) into the filename. Matches the cross-tool pattern.

### 19. `view.isSpacePressed` can desync with modal state

If the user holds Space, opens a modal via a click, releases Space outside the canvas — `isSpacePressed` stays true. Edge case, low impact. Could be reset whenever any modal opens.

### 20. Zoom buttons don't show current zoom level

`Zoom In / Zoom Out / Center` are blind controls. A small `100%` / `145%` indicator near the buttons would help users know if they're at default zoom.

---

## Tier 4 — Bigger features (defer)

These are features, not polish. Each is its own potential batch.

### 21. Twin relationship support

Genograms standardly indicate twins with a V-line from parents to both children. Currently no way to represent.

### 22. Adopted / foster / step relationships

Standard genogram conventions exist (dashed lines, brackets). Currently not supported. Code explicitly blocks step-parents (line 1635).

### 23. Touch / pinch-zoom for mobile

Mouse-only event handlers. Touch panning doesn't work. Pinch-zoom not implemented. Mobile-secondary per your earlier framing — defer.

### 24. Performance: incremental render

Every drag-move calls `render()` which `innerHTML = ''` and full rebuilds. Fine for ≤30 people, lags noticeably at 80+. Defer until it's actually a problem.

---

## Tier 5 — Architecture (defer)

### 25. Single-file 2,289-line monolith

Same shape as Life Map. Same defer logic. Revisit only when there's a second feature that needs to share code with Genogram.

---

## What to do next

Three reasonable paths from here:

**Path A — Bugs + cheap UX wins.** Ship items **1, 2, 4, 5, 6, 7, 8, 9, 11, 13, 16, 18** as a single Composer task. Fixes the XSS, fixes the broken-quadrant rendering, fixes the zoom math + adds bounds + adds modifier-to-zoom + reduces step, adds Esc-close, replaces the native confirm() in import, makes Reset offer Export-and-Reset, enlarges notes, fills out help tooltip, adds client to filename. Doesn't decide the localStorage question (Item 3). ~half a day of Composer work + your review.

**Path B — Bugs only.** Just items 1, 2, 4, 5. Tight scope if you want to ship correctness before touching UX.

**Path C — Privacy decision first.** Sit with Item 3 (the localStorage vs sessionStorage question) before shipping anything. Once you've decided how Genogram should handle persistence, the rest of the audit slots cleanly behind that call.

**Path D — Cherry-pick.** Tell me which items, any order.

I have a slight lean toward Path A, because items 1 and 2 are real bugs that deserve to ship today regardless, the rest of the bundle is small and non-overlapping with the privacy question, and Item 3 can be a deliberate separate decision once you've thought through your shared-computer / clinician-device model. But Path B is defensible if you want to keep this round tight.

---

*End of audit.*
