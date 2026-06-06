# What's New / Patch Notes Surface

**Target files:** Create `whats-new.json`, create `whats-new.html`, modify `dashboard.html`.
**Scope:** A small, sustainable changelog surface. Single JSON source of truth; dedicated page renders the full list; dashboard surfaces the 2–3 most recent items as compact cards; a subtle "New" badge in the dashboard nav appears when there's an entry the user hasn't seen yet.
**Date:** May 27, 2026

This spec is the source of truth. No modals, no popups, no onboarding tours. Maintenance after this batch is one line per shipped change in `whats-new.json` — that's it.

---

## Global guardrails

1. **Exactly three files are involved:** `whats-new.json` (new), `whats-new.html` (new), `dashboard.html` (modified). No other file in the repo is touched.
2. **All user-supplied JSON values are rendered via `textContent`, never `innerHTML`.** XSS prevention.
3. **`whats-new.json` is the single source of truth.** Both `whats-new.html` and `dashboard.html` fetch from it. Do not duplicate entries across files.
4. **The page is public/unauthenticated.** No `subscription_overlay.js`, no `TOOL_ACCESS_LEVEL` gating. Anyone — including prospective users — can visit `whats-new.html`.
5. **No new external dependencies.** Use existing fonts, Font Awesome, and `style.css`.
6. **Light-mode only is fine.** The marketing-site pages don't have dark mode; `whats-new.html` matches that pattern. (`dashboard.html` is also light-only.)

---

## Pre-flight check

Confirm:
- `dashboard.html` exists and contains a `<div class="tools-container">` and the welcome banner.
- `style.css` is in the repo root.
- `auth.js` and `main.js` are in the repo root.

---

## Item 1 — Create `whats-new.json`

**Goal:** Seed the changelog with user-facing entries summarizing what's been shipped recently. This is the file Matthew edits when something new ships — adding one entry per change. Both pages read from it.

**Where:** Create new file at repo root: `whats-new.json`

**Content:**

```json
{
    "entries": [
        {
            "id": "2026-05-27-emdr-context-bridge",
            "date": "2026-05-27",
            "category": "New feature",
            "title": "Life Map: hand off to EMDR with context",
            "summary": "Click the EMDR button on a Life Map target and the BLS tool now shows the target's name, negative cognition, and SUDS at the top of the canvas. No more mentally carrying clinical details across tabs."
        },
        {
            "id": "2026-05-27-genogram-symbols",
            "date": "2026-05-27",
            "category": "Improvement",
            "title": "Genogram: better relationship symbols",
            "summary": "Hostile relationships now render as a clear zigzag (the standard genogram convention) rather than a flat line — much easier to spot at a glance. Volatile (close + hostile combined), Distant, and Separated are new types. Abuse can be sub-categorized as Physical, Sexual, or Emotional with a small badge."
        },
        {
            "id": "2026-05-27-genogram-privacy",
            "date": "2026-05-27",
            "category": "Improvement",
            "title": "Genogram: privacy and crash recovery",
            "summary": "Genograms no longer auto-load on open — the tool always starts blank. If you close the tab unexpectedly, you'll see a Keep / Discard banner the next time you open it. Any genogram autosaved before this change gets a one-time migration prompt so nothing is lost."
        },
        {
            "id": "2026-05-27-life-map-data-safety",
            "date": "2026-05-27",
            "category": "Bug fix",
            "title": "Life Map: won't silently lose your work",
            "summary": "Clicking outside the target details modal no longer dismisses unsaved edits. A subtle bug that wiped custom negative cognitions on re-open is fixed. Crash recovery now offers a recovery banner if you closed the tab without exporting."
        },
        {
            "id": "2026-05-27-polish-pass",
            "date": "2026-05-27",
            "category": "Improvement",
            "title": "Across the suite: UX polish",
            "summary": "Cleaner empty states with a clear first action. Escape closes any modal. Smoother zoom (hold Cmd or Ctrl while scrolling). People in Genogram now show a grab cursor on hover. Zoom percentage readout in Genogram. Many small fixes throughout."
        },
        {
            "id": "2026-05-19-guided-emdr-reports",
            "date": "2026-05-19",
            "category": "New feature",
            "title": "Guided EMDR: downloadable session reports",
            "summary": "Plain-text session reports for charting. All five protocols (Standard, Recent Event, Present Trigger, Flash-Forward, Future Template) are supported."
        }
    ]
}
```

**Notes:**
- Entries are ordered most-recent-first in this seed file, but the page-render JS sorts by date descending anyway. Order in the file doesn't matter.
- Each entry needs a unique `id` for future-proofing (e.g. permalinks). Format: `YYYY-MM-DD-short-slug`.
- `date` is ISO `YYYY-MM-DD`. The render layer formats it to a human-readable string.
- `category` is one of: `"New feature"`, `"Improvement"`, `"Bug fix"`, `"Security"`. Categories drive the badge color in the rendered list.
- `summary` is 1–3 sentences, user-facing language. Avoid implementation jargon.

**Acceptance criteria (code-level):**
1. File exists at repo root with name `whats-new.json`.
2. Parses as valid JSON.
3. Top-level object has an `entries` array.
4. Each entry has `id`, `date`, `category`, `title`, `summary`.

---

## Item 2 — Create `whats-new.html`

**Goal:** A standalone public page that fetches `whats-new.json` and renders the entries in a clean chronological list. Matches the BET marketing-site aesthetic.

**Where:** Create new file at repo root: `whats-new.html`

**Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="assets/owl_favicon_mattegray.ico">
    <link rel="icon" type="image/png" sizes="512x512" href="assets/owl_favicon_mattegray_512.png">
    <link rel="apple-touch-icon" href="assets/owl_favicon_mattegray_512.png">
    <title>What's New - Bright Eyed Therapist</title>
    <meta name="description" content="Recent updates, improvements, and fixes to Bright Eyed Therapist's clinical tools.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <script src="auth.js"></script>
    <script src="main.js" defer></script>
    <style>
        .updates-list {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            max-width: 720px;
            margin: 0 auto;
        }
        .update-card {
            padding: 1.5rem 1.75rem;
            background: #fff;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .update-meta {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        .update-date {
            color: var(--col-text-muted);
            font-size: 0.85rem;
        }
        .update-category {
            display: inline-block;
            padding: 0.2rem 0.7rem;
            border-radius: 999px;
            font-size: 0.68rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .update-category.cat-new-feature { background: #D1FAE5; color: #065F46; }
        .update-category.cat-improvement { background: #DBEAFE; color: #1E40AF; }
        .update-category.cat-bug-fix { background: #FEF3C7; color: #92400E; }
        .update-category.cat-security { background: #FEE2E2; color: #991B1B; }
        .update-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.3rem;
            font-weight: 600;
            margin: 0 0 0.5rem;
            color: var(--col-text-main);
            line-height: 1.3;
        }
        .update-summary {
            color: var(--col-text-muted);
            line-height: 1.6;
            margin: 0;
            font-size: 0.95rem;
        }
        .updates-empty {
            text-align: center;
            color: var(--col-text-muted);
            padding: 3rem 1rem;
        }
    </style>
</head>
<body>

    <header class="container animate-on-scroll">
        <nav>
            <a href="index.html" class="nav-logo">
                <i class="fa-solid fa-leaf" style="color: var(--col-accent);"></i>
                Bright Eyed Therapist
            </a>
            <div class="nav-links">
                <a href="index.html#tools">Tools</a>
                <a href="about.html">About</a>
                <a href="feedback.html">Feedback</a>
                <a href="contact.html">Contact</a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <i class="fa-solid fa-bars"></i>
            </button>
            <a href="login.html" class="nav-cta">Sign In</a>
        </nav>
        <div class="mobile-menu">
            <a href="index.html#tools">Tools</a>
            <a href="about.html">About</a>
            <a href="feedback.html">Feedback</a>
            <a href="contact.html">Contact</a>
            <a href="login.html">Sign In</a>
        </div>
    </header>

    <main class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
        <div style="max-width: 720px; margin: 0 auto 3rem; text-align: center;" class="animate-on-scroll">
            <h1 style="margin-bottom: 0.75rem;">What's New</h1>
            <p style="color: var(--col-text-muted); font-size: 1.05rem; max-width: 540px; margin-left: auto; margin-right: auto;">
                Recent updates, improvements, and fixes. Bright Eyed Therapist is built and maintained by a therapist who uses these tools in practice.
            </p>
        </div>

        <div id="updates-list" class="updates-list">
            <div class="updates-empty">Loading updates...</div>
        </div>
    </main>

    <footer>
        <div class="container footer-content">
            <h4>Bright Eyed Therapist</h4>
            <p style="margin-top: 0.5rem; max-width: 400px; margin-left: auto; margin-right: auto;">
                Trauma telehealth tools for clinicians who do this work.
            </p>
            <p style="margin-top: 2rem; font-size: 0.85rem;">&copy; 2025–2026 Bright Eyed Therapist.</p>
        </div>
    </footer>

    <script>
        const CATEGORY_CLASS = {
            'New feature': 'cat-new-feature',
            'Improvement': 'cat-improvement',
            'Bug fix': 'cat-bug-fix',
            'Security': 'cat-security'
        };

        function escapeText(value) {
            if (value == null) return '';
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function formatDate(isoDate) {
            try {
                const date = new Date(isoDate + 'T00:00:00');
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {
                return isoDate;
            }
        }

        async function loadUpdates() {
            const list = document.getElementById('updates-list');
            try {
                const response = await fetch('whats-new.json?v=' + Date.now());
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const data = await response.json();
                const entries = Array.isArray(data.entries) ? data.entries : [];
                renderUpdates(entries);
                markWhatsNewSeen(entries);
            } catch (err) {
                list.innerHTML = '';
                const empty = document.createElement('div');
                empty.className = 'updates-empty';
                empty.textContent = 'Could not load updates. Please try again later.';
                list.appendChild(empty);
                console.error('Failed to load whats-new.json:', err);
            }
        }

        function renderUpdates(entries) {
            const list = document.getElementById('updates-list');
            list.innerHTML = '';
            if (!entries.length) {
                const empty = document.createElement('div');
                empty.className = 'updates-empty';
                empty.textContent = 'No updates yet.';
                list.appendChild(empty);
                return;
            }
            const sorted = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            sorted.forEach(entry => {
                const card = document.createElement('article');
                card.className = 'update-card animate-on-scroll';

                const meta = document.createElement('div');
                meta.className = 'update-meta';

                const category = document.createElement('span');
                const categoryClass = CATEGORY_CLASS[entry.category] || 'cat-improvement';
                category.className = `update-category ${categoryClass}`;
                category.textContent = entry.category || 'Improvement';

                const date = document.createElement('span');
                date.className = 'update-date';
                date.textContent = formatDate(entry.date);

                meta.appendChild(category);
                meta.appendChild(date);

                const title = document.createElement('h2');
                title.className = 'update-title';
                title.textContent = entry.title || '';

                const summary = document.createElement('p');
                summary.className = 'update-summary';
                summary.textContent = entry.summary || '';

                card.appendChild(meta);
                card.appendChild(title);
                card.appendChild(summary);
                list.appendChild(card);
            });
        }

        function markWhatsNewSeen(entries) {
            if (!Array.isArray(entries) || !entries.length) return;
            const latest = entries.map(e => e.date || '').sort().pop();
            if (!latest) return;
            try {
                localStorage.setItem('bet_whats_new_last_seen', latest);
            } catch (e) {
                // sessionStorage / localStorage may be unavailable in some embedded contexts
            }
        }

        document.addEventListener('DOMContentLoaded', loadUpdates);
    </script>

</body>
</html>
```

**Notes on the implementation:**
- The render loop builds every visible element via `document.createElement` + `textContent` rather than `innerHTML` template strings. Defense-in-depth against XSS: if a future entry's title or summary contains HTML, it renders as text.
- `escapeText` is defined but not used in the render (since we use `textContent`). Kept for completeness; future inline use should call it.
- `fetch('whats-new.json?v=' + Date.now())` cache-busts the JSON so updates are visible immediately after deploy without waiting for browser cache TTL.
- `markWhatsNewSeen` stores the most recent entry's date so the dashboard badge logic can compare.

**Do not touch:**
- `style.css` (uses existing classes only).
- `main.js` or `auth.js`.
- Any other HTML page.

**Acceptance criteria (code-level):**
1. File exists at `whats-new.html`.
2. The page references existing `style.css`, `auth.js`, `main.js`.
3. The script defines `loadUpdates`, `renderUpdates`, `markWhatsNewSeen`, `escapeText`, `formatDate`, `CATEGORY_CLASS`.
4. All entry field assignments use `textContent` (verifiable via grep — should be zero `.innerHTML =` inside the render path, except the loading-state replacement which uses fixed strings).
5. `loadUpdates` is invoked on `DOMContentLoaded`.

---

## Item 3 — Update `dashboard.html`: nav link, badge, Recent Updates section

**Goal:** Add a "What's New" link to the dashboard navigation with a subtle "New" badge that appears only when there's an entry the user hasn't seen yet. Below the tools list, add a compact "Recent Updates" section showing the top 2–3 entries with a link to the full page.

**What changes:**

(a) Add the nav link with badge. Find the nav-links block in the dashboard header (around line 251):

```html
<div class="nav-links" style="display: flex; gap: 1.5rem; align-items: center;">
    <a href="about.html" style="color: var(--col-text-muted); text-decoration: none; font-size: 0.9rem;">About</a>
    <a href="contact.html" style="color: var(--col-text-muted); text-decoration: none; font-size: 0.9rem;">Contact</a>
    <a href="feedback.html" style="color: var(--col-text-muted); text-decoration: none; font-size: 0.9rem;">Feedback</a>
    <span style="color: #E5E7EB;">|</span>
    <a href="account.html" style="color: var(--col-text-muted); text-decoration: none; font-size: 0.9rem;">Account</a>
    <a href="#" onclick="Auth.logout()" class="nav-signout" style="color: var(--col-text-muted); text-decoration: none; font-size: 0.9rem;">Sign Out</a>
    ...
</div>
```

Insert a new link AFTER the Feedback link and BEFORE the `<span>` separator. The new link:

```html
<a href="whats-new.html" id="nav-whats-new" style="color: var(--col-text-muted); text-decoration: none; font-size: 0.9rem; position: relative;">
    What's New
    <span id="whats-new-badge" style="display:none; position: absolute; top: -4px; right: -10px; width: 8px; height: 8px; background: var(--col-accent); border-radius: 50%;" aria-label="New updates available"></span>
</a>
```

Also add the same link to the mobile menu block (around line 265):

```html
<a href="feedback.html">Feedback</a>
<a href="whats-new.html">What's New</a>
<a href="account.html">Account</a>
```

(b) Add the Recent Updates section. Find the closing `</div>` of `.tools-container` (around line 367) and insert a new section right AFTER it but still INSIDE `<main>`:

```html
<!-- Recent Updates (populated from whats-new.json) -->
<div id="recent-updates" class="tools-container animate-on-scroll" style="margin-top: 3rem; display: none;">
    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1rem;">
        <div class="section-label" style="margin-bottom: 0;">Recent Updates</div>
        <a href="whats-new.html" style="font-size: 0.8rem; color: var(--col-primary); text-decoration: none;">View all →</a>
    </div>
    <div id="recent-updates-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
</div>
```

(c) Add the JS that fetches the JSON, renders the top 3, and toggles the badge. Find the existing `<script>` block at the bottom of `dashboard.html` (around line 458). Before its closing `</script>` tag, add a new function and an invocation tied to the existing `DOMContentLoaded` flow.

Easiest: append a new `<script>` block right BEFORE the closing `</body>` tag. The new block:

```html
<script>
(function() {
    const RECENT_LIMIT = 3;
    const LAST_SEEN_KEY = 'bet_whats_new_last_seen';

    const CATEGORY_COLORS = {
        'New feature': { bg: '#D1FAE5', text: '#065F46' },
        'Improvement': { bg: '#DBEAFE', text: '#1E40AF' },
        'Bug fix':     { bg: '#FEF3C7', text: '#92400E' },
        'Security':    { bg: '#FEE2E2', text: '#991B1B' }
    };

    function formatShortDate(isoDate) {
        try {
            const date = new Date(isoDate + 'T00:00:00');
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return isoDate;
        }
    }

    function getLastSeen() {
        try {
            return localStorage.getItem(LAST_SEEN_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    function updateBadge(entries) {
        const badge = document.getElementById('whats-new-badge');
        if (!badge || !entries.length) return;
        const latest = entries.map(e => e.date || '').sort().pop();
        if (!latest) return;
        const lastSeen = getLastSeen();
        if (!lastSeen || latest > lastSeen) {
            badge.style.display = 'inline-block';
        }
    }

    function renderRecent(entries) {
        const container = document.getElementById('recent-updates');
        const list = document.getElementById('recent-updates-list');
        if (!container || !list || !entries.length) return;

        const sorted = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const top = sorted.slice(0, RECENT_LIMIT);

        list.innerHTML = '';
        top.forEach(entry => {
            const row = document.createElement('a');
            row.href = 'whats-new.html';
            row.className = 'tool-row';
            row.style.alignItems = 'flex-start';

            const meta = document.createElement('div');
            meta.style.cssText = 'flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; margin-right: 1rem; min-width: 70px;';

            const dateEl = document.createElement('div');
            dateEl.style.cssText = 'font-size: 0.7rem; color: var(--col-text-muted);';
            dateEl.textContent = formatShortDate(entry.date);
            meta.appendChild(dateEl);

            const catColors = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Improvement'];
            const catEl = document.createElement('div');
            catEl.style.cssText = `display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: ${catColors.bg}; color: ${catColors.text};`;
            catEl.textContent = entry.category || 'Improvement';
            meta.appendChild(catEl);

            row.appendChild(meta);

            const info = document.createElement('div');
            info.className = 'tool-info';
            info.style.marginLeft = '0';

            const title = document.createElement('h4');
            title.className = 'tool-title';
            title.style.fontSize = '0.95rem';
            title.textContent = entry.title || '';
            info.appendChild(title);

            const summary = document.createElement('p');
            summary.className = 'tool-desc';
            summary.style.cssText = 'overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;';
            summary.textContent = entry.summary || '';
            info.appendChild(summary);

            row.appendChild(info);

            const arrow = document.createElement('i');
            arrow.className = 'fa-solid fa-chevron-right tool-arrow';
            row.appendChild(arrow);

            list.appendChild(row);
        });

        container.style.display = '';
    }

    async function loadWhatsNew() {
        try {
            const response = await fetch('whats-new.json?v=' + Date.now());
            if (!response.ok) return;
            const data = await response.json();
            const entries = Array.isArray(data.entries) ? data.entries : [];
            updateBadge(entries);
            renderRecent(entries);
        } catch (err) {
            // Fail silently — Recent Updates section just stays hidden
        }
    }

    document.addEventListener('DOMContentLoaded', loadWhatsNew);
})();
</script>
```

**Notes:**
- The IIFE keeps the dashboard's existing globals clean.
- The Recent Updates container is `display: none` by default and only becomes visible if at least one entry loads. If the fetch fails or returns empty, the section stays hidden — no broken "Recent Updates" header with empty body.
- Each recent row is wrapped in an `<a href="whats-new.html">` so the whole card is clickable, navigating to the full list.
- The styling reuses the existing `.tool-row` / `.tool-info` / `.tool-title` / `.tool-desc` classes for visual consistency with the tools list above, just with date + category metadata in place of the icon.
- The badge update logic checks `latest > lastSeen` (string comparison on ISO dates — works correctly because YYYY-MM-DD is lexicographically sortable).

**Do not touch:**
- The existing welcome banner.
- The tools-container itself (only inserting a sibling section after it).
- The Auth / login overlay / welcome modal logic.
- The existing event listeners.

**Acceptance criteria (code-level):**
1. The nav has a new `<a href="whats-new.html" id="nav-whats-new">` element between Feedback and the `|` separator.
2. The mobile menu has the same link between Feedback and Account.
3. The nav link contains a `<span id="whats-new-badge">` element with default `display: none`.
4. A new `<div id="recent-updates">` exists after `.tools-container` with `display: none` default.
5. The new `<script>` block defines `loadWhatsNew`, `updateBadge`, `renderRecent` (inside an IIFE).
6. `loadWhatsNew` is invoked on `DOMContentLoaded`.

---

## Post-execution verification (Composer)

After all three items implemented:

1. **`whats-new.json` parses as valid JSON** (try `JSON.parse` on the file contents — should not throw).
2. **`whats-new.html` loads** without console errors. The Recent Updates render correctly (6 cards in chronological order, most recent first).
3. **Dashboard fetches the JSON** on load. With no `bet_whats_new_last_seen` in localStorage (fresh visit), the badge becomes visible. The Recent Updates section appears below the tools list with the top 3 entries.
4. **Visiting `whats-new.html` and returning to dashboard** clears the badge — `bet_whats_new_last_seen` is now `'2026-05-27'` (the latest entry's date), so the comparison `latest > lastSeen` is false.
5. **Badge re-appears when a new entry is added** to `whats-new.json` with a date newer than the stored `bet_whats_new_last_seen` value.
6. **XSS test:** add a temporary entry with `title: "<script>alert(1)</script>Test"` — both pages render the literal text, no script executes. Remove the temporary entry afterward.
7. **Fetch failure handled gracefully:** rename `whats-new.json` temporarily to simulate a 404. The Recent Updates section stays hidden on dashboard (no broken UI). The whats-new.html page shows a "Could not load" message. Restore the file after testing.

If all seven pass, report DONE.

---

## Maintenance after this batch (for Matthew)

The only file you edit to surface a new update is `whats-new.json`. Add an entry to the `entries` array with:

```json
{
    "id": "YYYY-MM-DD-short-slug",
    "date": "YYYY-MM-DD",
    "category": "New feature" | "Improvement" | "Bug fix" | "Security",
    "title": "User-facing title, sentence case",
    "summary": "One to three sentences in plain English. Skip implementation jargon. Mention discoverability if a new feature is somewhere non-obvious."
}
```

Both pages pick it up automatically on next load (no rebuild step, no cache flush — the cache-buster query string handles that). The badge will appear for everyone whose `bet_whats_new_last_seen` is older than the new entry's date.

**Cadence suggestion:** one entry per shipped Composer batch. Group related sub-items into a single entry rather than listing every internal fix. Users care about what changed for them, not what files were touched.

---

## Out of scope

- Adding "What's New" links to the marketing-site nav (`index.html`, `about.html`, etc.). Could be a small follow-up. Skipping for now to keep this batch focused.
- RSS feed for the changelog.
- Per-category filtering on the whats-new page.
- Search.
- Email notifications when a new entry ships.
- A first-launch tour or onboarding modal (deliberately excluded per my recommendation).
- Per-tool changelogs inside individual tool pages.
- Any backend / API / auth file.

---

*End of build spec.*
