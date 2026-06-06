# Browse Audit — 2026-06-05 (production, live browser)

General functional pass over brighteyedtherapist.com in Chrome (logged in as Matthew, Founding Member + admin). Look-only: no form submissions, no Stripe interaction, no draft banners touched.

## Verified working

- **What's New render fix (deployed today) confirmed live on both surfaces.** `whats-new.html` shows all 7 entries as visible cards with fade-in (Brainspotting 5/28 entry on top); dashboard Recent Updates renders top 3. Optional copy rewrite from the spec was held — old Life Map title still live (as specced; Matthew's call pending).
- **All public pages render, zero console errors site-wide:** index, about, contact (PHI warning intact), feedback (PHI warning intact), subscribe ($5 Founding Member card), login, whats-new, dashboard, account.
- **All five tools load clean:** EMDR Suite, Brainspotting, Life Map, Genogram Genie, EMDR Guided. Empty-state orientation cards (5/27 polish) render; Genogram privacy disclaimer + zoom % present; EMDR Guided protocol panel + local-notes safety note intact. Premium gating correct (Founding Member tools accessible).
- **Dashboard welcome modal** ("Welcome to Your Clinical Suite!") appeared — investigated: works as designed, once per browser via `localStorage[bet_seen_welcome]`; this profile lacked the flag. Dismissed during audit (flag now set). Not a bug.
- **What's New nav badge** correctly absent after visiting the page (seen-state logic working).

## Findings

1. **(Medium — UI edge case, billing surface)** `account.html` shows "Cancellation scheduled — you keep full access until **May 19, 2026**" — a date now in the past, displayed as a future promise. Matthew's access persists via admin override, so this is cosmetic *for him*, but it implies the post-expiry state isn't re-rendered: a non-admin user whose cancellation date has passed may see the same stale copy. Worth a check of what the expiry transition actually renders for a regular account, and a copy state for "subscription ended."
2. **(Low — UX polish)** `login.html` renders the sign-in form for already-authenticated users instead of redirecting to dashboard.
3. **(Carried from 5/28 backlog, still open)** The one high-value visual confirmation not done in this pass: Brainspotting active-session network check (`update_session.php` at ~4Hz not ~60Hz) — needs a started session; do in next hands-on pass.

## Not tested (deliberately)

Stripe checkout flow, form submissions (would send real email/feedback), tool data entry / draft recovery flows, viewer share-links.
