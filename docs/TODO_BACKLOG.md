# BET — Deferred TODO Backlog

Standing record of decided-but-not-scheduled work. Dated when added. Tier-1/2/3 session TODOs live in the session summaries (latest: `SESSION_SUMMARY_2026-05-27_28.md`); this file is for deferred decisions that shouldn't get lost between sessions.

---

## 2026-06-05 — Swap transactional email: SendGrid → Resend (DEFERRED — Matthew's call on timing)

**What:** Replace `sendEmailViaSendGrid` with a Resend equivalent behind the existing `Utils::sendEmail` abstraction (`api/utils.php`).

**Why:** Resend free tier (3,000/mo, permanent) covers BET's transactional volume entirely; SendGrid's free tier is now a 60-day trial. Cleaner API, same curl-POST integration shape as current code. Recommended by a trusted senior dev (Dreamocean netcode lead).

**Shape of the work when ready (gated spec — touches production transactional email, which gates auth via verification emails):**
1. Add `sendEmailViaResend` (curl POST to `https://api.resend.com/emails`, Bearer key, JSON `{from, to, subject, text}`) behind `Utils::sendEmail`. Keep SendGrid function + `mail()` fallback in place during cutover.
2. Verify domain in Resend dashboard — they recommend a sending subdomain (e.g. `send.brighteyedtherapist.com`): add their SPF + DKIM TXT records (+ subdomain MX for bounce handling). Does not collide with inbound `matthew@` mailbox MX.
3. Test every transactional path on prod: register (verification), resend-verification, reset-password, contact/feedback.
4. Flip, watch deliverability a few days (low volume = low risk), then retire SendGrid creds.

**Note:** if/when inbound mail moves to Google Workspace, coordinate the SPF picture (root domain vs. sending subdomain) in the same DNS pass.

**Status:** deferred 2026-06-05. Not scheduled.
