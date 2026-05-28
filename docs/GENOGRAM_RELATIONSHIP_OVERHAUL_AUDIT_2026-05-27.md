# Genogram Genie — Relationship Symbol Overhaul

**Date:** May 27, 2026
**Source:** `tool_genogram.html` — focus on `drawRelationship` (~line 1015) and `drawEmotionalLink` (~line 1089)
**Author:** Claude
**Companion artifact:** Inline visual mockup shown in chat (current vs proposed for each changed symbol)

---

## Framing

The user goal: an overhaul of the relationship dynamics display. SOTA-informed (McGoldrick et al., *Genograms: Assessment and Intervention*), but **readability and clinical obviousness override strict adherence** when they conflict. Where the spec deviates from canonical convention, it's flagged as a pragmatic compromise so future-you can revisit.

This audit covers eleven relationship types. Six are unchanged (already correct or close enough). Five are changed. Two are new. One is a structural type that's currently lumped under another and needs to split out.

---

## What's unchanged (and why)

These already match SOTA convention and read clearly. No changes proposed.

**Married (structural).** Single solid line. Matches.

**Partner / cohabiting (structural).** Dashed line. Matches.

**Close (emotional).** Two parallel cyan lines. Matches the "double bond" convention used in family systems literature.

**Enmeshed (emotional).** Three parallel purple lines. Matches the canonical "fused/enmeshed" symbol. Some traditions call this "fused"; the tool calls it "enmeshed" — same thing, no rename needed unless you want one.

**Connected / neutral (emotional default).** Single default-color line. Matches.

These aren't included in the visual mockup because there's nothing to compare. They're staying.

---

## What's changing

### 1. Divorced — bigger, clearer slashes

**Current:** Solid line with two tiny ticks at the midpoint, roughly 8px tall. Visible at 100% zoom on a 15" laptop, invisible at typical session zoom or on a printed/exported PNG.

**Proposed:** Solid line with two perpendicular slashes mid-line, ~22px tall each, separated by ~10px horizontally. Standard genogram convention for divorce.

**Pragmatic note:** None — this is both SOTA-correct and visually clearer. No compromise.

**Code touch:** `drawRelationship` `divorced` branch (around line 1025). The current implementation builds custom "break lines" from trigonometry — that whole block can be simplified by drawing slashes that always sit perpendicular to the line direction. SVG-wise, this is a path with two `M ... L ...` segments computed from the line angle.

---

### 2. Separated — new structural type (currently absent)

**Current:** No such type. Couples who are separated but not divorced have no way to be represented. The model has `structuralType: 'partner' | 'married' | 'divorced'`.

**Proposed:** Add `'separated'` as a fourth structural type. Visual: solid line with a single perpendicular slash mid-line (single 22px-tall slash). Half of "divorced" — exactly the SOTA convention.

**Pragmatic note:** This is a real clinical distinction. Trial separation, legal separation, and separation-with-intention-to-reconcile are common and not the same as divorced.

**Code touch:** Three places.
- `drawRelationship`: new branch handling `structuralType === 'separated'`.
- `structural-relationship-quality` `<select>` HTML: add `<option value="separated">Separated</option>`.
- Symbol key tooltip: add the new line.

---

### 3. Distant — new emotional type (currently absent)

**Current:** No such type. The emotional palette goes: default / close / enmeshed / volatile / cutoff / abuse. There's nothing between "default" and "cutoff" for a relationship that's emotionally distant without being actively ruptured.

**Proposed:** Add `'distant'` as a new `quality` value. Visual: single thin gray line with short dash pattern (`stroke-dasharray="2 5"`, opacity that reads as muted).

**Pragmatic note:** Clinically distinct from cut-off. Cut-off implies active rupture / no contact / refusal to engage. Distant implies emotional remove that still permits relationship — minimal warmth, low contact, but not severed.

**Code touch:**
- `drawEmotionalLink`: new branch handling `quality === 'distant'`.
- `relationship-quality` `<select>` HTML: add `<option value="distant">Distant</option>`.
- Symbol key tooltip: add the line.
- `populateExistingLinksList`: no change needed (uses the `quality` string directly).

---

### 4. Hostile — zigzag instead of solid orange line

**Current:** Single solid orange line. Indistinguishable at a glance from a neutral default-color line, only color signals conflict. This is the strongest mismatch in the current symbol set.

**Proposed:** Orange zigzag (sawtooth). Amplitude ~5px, period ~16px. The visual itself communicates friction / conflict — readable without needing to remember the color code.

**Pragmatic note:** SOTA convention is zigzag; this is also the most universally readable shape for conflict. No compromise.

**Code touch:** `drawEmotionalLink` `volatile` branch (the current code uses `volatile` as the `quality` value internally even though I'm calling it "hostile" in the UI; we may want to align these — see "Naming consistency" below). Replace the straight-line path with a procedurally generated zigzag along the angle between the two people. The zigzag generator needs to:
1. Compute the line angle from p1 to p2.
2. Compute the perpendicular axis for the up/down offsets.
3. Build the path as a sequence of `M start L peak1 L valley1 L peak2 L valley2 ... L end`.

This is the most algorithmically complex change. Worth doing once carefully and reusing for abuse + volatile.

---

### 5. Volatile — new combined type (close + hostile)

**Current:** No such type. The clinical reality of "close-hostile" relationships — intense attachment plus conflict, sometimes called *volatile* in family systems literature — has no representation.

**Proposed:** Two parallel cyan lines (the "close" pattern) with an orange zigzag overlay running between them. The combined symbol reads as "close *and* hostile" at a glance.

**Pragmatic note:** This is a real SOTA convention in the McGoldrick standards (3rd edition adds "fused-conflictual" with similar layered symbols). The clinical utility is high — many close family relationships are volatile, and conflating them with simple "hostile" loses information.

**Code touch:** `drawEmotionalLink` new branch handling `quality === 'volatile_close'` (proposed value name — see Naming consistency below). Draw both the parallel-line pattern AND the zigzag overlay, both along the same line angle.

**Decision required:** Is the existing `'volatile'` quality (currently a solid orange line) actually meant to be "hostile" or "volatile-close"? I'm reading the code as: `volatile = hostile`. If you intended `volatile = close + hostile` all along, then the rename in #4 makes the current `volatile` value mean what it should, and #5 becomes redundant. If you intended `volatile = hostile` (as the code suggests), then we need both: rename the visual for clarity, and add the new combined type. **I'll spec the second interpretation unless you say otherwise.**

---

### 6. Cut-off — clearer break

**Current:** Dashed line with a small break in the middle plus two tiny break ticks. The break ticks are oriented perpendicular to the line and are about 6px long — easy to miss against the dashed background.

**Proposed:** Solid line (not dashed) with a clear gap in the middle, plus two perpendicular bars across the gap that are ~24px tall — large enough that they read as a "break" at any zoom. Standard genogram convention.

**Pragmatic note:** SOTA varies — some traditions use a single zigzag bar across the line, some use double parallel bars. I'm proposing double parallel bars because they read as clearly "broken" (two cut marks) without requiring zigzag generation, which lets us keep the implementation simpler. If you prefer the zigzag bar (which would be visually consistent with #4 hostile), it's a small swap.

**Code touch:** `drawEmotionalLink` `cutoff` branch (around line 1122). The current implementation has the right shape — drawing line, gap, and break marks — but the dimensions are too small. Mostly a sizing change plus removing the `stroke-dasharray` so the line itself is solid (the gap and break bars provide the "cut off" signal).

---

### 7. Abuse — jagged lightning + bolder arrow

**Current:** Single solid red line with a thin triangular arrowhead at one or both ends. Stroke-width 3. The arrow signifies direction (`p1_to_p2`, `p2_to_p1`, `mutual`). The arrow is rendered as a 10x7 SVG marker.

**Proposed:** Jagged "lightning" path in red instead of a straight line, with a larger, bolder arrowhead. The jagged path communicates violence / harm at a glance — distinct from the smooth lines used for non-abuse relationships. Stroke-width unchanged (3).

**Pragmatic note:** SOTA convention varies on abuse representation — some traditions use a smooth red line with arrow, some use a jagged line, some use specific symbols for sub-types of abuse. I'm proposing the jagged line because it's the most visually obvious-at-a-glance variant, and the type sub-categorization (see #8) can be added without changing the core symbol.

**Code touch:** `drawEmotionalLink` `abuse` branch (around line 1145). Replace the straight `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}` with a jagged-path generator. The existing arrowhead marker (`url(#arrowhead-abuse-red)`) can be replaced with a slightly larger one (`refX=9, refY=4, markerWidth=10, markerHeight=8`).

---

### 8. Abuse sub-types — physical / sexual / emotional (deliberately not in widget)

**Current:** Abuse is a single type with a direction field. No way to indicate whether the abuse is physical, sexual, or emotional.

**Proposed:** Add an `abuseType` field on emotional links of `quality === 'abuse'`, with values `'physical' | 'sexual' | 'emotional' | 'unspecified'` (default `'unspecified'`). Visual: a small bold letter badge (P, S, E) near the line midpoint when a sub-type is set. No letter if unspecified.

**Pragmatic note:** SOTA traditions vary widely on abuse representation. Some use distinct line styles per sub-type; some use icons or letters; some leave it as clinician's notes. The letter-badge approach is:
- Familiar to clinicians who've seen multiple genogram conventions
- Compact (doesn't crowd the symbol with line decoration)
- Easy to read at any zoom
- Optional — relationships marked simply as "abuse" still work, the badge only appears when sub-type is set

**Decision required:** Three options.
- (a) **Ship without sub-types.** Just the jagged-line improvement in #7. Sub-types deferred.
- (b) **Ship with letter-badge sub-types** as described above.
- (c) **Ship with distinct line styles per sub-type** (physical = jagged, sexual = thicker double-line, emotional = wavy). More visual distinction but harder to remember and harder to render.

I lean toward (b) for the spec, because it's optional (won't disrupt existing genograms) and pragmatic. But if your clinical use rarely distinguishes sub-types in genogram form, (a) is fine and simpler.

I kept this out of the visual widget because the choice is yours to make. Tell me which.

---

## Naming consistency cleanup (small but worth surfacing)

The current code has a mismatch between internal values and UI labels:

| UI label (in the relationship-quality dropdown) | Internal `quality` value |
|---|---|
| "Connected / Neutral" | `default` |
| "Close / Supportive" | `close` |
| "Enmeshed" | `enmeshed` |
| **"Volatile / Hostile"** | **`volatile`** |
| "Cut-off" | `cutoff` |
| "Abuse" | `abuse` |

In family-systems literature, **volatile** typically means "close-hostile" (i.e., #5 above), while **hostile** means simple conflict without enmeshment (#4 above). The current `volatile` value is rendered as just hostile.

Proposed rename, all-at-once with this overhaul:

| UI label | Internal value | What it draws |
|---|---|---|
| "Connected / Neutral" | `default` | Single default-color line (unchanged) |
| "Distant" | `distant` (NEW) | Thin gray dashed line |
| "Close / Supportive" | `close` | Two parallel cyan lines (unchanged) |
| "Enmeshed" | `enmeshed` | Three parallel purple lines (unchanged) |
| "Hostile" | `hostile` (rename from `volatile`) | Orange zigzag (changed visual) |
| "Volatile (Close + Hostile)" | `volatile` (repurposed) | Two cyan parallel lines + orange zigzag overlay |
| "Cut-off" | `cutoff` | Solid line with clear break (improved visual) |
| "Abuse" | `abuse` | Jagged red line + arrow (improved visual) |

**Migration risk:** Existing genograms with `quality === 'volatile'` would, under this rename, get the *new* meaning (close + hostile combined) instead of the old meaning (simple hostile). Two options:

- **(a)** Migrate on load: any existing `quality === 'volatile'` gets translated to `quality === 'hostile'` (the new value name for what it currently renders as). Safe — existing genograms render identically to today, just with a new internal name.
- **(b)** Don't rename; just add new types alongside. Keep `volatile` meaning "hostile" forever; introduce a new value like `close_hostile` for the combined type. More verbose internally, no migration.

I lean toward (a) — names should match clinical meaning, and the migration is a 3-line shim. But (b) is defensible if you want zero migration risk.

---

## Tier breakdown

### Tier 1 — Most clinical value, all small
- **Hostile zigzag** (#4): biggest visual upgrade, removes the most confusing current symbol.
- **Divorced bigger slashes** (#1): cheap, visible improvement.
- **Distant new type** (#3): fills a real clinical gap, additive (no migration).
- **Naming consistency rename** if going with `(a)` migration strategy.

### Tier 2 — Worth doing in the same batch
- **Separated new structural type** (#2): small, fills a gap.
- **Cut-off clearer break** (#6): existing logic with better sizing.
- **Abuse jagged line + bolder arrow** (#7): same logic shape as hostile zigzag, reuses the generator.

### Tier 3 — Decision-dependent
- **Volatile combined type** (#5): real clinical value, but depends on the naming-consistency decision.
- **Abuse sub-types** (#8): optional; needs your call on letter-badge vs line-style vs skip.

### Tier 4 — Defer
- Engagement marker, affair/liaison markers, twin support, adopted/foster markers. Real conventions but separate scope; mention only.

---

## My recommendation

Bundle Tiers 1 and 2 as a single Composer task. That's:

- Divorced (clearer slashes)
- Separated (new structural type)
- Distant (new emotional type)
- Hostile (zigzag, rename from `volatile`)
- Cut-off (clearer break)
- Abuse (jagged + bolder arrow)
- Symbol key tooltip updates

Plus the **naming consistency rename with `(a)` migration** so the model stays clean.

Tier 3 items hold until you decide:
- **Volatile combined type:** I'd say yes — real clinical value, low cost once the zigzag generator exists for hostile.
- **Abuse sub-types:** my pick is **(b)** letter badges, optional field, defaults to unspecified.

Items deferred to a future batch:
- Engagement / affair / annulment markers
- Twin / adopted / foster relationships
- Anything that touches structural family-tree topology rather than just line styling

---

## What I need from you before writing the spec

Three small calls:

1. **Naming consistency:** option (a) rename `volatile` → `hostile` with a 3-line migration, OR option (b) keep `volatile = hostile` and add `close_hostile` as a new value.

2. **Volatile combined type:** include or defer?

3. **Abuse sub-types:** (a) skip / (b) letter badges (my recommendation) / (c) distinct line styles per sub-type.

Answer those three and I'll write the Composer-ready build spec.

---

*End of audit.*
