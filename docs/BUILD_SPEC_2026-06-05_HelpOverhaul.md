# Build Spec — Help-system overhaul, all five tools

**Date:** 2026-06-05
**Author:** NEXUS (Cowork/Opus) → Composer
**Files:** `js/emdr/bls-host.js`, `tool_emdr.html`, `tool_emdr_guided.html`, `tool_brainspotting.html`, `tool_timeline.html`, `tool_genogram.html`
**Blast radius:** LOW-MEDIUM. Front-end help UI only — but `bls-host.js` is shared by both EMDR pages and contains live session/share logic; the help change there must be surgically scoped to `openHelpModal` and its wiring. No API, auth, Stripe, DB, BLS engine, draft/recovery, or share-session changes.

---

## Background and design intent (read this; it governs ambiguity)

Clinician feedback: help surfaces are walls of text. Current state, verified on disk: EMDR Suite and EMDR Guided share ONE `openHelpModal` (in `bls-host.js`, ~line 405) — a 4-item numbered list; Guided gets no guided-specific help at all. Brainspotting (`openHelpModal`, tool file ~1815) is structured but text-only. Life Map is a small 4-bullet panel. Genogram is a 240px hover tooltip that describes visual symbols **in prose** ("Zigzag: Hostile") instead of drawing them.

**Design principle, locked: show, don't describe.** Every help surface becomes a "help sheet" — a scannable grid of compact rows where each row leads with the *actual visual* (the toolbar button's real icon, a `<kbd>`-styled key cap, a color dot matching the canvas, or — in Genogram — the real drawn symbol) followed by a name and ONE plain-language line. Copy is for skilled clinicians who are not technical: verb-first, no jargon, clinical when it earns it. Sections per sheet, in order: **Start here** (numbered, ≤4 steps) → **Controls** (icon rows) → tool-specific section(s) → **Keys** (`<kbd>` rows) → one-line clinical/privacy footer.

All copy below is **binding** (typo-level fixes allowed; meaning changes are not).

---

## Shared Acceptance Criteria (all five surfaces)

S1. Help opens on click (not hover), as a modal sheet consistent with each tool's existing modal styling. Esc closes it. Backdrop-click MAY close it (help is not a heavy data modal — this is the one allowed backdrop-close).
S2. Control rows render the **same icon markup** the real toolbar buttons use (same FontAwesome class or inline SVG) so the row is visually identical to the button the user will look for. Key rows use a styled `<kbd>` cap.
S3. Light + dark theme correctness where the tool has themes (Genogram, Life Map). EMDR/Brainspotting are dark-canvas tools — their existing modal styling stands.
S4. No regression: session/share logic, BLS engine, draft/recovery, beforeunload, subscription overlay, analytics calls all untouched. Esc-closes-modals and existing keyboard behavior unchanged outside the help sheet.
S5. Mobile/narrow viewports: the sheet scrolls internally; it never overflows the viewport or hides its close control.
S6. No new dependencies. Inline SVG where symbols must be drawn.
S7. Console clean opening/closing help on every page.

---

## 1 — EMDR Suite + EMDR Guided (shared: `js/emdr/bls-host.js`)

**Mechanism (binding):** redesign `openHelpModal` in `bls-host.js` once. Extend the host's init/config with an optional `helpExtraHtml` string; when present, it renders as an additional section before the footer. `tool_emdr.html` passes nothing (gets the base sheet). `tool_emdr_guided.html` passes the Guided section below. One implementation, two outcomes. Do not fork the function per page.

**Base sheet — EMDR Suite (and Guided):**

*Start here*
1. Have your client settle where they can comfortably track the whole screen.
2. Choose a path, speed, and size together — what matters is what your client tracks easily.
3. Press **Start BLS** or tap <kbd>Space</kbd>. Same to stop between sets.
4. Telehealth? Click **Share** and send your client the link.

*Controls* (each row: real toolbar icon + name + line)
- **Speed** — How fast the target moves. Start slow; adjust to your client's tracking.
- **Mode** — Moving dot or full lightbar.
- **Color** — Pick what your client tracks comfortably against the dark screen.
- **Path** — Horizontal (smooth sweep), Diagonal, or Saccade (instant left-right jumps — some clients track jumps better than sweeps).
- **Size** — Slider for dot or bar size.
- **Audio** — Tones that alternate left-right in sync with the visual. Headphones on the client's side work best.
- **Full** — Fullscreen for sessions.
- **Share** — Creates a private link your client opens on their end. They see only the moving target — never your controls and never any clinical information.

*Keys*
- <kbd>Space</kbd> — start / stop a set
- <kbd>Esc</kbd> — close any window

*Footer:* Sets are counted at the bottom of the screen. For trained EMDR clinicians — pace within your client's window of tolerance.

**Guided extra section (passed as `helpExtraHtml` by `tool_emdr_guided.html`):**

*This page: Guided protocol*
- **Protocol picker** — five protocols, one goal each: **Standard** (reprocess a past memory) · **Recent Event** (a memory from the last weeks) · **Present Trigger** (a current cue that sets the client off) · **Flash-Forward** (desensitize a worst-case future image) · **Future Template** (rehearse coping in an upcoming situation).
- **Your notes stay here** — phase notes live in this browser tab only and are never sent to our servers.
- **Session report** — when you finish, download a plain-text report from the panel, ready for your chart.

### ACs

E1. Both EMDR pages show the redesigned sheet; only Guided shows the Guided section; plain EMDR shows no empty placeholder where it would be.
E2. `helpExtraHtml` (or equivalently named single config field) is the only new coupling between pages and host help. Diff of `bls-host.js` touches `openHelpModal`, the config plumbing, and nothing in session/share/BLS code paths.
E3. Control rows use the toolbar's actual icon markup (S2) for all eight controls listed.

---

## 2 — Brainspotting (`tool_brainspotting.html`)

Keep the existing good bones (Quick Start / Controls / clinical note); rebuild in the sheet pattern with real icons, and add the two things text can't carry:

*Start here* — keep current 5 steps, tightened to 4:
1. Click **Start Session** and choose your session type.
2. **Scan**: your client follows the pointer — horizontal first, then vertical. <kbd>Space</kbd> or click locks each axis. **Manual**: you guide the pointer with your mouse and click to lock the spot.
3. Once locked, the pointer holds still while your client processes. <kbd>Space</kbd> pauses.
4. **Another Round** for another pass; **Review / End** to wrap up with SUDs and notes.

*Session phases* (new — a single horizontal strip): Setup → Scan → Lock → Process → Review. One line under it: "Check-ins ask for SUDs as you go; the Review screen collects the session."

*Controls* (real icons): Speed — scanning pace (Slow / Medium / Fast). Mode — Scan (automatic) or Manual (you guide). Color — pointer color. Audio — biolateral audio, alternating left-right. Progress — SUDs over time for this session. Notes — session notes, available once a session is active. Share — a private viewer link for telehealth; your client sees only the pointer. Fullscreen.

*Keys:* <kbd>Space</kbd> — lock an axis during scan; pause during processing. <kbd>Esc</kbd> — close any window.

*Footer:* Your settings — speed, color, audio, mode — are remembered on this device. For trained Brainspotting practitioners; monitor activation and take breaks as needed.

### ACs

B1. Sheet replaces the current text modal; phases strip renders; all eight control rows carry the real toolbar icons.
B2. The SUDs/Notes "available once a session is active" behavior is stated, matching actual behavior.

---

## 3 — Life Map (`tool_timeline.html`)

Replace the 4-bullet panel with the sheet (click-open). The existing "Quick start" link stays and is joined by "See an example" (wired to the Layer-1 loader, shown only when the canvas is empty — same rule as the quickstart card).

*Start here*
1. Put your client's name or initials at the top of the sidebar.
2. Add events with the colored buttons — you can drag them on the timeline afterward.
3. Click any event to add details — body sensations, cognitions, SUDS — or to mark it as a target.
4. **Export JSON** before you close: your map lives in this tab only until you save it.

*Event types* (rows lead with the actual canvas color dot): **Trauma** (red) — single events, or use Duration for sustained periods. **Positive** (green) — strengths, wins, supports. **Resource** (amber) — safe places, anchors, people. **Neutral** (gray) — context that helps the story read.

*Targets & the queue* — Mark any event as a **target** and it joins the Processing Queue, prioritized. A **touchstone** flags the earliest related memory. The **EMDR button** on a target opens the BLS tool with that target's name, cognition, and SUDS already on screen.

*Keys:* <kbd>⌘/Ctrl</kbd> + scroll — zoom the timeline. <kbd>Esc</kbd> — close any window.

*Footer:* Nothing you enter here is sent to our servers — export to keep, import to continue.

### ACs

L1. Sheet replaces the panel; event-type rows use the same color values the canvas nodes use (reference the existing CSS variables/classes — no hardcoded near-misses).
L2. Quick start + See an example links behave per the Layer-2 rules (example link only on empty canvas).

---

## 4 — Genogram Genie (`tool_genogram.html`) — the flagship of this spec

Convert the hover tooltip into a click-open sheet, and replace the prose legend with a **drawn legend**: every symbol rendered as a small inline SVG swatch.

**Anti-drift rule (binding):** legend swatches must reuse the exact stroke patterns / classes / CSS variables the live canvas renderer uses for each relationship type — derive from the same place the canvas draws from, so the legend cannot disagree with the canvas. Same for the person shapes and quadrant shading.

*Start here*
1. Right-click the canvas (or **Add New Person**) to add your first person.
2. Right-click a person to add parents, partners, and children around them.
3. **Manage Relationships** adds emotional lines between any two people.
4. Drag people to arrange. **Export JSON** to keep your work — it lives in this tab only.

*Reading the map* (drawn legend, two groups)
- **People:** □ male · ○ female · ◇ other/nonbinary · X through shape = deceased · shaded quadrants: top-left trauma, top-right mental health, bottom-left substance use, bottom-right physical.
- **Couples & kids:** solid = married · dashed = partner · one slash = separated · two slashes = divorced · lines drop down to children.
- **Emotional lines:** thin dashed = distant · double = close · triple = enmeshed · zigzag = hostile · double + zigzag = volatile · break with bars = cut-off · jagged with arrow = abuse, with optional P / S / E badge (physical / sexual / emotional).

*Keys:* <kbd>Space</kbd> + drag — pan without grabbing people. <kbd>⌘/Ctrl</kbd> + scroll — zoom. <kbd>Delete</kbd> — remove selected person. <kbd>Esc</kbd> — close any window.

*Footer:* Use initials when you can; exports may contain identifying information. Nothing is sent to our servers.

Links: **Quick start** (existing) + **See an example** (empty canvas only).

### ACs

G1. Hover tooltip replaced by click-open sheet; the help button keeps its position and icon.
G2. Every legend row renders a drawn SVG swatch, not a text description; each of the 7 emotional types, 4 structural states, 3 person shapes, deceased mark, and quadrant shading appears.
G3. Anti-drift: a code-level check that swatches share the renderer's stroke definitions (shared constants/classes — not copy-pasted values). Reviewer must be able to point to the single source.
G4. Both themes; the legend reads correctly on dark.

---

## Scope + DO-NOT-TOUCH

**In scope:** help markup/styles/wiring in the five files + `openHelpModal`/config plumbing in `bls-host.js`.
**DO NOT TOUCH:** BLS engine and session/share code in `bls-host.js` and `bls-sync.js`; guided protocol engine/storage/report modules; draft/recovery/beforeunload systems; subscription overlay; `auth.js`; `api/**`; quickstart/example systems (link into them, don't modify them); analytics calls.

## Verify (Composer, before report-back)

1. All five pages: open help, screenshot each sheet (Genogram + Life Map in both themes), close via Esc and via backdrop.
2. Genogram: visually compare each legend swatch against the same relationship drawn on canvas — must match (G3 evidence: cite the shared source in the report).
3. EMDR plain vs Guided: confirm the Guided section appears only on Guided.
4. Regression sweep: start/stop BLS, create a share link (then end it), Brainspotting scan→lock→pause, Life Map add event + mark target, Genogram add person + relationship — all unchanged. Console clean throughout.
5. Narrow viewport (~390px) on all five sheets.

## Rollback

Front-end only: revert the six files from git. No state, no data.

## Report-back

Per AC (S/E/B/L/G numbering) pass/fail; screenshots listed in Verify 1; the G3 shared-source citation; any copy you changed at typo level, quoted before/after.
