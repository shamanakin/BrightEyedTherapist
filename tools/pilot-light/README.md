# Pilot Light

**A private, local-first daily tracker for drive and motivation.** One big slider a day, plus whatever else you choose to watch. Over time it shows a heatmap, a trend line and gentle patterns. Shared via Bright Eyed Therapist.

- No account, no server, **no network requests** (enforced by the page's Content Security Policy).
- Works offline straight from disk (`file://`), or from any static host.
- Plain HTML/CSS/JS with zero dependencies.

For the product and architecture brief, see [`MOE.md`](MOE.md). The data format is in [`schema.md`](schema.md). A one-page guide for friends is in [`SHARE.md`](SHARE.md).

---

## Open it

1. Download or copy this whole folder (`pilot-light/`). Keep `index.html` and `assets/` together.
2. Double-click **`index.html`** to open it in Chrome, Edge, Firefox or Safari.

That's it. Your days are saved automatically in that browser on that device.

Optional: to serve the folder locally (for example to test setup links between browsers):

```bash
cd tools/pilot-light
python3 -m http.server 8765
# open http://localhost:8765/
```

## Use it

| Step | What to do |
|---|---|
| Rate **Drive** | Slide it or tap a number from 0 to 10. It's empty until you rate it, so skipped days stay honest. |
| Tick what applies | Check-in sliders, sleep, levers, movement… Every section is optional. |
| Move between days | Use **‹ ›**, the date picker, the heatmap, or your keyboard: `←` `→` for days, `T` for today, `0`–`9` to set drive. |
| Choose what to track | **Settings → What to track**. Presets: *Minimal*, *Everyday*, *Clinical*. |
| Customize | **Settings → Your lists**: rename, hide, add or remove scales, levers, meds, and substances or habits. |
| Look back | Heatmap (16 weeks), Trend (30/90 days with a 7-day average), and Patterns (average drive with vs. without each lever or habit). |
| Print | **Patterns → Print / PDF summary** gives a one-page 30-day summary to bring to a session. |

## Your data

- It's stored in this browser's `localStorage` under `pilot-light:v1:entries` and `pilot-light:v1:settings`.
- **Export** downloads `pilot-light-YYYY-MM-DD.json` containing every day plus your settings. Do this now and then; clearing browser data erases local storage.
- **Import** reads an export, a setup file, or a bare JSON array of days. It merges by date and asks before replacing days you already have.
- **Example days**: welcome card → *Try with example days*, or Settings → *Load example days*. They're striped on the heatmap and removable in one click. `data/entries.json` holds the same kind of example data as a file, if you want to see the format or test Import.
- **Erase everything**: Settings → Your data.

## Share a setup (friends, clinicians, coaches)

Settings → **Share this setup** creates a link or a small file with your module choices and lists, plus an optional "Set up by" name. It **never includes days or notes**. The person who opens it sees an "Apply setup?" banner and keeps full control.

- When the page is hosted (for example on brighteyedtherapist.com), send the **link**. The setup rides in the `#fragment`, which browsers don't send to servers.
- When you're running from a file, send the **setup file** instead; they open it with Import.
- If your meds or habits lists are personal, clear them before sharing.

## Files

```
pilot-light/
  index.html          the app: open this
  assets/core.js      data layer (model, validation, import/export, stats), no DOM
  assets/app.js       UI
  assets/app.css      styles (light, dark, print)
  assets/mark.svg     logo / favicon
  data/entries.json   example-only export
  tests/              node:test unit + privacy tests
  MOE.md              product & architecture brief
  schema.md           data format
  SHARE.md            one-pager for friends
```

## Development

```bash
node --test tools/pilot-light/tests/*.test.js
```

- `core.test.js` covers dates and time zones, sanitizing, import/export round-trips, merge, setup links, summary, streak, patterns and example data.
- `privacy.test.js` scans every file in this folder for personal terms from the original private prototype (stored as hashes) and checks that the app code makes no network calls.

Constraints to keep:
- **No ES modules or `fetch`**, because both break over `file://`. `core.js` is a UMD script (it sets `window.PilotLightCore` and supports `require()` in Node).
- **No `innerHTML` with user or link data.** Build DOM with the `h()` helper in `app.js` and `textContent`.
- **No inline `<style>`, `<script>` or `style=""` attributes**, because the CSP blocks them. Setting `element.style.*` from JS is fine.
- **No third-party requests** (fonts, CDNs, analytics).

## Deploying on brighteyedtherapist.com (optional)

This folder is self-contained and doesn't touch existing routes. To publish it, include `tools/pilot-light/` in a targeted upload (see `DEPLOY.md` in the repo root); it then serves at `/tools/pilot-light/`. Notes:
- The site's `.htaccess` already denies `*.md`, so these docs stay private; only the app is served.
- The page is `noindex, nofollow` and sends no referrer.
- Nothing links to it yet. Adding a card to the homepage or dashboard is a separate, deliberate step (see `MOE.md` §11).

## Browser support

The current versions of Chrome, Edge, Firefox and Safari on desktop and mobile. It relies on `<dialog>`, CSS `:has()` and `color-mix()`, and `Intl` time zones.

## Disclaimer

Pilot Light is a self-reflection tool, **not medical advice**, diagnosis or treatment. It is not for emergencies: in the US call or text **988**; elsewhere, contact local emergency services.
