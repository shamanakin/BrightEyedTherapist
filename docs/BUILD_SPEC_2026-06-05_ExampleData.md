# Build Spec — Onboarding Layer 1: "See an example" (Genogram Genie + Life Map)

**Date:** 2026-06-05
**Author:** NEXUS (Cowork/Opus) → Composer
**Files:** `tool_genogram.html`, `tool_timeline.html`
**Blast radius:** LOW. Front-end only, two tool files. No API, auth, Stripe, or DB. No change to the data-safety floor (sessionStorage drafts, recovery banners, beforeunload guards stay exactly as they are).

---

## Background

Clinician feedback: the tools need an easier on-ramp for users who are strong clinically but weak technically. Decision (Matthew, 2026-06-05): layered onboarding. **Layer 1 (this spec):** a "See an example" button in each tool's existing empty-state card that loads a small, obviously-fictional dataset through the tool's existing import path. A new clinician who sees a finished genogram/life map learns the symbol language and the destination instantly, and gets real objects to explore (right-click, open, filter) on data they can't break. **Layer 2 (separate spec, `BUILD_SPEC_2026-06-05_OnboardingChecklist.md`):** do-based first-run checklist. Layer 3 (help GIFs) is deferred — needs Matthew's screen recordings.

Both tools already have everything this needs: empty-state cards with CTAs (`#genogram-empty-state` / `#empty-state-add-btn`; `.timeline-empty-state` / `.empty-state-cta`), JSON import paths (`importJSON()` ~line 1823 in genogram; FileReader import ~line 1754 in lifemap), and toast systems.

---

## Goal

In each tool's empty-state card, a secondary "See an example" button loads a bundled fictional dataset that renders a clinically rich, immediately legible example — through the same apply-data code path as file import.

---

## Acceptance Criteria (binding)

**Shared**

1. A "See an example" button appears in the empty-state card of each tool, visually secondary to the existing primary CTA ("Add first person" / "Add your first event"), styled correctly in **both themes**.
2. The example dataset is bundled as an **inline JS constant** in each tool file (these are single-file tools — no fetch, no new network dependency).
3. The example loads through the **same post-parse apply path as file import** (factor the apply step out of the FileReader callback if needed so file-import and example-load share it). It must be in the **current** schema: zero console errors AND zero legacy-migration shim activity on load. Do not trust the stale schema comments at the top of `tool_genogram.html` (~lines 911–913) — derive the current `structuralType` and emotional-`quality` enums from the live code (relationship creation + `migrateEmotionalLinks`), then build the dataset against those.
4. On load: empty-state card hides (existing visibility logic), a toast confirms — copy: **"Fictional example loaded — explore freely. Reset / New starts your own."** (adjust trailing phrase per tool's actual reset affordance).
5. After load, the example behaves as normal working data: draft autosave, recovery banner, export, beforeunload guard all function normally. No special-casing.
6. Guard: if data somehow exists when the button fires, apply the same confirm/overwrite protection the file-import path uses.
7. Export → re-import round-trip of the example renders identically (proves schema validity).
8. All names/content obviously fictional; no real-person resemblance.

**Genogram example — "Rivera family (fictional)" — must showcase, visibly, at 100% zoom with no overlapping cards:**

9. 8 people across 3 generations, laid out generationally (grandparents top, client's generation bottom, client centered):
   - G1: **Rosa** (F, b. 1948, deceased, `issues.substanceUse` true) ⚭ **Miguel** (M, b. 1945, deceased) — **married**
   - G2: **Carmen** (F, b. 1972) + **David** (M, b. 1970) — **divorced**, children Maya & Leo. **Elena** (F, b. 1975, Carmen's sister; child of Rosa & Miguel) + **Sam** (M, b. 1974) — **partner** (unmarried)
   - G3: **Maya** (F, b. 1998, `isClient: true`, `issues.mentalHealth` true) and **Leo** (M, b. 2001)
10. Structural types shown: married, divorced, partner, plus correct parent→child links (Rosa+Miguel → Carmen, Elena; Carmen+David → Maya, Leo).
11. Emotional links (one per pair — the code enforces a single emotional link per pair; respect it): Maya↔Carmen **close** · Maya↔Rosa **close** · Carmen↔Rosa **enmeshed** · Carmen↔David **hostile** (zigzag) · Leo↔David **distant** · David→Maya **abuse**, emotional subtype, direction David→Maya ("E" badge renders) · Elena↔Sam **volatile** (close+hostile combined render).
12. Client marker renders on Maya; deceased markers on Rosa and Miguel; issue flags render on Rosa and Maya.

**Life Map example — "Example Client (fictional)" — client field populated, range ~1992–2026:**

13. Events (use the current node schema; types as the tool defines them):
    - trauma point **"Car accident"** (2003) — **target**: NC "I'm not safe", SUDS 7, processing not started
    - trauma duration **"Parents' high-conflict divorce"** (2000–2002) — **target + touchstone**: NC "It's my fault", SUDS 8
    - positive: **"Met best friend Sam"** (1999) · **"College graduation"** (2014) · **"Wedding"** (2019)
    - resource: **"Grandma's house — safe place"** (1996) · **"Started therapy"** (2023)
    - neutral: **"Moved to Sacramento"** (2010)
14. With the example loaded: Processing Queue shows **2** targets; view filters are each meaningful (Trauma → 2 nodes, Supports → positives/resources, Targets → 2); the duration event renders as a span; touchstone marker renders.
15. Timeline range inputs adjust (or the data fits the loaded range) so all events are visible without manual range editing.

---

## Scope + DO-NOT-TOUCH

**In scope:** the two tool files — empty-state markup, the inline datasets, the shared apply-path factor, the toast call.
**DO NOT TOUCH:** `auth.js`, `subscription_overlay.js`, `api/**`, other tools, `whats-new.*`, draft/recovery/beforeunload logic (consume, don't modify), import/export file formats.

## Implementation Notes (guidance — ACs win)

- Keep the button copy short: "See an example". Secondary visual weight (outline/ghost) so the primary CTA stays primary.
- Known limitation, accepted: if the user dismisses the empty-state card, there's no example re-entry this layer. Layer 2 adds a Help-menu "Quick start" re-entry; don't build extra affordances here.
- Genogram x/y positions: hand-tune the constants until AC 9's no-overlap holds in both themes. Check against the auto-scroll/center behavior on load.

## Verify (Composer, before report-back)

1. Both tools, both themes: button renders; example loads; every per-tool AC item visually confirmed in a real browser (screenshot each tool's loaded state for the report).
2. Console completely clean on load (no errors, no migration-shim logs).
3. Export the loaded example, re-import it: identical render (AC 7).
4. Close tab with example loaded, reopen: recovery banner appears and Keep restores (AC 5).
5. Right-click a genogram person / open a Life Map event: editing works normally on example data.

## Rollback

Front-end only: revert the two files from git.

## Report-back

Per AC number pass/fail; screenshots of both loaded examples (light + dark); confirmation of which enums were derived from live code and what they were (so the stale schema comments can be corrected in a follow-up).
