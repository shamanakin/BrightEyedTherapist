# Pilot Light — data schema (v1)

Everything Pilot Light stores or exchanges is plain JSON. Use this reference for scripts, bots, spreadsheets or a future SaaS viewer.

- **Dates** are calendar days, `YYYY-MM-DD`, in the user's chosen time zone (Settings → Time & display; default `America/Los_Angeles`).
- **Scores** are integers `0–10`, or `null` for "not rated". Missing and `null` mean the same thing.
- **The primary key is `date`.** There is one object per day.

## Where it lives

| Place | Contents |
|---|---|
| `localStorage["pilot-light:v1:entries"]` | JSON array of **day entries** |
| `localStorage["pilot-light:v1:settings"]` | **Settings** object |
| Export file `pilot-light-YYYY-MM-DD.json` | **Export envelope** (below) |
| Setup file `pilot-light-setup.json` | **Setup envelope** (below) |
| Setup link `…/index.html#setup=<base64url>` | Base64url-encoded UTF-8 JSON of the **shareable settings** |
| `data/entries.json` | Example-only export envelope (every day has `"example": true`) |

## Export envelope

```json
{
  "format": "pilot-light",
  "version": 1,
  "kind": "entries",
  "exportedAt": "2026-09-29T20:00:00.000Z",
  "timezone": "America/Los_Angeles",
  "settings": { "…": "optional, see Settings" },
  "entries": [ { "date": "2026-09-28", "drive": 6 } ]
}
```

**Import accepts:**
1. an export envelope (`entries` array, optional `settings`);
2. a setup envelope (`kind: "setup"`), which applies settings and doesn't touch days;
3. a **bare array** of day entries (handy for hand-written or script-generated files).

**Merge rules:** days are matched by `date`. The app asks before replacing a day that already exists; if the user declines, only new days are added. Unreadable items are skipped and counted. Settings from a file are applied only if the user confirms.

## Day entry

| Field | Type | Notes |
|---|---|---|
| `date` | string | `YYYY-MM-DD`, **required** |
| `example` | `true` | Optional. Marks sample data; it's removed the moment the user edits that day. |
| `drive` | 0–10 \| null | **Primary metric.** Subjective drive / motivation / get-up-and-go. |
| `scales` | `{ [scaleId]: 0–10 }` | Check-in sliders, keyed by `settings.scales[].id` (e.g. `energy`, `focus`, `mood`, `stress`, or custom ids). Unrated scales are omitted. |
| `sleep.quality` | 0–10 \| null | Last night |
| `sleep.bed`, `sleep.wake` | `"HH:MM"` \| `""` | 24-hour |
| `levers` | `{ [leverId]: boolean }` | Protocol checklist, keyed by `settings.levers[].id` |
| `movement.did` | boolean | |
| `movement.kind` | string | One of `Walk`, `Strength`, `Cardio`, `Stretch / yoga`, `Sport`, `Rehab / PT`, `Other`, or `""` |
| `movement.minutes` | 0–1440 \| null | |
| `food.quality` | 0–10 \| null | |
| `food.firstMeal` | `"HH:MM"` \| `""` | |
| `food.note` | string ≤ 200 | |
| `body.level` | 0–10 \| null | Optional pain / discomfort. 0 = none. |
| `body.where` | string ≤ 200 | Free text: location or kind |
| `meds` | `{ [medId]: boolean }` | Keyed by `settings.meds[].id` (user-defined) |
| `medsNote` | string ≤ 200 | |
| `habits` | `{ [habitId]: { used, when, amount, note } }` | Keyed by `settings.habits[].id`. `when` ∈ `"" \| morning \| afternoon \| evening \| night \| multiple`; `amount` ∈ `"" \| light \| moderate \| heavy`; `note` ≤ 200 |
| `win` | string ≤ 200 | One small win today |
| `intention` | string ≤ 200 | One thing for tomorrow |
| `session` | string ≤ 4000 | "For my next session" notes |
| `notes` | string ≤ 4000 | |
| `tags` | string[] | Lower-case, de-duplicated, ≤ 20 tags of ≤ 40 chars |
| `updatedAt` | ISO string \| null | Last edit time |

Any **other** top-level field matching `^[A-Za-z][A-Za-z0-9_]{0,40}$` is preserved as-is (forward compatibility).

### Minimal valid entry

```json
{ "date": "2026-09-28", "drive": 6 }
```

### Full entry

```json
{
  "date": "2026-09-28",
  "drive": 6,
  "scales": { "energy": 5, "focus": 6, "mood": 7 },
  "sleep": { "quality": 7, "bed": "22:45", "wake": "06:50" },
  "levers": { "light": true, "caffeine": false, "move": true, "meal": true, "connect": false, "winddown": true },
  "movement": { "did": true, "kind": "Walk", "minutes": 25 },
  "food": { "quality": 6, "firstMeal": "08:30", "note": "" },
  "body": { "level": 2, "where": "tight shoulders" },
  "meds": { "vitamin-d": true },
  "medsNote": "",
  "habits": { "alcohol": { "used": true, "when": "evening", "amount": "light", "note": "" } },
  "win": "Started before I felt ready.",
  "intention": "Walk before email.",
  "session": "",
  "notes": "Slow start, better after a walk.",
  "tags": ["work"],
  "updatedAt": "2026-09-28T21:02:11.000Z"
}
```

## Settings

| Field | Type | Default |
|---|---|---|
| `timezone` | IANA zone | `America/Los_Angeles` |
| `weekStart` | `0` (Sun) \| `1` (Mon) | `0` |
| `theme` | `auto` \| `light` \| `dark` | `auto` |
| `sharedBy` | string ≤ 60 | `""`, shown as "set up by …" |
| `onboarded` | boolean | `false` |
| `modules` | `{ checkin, sleep, levers, movement, food, body, meds, habits, wins, session }` booleans | Everyday preset: checkin, sleep, levers, movement and wins on |
| `scales` | `[{ id, label, on }]` | Energy, Focus, Mood (on); Stress (off) |
| `levers` | `[{ id, label, on }]` | `light`, `caffeine`, `move`, `meal`, `connect`, `winddown` |
| `meds` | `[{ id, label, on }]` | `[]`, never preloaded |
| `habits` | `[{ id, label, on }]` | `[{ id: "habit", label: "Substance or habit" }]` |
| `bodyLabel` | string ≤ 60 | `Body / discomfort` |

List rules: at most 40 items; labels are 1–60 characters; ids are `[a-z0-9_-]{1,40}` (derived from the label if missing or duplicated). Removing an item from a list **doesn't** delete past data; old keys simply stop being shown.

## Setup envelope (shareable settings)

```json
{
  "format": "pilot-light",
  "version": 1,
  "kind": "setup",
  "settings": { "sharedBy": "", "modules": {}, "scales": [], "levers": [], "meds": [], "habits": [], "bodyLabel": "" }
}
```

A setup contains **only** `sharedBy`, `modules`, `scales`, `levers`, `meds`, `habits` and `bodyLabel`. It never contains days, notes, time zone, theme or onboarding state. On apply, only the keys present are replaced.

## Derived values (computed, not stored)

- **7-day average**: trailing mean of rated days in the window, shown once 2+ values exist.
- **Streak**: consecutive days with any content, ending today (or yesterday if today isn't logged yet).
- **Patterns**: for each active lever, habit and med, plus "slept 7+" and "moved 20+ minutes": mean drive on rated days *with* vs. *without*. Shown once both sides have 3+ days. Descriptive only.
