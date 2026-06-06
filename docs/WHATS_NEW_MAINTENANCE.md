# What's New — Maintenance Reference

Quick reference for keeping the changelog current. Shipped 2026-05-27.

---

## When something ships, add one entry to `whats-new.json`

Edit `whats-new.json` at the repo root. Add an object to the `entries` array:

```json
{
    "id": "YYYY-MM-DD-short-slug",
    "date": "YYYY-MM-DD",
    "category": "New feature",
    "title": "User-facing title in sentence case",
    "summary": "One to three plain-English sentences. Skip implementation jargon. If a new feature is discoverable somewhere non-obvious, say where."
}
```

**Category** is one of: `"New feature"`, `"Improvement"`, `"Bug fix"`, `"Security"`. These drive the badge color on both the dashboard and the full page.

**Featured (optional, added 2026-06-05):** add `"featured": true` to an entry to pin it into the dashboard's top-3 "Recent Updates" slots. Featured entries surface first (newest first), then everything else by date. The full `whats-new.html` page ignores the flag and stays purely chronological. Keep at most 3 featured at a time — more than 3 and date order decides among them. Curate for *user value*, not recency: the dashboard rows are what an active clinician actually sees.

**Voice rule (added 2026-06-05, per Matthew):** entries are written for non-technical therapists. Lead with what it means for their work, not what changed in the code. Combine related technical items into one functional story. If a sentence wouldn't land with a skilled clinician who's bad with computers, rewrite it.

**Cadence:** one entry per shipped Composer batch (not one per fix). Group related sub-items into a single entry. Users care about what changed for them, not what files were touched.

Deploy `whats-new.json` to production via your normal SCP / rsync flow. Both pages pick it up on next load — there's a cache-buster query string so no manual cache flush is needed.

---

## Where the changelog appears

- **Full list:** `https://brighteyedtherapist.com/whats-new.html` — public, unauthenticated, anyone can see it.
- **Dashboard surface:** below the tools list, top 3 entries as compact cards with a "View all →" link. Hidden if the JSON fails to load.
- **Nav link:** "What's New" between Feedback and the `|` separator in the dashboard nav (desktop and mobile menu).

---

## Badge behavior

A small accent-color dot appears next to the "What's New" nav link when there are entries newer than what the user has seen.

The trigger: dashboard fetches `whats-new.json`, finds the latest entry's date, compares to `localStorage[bet_whats_new_last_seen]`. If the latest is newer (or storage is empty), badge shows.

The clear: visiting `whats-new.html` writes the latest entry's date to `bet_whats_new_last_seen`. Returning to the dashboard sees the comparison fail (latest === lastSeen) and hides the badge.

So: ship a new entry → all users get the badge on their next dashboard load → it stays until they click through to the page.

---

## URLs and quick checks

- Full page: `/whats-new.html`
- Source data: `/whats-new.json`
- Dashboard surface: visible after the tools list at `/dashboard.html`

After deploying a new entry, do a hard refresh (Cmd+Shift+R) on the dashboard to bypass your own browser cache — the public cache-buster only handles new visitors.

---

## What can go wrong

- **Invalid JSON in `whats-new.json`:** dashboard's Recent Updates section silently stays hidden; full page shows "Could not load updates." Validate the JSON before deploying (most editors will catch trailing commas, missing quotes).
- **New entry doesn't appear:** check the `date` field is `YYYY-MM-DD` format. Sort order is lexicographic on the date string — anything other than ISO format will sort wrong.
- **Category badge wrong color:** make sure the category string matches one of the four values exactly (case-sensitive). Anything else falls through to the default "Improvement" blue.

---

## Architecture (so future-you can extend)

- **Source of truth:** `whats-new.json`. Both renderers fetch from it.
- **Full page renderer:** inline `<script>` in `whats-new.html`. Builds DOM via `createElement` + `textContent` (XSS-safe).
- **Dashboard renderer:** IIFE-wrapped script at the bottom of `dashboard.html`. Same `createElement` + `textContent` pattern. Reuses `.tool-row` styling for visual consistency with the tools list above.
- **Badge state:** `localStorage['bet_whats_new_last_seen']`, ISO date string.

To extend later (e.g. RSS feed, email notifications, per-category filter): build on top of `whats-new.json` as the source. Don't fork the data.

---

*If this gets stale, that's the signal that the feature isn't earning its maintenance cost — kill it rather than letting it look abandoned.*
