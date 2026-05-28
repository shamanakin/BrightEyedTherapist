# Genogram Genie — Build Spec (Relationship Symbol Overhaul)

**Target file:** `tool_genogram.html` (single file; current ~2,619 lines after Path A)
**Scope:** Seven symbol changes + new combined `volatile` type + optional abuse subtype letter badges + `volatile` → `hostile` rename migration + UI dropdown updates.
**Author of spec:** Claude (handed to Composer for execution)
**Date:** May 27, 2026

This spec is the source of truth. Audit context is in `docs/GENOGRAM_RELATIONSHIP_OVERHAUL_AUDIT_2026-05-27.md` and the inline visual mockup. Execute items in the order given.

---

## Global guardrails

1. **Only `tool_genogram.html` is modified.** No other file in the repo is touched.
2. **The `quality` value rename (`volatile` → `hostile`) is paired with a migration shim.** Existing data with `quality === 'volatile'` is translated to `quality === 'hostile'` everywhere data enters memory (draft recovery Keep button, legacy migration Keep button, JSON import). After this batch, the value `'volatile'` means the *new* combined close+hostile type.
3. **Do not rename other existing functions, variables, or DOM ids** beyond what's listed in this spec. New helpers may be added; existing names are stable.
4. **Do not refactor adjacent code.** Touch only what each item names.
5. **No new external dependencies.** No new CDN scripts, no new libraries.
6. **Preserve existing color palette.** Sage `#2C5558`/`#7CB590`, structural neutrals, plus role-coded relationship colors (`#06b6d4` close, `#a855f7` enmeshed, `#f97316` hostile/volatile, `#ef4444` abuse). Don't redefine these.
7. **New CSS goes inside the existing `<style>` block in `<head>`.**
8. **Light-mode and dark-mode parity** for any new visible element. SVG colors that encode semantic clinical meaning (red for abuse, orange for hostile, cyan for close, purple for enmeshed, muted gray for distant) stay identical in both modes — that's intentional. Helper UI text and badge backgrounds use the existing dark-mode toggling pattern.
9. **No data-model changes beyond:**
   - Adding optional `abuseType` field on emotional links of `quality === 'abuse'` (values: `'physical' | 'sexual' | 'emotional' | 'unspecified'`, default `'unspecified'`).
   - Adding `'separated'` as a valid `structuralType` value alongside the existing `'partner' | 'married' | 'divorced'`.
   - Adding `'distant'` and `'hostile'` as new `quality` values alongside existing.
   - Repurposing `'volatile'` to mean the new combined close+hostile type.
10. **No out-of-scope improvements**, even if they look related. Engagement markers, affair/liaison, twin support, adopted/foster relationships — all deferred.

---

## Pre-flight check

Confirm:
- `tool_genogram.html` exists at the repo root.
- Current line count in the ~2,620 range.
- The file contains `drawRelationship`, `drawEmotionalLink`, `normalizeIssues`, `populateExistingLinksList`, `editEmotionalLink`, `handleRelationshipFormSubmit`, `showDraftRecoveryBanner`, `applyImportedJson`, and the `relationship-quality` / `structural-relationship-quality` / `abuse-direction` `<select>` elements.

If any of these are missing, stop and report.

---

## Item 1 — Geometry helpers (new utilities)

**Goal:** Add reusable path-builder helpers used by hostile, volatile, abuse, cut-off, divorced, and separated rendering. Centralizing geometry once avoids drift later.

**What changes:**

Add a new section inside the `<script type="module">` block. Place it right after the existing `// === UTILITY FUNCTIONS ===` block (after the `snap`, `setSidebarOpen` helpers around line 875):

```js
// ============================================
// LINE GEOMETRY HELPERS (relationship rendering)
// ============================================

/**
 * Midpoint of a line.
 */
function lineMidpoint(x1, y1, x2, y2) {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

/**
 * Perpendicular offset vector at a point along a line from (x1,y1) to (x2,y2).
 * Returns {dx, dy} such that (dx, dy) is `length` pixels perpendicular to the line direction.
 */
function perpendicularOffset(x1, y1, x2, y2, length) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { dx: (-dy / len) * length, dy: (dx / len) * length };
}

/**
 * Build a perpendicular slash mark across a line, centered at a position along the line.
 * `t` is a 0..1 parameter along the line (0.5 = midpoint).
 * `length` is the total length of the slash (the slash extends `length/2` to each side of the line).
 * Returns an SVG path d-string.
 */
function buildPerpendicularSlash(x1, y1, x2, y2, t, length) {
    const cx = x1 + (x2 - x1) * t;
    const cy = y1 + (y2 - y1) * t;
    const { dx, dy } = perpendicularOffset(x1, y1, x2, y2, length / 2);
    return `M ${cx - dx} ${cy - dy} L ${cx + dx} ${cy + dy}`;
}

/**
 * Build a regular zigzag (sawtooth) path along a line from (x1,y1) to (x2,y2).
 * `amplitude` is the perpendicular distance to each peak/valley.
 * `period` is the length along the line for one full up-down cycle.
 * Used for hostile (orange zigzag) and volatile overlay.
 */
function buildZigzagPath(x1, y1, x2, y2, amplitude, period) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return `M ${x1} ${y1}`;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy; // perpendicular unit vector
    const py = ux;
    const half = period / 2;
    const steps = Math.max(2, Math.floor(len / half));
    const segLen = len / steps;
    const parts = [`M ${x1} ${y1}`];
    for (let i = 1; i <= steps; i++) {
        const along = i * segLen;
        const sign = (i % 2 === 1) ? -1 : 1; // first peak up, then down, alternating
        const offsetMag = (i === steps && steps % 2 === 1) ? 0 : (i === steps ? 0 : amplitude * sign);
        const ax = x1 + ux * along + px * offsetMag;
        const ay = y1 + uy * along + py * offsetMag;
        parts.push(`L ${ax} ${ay}`);
    }
    // Force the endpoint to land exactly on (x2, y2) so the line meets the next anchor cleanly.
    parts.push(`L ${x2} ${y2}`);
    return parts.join(' ');
}

/**
 * Build a sharper "jagged lightning" path for abuse. Larger amplitude, fewer peaks,
 * irregular feel. Compared to the regular zigzag (used for hostile), this reads as
 * harm/violence rather than friction/conflict.
 */
function buildAbuseJaggedPath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return `M ${x1} ${y1}`;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const amplitude = 8;
    const teeth = Math.max(2, Math.floor(len / 28));
    const segLen = len / teeth;
    const parts = [`M ${x1} ${y1}`];
    for (let i = 1; i < teeth; i++) {
        const along = i * segLen;
        const sign = (i % 2 === 1) ? -1 : 1;
        const ax = x1 + ux * along + px * amplitude * sign;
        const ay = y1 + uy * along + py * amplitude * sign;
        parts.push(`L ${ax} ${ay}`);
    }
    parts.push(`L ${x2} ${y2}`);
    return parts.join(' ');
}
```

**Do not touch:**
- Any existing geometry inside `drawRelationship` or `drawEmotionalLink` yet. Those edits come in later items.

**Acceptance criteria:**
- These functions are defined and reachable from `drawRelationship` and `drawEmotionalLink`.
- No console errors at boot.
- Items 4–8 below depend on these helpers existing.

---

## Item 2 — Migration shim for `volatile` → `hostile`

**Goal:** Translate any existing emotional links with `quality === 'volatile'` to `quality === 'hostile'` whenever data enters memory. After this item, the value `'volatile'` is free for the new combined type introduced in Item 7.

**What changes:**

Add a new helper, placed just after the geometry helpers from Item 1:

```js
/**
 * Migrate a single emotional link to the current schema.
 * - `volatile` (legacy: solid orange line meaning hostile) → `hostile` (same meaning, new name).
 *   The value `volatile` is repurposed for the new close+hostile combined type going forward.
 * - Adds default `abuseType: 'unspecified'` for abuse links missing the field.
 *
 * Pure function; returns a new object, does not mutate input.
 */
function migrateEmotionalLink(link) {
    if (!link || typeof link !== 'object') return link;
    let migrated = { ...link };
    if (migrated.quality === 'volatile' && !migrated._migratedFromLegacyVolatile) {
        // Old data: 'volatile' meant solid orange hostile line. New meaning is combined.
        migrated.quality = 'hostile';
        migrated._migratedFromLegacyVolatile = true;
    }
    if (migrated.quality === 'abuse' && !migrated.abuseType) {
        migrated.abuseType = 'unspecified';
    }
    return migrated;
}

/**
 * Migrate an array of emotional links.
 */
function migrateEmotionalLinks(links) {
    if (!Array.isArray(links)) return [];
    return links.map(migrateEmotionalLink);
}
```

Then wire this into the three data-entry paths:

(a) **Draft recovery Keep button** (inside `showDraftRecoveryBanner`, around line 2204). Find:

```js
db.people = (draft.people || []).map(p => ({ ...p, issues: normalizeIssues(p.issues) }));
db.relationships = draft.relationships || [];
db.emotionalLinks = draft.emotionalLinks || [];
```

Replace with:

```js
db.people = (draft.people || []).map(p => ({ ...p, issues: normalizeIssues(p.issues) }));
db.relationships = draft.relationships || [];
db.emotionalLinks = migrateEmotionalLinks(draft.emotionalLinks || []);
```

(b) **JSON import** (inside `applyImportedJson`, around line 1556). Find:

```js
db.people = newDb.people;
db.relationships = newDb.relationships;
db.emotionalLinks = newDb.emotionalLinks || [];
```

Replace with:

```js
db.people = newDb.people;
db.relationships = newDb.relationships;
db.emotionalLinks = migrateEmotionalLinks(newDb.emotionalLinks || []);
```

(c) **Legacy localStorage migration path** is already covered by (a) because it routes through the same `showDraftRecoveryBanner` flow.

**Do not touch:**
- `normalizeIssues` (already handles people-level migration; out of scope here).
- The `db` initial declaration. Default empty arrays stay.

**Acceptance criteria:**
- Genograms with existing `quality === 'volatile'` entries, after being loaded via Keep or Import, have those entries silently rewritten to `quality === 'hostile'`. The visual output matches the previous "volatile = solid orange line" behavior temporarily, until Item 6 below changes the hostile rendering to a zigzag.
- The `_migratedFromLegacyVolatile` flag prevents repeated migration if a file is exported and re-imported.
- No console errors.

---

## Item 3 — UI: relationship-quality dropdown updates

**Goal:** Surface the new emotional relationship types and the renamed "hostile" label in the Manage Relationships modal.

**What changes:**

Find the `relationship-quality` `<select>` (around line 608):

```html
<select id="relationship-quality" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
    <option value="default">Connected / Neutral</option>
    <option value="close">Close / Supportive</option>
    <option value="enmeshed">Enmeshed</option>
    <option value="volatile">Volatile / Hostile</option>
    <option value="cutoff">Cut-off</option>
    <option value="abuse">Abuse</option>
</select>
```

Replace the inner `<option>` list with:

```html
<option value="default">Connected / Neutral</option>
<option value="distant">Distant</option>
<option value="close">Close / Supportive</option>
<option value="enmeshed">Enmeshed</option>
<option value="hostile">Hostile</option>
<option value="volatile">Volatile (Close + Hostile)</option>
<option value="cutoff">Cut-off</option>
<option value="abuse">Abuse</option>
```

Note the order is intentional: it now reads as a rough warmth-to-conflict spectrum (default → distant → close → enmeshed → hostile → volatile → cutoff → abuse).

**Do not touch:**
- The `<select>` styling.
- Any other `<option>` lists.

**Acceptance criteria:**
- Manage Relationships modal shows the eight options in the listed order.
- Selecting any option saves to `db.emotionalLinks[i].quality` with the corresponding value.

---

## Item 4 — UI: structural-quality dropdown adds Separated

**Goal:** Add `'separated'` as a fourth structural type.

**What changes:**

Find the `structural-relationship-quality` `<select>` (around line 651):

```html
<select id="structural-relationship-quality" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
    <option value="partner">Partner (Unmarried)</option>
    <option value="married">Married</option>
    <option value="divorced">Divorced</option>
</select>
```

Replace the inner `<option>` list with:

```html
<option value="partner">Partner (Unmarried)</option>
<option value="married">Married</option>
<option value="separated">Separated</option>
<option value="divorced">Divorced</option>
```

**Do not touch:**
- The form submit handler — `structuralType` flows through as a string and no validation logic needs updating.
- The `drawRelationship` function — Item 9 below handles the rendering.

**Acceptance criteria:**
- Right-clicking a partnered person → "Set Partnership Type" shows four options.
- Selecting "Separated" saves `structuralType: 'separated'` on the partner relationship.
- At this stage the rendering falls through to the default solid line (until Item 9 ships).

---

## Item 5 — UI: abuse subtype dropdown

**Goal:** When the emotional quality is `'abuse'`, surface a second dropdown for the subtype (physical / sexual / emotional / unspecified). Mirror the existing abuse-direction pattern.

**What changes:**

(a) Find the abuse direction group in the HTML (around line 617):

```html
<div id="abuse-direction-group" class="hidden">
    <label for="abuse-direction" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Direction of Abuse</label>
    <select id="abuse-direction" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></select>
</div>
```

Right BEFORE the closing `</div>` of the parent `grid-cols-2` row (the one that wraps `relationship-quality` and `abuse-direction-group`), the layout is already a 2-column grid. Add a SECOND row below for the subtype. Find the parent `<div class="grid grid-cols-2 gap-4 mt-4">` (around line 605) and the `</div>` that closes it. After that closing `</div>`, add:

```html
<div id="abuse-subtype-group" class="hidden mt-4">
    <label for="abuse-subtype" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of Abuse</label>
    <select id="abuse-subtype" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        <option value="unspecified">Unspecified</option>
        <option value="physical">Physical</option>
        <option value="sexual">Sexual</option>
        <option value="emotional">Emotional</option>
    </select>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional. A "P", "S", or "E" badge appears on the line when set.</p>
</div>
```

(b) Add a DOM reference and show/hide wiring. In the `init` function's DOM assignment block (around line 2310, near the other abuse-direction variables), add:

```js
let abuseSubtypeGroup, abuseSubtypeInput;
// ...inside init():
abuseSubtypeGroup = document.getElementById('abuse-subtype-group');
abuseSubtypeInput = document.getElementById('abuse-subtype');
```

(c) Extend the existing `relationshipQualityInput.addEventListener('change', ...)` handler (around line 2143) to also toggle the subtype group. Find:

```js
relationshipQualityInput.addEventListener('change', (e) => {
    const p1Name = relPersonAInput.options[relPersonAInput.selectedIndex]?.text || 'Person A';
    const p2Name = relPersonBInput.options[relPersonBInput.selectedIndex]?.text || 'Person B';
    
    abuseDirectionInput.innerHTML = '';
    abuseDirectionInput.add(new Option(`From ${p1Name} to ${p2Name}`, 'p1_to_p2'));
    abuseDirectionInput.add(new Option(`From ${p2Name} to ${p1Name}`, 'p2_to_p1'));
    abuseDirectionInput.add(new Option(`Mutual`, 'mutual'));

    if (e.target.value === 'abuse') abuseDirectionGroup.classList.remove('hidden');
    else abuseDirectionGroup.classList.add('hidden');
});
```

Add the subtype toggle. Final shape:

```js
relationshipQualityInput.addEventListener('change', (e) => {
    const p1Name = relPersonAInput.options[relPersonAInput.selectedIndex]?.text || 'Person A';
    const p2Name = relPersonBInput.options[relPersonBInput.selectedIndex]?.text || 'Person B';

    abuseDirectionInput.innerHTML = '';
    abuseDirectionInput.add(new Option(`From ${p1Name} to ${p2Name}`, 'p1_to_p2'));
    abuseDirectionInput.add(new Option(`From ${p2Name} to ${p1Name}`, 'p2_to_p1'));
    abuseDirectionInput.add(new Option(`Mutual`, 'mutual'));

    const isAbuse = e.target.value === 'abuse';
    abuseDirectionGroup.classList.toggle('hidden', !isAbuse);
    if (abuseSubtypeGroup) abuseSubtypeGroup.classList.toggle('hidden', !isAbuse);
});
```

(d) Extend `handleRelationshipFormSubmit` to capture the subtype. Find (around line 1802):

```js
const newLinkData = { p1: p1Id, p2: p2Id, quality: quality, abuseDirection: quality === 'abuse' ? abuseDirectionInput.value : null };
```

Replace with:

```js
const newLinkData = {
    p1: p1Id,
    p2: p2Id,
    quality: quality,
    abuseDirection: quality === 'abuse' ? abuseDirectionInput.value : null,
    abuseType: quality === 'abuse' ? (abuseSubtypeInput?.value || 'unspecified') : null
};
```

(e) Extend `editEmotionalLink` to restore the subtype on edit. Find (around line 1829):

```js
function editEmotionalLink(linkId) {
    const link = db.emotionalLinks.find(l => l.id === linkId);
    if (!link) return;
    relLinkIdInput.value = link.id;
    relPersonAInput.value = link.p1;
    relPersonBInput.value = link.p2;
    relationshipQualityInput.value = link.quality;
    relationshipQualityInput.dispatchEvent(new Event('change'));
    if (link.quality === 'abuse') abuseDirectionInput.value = link.abuseDirection;
    relFormTitle.textContent = 'Edit Link';
    relationshipModalSaveBtn.textContent = 'Update Link';
}
```

Add the subtype restoration. Final shape (just the `if` block changes):

```js
if (link.quality === 'abuse') {
    abuseDirectionInput.value = link.abuseDirection;
    if (abuseSubtypeInput) abuseSubtypeInput.value = link.abuseType || 'unspecified';
}
```

(f) Extend `clearRelationshipForm` to reset the subtype. Find (around line 1821):

```js
function clearRelationshipForm() {
    relationshipForm.reset();
    relLinkIdInput.value = '';
    abuseDirectionGroup.classList.add('hidden');
    relFormTitle.textContent = 'Add New Link';
    relationshipModalSaveBtn.textContent = 'Add Link';
    relPersonAInput.value = ""; relPersonBInput.value = "";
}
```

Add the subtype group hide and value reset. Final shape:

```js
function clearRelationshipForm() {
    relationshipForm.reset();
    relLinkIdInput.value = '';
    abuseDirectionGroup.classList.add('hidden');
    if (abuseSubtypeGroup) abuseSubtypeGroup.classList.add('hidden');
    if (abuseSubtypeInput) abuseSubtypeInput.value = 'unspecified';
    relFormTitle.textContent = 'Add New Link';
    relationshipModalSaveBtn.textContent = 'Add Link';
    relPersonAInput.value = ""; relPersonBInput.value = "";
}
```

**Do not touch:**
- The abuse direction logic itself.
- Any other modal field.

**Acceptance criteria:**
1. Open Manage Relationships, select two people, choose "Abuse" as quality. The Direction dropdown appears AND the Type dropdown appears (showing Unspecified, Physical, Sexual, Emotional).
2. Switch quality back to "Hostile" or "Close" — both abuse fields hide.
3. Save an abuse link with Type = "Physical". Reopen the modal, edit the link — Direction and Type both populate correctly.
4. Save an abuse link with Type = "Unspecified" (default). The saved link has `abuseType: 'unspecified'`. The visual will be unchanged from a plain abuse rendering (no letter badge — see Item 8).

---

## Item 6 — `drawRelationship`: improved divorced + new separated

**Goal:** Replace the existing tiny double-tick break in divorced with two clearly visible perpendicular slashes. Add separated rendering as a single perpendicular slash.

**What changes:**

Find `drawRelationship` (around line 1015). The current implementation has a long `divorced` branch (~lines 1025–1046) that draws a broken line with two tiny break-line clones. That entire branch is being replaced.

Replace the existing `if (rel.type === 'partner') { ... }` block's interior. Find:

```js
if (rel.type === 'partner') {
    const p1 = getPerson(rel.p1);
    const p2 = getPerson(rel.p2);
    if (!p1 || !p2) return;
    
    if (rel.structuralType === 'divorced') {
        line.classList.add('relationship-line-divorced');
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const L = Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2));
        if (L === 0) return;
        const breakSize = 10;
        const pA_x = midX - (breakSize/L) * (p2.x-p1.x);
        const pA_y = midY - (breakSize/L) * (p2.y-p1.y);
        const pB_x = midX + (breakSize/L) * (p2.x-p1.x);
        const pB_y = midY + (breakSize/L) * (p2.y-p1.y);
        d = `M ${p1.x} ${p1.y} L ${pA_x} ${pA_y} M ${pB_x} ${pB_y} L ${p2.x} ${p2.y}`;
        
        const breakAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI / 2;
        const bdx = Math.cos(breakAngle) * 6;
        const bdy = Math.sin(breakAngle) * 6;
        const breakLine1 = line.cloneNode();
        breakLine1.setAttribute('d', `M ${midX - bdx - (2/L) * (p2.x-p1.x)} ${midY - bdy - (2/L) * (p2.y-p1.y)} L ${midX + bdx - (2/L) * (p2.x-p1.x)} ${midY + bdy - (2/L) * (p2.y-p1.y)}`);
        relationshipsG.appendChild(breakLine1);
        const breakLine2 = line.cloneNode();
        breakLine2.setAttribute('d', `M ${midX - bdx + (2/L) * (p2.x-p1.x)} ${midY - bdy + (2/L) * (p2.y-p1.y)} L ${midX + bdx + (2/L) * (p2.x-p1.x)} ${midY + bdy + (2/L) * (p2.y-p1.y)}`);
        relationshipsG.appendChild(breakLine2);
    } else if (rel.structuralType === 'partner') {
        line.classList.add('relationship-line-partner');
        d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    } else {
        d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    }
}
```

Replace with:

```js
if (rel.type === 'partner') {
    const p1 = getPerson(rel.p1);
    const p2 = getPerson(rel.p2);
    if (!p1 || !p2) return;

    // The base line is always drawn (solid for married/separated/divorced, dashed for partner).
    d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

    if (rel.structuralType === 'partner') {
        line.classList.add('relationship-line-partner');
    }

    // Slash mark overlay for separated (one slash) and divorced (two slashes).
    if (rel.structuralType === 'separated' || rel.structuralType === 'divorced') {
        const slashLength = 22;
        const overlay1Pos = (rel.structuralType === 'divorced') ? 0.45 : 0.5;
        const overlay = line.cloneNode();
        overlay.setAttribute('d', buildPerpendicularSlash(p1.x, p1.y, p2.x, p2.y, overlay1Pos, slashLength));
        overlay.classList.remove('relationship-line-partner'); // slashes are always solid
        relationshipsG.appendChild(overlay);

        if (rel.structuralType === 'divorced') {
            const overlay2 = line.cloneNode();
            overlay2.setAttribute('d', buildPerpendicularSlash(p1.x, p1.y, p2.x, p2.y, 0.55, slashLength));
            overlay2.classList.remove('relationship-line-partner');
            relationshipsG.appendChild(overlay2);
        }
    }
}
```

**Do not touch:**
- The `child` branch in `drawRelationship`.
- The CSS class `.relationship-line-divorced` (it's no longer applied but leaving the class definition in place doesn't break anything).
- The `.relationship-line-partner` class — still used for the dashed `partner` structural type.

**Acceptance criteria:**
1. Create two people, set them as partners. The line between them is dashed (partner).
2. Set Partnership Type → Married. Solid line, no slashes.
3. Set Partnership Type → Separated. Solid line with one perpendicular slash at the midpoint, ~22px tall.
4. Set Partnership Type → Divorced. Solid line with two perpendicular slashes near the midpoint (one at 45%, one at 55%), ~22px tall each, visible at any reasonable zoom.
5. Drag either person around — slashes follow and stay perpendicular to the line.

---

## Item 7 — `drawEmotionalLink`: distant, hostile, volatile (combined), cut-off, abuse

**Goal:** Implement all the emotional symbol changes in one coherent function rewrite, using the geometry helpers from Item 1.

**What changes:**

Find `drawEmotionalLink` (around line 1089). The function is a large `switch` statement on `link.quality`. Several branches change. Easiest to replace the whole function body cleanly.

Replace the existing function with:

```js
function drawEmotionalLink(link) {
    const p1 = getPerson(link.p1);
    const p2 = getPerson(link.p2);
    if (!p1 || !p2) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('class', 'relationship-line');
    let d = '';

    switch (link.quality) {
        case 'distant': {
            // Thin muted dashed line. Distinct from cut-off (which is a full break).
            line.setAttribute('stroke', 'var(--tt-axis, #9ca3af)');
            line.setAttribute('stroke-width', '1.5');
            line.setAttribute('stroke-dasharray', '2 5');
            d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            break;
        }
        case 'close': {
            line.classList.add('rel-close');
            const { dx, dy } = perpendicularOffset(p1.x, p1.y, p2.x, p2.y, 4);
            d = `M ${p1.x + dx} ${p1.y + dy} L ${p2.x + dx} ${p2.y + dy} ` +
                `M ${p1.x - dx} ${p1.y - dy} L ${p2.x - dx} ${p2.y - dy}`;
            break;
        }
        case 'enmeshed': {
            line.classList.add('rel-enmeshed');
            const { dx, dy } = perpendicularOffset(p1.x, p1.y, p2.x, p2.y, 5);
            d = `M ${p1.x + dx} ${p1.y + dy} L ${p2.x + dx} ${p2.y + dy} ` +
                `M ${p1.x - dx} ${p1.y - dy} L ${p2.x - dx} ${p2.y - dy} ` +
                `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            break;
        }
        case 'hostile': {
            // Standalone hostile = orange zigzag (sawtooth). Standard convention.
            line.classList.add('rel-hostile');
            d = buildZigzagPath(p1.x, p1.y, p2.x, p2.y, 5, 16);
            break;
        }
        case 'volatile': {
            // Combined close + hostile. Two parallel cyan lines (close) + orange zigzag overlay.
            line.classList.add('rel-close');
            const { dx, dy } = perpendicularOffset(p1.x, p1.y, p2.x, p2.y, 6);
            d = `M ${p1.x + dx} ${p1.y + dy} L ${p2.x + dx} ${p2.y + dy} ` +
                `M ${p1.x - dx} ${p1.y - dy} L ${p2.x - dx} ${p2.y - dy}`;
            line.setAttribute('d', d);
            relationshipsG.appendChild(line);

            // Now overlay the zigzag in the middle.
            const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            overlay.setAttribute('class', 'relationship-line rel-hostile');
            overlay.setAttribute('stroke-width', '1.5');
            overlay.setAttribute('d', buildZigzagPath(p1.x, p1.y, p2.x, p2.y, 3, 14));
            relationshipsG.appendChild(overlay);
            return; // already appended; skip the default append at the bottom
        }
        case 'cutoff': {
            // Solid line with a clear gap and two perpendicular bars across the gap.
            line.setAttribute('stroke', 'var(--tt-text, #1f2937)');
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const L = Math.sqrt(dx * dx + dy * dy);
            if (L === 0) return;
            const gapHalf = 10; // distance from midpoint to each end of the gap
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const ux = dx / L, uy = dy / L;
            const gapStartX = midX - ux * gapHalf;
            const gapStartY = midY - uy * gapHalf;
            const gapEndX = midX + ux * gapHalf;
            const gapEndY = midY + uy * gapHalf;
            d = `M ${p1.x} ${p1.y} L ${gapStartX} ${gapStartY} M ${gapEndX} ${gapEndY} L ${p2.x} ${p2.y}`;

            // Two parallel perpendicular bars across the gap, ~24px tall.
            const barLen = 24;
            const bar1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bar1.setAttribute('class', 'relationship-line');
            bar1.setAttribute('stroke', 'var(--tt-text, #1f2937)');
            bar1.setAttribute('d', buildPerpendicularSlash(p1.x, p1.y, p2.x, p2.y, 0.46, barLen));
            relationshipsG.appendChild(bar1);

            const bar2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bar2.setAttribute('class', 'relationship-line');
            bar2.setAttribute('stroke', 'var(--tt-text, #1f2937)');
            bar2.setAttribute('d', buildPerpendicularSlash(p1.x, p1.y, p2.x, p2.y, 0.54, barLen));
            relationshipsG.appendChild(bar2);
            break;
        }
        case 'abuse': {
            // Jagged red lightning + arrowhead per direction.
            line.classList.add('rel-abuse');
            const { x: srcX, y: srcY, x2: tgtX, y2: tgtY } = abuseEndpointsFor(link, p1, p2);
            d = buildAbuseJaggedPath(srcX, srcY, tgtX, tgtY);
            if (link.abuseDirection === 'p1_to_p2' || link.abuseDirection === 'p2_to_p1') {
                line.setAttribute('marker-end', 'url(#arrowhead-abuse-red)');
            } else if (link.abuseDirection === 'mutual') {
                line.setAttribute('marker-start', 'url(#arrowhead-abuse-red)');
                line.setAttribute('marker-end', 'url(#arrowhead-abuse-red)');
            }
            line.setAttribute('d', d);
            relationshipsG.appendChild(line);

            // Optional letter badge (Item 8).
            drawAbuseTypeBadge(link, p1, p2);
            return; // already appended; skip the default append at the bottom
        }
        default:
            // 'default' / unknown — fall through silently. No line is drawn.
            break;
    }

    if (d) {
        line.setAttribute('d', d);
        relationshipsG.appendChild(line);
    }
}

/**
 * For abuse links, return the source/target endpoint pair based on direction.
 * For 'p2_to_p1', the source is p2 (the actor) and target is p1 (the receiver).
 * For everything else, source = p1, target = p2.
 */
function abuseEndpointsFor(link, p1, p2) {
    if (link.abuseDirection === 'p2_to_p1') {
        return { x: p2.x, y: p2.y, x2: p1.x, y2: p1.y };
    }
    return { x: p1.x, y: p1.y, x2: p2.x, y2: p2.y };
}
```

**Do not touch:**
- `drawRelationship` (covered separately in Item 6).
- The arrowhead marker definitions in `<defs>` — they remain valid.
- The CSS for `.rel-close`, `.rel-enmeshed`, `.rel-hostile`, `.rel-abuse`, `.rel-cutoff`.

**Acceptance criteria:**
1. **Default / Connected:** no line drawn (matches existing behavior).
2. **Distant:** thin muted gray dashed line between two people. Visually distinct from cut-off.
3. **Close:** two parallel cyan lines. Unchanged from before.
4. **Enmeshed:** three parallel purple lines. Unchanged from before.
5. **Hostile:** orange zigzag/sawtooth. Visibly distinct from a solid line at any zoom.
6. **Volatile:** two parallel cyan lines (close) + orange zigzag overlay between them.
7. **Cut-off:** solid line with a clear gap in the middle, two perpendicular bars (~24px tall) across the gap.
8. **Abuse:** jagged red lightning with bold arrowhead(s) per direction.
9. Dragging either person re-renders all lines with correct geometry.
10. The Item 2 migration (legacy `volatile` → `hostile`) now produces correctly-zigzagged hostile lines for existing data.

---

## Item 8 — Abuse subtype letter badge

**Goal:** Render a small letter badge (P / S / E) at the midpoint of abuse lines whose `abuseType` is set to physical, sexual, or emotional. No badge for `'unspecified'`.

**What changes:**

Add the badge-drawing function near the other rendering helpers, just after `abuseEndpointsFor` (added in Item 7):

```js
/**
 * Draw a small letter badge (P / S / E) at the perpendicular-offset midpoint
 * of an abuse line, when abuseType is set. No-op for 'unspecified' or missing.
 */
function drawAbuseTypeBadge(link, p1, p2) {
    const letterMap = {
        physical: 'P',
        sexual: 'S',
        emotional: 'E'
    };
    const letter = letterMap[link.abuseType];
    if (!letter) return;

    const mid = lineMidpoint(p1.x, p1.y, p2.x, p2.y);
    const { dx, dy } = perpendicularOffset(p1.x, p1.y, p2.x, p2.y, 14);
    const bx = mid.x + dx;
    const by = mid.y + dy;
    const isDark = document.documentElement.classList.contains('dark');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(bx));
    circle.setAttribute('cy', String(by));
    circle.setAttribute('r', '9');
    circle.setAttribute('fill', isDark ? '#1f2937' : '#ffffff');
    circle.setAttribute('stroke', '#ef4444');
    circle.setAttribute('stroke-width', '1.5');
    relationshipsG.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(bx));
    text.setAttribute('y', String(by));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-weight', '600');
    text.setAttribute('font-family', 'Inter, sans-serif');
    text.setAttribute('fill', '#ef4444');
    text.setAttribute('pointer-events', 'none');
    text.textContent = letter;
    relationshipsG.appendChild(text);
}
```

This function is already wired into `drawEmotionalLink`'s `abuse` branch via the `drawAbuseTypeBadge(link, p1, p2)` call added in Item 7.

**Do not touch:**
- The arrowhead markers.
- Any other text rendering.

**Acceptance criteria:**
1. Create an abuse link with Type = Physical. A small circle with bold "P" appears offset to one side of the line, near the midpoint, with red text on a light/dark-mode-aware background.
2. Edit the link to Type = Sexual. The circle now shows "S".
3. Edit the link to Type = Emotional. Circle shows "E".
4. Edit the link to Type = Unspecified. No circle is drawn.
5. Toggle dark mode — badge background stays readable (dark gray instead of white).
6. Drag either person — the badge follows the line midpoint.

---

## Item 9 — Symbol key tooltip updates

**Goal:** Update the symbol key tooltip to reflect the new symbol set.

**What changes:**

Find the key tooltip HTML (around line 352):

```html
<div id="key-tooltip" class="control-tooltip absolute right-0 top-full mt-2 w-72 bg-gray-800 text-white text-xs rounded-lg shadow-lg p-4 z-50 hidden opacity-0 transition-opacity" style="pointer-events: none;">
    <h3 class="font-medium text-sm mb-2">Genogram Key</h3>
    <div class="space-y-2">
        <div class="font-semibold">Symbols:</div>
        ...
        <div class="font-semibold">Relationship Lines:</div>
        <ul class="list-disc list-inside space-y-1 pl-2">
            <li>Solid Line: Default Partnership</li>
            <li class="text-cyan-300">Two Parallel Lines: Close</li>
            <li class="text-orange-300">Solid Line: Volatile / Hostile</li>
            <li>Dashed Line (w/ break): Cut-off</li>
            <li class="text-red-300">Line with Arrow(s): Abuse</li>
            <li style="color: #a855f7;">Three Parallel Lines: Enmeshed</li>
        </ul>
        <div class="font-semibold">Structural Lines:</div>
        <ul class="list-disc list-inside space-y-1 pl-2">
            <li>Solid Line: Married</li>
            <li>Dashed Line: Partner (Unmarried)</li>
            <li>Line with Double-Slash: Divorced</li>
        </ul>
    </div>
```

Replace the two relevant `<ul>` blocks (the "Relationship Lines" list and the "Structural Lines" list) with:

```html
<div class="font-semibold">Emotional Lines:</div>
<ul class="list-disc list-inside space-y-1 pl-2">
    <li class="text-gray-300">Thin dashed line: Distant</li>
    <li class="text-cyan-300">Two parallel lines: Close</li>
    <li style="color: #c4b5fd;">Three parallel lines: Enmeshed</li>
    <li class="text-orange-300">Zigzag: Hostile</li>
    <li><span class="text-cyan-300">Close lines</span> + <span class="text-orange-300">zigzag</span>: Volatile</li>
    <li>Solid line with break + bars: Cut-off</li>
    <li class="text-red-300">Jagged line + arrow: Abuse</li>
    <li class="text-red-300 ml-4">P / S / E badge: Physical / Sexual / Emotional subtype</li>
</ul>
<div class="font-semibold">Structural Lines:</div>
<ul class="list-disc list-inside space-y-1 pl-2">
    <li>Solid line: Married</li>
    <li>Dashed line: Partner (Unmarried)</li>
    <li>Solid line with single slash: Separated</li>
    <li>Solid line with double slash: Divorced</li>
</ul>
```

**Do not touch:**
- The Symbols section (square / circle / diamond) — unchanged.
- The Clinical Indicators section — unchanged.
- The closing arrow markup and z-index handling.

**Acceptance criteria:**
1. Click the key icon in the canvas top-right. The tooltip shows the new symbol list.
2. Emotional Lines section includes Distant, Close, Enmeshed, Hostile, Volatile, Cut-off, Abuse, plus the P/S/E subtype note.
3. Structural Lines section shows Married, Partner, Separated, Divorced.
4. Tooltip closes correctly when clicking the icon again or anywhere outside (existing behavior preserved).

---

## Item 10 — Existing-links list label refinements

**Goal:** When the Manage Relationships modal displays existing links, show abuse subtype and rename `volatile` to `hostile` in display text.

**What changes:**

Find `populateExistingLinksList` (around line 1770). The current code (with the XSS escapes from Path A) reads:

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
```

Replace the `text` building block with:

```js
const qualityLabels = {
    default: 'connected',
    distant: 'distant',
    close: 'close',
    enmeshed: 'enmeshed',
    hostile: 'hostile',
    volatile: 'volatile (close + hostile)',
    cutoff: 'cut-off',
    abuse: 'abuse'
};
const qualityLabel = escapeHtml(qualityLabels[link.quality] || link.quality);
const p1Name = escapeHtml(p1.name);
const p2Name = escapeHtml(p2.name);
let text = `<strong>${p1Name} & ${p2Name}</strong>: ${qualityLabel}`;
if (link.quality === 'abuse') {
    if (link.abuseDirection === 'mutual') {
        text += ` (Mutual`;
    } else {
        text += ` (${link.abuseDirection === 'p1_to_p2' ? `${p1Name}→${p2Name}` : `${p2Name}→${p1Name}`}`;
    }
    const subtypeLabels = { physical: 'Physical', sexual: 'Sexual', emotional: 'Emotional' };
    const subtypeLabel = subtypeLabels[link.abuseType];
    if (subtypeLabel) text += `, ${subtypeLabel}`;
    text += `)`;
}
```

**Do not touch:**
- The XSS-safe `escapeHtml` calls (added in Path A).
- The Edit / Delete button construction.

**Acceptance criteria:**
1. Add an emotional link with quality = Hostile. The list shows: *"Person A & Person B: hostile"*.
2. Add a Volatile link. List shows: *"Person A & Person B: volatile (close + hostile)"*.
3. Add an Abuse link with direction p1→p2, subtype Physical. List shows: *"Person A & Person B: abuse (Person A→Person B, Physical)"*.
4. Add an Abuse link with direction Mutual, subtype Unspecified. List shows: *"Person A & Person B: abuse (Mutual)"* — no comma, no subtype appended.

---

## Post-execution verification

Walk through these before declaring done. Halt and report on any failure.

1. **Cold open.** Reload. No console errors. Empty canvas. New CSS classes loaded but no visual artifacts.
2. **Helpers reachable.** `buildZigzagPath`, `buildPerpendicularSlash`, `buildAbuseJaggedPath`, `lineMidpoint`, `perpendicularOffset`, `migrateEmotionalLink`, `drawAbuseTypeBadge` all defined. Test via DevTools console: `typeof buildZigzagPath` → `'function'`.
3. **Migration shim.** In DevTools, set `localStorage.setItem('genogramGenieSaveData', JSON.stringify({people:[{id:'a',name:'A',gender:'male',isClient:true,issues:{},x:-80,y:0},{id:'b',name:'B',gender:'female',isClient:false,issues:{},x:80,y:0}], relationships:[], emotionalLinks:[{id:'e1',p1:'a',p2:'b',quality:'volatile',abuseDirection:null}]}))`. Refresh, run `sessionStorage.removeItem('bet-genogram-draft')` if needed, refresh again. Legacy banner appears → Keep. Inspect `db.emotionalLinks[0].quality` in console — value is `'hostile'`, not `'volatile'`. The rendered line between A and B is an orange zigzag.
4. **Each structural type renders correctly.** Add two people, set them as partners. Toggle through Partner → Married → Separated → Divorced via the structural modal. Each renders distinctly: dashed, solid, solid+slash, solid+double-slash.
5. **Each emotional type renders correctly.** Manage Relationships → add eight test links between different people pairs, one per quality (default, distant, close, enmeshed, hostile, volatile, cutoff, abuse). All render distinctly per the visual mockup.
6. **Abuse subtype letters.** Edit the abuse link, set Type = Physical. Letter "P" appears in a small circle near the line midpoint, red text on background-aware fill. Edit → Sexual → "S". → Emotional → "E". → Unspecified → no letter.
7. **Drag responsiveness.** Drag any person around. All emotional and structural lines re-render correctly. Zigzags rotate to follow the line angle. Slashes stay perpendicular. Letter badges follow the midpoint.
8. **Existing-links list.** Manage Relationships modal shows each link with the new quality label (e.g. "hostile" not "volatile / hostile"). Abuse entries include subtype when set, omit when unspecified.
9. **Symbol key.** Open the key tooltip. New symbol descriptions present.
10. **Theme parity.** Toggle dark mode. All new symbols render legibly. Letter badges adapt their fill correctly.
11. **Export / re-import roundtrip.** Create a genogram with one of each emotional link (including a Physical-subtype abuse link). Export JSON. Reset. Import the JSON. Everything renders identically to before reset, including the letter badge.

If all eleven pass, report DONE with a one-line summary per item.

---

## Out of scope

- Engagement / affair / annulment structural markers.
- Twin / adopted / foster relationship symbols.
- Renaming any existing field, class, or function not listed in this spec.
- Performance refactor of the full-render-on-drag pattern.
- Modifying PNG export styling (the inlined styles in `exportPNG` may need updating later to include the new symbol CSS, but that's a separate item — out of scope here).
- Touch / pinch-zoom for mobile.

---

## Sidecar note (Matthew)

The `exportPNG` function inlines a snapshot of CSS into the SVG for image export. After this batch ships, PNG exports of genograms containing the new symbols (zigzag, jagged abuse, letter badges) may not include all the new visual styling correctly, because the inlined `<style>` in `exportPNG` only covers the original symbol classes. Worth a separate spec to bring the PNG export styling current. Not in this batch.

---

*End of build spec.*
