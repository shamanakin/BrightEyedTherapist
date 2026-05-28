# Bright Eyed Therapist — Patch Notes

**Date:** Tuesday, May 19, 2026  
**Environment:** Production (`brighteyedtherapist.com` via DreamHost)  
**Source of truth:** `MANAMAC-SHARE/WEBSITES/BrightEyedTherapist/`

---

## Summary

A full product and polish day focused on **Guided EMDR** (BLS controls, session documentation, panel UX), **billing/admin clarity** for canceled subscriptions, and **marketing navigation** cleanup. All listed product changes were deployed to production unless noted otherwise.

---

## Guided EMDR — Bilateral stimulation (BLS)

### Size controls (slider upgrade)
- Replaced discrete dot **+ / −** buttons with a **continuous size slider** for smoother resizing during sessions.
- Dot size range: **28px–90px** (max dot ~25% larger than before).
- Added a **lightbar scale slider** (88%–112%) when lightbar mode is active.
- Size state syncs across host, viewer, and session sync (`lightbarScale` in BLS sync layer).

**Files:** `js/emdr/bls-constants.js`, `bls-sync.js`, `bls-core.js`, `bls-host.js`, `bls-toolbar.css`, `tool_emdr.html`, `tool_emdr_guided.html`, `tool_emdr_viewer.html`

---

## Guided EMDR — Session report & download

### Privacy-first documentation
- Session clinical content stays **in the browser** (no server-side PHI storage for guided notes).
- **Tab-local draft** recovery via `sessionStorage` key `bet-guided-draft` (debounced persist ~2s) so a refresh or crash does not wipe in-progress work.
- Boot no longer clears draft on every load; draft restores through `guided-host-bridge.js`.

### Downloadable EHR-style report
- Plain-text **session report** download for charting (all **5 protocols** supported in report builder).
- Optional **filename label** in download modal.
- Report sections driven by protocol-aware logic (phase transitions, POD snapshots, aspect records, session events).
- In-panel download entry points (header, closure flow) plus **beforeunload** / **New session** warnings when substantive notes exist without a download.

### Reference documentation
- Added internal protocol documentation: `docs/guided-emdr-session-documentation.md`

**Files:** `js/emdr/guided/guided-storage.js`, `guided-engine.js`, `guided-report.js`, `guided-download.js`, `guided-panel.js`, `guided-host-bridge.js`, `tool_emdr_guided.html`

---

## Guided EMDR — Panel & chrome UX

### Clinician panel
- **New session** flow with confirmation when unsaved/substantive work exists.
- Panel layout and protocol picker copy refinements.
- **Hide protocol / Show protocol** floating control on the BLS pane (right-aligned).

### Layout fix (same day, follow-up)
- **Hide protocol** button lowered to align vertically with the **Dashboard** pill and bottom **BLS toolbar** row (was sitting ~76px too high).
- Watermark/feedback cluster nudged up on guided pages so it does not overlap the protocol button.

**Files:** `js/emdr/guided/guided-panel.js`, `guided-panel.css`, `tool_emdr_guided.html`

---

## Subscriptions & admin

### Issue
Test account (`roboshamanai@gmail.com`) showed **Active** in admin after canceling in the app. Cancel flow was working; display was wrong.

### Root cause
User cancel uses Stripe **cancel at period end** — `status` stays `active` until the billing period ends. Admin flags set both `is_active` and `is_canceled`, but the UI checked **Active** before **Canceled**, so pending cancellations looked fully active.

### Fix
- `Utils::buildSubscriptionFlags()` now exposes **`is_cancel_pending`** and treats “active” badge as renewing-only (not scheduled to cancel).
- Admin user detail and users list show an orange **Canceling** badge with period-end context.
- Account page behavior unchanged (already showed “Cancellation scheduled”).

**Files:** `api/utils.php`, `admin/user.html`, `admin/analytics.js`, `admin/index.html`

**Note:** Users keep Founding Member access until `current_period_end`; that is intentional, not a bug.

---

## Marketing site (homepage)

### Navigation (Tools vs Apps)
- Removed logged-in injection of a redundant **Apps** link next to **Tools**.
- **Logged out:** nav **Tools** → `#tools` product section.
- **Logged in:** same slot becomes **Dashboard** → `dashboard.html` (desktop + mobile menu).
- Legacy **Apps** links are stripped if present.

### Product section copy
- Added section heading: **Clinical tools for trauma telehealth**.
- Subgroups labeled **Processing** and **Case Conceptualization** (less repetitive “Tools” labeling).

**Files:** `main.js`, `index.html`

---

## Infrastructure & ops (non-user-facing)

- **SSH deploy access** configured for agents/Mac: `~/.ssh/id_ed25519_bet`, `Host bet-dreamhost` → `pdx1-shared-a3-02.dreamhost.com` (use server hostname, not bare domain — Cloudflare blocks port 22 on `brighteyedtherapist.com`).
- **BEOS workspace** updated so agents can run production diff/deploy via `sshpass` + vault credentials when needed.
- Deploy method used today: `scp` / `rsync` to `~/brighteyedtherapist.com/`.

---

## Deploy checklist (for future sessions)

After pulling these changes locally, typical production touchpoints:

| Area | Paths |
|------|--------|
| Guided EMDR | `js/emdr/guided/*`, `tool_emdr_guided.html` |
| BLS shared | `js/emdr/bls-*`, `bls-toolbar.css`, `tool_emdr*.html` |
| Admin / API | `api/utils.php`, `admin/*` |
| Marketing | `index.html`, `main.js` |

Hard refresh after deploy: **Cmd+Shift+R** (or empty cache) on tool and admin pages.

---

## Known / out of scope

- Admin **stats** still count `status = 'active'` for revenue/subscriber totals (includes cancel-pending until period end) — correct for “paid access still on” metrics.
- No git commits were made during this session unless separately requested.

---

*End of patch notes — May 19, 2026*
