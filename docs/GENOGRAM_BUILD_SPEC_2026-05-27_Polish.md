# Genogram Genie — Polish & QoL Build Spec

**Target file:** `tool_genogram.html`
**Scope:** UX polish — parallel to the Life Map polish pass. Six items, all small.
**Date:** May 27, 2026

This spec is the source of truth. Execute items in the order given. Acceptance criteria are code-level so no manual browser testing is required to confirm each item; the post-execution walkthrough at the end lists what *would* benefit from eventual visual confirmation (low urgency).

---

## Global guardrails

1. Only `tool_genogram.html` is modified.
2. Do not rename existing functions, variables, or DOM ids — except where this spec explicitly says to.
3. Do not refactor adjacent code.
4. No new external dependencies.
5. Preserve existing color palette and CSS variables.
6. New CSS goes inside the existing `<style>` block in `<head>`.
7. Light-mode and dark-mode parity for any new visible element.
8. No `console.log` left in shipped code.
9. No changes to the `db` data model.

---

## Pre-flight check

Confirm:
- `tool_genogram.html` exists at the repo root.
- Current line count in the ~2,825 range.
- The file contains `render`, `handleFormSubmit`, `handleContextMenuClick`, `zoom`, `centerView`, `onCanvasWheel`, `manageRelationshipsBtn`, `showModal`, `showRelationshipModal`, and `showToast`.

---

## Item 1 — Cursor change on person hover (`grab` instead of `pointer`)

**Goal:** Signal that people are draggable. The current `cursor: pointer` suggests "click only" — `cursor: grab` is the universal "you can drag this" affordance.

**Where:** Inside the existing `<style>` block, find:

```css
.person-node { cursor: pointer; transition: transform 0.1s; }
```

Replace with:

```css
.person-node { cursor: grab; transition: transform 0.1s; }
.person-node:active { cursor: grabbing; }
```

**Do not touch:**
- The `#genogram-canvas` cursor rules (already `cursor: grab` / `grabbing`).
- Any other `.person-node` rule.

**Acceptance criteria (code-level):**
1. The `.person-node` rule has `cursor: grab`.
2. A new `.person-node:active { cursor: grabbing; }` rule exists.

---

## Item 2 — Auto-scroll to new person after add

**Goal:** When a new person is added (via Add Person, Add Partner/Parent/Child, or the empty-state CTA from Item 6), if the new person's position is outside the visible canvas, gently re-center the view so the new person is comfortably visible. If they're already on-screen, do nothing.

**Where:** Inside the `<script type="module">` block, add a new helper next to the other geometry helpers (after `lineMidpoint` / `perpendicularOffset`, around line 1017):

```js
/**
 * If a person at SVG coords (x, y) is outside the visible canvas area, pan the view
 * to center on them. If they're already visible, do nothing. Used after adding a new
 * person so the user can see what they just created without being yanked around.
 */
function scrollToPersonIfOffscreen(person) {
    if (!person || !canvas) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;
    // SVG point -> screen point after current pan/zoom
    const screenX = person.x * view.zoom + view.panX;
    const screenY = person.y * view.zoom + view.panY;
    const margin = 80;
    const offscreen = screenX < margin || screenX > cw - margin || screenY < margin || screenY > ch - margin;
    if (!offscreen) return;
    view.panX = cw / 2 - person.x * view.zoom;
    view.panY = ch / 2 - person.y * view.zoom;
    render();
}
```

Then call this helper at the end of `handleFormSubmit`. Find the existing tail (around line 1638):

```js
hideModal();
saveToLocalStorage();
render();
}
```

Replace with:

```js
hideModal();
saveToLocalStorage();
render();
if (person) scrollToPersonIfOffscreen(person);
}
```

**Do not touch:**
- The earlier branches in `handleFormSubmit` that compute `person`.
- The `centerView` function (this is separate behavior).
- Any other person creation path.

**Acceptance criteria (code-level):**
1. `scrollToPersonIfOffscreen` is defined.
2. `handleFormSubmit` calls it at the end with the just-added/edited person.

---

## Item 3 — Sidebar "Manage Relationships" pre-fills selected person

**Goal:** Currently the sidebar's Manage Relationships button opens the modal with both Person A and Person B blank. If a person is selected on the canvas, that person should pre-fill Person A. (The right-click → Manage Relationships path already does this; only the sidebar button skips it.)

**Where:** Inside `init`, find the existing listener (around line 2128):

```js
manageRelationshipsBtn.addEventListener('click', () => showRelationshipModal());
```

Replace with:

```js
manageRelationshipsBtn.addEventListener('click', () => showRelationshipModal(appState.selectedPersonId || null));
```

**Do not touch:**
- `showRelationshipModal` itself — its existing `personAId = null` default handles the no-selection case correctly.
- The right-click context menu's `manage-relationships` handler.

**Acceptance criteria (code-level):**
1. The sidebar button listener passes `appState.selectedPersonId` (with `|| null` fallback) to `showRelationshipModal`.

---

## Item 4 — Zoom percentage display

**Goal:** A small "100%" / "145%" indicator near the zoom buttons in the sidebar. Updates on every zoom change (sidebar buttons, wheel-zoom, centerView).

**What changes:**

(a) Add the indicator to the sidebar HTML. Find the `grid grid-cols-3 gap-3 mb-6` block (around line 256) — this is the row containing Zoom In / Zoom Out / Center buttons. Right AFTER its closing `</div>`, add:

```html
<div id="zoom-percentage" class="text-xs text-gray-500 dark:text-gray-400 text-center -mt-4 mb-4" aria-live="polite">100%</div>
```

The `-mt-4` is intentional: pulls the readout closer to the buttons since the parent block had `mb-6`.

(b) Add an update function inside the `<script type="module">` block. Place it near the other rendering helpers, just after `scrollToPersonIfOffscreen` from Item 2:

```js
/**
 * Refresh the sidebar zoom percentage readout. Safe to call multiple times.
 */
function updateZoomDisplay() {
    const el = document.getElementById('zoom-percentage');
    if (!el) return;
    el.textContent = `${Math.round(view.zoom * 100)}%`;
}
```

(c) Call `updateZoomDisplay()` from each path that mutates `view.zoom`. Specifically:

- At the end of `zoom(factor)` (the sidebar-button zoom function, around line 1475): add `updateZoomDisplay();` as the last line before the closing brace, right after the existing `render();`.
- At the end of `centerView()` (around line 1487): add `updateZoomDisplay();` as the last line before the closing brace, right after the existing `render();` calls.
- At the end of `onCanvasWheel(e)` (around line 1448): add `updateZoomDisplay();` as the last line before the closing brace, right after the existing `render();`.
- Inside `init()`, near the very end (right before `centerView(); render();` at line 2501), the call order should be unchanged — but ensure `updateZoomDisplay()` happens after centerView's render. Since centerView calls updateZoomDisplay now (from the change above), no explicit init call is needed.

**Do not touch:**
- The Zoom In / Zoom Out / Center button HTML or their click handlers.
- The `view.zoom` initial value.

**Acceptance criteria (code-level):**
1. `<div id="zoom-percentage">` exists in the sidebar after the zoom button row.
2. `updateZoomDisplay` is defined.
3. `updateZoomDisplay()` is called from `zoom()`, `centerView()`, and `onCanvasWheel()`.

---

## Item 5 — "Set as Client" toast feedback

**Goal:** Currently, setting someone as the client changes state silently (the green highlight appears but there's no confirmation phrase). Add a toast so the user knows the action took effect, especially when the highlight is subtle at low zoom.

**Where:** Inside `handleContextMenuClick`, find the `set-client` case (around line 1677):

```js
case 'set-client':
    db.people.forEach(p => p.isClient = false);
    if(person) person.isClient = true;
    saveToLocalStorage(); render();
    break;
```

Replace with:

```js
case 'set-client':
    db.people.forEach(p => p.isClient = false);
    if (person) {
        person.isClient = true;
        const displayName = person.name?.trim() || 'This person';
        showToast(`${displayName} set as client`, 'success');
    }
    saveToLocalStorage(); render();
    break;
```

**Do not touch:**
- Any other case in `handleContextMenuClick`.
- The `showToast` function itself.

**Acceptance criteria (code-level):**
1. The `set-client` case calls `showToast(..., 'success')` with the person's name.
2. The toast uses `displayName` fallback for unnamed people.

---

## Item 6 — Empty state orientation

**Goal:** Replace the blank canvas first-impression with an instructional overlay. Mirrors the Life Map polish-pass pattern. Shows: heading, one-line explainer, brief shortcut hint, primary CTA button.

**What changes:**

(a) Add CSS inside the existing `<style>` block, near the other layout rules (after the `.toast` styles, around line 178):

```css
#genogram-empty-state {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 4;
}
#genogram-empty-state.visible { display: flex; }
#genogram-empty-state .empty-card {
    pointer-events: auto;
    max-width: 360px;
    width: min(360px, calc(100vw - 4rem));
    padding: 1.5rem 1.75rem;
    text-align: center;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(107,114,128,0.18);
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(15,23,42,0.08);
    backdrop-filter: blur(6px);
}
.dark #genogram-empty-state .empty-card {
    background: rgba(31,41,55,0.88);
    border-color: rgba(156,163,175,0.18);
    box-shadow: 0 12px 32px rgba(0,0,0,0.28);
    color: #f3f4f6;
}
#genogram-empty-state .empty-icon {
    color: #2C5558;
    opacity: 0.55;
    margin: 0 auto 0.75rem;
}
.dark #genogram-empty-state .empty-icon { color: #7CB590; }
#genogram-empty-state h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2C5558;
    margin: 0 0 0.5rem;
}
.dark #genogram-empty-state h3 { color: #7CB590; }
#genogram-empty-state p.lead {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #6b7280;
    margin: 0 0 0.75rem;
}
.dark #genogram-empty-state p.lead { color: #9ca3af; }
#genogram-empty-state p.hint {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0 0 1.25rem;
}
.dark #genogram-empty-state p.hint { color: #6b7280; }
#empty-state-add-btn {
    background: #2C5558;
    color: white;
    padding: 0.55rem 1.5rem;
    border-radius: 9999px;
    border: none;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
}
#empty-state-add-btn:hover { background: #3A6E72; }
```

(b) Add the HTML inside `<main class="flex-1 relative bg-gray-50 dark:bg-gray-900">` (around line 335). Place it AFTER the closing `</svg>` of `#genogram-canvas` (around line 434) and BEFORE the bottom-right watermark cluster (around line 436):

```html
<div id="genogram-empty-state" aria-hidden="true">
    <div class="empty-card">
        <svg class="empty-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="5" height="5"/>
            <circle cx="18.5" cy="5.5" r="2.5"/>
            <line x1="8" y1="5.5" x2="16" y2="5.5"/>
            <line x1="12" y1="8" x2="12" y2="14"/>
            <rect x="6" y="14" width="5" height="5"/>
            <circle cx="16" cy="16.5" r="2.5"/>
            <line x1="11" y1="14" x2="13.5" y2="14"/>
        </svg>
        <h3>Build a Genogram</h3>
        <p class="lead">Map family relationships, clinical patterns, and emotional dynamics.</p>
        <p class="hint">Right-click a person for options. Hold space and drag to pan.</p>
        <button id="empty-state-add-btn" type="button">Add first person</button>
    </div>
</div>
```

(c) Add the update function inside the `<script type="module">` block. Place near other UI helpers (after `updateZoomDisplay` from Item 4):

```js
/**
 * Show the empty-state overlay when there are no people on the canvas; hide it otherwise.
 * Called from render() and on init.
 */
function updateEmptyState() {
    const el = document.getElementById('genogram-empty-state');
    if (!el) return;
    el.classList.toggle('visible', db.people.length === 0);
}
```

(d) Wire `updateEmptyState()` into `render()`. Find:

```js
function render() {
    viewportG.setAttribute('transform', `translate(${view.panX}, ${view.panY}) scale(${view.zoom})`);
    peopleG.innerHTML = '';
    relationshipsG.innerHTML = '';

    db.relationships.forEach(drawRelationship);
    db.emotionalLinks.forEach(drawEmotionalLink);
    db.people.forEach(drawPerson);
}
```

Replace the closing brace and add the call. Final shape:

```js
function render() {
    viewportG.setAttribute('transform', `translate(${view.panX}, ${view.panY}) scale(${view.zoom})`);
    peopleG.innerHTML = '';
    relationshipsG.innerHTML = '';

    db.relationships.forEach(drawRelationship);
    db.emotionalLinks.forEach(drawEmotionalLink);
    db.people.forEach(drawPerson);
    updateEmptyState();
}
```

(e) Wire the CTA button to open the Add Person modal. In `init`, add a listener near the existing modal-trigger listeners (right after `addPersonBtn.addEventListener('click', () => showModal('add'));` around line 2127):

```js
const emptyAddBtn = document.getElementById('empty-state-add-btn');
if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => showModal('add'));
}
```

**Do not touch:**
- The SVG canvas itself.
- The watermark cluster.
- The toast container or any modal.

**Acceptance criteria (code-level):**
1. `#genogram-empty-state` HTML exists inside `<main>`.
2. The CSS rules for the empty state, dark mode variants, and CTA button are present.
3. `updateEmptyState()` is defined and called from `render()`.
4. The CTA button listener calls `showModal('add')`.

---

## Post-execution verification (Composer)

After all six items implemented:

1. **No console errors at boot.** Reload the tool — no JS errors.
2. **CSS markers present.** Search the file for: `cursor: grab`, `scrollToPersonIfOffscreen`, `updateZoomDisplay`, `genogram-empty-state`, `empty-state-add-btn`, `Set as Client` toast call.
3. **Empty state renders.** With zero people on canvas, the empty-state overlay is visible (via `.visible` class added by `updateEmptyState`). Adding a person hides it (next `render()` call removes the class).
4. **Zoom percentage updates.** Clicking Zoom In / Zoom Out / Center → `updateZoomDisplay` is called → readout text changes. Wheel-zoom with modifier held → same.
5. **No out-of-scope edits.** `git diff` (or equivalent) shows only `tool_genogram.html` modified. Line count increases by ~80–110 lines (mostly Item 6's CSS + HTML).

If all five pass, report DONE.

---

## What will benefit from eventual visual confirmation (low urgency)

These don't block shipping but Matthew should eyeball them once when he has bandwidth:

- The empty-state card's layout, spacing, and contrast in both themes — the SVG icon's proportions especially.
- The `cursor: grab` actually shows on hover (most browsers, but some have quirks).
- The zoom percentage readout sits where intended — the `-mt-4` margin pull is approximate and may need adjustment.
- The toast for "Set as client" is readable and dismisses correctly.

Composer's code-level acceptance criteria above will catch structural problems; the above are purely visual fit-and-finish.

---

## Out of scope

- Dirty-state confirmation on Cancel for the person modal (parallel to Life Map's backdrop-close fix, but heavier; defer).
- Twin / adopted / foster relationship support.
- Multi-genogram saved library.
- Default-theme change (current OS-preference behavior is fine).
- Any backend / API / auth file.
- Any change to Life Map or other tools.

---

*End of build spec.*
