# Pilot Light — MOE (product & architecture brief)

*Prepared for Bright Eyed Therapist · v1 lives in `tools/pilot-light/` · Status: shipped as a standalone, local-first web app*

---

## 1. One-liner

**A private, one-minute daily check-in for drive and motivation** — one big slider, plus whatever else you choose to watch — that turns into a heatmap, a trend line, and gentle "what tends to go with my better days" patterns. It runs from a single folder, offline, with no account and no server.

## 2. Who it's for

| Audience | Now / later | Job to be done |
|---|---|---|
| **Friends & peers** | Now | "I want to notice what actually moves my motivation without another app, account or subscription." |
| **Clients of a clinician or coach** | Later, via the SaaS | "My therapist asked me to track a few things between sessions; I want it quick, private and printable." |
| **Clinicians** | Later, via the SaaS | "I want to hand a client a pre-configured tracker in one link, and get a clean one-page summary back — without storing PHI." |

Design target: people with ADHD, low mood, burnout, recovery or life transitions. They need **low friction, no shame, and fast wins**.

## 3. Product principles

1. **One slider is a complete day.** Everything beyond Drive is optional and switchable.
2. **Local-first and verifiably private.** No network requests at all (enforced by a Content Security Policy with `connect-src 'none'`). Data lives in `localStorage`; Export/Import JSON is the backup and the hand-off.
3. **ADHD-friendly.** Big tap targets, checklists instead of forms, sliders with tappable 0–10 ticks, keyboard shortcuts, autosave, no required fields, no streak-shaming.
4. **Generalizable, not personal.** No condition, medication, substance or influencer is baked in. Every list is user-editable, and the defaults are neutral.
5. **Descriptive, never diagnostic.** Patterns are "average drive with vs. without", labeled *patterns, not proof*. There is a clear "not medical advice" note and a 988 crisis line.
6. **Portable.** Plain HTML/CSS/JS, one folder. It works over `file://`, on any static host, or embedded under the SaaS domain.

## 4. Naming

| Option | Why it works | Watch-outs |
|---|---|---|
| **Pilot Light** ✅ | A pilot light is the small flame that stays on even when the stove is off: "your drive is never fully out; today it's burning at 4." Hopeful and non-clinical, and it gives us a visual (a flame that grows with the rating). A gas pilot flame is blue, which suits the teal/sky palette. | Generic phrase, so pair it with the brand: "Pilot Light · by Bright Eyed Therapist". |
| **Brightline** | Echoes "Bright Eyed" and suggests "a bright line through your days". | Existing transit and commerce brands use it, and it's less evocative of motivation. |
| **Daily Drive** | Self-explanatory and searchable. | Flat, easily confused with cars and cloud storage, and hard to own. |

**Chosen: Pilot Light.** Folder: `tools/pilot-light/`. Storage namespace: `pilot-light:v1:*`. File format id: `"pilot-light"`.

## 5. v1 scope (built)

**Always on**
- **Drive 0–10**: the primary metric, shown as a large slider with tappable ticks, a friendly descriptor ("Low and steady", "Glowing", "Fully lit") and a flame that grows with the rating. The rating is empty until set, so browsing a day never invents data.
- **Notes & tags**: free text, with recent tags offered as one-tap chips.

**Toggleable modules** (Settings → *What to track*)

| Module | Fields | Default |
|---|---|---|
| Check-in scales | Editable list of 0–10 sliders (Energy, Focus, Mood on; Stress off; add your own) | On |
| Sleep | Quality 0–10, bedtime, wake time | On |
| Levers | Editable protocol checklist: morning light, caffeine timing, movement, first meal, connection, wind-down | On |
| Movement | Moved? kind (chips), minutes (stepper) | On |
| Win & intention | One small win and one thing for tomorrow | On |
| Food | Quality 0–10, first-meal time, note | Off |
| Body & discomfort | Optional 0–10 level and "where/what"; card title is editable | Off |
| Meds & supplements | User-defined checklist (**empty by default**) and a note | Off |
| Substances & habits | User-named list; each item has used?, when, how much and a note | Off |
| For my next session | Free-text "things to bring up" | Off |

**Presets:** *Minimal* (drive + notes), *Everyday* (default), *Clinical* (Everyday plus body, meds, habits and session notes).

**Over time:** a 16-week heatmap (weeks as columns; tap a day to open it), a 30/90-day trend with a 7-day average, stat tiles (average with change vs. the prior period, days logged, streak), and **Patterns**: average drive on days with vs. without each lever or habit, plus sleep of 7+ and 20+ minutes of movement. A pattern only appears once both sides have at least 3 rated days.

**Sharing & hand-off**
- **Export / Import JSON**: merges by date, asks before replacing existing days, and optionally carries settings.
- **Share this setup**: a link (settings encoded in the URL `#fragment`) or a small setup file. It carries module choices and lists plus an optional "Set up by" name, **never days or notes**. The recipient sees an "Apply setup?" banner.
- **Print / PDF summary**: a one-page, clinician-friendly 30-day summary (stats, trend, heatmap, patterns table, daily log, blank name line).

**Quality of life:** light/dark/auto themes, editable time zone (default `America/Los_Angeles`) and week start, example days (striped, removable in one click), multi-tab sync via the `storage` event, a skip link, visible focus and reduced-motion support.

## 6. Deliberately out of scope (for now)

| Not built | Why |
|---|---|
| Accounts, cloud sync | Would make this a PHI system. Local-first is the feature. |
| Reminders / notifications | Needs a service worker and permission prompts, and behaves inconsistently on `file://`. Candidate for a PWA step. |
| Statistical correlation / AI insights | Risks false authority. With-vs-without averages are honest, legible and easy to talk through in session. |
| Charts library | Hand-rolled SVG keeps it dependency-free and CSP-clean. |
| Web fonts / CDN | Any third-party request would break the "nothing leaves this page" promise. The CSS falls back from Inter/Playfair Display to system fonts. |

## 7. How the prototype was generalized

The build started from a private, single-person prototype. Everything specific to that person was removed; the useful mechanics were kept and made configurable.

| Prototype pattern | Pilot Light |
|---|---|
| Pain slider for one specific injury | Optional **Body & discomfort** module with an editable title |
| Hard-coded prescription checkboxes | **Meds & supplements**: user-defined, empty by default, off by default |
| A single hard-coded substance section | **Substances & habits**: any number of user-named items (alcohol, nicotine, gaming, scrolling…) |
| Checklist branded after a public figure | Neutral **Levers** list with sensible, editable defaults |
| Condition-specific movement flag | Generic Movement (kind chips, minutes) |
| Export aimed at a personal assistant | Generic **Export / Import JSON** plus a documented schema |
| Fixed time zone, fixed paths | Editable time zone; no paths or hostnames anywhere |
| Drive defaulting to 5 on every new day | Drive is **empty until rated**, so the heatmap only shows real data |

A test (`tests/privacy.test.js`) scans every file in the tool for the prototype's personal terms. It stores them only as hashes, so the test itself doesn't reintroduce them.

## 8. Architecture

```
tools/pilot-light/
  index.html          markup shell + CSP; opens directly from disk
  assets/core.js      pure data layer (no DOM): model, sanitizing, dates, import/export,
                      setup links, summary/trend/pattern math, example data
  assets/app.js       UI: rendering, autosave, heatmap/trend SVG, settings sheet, print
  assets/app.css      design tokens (light/dark), components, print stylesheet
  assets/mark.svg     brand mark / favicon
  data/entries.json   example-only export (every day has "example": true)
  tests/*.test.js     node:test unit + privacy tests
```

- **Why classic scripts and not ES modules:** Chrome blocks module scripts over `file://`. `core.js` uses a UMD wrapper, so it exposes `window.PilotLightCore` in the browser and `module.exports` in Node for tests.
- **No `fetch`:** browsers block reading sibling JSON over `file://`, and it isn't needed. Example days come from a deterministic generator in `core.js`.
- **Storage:** `localStorage["pilot-light:v1:entries"]` (array of days) and `localStorage["pilot-light:v1:settings"]`. The namespace matters because, once hosted, every BET tool shares one origin.
- **Security posture:** CSP `default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'`. All user- and link-supplied text is rendered with `textContent` or `createElement`, never `innerHTML`, so a malicious setup link can't inject markup (checked in the browser smoke test). Imports are size-capped and fully re-sanitized: scores are clamped, ids are slugged, `__proto__`/`constructor` keys are dropped, strings are length-limited, and enums are whitelisted.
- **Forward compatibility:** unknown top-level entry fields are preserved on import and export, so a v1 app won't strip data written by a future v2.
- **Schema:** see [`schema.md`](schema.md).

## 9. Brand

The live site sits behind a bot challenge, so tokens came from the repo's own `style.css` ("Morning Calm") and the owl mark:

- **Primary teal** `#2C5558` (brand primary), **sky** `#7FB8C9` for data and the flame, **sage** `#A9C79B` from the owl's brow for "saved/okay", and **terracotta** `#D97757` used sparingly (today marker, selected day, low-side patterns).
- **Warm neutral canvas** `#F7F5F0` with white cards, soft shadows and 18px radii. The dark theme uses a deep teal-charcoal, not neon.
- **Type:** Playfair Display (headings) and Inter (UI) when installed locally, with good serif/sans system fallbacks. No web-font download.
- **Voice:** warm, plain and non-judgmental ("Go with your gut — there's no wrong answer", "Patterns, not proof").
- **Attribution:** the footer says "Shared via Bright Eyed Therapist", and an optional "set up by {practice}" line appears in the header and on printouts.

## 10. Clinical safety & privacy

- The footer carries a short privacy statement, "Not medical advice", and "not for emergencies — call or text 988 (US)".
- The Meds module is off by default and never preloaded. The copy nudges users to talk with a professional before changing anything.
- Patterns need a minimum sample size, show both sides' day counts, and say that unchecked counts as "not done".
- **PHI posture:** in v1 nothing reaches any server. Setup links carry configuration only, in the `#fragment` (browsers don't send it to the server). The hand-off to a clinician is the client's choice: printout, PDF or JSON file.
- `index.html` is `noindex` and `no-referrer`. The site `.htaccess` already refuses to serve `*.md`, so these docs won't be public if the folder is deployed.

## 11. SaaS integration path (named, not built)

Each stage is additive and can ship independently. None requires changes to the existing production routes.

| Stage | What | Infra needed |
|---|---|---|
| **0. Static hosting** | Upload `tools/pilot-light/` as part of a targeted deploy, which serves it at `brighteyedtherapist.com/tools/pilot-light/`. Optionally add a card to the Tools section and whats-new. | None (static files) |
| **1. Clinician setup links** ✅ built | Settings → *Share this setup* creates `…/tools/pilot-light/#setup=<base64url>` with "Set up by {practice}". The client opens it, applies it, and tracks locally. | None |
| **2. "Client tools" in the dashboard** | A dashboard card, **Pilot Light for clients**: a small preset builder that reuses `PilotLightCore.encodeSetupHash()` and pre-fills `sharedBy` from the clinician's account (practice name). It outputs a copyable link or QR code. Count link creation server-side (`api/analytics/track.php`, clinician side only), and never add analytics to the client page. Suggested gating: free for clients forever; the builder is free or Founding Member (a free builder is a growth loop). | Existing auth and analytics |
| **3. Local clinician viewer** | `tools/pilot-light/viewer.html`: a read-only page where the clinician drops a client's exported JSON, sees the same heatmap, trend and patterns, and can print. The file is parsed in the browser and never uploaded. Reuses `core.js` unchanged. | None |
| **4. Encrypted drop (optional)** | The client taps "Send to my clinician". The export is encrypted in the browser (WebCrypto AES-GCM), and only ciphertext is posted to `api/pilot-light/drop.php` (expiring blob, modeled on the existing EMDR session-link pattern in `api/emdr/`). The decryption key travels only in the link fragment. The clinician opens the link in the viewer. | New endpoint and table. **Requires a compliance decision first** (BAA-capable hosting; the current shared host is not assumed to be HIPAA-ready). |

**Integration contracts to keep stable**
- `window.PilotLightCore`: `normalizeEntry`, `parseImport`, `buildExport`, `encodeSetupHash`/`decodeSetupHash`, `applySetup`, `summary`, `factors`.
- Export format `{ format: "pilot-light", version: 1, kind: "entries" | "setup", … }`.
- Setup fragment `#setup=<base64url(JSON)>` (max 8 KB).
- Proposed for embedding (Stage 2/3): `postMessage` events `pilot-light:setup` (parent → app) and `pilot-light:export` (app → parent, only on an explicit user click).

## 12. Success signals (without tracking clients)

- Friends keep using it past two weeks (qualitative: ask them).
- Number of clinician setup links generated (Stage 2, clinician-side count).
- Clinicians report that printouts shorten the "how was your week" part of sessions.
- Zero privacy incidents by construction: no client-side telemetry exists.

## 13. Next candidates

1. PWA manifest and service worker (installable, offline when hosted) plus an optional local daily reminder.
2. Stage 3 viewer (small, and high clinical value).
3. CSV export for spreadsheet people.
4. Reordering items in lists (drag or up/down).
5. Scale overlays on the trend chart (e.g. drive vs. sleep).
6. Localization of copy and date formats.
7. A formal accessibility pass with screen readers (VoiceOver/NVDA).

## 14. Risks

| Risk | Mitigation |
|---|---|
| Data loss when browser storage is cleared | Export reminders in Settings copy and a warning banner when storage is blocked. Future: a "last exported" nudge. |
| Over-reading patterns | Minimum-n threshold, day counts shown, "patterns, not proof" copy, and framing around talking it through with someone. |
| A setup link shares a personal meds list | Settings warns that lists are included in the setup and suggests clearing them before sharing. |
| Scope creep toward a medical record | Principles 2 and 5; PHI stays client-side unless Stage 4 is explicitly approved. |
