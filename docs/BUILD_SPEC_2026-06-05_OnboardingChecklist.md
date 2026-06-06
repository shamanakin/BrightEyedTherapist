# Build Spec — Onboarding Layer 2: do-based quick-start checklist + just-in-time hints (Genogram Genie + Life Map)

**Date:** 2026-06-05
**Author:** NEXUS (Cowork/Opus) → Composer
**Files:** `tool_genogram.html`, `tool_timeline.html`
**Depends on:** `BUILD_SPEC_2026-06-05_ExampleData.md` (Layer 1) being merged first — this spec references the example-load action.
**Blast radius:** LOW. Front-end only, two tool files. No API/auth/Stripe/DB. No regression to the data-safety floor.

---

## Background

Layer 2 of the onboarding decision (see Layer 1 spec for context). Design principle, locked: **active beats passive.** This is NOT a sequential spotlight tour. It's a small, dismissible checklist card whose steps complete when the user actually performs them, plus one-time hints that appear at the moment they become relevant. Rationale: spotlight tours teach geography and are forgotten on dismissal; these tools are also gesture-heavy (right-click, space-drag, modifier-zoom), which spotlights can't teach. The target user is a skilled clinician with low tech confidence — one instruction at a time, attached to something they just did.

---

## Goal

First-time users of each tool see a compact quick-start card with 3 doable steps that check themselves off; contextual hints fire once each at the right moment; the whole system is re-enterable from the existing Help affordance and stays out of the way of everyone else.

---

## Acceptance Criteria (binding)

**The checklist card**

1. A compact card (~280px, non-modal, dismissible via an × control) appears over the canvas — bottom-right preferred — when the tool opens with an **empty canvas** AND the quick-start state is neither completed nor dismissed. It never blocks sidebar controls, toolbar buttons, or (Life Map) the mobile tools toggle; on narrow viewports it repositions or shrinks rather than covering controls.
2. Steps check off **live** (with a subtle visual confirmation) as the underlying data state changes — detection hooks into the existing state-mutation/render pipeline, **not polling**.
3. **Genogram steps:** ① Add your first person (people ≥ 1) ② Add a second person (people ≥ 2) ③ Connect them (structural relationships + emotional links ≥ 1, any kind).
4. **Life Map steps:** ① Add your first event (nodes ≥ 1) ② Add a different kind of event (≥ 2 distinct node types present) ③ Open an event and mark it as a target (any node `isTarget`).
5. Step copy is plain-language, no jargon — e.g. Genogram ③: "Connect them — right-click a person or use Manage Relationships." Life Map ③: "Click an event and mark it as a target."
6. On all steps complete: card shows a brief completion state ("You're going ✓"), auto-fades after ~3s, and persists `completed`.
7. Dismissing via × persists `dismissed` — the card does not return on subsequent visits.
8. **Loading the Layer-1 example silently marks the quick-start completed** (the example is the alternate learning path; steps must not "self-complete" as noise when example data lands).
9. Esc does NOT close the card (Esc stays reserved for modals — existing behavior untouched).

**Just-in-time hints (each fires at most once ever, persisted)**

10. Genogram: (a) after the **first person** is added → a small anchored tooltip near that person: "Right-click anyone for options — relationships, details, set as client." (b) after the **first relationship/emotional link** → "You can give any pair an emotional quality — close, distant, hostile and more."
11. Life Map: (a) after the **first event** → anchored near it: "Click an event to edit details — targets, SUDS, and cognitions live there." (b) after the **first target** is marked → anchored toward the Processing Queue: "Targets queue up here, prioritized for processing."
12. Hints are dismissible (click anywhere / ×), auto-dismiss after ~8s, never stack (max one visible), and render correctly in both themes.
13. Hints fire regardless of checklist state (a user who dismissed the card still gets them once), but never on example data load.

**Persistence + re-entry**

14. State persists in localStorage under the existing prefix convention: `bet_genogram_quickstart` / `bet_lifemap_quickstart` — a single JSON value holding checklist status and per-hint fired flags.
15. The existing Help affordance in each tool gains a "Quick start" entry that re-opens the checklist card (steps recompute from current data; a returning user with data sees applicable steps already checked). This also serves as the example re-entry point: the reopened card includes a small "or load an example" link wired to the Layer-1 loader **only when the canvas is empty**.
16. Nothing in this spec writes to sessionStorage draft keys or alters draft/recovery/beforeunload behavior.

**General**

17. No canvas layout shift; no console errors; both themes; no interference with zoom/pan/fullscreen.
18. Logged-out / overlay-gated visits: the quick-start must not render under the subscription overlay (defer first-show until the tool is actually usable).

---

## Scope + DO-NOT-TOUCH

**In scope:** the two tool files — card + hint markup/styles/logic, Help-menu entry, localStorage state.
**DO NOT TOUCH:** `auth.js`, `subscription_overlay.js` (read its state if needed for AC 18, don't modify), `api/**`, other tools, draft/recovery logic, import/export formats, the Layer-1 example datasets.

## Implementation Notes (guidance — ACs win)

- Hook step-detection where the tools already centralize state changes (the save/render pipeline both tools run on every mutation) — one cheap check per mutation, not timers.
- Anchored hints: position relative to the new person/event's rendered element; fall back to fixed positioning near the relevant control if the element is off-viewport.
- Keep the card's visual language consistent with each tool's existing empty-state card (same radii/typography family, both themes).
- Don't animate excessively; respect `prefers-reduced-motion` for the check-off and fade animations (Brainspotting set the precedent).

## Verify (Composer, before report-back)

1. Fresh profile (cleared localStorage), both tools, both themes: card appears on empty canvas; perform each step → live check-off → completion fade; reload → card gone.
2. Fresh profile: dismiss via × → reload → gone. Help → "Quick start" → card returns; steps reflect current data.
3. Fresh profile: load example → no card, no hints, state = completed.
4. Hints: each fires exactly once at its trigger, in both tools; never two at once; reduced-motion honored.
5. Mobile-width viewport: card/hints don't cover controls.
6. Console clean throughout; draft recovery flow unaffected (close with unsaved work → banner still appears and restores).

## Rollback

Front-end only: revert the two files from git.

## Report-back

Per AC number pass/fail; screenshots: card initial state, mid-progress, completion, one hint per tool (light + dark); note the exact localStorage value shape used.
