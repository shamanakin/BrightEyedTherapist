# Life Map — Polish & QoL Build Spec

**Target file:** `tool_timeline.html`
**Scope:** UX polish and quality-of-life — distinct from Path A (which addressed correctness bugs). Eight items.
**Author of spec:** Claude (handed to Composer for execution)
**Date:** May 27, 2026

This spec is the source of truth. Execute items in the order given. Each item's acceptance criteria must pass before moving on. The framing is user-experience, not code-correctness — Composer should pay attention not just to whether the code compiles but to whether the resulting interaction feels right against the listed acceptance criteria.

---

## Global guardrails (apply to every item)

1. **The only file Composer modifies is `tool_timeline.html`.** No other file is touched.
2. **No data-model changes.** No new fields on nodes, no schema version bump. `SCHEMA_VERSION` stays at `2`.
3. **No new external dependencies.** Font Awesome is already loaded; reuse existing icons or Unicode characters. No new CDN scripts.
4. **No renames of existing functions, variables, ids, or CSS class names** — except where this spec explicitly lists a rename. Adding new functions and new classes is fine.
5. **Do not refactor adjacent code.** Touch only what each item names.
6. **Preserve existing color palette.** Trauma red `#ef4444`, positive green `#10b981`, neutral gray `#9ca3af`, resource amber `#f59e0b`, sage primary `#2C5558`. Don't redefine these.
7. **New CSS goes inside the existing `<style>` block in `<head>`.** No new `<style>` tags.
8. **Light-mode and dark-mode parity.** Anything new must render in both. Use existing `--tt-*` CSS variables for surface colors; hard-code only the trauma/positive/neutral/resource palette colors listed above.
9. **No `console.log` left in shipped code.**
10. **Out-of-scope items must not be opportunistically improved**, even if they look related. If you see something else that needs fixing, leave it.

---

## Pre-flight check

Confirm:
- `tool_timeline.html` exists at the repo root.
- The file's current line count is in the ~1,870 range.
- Path A items have been merged — search for `applyComboFieldValue`, `LIFEMAP_DRAFT_KEY`, and `mobile-tools-toggle`. All three must be present. If any are missing, stop and report.

---

## Item 1 — Wheel-zoom requires Ctrl/Cmd, gentler step

**Problem:** Scrolling the mouse wheel or trackpad anywhere over the canvas immediately zooms the timeline. There is no way to vertically scroll the canvas content without zooming, and trackpad gestures overzoom rapidly because each tick is 1.15×.

**Goal:** Wheel events without a modifier key let the canvas pan/scroll naturally (the `#map-container` is already `overflow: auto`). Holding `Ctrl` or `Cmd` plus wheel zooms. Zoom step is reduced from 1.15 to 1.05 for finer control.

**What changes:**

Find the wheel listener:

```js
mapCanvas.addEventListener('wheel', e => {
    e.preventDefault();
    zoomTimeline(e.deltaY < 0 ? 1.15 : 1/1.15);
}, { passive: false });
```

Replace with:

```js
mapCanvas.addEventListener('wheel', e => {
    // Without a modifier, let the browser handle natural scroll over the canvas.
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    zoomTimeline(e.deltaY < 0 ? 1.05 : 1/1.05);
}, { passive: false });
```

**Do not touch:**
- The sidebar zoom buttons (`onclick="zoomTimeline(1.2)"`) — those keep their 1.2× step for deliberate clicks.
- The `zoomTimeline` function itself.
- The mousedown/mousemove panning handlers.

**Acceptance criteria:**
1. Open Life Map. Scroll the mouse wheel (or two-finger swipe on trackpad) over the canvas. The page or canvas scrolls; the timeline does NOT zoom.
2. Hold `Cmd` (Mac) or `Ctrl` (Windows/Linux). Scroll. The timeline zooms in/out smoothly, ~5% per tick.
3. The sidebar zoom-in and zoom-out buttons still work and still feel like the same (larger) step they were before.
4. Pan-via-drag on the canvas background still works.

---

## Item 2 — Esc closes open modals

**Problem:** No keyboard shortcut to dismiss the details or log-session modals. Standard expectation on any modal in any app.

**Goal:** Pressing `Escape` closes whichever modal is currently open, with the same behavior as clicking its existing close/cancel button.

**Important consequence to accept and document:** Esc on the details modal will dismiss without saving — same as the existing Close button. We are not adding dirty-state confirmation here because that's a heavier behavior change. Users who edit a long form should still use the Save button.

**What changes:**

Add a new listener inside the existing `<script>` block. Place it AFTER the existing `mapCanvas.addEventListener('wheel', ...)` block and BEFORE the existing `// Click-outside-to-close for modals` comment:

```js
// Esc closes whichever modal is open (matches existing Close / Cancel button behavior).
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (logSessionOverlay && logSessionOverlay.style.display === 'flex') {
        closeLogSession();
        return;
    }
    if (detailsOverlay && detailsOverlay.style.display === 'flex') {
        closeDetails();
        return;
    }
});
```

**Do not touch:**
- The existing `logSessionOverlay.addEventListener('click', ...)` backdrop handler.
- The `closeDetails` / `closeLogSession` functions themselves.

**Acceptance criteria:**
1. Open the details modal on any node. Press Esc. Modal closes; canvas state unchanged.
2. Open the log session modal. Press Esc. Modal closes.
3. If both are open (open details, then within details click "+ Log Session" to open the log modal nested), pressing Esc closes the log modal first; pressing Esc again closes details.
4. Esc with no modal open has no effect (does not break panning or any other handler).

---

## Item 3 — Details modal footer: reorder, rename Close → Cancel

**Problem:** The current footer order is `[Save] [Delete] [Close]`. Save and Delete are color-coded (sage / red) and sit adjacent. Risk of misclick — a single hand-off-target slip from Save lands on Delete. Standard dialog convention is destructive on far-left, primary on far-right, secondary adjacent to primary.

Also, the "Close" button discards any unsaved edits — the label "Cancel" communicates this more honestly.

**Goal:** Reorder the footer to `[Delete] ... [Cancel] [Save]` with visual separation between Delete and the right-hand cluster. Rename the Close button label to "Cancel". Add an icon (×) for clarity.

**What changes:**

Find the existing footer block:

```html
<!-- Actions -->
<div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; flex-wrap: wrap;">
    <button onclick="saveDetails()" style="flex: 1; padding: 0.6rem; background: #2C5558; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
        <i class="fa-solid fa-check"></i> Save
    </button>
    <button onclick="deleteNode()" style="padding: 0.6rem 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
        <i class="fa-solid fa-trash"></i>
    </button>
    <button onclick="closeDetails()" style="padding: 0.6rem 1rem; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Close
    </button>
</div>
```

Replace with:

```html
<!-- Actions -->
<div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; flex-wrap: wrap; align-items: center;">
    <button onclick="deleteNode()" style="padding: 0.6rem 0.9rem; background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 8px; cursor: pointer; font-weight: 500;" title="Delete this event">
        <i class="fa-solid fa-trash"></i> Delete
    </button>
    <div style="flex: 1;"></div>
    <button onclick="closeDetails()" style="padding: 0.6rem 1rem; background: transparent; color: var(--tt-text); border: 1px solid var(--tt-border); border-radius: 8px; cursor: pointer;">
        Cancel
    </button>
    <button onclick="saveDetails()" style="padding: 0.6rem 1.25rem; background: #2C5558; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
        <i class="fa-solid fa-check"></i> Save
    </button>
</div>
```

Notes on the change shape:
- Delete moves to far left; becomes outlined (transparent background + red border + red text) instead of solid red. Less visually loud, still clearly destructive. Includes the "Delete" word, not just the icon.
- Flex spacer pushes Save+Cancel to the right.
- Save loses its `flex: 1` (no longer the only stretching button); becomes naturally sized to its content.
- Cancel uses the existing `--tt-text` / `--tt-border` variables so it renders correctly in both themes.

**Do not touch:**
- The `deleteNode`, `saveDetails`, `closeDetails` functions themselves.
- Any other modal's footer.

**Acceptance criteria:**
1. Open the details modal. The footer reads, left to right: `[🗑 Delete] [gap] [Cancel] [✓ Save]`.
2. Save and Delete are not adjacent — there's an empty gap between Delete and Cancel.
3. Delete looks outlined (border + colored text on transparent background), not a solid red block.
4. The Cancel button uses theme-appropriate gray in both light and dark mode.
5. All three buttons function exactly as before: Save calls `saveDetails`, Cancel calls `closeDetails`, Delete calls `deleteNode`.

---

## Item 4 — Richer empty state on first open

**Problem:** First-time users see an icon and a single instructional sentence pointing to the sidebar. No orientation about what the tool does, no role legend, no obvious one-click action.

**Goal:** The empty state explains what Life Map is for, shows the four role colors, and offers a direct CTA button to add the first event without going to the sidebar.

**What changes:**

Find the existing `updateEmptyState` function. Inside the `if (!emptyEl) { ... }` block, replace the existing innerHTML assignment. Specifically, find this block:

```js
emptyEl.innerHTML = `
    <div class="empty-icon"><i class="fa-solid fa-timeline"></i></div>
    <p>Add your first life event to begin building the timeline</p>
    <p style="font-size:0.75rem; margin-top:0.5rem; opacity:0.6;">← Use "Add Event" in the sidebar</p>
`;
```

Replace with:

```js
emptyEl.innerHTML = `
    <div class="empty-icon"><i class="fa-solid fa-timeline"></i></div>
    <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin: 0 0 0.5rem; color: var(--tt-text); font-weight: 600;">Build a Life Map</h3>
    <p>Plot trauma, supports, and resources on a timeline. Mark targets for processing, log sessions, and track SUDS over time.</p>
    <div style="display: flex; gap: 0.75rem; justify-content: center; margin: 1rem 0 1.25rem; flex-wrap: wrap; font-size: 0.7rem; opacity: 0.75;">
        <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;border-radius:50%;background:#ef4444;display:inline-block;"></span>Trauma</span>
        <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;border-radius:50%;background:#10b981;display:inline-block;"></span>Positive</span>
        <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;border-radius:50%;background:#9ca3af;display:inline-block;"></span>Neutral</span>
        <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;border-radius:50%;background:#f59e0b;display:inline-block;"></span>Resource</span>
    </div>
    <button onclick="quickAddNode('trauma','point')" style="pointer-events: auto; padding: 0.55rem 1.25rem; background: #2C5558; color: white; border: none; border-radius: 999px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
        <i class="fa-solid fa-plus" style="margin-right:0.35rem;"></i>Add your first event
    </button>
`;
```

Note: this references `quickAddNode` which Item 5 introduces. Items must be executed in spec order; if Composer is working through item 4 before item 5, defer testing the button click until item 5 is also complete. Both items together produce a working empty-state CTA.

The `pointer-events: auto` is required because the existing `.timeline-empty-state` parent has `pointer-events: none` so it doesn't block canvas interaction. Without it the button is unclickable.

**Do not touch:**
- The `.timeline-empty-state` CSS rule (background, border, etc.). Keep its existing styling.
- The `updateEmptyState` function's logic for showing/hiding the element.
- The monkey-patching of `redrawTimeline` and `renderAllNodes` at the bottom of the function (architectural smell, but out of scope here).

**Acceptance criteria:**
1. Open Life Map in a fresh tab (no draft, no events). The empty state shows: heading "Build a Life Map", a one-paragraph explainer, a horizontal row of four colored role chips with their labels, and a primary CTA button "Add your first event".
2. Clicking the CTA button creates a Trauma (point) event at the midpoint year and opens the details modal (depends on Item 5 being complete).
3. After adding any event, the empty state disappears.
4. The empty state renders legibly in both dark and light modes.
5. On narrow viewports (mobile), the role chips wrap to multiple lines gracefully without overflowing the container.

---

## Item 5 — Quick-add buttons replace dropdown + Add

**Problem:** Adding the most common kind of event (a Trauma point) currently requires three actions: open the dropdown, select an option, click the Add button. With Trauma being ~60–80% of life-map adds, this friction compounds.

**Goal:** Replace the dropdown + Add button with a row of color-coded quick-add buttons. One click adds an event of that role and opens the details modal directly. Refactor `addEventFromSelector` into a parameter-taking `quickAddNode(role, visualType)` so the new buttons and the empty-state CTA share a single code path.

**What changes:**

(a) Add CSS for the quick-add buttons inside the existing `<style>` block, near other sidebar-button styling (around the `.view-toggles` / `.view-btn` rules):

```css
.quick-add-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
    margin-top: 0.25rem;
}
.quick-add-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid var(--tt-border);
    background: var(--tt-input-bg);
    color: var(--tt-text);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-color 0.15s;
    font-family: inherit;
}
.quick-add-btn:hover {
    background: var(--tt-border);
    border-color: #2C5558;
}
.quick-add-btn .qa-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}
.quick-add-btn .qa-bar {
    width: 14px;
    height: 4px;
    border-radius: 2px;
    flex-shrink: 0;
}
.quick-add-neutral {
    width: 100%;
    margin-top: 0.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.4rem;
    font-size: 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--tt-border);
    background: var(--tt-input-bg);
    color: var(--tt-text);
    cursor: pointer;
    font-family: inherit;
}
.quick-add-neutral:hover { background: var(--tt-border); }
.quick-add-neutral .qa-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
```

(b) Replace the existing "Add Event" sidebar section. Find this block:

```html
<!-- Add Event -->
<div class="sidebar-section">
    <div class="sidebar-title"><i class="fa-solid fa-plus-circle"></i> Add Event</div>
    <select id="add-event-type" style="margin-bottom: 0.5rem;">
        <optgroup label="Above Axis (Challenges)">
            <option value="trauma-point">🔴 Trauma (Point)</option>
            <option value="trauma-duration">🟠 Trauma (Duration)</option>
            <option value="neutral">⚪ Neutral Event</option>
        </optgroup>
        <optgroup label="Below Axis (Supports)">
            <option value="positive">🟢 Positive Event</option>
            <option value="resource">🟡 Resource</option>
        </optgroup>
    </select>
    <button onclick="addEventFromSelector()" class="w-full bg-sage-500 text-white rounded-md font-medium hover:bg-sage-600 transition" style="padding: 0.4rem;">
        <i class="fa-solid fa-plus"></i> Add
    </button>
</div>
```

Replace with:

```html
<!-- Add Event -->
<div class="sidebar-section">
    <div class="sidebar-title"><i class="fa-solid fa-plus-circle"></i> Add Event</div>
    <div class="quick-add-grid">
        <button class="quick-add-btn" onclick="quickAddNode('trauma','point')" title="Trauma — single point in time">
            <span class="qa-dot" style="background:#ef4444;"></span> Trauma
        </button>
        <button class="quick-add-btn" onclick="quickAddNode('trauma','duration')" title="Trauma — sustained over a duration">
            <span class="qa-bar" style="background:#ef4444;"></span> Duration
        </button>
        <button class="quick-add-btn" onclick="quickAddNode('positive','point')" title="Positive event">
            <span class="qa-dot" style="background:#10b981;"></span> Positive
        </button>
        <button class="quick-add-btn" onclick="quickAddNode('resource','point')" title="Resource (safe place, anchor, etc.)">
            <span class="qa-dot" style="background:#f59e0b;"></span> Resource
        </button>
    </div>
    <button class="quick-add-neutral" onclick="quickAddNode('neutral','point')" title="Neutral event">
        <span class="qa-dot" style="background:#9ca3af;"></span> Neutral event
    </button>
</div>
```

(c) Refactor `addEventFromSelector` into a parameterized `quickAddNode`. Find the existing function:

```js
function addEventFromSelector() {
    const val = document.getElementById('add-event-type').value;
    let role, visualType;
    
    if (val === 'trauma-point') { role = 'trauma'; visualType = 'point'; }
    else if (val === 'trauma-duration') { role = 'trauma'; visualType = 'duration'; }
    else if (val === 'positive') { role = 'positive'; visualType = 'point'; }
    else if (val === 'neutral') { role = 'neutral'; visualType = 'point'; }
    else if (val === 'resource') { role = 'resource'; visualType = 'point'; }
    else { role = 'neutral'; visualType = 'point'; }
    
    const defaultYear = Math.round((state.startYear + state.endYear) / 2);
    const defaultYearStr = defaultYear.toString();
    
    state.nextId++;
    const newId = `node-${state.nextId}`;
    
    const newData = { /* ... existing newData object ... */ };
    
    state.nodes.push(newData);
    renderAllNodes();
    updateProcessingQueue();
    markMapChanged();
    
    // Scroll to show the new node
    const xPos = calculateXPos(defaultYear);
    container.scrollLeft = Math.max(0, xPos - container.clientWidth / 2);
    
    openDetails(newId);

    queueMicrotask(() => {
        const targetInput = visualType === 'duration'
            ? document.getElementById('details-start-date')
            : document.getElementById('details-date');
        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    });
}
```

Replace with:

```js
function quickAddNode(role, visualType) {
    const allowedRoles = ['trauma', 'positive', 'neutral', 'resource'];
    if (!allowedRoles.includes(role)) role = 'neutral';
    if (visualType !== 'duration') visualType = 'point';

    const defaultYear = Math.round((state.startYear + state.endYear) / 2);
    const defaultYearStr = defaultYear.toString();

    state.nextId++;
    const newId = `node-${state.nextId}`;

    const newData = {
        id: newId,
        schemaVersion: SCHEMA_VERSION,
        visualType: visualType,
        date: defaultYearStr,
        startDate: defaultYearStr,
        endDate: defaultYearStr,
        role: role,
        title: role === 'resource' ? 'New Resource' : 'New Event',
        notes: '',
        emotions: '',
        isTouchstone: false,
        isTarget: false,
        emdrTarget: null,
        resource: role === 'resource' ? { type: 'safe_place', anchorWord: '', accessibility: 5 } : null
    };

    state.nodes.push(newData);
    renderAllNodes();
    updateProcessingQueue();
    markMapChanged();

    const xPos = calculateXPos(defaultYear);
    container.scrollLeft = Math.max(0, xPos - container.clientWidth / 2);

    openDetails(newId);

    queueMicrotask(() => {
        const targetInput = visualType === 'duration'
            ? document.getElementById('details-start-date')
            : document.getElementById('details-date');
        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    });
}

// Backward-compatible alias. Old call sites (if any) continue to work; new UI uses quickAddNode directly.
function addEventFromSelector() {
    const sel = document.getElementById('add-event-type');
    if (!sel) return; // Dropdown removed in polish pass; this alias is a safety net.
    const val = sel.value;
    if (val === 'trauma-point') return quickAddNode('trauma', 'point');
    if (val === 'trauma-duration') return quickAddNode('trauma', 'duration');
    if (val === 'positive') return quickAddNode('positive', 'point');
    if (val === 'neutral') return quickAddNode('neutral', 'point');
    if (val === 'resource') return quickAddNode('resource', 'point');
    return quickAddNode('neutral', 'point');
}
```

The backward-compat alias is defensive: if anything else in the codebase calls `addEventFromSelector` (e.g. tests, browser bookmarks the user has), it still works against the missing dropdown.

**Do not touch:**
- The `migrateMapData`, `migrateEventV1toV2` functions.
- The node data shape — the new `quickAddNode` produces identical objects to the prior code.
- Any other sidebar section.

**Acceptance criteria:**
1. The sidebar "Add Event" section shows a 2×2 grid of buttons (Trauma point, Trauma duration, Positive, Resource), then a full-width Neutral button below.
2. Each button shows a small colored dot (or bar for Trauma duration) plus the role label.
3. Hovering a button shows a `title` tooltip describing the variant.
4. Clicking "Trauma" (point) creates a Trauma point event at the midpoint year, opens the details modal, focuses and selects the year input.
5. Clicking "Trauma" with the "Duration" variant creates a duration-type event and focuses the Start Year input.
6. The "Add your first event" CTA in the empty state (Item 4) works.
7. No JavaScript errors in the console on any of the above.
8. Theme toggle: buttons render correctly in both light and dark mode.

---

## Item 6 — Adaptive year-marker granularity

**Problem:** Year markers are drawn at every 5th year regardless of range. A 5-year timeline shows only one or two markers (start + end). A 60-year timeline shows 12 markers crammed against each other at low zoom. Neither is comfortable to read.

**Goal:** Adjust the marker step based on the visible range so the canvas always has a comfortable number of labels (roughly 6–10).

**What changes:**

Find the existing marker loop inside `redrawTimeline`:

```js
for (let year = state.startYear; year <= state.endYear; year++) {
    if (year % 5 === 0 || year === state.startYear || year === state.endYear) {
        const xPos = calculateXPos(year);
        const marker = document.createElement('div');
        marker.className = 'year-marker';
        marker.style.left = `${xPos}px`;
        mapCanvas.appendChild(marker);
        
        const label = document.createElement('div');
        label.className = 'year-label';
        label.style.left = `${xPos}px`;
        label.textContent = year;
        mapCanvas.appendChild(label);
    }
}
```

Replace the conditional with an adaptive step:

```js
const _markerRange = state.endYear - state.startYear;
const _markerStep = _markerRange > 60 ? 10
                  : _markerRange > 25 ? 5
                  : _markerRange > 10 ? 2
                  : 1;
for (let year = state.startYear; year <= state.endYear; year++) {
    if (year === state.startYear || year === state.endYear || year % _markerStep === 0) {
        const xPos = calculateXPos(year);
        const marker = document.createElement('div');
        marker.className = 'year-marker';
        marker.style.left = `${xPos}px`;
        mapCanvas.appendChild(marker);

        const label = document.createElement('div');
        label.className = 'year-label';
        label.style.left = `${xPos}px`;
        label.textContent = year;
        mapCanvas.appendChild(label);
    }
}
```

**Do not touch:**
- The `calculateXPos` function.
- The `.year-marker` or `.year-label` CSS.
- The `mapCanvas.style.width` calculation above the loop.

**Acceptance criteria:**
1. Set range 1990–2026 (36-year span). Markers appear every 5 years plus start/end (1990, 1995, 2000, ..., 2025, 2026).
2. Set range 2020–2026 (6 years). Markers appear every year (2020, 2021, 2022, ..., 2026).
3. Set range 2010–2026 (16 years). Markers appear every 2 years (2010, 2012, 2014, ..., 2026).
4. Set range 1950–2026 (76 years). Markers appear every 10 years (1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026).
5. Start year and end year always render their own labels even if not divisible by the step.

---

## Item 7 — Enrich node tooltips

**Problem:** Hovering a node shows only `"YYYY - Title"`. The clinician can't tell from the tooltip alone whether the node is a touchstone, a target, or a resolved target — they have to open the details modal.

**Goal:** Tooltip text shows date, title, role, and any active markers (Touchstone / Target / Resolved). Single-line, plain text (safe to use `textContent`).

**What changes:**

Find the existing tooltip assignment inside `createNodeElement`:

```js
const tooltip = document.createElement('span');
tooltip.className = 'tooltip';
const dateDisplay = data.visualType === 'duration' ? `${data.startDate}-${data.endDate}` : data.date;
tooltip.textContent = `${dateDisplay} - ${data.title}`;
el.appendChild(tooltip);
```

Replace with:

```js
const tooltip = document.createElement('span');
tooltip.className = 'tooltip';
const dateDisplay = data.visualType === 'duration' ? `${data.startDate}-${data.endDate}` : data.date;
const roleLabels = { trauma: 'Trauma', positive: 'Positive', neutral: 'Neutral', resource: 'Resource' };
const roleLabel = roleLabels[data.role] || '';
const markers = [];
if (data.isTouchstone) markers.push('Touchstone');
if (data.isTarget) {
    const status = data.emdrTarget && data.emdrTarget.processingStatus;
    markers.push(status === 'resolved' ? 'Target · Resolved' : 'Target');
}
const markerSuffix = markers.length ? ` · ${markers.join(' · ')}` : '';
tooltip.textContent = `${dateDisplay} · ${data.title} · ${roleLabel}${markerSuffix}`;
el.appendChild(tooltip);
```

**Do not touch:**
- The `.tooltip` CSS — visual style stays the same.
- The hover behavior (CSS `:hover` toggles visibility).

**Acceptance criteria:**
1. Hover a plain trauma node titled "Car accident" dated 2010. Tooltip reads: `2010 · Car accident · Trauma`.
2. Hover a trauma node marked as Touchstone. Tooltip reads: `2010 · Car accident · Trauma · Touchstone`.
3. Hover a trauma node marked as Target with not_started status. Tooltip reads: `2010 · Car accident · Trauma · Target`.
4. Hover a trauma node marked as Target with resolved status. Tooltip reads: `2010 · Car accident · Trauma · Target · Resolved`.
5. Hover a duration trauma 2005–2012 marked as both Touchstone and Target. Tooltip reads: `2005-2012 · [title] · Trauma · Touchstone · Target`.
6. Hover a resource node. Tooltip reads: `YYYY · [title] · Resource` (no markers since resources don't have touchstone/target flags).
7. Tooltips remain on a single line and don't visually break the canvas.

---

## Item 8 — Zoom-modifier hint in sidebar

**Problem:** Item 1 changes the wheel-zoom behavior. Users who developed muscle memory with the old "scroll = zoom" behavior need a discoverable hint about the new modifier requirement.

**Goal:** Brief one-line hint below the existing zoom buttons in the sidebar explaining the modifier.

**What changes:**

Find the existing "Zoom" sidebar section. The block looks like:

```html
<!-- Zoom -->
<div class="sidebar-section">
    <div class="sidebar-title"><i class="fa-solid fa-magnifying-glass"></i> Zoom</div>
    <div style="display: flex; gap: 0.5rem;">
        <button onclick="zoomTimeline(1.2)" style="...">...zoom-in icon...</button>
        <button onclick="zoomTimeline(1/1.2)" style="...">...zoom-out icon...</button>
    </div>
</div>
```

After the closing `</div>` of the buttons row but BEFORE the closing `</div>` of the sidebar-section, insert this hint:

```html
<div style="margin-top: 0.45rem; font-size: 0.65rem; opacity: 0.65; line-height: 1.35;">
    Hold <kbd style="font-family: inherit; padding: 0 4px; border: 1px solid var(--tt-border); border-radius: 3px; font-size: 0.62rem;">⌘</kbd> / <kbd style="font-family: inherit; padding: 0 4px; border: 1px solid var(--tt-border); border-radius: 3px; font-size: 0.62rem;">Ctrl</kbd> and scroll over the canvas to zoom.
</div>
```

**Do not touch:**
- The two zoom buttons or their handlers.

**Acceptance criteria:**
1. Sidebar Zoom section shows: section title, the two icon buttons, then a small hint reading "Hold ⌘ / Ctrl and scroll over the canvas to zoom" with the keys styled as small framed pills.
2. Hint is legible but subtle — doesn't compete with the buttons for attention.
3. Renders correctly in light and dark modes (the `<kbd>` borders use `--tt-border`).

---

## Post-execution verification (Composer runs this before declaring done)

After all eight items are implemented, walk through these steps. Halt and report on any failure.

1. **Cold reload.** Page opens, no console errors. Empty state shows the new richer layout (heading, explainer, role chips, CTA button).
2. **CTA path.** Click "Add your first event" in the empty state. A trauma point event is created at the midpoint year, details modal opens, year input is focused and selected.
3. **Quick-add path.** Cancel the modal. Click the Resource quick-add button in the sidebar. Resource event is created with the resource-section visible in the modal.
4. **Modal footer.** With the modal open, confirm the footer order: Delete (outlined red, far left), spacer, Cancel, Save (sage, far right). Press Escape — modal closes.
5. **Save and check tooltip.** Add a Trauma point event, give it a title, mark both Touchstone and Target, leave status "not_started", Save. Hover the node on the canvas. Tooltip reads with `Trauma · Touchstone · Target`.
6. **Mark resolved via log session.** Click the node in the queue to select it as a target. Click Log Session in the target card panel. Fill basic values, check "Mark target as Resolved", Save. Hover the node again. Tooltip now includes `Resolved`.
7. **Wheel-zoom modifier.** Scroll over the canvas with no modifier — nothing zooms; canvas scrolls (if it's larger than viewport) or the page scrolls (if not). Hold Cmd/Ctrl and scroll — timeline zooms in/out smoothly at ~5% per tick.
8. **Adaptive markers.** In the sidebar, change the year range to 2020–2026, click Apply. Year markers appear every year. Change to 1960–2026. Markers appear every 10 years (1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026).
9. **Sidebar hint.** The zoom hint is visible below the zoom buttons.
10. **Theme parity.** Toggle the sun/moon. Verify all new visible elements (quick-add buttons, modal footer, empty state, tooltip, sidebar hint) render legibly in the opposite theme.

If all ten pass, report DONE with a one-line summary per item.

---

## Out of scope for this build (do not touch)

- Default mode toggle (dark vs light at load) — separate decision.
- Drag-to-reorder processing queue.
- Touch / pinch-zoom support for mobile.
- Body-location dropdown of common spots.
- SUDS / VoC numeric inputs alongside the sliders.
- Sidebar pill spacing or visual hierarchy adjustments beyond the Add-Event section.
- Branding / header logo enlargement.
- Print-to-PDF improvements.
- The "Targets" filter button label (still includes touchstones per Path A).
- Any backend / API / auth file.
- Genogram, Brainspotting, EMDR tools.

---

## Considered but excluded (for Matthew's awareness)

These came up during the polish pass and were considered, but excluded from this spec. If you want any of them, they can become their own batch.

- **Default light mode.** Clinical-office context generally favors light. But you may be deliberately using dark for late-session work; deferring the call.
- **Replace SUDS / VoC sliders with combined slider + number-input.** Some clinicians prefer typing a number; some prefer dragging.
- **Drag-to-reorder processing queue.** Currently algorithmic. Clinician override would matter for cases where SUDS-midrange ordering doesn't match treatment-plan intent.
- **"Back to last target" navigation arrows.** Useful in a multi-target session; light feature work.
- **Body location dropdown of common spots** ("chest, stomach, throat, jaw, shoulders, head, hands, gut, lower back, neck") with custom fallback — same pattern as NC/PC; would also need similar combo-field logic.
- **Quick search / find-as-you-type for nodes.** Useful at 30+ events; was in audit Tier 3, item 11.
- **Discard-confirmation on Cancel if dirty.** Heavier dirty-state tracking. Defensible to ship without; you can add later if real accidents accumulate.

---

*End of polish spec.*
