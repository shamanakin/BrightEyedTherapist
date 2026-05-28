# Life Map — Build Spec (Path A)

**Target file:** `tool_timeline.html` (single file; ~1,690 lines)
**Scope:** Audit items 1, 2, 3, 4, 7, 8, 15 from `docs/LIFEMAP_AUDIT_2026-05-27.md`
**Author of spec:** Claude (handed to Composer for execution)
**Date:** May 27, 2026

This spec is the source of truth for what to change. The audit document is context only; do not act on items not listed below. Execute items in the order given. After each item, the acceptance criteria must pass before moving to the next.

---

## Global guardrails (apply to every item)

These constraints apply to all seven items below. Violations of these are bugs in the spec execution.

1. **The only file Composer modifies is `tool_timeline.html`.** No other file in the repo is touched. If a change appears to require editing another file, stop and surface the issue rather than spreading the change.
2. **Do not bump `SCHEMA_VERSION`.** It is currently `2`. It stays at `2`. The data model for nodes does not change in this spec.
3. **Do not rename existing functions, variables, or DOM ids.** New helpers may be added; existing names are stable.
4. **Do not refactor adjacent code.** Touch only the lines and blocks necessary to implement the listed items. Style cleanups, formatting changes, and re-flowing unrelated code are out of scope.
5. **Do not add new external dependencies** (no new CDN scripts, no new libraries).
6. **Preserve existing comment style and section banners** (the `// ====` blocks). New code goes inside an existing section if it fits topically, or appears as a new banner-delimited section.
7. **All new CSS goes inside the existing `<style>` block in `<head>`.** No new `<style>` tags. No inline styles in new HTML except where matching the existing pattern (the file uses inline styles heavily; that is the existing pattern and may continue).
8. **No `console.log` left in shipped code.** `console.warn` / `console.error` for actual failure paths only.
9. **Light-mode and dark-mode parity.** Any new visible UI element (e.g. draft recovery banner, helper icons) must render correctly in both `body.tt-dark` (default) and the light variant. Use the existing CSS variables (`--tt-panel-bg`, `--tt-border`, `--tt-text`, `--tt-input-bg`, etc.) — do not hard-code light/dark colors.
10. **No automated migrations of sessionStorage / localStorage.** If older sessionStorage keys exist from prior work, ignore them — the new draft key is namespaced.

---

## Pre-flight check (before any edits)

Confirm:
- `tool_timeline.html` exists at the repo root.
- The file's current line count is in the ~1,690 range (small drift is fine).
- The file contains a `<script>` block that defines `let state = { ... }` and functions including `saveDetails`, `openDetails`, `addEventFromSelector`, `saveMap`, `loadMap`, `applyViewFilter`, `markMapChanged`, `setDirtyState`.

If any of these are missing, stop and report. Do not attempt to reconstruct.

---

## Item 1 — Remove backdrop-close on the details modal

**Goal:** Prevent silent loss of in-progress EMDR target details when the clinician accidentally clicks the modal backdrop.

**What changes:**
Remove the event listener that closes the details overlay when its backdrop is clicked. The Close button at the bottom of the modal already handles intentional closes.

**Where:** Inside the `<script>` block, find the listener that matches this shape:

```js
detailsOverlay.addEventListener('click', (e) => {
    if (e.target === detailsOverlay) closeDetails();
});
```

**Action:** Delete those three lines (the entire `addEventListener` call). Do not leave behind a comment block where they were — clean removal.

**Do not touch:**
- The `logSessionOverlay` backdrop-close listener immediately below. It is intentionally being left in place for this round; the log-session modal is a smaller form and the data-loss risk is lower.
- The `closeDetails()` function itself.
- Any other modal close paths.

**Acceptance criteria:**
1. Open the details modal on any node.
2. Type something in the Title field.
3. Click anywhere on the dimmed backdrop outside the modal panel.
4. The modal **does not close**; the typed text remains.
5. Clicking the Close button at the bottom of the modal still closes it.
6. Clicking the X-style cancel pattern, if any exists, still works.

---

## Item 2 — Fix NC / PC custom-field data-loss bug

**Goal:** When a target is saved with a custom Negative Cognition (or Positive Cognition) that is not in the dropdown options, re-opening that target must display the custom string and not silently lose it on the next save.

**Background:**
- The current `openDetails` code sets `document.getElementById('emdr-nc').value = data.emdrTarget.negCognition || ''` directly. If `negCognition` does not match any `<option>` value, the dropdown silently falls back to empty.
- The `emdr-nc-custom` input is unconditionally blanked.
- Both fields are now empty even though state holds the saved value.
- The next `saveDetails` call computes `custom || dropdown` = `'' || ''` = `''`, wiping NC.
- Same applies to PC.

**What changes:**

(a) Add a helper function inside the existing `<script>` block, placed near the top of the "DETAILS MODAL" section banner (i.e. just before `function openDetails`):

```js
/**
 * Apply a saved value to a combo of a preset <select> and a free-text input.
 * If the saved value matches one of the select's <option> values, populate the
 * select. Otherwise, populate the free-text input and leave the select on its
 * placeholder. Prevents custom values from disappearing on re-open.
 */
function applyComboFieldValue(selectId, customId, savedValue) {
    const select = document.getElementById(selectId);
    const custom = document.getElementById(customId);
    if (!select || !custom) return;

    if (!savedValue) {
        select.value = '';
        custom.value = '';
        return;
    }

    const hasOption = Array.from(select.options).some(opt => opt.value === savedValue);
    if (hasOption) {
        select.value = savedValue;
        custom.value = '';
    } else {
        select.value = '';
        custom.value = savedValue;
    }
}
```

(b) Inside `openDetails`, replace the NC and PC initialization. Find this block (inside the `if (data.emdrTarget) { ... }` branch):

```js
document.getElementById('emdr-nc').value = data.emdrTarget.negCognition || '';
document.getElementById('emdr-nc-custom').value = '';
document.getElementById('emdr-pc').value = data.emdrTarget.posCognition || '';
document.getElementById('emdr-pc-custom').value = '';
```

Replace with:

```js
applyComboFieldValue('emdr-nc', 'emdr-nc-custom', data.emdrTarget.negCognition);
applyComboFieldValue('emdr-pc', 'emdr-pc-custom', data.emdrTarget.posCognition);
```

(c) Inside the `else` branch of the same `if (data.emdrTarget)` block (where the form is reset when a node has no `emdrTarget`), replace:

```js
document.getElementById('emdr-nc').value = '';
document.getElementById('emdr-nc-custom').value = '';
document.getElementById('emdr-pc').value = '';
document.getElementById('emdr-pc-custom').value = '';
```

With:

```js
applyComboFieldValue('emdr-nc', 'emdr-nc-custom', '');
applyComboFieldValue('emdr-pc', 'emdr-pc-custom', '');
```

**Do not touch:**
- The save-side logic in `saveDetails` (`const nc = document.getElementById('emdr-nc-custom').value || document.getElementById('emdr-nc').value;`). This logic is correct under the new open-side behavior. Custom-wins-when-non-empty is intentional.
- The `<select>` markup with the `<optgroup>` entries. Preset NC/PC options stay as they are.
- Any other field initialization in `openDetails`.

**Acceptance criteria:**
1. Create a trauma node, mark it as a target. Choose a preset NC (e.g. "I am worthless") from the dropdown. Save. Re-open. Dropdown shows "I am worthless"; custom input is empty.
2. Create another target. Leave dropdown on placeholder; type a custom NC like "I am defective in a way no one can see" into the custom input. Save. Re-open. Dropdown is on its placeholder; custom input contains the typed string.
3. With the custom NC target from (2) re-opened, change nothing and click Save. Re-open. The custom NC is still present (verifying the bug is fixed — previously this save would have wiped it).
4. Repeat (1)–(3) for PC.
5. Opening a target whose `emdrTarget` is null (or a non-target node) leaves NC/PC fields blank with no error.

---

## Item 3 — sessionStorage draft recovery

**Goal:** A clinician's in-progress Life Map survives an accidental tab close or browser crash. On reload of the same tab, an explicit recovery banner offers Keep or Discard. This matches the pattern used in Guided EMDR (`bet-guided-draft`).

**Critical guardrail:** Use `sessionStorage`, NOT `localStorage`. Tab-scoped is the privacy-correct choice. Clinical content must not outlive the tab.

**What changes:**

(a) Add CSS for the recovery banner inside the existing `<style>` block in `<head>`. Place near the existing toast styles (`.tl-toast` block) since the visual language is similar:

```css
#lifemap-draft-banner {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--tt-panel-bg);
    border: 1px solid var(--tt-border);
    border-radius: 10px;
    padding: 0.65rem 1rem;
    z-index: 200;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    font-size: 0.85rem;
    color: var(--tt-text);
    display: flex;
    align-items: center;
    gap: 0.85rem;
    max-width: calc(100vw - 2rem);
}
#lifemap-draft-banner .draft-banner-text {
    line-height: 1.4;
}
#lifemap-draft-banner button {
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid var(--tt-border);
    background: var(--tt-input-bg);
    color: var(--tt-text);
    font-size: 0.8rem;
    font-family: inherit;
    white-space: nowrap;
}
#lifemap-draft-banner button.draft-banner-primary {
    background: #2C5558;
    color: #fff;
    border-color: #2C5558;
}
```

(b) Add a new section banner inside the `<script>` block, placed AFTER the `// SAVE/LOAD` section and BEFORE the `// THEME & UI` section:

```js
// ============================================
// DRAFT RECOVERY (sessionStorage, tab-scoped)
// ============================================
const LIFEMAP_DRAFT_KEY = 'bet-lifemap-draft';
const LIFEMAP_DRAFT_DEBOUNCE_MS = 2000;
let _draftPersistTimer = null;

function persistDraft() {
    if (_draftPersistTimer) clearTimeout(_draftPersistTimer);
    _draftPersistTimer = setTimeout(() => {
        try {
            sessionStorage.setItem(LIFEMAP_DRAFT_KEY, JSON.stringify(state));
        } catch (err) {
            console.warn('Life Map draft persist failed:', err);
        }
    }, LIFEMAP_DRAFT_DEBOUNCE_MS);
}

function clearDraft() {
    if (_draftPersistTimer) {
        clearTimeout(_draftPersistTimer);
        _draftPersistTimer = null;
    }
    try {
        sessionStorage.removeItem(LIFEMAP_DRAFT_KEY);
    } catch (err) {
        // sessionStorage may be unavailable in some embedded contexts; silent.
    }
}

function maybeOfferDraftRecovery() {
    let raw;
    try {
        raw = sessionStorage.getItem(LIFEMAP_DRAFT_KEY);
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

    if (!draft || !Array.isArray(draft.nodes) || draft.nodes.length === 0) {
        clearDraft();
        return;
    }

    showDraftRecoveryBanner(draft);
}

function showDraftRecoveryBanner(draft) {
    if (document.getElementById('lifemap-draft-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'lifemap-draft-banner';
    banner.innerHTML = `
        <span class="draft-banner-text">
            Recovered unsaved Life Map from this tab (${draft.nodes.length} event${draft.nodes.length === 1 ? '' : 's'}).
        </span>
        <button id="draft-banner-keep" class="draft-banner-primary">Keep</button>
        <button id="draft-banner-discard">Discard</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('draft-banner-keep').addEventListener('click', () => {
        try {
            state = migrateMapData(draft);
        } catch (err) {
            console.error('Failed to apply recovered draft:', err);
            showTimelineToast('Could not restore draft.', 'error');
            banner.remove();
            return;
        }
        document.getElementById('start-year').value = state.startYear;
        document.getElementById('end-year').value = state.endYear;
        const clientInput = document.getElementById('client-name');
        if (clientInput) clientInput.value = state.clientName || '';
        renderAllNodes();
        redrawTimeline();
        updateProcessingQueue();
        setDirtyState(true);
        banner.remove();
        showTimelineToast('Draft restored. Export JSON to keep it.', 'success');
    });

    document.getElementById('draft-banner-discard').addEventListener('click', () => {
        clearDraft();
        banner.remove();
    });
}
```

(c) Wire `persistDraft` into the `markMapChanged` function. Find:

```js
function markMapChanged() {
    setDirtyState(true);
}
```

Replace with:

```js
function markMapChanged() {
    setDirtyState(true);
    persistDraft();
}
```

(d) Wire `clearDraft` into the export path. In `saveMap`, after the existing `setDirtyState(false);` line and before the toast, add `clearDraft();`. The resulting tail of `saveMap` should be:

```js
URL.revokeObjectURL(a.href);
setDirtyState(false);
clearDraft();
showTimelineToast('Life Map exported.', 'success');
```

(e) Wire `clearDraft` into the import path. In `loadMap`, inside the `try` block of the FileReader's `onload`, after the existing `setDirtyState(false);` line, add `clearDraft();`. The resulting block should be:

```js
renderAllNodes();
redrawTimeline();
updateProcessingQueue();
setDirtyState(false);
clearDraft();
showTimelineToast('Timeline loaded successfully!', 'success');
```

(f) Wire `maybeOfferDraftRecovery` into the boot sequence. Find the existing `window.addEventListener('load', () => { ... })` handler near the bottom of the script. Add `maybeOfferDraftRecovery();` as the **last** statement inside that handler, after `updateSaveStateHint();`. The resulting handler:

```js
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('tt_theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('tt-dark');
        document.getElementById('theme-icon-sun').style.display = 'none';
        document.getElementById('theme-icon-moon').style.display = '';
    }

    redrawTimeline();
    updateProcessingQueue();
    updateEmptyState();
    updateSaveStateHint();
    maybeOfferDraftRecovery();
});
```

**Do not touch:**
- The `tt_theme` localStorage logic. Theme preference stays in localStorage (intentional — non-clinical).
- The `beforeunload` handler — its dirty-check is still useful and runs before the draft would have been persisted on tab close.
- The `migrateMapData` function — it is reused as-is to handle older schema drafts.
- The `state` initialization at the top of the script. Initial state stays default; the draft, if any, is offered to the user, not auto-applied.

**Acceptance criteria:**
1. Open Life Map in a fresh tab. Add three events with titles. Without exporting, close the tab.
2. Open Life Map in a new tab (same browser, fresh URL bar). A banner appears at the top: "Recovered unsaved Life Map from this tab (3 events). [Keep] [Discard]".
3. Click Keep. The three events appear on the timeline. The dirty hint shows "Unsaved changes in this tab." (because Keep applies setDirtyState(true)).
4. Add a fourth event. Wait ~3 seconds. Close the tab. Reopen Life Map. Banner offers 4 events.
5. Click Discard. The banner disappears. Refresh the page. No banner appears (draft was cleared).
6. Repeat (1)–(2). Click Export JSON. Refresh the page. **No banner appears** (export clears draft).
7. Repeat (1)–(2). Click Import JSON and load any valid file. Refresh the page. **No banner appears** (import clears draft).
8. Verify in DevTools that `sessionStorage` contains `bet-lifemap-draft` only while a draft is unsaved, and is gone after Export, Import, or Discard.
9. Verify in DevTools that `localStorage` does NOT contain any Life Map node data (only `tt_theme` may be present).

---

## Item 4 — Smarter default year on Add Event

**Goal:** When adding a new event, default the year to the middle of the visible timeline range (not the current year). Auto-focus the year input in the details modal so a single keystroke replaces it.

**What changes:**

(a) Inside `addEventFromSelector`, replace this block:

```js
const currentYear = new Date().getFullYear();
const currentYearStr = currentYear.toString();

// Auto-extend timeline if current year is beyond end year
if (currentYear > state.endYear) {
    state.endYear = currentYear;
    document.getElementById('end-year').value = currentYear;
    redrawTimeline();
}
```

With:

```js
const defaultYear = Math.round((state.startYear + state.endYear) / 2);
const defaultYearStr = defaultYear.toString();
```

Note: the timeline-extension block is removed entirely. The middle of a valid range is always within the range, so the extension is no longer needed at this point. (If the user later edits the year to one outside the range, `ensureYearsVisible` in `saveDetails` already handles extension.)

(b) In the same function, replace `currentYearStr` with `defaultYearStr` in the three places it appears (`date:`, `startDate:`, `endDate:`).

(c) Replace the use of `currentYear` in the scroll-into-view line:

```js
const xPos = calculateXPos(currentYear);
```

with:

```js
const xPos = calculateXPos(defaultYear);
```

(d) After the existing `openDetails(newId);` call at the end of `addEventFromSelector`, add a focus-and-select call on the year input. The year input's id is `details-date` (for point events) or `details-start-date` (for duration events). Because the modal's `point-fields` vs `duration-fields` visibility is set inside `openDetails`, do this after a microtask to ensure the input is actually visible:

```js
openDetails(newId);

// Focus the year field so a quick keystroke replaces the default.
queueMicrotask(() => {
    const targetInput = visualType === 'duration'
        ? document.getElementById('details-start-date')
        : document.getElementById('details-date');
    if (targetInput) {
        targetInput.focus();
        targetInput.select();
    }
});
```

**Do not touch:**
- The existing `ensureYearsVisible` logic in `saveDetails`. That handles the case where the user manually edits an event to a year outside the visible range.
- Any other `new Date().getFullYear()` calls elsewhere in the file (e.g. in `log-date` defaulting). Those stay as-is.
- The default `state.startYear`/`state.endYear` values at the top of the script.

**Acceptance criteria:**
1. With default range 1990–2026, click Add Event → Trauma (Point) → Add. The modal opens. The Year field shows `2008` (the midpoint). The Year field has focus and the `2008` text is selected (so typing `1995` replaces it immediately).
2. Change the range to 2000–2030 in the sidebar, click Apply. Click Add Event → Add. The new event's year defaults to `2015`.
3. Add Event → Trauma (Duration) → Add. The Start Year input is focused and selected, defaulting to the midpoint. End Year also shows the midpoint.
4. Saving an event with a year beyond the current range still auto-extends the range (regression check: `ensureYearsVisible` still works).
5. Cancel/close the modal — no event is added (existing behavior preserved).

---

## Item 7 — Helper icons on Touchstone / Target checkboxes

**Goal:** Make the clinical meaning of "Touchstone Memory" and "Processing Target" discoverable without changing the label text.

**What changes:**

(a) Add CSS inside the existing `<style>` block, near the `.checkbox-row` and `.section-title` styles:

```css
.checkbox-help {
    color: #9ca3af;
    font-size: 0.78rem;
    cursor: help;
    margin-left: 0.3rem;
    user-select: none;
}
.checkbox-help:hover { color: #6b7280; }
body.tt-dark .checkbox-help { color: #6b7280; }
body.tt-dark .checkbox-help:hover { color: #9ca3af; }
```

(b) Find this HTML block inside `#trauma-section`:

```html
<div class="checkbox-row">
    <label><input type="checkbox" id="is-touchstone" onchange="updateTargetFields()"> Touchstone Memory</label>
    <label><input type="checkbox" id="is-target" onchange="updateTargetFields()"> Processing Target</label>
</div>
```

Replace with:

```html
<div class="checkbox-row">
    <label>
        <input type="checkbox" id="is-touchstone" onchange="updateTargetFields()">
        Touchstone Memory
        <span class="checkbox-help" title="Earliest related memory in this thread.">&#9432;</span>
    </label>
    <label>
        <input type="checkbox" id="is-target" onchange="updateTargetFields()">
        Processing Target
        <span class="checkbox-help" title="Plan to process this in EMDR.">&#9432;</span>
    </label>
</div>
```

The `&#9432;` is the Unicode "circled information source" character (ⓘ) — no Font Awesome dependency.

**Do not touch:**
- The `updateTargetFields` function.
- The `is-touchstone` / `is-target` input ids or their onchange wiring.
- Any other label in any other section.

**Acceptance criteria:**
1. Open a trauma node's details modal. The two checkboxes each show a small ⓘ icon to the right of the label.
2. Hovering the ⓘ icon shows a browser tooltip with the clinical hint.
3. Hovering the icon does not toggle the checkbox.
4. Clicking the icon does not toggle the checkbox (because it is inside the `<label>` — verify this is acceptable in actual UX; if the click bubbles to the checkbox, that's still fine, but the hover tooltip is what matters).
5. The checkboxes still toggle correctly on click.
6. Both light and dark mode show the icon legibly.

---

## Item 8 — "Targets" filter includes touchstones

**Goal:** Filtering to "Targets" surfaces the touchstone memories associated with the trauma threads being processed — they belong together clinically.

**What changes:**

In `applyViewFilter`, find this block:

```js
let visible = true;
if (currentViewFilter === 'trauma') visible = data.role === 'trauma';
else if (currentViewFilter === 'resource') visible = data.role === 'resource';
else if (currentViewFilter === 'targets') visible = data.isTarget === true;
```

Replace the last line with:

```js
else if (currentViewFilter === 'targets') visible = (data.isTarget === true || data.isTouchstone === true);
```

**Do not touch:**
- Any other filter branch.
- The view-toggle button labels in the sidebar (the "Targets" button keeps its current label; renaming is out of scope).
- The processing queue logic (which only considers `isTarget`, not touchstones — that is correct and unchanged).

**Acceptance criteria:**
1. Create three trauma nodes: A is a touchstone only, B is a target only, C is both touchstone and target. Create one positive node D and one resource node E.
2. Click filter "Targets". Visible: A, B, C. Hidden: D, E.
3. Click filter "All". All five visible.
4. Click filter "Trauma". Visible: A, B, C. Hidden: D, E.
5. Click filter "Supports". Visible: D, E. Hidden: A, B, C.
6. Duration lines for any visible duration-type node remain visible; for hidden nodes they remain hidden (regression check on existing duration-line visibility behavior).

---

## Item 15 — Analytics tag rename: 'timeline' → 'lifemap'

**Goal:** App-usage analytics report under a consistent name that matches the user-facing label and the feedback URL (`feedback.html?app=lifemap`).

**What changes:**

Find both calls to `Auth.trackAppUsage` in the script. Currently:

```js
Auth.trackAppUsage('timeline', 'start');
```

and

```js
Auth.trackAppUsage('timeline', 'end', dur);
```

Change the first argument in both calls from `'timeline'` to `'lifemap'`. Final shape:

```js
Auth.trackAppUsage('lifemap', 'start');
```

and

```js
Auth.trackAppUsage('lifemap', 'end', dur);
```

**Do not touch:**
- Any other analytics call.
- The `Auth.trackAppUsage` function definition (in `auth.js`; not in scope).

**Acceptance criteria:**
1. Open Life Map with browser DevTools → Network tab. Look for the `track.php` request. Its payload should show `"app": "lifemap"` (or whatever shape the analytics endpoint uses; the key change is the value, not the schema).
2. Spend ~30 seconds in the tool, then navigate away. The `end` event also reports as `lifemap`.

**Sidecar note for Matthew (not Composer's job):**

After this ships and you confirm analytics are flowing under `lifemap`, run this one-time SQL against the production DB to retroactively unify the historical rows:

```sql
UPDATE analytics_app_usage SET app_name = 'lifemap' WHERE app_name = 'timeline';
```

Without this, your admin dashboard's "App Usage" chart will show two separate series for the same app during the transition window.

---

## Post-execution verification (Composer runs through this before declaring done)

After all seven items are implemented, perform this end-to-end walkthrough. Do not skip steps. If any step fails, halt and report which item is implicated.

1. **Cold open.** Reload the tool in a fresh tab. Page loads without console errors. Default empty state shows.
2. **Add event flow.** Add Event → Trauma (Point) → Add. Modal opens. Year field is focused and selected, showing the midpoint of the default range (2008). Type a year, e.g. `2002`. Type a title. Check "Touchstone Memory". Check "Processing Target". A custom NC: "I am defective in a way no one can see". A preset PC. SUDS 8. Body: "chest". Click Save.
3. **Re-open the same target.** The dropdown for NC shows its placeholder; the custom box shows "I am defective in a way no one can see". The PC dropdown shows the preset selection. SUDS slider shows 8. Body shows "chest". Both checkboxes are checked. Both checkboxes show ⓘ icons; hover shows tooltips.
4. **Backdrop test.** With the modal still open and unsaved edits, click the dimmed area outside the panel. Modal does not close. Click the Close button. Modal closes.
5. **Filter test.** In the sidebar, click "Targets". The trauma node is visible. Add another trauma node that is only a touchstone (not a target). Filter "Targets" again — both are visible. Filter "Supports" — both are hidden.
6. **Draft recovery test.** Without exporting, close the tab. Reopen the tool in a new tab in the same browser session. A banner appears at the top with a count of recovered events. Click Keep. Events render. The "Unsaved changes" hint is visible. Click Export JSON; file downloads.
7. **Discard test.** Add another event. Wait 3 seconds. Close the tab. Reopen. Banner appears. Click Discard. Refresh. No banner.
8. **Analytics tag.** Open DevTools Network tab. Confirm `track.php` payload uses `lifemap`, not `timeline`.
9. **Dark / light parity.** Toggle the theme via the sun/moon button. All new visual elements (draft banner, helper icons) render legibly in both modes.

If all nine pass, report DONE with a one-line summary per item.

---

## What is explicitly out of scope for this build

Composer must not, as part of this task, do any of the following — even if the changes seem related:

- Refactor `tool_timeline.html` into separate JS/CSS files.
- Touch any file other than `tool_timeline.html`.
- Modify `auth.js`, `api/analytics/track.php`, or any backend file.
- Rename the "Targets" filter button.
- Change default year-range values.
- Adjust the schema version or migration logic.
- Add new clinical fields (e.g. month granularity, undo/redo, search) — those are separate audit items not in Path A.
- Remove or alter the log-session modal's backdrop-close.
- Touch the Genogram or Brainspotting tools.
- Add new Tailwind utility classes or change the Tailwind CDN line.
- Add `eslint` / formatters / build tooling.

If during execution it becomes clear that an in-scope item requires a change in something listed above, stop and surface the conflict rather than expanding the scope.

---

*End of build spec.*
