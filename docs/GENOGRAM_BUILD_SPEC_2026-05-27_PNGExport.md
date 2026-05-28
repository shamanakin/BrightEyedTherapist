# Genogram Genie — PNG Export Update

**Target file:** `tool_genogram.html`
**Scope:** Bring the `exportPNG` function's inlined CSS current with the post-overhaul symbol set. Plus one pre-existing bug (Partner structural type wasn't rendering dashed in PNG) and a small filename alignment.
**Date:** May 27, 2026

---

## Global guardrails

1. Only `tool_genogram.html` is modified.
2. Do not change anything in `exportPNG` outside the inlined `<style>` text and the filename construction.
3. Do not rename `exportPNG` or any of its variables.
4. Preserve the existing 2× scale, padding, and bbox logic.

---

## Pre-flight check

Confirm:
- `exportPNG` exists (around line 2723).
- The inlined `<style>` text exists and contains `.person-shape`, `.relationship-line`, and the `.rel-*` rules.
- `db.people` has the `isClient` field (already true after Path A).

---

## Item 1 — Update the inlined CSS

**Goal:** Define CSS variable fallbacks so `var(--tt-axis, …)` and `var(--tt-text, …)` references in cloned SVG paths resolve correctly. Add `.relationship-line-partner` so partner structural type renders dashed in PNG (pre-existing bug). Remove the stale `.rel-cutoff` rule (the class is no longer applied after the relationship overhaul).

**Where:** Inside `exportPNG`, find the `styleEl.textContent = \`...\`` template string (around line 2742).

Replace:

```js
styleEl.textContent = `
    .person-shape { fill: #ffffff; stroke: #1f2937; stroke-width: 2; }
    .issue-quadrant { fill: #374151; opacity: 0.8; }
    .client-highlight { stroke: #06b6d4 !important; stroke-width: 3; fill: #e0f7fa; }
    .relationship-line { stroke: #374151; stroke-width: 2; fill: none; }
    .rel-close { stroke: #06b6d4 !important; }
    .rel-enmeshed { stroke: #a855f7 !important; }
    .rel-hostile { stroke: #f97316 !important; }
    .rel-cutoff { stroke-dasharray: 6,6 !important; }
    .rel-abuse { stroke: #ef4444 !important; stroke-width: 3 !important; }
    .deceased-x { stroke: #6b4e34; stroke-width: 3; }
    text { font-family: Inter, sans-serif; }
`;
```

With:

```js
styleEl.textContent = `
    :root { --tt-axis: #9ca3af; --tt-text: #1f2937; }
    .person-shape { fill: #ffffff; stroke: #1f2937; stroke-width: 2; }
    .issue-quadrant { fill: #374151; opacity: 0.8; }
    .client-highlight { stroke: #06b6d4 !important; stroke-width: 3; fill: #e0f7fa; }
    .relationship-line { stroke: #374151; stroke-width: 2; fill: none; }
    .relationship-line-partner { stroke-dasharray: 8 4; }
    .rel-close { stroke: #06b6d4 !important; }
    .rel-enmeshed { stroke: #a855f7 !important; }
    .rel-hostile { stroke: #f97316 !important; }
    .rel-abuse { stroke: #ef4444 !important; stroke-width: 3 !important; }
    .deceased-x { stroke: #6b4e34; stroke-width: 3; }
    text { font-family: Inter, sans-serif; }
`;
```

Three concrete changes:
- Added `:root { --tt-axis: #9ca3af; --tt-text: #1f2937; }` at the top so the cloned-SVG paths that use `var(--tt-axis, ...)` for distant and `var(--tt-text, ...)` for cut-off resolve via the CSS variable (the inline fallback was the safety net; this makes it explicit).
- Added `.relationship-line-partner { stroke-dasharray: 8 4; }` so Partner structural type (the dashed line) renders dashed in PNG. This was a pre-existing bug — the class is applied to partner lines in `drawRelationship` but the PNG inlined CSS never had the corresponding rule.
- Removed the `.rel-cutoff` dasharray rule. The class is no longer applied as of the relationship overhaul (cut-off is now solid line with gap + bars). The rule was harmless but stale.

**Do not touch:**
- Any other line in `exportPNG`.
- The main stylesheet at the top of the file.

**Acceptance criteria (code-level):**
1. The inlined `<style>` text contains `--tt-axis: #9ca3af` and `--tt-text: #1f2937` inside a `:root { ... }` rule.
2. The inlined `<style>` text contains `.relationship-line-partner { stroke-dasharray: 8 4; }`.
3. The inlined `<style>` text does NOT contain `.rel-cutoff`.
4. All other `.rel-*` rules are unchanged.

---

## Item 2 — Align PNG filename with JSON filename pattern

**Goal:** Match the Path A filename convention (`genogram_{clientSlug}_{date}.json`) for PNG exports.

**Where:** Inside `exportPNG`'s `img.onload` callback, find:

```js
a.download = `genogram_${new Date().toISOString().slice(0, 10)}.png`;
```

Replace with:

```js
const client = db.people.find(p => p.isClient);
const clientSlug = (client && client.name)
    ? client.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') || 'Unnamed'
    : 'Unnamed';
a.download = `genogram_${clientSlug}_${new Date().toISOString().slice(0, 10)}.png`;
```

This is the same slug logic used in `exportJSON` (Path A item 10).

**Do not touch:**
- The `URL.createObjectURL` / `revokeObjectURL` calls.
- The `showToast` call.

**Acceptance criteria (code-level):**
1. The PNG download filename matches the pattern `genogram_<slug>_<YYYY-MM-DD>.png`.
2. The slug logic matches `exportJSON` exactly (so JSON and PNG exports of the same genogram produce filenames with identical client slugs).

---

## Post-execution verification (Composer)

After both items implemented:

1. The inlined `<style>` text in `exportPNG` contains the new `:root` declaration, the `.relationship-line-partner` rule, no `.rel-cutoff` rule, and all other expected rules.
2. The PNG filename construction uses the same `client.isClient`-based slug logic as `exportJSON`.
3. No console errors. The function still runs without throwing (Composer can call `exportPNG()` from the DevTools console with an empty genogram and verify it shows the expected "Add at least one person…" toast).
4. Line count of `tool_genogram.html` increases by a small number (~3–6 lines).

If all four pass, report DONE.

---

## Out of scope

- Adding new symbols, classes, or features.
- Modifying the cloned-SVG dimensions, viewport, or background logic.
- Changing the JSON export.
- Any non-PNG-export change.

---

*End of build spec.*
