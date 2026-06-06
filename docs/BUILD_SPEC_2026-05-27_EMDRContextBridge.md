# EMDR Target Context Bridge (Path B)

**Target files:** `tool_timeline.html` AND `tool_emdr.html`
**Scope:** When the therapist clicks the EMDR button on a Life Map target, pass that target's context (title, negative cognition, image, body location, SUDS, VoC) to the BLS tool via URL params. The BLS tool displays a dismissible context strip at the top of the canvas so the therapist can see what they're processing without holding it all in working memory.
**Date:** May 27, 2026

This spec is the source of truth. Audit context is in `docs/LIFEMAP_AUDIT_2026-05-27.md` item 5 ("smaller version"). Execute items in the order given.

---

## Global guardrails

1. **Exactly two files are modified:** `tool_timeline.html` and `tool_emdr.html`. No other file in the repo is touched.
2. Do not rename existing functions, variables, or DOM ids.
3. Do not refactor adjacent code.
4. No new external dependencies.
5. **URL params are user-supplied data after one hop through `window.open` — they MUST be rendered to the DOM via `textContent`, never `innerHTML`.** No exceptions. This is XSS prevention.
6. **No persistence of context-strip dismiss state.** If the therapist refreshes or reopens, the strip reappears with the current URL params. Keep it simple.
7. Light-mode and dark-mode parity isn't relevant — the BLS tool is canvas-dark by design and the context strip is styled to match.
8. The strip must not interfere with: the floating Dashboard button (top-left), the BLS toolbar (bottom), the share-to-client flow, or fullscreen mode.

---

## Pre-flight check

Confirm:
- `tool_timeline.html` contains the function `openEMDRTool` (around line 1241).
- `tool_emdr.html` contains `<div id="bls-container">` (around line 46).
- The `selectedTargetId` and `state.nodes` references exist in `tool_timeline.html`.

If anything is missing, stop and report.

---

## Item 1 — Life Map: build URL params in `openEMDRTool`

**Goal:** Replace the parameter-less `window.open('tool_emdr.html', '_blank')` with a URL that carries the selected target's clinical fields. Truncate long strings defensively. Skip empty fields entirely (so the EMDR tool can render only what's actually populated).

**Where:** Inside `tool_timeline.html`, find:

```js
function openEMDRTool() {
    window.open('tool_emdr.html', '_blank');
}
```

Replace with:

```js
function openEMDRTool() {
    let url = 'tool_emdr.html';
    if (selectedTargetId) {
        const node = state.nodes.find(n => n.id === selectedTargetId);
        if (node && node.isTarget) {
            const t = node.emdrTarget || {};
            const truncate = (str, len) => String(str || '').trim().slice(0, len);
            const params = new URLSearchParams();

            const title = truncate(node.title, 80);
            if (title) params.set('target', title);

            const nc = truncate(t.negCognition, 120);
            if (nc) params.set('nc', nc);

            const image = truncate(t.image, 120);
            if (image) params.set('image', image);

            const body = truncate(t.bodyLocation, 80);
            if (body) params.set('body', body);

            const suds = t.sudsCurrent ?? t.sudsInitial;
            if (suds !== undefined && suds !== null && suds !== '') {
                params.set('suds', String(suds));
            }

            const voc = t.vocCurrent ?? t.vocInitial;
            if (voc !== undefined && voc !== null && voc !== '') {
                params.set('voc', String(voc));
            }

            const qs = params.toString();
            if (qs) url += '?' + qs;
        }
    }
    window.open(url, '_blank');
}
```

**Notes:**
- `URLSearchParams` handles percent-encoding automatically — no manual `encodeURIComponent` needed.
- `t.sudsCurrent ?? t.sudsInitial` uses the most recently logged SUDS if available, falling back to the initial baseline. Same for VoC.
- Empty string checks (`suds !== ''`) prevent malformed params like `suds=`.
- Truncation limits: title and body 80 chars; NC, PC, image 120 chars. Well within URL length limits even for the longest combined payload.

**Do not touch:**
- Any other function in `tool_timeline.html`.
- The "EMDR" button HTML or click binding (the click handler is unchanged — it still calls `openEMDRTool()`).

**Acceptance criteria (code-level):**
1. `openEMDRTool` constructs a URL with `URLSearchParams`.
2. The function checks `selectedTargetId` and `node.isTarget` before adding params.
3. Empty/null/undefined fields are skipped, not included as empty params.
4. The `window.open` call uses the constructed URL.
5. Targets with NO `emdrTarget` populated (just `isTarget: true`) still pass the title.

---

## Item 2 — EMDR tool: context strip HTML + CSS

**Goal:** A small, dismissible card at the top-center of the BLS canvas that displays the incoming target context. Styled to match the dark BLS aesthetic, doesn't compete with controls.

**What changes:**

(a) Add CSS inside the existing `<style>` block in `tool_emdr.html` `<head>`. Place near the existing `.emdr-toast` rule (around line 38):

```css
#emdr-context-strip {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(31, 41, 55, 0.94);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.92);
    padding: 0.65rem 0.85rem 0.65rem 1.1rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 90;
    max-width: min(640px, calc(100vw - 2rem));
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    display: none;
    align-items: center;
    gap: 0.85rem;
    line-height: 1.35;
}
#emdr-context-strip.visible { display: flex; }
#emdr-context-strip .context-body {
    min-width: 0;
    flex: 1;
}
#emdr-context-strip .context-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    min-width: 0;
}
#emdr-context-strip .context-label {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.55);
    flex-shrink: 0;
}
#emdr-context-strip .context-target {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}
#emdr-context-strip .context-detail {
    margin-top: 0.2rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
}
#emdr-context-strip .context-nc { font-style: italic; }
#emdr-context-strip .context-nc::before { content: '"'; }
#emdr-context-strip .context-nc::after { content: '"'; }
#emdr-context-strip .context-suds,
#emdr-context-strip .context-body-loc {
    color: rgba(255, 255, 255, 0.65);
}
#emdr-context-strip .context-close {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.4rem;
    cursor: pointer;
    padding: 0 0.35rem;
    line-height: 1;
    align-self: flex-start;
    font-family: inherit;
}
#emdr-context-strip .context-close:hover { color: rgba(255, 255, 255, 0.9); }
```

(b) Add the HTML inside `<div id="bls-container">` (around line 46). Place it as the FIRST child of `#bls-container`, before the `<a href="dashboard.html" ...>` Dashboard button. The strip needs to live inside `#bls-container` so it inherits fullscreen behavior cleanly.

Insert:

```html
<div id="emdr-context-strip" role="status" aria-live="polite">
    <div class="context-body">
        <div class="context-row">
            <span class="context-label">Processing</span>
            <span class="context-target" id="ctx-target-text"></span>
        </div>
        <div class="context-detail">
            <span class="context-nc" id="ctx-nc-text" style="display:none;"></span>
            <span class="context-suds" id="ctx-suds-text" style="display:none;"></span>
            <span class="context-body-loc" id="ctx-body-text" style="display:none;"></span>
        </div>
    </div>
    <button class="context-close" id="ctx-close-btn" type="button" aria-label="Dismiss target context">&times;</button>
</div>
```

**Do not touch:**
- The Dashboard button (`floating-dashboard-btn`).
- The `app-chrome-bottom-right` watermark cluster.
- The `#stimulus` or `#lightbar-container` elements.
- The BLS toolbar.

**Acceptance criteria (code-level):**
1. The CSS block exists with `#emdr-context-strip`, `.visible`, `.context-*`, and `.context-close` rules.
2. The HTML element exists inside `#bls-container`.
3. The strip default `display` is `none` (only shown when `.visible` is added).
4. All five inner text spans have unique ids: `ctx-target-text`, `ctx-nc-text`, `ctx-suds-text`, `ctx-body-text`, plus the close button `ctx-close-btn`.

---

## Item 3 — EMDR tool: parse URL params and render

**Goal:** On boot, read URL params and populate the strip. If no `target` param is present, the strip stays hidden (regular EMDR Suite usage is unaffected). The close button dismisses the strip with a single click.

**What changes:**

In `tool_emdr.html`, find the existing boot script at the bottom (around line 132):

```html
<script>
document.addEventListener('DOMContentLoaded', () => { BET.BlsHost.init(); });
</script>
```

Replace with:

```html
<script>
function applyEmdrTargetContext() {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('target');
    if (!target) return;

    const strip = document.getElementById('emdr-context-strip');
    if (!strip) return;

    const targetEl = document.getElementById('ctx-target-text');
    targetEl.textContent = target;

    const nc = params.get('nc');
    const ncEl = document.getElementById('ctx-nc-text');
    if (nc) {
        ncEl.textContent = nc;
        ncEl.style.display = '';
    }

    const suds = params.get('suds');
    const sudsEl = document.getElementById('ctx-suds-text');
    if (suds !== null && suds !== '') {
        sudsEl.textContent = `SUDS ${suds}`;
        sudsEl.style.display = '';
    }

    const body = params.get('body');
    const bodyEl = document.getElementById('ctx-body-text');
    if (body) {
        bodyEl.textContent = `Body: ${body}`;
        bodyEl.style.display = '';
    }

    strip.classList.add('visible');

    const closeBtn = document.getElementById('ctx-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            strip.classList.remove('visible');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    BET.BlsHost.init();
    applyEmdrTargetContext();
});
</script>
```

**Notes:**
- Every URL param value is rendered to `.textContent`. No `innerHTML`. XSS-safe.
- The `voc` and `image` params are received from Life Map (per Item 1) but intentionally NOT displayed in the strip — they're useful for the therapist's clinical memory but would crowd the strip visually. They remain in `window.location.search` if anything else (or a future enhancement) wants them. This is a deliberate display choice, not an oversight.
- `suds` check uses `!== null && !== ''` so a `suds=0` value renders correctly (SUDS of 0 is valid and clinically meaningful).
- Dismissal is in-tab only. Closing and re-opening from Life Map will re-display.

**Do not touch:**
- The `BET.BlsHost.init()` call — it runs first, unchanged.
- Any other script tag in the file.

**Acceptance criteria (code-level):**
1. `applyEmdrTargetContext` is defined.
2. It's called from the DOMContentLoaded handler after `BET.BlsHost.init()`.
3. The function returns early if no `target` param is present.
4. All four populated text fields use `textContent` (not `innerHTML`).
5. Empty/missing fields are hidden via `display: none` (or remain hidden as default).
6. The close button removes the `.visible` class.

---

## Post-execution verification (Composer)

After all three items implemented:

1. **No console errors in either file.** Reload Life Map — no errors. Open `tool_emdr.html` directly with no params — no errors, no strip visible.
2. **Direct EMDR access unaffected.** Opening `tool_emdr.html` from the dashboard (no URL params) shows the regular BLS interface with no context strip.
3. **Param construction.** In Life Map, create a target with title "Car accident, age 8", NC "I am unsafe", body "chest", SUDS 8. Click EMDR. The new tab's URL contains `?target=Car+accident%2C+age+8&nc=I+am+unsafe&body=chest&suds=8` (or equivalent — `URLSearchParams.toString()` may choose `%20` or `+` for spaces; both are valid).
4. **Strip render.** The new BLS tab displays a dark strip at top-center with:
   - "PROCESSING" label
   - The target title in bold
   - The NC in italics, in quotes, on the detail row
   - "SUDS 8" on the detail row
   - "Body: chest" on the detail row
   - An "×" close button
5. **Empty fields skipped.** If only `target` and `suds` are passed, the NC and body spans remain `display: none`.
6. **Dismissal.** Click the "×" — strip disappears. Click anywhere else — strip stays gone. No console errors.
7. **XSS smoke test.** Construct a manual URL with `target=<script>alert(1)</script>Hostile` — the strip displays the literal text, no script executes.
8. **Targets with no `emdrTarget`** (i.e., marked as target but no clinical fields filled in) — the strip shows the title and "PROCESSING" label only. Detail row stays empty.

If all eight pass, report DONE.

---

## What will benefit from eventual visual confirmation (low urgency)

When you have bandwidth, eyeball:

- The strip's contrast against the canvas in different states (BLS running vs. stopped, dot color variations).
- Behavior at narrow viewport widths — the strip should ellipsis the title gracefully on mobile (the `max-width: min(640px, calc(100vw - 2rem))` should handle this but worth confirming).
- The strip's positioning during fullscreen mode — since it's inside `#bls-container`, it should follow into fullscreen, but the exact target element of the Fullscreen API call may differ.
- Tab title or favicon doesn't need to change — keeps consistent with the regular EMDR tool. (Worth noting if you'd prefer a "Processing: [Target]" tab title; that would be a separate small change.)

---

## Out of scope

- The "bigger version" of Path B — routing to `tool_emdr_guided.html` instead of `tool_emdr.html`, with set count and notes flowing back into Life Map's session log. This requires coordination with `guided-storage.js` and is a separate epic.
- Genogram → EMDR launch (Genogram has no concept of EMDR targets; family-member context wouldn't map cleanly).
- Brainspotting integration (similar shape; defer).
- Tab title customization based on context.
- Storing dismiss state in sessionStorage.
- Any backend / API / auth file.

---

*End of build spec.*
