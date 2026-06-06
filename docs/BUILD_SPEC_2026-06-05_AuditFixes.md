# Build Spec — Audit fixes (post-expiry billing display, login redirect, subscription-state investigation)

**Date:** 2026-06-05
**Author:** NEXUS (Cowork/Opus) → Composer
**Source:** `docs/BROWSE_AUDIT_2026-06-05.md`
**Files:** `account.html`, `login.html`, `register.html` (+ read-only investigation of `api/stripe/webhook.php`, subscription DB row, Stripe dashboard)

**Blast radius:**
- Items 1–2: **LOW** — front-end display/redirect logic only. No API, no Stripe, no DB writes, no auth-token logic changes.
- Item 3: **INVESTIGATION ONLY on the payment data path.** Read-only. Hard gate: **no DB writes, no webhook.php changes, no Stripe-object mutations** under this spec. Findings come back to Matthew for a follow-up decision.

---

## Background

The 2026-06-05 production browse audit found: (1) `account.html` renders "Cancellation scheduled — you keep full access until May 19, 2026" — a **past** date shown as a future promise. The render branch (`account.html` ~line 268–292) handles `subscription.status === 'active'` + `cancel_at_period_end` but never checks whether `current_period_end` has already passed. (2) `login.html` and `register.html` only redirect to the dashboard **after a successful form submit** (login.html ~84, register.html ~132); an already-authenticated user visiting either page just sees the form. (3) The underlying data question: the webhook (`api/stripe/webhook.php`) handles `customer.subscription.deleted`, so a sub that Stripe canceled on May 19 should have flipped to `canceled` in the DB ~17 days ago. It didn't. Why is unknown — and it matters beyond cosmetics, because `subscription_overlay.js` gates premium tools on the subscription state (`Auth.checkFoundingAccess()`): a real (non-admin) user in this stale state may retain premium access indefinitely after billing stops.

---

## Item 1 — `account.html`: post-expiry display state

**Goal:** when a cancellation-pending subscription's `current_period_end` is in the past, render an "ended" state instead of the future-promise copy.

### Acceptance Criteria (binding)

1. In the `status === 'active'` + cancel-pending branch: if `current_period_end` parses to a datetime **earlier than now**, the page renders ended-state copy (consistent with the existing `canceled` branch: "Your subscription has ended. Free EMDR remains available.") instead of "Cancellation scheduled — you keep full access until …".
2. In that ended state, the yellow "Cancellation scheduled" banner does **not** render its future-tense copy, and the "Keep my subscription" (resume) button does **not** render — resume is invalid after the period has lapsed. Offer a "Resubscribe" action linking to `subscribe.html` instead.
3. Behavior with a **future** `current_period_end` is unchanged (cancellation-scheduled copy, banner, resume button all as today).
4. Unparseable/missing `current_period_end` falls back to current behavior (never throw; never render "ended" on bad data — fail toward the existing copy).
5. No changes to `cancelSub()` / `resumeSub()` / any `Auth.*` call.

### Implementation Notes (guidance — ACs win)

Compare on the raw value (`new Date(subscription.current_period_end)`) — not on `formatPeriodEnd()` output. Guard `isNaN(date.getTime())` for AC 4. This is display logic only; the admin-override note ("Admin accounts always have full tool access") stays as is.

---

## Item 2 — `login.html` + `register.html`: redirect authenticated users

**Goal:** an already-signed-in user visiting the sign-in or registration page lands on the dashboard.

### Acceptance Criteria (binding)

1. Visiting `login.html` with a valid stored session redirects to `dashboard.html` before the form is interactable.
2. Same for `register.html`.
3. A logged-out visitor sees both forms exactly as today.
4. **No redirect loop with a stale/expired session:** the on-load check must use the same validity criteria the dashboard uses to admit a user. If the dashboard would bounce the session back to login, login must NOT forward it. Test explicitly by corrupting/expiring the stored token and visiting login.html — must land on the form, not loop.
5. The existing post-submit redirects are untouched.

### Implementation Notes

Inspect how `dashboard.html` validates the session on load and mirror that predicate (don't invent a looser one like "user object exists in storage"). If the dashboard validates via an async `/api/auth/me` round-trip, a pragmatic equivalent is: redirect only when both token and user are present, and let the dashboard's own rejection path handle true edge-staleness — but then AC 4's loop test is mandatory proof.

---

## Item 3 — INVESTIGATE: why the subscription row never flipped to `canceled`

**Read-only. Do not fix anything found here under this spec.**

Matthew's subscription (the audit account) shows `status='active'`, `cancel_at_period_end` truthy, `current_period_end` = 2026-05-19 — 17 days past. Determine which of these is true and report:

1. **Stripe side:** does the Stripe dashboard show this subscription as `canceled` on/around May 19, still active, or resumed? (Matthew may need to pull this up — request it in the report if dashboard access isn't available to you.)
2. **Webhook delivery:** in Stripe's webhook delivery log, was `customer.subscription.deleted` (or a relevant `updated`) sent for this sub around May 19? Delivered or failed? Endpoint configured and reachable at the expected URL?
3. **App side:** check the webhook event log table (webhook.php writes `event_type` records) and `error_log` traces for received events around May 19. Did the event arrive and fail processing, or never arrive?
4. **Leak assessment:** trace `Auth.checkFoundingAccess()` → what the API serves a non-admin user in this exact stale state. State plainly in the report whether a regular customer whose period lapsed without a processed webhook **keeps premium access** (revenue/access leak) — and whether any server-side check would catch it independent of the client overlay.

**Allowed:** read-only DB `SELECT`s, reading logs, reading code. **Prohibited under this spec:** `UPDATE`/`DELETE`/`INSERT` on any table, edits to `webhook.php` or any `api/stripe/*`, any Stripe API mutation. If the cause is obvious and trivially fixable, propose the fix in the report-back; Matthew gates it.

---

## Scope + DO-NOT-TOUCH

**In scope:** display/redirect logic in `account.html`, `login.html`, `register.html`; read-only investigation per Item 3.
**DO NOT TOUCH:** `auth.js`, `subscription_overlay.js`, `api/**` (read-only for investigation), `whats-new.*`, `dashboard.html`, the welcome-modal logic (works as designed), Stripe objects, prod DB rows.

## Verify (Composer, before report-back)

1. **Item 1:** simulate locally — stub `user.subscription` with (a) past `current_period_end` + cancel pending → ended copy, Resubscribe shown, no resume button; (b) future date + cancel pending → unchanged today-behavior; (c) garbage date → unchanged today-behavior. Confirm against the rendered page, not just code. No prod data manipulation to test.
2. **Item 2:** logged-in visit to login/register → lands on dashboard. Logged-out → forms render. Corrupted token → form renders, no loop (watch the network tab for bounce cycles).
3. Console clean on all three pages in all states.

## Rollback

Pure front-end: revert the three HTML files from git. Item 3 changes nothing by design.

## Report-back

Per AC number, pass/fail, plus the Item 3 findings as a distinct section: Stripe state, webhook delivery evidence, app-side log evidence, and the leak assessment verdict — with a proposed (not applied) remediation if the cause is clear. Flag anything that requires Matthew's Stripe dashboard access.
