# Genogram Genie — Build Spec (Path A)

**Target file:** `tool_genogram.html` (single file; ~2,289 lines)
**Scope:** Bugs + cheap UX wins + the privacy posture decision (matched to Life Map)
**Author of spec:** Claude (handed to Composer for execution)
**Date:** May 27, 2026

This spec is the source of truth for what to change. The audit document (`GENOGRAM_AUDIT_2026-05-27.md`) is context only. The privacy posture question (audit Item 3) has been resolved: **mirror Life Map** — never auto-load saved data; use tab-scoped `sessionStorage` for crash recovery only; offer a one-time migration banner for any genogram currently autosaved in legacy `localStorage` so existing users don't silently lose work.

Execute items in the order given. After each item, acceptance criteria must pass before moving to the next.

---

## Global guardrails (apply to every item)

1. **Only `tool_genogram.html` is modified.** No other file in the repo is touched.
2. **Do not rename existing functions, variables, or DOM ids** — except where this spec explicitly says to. Specifically: `saveToLocalStorage` keeps its name as a backward-compat alias (its implementation changes; call sites continue to use the old name).
3. **Do not refactor adjacent code.** Touch only what each item names.
4. **No new external dependencies.** No new CDN scripts, no new libraries. The tool already uses Tailwind CDN, ES modules, and inline SVG — work within that.
5. **Preserve the existing color palette.** Sage `#2C5558` / `#7CB590`, gray `#1f2937` / `#f3f4f6`, plus the role-coded relationship colors (`#06b6d4`, `#a855f7`, `#f97316`, `#ef4444`). Don't redefine these.
6. **New CSS goes inside the existing `<style>` block in `<head>`.** No new `<style>` tags except inside item-specific scope where the spec explicitly calls for it.
7. **Light-mode and dark-mode parity.** Any new visible UI element must render correctly in both. Use Tailwind `dark:` variants or the existing `.dark` class selector pattern. Don't hard-code light/dark fills.
8. **No `console.log` left in shipped code.** `console.warn` / `console.error` for actual failure paths only. Existing `DEBUG`-gated logs may stay.
9. **No changes to the `db` data model.** Field shapes for `people`, `relationships`, `emotionalLinks` are stable. New top-level fields are not added.
10. **Out-of-scope items must not be opportunistically improved**, even if they look related. If you see something else that needs fixing, leave it.

---

## Pre-flight check

Confirm:
- `tool_genogram.html` exists at the repo root.
- The file's current line count is in the ~2,290 range.
- The file contains a `<script type="module">` block defining `db`, `view`, `appState`, and functions including `saveToLocalStorage`, `loadFromLocalStorage`, `render`, `createQuadrant`, `showTooltip`, `populateExistingLinksList`, `onCanvasWheel`, `onImportFile`, `exportJSON`, `init`.

If any of these are missing, stop and report.

---

## Item 1 — XSS hardening for tooltip and existing-relationships list

**Goal:** Stop interpolating user-supplied strings (person names, notes) into `innerHTML` without escaping. A malicious or compromised JSON import currently can execute scripts in the user's browser.

**What changes:**

(a) Add a small helper function inside the `<script type="module">` block. Place it near the top of the script, just after the `generateId` / `getPerson` helpers (around line 735):

```js
/**
 * Escape a string for safe use inside innerHTML.
 * Use whenever a user-supplied string is interpolated into an HTML template.
 */
function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
```

(b) Fix the tooltip notes rendering. Find this block inside `showTooltip` (around line 1722):

```js
if (person.notes) {
    const noteHtml = person.notes.replace(/\n/g, '<br>');
    infoItems.push(`<li class="mt-2 pt-2 border-t border-gray-600"><span class="font-semibold">Notes:</span><br>${noteHtml}</li>`);
}
tooltipInfo.innerHTML = infoItems.join('');
```

Replace the `if (person.notes) { ... }` block with an escaped version. Final shape:

```js
if (person.notes) {
    const noteHtml = escapeHtml(person.notes).replace(/\n/g, '<br>');
    infoItems.push(`<li class="mt-2 pt-2 border-t border-gray-600"><span class="font-semibold">Notes:</span><br>${noteHtml}</li>`);
}
tooltipInfo.innerHTML = infoItems.join('');
```

The order matters: escape first (so `<`, `>`, etc. become entities), then replace `\n` with literal `<br>` (which is now safe because no real HTML can have been injected through `person.notes`).

(c) Also escape `tooltipName.textContent`. It's already using `textContent` so it's actually safe. **Do not change `tooltipName.textContent = person.name;` — it's correct as-is.** Leave it alone.

(d) Fix the existing-relationships list rendering. Find this block inside `populateExistingLinksList` (around line 1775):

```js
db.emotionalLinks.forEach(link => {
    const p1 = getPerson(link.p1); const p2 = getPerson(link.p2);
    if (!p1 || !p2) return;
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md';
    let text = `<strong>${p1.name} & ${p2.name}</strong>: ${link.quality}`;
    if (link.quality === 'abuse') {
        if (link.abuseDirection === 'mutual') text += ` (Mutual)`;
        else text += ` (${link.abuseDirection === 'p1_to_p2' ? p1.name + '→' + p2.name : p2.name + '→' + p1.name})`;
    }
    div.innerHTML = `<span class="text-sm text-gray-800 dark:text-gray-100">${text}</span>`;
    // ...
```

Replace the `text` construction block (the `let text = ...` through the abuse-direction conditional) with escaped versions:

```js
const p1Name = escapeHtml(p1.name);
const p2Name = escapeHtml(p2.name);
const quality = escapeHtml(link.quality);
let text = `<strong>${p1Name} & ${p2Name}</strong>: ${quality}`;
if (link.quality === 'abuse') {
    if (link.abuseDirection === 'mutual') {
        text += ` (Mutual)`;
    } else {
        text += ` (${link.abuseDirection === 'p1_to_p2' ? `${p1Name}→${p2Name}` : `${p2Name}→${p1Name}`})`;
    }
}
div.innerHTML = `<span class="text-sm text-gray-800 dark:text-gray-100">${text}</span>`;
```

**Do not touch:**
- `tooltipName.textContent = person.name` — already safe.
- The SVG-text element creation in `drawPerson` (uses `textContent` via `.textContent = formatPersonLabel(person)`) — already safe.
- Any other `innerHTML` assignment unless it interpolates user-supplied strings.
- Modal form rendering (the modal uses input fields, not innerHTML).

**Acceptance criteria:**
1. Create a person whose Name field contains: `<script>alert('xss')</script>Bob`. Save. Hover the person — tooltip shows the literal text including the visible `<script>` characters and "Bob" — no script alert fires.
2. Edit the same person, paste into Notes: `<img src=x onerror=alert(1)>`. Save. Hover — notes render the literal text including angle brackets, no alert.
3. Open "Manage Relationships" and add an emotional link between two people, where one person's name contains HTML-special characters. The existing-relationships list shows the names as plain text.
4. Existing genograms (no script-y content) render exactly as before — no visual regression on the tooltip or relationships list.

---

## Item 2 — Fix "other / nonbinary" gender quadrants

**Goal:** Clinical indicator quadrants (top-left / top-right / bottom-left / bottom-right shaded triangles) render correctly for people with `gender === 'other'`. Currently they don't render because the template literals are missing `${...}` interpolation around `s`.

**What changes:**

Find the `case 'other':` block inside `createQuadrant` (around line 964):

```js
case 'other':
    if (quadrant === 'tl') d = `M 0 0 L 0 -s L -s 0 Z`;
    if (quadrant === 'tr') d = `M 0 0 L 0 -s L s 0 Z`;
    if (quadrant === 'bl') d = `M 0 0 L -s 0 L 0 s Z`;
    if (quadrant === 'br') d = `M 0 0 L s 0 L 0 s Z`;
    break;
```

Replace with the correctly-interpolated paths:

```js
case 'other':
    if (quadrant === 'tl') d = `M 0 0 L 0 ${-s} L ${-s} 0 Z`;
    if (quadrant === 'tr') d = `M 0 0 L 0 ${-s} L ${s} 0 Z`;
    if (quadrant === 'bl') d = `M 0 0 L ${-s} 0 L 0 ${s} Z`;
    if (quadrant === 'br') d = `M 0 0 L ${s} 0 L 0 ${s} Z`;
    break;
```

**Do not touch:**
- The `male` or `female` cases in the same function.
- The `getShapePath` function (which renders the diamond outline itself for `other` — that's correct and unrelated).

**Acceptance criteria:**
1. Add a person with Gender = "Other / Nonbinary". Check all four clinical indicators (Trauma, Mental Health, Substance Use, Physical Ailment). Save.
2. The four triangular quadrants render filled inside the diamond shape on the canvas. The top-left triangle is in the top-left quarter of the diamond, etc.
3. Toggle indicators on/off — quadrants appear/disappear correctly.
4. Verify male (square) and female (circle) quadrants still render correctly — no regression.

---

## Item 3 — sessionStorage drafts + legacy localStorage migration + beforeunload guard

**Goal:** Match the Life Map privacy posture. Stop auto-loading saved genograms. Move autosave to tab-scoped `sessionStorage` for crash recovery only. On reload, offer a Keep/Discard banner instead of silently restoring. One-time migration for users who already have genograms in legacy `localStorage`. Add a "dirty state" sidebar hint and a `beforeunload` warning if there's unsaved work.

This is the largest item. Implement carefully.

**Critical guardrails specific to this item:**
- The new draft key MUST be `sessionStorage`, never `localStorage`. Tab-scoped is the privacy-correct choice.
- The legacy `localStorage` key (`genogramGenieSaveData`) must NOT be silently deleted on first load. It is only cleared after the user explicitly chooses Keep or Discard in the migration banner.
- The `saveToLocalStorage` function name is kept as a backward-compat alias. Its existing ~10 call sites do not need to be touched. The implementation changes; the name does not.

**What changes:**

(a) Add CSS for the recovery banner and the dirty-state hint inside the existing `<style>` block in `<head>`. Place near the other toast/banner CSS (after the `.toast` rules around line 178):

```css
/* Draft recovery / migration banner — matches Life Map's pattern */
#genogram-draft-banner {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.7rem 1rem;
    z-index: 200;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    font-size: 0.85rem;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    max-width: calc(100vw - 2rem);
    font-family: 'Inter', sans-serif;
}
.dark #genogram-draft-banner {
    background: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
}
#genogram-draft-banner .draft-banner-text {
    line-height: 1.4;
}
#genogram-draft-banner button {
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #1f2937;
    font-size: 0.8rem;
    font-family: inherit;
    white-space: nowrap;
}
.dark #genogram-draft-banner button {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
}
#genogram-draft-banner button.draft-banner-primary {
    background: #2C5558;
    color: #fff;
    border-color: #2C5558;
}
.dark #genogram-draft-banner button.draft-banner-primary {
    background: #2C5558;
    color: #fff;
    border-color: #2C5558;
}

/* Sidebar dirty-state hint */
.save-state-hint {
    font-size: 0.72rem;
    line-height: 1.4;
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: rgba(0,0,0,0.02);
    color: #6b7280;
    margin-top: 0.75rem;
    font-family: 'Inter', sans-serif;
}
.dark .save-state-hint {
    border-color: #374151;
    background: rgba(255,255,255,0.03);
    color: #9ca3af;
}
.save-state-hint.is-dirty {
    border-color: rgba(217,119,87,0.45);
    background: rgba(217,119,87,0.08);
    color: #c2410c;
}
.dark .save-state-hint.is-dirty {
    color: #fdba74;
}
```

(b) Replace the existing sidebar copy. Find this line in the sidebar HTML (around line 309):

```html
<div class="text-xs text-gray-500 dark:text-gray-400 mt-3">
    Autosaves on this device while you work.
</div>
```

Replace with:

```html
<div id="save-state-hint" class="save-state-hint">Working in this tab only. Export JSON to keep your genogram.</div>
```

(c) Add new state variables and helper functions inside the `<script type="module">` block. Place them in a new section right BEFORE the existing `// --- Persistence ---` section banner (which is around line 1897), after the confirm-modal functions:

```js
// ============================================
// DRAFT RECOVERY (sessionStorage, tab-scoped)
// Mirrors the Life Map pattern: never auto-load on boot; offer a Keep/Discard
// banner if a draft exists. One-time migration honours any genogram that was
// autosaved to the legacy localStorage key before this pattern was adopted.
// ============================================
const GENOGRAM_DRAFT_KEY = 'bet-genogram-draft';
const GENOGRAM_LEGACY_KEY = 'genogramGenieSaveData';
const GENOGRAM_DRAFT_DEBOUNCE_MS = 2000;
let _draftPersistTimer = null;
let hasUnsavedChanges = false;

function setDirtyState(isDirty) {
    hasUnsavedChanges = isDirty;
    updateSaveStateHint();
}

function updateSaveStateHint() {
    const hint = document.getElementById('save-state-hint');
    if (!hint) return;
    hint.classList.toggle('is-dirty', hasUnsavedChanges);
    hint.textContent = hasUnsavedChanges
        ? 'Unsaved changes in this tab. Export JSON to keep this genogram.'
        : 'Working in this tab only. Export JSON to keep your genogram.';
}

function persistDraft() {
    if (_draftPersistTimer) clearTimeout(_draftPersistTimer);
    _draftPersistTimer = setTimeout(() => {
        try {
            sessionStorage.setItem(GENOGRAM_DRAFT_KEY, JSON.stringify(db));
        } catch (err) {
            console.warn('Genogram draft persist failed:', err);
        }
    }, GENOGRAM_DRAFT_DEBOUNCE_MS);
}

function clearDraft() {
    if (_draftPersistTimer) {
        clearTimeout(_draftPersistTimer);
        _draftPersistTimer = null;
    }
    try {
        sessionStorage.removeItem(GENOGRAM_DRAFT_KEY);
    } catch (err) {
        // sessionStorage may be unavailable in some embedded contexts; silent.
    }
}

function markGenogramChanged() {
    setDirtyState(true);
    persistDraft();
}

function maybeOfferDraftRecovery() {
    // Prefer the in-tab sessionStorage draft. Fall back to a one-time legacy
    // localStorage migration if no session draft exists.
    let draft = null;
    let source = null;
    try {
        const raw = sessionStorage.getItem(GENOGRAM_DRAFT_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.people) && parsed.people.length > 0) {
                draft = parsed;
                source = 'session';
            } else if (parsed) {
                clearDraft();
            }
        }
    } catch (err) {
        clearDraft();
    }

    if (!draft) {
        try {
            const legacyRaw = localStorage.getItem(GENOGRAM_LEGACY_KEY);
            if (legacyRaw) {
                const parsed = JSON.parse(legacyRaw);
                if (parsed && Array.isArray(parsed.people) && parsed.people.length > 0) {
                    draft = parsed;
                    source = 'legacy';
                } else {
                    try { localStorage.removeItem(GENOGRAM_LEGACY_KEY); } catch (e) {}
                }
            }
        } catch (err) {
            try { localStorage.removeItem(GENOGRAM_LEGACY_KEY); } catch (e) {}
        }
    }

    if (draft) {
        showDraftRecoveryBanner(draft, source);
    }
}

function showDraftRecoveryBanner(draft, source) {
    if (document.getElementById('genogram-draft-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'genogram-draft-banner';

    const peopleCount = draft.people.length;
    const peopleWord = peopleCount === 1 ? 'person' : 'people';
    const headline = source === 'legacy'
        ? `Found an autosaved genogram from before this update (${peopleCount} ${peopleWord}).`
        : `Recovered unsaved genogram from this tab (${peopleCount} ${peopleWord}).`;

    const textSpan = document.createElement('span');
    textSpan.className = 'draft-banner-text';
    textSpan.textContent = headline;

    const keepBtn = document.createElement('button');
    keepBtn.id = 'draft-banner-keep';
    keepBtn.className = 'draft-banner-primary';
    keepBtn.textContent = 'Keep';

    const discardBtn = document.createElement('button');
    discardBtn.id = 'draft-banner-discard';
    discardBtn.textContent = 'Discard';

    banner.appendChild(textSpan);
    banner.appendChild(keepBtn);
    banner.appendChild(discardBtn);
    document.body.appendChild(banner);

    keepBtn.addEventListener('click', () => {
        try {
            db.people = (draft.people || []).map(p => ({ ...p, issues: normalizeIssues(p.issues) }));
            db.relationships = draft.relationships || [];
            db.emotionalLinks = draft.emotionalLinks || [];
        } catch (err) {
            console.error('Failed to apply recovered genogram:', err);
            showToast('Could not restore genogram.', 'error');
            banner.remove();
            return;
        }
        if (source === 'legacy') {
            try { localStorage.removeItem(GENOGRAM_LEGACY_KEY); } catch (e) {}
        }
        render();
        centerView();
        setDirtyState(true);
        banner.remove();
        showToast('Genogram restored. Export JSON to keep it.', 'success');
    });

    discardBtn.addEventListener('click', () => {
        if (source === 'legacy') {
            try { localStorage.removeItem(GENOGRAM_LEGACY_KEY); } catch (e) {}
        } else {
            clearDraft();
        }
        banner.remove();
    });
}
```

(d) Change the existing `saveToLocalStorage` function (around line 1899) to be a backward-compat alias for the new pattern:

```js
function saveToLocalStorage() {
    // Legacy name kept for backward compatibility with existing call sites.
    // Routes through the new draft/dirty pattern; no longer writes to localStorage.
    markGenogramChanged();
}
```

(e) Change the existing `loadFromLocalStorage` function (around line 1906) to a no-op. **Do not delete it** — leaving the function in place avoids any indirect breakage; the body just becomes empty so it does nothing:

```js
function loadFromLocalStorage() {
    // No-op: as of the privacy posture change, saved data is never auto-loaded.
    // Recovery flows through maybeOfferDraftRecovery() called from init().
}
```

(f) In the `init` function, find the existing `loadFromLocalStorage();` call (around line 2034). Leave the call where it is (so it harmlessly does nothing). At the very END of `init`, AFTER the existing `centerView(); render();` (around line 2175–2176), add:

```js
maybeOfferDraftRecovery();
```

So the tail of `init` reads:

```js
centerView();
render();
maybeOfferDraftRecovery();
}
```

(g) Update `exportJSON` to clear the draft after a successful export. Find (around line 1368):

```js
function exportJSON() {
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url; a.download = `genogram_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast('Genogram exported as JSON', 'success');
}
```

Replace with (filename change is Item 18 — leave that line as-is here for clarity; Item 18 will revisit the filename):

```js
function exportJSON() {
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url; a.download = `genogram_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setDirtyState(false);
    clearDraft();
    showToast('Genogram exported as JSON', 'success');
}
```

(h) Update `onImportFile` to mark clean state and clear the draft after a successful import. Find (around line 1395):

```js
if (newDb && Array.isArray(newDb.people) && Array.isArray(newDb.relationships)) {
    db.people = newDb.people;
    db.relationships = newDb.relationships;
    db.emotionalLinks = newDb.emotionalLinks || []; 
    saveToLocalStorage();
    render();
    centerView();
    showToast('Genogram imported successfully', 'success');
}
```

Replace with:

```js
if (newDb && Array.isArray(newDb.people) && Array.isArray(newDb.relationships)) {
    db.people = newDb.people;
    db.relationships = newDb.relationships;
    db.emotionalLinks = newDb.emotionalLinks || [];
    render();
    centerView();
    setDirtyState(false);
    clearDraft();
    showToast('Genogram imported successfully', 'success');
}
```

Note: the previous `saveToLocalStorage()` call is removed because an import IS the user's authoritative save state. The new pattern starts fresh and clean from this point.

(i) Update the existing `beforeunload` listener at the bottom of the script (around line 2282) to also warn about unsaved work. Find:

```js
window.addEventListener('beforeunload', () => {
    const dur = Math.round((Date.now() - _genogramOpenedAt) / 1000);
    Auth.trackAppUsage('genogram', 'end', dur);
});
```

Replace with:

```js
window.addEventListener('beforeunload', (event) => {
    const dur = Math.round((Date.now() - _genogramOpenedAt) / 1000);
    Auth.trackAppUsage('genogram', 'end', dur);
    if (!hasUnsavedChanges) return;
    event.preventDefault();
    event.returnValue = '';
});
```

**Do not touch:**
- Any of the ~10 existing call sites of `saveToLocalStorage()` throughout the script. They continue to work via the alias.
- The `normalizeIssues` function.
- The PNG export logic (separate concern).
- The `Auth.trackAppUsage` calls — analytics behavior is unchanged.

**Acceptance criteria:**

For a fresh-install user (no localStorage data, no sessionStorage draft):
1. Open the tool. Page loads to an empty canvas. No banner. Sidebar hint reads "Working in this tab only. Export JSON to keep your genogram."
2. Add a person. The sidebar hint changes to "Unsaved changes in this tab..." and adopts the dirty styling (orange-ish accent).
3. Without exporting, close the tab. Browser shows the standard "Leave site?" confirmation. Choose Leave.
4. Reopen the tool in a new tab in the same browser session. A banner appears at the top: "Recovered unsaved genogram from this tab (1 person)." with Keep and Discard buttons.
5. Click Keep. The person reappears. Sidebar hint shows "Unsaved changes…" (dirty styling).
6. Click Export JSON. File downloads. Sidebar hint returns to clean state ("Working in this tab only…").
7. Refresh the page. No banner appears. Canvas is empty (consistent with "never auto-load").
8. DevTools: confirm `sessionStorage` has no `bet-genogram-draft` key. `localStorage` has no `genogramGenieSaveData` key. (Only `genogram-theme` may exist in localStorage — that's intentional theme persistence.)

For a user upgrading with legacy data:
9. Before this change ships, with the old version: add several people, close the tab. (Legacy `localStorage[genogramGenieSaveData]` is now populated.)
10. After the change ships, open the tool. A banner appears: "Found an autosaved genogram from before this update (N people)." with Keep and Discard.
11. Click Keep. People appear. Sidebar shows "Unsaved changes…". DevTools shows `localStorage[genogramGenieSaveData]` is now gone. `sessionStorage[bet-genogram-draft]` is populated (after ~2s debounce) or empty (if no further edits).
12. Repeat from step 9 with a fresh legacy save. Click Discard instead. Canvas stays empty. DevTools shows the legacy localStorage key is gone.
13. Refresh after Discard. No banner. Canvas empty. Legacy key still gone.

For the import flow:
14. Import any valid JSON file. Toast confirms success. Sidebar hint is clean (not dirty). Refresh — no banner (clearDraft ran on import).

---

## Item 4 — Wheel-zoom rewrite (modifier required, gentler step, fixed math, bounded)

**Goal:** Combines audit items 4, 6, 7, 9 — all changes touch the same function. Wheel events without a modifier scroll the page naturally; holding `Ctrl` or `Cmd` plus wheel zooms. Zoom step is 5% per tick. Zoom is bounded between 0.1× and 5×. Zoom math correctly anchors the cursor position (standard zoom-to-point formula).

**What changes:**

Find the existing `onCanvasWheel` (around line 1308):

```js
function onCanvasWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const zoomFactor = e.deltaY < 0 ? (1 + zoomSpeed) : (1 - zoomSpeed);
    const pt = getSVGPoint(e.clientX, e.clientY);
    view.zoom *= zoomFactor;
    view.panX = view.panX * zoomFactor + (pt.x * (1 - zoomFactor) * view.zoom);
    view.panY = view.panY * zoomFactor + (pt.y * (1 - zoomFactor) * view.zoom);
    render();
}
```

Replace with:

```js
function onCanvasWheel(e) {
    // Without a modifier, let the browser handle natural scroll over the canvas.
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const zoomSpeed = 0.05;
    const intended = view.zoom * (e.deltaY < 0 ? (1 + zoomSpeed) : (1 - zoomSpeed));
    const newZoom = Math.max(0.1, Math.min(5, intended));
    const factor = newZoom / view.zoom;
    if (factor === 1) return;
    // Standard zoom-to-cursor: keep the point under the cursor anchored.
    view.panX = e.clientX - (e.clientX - view.panX) * factor;
    view.panY = e.clientY - (e.clientY - view.panY) * factor;
    view.zoom = newZoom;
    render();
}
```

Also bound the sidebar `zoom()` function with the same min/max. Find (around line 1332):

```js
function zoom(factor) {
    const screenWidth = canvas.clientWidth;
    const screenHeight = canvas.clientHeight;
    const pt = getSVGPoint(screenWidth / 2, screenHeight / 2);
    view.zoom *= factor;
    view.panX = view.panX * factor + (pt.x * (1 - factor) * view.zoom);
    view.panY = view.panY * factor + (pt.y * (1 - factor) * view.zoom);
    render();
}
```

Replace with:

```js
function zoom(factor) {
    const newZoom = Math.max(0.1, Math.min(5, view.zoom * factor));
    const actualFactor = newZoom / view.zoom;
    if (actualFactor === 1) return;
    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    view.panX = centerX - (centerX - view.panX) * actualFactor;
    view.panY = centerY - (centerY - view.panY) * actualFactor;
    view.zoom = newZoom;
    render();
}
```

**Do not touch:**
- The `centerView` function.
- The `getSVGPoint` helper.
- Pan handlers.
- The sidebar zoom-in / zoom-out button bindings (still call `zoom(1.2)` / `zoom(0.8)`).

**Acceptance criteria:**
1. Open the tool, scroll the mouse wheel (or two-finger swipe on trackpad) over the canvas — page or canvas scrolls; the timeline does NOT zoom.
2. Hold `Cmd` (Mac) or `Ctrl` (Win/Linux) and scroll — view zooms in/out smoothly at ~5% per tick.
3. With cursor over a specific person, zoom in with Cmd+scroll. The person stays roughly under the cursor (not drifting across the screen).
4. Try to zoom in indefinitely — view stops at ~5× (people are large but visible).
5. Try to zoom out indefinitely — view stops at ~0.1× (everything tiny but visible).
6. Sidebar Zoom In / Zoom Out buttons still work, also respect the bounds. After repeated clicks, view stops at the limits instead of disappearing.

---

## Item 5 — Replace native `confirm()` in import with the custom confirm modal

**Goal:** The import flow's "this will replace your current genogram" prompt currently uses the browser's native `confirm()`. Replace with the app's existing `showConfirmModal` for visual consistency.

**What changes:**

The import flow needs to hold the user's selected file across the modal interaction (since the user might choose Cancel). Add a small state variable, then route through the confirm modal.

(a) Add a module-level variable near the other persistence state (e.g. just after the `_draftPersistTimer` declaration from Item 3):

```js
let _pendingImportText = null;
```

(b) Replace the existing `onImportFile` function (around line 1383). Find:

```js
function onImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Show confirmation if there's existing data
    if (db.people.length > 0) {
        const confirmed = confirm('Importing will replace your current genogram. This cannot be undone. Continue?');
        if (!confirmed) { e.target.value = null; return; }
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const content = event.target.result;
            const newDb = JSON.parse(content);
            if (newDb && Array.isArray(newDb.people) && Array.isArray(newDb.relationships)) {
                db.people = newDb.people;
                db.relationships = newDb.relationships;
                db.emotionalLinks = newDb.emotionalLinks || [];
                render();
                centerView();
                setDirtyState(false);
                clearDraft();
                showToast('Genogram imported successfully', 'success');
            } else {
                showToast('Invalid file format — expected a genogram JSON file.', 'error');
            }
        } catch (err) {
            showToast('Could not read file: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = null;
}
```

Replace with:

```js
function onImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        if (db.people.length > 0) {
            _pendingImportText = content;
            showConfirmModal(
                'import-replace',
                null,
                'Replace current genogram?',
                'Importing will replace the genogram currently on the canvas. This cannot be undone. Continue?'
            );
        } else {
            applyImportedJson(content);
        }
    };
    reader.readAsText(file);
    e.target.value = null;
}

function applyImportedJson(content) {
    try {
        const newDb = JSON.parse(content);
        if (newDb && Array.isArray(newDb.people) && Array.isArray(newDb.relationships)) {
            db.people = newDb.people;
            db.relationships = newDb.relationships;
            db.emotionalLinks = newDb.emotionalLinks || [];
            render();
            centerView();
            setDirtyState(false);
            clearDraft();
            showToast('Genogram imported successfully', 'success');
        } else {
            showToast('Invalid file format — expected a genogram JSON file.', 'error');
        }
    } catch (err) {
        showToast('Could not read file: ' + err.message, 'error');
    }
}
```

(c) Extend `handleConfirmFormSubmit` to handle the new `import-replace` action. Find the existing function (around line 1876):

```js
function handleConfirmFormSubmit(e) {
    e.preventDefault();
    const action = confirmActionInput.value; const targetId = confirmTargetIdInput.value;
    if (action === 'delete-person') {
        // ...
    } else if (action === 'reset-genogram') {
        // ...
    }
    hideConfirmModal();
}
```

Add a new `else if` branch for `import-replace`. Final shape (just the relevant additions; the existing `delete-person` and `reset-genogram` branches stay intact):

```js
function handleConfirmFormSubmit(e) {
    e.preventDefault();
    const action = confirmActionInput.value; const targetId = confirmTargetIdInput.value;
    if (action === 'delete-person') {
        // ... existing logic unchanged ...
    } else if (action === 'reset-genogram') {
        // ... existing logic unchanged ...
    } else if (action === 'import-replace') {
        if (_pendingImportText !== null) {
            const content = _pendingImportText;
            _pendingImportText = null;
            applyImportedJson(content);
        }
    }
    hideConfirmModal();
}
```

(d) Clear the pending import text on Cancel too. The existing `confirmModalCancelBtn.addEventListener('click', hideConfirmModal);` (around line 2166) needs to also clear `_pendingImportText`. The simplest place: extend `hideConfirmModal`:

```js
function hideConfirmModal() {
    confirmModal.classList.add('hidden');
    _pendingImportText = null;
}
```

**Do not touch:**
- The `exportJSON` function.
- The `delete-person` or `reset-genogram` branches in `handleConfirmFormSubmit`.
- The confirm modal HTML structure.

**Acceptance criteria:**
1. With at least one person on the canvas, click Import (file picker). Select a valid genogram JSON file. The app's confirm modal appears (matching the visual style of the Delete-Person modal), titled "Replace current genogram?" with a Cancel and Confirm button.
2. Click Cancel. Modal closes. Existing canvas is unchanged. No toast.
3. Click Import again, pick the same file. Modal appears again. Click Confirm. Import proceeds: canvas replaced with new data, toast confirms success.
4. With an empty canvas, click Import, pick a file. No confirm modal — import proceeds directly (existing behavior preserved when nothing to lose).
5. With a malformed JSON file, the error toast still appears.

---

## Item 6 — Esc closes all modals

**Goal:** Standard keyboard expectation. Pressing `Escape` closes whichever modal is open.

The tool has four modals: `person-modal`, `relationship-modal`, `structural-relationship-modal`, `confirm-modal`. Each has its own hide function: `hideModal`, `hideRelationshipModal`, `hideStructuralRelationshipModal`, `hideConfirmModal`.

**What changes:**

Extend the existing `onWindowKeyDown` function (around line 1284). Find:

```js
function onWindowKeyDown(e) {
    if (e.code === 'Space' && modal.classList.contains('hidden') && relationshipModal.classList.contains('hidden') && confirmModal.classList.contains('hidden')) {
        e.preventDefault();
        view.isSpacePressed = true;
        canvas.style.cursor = 'grab';
    }
    if ((e.code === 'Delete' || e.code === 'Backspace') && appState.selectedPersonId) {
        if (modal.classList.contains('hidden') && relationshipModal.classList.contains('hidden') && confirmModal.classList.contains('hidden')) {
            e.preventDefault();
            const person = getPerson(appState.selectedPersonId);
            showConfirmModal('delete-person', appState.selectedPersonId, 'Delete Person?', `Are you sure you want to remove ${person.name}? This cannot be undone.`);
        }
    }
}
```

Add Esc handling at the START of the function (so Esc takes precedence over Space-pan when a modal is open). Final shape:

```js
function onWindowKeyDown(e) {
    if (e.key === 'Escape') {
        // Close the topmost open modal. Confirm modal sits highest (it can appear over others).
        if (!confirmModal.classList.contains('hidden')) {
            hideConfirmModal();
            e.preventDefault();
            return;
        }
        if (!structuralRelationshipModal.classList.contains('hidden')) {
            hideStructuralRelationshipModal();
            e.preventDefault();
            return;
        }
        if (!relationshipModal.classList.contains('hidden')) {
            hideRelationshipModal();
            e.preventDefault();
            return;
        }
        if (!modal.classList.contains('hidden')) {
            hideModal();
            e.preventDefault();
            return;
        }
        // No modal open — let Esc bubble normally.
        return;
    }
    if (e.code === 'Space' && modal.classList.contains('hidden') && relationshipModal.classList.contains('hidden') && confirmModal.classList.contains('hidden')) {
        e.preventDefault();
        view.isSpacePressed = true;
        canvas.style.cursor = 'grab';
    }
    if ((e.code === 'Delete' || e.code === 'Backspace') && appState.selectedPersonId) {
        if (modal.classList.contains('hidden') && relationshipModal.classList.contains('hidden') && confirmModal.classList.contains('hidden')) {
            e.preventDefault();
            const person = getPerson(appState.selectedPersonId);
            showConfirmModal('delete-person', appState.selectedPersonId, 'Delete Person?', `Are you sure you want to remove ${person.name}? This cannot be undone.`);
        }
    }
}
```

**Do not touch:**
- The existing Space and Delete/Backspace branches.
- The keyup handler.

**Acceptance criteria:**
1. Open the Add Person modal. Press Esc. Modal closes; canvas state unchanged.
2. Open Manage Relationships. Press Esc. Modal closes.
3. Right-click a person → Edit Person. Press Esc. Modal closes.
4. Click Reset / New. Confirmation modal appears. Press Esc. Confirmation closes (no reset happens).
5. With Manage Relationships open, trigger a confirm action (e.g. import a new file with existing data on canvas). The confirm modal appears over the relationships modal. Press Esc once — confirm modal closes, relationships modal still open. Press Esc again — relationships modal closes.
6. With no modal open, pressing Esc does nothing (no errors). Space-pan and Delete shortcuts still work normally.

---

## Item 7 — Reset / New offers Export & Reset

**Goal:** The Reset confirmation should give clinicians the option to export their work first instead of just confirming destruction. Reduces accidental data loss.

**What changes:**

(a) Add a CSS rule for the new third-button styling inside the existing `<style>` block (near the other modal/button styles):

```css
.confirm-modal-export-btn {
    background-color: #ffffff;
    color: #2C5558;
    border: 1px solid #2C5558;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    margin-right: 0.5rem;
}
.confirm-modal-export-btn:hover {
    background-color: #f0f9f5;
}
.dark .confirm-modal-export-btn {
    background-color: #1f2937;
    color: #7CB590;
    border-color: #4b5563;
}
.dark .confirm-modal-export-btn:hover {
    background-color: #374151;
}
```

(b) Extend the confirm modal HTML to add an Export & Reset button. Find the confirm modal's button row (around line 677):

```html
<div class="mt-6 flex justify-end space-x-3">
    <button type="button" id="confirm-modal-cancel-btn" class="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
        Cancel
    </button>
    <button type="submit" id="confirm-modal-confirm-btn" class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
        Confirm
    </button>
</div>
```

Replace with:

```html
<div class="mt-6 flex justify-end items-center space-x-3">
    <button type="button" id="confirm-modal-export-btn" class="confirm-modal-export-btn hidden">
        Export & Continue
    </button>
    <button type="button" id="confirm-modal-cancel-btn" class="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
        Cancel
    </button>
    <button type="submit" id="confirm-modal-confirm-btn" class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
        Confirm
    </button>
</div>
```

(c) Wire the button in `init`. Add a new DOM reference near the others (around line 2001):

```js
let confirmModalExportBtn;
```

And inside `init`'s DOM assignment block (where the other confirm-modal elements are assigned, around line 2001):

```js
confirmModalExportBtn = document.getElementById('confirm-modal-export-btn');
```

Then add a click listener for the export button. Add to `init` near the other confirm-modal listeners (around line 2166):

```js
confirmModalExportBtn.addEventListener('click', () => {
    const action = confirmActionInput.value;
    if (action === 'reset-genogram') {
        exportJSON();
        // Submit the form to proceed with reset after the export
        confirmForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
});
```

(d) Show the Export & Continue button only when the confirm action is `reset-genogram`. Update `showConfirmModal` (around line 1870):

```js
function showConfirmModal(action, targetId, title, message) {
    confirmActionInput.value = action; confirmTargetIdInput.value = targetId;
    confirmModalTitle.textContent = title; confirmModalMessage.textContent = message;
    if (confirmModalExportBtn) {
        confirmModalExportBtn.classList.toggle('hidden', action !== 'reset-genogram');
    }
    confirmModal.classList.remove('hidden');
}
```

**Do not touch:**
- The Confirm button's submit behavior.
- The Cancel button.
- The `delete-person` and `import-replace` flows (the export button is hidden for those).

**Acceptance criteria:**
1. With several people on the canvas, click Reset / New. Confirmation modal appears with three buttons: "Export & Continue", "Cancel", "Confirm".
2. Click Export & Continue. JSON file downloads. Modal closes. Canvas is now empty.
3. Click Reset / New again on an empty canvas. Modal appears the same — Export & Continue button is still visible (acceptable; exporting an empty genogram produces an empty file).
4. Trigger a Delete Person confirmation. The modal appears with only Cancel and Confirm — no Export & Continue button.
5. Trigger an Import-replace confirmation. The modal appears with only Cancel and Confirm — no Export & Continue button.
6. Esc still closes the modal (regression check on Item 6).

---

## Item 8 — Notes textarea grows to 6 rows

**Goal:** Three rows is too small for substantive clinical notes. Six is more comfortable.

**What changes:**

Find the Notes textarea in the person modal HTML (around line 527):

```html
<textarea id="notes" rows="3" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g., Estranged since 2010..."></textarea>
```

Change `rows="3"` to `rows="6"`.

**Acceptance criteria:**
1. Open the Add Person modal. Notes textarea is visibly taller (roughly twice the previous height).
2. Modal still fits comfortably on a typical laptop screen.

---

## Item 9 — Help tooltip mentions Delete/Backspace shortcut

**Goal:** The help tooltip already documents the Spacebar pan and click-to-select shortcuts but doesn't mention that pressing Delete/Backspace removes the selected person. Document it.

**What changes:**

Find the help tooltip's `<ul>` (around line 394):

```html
<ul class="list-disc list-inside space-y-1">
    <li>Click 'Add New Person' or right-click the canvas.</li>
    <li>Right-click a person to edit, or add parents, partners, and children.</li>
    <li>Use 'Manage Relationships' to add emotional links (e.g., Close, Hostile).</li>
    <li>Drag people to rearrange.</li>
    <li>Left-click and drag the canvas to pan.</li>
    <li>Hold <span class="font-mono bg-gray-600 px-1 rounded">Spacebar</span> and drag to pan without selecting people.</li>
    <li>Left-click to select a person, then press 'Delete' to remove.</li>
</ul>
```

The last list item already says "press 'Delete' to remove" — but visually doesn't style 'Delete' as a key the way Spacebar is styled. Update for consistency. Replace the last two `<li>` items with:

```html
<li>Hold <span class="font-mono bg-gray-600 px-1 rounded">Space</span> and drag to pan without selecting people.</li>
<li>Select a person and press <span class="font-mono bg-gray-600 px-1 rounded">Delete</span> or <span class="font-mono bg-gray-600 px-1 rounded">Backspace</span> to remove.</li>
<li>Press <span class="font-mono bg-gray-600 px-1 rounded">Esc</span> to close any open modal.</li>
<li>Hold <span class="font-mono bg-gray-600 px-1 rounded">⌘</span> / <span class="font-mono bg-gray-600 px-1 rounded">Ctrl</span> and scroll to zoom over the canvas.</li>
```

Also shortened "Spacebar" to "Space" for symmetry with the other keys.

**Do not touch:**
- The Spacebar handler logic.
- The Esc handler logic from Item 6.

**Acceptance criteria:**
1. Open the help tooltip (? icon top-right of canvas). The list shows the new Delete/Backspace, Esc, and Cmd/Ctrl zoom hints with the same key-pill styling as Space.
2. Tooltip still fits in the existing tooltip container without overflow.

---

## Item 10 — Export filename includes client name when known

**Goal:** Match Life Map's filename pattern. Currently `genogram_{date}.json`; ideally `genogram_{clientSlug}_{date}.json` when one person is marked `isClient`.

**What changes:**

Find `exportJSON` (now-updated from Item 3, around line 1368). Find the line:

```js
a.href = url; a.download = `genogram_${new Date().toISOString().slice(0, 10)}.json`;
```

Replace with:

```js
const client = db.people.find(p => p.isClient);
const clientSlug = (client && client.name)
    ? client.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') || 'Unnamed'
    : 'Unnamed';
a.href = url; a.download = `genogram_${clientSlug}_${new Date().toISOString().slice(0, 10)}.json`;
```

The regex strips characters that aren't filename-safe.

**Do not touch:**
- The rest of `exportJSON`.
- The PNG export filename (separate concern; can be matched later).

**Acceptance criteria:**
1. With no person marked as client (or no people), export. Filename is `genogram_Unnamed_2026-05-27.json`.
2. With one person named "Jane Doe" set as client, export. Filename is `genogram_Jane_Doe_2026-05-27.json`.
3. With a client named "Dr. María-Eugenia O'Brien", export. Filename is `genogram_DrMaraEugeniaOBrien_2026-05-27.json` (special characters stripped; underscores preserved for spaces).
4. Filename slug never contains spaces or special characters that could break URL-encoding on case management systems.

---

## Post-execution verification (Composer runs this before declaring done)

After all ten items are implemented, walk through these checks. Halt and report on any failure.

1. **Cold open.** Reload in a fresh tab (no prior data). No console errors. Canvas empty. Sidebar hint reads "Working in this tab only…". No banner.
2. **Dirty-state hint.** Add a person. Sidebar hint changes to "Unsaved changes in this tab…" with the dirty styling. Export JSON. Hint returns to clean state. File downloaded uses `genogram_Unnamed_<date>.json` (no client set).
3. **Set client + export.** Right-click a person → Set as Client. Export JSON again. Filename now includes the client's name slug.
4. **Draft recovery.** Add another person. Close the tab. Reopen. Banner appears: "Recovered unsaved genogram from this tab (N people)." Click Keep. People come back. Hint shows dirty. Refresh. No banner (sessionStorage cleared on… wait — actually, refresh KEEPS sessionStorage in the same tab. So another banner WILL appear on F5. That's by design — sessionStorage scope is the tab, not the page load.) Discard this time. Canvas empties.
5. **Legacy migration.** (If you have a way to set `localStorage[genogramGenieSaveData]` manually via DevTools, do so before opening the tool.) Open the tool. Banner reads "Found an autosaved genogram from before this update (N people)." Keep — people restored, legacy key gone. Discard — legacy key gone, canvas empty.
6. **XSS test.** Add a person whose Name is `<script>alert(1)</script>`. Save. Hover the person — no alert; tooltip shows the literal text.
7. **Other-gender quadrants.** Add a person with Gender = "Other / Nonbinary", check all four issue boxes. Quadrant triangles render inside the diamond shape.
8. **Wheel-zoom.** Two-finger scroll over the canvas — no zoom. Cmd+scroll — smooth zoom, cursor anchor stays. Zoom in repeatedly — view stops at ~5×. Sidebar Zoom In does the same.
9. **Esc closes modals.** Open Add Person, press Esc → closes. Open Manage Relationships, press Esc → closes. Open the Reset confirmation, press Esc → closes (no reset). Open Manage Relationships, then trigger a Delete confirmation over it. Esc closes the confirm first, then the manage modal on the next Esc.
10. **Import flow.** Import a JSON over an existing canvas. Custom confirm modal appears (matches Delete style). Confirm replaces. Cancel preserves.
11. **Reset Export-then-Reset.** Click Reset. Modal has three buttons. Export & Continue — file downloads, canvas clears, modal closes.
12. **Notes textarea.** Add Person modal shows a six-row Notes textarea.
13. **Help tooltip.** Open help. Shows Spacebar, Delete/Backspace, Esc, Cmd/Ctrl shortcuts all in key-pill style.
14. **beforeunload.** With dirty state, close tab — browser confirms before leaving. With clean state (just exported), close tab — no confirmation.
15. **Theme parity.** Toggle sun/moon. All new visual elements (recovery banner, dirty hint, three-button reset modal, key-pill shortcuts) render legibly in both themes.

If all fifteen pass, report DONE with a one-line summary per item.

---

## Out of scope for this build

- `getRelationship` extension to grandparent / aunt / uncle / cousin (Tier 2 in audit).
- Soft-delete with Undo toast.
- Multi-genogram saved-list feature.
- Twin / adopted / step-parent relationship support.
- Touch / pinch-zoom for mobile.
- Performance refactor.
- Any backend / API / auth file.
- Life Map, Brainspotting, EMDR Suite.

---

## Sidecar note (Matthew, not Composer)

After this ships and you verify, run this one-time SQL against the production DB so retroactive analytics are also unified — Genogram's analytics already use `'genogram'` consistently, so no SQL is needed for this batch. (The Life Map SQL `UPDATE analytics_app_usage SET app_name = 'lifemap' WHERE app_name = 'timeline';` is still pending from the earlier work.)

---

*End of build spec.*
