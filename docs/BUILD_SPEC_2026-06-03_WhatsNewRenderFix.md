# Build Spec — What's New render fix + content refresh

**Date:** 2026-06-03
**Author:** NEXUS (Cowork/Opus) → Composer
**Files:** `whats-new.html`, `dashboard.html`, `whats-new.json`
**Blast radius:** LOW. Front-end only. No Stripe, no JWT, no DB, no schema, no deploy-path change. `whats-new.json` is data; the two HTML files are static front-end. Standard SCP/rsync deploy.

---

## Background (the actual problem)

The What's New page renders **blank** in a real browser even though `whats-new.json` is valid and live on production. This was reported as "no content on whats-new.html." It is **not** a content/deploy problem with the JSON — the data serves correctly at `/whats-new.json`.

**Root cause (confirmed against disk + prod):** `.animate-on-scroll` is `opacity: 0` (plus blur + translateY) in `style.css`, made visible only when `.in-view` is added. `main.js` → `initScrollAnimations()` sets up the IntersectionObserver **once at `DOMContentLoaded`**, observing only the elements that exist at that instant. The update cards are created by the renderer **after** the async `fetch('whats-new.json')` resolves, each with `class="update-card animate-on-scroll"`. Those cards are never observed, never receive `.in-view`, and stay at `opacity:0` — rendered into the DOM but invisible. The page header and intro carry `animate-on-scroll` too, but they exist at load, get observed, and reveal — which is why the page looks present but empty.

Same defect pattern, second location: `dashboard.html` `#recent-updates` is `animate-on-scroll` + `display:none` at load, un-hidden after the fetch. Its injected `tool-row` children are fine (no `animate-on-scroll`), but the **container** can stick at `opacity:0` because the load-time observer's re-fire on a `display:none → visible` transition is not reliable across browsers. Fix it in the same pass for safety.

The principle to encode: **any `.animate-on-scroll` element that is injected or un-hidden after `DOMContentLoaded` must be explicitly revealed by the code that creates/shows it — never left to the load-time observer.**

---

## Goal

1. **P0 — Render fix.** What's New cards are visible on `whats-new.html`, and the Recent Updates block is visible on `dashboard.html`. The fade-in reveal animation is preserved (cards fade/slide in, not pop).
2. **P1 — Content refresh.** Add the missing Brainspotting entry to `whats-new.json` and freshen the weakest existing copy so the page reads like a cared-for product, not a fix log. (See "Content" below; the rewrite of existing entries is flagged optional.)

---

## Acceptance Criteria (binding)

**P0 — render**

1. Loading `whats-new.html` in a normal browser displays all entries from `whats-new.json` as visible cards (not `opacity:0`). Verified by: cards are readable on first load without any scroll-jiggle hack.
2. Each card still animates in (opacity/transform/filter transition runs) rather than appearing instantly with no transition.
3. On `dashboard.html`, the Recent Updates block and its rows are fully visible once `whats-new.json` loads.
4. No regression to the existing load-time reveal of static `animate-on-scroll` elements (header, intro, welcome banner, tool sections).
5. No new console errors on either page.
6. The error/empty paths still work: invalid/empty JSON shows the existing "Could not load updates." / "No updates yet." states (still visible, not stuck invisible).

**P1 — content**

7. A new Brainspotting entry exists in `whats-new.json`, valid JSON (no trailing commas), `date: "2026-05-28"`, `category: "Improvement"`, copy free of implementation jargon (no Hz, no function names, no "localStorage").
8. `whats-new.json` remains valid JSON and every entry still has all five fields (`id`, `date`, `category`, `title`, `summary`); `category` is exactly one of the four allowed values.

---

## Scope + DO-NOT-TOUCH

**In scope:** the inline renderer scripts in `whats-new.html` and `dashboard.html`; entries in `whats-new.json`.

**DO NOT TOUCH:** `auth.js`, `main.js`, `style.css` (do **not** change the `.animate-on-scroll` base rule — other pages depend on it), the IntersectionObserver in `main.js`, any payment/auth/API code, the badge/`bet_whats_new_last_seen` logic. Do not change deploy config or `.htaccess`.

---

## Implementation Notes (guidance — ACs win on conflict)

Preferred fix is the minimal, self-contained one: have each renderer reveal the elements it injects, on the next animation frame so the CSS transition still fires.

**`whats-new.html` → at the end of `renderUpdates(entries)`, after the `forEach` append loop:**

```js
// Reveal cards injected after the load-time IntersectionObserver already ran.
// rAF lets the browser paint the opacity:0 start state first, so the transition plays.
requestAnimationFrame(() => {
    list.querySelectorAll('.update-card.animate-on-scroll:not(.in-view)')
        .forEach(el => el.classList.add('in-view'));
});
```

**`dashboard.html` → in `renderRecent(entries)`, replace `container.style.display = '';` with the un-hide plus a reveal:**

```js
container.style.display = '';
requestAnimationFrame(() => container.classList.add('in-view'));
```

(The `tool-row` children carry no `animate-on-scroll`, so revealing the container is sufficient there.)

Do not solve this by removing `animate-on-scroll` from the cards (loses the reveal animation and the visual language) or by exposing `main.js`'s observer. Keep the fix inside each page's own renderer.

---

## Content

### New entry — ADD to `whats-new.json` (committed)

Brainspotting shipped a real upgrade on 2026-05-28 and has zero presence on the page. Add:

```json
{
    "id": "2026-05-28-brainspotting-upgrade",
    "date": "2026-05-28",
    "category": "Improvement",
    "title": "Brainspotting: smoother sessions, and your settings remembered",
    "summary": "Brainspotting now remembers how you like to work — speed, color, sound, and mode carry over between sessions instead of resetting each time. Press the spacebar to pause mid-processing without reaching for the mouse, and the tool honors your system's reduced-motion setting. If a tab closes unexpectedly, your session is offered back to you on reopen, and the end-of-session screen is now a clearer Session Review."
}
```

### Freshen existing copy (OPTIONAL — apply only on Matthew's go)

These read as a fix log or lead with the negative. Same `id`/`date`/`category` (so sort order and the unread-badge logic are untouched) — only `title`/`summary` change. Hold unless Matthew greenlights.

- `2026-05-27-life-map-data-safety` — retitle from "won't silently lose your work" to lead with the benefit:
  - title: `"Life Map: your work is protected"`
  - summary: `"Life Map now guards your edits end to end. Clicking outside a target's details no longer discards unsaved changes, a bug that could wipe a custom negative cognition on reopen is fixed, and if a tab closes before you export, you're offered your work back on reload."`
- `2026-05-27-genogram-privacy` — title stays fine; tighten summary lead:
  - summary: `"Genograms now always open to a blank canvas — nothing auto-loads. If a tab closes unexpectedly, you'll get a Keep / Discard prompt next time you open the tool, and anything autosaved before this change is migrated once so nothing is lost."`

(Other entries — EMDR context bridge, genogram symbols, polish pass, guided reports — are already strong; leave them.)

---

## Verify (Composer, before report-back)

1. Open `whats-new.html` in a real browser → all entries visible as cards, each fades/slides in. Hard-refresh (Cmd+Shift+R) to bypass cache.
2. Open `dashboard.html` logged in → Recent Updates block visible with top 3 rows.
3. Temporarily point the fetch at malformed JSON (or break a key) → confirm the empty/error state still shows and is visible. Revert.
4. DevTools console clean on both pages.
5. `whats-new.json` passes a JSON validator (paste into a linter or `JSON.parse`). Brainspotting entry present, five fields each, valid category.
6. Confirm static `animate-on-scroll` elements (header, intro, welcome banner, tool sections) still reveal normally — no regression.

## Rollback

Pure front-end. Revert the renderer edits in `whats-new.html` / `dashboard.html` and restore the prior `whats-new.json` from git. No data migration, no state to unwind.

## Report-back

State, per AC number, pass/fail. Include: (a) confirmation cards are visible AND animate (AC 1–2), (b) the final `whats-new.json` entry count, (c) whether the optional copy rewrite was applied or held, (d) any console output. Do not call the loop closed until verified against the rendered page, not just the code.
