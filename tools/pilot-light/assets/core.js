/*
 * Pilot Light — data core.
 * No DOM access. Loaded as a classic <script> (ES modules are blocked on file://)
 * and also require()-able from Node for tests.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PilotLightCore = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var FORMAT = "pilot-light";
  var VERSION = 1;
  var DEFAULT_TZ = "America/Los_Angeles";
  var MAX_LIST = 40;
  var MAX_LABEL = 60;
  var MAX_NOTE = 4000;
  var MAX_SHORT = 200;
  var MAX_TAGS = 20;
  var MAX_SETUP_HASH = 8000;
  function unsafeKey(k) { return k === "__proto__" || k === "constructor" || k === "prototype"; }

  var MODULES = [
    { id: "checkin", label: "Check-in scales", desc: "Quick 0–10 sliders: energy, focus, mood (editable)." },
    { id: "sleep", label: "Sleep", desc: "Last night’s sleep quality, bedtime and wake time." },
    { id: "levers", label: "Levers", desc: "Your daily protocol checklist: light, caffeine timing, movement, wind-down…" },
    { id: "movement", label: "Movement", desc: "Whether you moved, what kind, and for how long." },
    { id: "food", label: "Food", desc: "Food quality, first-meal time and a note." },
    { id: "body", label: "Body & discomfort", desc: "Optional 0–10 pain or discomfort, and where." },
    { id: "meds", label: "Meds & supplements", desc: "Your own checklist. Nothing is preloaded." },
    { id: "habits", label: "Substances & habits", desc: "Anything you want to keep an eye on — you name it." },
    { id: "wins", label: "Win & intention", desc: "One small win today, one thing for tomorrow." },
    { id: "session", label: "For my next session", desc: "Things to bring to therapy, coaching or a check-in." }
  ];

  var PRESETS = {
    minimal: { label: "Minimal", desc: "Just drive and notes.", modules: [] },
    everyday: { label: "Everyday", desc: "Drive, check-in, sleep, levers, movement, a daily win.", modules: ["checkin", "sleep", "levers", "movement", "wins"] },
    clinical: { label: "Clinical", desc: "Everyday plus body, meds, habits and session notes.", modules: ["checkin", "sleep", "levers", "movement", "body", "meds", "habits", "wins", "session"] }
  };

  var MOVEMENT_KINDS = ["Walk", "Strength", "Cardio", "Stretch / yoga", "Sport", "Rehab / PT", "Other"];
  var HABIT_WHEN = [
    { id: "", label: "When?" },
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "evening", label: "Evening" },
    { id: "night", label: "Late night" },
    { id: "multiple", label: "Several times" }
  ];
  var HABIT_AMOUNT = [
    { id: "", label: "How much?" },
    { id: "light", label: "A little" },
    { id: "moderate", label: "Moderate" },
    { id: "heavy", label: "A lot" }
  ];

  var DRIVE_WORDS = [
    "Just the pilot light", "Barely flickering", "Flickering", "Low and steady", "Warming up",
    "Steady", "Warm", "Glowing", "Bright", "Very bright", "Fully lit"
  ];

  /* ---------- small utils ---------- */

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  function cleanStr(v, max) {
    if (typeof v !== "string") return "";
    return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
  }
  function cleanLabel(v) { return cleanStr(v, MAX_LABEL).replace(/\s+/g, " "); }

  function cleanId(v) {
    if (typeof v !== "string") return "";
    var s = v.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    return unsafeKey(s) ? "" : s;
  }

  function slug(label) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "item";
  }

  function makeId(label, taken) {
    var base = slug(label);
    var id = base;
    var n = 2;
    while (taken && taken[id]) id = base + "-" + n++;
    return id;
  }

  function score(v) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    if (!isFinite(n)) return null;
    return Math.max(0, Math.min(10, Math.round(n)));
  }

  function cleanTime(v) { return typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : ""; }

  function cleanMinutes(v) {
    if (v === null || v === undefined || v === "") return null;
    var n = Math.round(Number(v));
    return isFinite(n) ? Math.max(0, Math.min(1440, n)) : null;
  }

  function oneOf(v, options) {
    for (var i = 0; i < options.length; i++) if (options[i].id === v) return v;
    return "";
  }

  function boolMap(raw) {
    var out = {};
    if (!isObj(raw)) return out;
    Object.keys(raw).forEach(function (k) {
      var id = cleanId(k);
      if (id && typeof raw[k] === "boolean") out[id] = raw[k];
    });
    return out;
  }

  function mean(arr) {
    if (!arr.length) return null;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  function round1(v) { return v == null ? null : Math.round(v * 10) / 10; }

  /* ---------- dates (plain YYYY-MM-DD strings, calendar math in UTC) ---------- */

  function isValidTz(tz) {
    if (typeof tz !== "string" || !tz) return false;
    try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch (e) { return false; }
  }

  function ymdIn(date, tz) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: isValidTz(tz) ? tz : DEFAULT_TZ, year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date);
    var p = {};
    parts.forEach(function (x) { p[x.type] = x.value; });
    return p.year + "-" + p.month + "-" + p.day;
  }

  function todayIn(tz, now) { return ymdIn(now || new Date(), tz); }

  function isYMD(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var y = +s.slice(0, 4), m = +s.slice(5, 7), d = +s.slice(8, 10);
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }

  function toUTC(ymd) { return new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10))); }

  function addDays(ymd, delta) {
    var dt = toUTC(ymd);
    dt.setUTCDate(dt.getUTCDate() + delta);
    return dt.toISOString().slice(0, 10);
  }

  function dayOfWeek(ymd) { return toUTC(ymd).getUTCDay(); }

  function daysBetween(a, b) { return Math.round((toUTC(b) - toUTC(a)) / 86400000); }

  function formatDate(ymd, opts) {
    return toUTC(ymd).toLocaleDateString("en-US", Object.assign({ timeZone: "UTC" }, opts || {}));
  }

  /* ---------- settings ---------- */

  function presetModules(name) {
    var on = (PRESETS[name] || PRESETS.everyday).modules;
    var out = {};
    MODULES.forEach(function (m) { out[m.id] = on.indexOf(m.id) !== -1; });
    return out;
  }

  function defaultSettings() {
    return {
      timezone: DEFAULT_TZ,
      weekStart: 0,
      theme: "auto",
      sharedBy: "",
      onboarded: false,
      modules: presetModules("everyday"),
      scales: [
        { id: "energy", label: "Energy", on: true },
        { id: "focus", label: "Focus", on: true },
        { id: "mood", label: "Mood", on: true },
        { id: "stress", label: "Stress", on: false }
      ],
      levers: [
        { id: "light", label: "Morning light outside (~10 min)", on: true },
        { id: "caffeine", label: "Waited 60–90 min before caffeine", on: true },
        { id: "move", label: "Moved my body (even 10 min)", on: true },
        { id: "meal", label: "Ate a real first meal", on: true },
        { id: "connect", label: "Connected with someone", on: true },
        { id: "winddown", label: "Wind-down: screens dim, lights low", on: true }
      ],
      meds: [],
      habits: [{ id: "habit", label: "Substance or habit", on: true }],
      bodyLabel: "Body / discomfort"
    };
  }

  function cleanList(raw, fallback) {
    if (!Array.isArray(raw)) return clone(fallback);
    var seen = {};
    var out = [];
    raw.slice(0, MAX_LIST).forEach(function (it) {
      if (!isObj(it)) return;
      var label = cleanLabel(it.label);
      if (!label) return;
      var id = cleanId(it.id);
      if (!id || seen[id]) id = makeId(label, seen);
      seen[id] = true;
      out.push({ id: id, label: label, on: it.on !== false });
    });
    return out;
  }

  function normalizeSettings(raw) {
    var d = defaultSettings();
    if (!isObj(raw)) return d;
    var s = {
      timezone: isValidTz(raw.timezone) ? raw.timezone : d.timezone,
      weekStart: raw.weekStart === 1 ? 1 : 0,
      theme: raw.theme === "light" || raw.theme === "dark" ? raw.theme : "auto",
      sharedBy: cleanLabel(raw.sharedBy),
      onboarded: raw.onboarded === true,
      modules: {},
      scales: cleanList(raw.scales, d.scales),
      levers: cleanList(raw.levers, d.levers),
      meds: cleanList(raw.meds, d.meds),
      habits: cleanList(raw.habits, d.habits),
      bodyLabel: cleanLabel(raw.bodyLabel) || d.bodyLabel
    };
    MODULES.forEach(function (m) {
      s.modules[m.id] = isObj(raw.modules) && typeof raw.modules[m.id] === "boolean" ? raw.modules[m.id] : d.modules[m.id];
    });
    return s;
  }

  /** The part of settings a clinician/friend can hand to someone else. Never includes entries. */
  function shareableSettings(s) {
    return {
      sharedBy: s.sharedBy,
      modules: clone(s.modules),
      scales: clone(s.scales),
      levers: clone(s.levers),
      meds: clone(s.meds),
      habits: clone(s.habits),
      bodyLabel: s.bodyLabel
    };
  }

  /** Apply a shared setup onto the user's own settings, keeping personal prefs (timezone, theme…). */
  var SETUP_KEYS = ["sharedBy", "modules", "scales", "levers", "meds", "habits", "bodyLabel"];

  function applySetup(current, setup) {
    var out = clone(current);
    if (!isObj(setup)) return out;
    var probe = {};
    SETUP_KEYS.forEach(function (k) { if (own(setup, k)) probe[k] = setup[k]; });
    var norm = normalizeSettings(probe);
    SETUP_KEYS.forEach(function (k) { if (own(setup, k)) out[k] = norm[k]; });
    return out;
  }

  /* ---------- entries ---------- */

  function emptyEntry(date) {
    return {
      date: date,
      drive: null,
      scales: {},
      sleep: { quality: null, bed: "", wake: "" },
      levers: {},
      movement: { did: false, kind: "", minutes: null },
      food: { quality: null, firstMeal: "", note: "" },
      body: { level: null, where: "" },
      meds: {},
      medsNote: "",
      habits: {},
      win: "",
      intention: "",
      session: "",
      notes: "",
      tags: [],
      updatedAt: null
    };
  }

  var KNOWN_KEYS = Object.keys(emptyEntry("2000-01-01")).concat(["example"]);

  function cleanTags(raw) {
    var list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
    var seen = {};
    var out = [];
    list.forEach(function (t) {
      var tag = cleanLabel(typeof t === "string" ? t : "").toLowerCase().slice(0, 40);
      if (tag && !seen[tag] && out.length < MAX_TAGS) { seen[tag] = 1; out.push(tag); }
    });
    return out;
  }

  function normalizeEntry(raw) {
    if (!isObj(raw) || !isYMD(raw.date)) return null;
    var e = emptyEntry(raw.date);
    if (raw.example === true) e.example = true;
    e.drive = score(raw.drive);

    if (isObj(raw.scales)) {
      Object.keys(raw.scales).forEach(function (k) {
        var id = cleanId(k), v = score(raw.scales[k]);
        if (id && v !== null) e.scales[id] = v;
      });
    }
    if (isObj(raw.sleep)) {
      e.sleep.quality = score(raw.sleep.quality);
      e.sleep.bed = cleanTime(raw.sleep.bed);
      e.sleep.wake = cleanTime(raw.sleep.wake);
    }
    e.levers = boolMap(raw.levers);
    if (isObj(raw.movement)) {
      e.movement.did = raw.movement.did === true;
      e.movement.kind = MOVEMENT_KINDS.indexOf(raw.movement.kind) !== -1 ? raw.movement.kind : "";
      e.movement.minutes = cleanMinutes(raw.movement.minutes);
    }
    if (isObj(raw.food)) {
      e.food.quality = score(raw.food.quality);
      e.food.firstMeal = cleanTime(raw.food.firstMeal);
      e.food.note = cleanStr(raw.food.note, MAX_SHORT);
    }
    if (isObj(raw.body)) {
      e.body.level = score(raw.body.level);
      e.body.where = cleanStr(raw.body.where, MAX_SHORT);
    }
    e.meds = boolMap(raw.meds);
    e.medsNote = cleanStr(raw.medsNote, MAX_SHORT);
    if (isObj(raw.habits)) {
      Object.keys(raw.habits).forEach(function (k) {
        var id = cleanId(k), h = raw.habits[k];
        if (!id || !isObj(h)) return;
        e.habits[id] = {
          used: h.used === true,
          when: oneOf(h.when, HABIT_WHEN),
          amount: oneOf(h.amount, HABIT_AMOUNT),
          note: cleanStr(h.note, MAX_SHORT)
        };
      });
    }
    e.win = cleanStr(raw.win, MAX_SHORT);
    e.intention = cleanStr(raw.intention, MAX_SHORT);
    e.session = cleanStr(raw.session, MAX_NOTE);
    e.notes = cleanStr(raw.notes, MAX_NOTE);
    e.tags = cleanTags(raw.tags);
    e.updatedAt = typeof raw.updatedAt === "string" && !isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : null;

    // Forward compatibility: keep fields from newer versions so a round-trip doesn't drop them.
    Object.keys(raw).forEach(function (k) {
      if (KNOWN_KEYS.indexOf(k) === -1 && !unsafeKey(k) && /^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(k)) e[k] = clone(raw[k]);
    });
    return e;
  }

  function hasContent(e) {
    if (!e) return false;
    if (e.drive !== null || e.notes || e.tags.length || e.win || e.intention || e.session || e.medsNote) return true;
    if (Object.keys(e.scales).length) return true;
    if (e.sleep.quality !== null || e.sleep.bed || e.sleep.wake) return true;
    if (e.food.quality !== null || e.food.firstMeal || e.food.note) return true;
    if (e.body.level !== null || e.body.where) return true;
    if (e.movement.did || e.movement.kind || e.movement.minutes) return true;
    var t = function (m) { return Object.keys(m).some(function (k) { return m[k] === true; }); };
    if (t(e.levers) || t(e.meds)) return true;
    return Object.keys(e.habits).some(function (k) { return e.habits[k].used || e.habits[k].note; });
  }

  function sortedEntries(map) {
    return Object.keys(map).sort().map(function (k) { return map[k]; });
  }

  /** Merge incoming entries into map by date; incoming wins. Returns counts. */
  function mergeEntries(map, incoming) {
    var added = 0, updated = 0;
    incoming.forEach(function (e) {
      if (own(map, e.date)) updated++; else added++;
      map[e.date] = e;
    });
    return { added: added, updated: updated };
  }

  /* ---------- import / export ---------- */

  function buildExport(map, settings, now) {
    return {
      format: FORMAT,
      version: VERSION,
      kind: "entries",
      exportedAt: (now || new Date()).toISOString(),
      timezone: settings.timezone,
      settings: clone(settings),
      entries: sortedEntries(map)
    };
  }

  function buildSetup(settings) {
    return { format: FORMAT, version: VERSION, kind: "setup", settings: shareableSettings(settings) };
  }

  /**
   * Accepts: a full export envelope, a setup file, or a bare array of entries.
   * Returns { kind, entries, settings|null, skipped }. Throws with a friendly message.
   */
  function parseImport(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("That file isn’t valid JSON."); }
    var entriesRaw = null, settingsRaw = null, kind = "entries";
    if (Array.isArray(data)) {
      entriesRaw = data;
    } else if (isObj(data) && data.kind === "setup" && isObj(data.settings)) {
      kind = "setup";
      entriesRaw = [];
      settingsRaw = data.settings;
    } else if (isObj(data) && Array.isArray(data.entries)) {
      entriesRaw = data.entries;
      settingsRaw = isObj(data.settings) ? data.settings : null;
    } else {
      throw new Error("This doesn’t look like a Pilot Light file.");
    }
    var entries = [], skipped = 0;
    entriesRaw.forEach(function (r) {
      var e = normalizeEntry(r);
      if (e) entries.push(e); else skipped++;
    });
    return {
      kind: kind,
      entries: entries,
      settings: settingsRaw ? (kind === "setup" ? settingsRaw : normalizeSettings(settingsRaw)) : null,
      skipped: skipped
    };
  }

  function b64urlEncode(str) {
    var bytes = new TextEncoder().encode(str), bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function b64urlDecode(s) {
    var b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function encodeSetupHash(settings) {
    return "setup=" + b64urlEncode(JSON.stringify(shareableSettings(settings)));
  }

  /** Returns the raw (unnormalized) setup object from a location.hash, or null. */
  function decodeSetupHash(hash) {
    var m = /(?:^#?|&)setup=([A-Za-z0-9_-]+)/.exec(hash || "");
    if (!m || m[1].length > MAX_SETUP_HASH) return null;
    try {
      var obj = JSON.parse(b64urlDecode(m[1]));
      return isObj(obj) ? obj : null;
    } catch (e) { return null; }
  }

  /* ---------- insights ---------- */

  function series(map, end, days, pick) {
    var out = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = addDays(end, -i), e = map[d];
      out.push({ date: d, value: e ? pick(e) : null });
    }
    return out;
  }

  function driveSeries(map, end, days) {
    return series(map, end, days, function (e) { return e.drive; });
  }

  /** Trailing average over `win` days; null until at least 2 values exist in the window. */
  function rolling(points, win) {
    return points.map(function (p, i) {
      var vals = [];
      for (var j = Math.max(0, i - win + 1); j <= i; j++) if (points[j].value !== null) vals.push(points[j].value);
      return { date: p.date, value: vals.length >= 2 ? mean(vals) : null };
    });
  }

  function streak(map, end) {
    var d = own(map, end) && hasContent(map[end]) ? end : addDays(end, -1);
    var n = 0;
    while (own(map, d) && hasContent(map[d])) { n++; d = addDays(d, -1); }
    return n;
  }

  function summary(map, end, days) {
    var cur = driveSeries(map, end, days).filter(function (p) { return p.value !== null; });
    var prev = driveSeries(map, addDays(end, -days), days).filter(function (p) { return p.value !== null; });
    var logged = 0;
    for (var i = 0; i < days; i++) { var e = map[addDays(end, -i)]; if (hasContent(e)) logged++; }
    var best = null, low = null;
    cur.forEach(function (p) {
      if (!best || p.value >= best.value) best = p;
      if (!low || p.value <= low.value) low = p;
    });
    var avg = mean(cur.map(function (p) { return p.value; }));
    var prevAvg = mean(prev.map(function (p) { return p.value; }));
    return {
      days: days,
      logged: logged,
      rated: cur.length,
      avg: round1(avg),
      prevAvg: round1(prevAvg),
      delta: avg !== null && prevAvg !== null && prev.length >= 3 ? round1(avg - prevAvg) : null,
      best: best,
      low: low,
      streak: streak(map, end)
    };
  }

  function factorDefs(settings) {
    var defs = [], mods = settings.modules;
    var on = function (x) { return x.on; };
    if (mods.levers) settings.levers.filter(on).forEach(function (l) {
      defs.push({ key: "lever:" + l.id, label: l.label, group: "Levers", test: function (e) { return e.levers[l.id] === true; } });
    });
    if (mods.movement) defs.push({ key: "movement20", label: "Moved 20+ minutes", group: "Movement", test: function (e) { return (e.movement.minutes || 0) >= 20; } });
    if (mods.sleep) defs.push({
      key: "sleep7", label: "Slept well (7+ out of 10)", group: "Sleep",
      applies: function (e) { return e.sleep.quality !== null; },
      test: function (e) { return e.sleep.quality >= 7; }
    });
    if (mods.habits) settings.habits.filter(on).forEach(function (h) {
      defs.push({ key: "habit:" + h.id, label: h.label + " (used)", group: "Habits", test: function (e) { return !!(e.habits[h.id] && e.habits[h.id].used); } });
    });
    if (mods.meds) settings.meds.filter(on).forEach(function (m) {
      defs.push({ key: "med:" + m.id, label: m.label + " (taken)", group: "Meds", test: function (e) { return e.meds[m.id] === true; } });
    });
    return defs;
  }

  /**
   * Average drive on days with vs without each factor. Descriptive only.
   * A factor is "ready" once both sides have at least `minN` rated days.
   */
  function factors(map, settings, end, days, minN) {
    minN = minN || 3;
    var rated = [];
    for (var i = 0; i < days; i++) {
      var e = map[addDays(end, -i)];
      if (e && e.drive !== null) rated.push(e);
    }
    return factorDefs(settings).map(function (f) {
      var yes = [], no = [];
      rated.forEach(function (e) {
        if (f.applies && !f.applies(e)) return;
        (f.test(e) ? yes : no).push(e.drive);
      });
      var ay = mean(yes), an = mean(no);
      return {
        key: f.key, label: f.label, group: f.group,
        nYes: yes.length, nNo: no.length,
        avgYes: round1(ay), avgNo: round1(an),
        diff: ay !== null && an !== null ? round1(ay - an) : null,
        ready: yes.length >= minN && no.length >= minN
      };
    }).sort(function (a, b) {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      return Math.abs(b.diff || 0) - Math.abs(a.diff || 0);
    });
  }

  function recentTags(map, limit) {
    var counts = {};
    sortedEntries(map).slice(-60).forEach(function (e) {
      e.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); }).slice(0, limit || 8);
  }

  /* ---------- example data ---------- */

  function prng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var EXAMPLE_NOTES = [
    "Slow start, better after a walk.",
    "Busy day — ran on autopilot.",
    "Good call with a friend in the evening.",
    "Rainy, stayed in. Low but okay.",
    "Got the hard task done before lunch.",
    "Late night scrolling, felt it in the morning."
  ];
  var EXAMPLE_TAGS = ["work", "weekend", "social", "travel", "rest"];

  /** Deterministic, clearly-flagged sample days ending at `end`. */
  function exampleEntries(end, days) {
    var r = prng(20260929);
    var out = [];
    var clamp = function (v) { return Math.max(0, Math.min(10, Math.round(v))); };
    for (var i = (days || 28) - 1; i >= 0; i--) {
      var date = addDays(end, -i);
      if (i > 0 && r() < 0.14) continue;
      var light = r() < 0.6, move = r() < 0.55, wind = r() < 0.5, caf = r() < 0.5, meal = r() < 0.7, conn = r() < 0.45;
      var sleepQ = clamp(5 + (wind ? 1.6 : -0.6) + r() * 3 - 1.5);
      var drive = clamp(2.6 + (light ? 1.3 : 0) + (move ? 1.4 : 0) + (sleepQ - 5) * 0.35 + (conn ? 0.8 : 0) + r() * 2 - 1);
      var e = emptyEntry(date);
      e.example = true;
      e.drive = drive;
      e.scales = { energy: clamp(drive + r() * 2 - 1), focus: clamp(drive + r() * 3 - 1.8), mood: clamp(drive + r() * 2 - 0.6) };
      e.sleep = { quality: sleepQ, bed: wind ? "22:45" : "00:20", wake: wind ? "06:50" : "07:40" };
      e.levers = { light: light, caffeine: caf, move: move, meal: meal, connect: conn, winddown: wind };
      e.movement = move ? { did: true, kind: MOVEMENT_KINDS[Math.floor(r() * 4)], minutes: 10 + Math.floor(r() * 7) * 5 } : { did: false, kind: "", minutes: null };
      if (r() < 0.35) e.notes = EXAMPLE_NOTES[Math.floor(r() * EXAMPLE_NOTES.length)];
      if (r() < 0.3) e.tags = [EXAMPLE_TAGS[Math.floor(r() * EXAMPLE_TAGS.length)]];
      if (drive >= 7 && r() < 0.6) e.win = "Started before I felt ready.";
      out.push(e);
    }
    return out;
  }

  return {
    FORMAT: FORMAT,
    VERSION: VERSION,
    DEFAULT_TZ: DEFAULT_TZ,
    MODULES: MODULES,
    PRESETS: PRESETS,
    MOVEMENT_KINDS: MOVEMENT_KINDS,
    HABIT_WHEN: HABIT_WHEN,
    HABIT_AMOUNT: HABIT_AMOUNT,
    DRIVE_WORDS: DRIVE_WORDS,
    clone: clone,
    cleanLabel: cleanLabel,
    cleanTags: cleanTags,
    makeId: makeId,
    isValidTz: isValidTz,
    todayIn: todayIn,
    isYMD: isYMD,
    addDays: addDays,
    dayOfWeek: dayOfWeek,
    daysBetween: daysBetween,
    formatDate: formatDate,
    presetModules: presetModules,
    defaultSettings: defaultSettings,
    normalizeSettings: normalizeSettings,
    shareableSettings: shareableSettings,
    applySetup: applySetup,
    emptyEntry: emptyEntry,
    normalizeEntry: normalizeEntry,
    hasContent: hasContent,
    sortedEntries: sortedEntries,
    mergeEntries: mergeEntries,
    buildExport: buildExport,
    buildSetup: buildSetup,
    parseImport: parseImport,
    encodeSetupHash: encodeSetupHash,
    decodeSetupHash: decodeSetupHash,
    driveSeries: driveSeries,
    series: series,
    rolling: rolling,
    summary: summary,
    factors: factors,
    recentTags: recentTags,
    exampleEntries: exampleEntries
  };
});
