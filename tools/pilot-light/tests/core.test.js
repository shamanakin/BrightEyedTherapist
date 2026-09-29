// Run: node --test tools/pilot-light/tests/*.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../assets/core.js");

test("today respects the configured time zone", () => {
  const instant = new Date("2026-09-29T05:30:00Z");
  assert.strictEqual(C.todayIn("America/Los_Angeles", instant), "2026-09-28");
  assert.strictEqual(C.todayIn("Europe/London", instant), "2026-09-29");
  assert.strictEqual(C.todayIn("Not/AZone", instant), "2026-09-28");
});

test("date math crosses months, years and DST safely", () => {
  assert.strictEqual(C.addDays("2026-03-08", 1), "2026-03-09");
  assert.strictEqual(C.addDays("2026-12-31", 1), "2027-01-01");
  assert.strictEqual(C.addDays("2024-03-01", -1), "2024-02-29");
  assert.strictEqual(C.daysBetween("2026-09-01", "2026-09-29"), 28);
  assert.ok(C.isYMD("2026-02-28"));
  assert.ok(!C.isYMD("2026-02-30"));
});

test("normalizeEntry clamps, cleans and drops bad data", () => {
  const e = C.normalizeEntry(JSON.parse(
    '{"date":"2026-09-20","drive":14,"scales":{"energy":"7","__proto__":3,"bad":"x"},' +
    '"levers":{"light":true,"move":"yes"},"habits":{"alcohol":{"used":true,"when":"dawn","amount":"light"}},' +
    '"tags":"Work, work, travel","movement":{"did":true,"kind":"Walk","minutes":99999},' +
    '"sleep":{"quality":-3,"wake":"25:00","bed":"22:30"},"futureField":{"a":1},"__proto__":{"drive":1}}'));
  assert.strictEqual(e.drive, 10);
  assert.deepStrictEqual(e.scales, { energy: 7 });
  assert.deepStrictEqual(e.levers, { light: true });
  assert.deepStrictEqual(e.habits.alcohol, { used: true, when: "", amount: "light", note: "" });
  assert.deepStrictEqual(e.tags, ["work", "travel"]);
  assert.strictEqual(e.movement.minutes, 1440);
  assert.strictEqual(e.sleep.quality, 0);
  assert.strictEqual(e.sleep.wake, "");
  assert.strictEqual(e.sleep.bed, "22:30");
  assert.deepStrictEqual(e.futureField, { a: 1 });
  assert.strictEqual(C.normalizeEntry({ date: "yesterday" }), null);
  assert.strictEqual(Object.getPrototypeOf(e.scales), Object.prototype);
});

test("settings sanitize lists, ids and unknown values", () => {
  const s = C.normalizeSettings({
    timezone: "Mars/Olympus", theme: "neon", modules: { meds: true, nope: true },
    meds: [{ label: "  Vitamin D  " }, { label: "" }, { id: "x", label: "Iron" }, { id: "x", label: "Iron again" }],
    habits: "not a list"
  });
  assert.strictEqual(s.timezone, C.DEFAULT_TZ);
  assert.strictEqual(s.theme, "auto");
  assert.strictEqual(s.modules.meds, true);
  assert.ok(!("nope" in s.modules));
  assert.deepStrictEqual(s.meds.map((m) => m.label), ["Vitamin D", "Iron", "Iron again"]);
  assert.strictEqual(new Set(s.meds.map((m) => m.id)).size, 3);
  assert.deepStrictEqual(s.habits, C.defaultSettings().habits);
});

test("defaults are generic: no meds preloaded, neutral levers", () => {
  const d = C.defaultSettings();
  assert.deepStrictEqual(d.meds, []);
  assert.strictEqual(d.timezone, "America/Los_Angeles");
  assert.ok(d.levers.length >= 4);
  assert.strictEqual(d.modules.meds, false);
  assert.strictEqual(d.modules.habits, false);
});

test("export → import round-trips entries and settings", () => {
  const map = {};
  C.exampleEntries("2026-09-29", 14).forEach((e) => { map[e.date] = e; });
  const settings = C.defaultSettings();
  const file = JSON.stringify(C.buildExport(map, settings, new Date("2026-09-29T12:00:00Z")));
  const parsed = C.parseImport(file);
  assert.strictEqual(parsed.kind, "entries");
  assert.deepStrictEqual(parsed.entries, C.sortedEntries(map));
  assert.deepStrictEqual(parsed.settings, settings);
});

test("import accepts a bare array and rejects junk", () => {
  const p = C.parseImport(JSON.stringify([{ date: "2026-09-01", drive: 4 }, { nope: 1 }]));
  assert.strictEqual(p.entries.length, 1);
  assert.strictEqual(p.skipped, 1);
  assert.throws(() => C.parseImport("{not json"), /valid JSON/);
  assert.throws(() => C.parseImport('{"hello":1}'), /doesn’t look like/);
});

test("merge: incoming wins and counts are reported", () => {
  const map = { "2026-09-01": C.normalizeEntry({ date: "2026-09-01", drive: 2 }) };
  const res = C.mergeEntries(map, [C.normalizeEntry({ date: "2026-09-01", drive: 8 }), C.normalizeEntry({ date: "2026-09-02", drive: 5 })]);
  assert.deepStrictEqual(res, { added: 1, updated: 1 });
  assert.strictEqual(map["2026-09-01"].drive, 8);
});

test("setup links round-trip and never carry entries or personal prefs", () => {
  const s = C.defaultSettings();
  s.sharedBy = "Riverside Counseling — Élodie";
  s.timezone = "Europe/Paris";
  s.modules.session = true;
  s.levers.push({ id: "journal", label: "Journaled ✍️", on: true });
  const hash = "#" + C.encodeSetupHash(s);
  const raw = C.decodeSetupHash(hash);
  assert.strictEqual(raw.sharedBy, s.sharedBy);
  assert.ok(!("timezone" in raw));
  assert.ok(!("entries" in raw));
  const mine = C.defaultSettings();
  mine.timezone = "Asia/Tokyo";
  const applied = C.applySetup(mine, raw);
  assert.strictEqual(applied.timezone, "Asia/Tokyo");
  assert.strictEqual(applied.modules.session, true);
  assert.strictEqual(applied.levers.at(-1).label, "Journaled ✍️");
  assert.strictEqual(C.decodeSetupHash("#setup=!!!"), null);
  assert.strictEqual(C.decodeSetupHash("#other=1"), null);
});

test("setup file import is recognised", () => {
  const p = C.parseImport(JSON.stringify(C.buildSetup(C.defaultSettings())));
  assert.strictEqual(p.kind, "setup");
  assert.deepStrictEqual(p.entries, []);
  assert.ok(Array.isArray(p.settings.levers));
});

test("summary, streak and rolling average", () => {
  const map = {};
  [["2026-09-27", 4], ["2026-09-28", 6], ["2026-09-29", 8]].forEach(([d, v]) => { map[d] = C.normalizeEntry({ date: d, drive: v }); });
  const s = C.summary(map, "2026-09-29", 30);
  assert.strictEqual(s.avg, 6);
  assert.strictEqual(s.logged, 3);
  assert.strictEqual(s.streak, 3);
  assert.strictEqual(s.best.value, 8);
  assert.strictEqual(s.delta, null);
  const r = C.rolling(C.driveSeries(map, "2026-09-29", 3), 7);
  assert.deepStrictEqual(r.map((p) => p.value), [null, 5, 6]);
  assert.strictEqual(C.summary(map, "2026-09-30", 30).streak, 3);
});

test("factors compare drive with vs without, and wait for enough days", () => {
  const map = {};
  for (let i = 0; i < 8; i++) {
    const d = C.addDays("2026-09-29", -i);
    map[d] = C.normalizeEntry({ date: d, drive: i % 2 ? 7 : 3, levers: { light: i % 2 === 1 } });
  }
  const f = C.factors(map, C.defaultSettings(), "2026-09-29", 30);
  const light = f.find((x) => x.key === "lever:light");
  assert.strictEqual(light.ready, true);
  assert.strictEqual(light.diff, 4);
  assert.strictEqual(f[0].key, "lever:light");
  const sleep = f.find((x) => x.key === "sleep7");
  assert.strictEqual(sleep.nYes + sleep.nNo, 0);
  assert.strictEqual(sleep.ready, false);
});

test("example data is deterministic and flagged", () => {
  const a = C.exampleEntries("2026-09-29", 28);
  const b = C.exampleEntries("2026-09-29", 28);
  assert.deepStrictEqual(a, b);
  assert.ok(a.length > 15);
  assert.ok(a.every((e) => e.example === true && e.drive >= 0 && e.drive <= 10));
  assert.strictEqual(a.at(-1).date, "2026-09-29");
});

test("bundled data/entries.json is a valid example-only export", () => {
  const text = fs.readFileSync(path.join(__dirname, "..", "data", "entries.json"), "utf8");
  const raw = JSON.parse(text);
  assert.strictEqual(raw.format, "pilot-light");
  const p = C.parseImport(text);
  assert.strictEqual(p.skipped, 0);
  assert.ok(p.entries.length > 0);
  assert.ok(p.entries.every((e) => e.example === true));
});
