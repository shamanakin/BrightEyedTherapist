/* Pilot Light — UI. Vanilla JS, no network, no dependencies beyond core.js. */
(function () {
  "use strict";

  var C = window.PilotLightCore;
  var KEY_ENTRIES = "pilot-light:v1:entries";
  var KEY_SETTINGS = "pilot-light:v1:settings";
  var PATTERN_DAYS = 60;
  var HEAT_WEEKS = 16;

  var settings = C.defaultSettings();
  var entries = {};
  var current = null;
  var trendDays = 30;
  var saveTimer = null;
  var storageOk = true;
  var pendingSetup = null;
  var uid = 0;

  /* ---------- DOM helpers ---------- */

  function $(id) { return document.getElementById(id); }

  function append(el, kids) {
    kids.forEach(function (k) {
      if (k === null || k === undefined || k === false) return;
      if (Array.isArray(k)) append(el, k);
      else el.appendChild(typeof k === "string" || typeof k === "number" ? document.createTextNode(String(k)) : k);
    });
  }

  function h(tag, props) {
    var el = document.createElement(tag);
    var value;
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "value") value = v;
      else if (k === "checked") el.checked = true;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    append(el, Array.prototype.slice.call(arguments, 2));
    if (value !== undefined) el.value = value;
    return el;
  }

  var SVGNS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, kids) {
    var el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) {
      el.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
    });
    return el;
  }

  var ICONS = {
    check: "M5 12.5l4.5 4.5L19 7.5",
    x: "M6 6l12 12M18 6 6 18",
    trash: "M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13",
    plus: "M12 5v14M5 12h14"
  };
  function icon(name) {
    return s("svg", { "class": "ico", viewBox: "0 0 24 24", "aria-hidden": "true" }, [s("path", { d: ICONS[name] })]);
  }

  function nextId(prefix) { uid += 1; return prefix + uid; }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  function setStatus(text, kind) {
    var el = $("saveStatus");
    el.textContent = text;
    el.className = "save-status" + (kind ? " " + kind : "");
  }

  function download(filename, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2) + "\n"], { type: "application/json" });
    var a = h("a", { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function timeNow() { return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }

  /* ---------- storage ---------- */

  function load() {
    settings = C.defaultSettings();
    entries = {};
    try {
      var rs = localStorage.getItem(KEY_SETTINGS);
      if (rs) settings = C.normalizeSettings(JSON.parse(rs));
      var re = localStorage.getItem(KEY_ENTRIES);
      var arr = re ? JSON.parse(re) : [];
      if (Array.isArray(arr)) arr.forEach(function (r) {
        var e = C.normalizeEntry(r);
        if (e) entries[e.date] = e;
      });
      storageOk = true;
    } catch (err) {
      storageOk = false;
    }
  }

  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try {
      localStorage.setItem(KEY_ENTRIES, JSON.stringify(C.sortedEntries(entries)));
      localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
      storageOk = true;
      setStatus("Saved " + timeNow(), "ok");
    } catch (err) {
      storageOk = false;
      setStatus("Not saved", "err");
      renderBanners();
    }
  }

  function scheduleSave() {
    setStatus("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  }

  function flush() { if (saveTimer) saveNow(); }

  /* ---------- state ---------- */

  function today() { return C.todayIn(settings.timezone); }
  function viewEntry() { return entries[current] || C.emptyEntry(current); }

  /** Apply a mutation to the selected day, creating it on first edit. */
  function edit(fn) {
    var e = entries[current];
    if (!e) { e = C.emptyEntry(current); entries[current] = e; }
    var wasExample = !!e.example;
    fn(e);
    delete e.example;
    e.updatedAt = new Date().toISOString();
    scheduleSave();
    renderSide();
    renderMeta();
    if (wasExample) renderBanners();
  }

  function updateSettings(fn, opts) {
    fn(settings);
    scheduleSave();
    applyTheme();
    renderHeader();
    renderForm();
    renderSide();
    renderMeta();
    if (opts && opts.rerenderSettings) renderSettings();
  }

  function goTo(date) {
    var t = today();
    if (!C.isYMD(date)) return;
    current = date > t ? t : date;
    renderForm();
    renderMeta();
    renderSide();
  }

  /* ---------- theme / colors ---------- */

  function isDark() {
    if (settings.theme === "dark") return true;
    if (settings.theme === "light") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function applyTheme() {
    if (settings.theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", settings.theme);
  }

  var HEAT_LIGHT = [[0, [214, 233, 236]], [3, [174, 214, 222]], [5, [127, 184, 201]], [7, [84, 150, 162]], [10, [44, 85, 88]]];
  var HEAT_DARK = [[0, [36, 66, 74]], [3, [47, 92, 102]], [5, [67, 127, 140]], [7, [99, 164, 178]], [10, [169, 216, 225]]];

  function heatColor(v, dark) {
    var stops = dark ? HEAT_DARK : HEAT_LIGHT;
    for (var i = 1; i < stops.length; i++) {
      if (v <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i], t = (v - a[0]) / (b[0] - a[0]);
        var c = a[1].map(function (x, j) { return Math.round(x + (b[1][j] - x) * t); });
        return "rgb(" + c.join(",") + ")";
      }
    }
    return "rgb(" + stops[stops.length - 1][1].join(",") + ")";
  }

  function palette(forPrint) {
    if (forPrint || !isDark()) return { primary: "#2C5558", sky: "#7FB8C9", grid: "#E7E2D8", text: "#6E7A7D", surface: "#FFFFFF", accent: "#D97757" };
    return { primary: "#8CC7D3", sky: "#5E9FAE", grid: "#293C3F", text: "#8FA0A1", surface: "#172427", accent: "#E59A83" };
  }

  /* ---------- header, meta, banners ---------- */

  function renderHeader() {
    $("sharedByLine").textContent = settings.sharedBy ? "set up by " + settings.sharedBy : "private to this device";
  }

  function renderMeta() {
    var t = today();
    var sameYear = current.slice(0, 4) === t.slice(0, 4);
    $("dateLabel").textContent = C.formatDate(current, sameYear
      ? { weekday: "long", month: "long", day: "numeric" }
      : { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    var meta = $("dateMeta");
    meta.textContent = "";
    var ago = C.daysBetween(current, t);
    meta.appendChild(ago === 0 ? h("span", { "class": "pill today", text: "Today" })
      : document.createTextNode(ago === 1 ? "Yesterday" : ago + " days ago"));
    if (entries[current] && entries[current].example) meta.appendChild(h("span", { "class": "pill", text: "Example" }));
    meta.appendChild(document.createTextNode(" · " + settings.timezone.replace(/_/g, " ")));
    var picker = $("datePicker");
    picker.max = t;
    picker.value = current;
    $("btnNext").disabled = current >= t;
    $("btnToday").disabled = current === t;
  }

  function countExamples() {
    return Object.keys(entries).filter(function (k) { return entries[k].example; }).length;
  }

  function renderBanners() {
    var root = $("banners");
    root.textContent = "";

    if (!storageOk) {
      root.appendChild(h("div", { "class": "banner warm", role: "alert" },
        h("p", { text: "This browser is blocking local storage, so changes can’t be saved here. Export before you close this tab, or open the page in a regular (non-private) window." }),
        h("div", { "class": "actions" }, h("button", { type: "button", "class": "btn btn-sm", onclick: exportAll, text: "Export now" }))));
    }

    if (pendingSetup) {
      var who = C.cleanLabel(pendingSetup.sharedBy) || "Someone";
      root.appendChild(h("div", { "class": "banner", role: "region", "aria-label": "Shared setup" },
        h("p", null, h("strong", { text: who }), " shared a Pilot Light setup with you. Applying it changes which sections and checklists you see — none of your days are touched, and nothing is sent anywhere."),
        h("div", { "class": "actions" },
          h("button", { type: "button", "class": "btn btn-primary btn-sm", text: "Apply setup", onclick: function () {
            var setup = pendingSetup;
            clearPendingSetup();
            updateSettings(function (st) {
              var next = C.applySetup(st, setup);
              Object.keys(next).forEach(function (k) { st[k] = next[k]; });
              st.onboarded = true;
            });
            renderBanners();
            toast("Setup applied. You can fine-tune it in Settings.");
          } }),
          h("button", { type: "button", "class": "btn btn-sm", text: "Not now", onclick: function () { clearPendingSetup(); renderBanners(); } }))));
    }

    if (!settings.onboarded && !Object.keys(entries).length && !pendingSetup) {
      root.appendChild(h("section", { "class": "welcome", "aria-labelledby": "welcomeTitle" },
        h("div", null,
          h("h2", { id: "welcomeTitle", text: "One slider a day is enough." }),
          h("p", { text: "Pilot Light tracks your drive — the get-up-and-go behind the day — alongside whatever else you choose. Everything stays on this device. Over a few weeks, the heatmap and patterns show what tends to keep your flame up." })),
        h("div", { "class": "actions" },
          h("button", { type: "button", "class": "btn btn-primary", text: "Start with today", onclick: function () {
            updateSettings(function (st) { st.onboarded = true; });
            renderBanners();
            var d = $("driveInput"); if (d) d.focus();
          } }),
          h("button", { type: "button", "class": "btn", text: "Try with example days", onclick: loadExamples }),
          h("button", { type: "button", "class": "btn btn-quiet", text: "Choose what to track", onclick: function () { openSettings("set-modules"); } }))));
    }

    var n = countExamples();
    if (n) {
      root.appendChild(h("div", { "class": "banner warm" },
        h("p", { text: "You’re looking at " + n + " example day" + (n === 1 ? "" : "s") + " (striped on the heatmap). Edit one and it becomes yours, or clear them all when you’re ready." }),
        h("div", { "class": "actions" }, h("button", { type: "button", "class": "btn btn-sm", text: "Remove example days", onclick: removeExamples }))));
    }
  }

  function clearPendingSetup() {
    pendingSetup = null;
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* file:// in some browsers */ }
  }

  /* ---------- form building blocks ---------- */

  function card(title, opts, kids) {
    var id = nextId("card-");
    return h("section", { "class": "card" + (opts && opts.cls ? " " + opts.cls : ""), "aria-labelledby": id },
      h("div", { "class": "card-head" },
        h("h2", { id: id, text: title }),
        opts && opts.aside ? opts.aside : null),
      kids);
  }

  function slider(label, value, onSet) {
    var wrap = h("div", { "class": "scale-row" });
    var id = nextId("sl-");
    var input = h("input", { type: "range", min: "0", max: "10", step: "1", id: id });
    var val = h("span", { "class": "scale-val" });
    var clear = h("button", { type: "button", "class": "clear", "aria-label": "Clear " + label, title: "Clear" }, icon("x"));
    function paint(v) {
      wrap.classList.toggle("is-unset", v === null);
      input.value = v === null ? 5 : v;
      input.style.setProperty("--pct", (v === null ? 0 : v * 10) + "%");
      input.setAttribute("aria-valuetext", v === null ? "not rated" : v + " out of 10");
      val.textContent = v === null ? "–" : String(v);
      if (v !== null) val.appendChild(clear);
    }
    function commit(v) { paint(v); onSet(v); }
    input.addEventListener("input", function () { commit(+input.value); });
    input.addEventListener("pointerup", function () { if (wrap.classList.contains("is-unset")) commit(+input.value); });
    clear.addEventListener("click", function () { commit(null); input.focus(); });
    paint(value);
    append(wrap, [h("label", { "class": "scale-label", "for": id, text: label }), val, input]);
    return wrap;
  }

  function check(label, checked, onChange) {
    var input = h("input", { type: "checkbox", checked: checked });
    input.addEventListener("change", function () { onChange(input.checked); });
    return h("label", { "class": "check" }, input, h("span", { "class": "box" }, icon("check")), h("span", { text: label }));
  }

  function textField(label, value, onInput, opts) {
    opts = opts || {};
    var input = opts.multiline
      ? h("textarea", { placeholder: opts.placeholder || "", maxlength: opts.max || 4000, rows: opts.rows || 3, value: value || "" })
      : h("input", { type: opts.type || "text", placeholder: opts.placeholder || "", maxlength: opts.max || 200, autocomplete: "off", value: value || "" });
    input.addEventListener("input", function () { onInput(input.value); });
    return h("label", { "class": "field" }, h("span", { text: label }), input);
  }

  function timeField(label, value, onSet) {
    var input = h("input", { type: "time", value: value || "" });
    input.addEventListener("change", function () { onSet(input.value); });
    return h("label", { "class": "field" }, h("span", { text: label }), input);
  }

  function selectField(label, options, value, onSet) {
    var sel = h("select", { "aria-label": label, value: value || "" },
      options.map(function (o) { return h("option", { value: o.id, text: o.label }); }));
    sel.addEventListener("change", function () { onSet(sel.value); });
    return h("label", { "class": "field" }, h("span", { text: label }), sel);
  }

  function settingsLink(text, section) {
    return h("button", { type: "button", "class": "link-btn", text: text, onclick: function () { openSettings(section); } });
  }

  /* ---------- flame ---------- */

  function flameSvg() {
    var outerId = nextId("fo-"), coreId = nextId("fc-");
    var g = s("g", { "class": "flicker" }, [
      s("path", { fill: "url(#" + outerId + ")", d: "M32 9c6.5 9.5 13 16 13 26.5C45 44.6 39.2 52 32 52s-13-7.4-13-16.5c0-7.3 4.6-11.4 7.8-17 1 4.6 3.2 7.2 5.4 8.4C31.6 21 31 15 32 9z" }),
      s("path", { fill: "url(#" + coreId + ")", d: "M32 30.5c3.4 4.7 6.2 7.8 6.2 12.1 0 4.5-2.8 7.4-6.2 7.4s-6.2-2.9-6.2-7.4c0-4.3 2.8-7.4 6.2-12.1z" })
    ]);
    return s("svg", { viewBox: "0 0 64 60", "class": "flame", "aria-hidden": "true" }, [
      s("defs", {}, [
        s("linearGradient", { id: outerId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          s("stop", { offset: "0", "stop-color": "#E4F4F7" }), s("stop", { offset: "1", "stop-color": "#6FAFC1" })]),
        s("linearGradient", { id: coreId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          s("stop", { offset: "0", "stop-color": "#FCE8DD" }), s("stop", { offset: "1", "stop-color": "#E0916F" })])
      ]),
      s("ellipse", { cx: "32", cy: "54", rx: "15", ry: "3", fill: "#2C5558", opacity: "0.18" }),
      g
    ]);
  }

  /* ---------- day form ---------- */

  function driveCard(e) {
    var flame = flameSvg();
    var valueEl = h("div", { "class": "drive-value", "aria-hidden": "true" });
    var wordEl = h("div", { "class": "drive-word", "aria-hidden": "true" });
    var input = h("input", { type: "range", min: "0", max: "10", step: "1", id: "driveInput", "aria-labelledby": "driveQ" });
    var rangeWrap = h("div", { "class": "drive-range" });
    var section = h("section", { "class": "card drive-card", "aria-labelledby": "driveQ" });
    var ticks = [];
    var tickRow = h("div", { "class": "ticks" });
    for (var i = 0; i <= 10; i++) {
      (function (n) {
        var b = h("button", { type: "button", "class": "tick", tabindex: "-1", "aria-label": "Set drive to " + n, text: String(n) });
        b.addEventListener("click", function () { commit(n); });
        ticks.push(b);
        tickRow.appendChild(b);
      })(i);
    }
    function paint(v) {
      var unset = v === null;
      section.classList.toggle("unset", unset);
      rangeWrap.classList.toggle("is-unset", unset);
      input.value = unset ? 5 : v;
      input.style.setProperty("--pct", (unset ? 0 : v * 10) + "%");
      input.setAttribute("aria-valuetext", unset ? "not rated yet" : v + " out of 10, " + C.DRIVE_WORDS[v]);
      valueEl.textContent = unset ? "–" : String(v);
      valueEl.appendChild(h("small", { text: " / 10" }));
      wordEl.textContent = unset ? "Not rated yet — slide or tap a number" : C.DRIVE_WORDS[v];
      var scale = unset ? 0.5 : 0.45 + v * 0.055;
      flame.style.transform = "scale(" + scale.toFixed(3) + ")";
      flame.style.opacity = unset ? "0.6" : (0.65 + v * 0.035).toFixed(2);
      ticks.forEach(function (t, n) { t.setAttribute("aria-pressed", String(n === v)); });
    }
    function commit(v) { paint(v); edit(function (en) { en.drive = v; }); }
    input.addEventListener("input", function () { commit(+input.value); });
    input.addEventListener("pointerup", function () { if (section.classList.contains("unset")) commit(+input.value); });
    paint(e.drive);
    append(rangeWrap, [input, tickRow]);
    append(section, [h("div", { "class": "drive-layout" },
      h("div", { "class": "flame-wrap" }, flame),
      h("div", null,
        h("div", { "class": "drive-q", id: "driveQ", text: "Drive today" }),
        h("div", { "class": "drive-sub", text: "How much get-up-and-go do you have? Go with your gut — there’s no wrong answer." }),
        h("div", { "class": "drive-readout" }, valueEl, wordEl),
        rangeWrap,
        h("div", { "class": "drive-foot" }, h("span", { text: "0 · running on empty" }), h("span", { text: "10 · fully lit" }))))]);
    section.setDrive = commit;
    return section;
  }

  function checkinCard(e) {
    var on = settings.scales.filter(function (x) { return x.on; });
    return card("Check-in", null, on.length ? on.map(function (sc) {
      return slider(sc.label, e.scales[sc.id] !== undefined ? e.scales[sc.id] : null, function (v) {
        edit(function (en) { if (v === null) delete en.scales[sc.id]; else en.scales[sc.id] = v; });
      });
    }) : h("p", { "class": "card-empty" }, "No scales switched on. ", settingsLink("Choose scales", "set-lists")));
  }

  function sleepCard(e) {
    return card("Sleep", { aside: h("span", { "class": "card-hint", text: "last night" }) }, [
      slider("Sleep quality", e.sleep.quality, function (v) { edit(function (en) { en.sleep.quality = v; }); }),
      h("div", { "class": "fields" },
        timeField("Bedtime", e.sleep.bed, function (v) { edit(function (en) { en.sleep.bed = v; }); }),
        timeField("Wake time", e.sleep.wake, function (v) { edit(function (en) { en.sleep.wake = v; }); }))
    ]);
  }

  function checklistCard(title, items, map, onToggle, emptyKids, extra) {
    var on = items.filter(function (x) { return x.on; });
    var count = h("span", { "class": "card-count" });
    function recount() {
      var n = on.filter(function (x) { return (entries[current] || {})[map] && entries[current][map][x.id] === true; }).length;
      count.textContent = n + " / " + on.length;
    }
    var body = on.length
      ? h("ul", { "class": "checks" }, on.map(function (it) {
        var cur = viewEntry()[map][it.id] === true;
        return h("li", null, check(it.label, cur, function (v) { onToggle(it.id, v); recount(); }));
      }))
      : h("p", { "class": "card-empty" }, emptyKids);
    var c = card(title, { aside: on.length ? count : null }, [body, extra || null]);
    if (on.length) recount();
    return c;
  }

  function leversCard() {
    return checklistCard("Levers", settings.levers, "levers", function (id, v) {
      edit(function (en) { en.levers[id] = v; });
    }, ["No levers yet. ", settingsLink("Add a few", "set-lists")]);
  }

  function movementCard(e) {
    var didBox;
    var chips = h("div", { "class": "chips", role: "group", "aria-label": "Kind of movement" });
    var minutes = h("input", { type: "number", min: "0", max: "600", step: "5", inputmode: "numeric", placeholder: "0", "aria-label": "Minutes", value: e.movement.minutes === null ? "" : String(e.movement.minutes) });
    function markDid() {
      if (!didBox.checked) { didBox.checked = true; }
      return true;
    }
    function setMinutes(v) {
      var n = v === "" ? null : Math.max(0, Math.min(600, Math.round(+v) || 0));
      edit(function (en) { en.movement.minutes = n; if (n) en.movement.did = markDid(); });
    }
    C.MOVEMENT_KINDS.forEach(function (k) {
      var b = h("button", { type: "button", "class": "chip", "aria-pressed": String(e.movement.kind === k), text: k });
      b.addEventListener("click", function () {
        var nowOn = b.getAttribute("aria-pressed") !== "true";
        Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", String(nowOn));
        edit(function (en) { en.movement.kind = nowOn ? k : ""; if (nowOn) en.movement.did = markDid(); });
      });
      chips.appendChild(b);
    });
    minutes.addEventListener("input", function () { setMinutes(minutes.value); });
    function step(d) {
      var n = Math.max(0, (+minutes.value || 0) + d);
      minutes.value = String(n);
      setMinutes(minutes.value);
    }
    var did = check("I moved today", e.movement.did, function (v) { edit(function (en) { en.movement.did = v; }); });
    didBox = did.querySelector("input");
    return card("Movement", null, [
      h("ul", { "class": "checks" }, h("li", null, did)),
      chips,
      h("div", { "class": "fields" },
        h("div", { "class": "field" }, h("span", { text: "Minutes" }),
          h("div", { "class": "stepper" },
            h("button", { type: "button", "aria-label": "5 minutes less", text: "−", onclick: function () { step(-5); } }),
            minutes,
            h("button", { type: "button", "aria-label": "5 minutes more", text: "+", onclick: function () { step(5); } }))))
    ]);
  }

  function foodCard(e) {
    return card("Food", null, [
      slider("Food quality", e.food.quality, function (v) { edit(function (en) { en.food.quality = v; }); }),
      h("div", { "class": "fields" },
        timeField("First meal", e.food.firstMeal, function (v) { edit(function (en) { en.food.firstMeal = v; }); })),
      textField("Note", e.food.note, function (v) { edit(function (en) { en.food.note = v.trim(); }); }, { placeholder: "Optional" })
    ]);
  }

  function bodyCard(e) {
    return card(settings.bodyLabel, { aside: h("span", { "class": "card-hint", text: "0 = none" }) }, [
      slider("How much today", e.body.level, function (v) { edit(function (en) { en.body.level = v; }); }),
      textField("Where / what", e.body.where, function (v) { edit(function (en) { en.body.where = v.trim(); }); }, { placeholder: "e.g. lower back, headache, tired eyes" })
    ]);
  }

  function medsCard(e) {
    return checklistCard("Meds & supplements", settings.meds, "meds", function (id, v) {
      edit(function (en) { en.meds[id] = v; });
    }, ["Add your own meds, vitamins or supplements — nothing is preloaded. ", settingsLink("Add your list", "set-lists")],
    textField("Other / notes", e.medsNote, function (v) { edit(function (en) { en.medsNote = v.trim(); }); }, { placeholder: "Changes, missed doses, side effects to mention…" }));
  }

  function habitsCard(e) {
    var on = settings.habits.filter(function (x) { return x.on; });
    if (!on.length) return card("Substances & habits", null, h("p", { "class": "card-empty" }, "Nothing to track yet. ", settingsLink("Add one", "set-lists")));
    return card("Substances & habits", null, on.map(function (hb) {
      var cur = e.habits[hb.id] || { used: false, when: "", amount: "", note: "" };
      function upd(fn) {
        edit(function (en) {
          if (!en.habits[hb.id]) en.habits[hb.id] = { used: false, when: "", amount: "", note: "" };
          fn(en.habits[hb.id]);
        });
      }
      var details = h("div", { "class": "fields" },
        selectField("When", C.HABIT_WHEN, cur.when, function (v) { upd(function (x) { x.when = v; }); }),
        selectField("How much", C.HABIT_AMOUNT, cur.amount, function (v) { upd(function (x) { x.amount = v; }); }));
      var note = textField("Note", cur.note, function (v) { upd(function (x) { x.note = v.trim(); }); }, { placeholder: "Optional — form, context, craving…" });
      details.hidden = note.hidden = !cur.used;
      return h("div", { "class": "habit" },
        check(hb.label, cur.used, function (v) {
          details.hidden = note.hidden = !v;
          upd(function (x) { x.used = v; });
        }),
        details, note);
    }));
  }

  function winsCard(e) {
    return card("Win & intention", null, [
      textField("One small win today", e.win, function (v) { edit(function (en) { en.win = v.trim(); }); }, { placeholder: "Even tiny counts" }),
      textField("One thing for tomorrow", e.intention, function (v) { edit(function (en) { en.intention = v.trim(); }); }, { placeholder: "Just one" })
    ]);
  }

  function sessionCard(e) {
    return card("For my next session", { aside: h("span", { "class": "card-hint", text: "stays on this device" }) },
      textField("Things to bring up", e.session, function (v) { edit(function (en) { en.session = v; }); },
        { multiline: true, placeholder: "Patterns you noticed, questions, wins, anything that felt hard…" }));
  }

  function notesCard(e) {
    var tagsInput = h("input", { type: "text", placeholder: "work, social, travel…", autocomplete: "off", maxlength: 400, value: e.tags.join(", ") });
    var chips = h("div", { "class": "chips", "aria-label": "Recent tags" });
    function renderChips() {
      chips.textContent = "";
      var mine = viewEntry().tags;
      C.recentTags(entries, 8).forEach(function (t) {
        var onTag = mine.indexOf(t) !== -1;
        chips.appendChild(h("button", { type: "button", "class": "chip" + (onTag ? "" : " chip-add"), "aria-pressed": String(onTag), text: t, onclick: function () {
          var list = viewEntry().tags.slice();
          var i = list.indexOf(t);
          if (i === -1) list.push(t); else list.splice(i, 1);
          tagsInput.value = list.join(", ");
          edit(function (en) { en.tags = list; });
          renderChips();
        } }));
      });
    }
    tagsInput.addEventListener("input", function () { edit(function (en) { en.tags = C.cleanTags(tagsInput.value); }); });
    tagsInput.addEventListener("change", renderChips);
    renderChips();

    var actions = h("div", { "class": "day-actions" });
    if (entries[current]) {
      var stamp = entries[current].updatedAt ? "Last edited " + new Date(entries[current].updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
      append(actions, [h("span", { text: stamp }),
        h("button", { type: "button", "class": "btn btn-sm btn-quiet btn-danger", onclick: clearDay }, icon("trash"), h("span", { text: "Clear this day" }))]);
    }

    return card("Notes & tags", null, [
      textField("Notes", e.notes, function (v) { edit(function (en) { en.notes = v; }); }, { multiline: true, placeholder: "Anything about today worth remembering…" }),
      h("label", { "class": "field" }, h("span", { text: "Tags (comma-separated)" }), tagsInput),
      chips,
      actions.children.length ? h("div", { "class": "card-foot" }, actions) : null
    ]);
  }

  var driveCardEl = null;
  function renderForm() {
    var root = $("dayForm");
    var keep = root.scrollTop;
    root.textContent = "";
    var e = viewEntry();
    driveCardEl = driveCard(e);
    root.appendChild(driveCardEl);
    var m = settings.modules;
    var grid = h("div", { "class": "module-grid" });
    if (m.checkin) grid.appendChild(checkinCard(e));
    if (m.sleep) grid.appendChild(sleepCard(e));
    if (m.levers) grid.appendChild(leversCard(e));
    if (m.movement) grid.appendChild(movementCard(e));
    if (m.food) grid.appendChild(foodCard(e));
    if (m.body) grid.appendChild(bodyCard(e));
    if (m.meds) grid.appendChild(medsCard(e));
    if (m.habits) grid.appendChild(habitsCard(e));
    if (m.wins) grid.appendChild(winsCard(e));
    if (m.session) grid.appendChild(sessionCard(e));
    if (grid.children.length) root.appendChild(grid);
    root.appendChild(notesCard(e));
    root.scrollTop = keep;
  }

  /* ---------- sidebar: heatmap, trend, stats, patterns ---------- */

  function buildHeatmap(root, weeks, opts) {
    opts = opts || {};
    root.textContent = "";
    var t = today();
    var ws = settings.weekStart;
    var endDow = (C.dayOfWeek(t) - ws + 7) % 7;
    var gridEnd = C.addDays(t, 6 - endDow);
    var start = C.addDays(gridEnd, -(weeks * 7) + 1);
    var dark = !opts.print && isDark();
    // Column-major: one column per week, weekday labels down the left edge.
    root.appendChild(h("span"));
    for (var i = 0; i < 7; i++) root.appendChild(h("span", { "class": "heat-wd", "aria-hidden": "true", text: i % 2 ? "SMTWTFS".charAt((ws + i) % 7) : "" }));
    var firstOfMonthWeek = function (colStart) {
      for (var d = 0; d < 7; d++) {
        var day = C.addDays(colStart, d);
        if (day.slice(8) === "01") return day;
      }
      return null;
    };
    for (var w = 0; w < weeks; w++) {
      var colStart = C.addDays(start, w * 7);
      var first = firstOfMonthWeek(colStart);
      var label = first ? C.formatDate(first, { month: "short" }) : "";
      if (w === 0 && !label && !firstOfMonthWeek(C.addDays(colStart, 7)) && !firstOfMonthWeek(C.addDays(colStart, 14))) {
        label = C.formatDate(colStart, { month: "short" });
      }
      root.appendChild(h("span", { "class": "heat-month", "aria-hidden": "true", text: label }));
      for (var k = 0; k < 7; k++) root.appendChild(heatCell(C.addDays(colStart, k), t, dark, opts.print));
    }
  }

  function heatCell(date, t, dark, print) {
    var e = entries[date];
    var nice = C.formatDate(date, { weekday: "short", month: "short", day: "numeric" });
    var cls = "heat-cell";
    var desc;
    if (date > t) {
      return h(print ? "span" : "button", { type: print ? null : "button", "class": cls, disabled: !print, "aria-hidden": "true", tabindex: "-1" });
    }
    if (e && e.drive !== null) desc = nice + ": drive " + e.drive + (e.example ? " (example)" : "");
    else if (C.hasContent(e)) { desc = nice + ": logged, no drive rating"; cls += " nodrive"; }
    else desc = nice + ": nothing logged";
    if (e && e.example) cls += " example";
    if (date === t) cls += " today";
    if (!print && date === current) cls += " selected";
    var el = print
      ? h("span", { "class": cls, title: desc })
      : h("button", { type: "button", "class": cls, title: desc, "aria-label": desc, "aria-current": date === current ? "date" : null,
        onclick: function () { goTo(date); } });
    if (e && e.drive !== null) el.style.background = heatColor(e.drive, dark);
    return el;
  }

  function renderLegend() {
    var root = $("heatLegend");
    root.textContent = "";
    [0, 2, 4, 6, 8, 10].forEach(function (v) {
      var sw = h("span", { "class": "swatch" });
      sw.style.background = heatColor(v, isDark());
      root.appendChild(sw);
    });
  }

  function trendSvg(days, opts) {
    opts = opts || {};
    var end = today();
    var pts = C.driveSeries(entries, end, days);
    if (!pts.some(function (p) { return p.value !== null; })) return null;
    var avg = C.rolling(pts, 7);
    var P = palette(opts.print);
    var W = opts.width || 320, H = opts.height || 150, padL = 22, padR = 6, padT = 10, padB = 20;
    var pw = W - padL - padR, ph = H - padT - padB;
    function x(i) { return padL + (i / (days - 1)) * pw; }
    function y(v) { return padT + (1 - v / 10) * ph; }
    var gradId = nextId("tg-");
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Drive over the last " + days + " days, with a 7-day average" });
    svg.appendChild(s("defs", {}, [s("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
      s("stop", { offset: "0", "stop-color": P.sky, "stop-opacity": "0.35" }),
      s("stop", { offset: "1", "stop-color": P.sky, "stop-opacity": "0" })])]));
    [0, 5, 10].forEach(function (v) {
      svg.appendChild(s("line", { x1: padL, x2: W - padR, y1: y(v), y2: y(v), stroke: P.grid, "stroke-width": "1", "stroke-dasharray": v === 5 ? "3 4" : "" }));
      svg.appendChild(s("text", { x: padL - 6, y: y(v) + 3, fill: P.text, "font-size": "9", "text-anchor": "end" }, [String(v)]));
    });
    var ci = pts.findIndex(function (p) { return p.date === current; });
    if (ci !== -1 && !opts.print) svg.appendChild(s("line", { x1: x(ci), x2: x(ci), y1: padT, y2: padT + ph, stroke: P.accent, "stroke-width": "1", "stroke-dasharray": "2 3", opacity: "0.7" }));

    var segs = [], seg = [];
    avg.forEach(function (p, i) {
      if (p.value === null) { if (seg.length) segs.push(seg); seg = []; }
      else seg.push([x(i), y(p.value)]);
    });
    if (seg.length) segs.push(seg);
    segs.forEach(function (sg) {
      var line = sg.map(function (q, i) { return (i ? "L" : "M") + q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ");
      if (sg.length > 1) {
        var area = line + " L" + sg[sg.length - 1][0].toFixed(1) + "," + (padT + ph) + " L" + sg[0][0].toFixed(1) + "," + (padT + ph) + " Z";
        svg.appendChild(s("path", { d: area, fill: "url(#" + gradId + ")" }));
      }
      svg.appendChild(s("path", { d: line, fill: "none", stroke: P.primary, "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    });
    pts.forEach(function (p, i) {
      if (p.value === null) return;
      var sel = p.date === current && !opts.print;
      svg.appendChild(s("circle", { cx: x(i).toFixed(1), cy: y(p.value).toFixed(1), r: sel ? "4.4" : "3", fill: sel ? P.accent : P.sky, stroke: P.surface, "stroke-width": "1.2" },
        [s("title", {}, [C.formatDate(p.date, { month: "short", day: "numeric" }) + ": " + p.value])]));
    });
    var mid = Math.floor((days - 1) / 2);
    [[0, "start"], [mid, "middle"], [days - 1, "end"]].forEach(function (lb) {
      svg.appendChild(s("text", { x: x(lb[0]), y: H - 4, fill: P.text, "font-size": "9", "text-anchor": lb[1] }, [C.formatDate(pts[lb[0]].date, { month: "short", day: "numeric" })]));
    });
    return svg;
  }

  function stat(value, label, extra) {
    return h("div", { "class": "stat" }, h("b", null, value, extra || null), h("span", { text: label }));
  }

  function renderStats() {
    var root = $("stats");
    root.textContent = "";
    var sm = C.summary(entries, today(), trendDays);
    var delta = null;
    if (sm.delta !== null && sm.delta !== 0) {
      delta = h("small", { "class": sm.delta > 0 ? "up" : "down", text: " " + (sm.delta > 0 ? "↑" : "↓") + Math.abs(sm.delta).toFixed(1), title: "vs. the " + trendDays + " days before" });
      delta.style.fontSize = ".72rem";
    }
    append(root, [
      stat(sm.avg === null ? "–" : sm.avg.toFixed(1), "avg drive", delta),
      stat(sm.logged + "/" + trendDays, "days logged"),
      stat(String(sm.streak), sm.streak === 1 ? "day streak" : "day streak")
    ]);
  }

  function renderTrend() {
    var root = $("trend");
    root.textContent = "";
    var svg = trendSvg(trendDays);
    if (!svg) { root.appendChild(h("p", { "class": "empty", text: "Rate your drive on a few days to see the trend." })); return; }
    root.appendChild(svg);
    root.appendChild(h("div", { "class": "trend-legend" },
      h("span", null, h("i", { "class": "l-avg" }), "7-day average"),
      h("span", null, h("i", { "class": "l-day" }), "daily rating")));
  }

  function renderPatterns() {
    var root = $("patterns");
    root.textContent = "";
    var list = C.factors(entries, settings, today(), PATTERN_DAYS);
    var ready = list.filter(function (f) { return f.ready && f.diff !== null; }).slice(0, 6);
    if (!list.length) {
      root.appendChild(h("p", { "class": "empty" }, "Turn on Levers, Movement or Sleep to see what tends to go with higher drive. ", settingsLink("Settings", "set-modules")));
      return;
    }
    if (!ready.length) {
      root.appendChild(h("p", { "class": "empty", text: "Keep going — once something has 3+ rated days with it and 3+ without, you’ll see how your drive compares here." }));
    } else {
      root.appendChild(h("ul", { "class": "patterns" }, ready.map(function (f) {
        var pos = f.diff >= 0;
        var bar = h("i", { "class": pos ? "pos" : "neg" });
        var w = Math.min(50, Math.abs(f.diff) * 10);
        bar.style.width = w + "%";
        bar.style.left = pos ? "50%" : (50 - w) + "%";
        return h("li", { "class": "pattern" },
          h("span", { "class": "pattern-label", text: f.label, title: f.label }),
          h("span", { "class": "pattern-diff " + (pos ? "pos" : "neg"), text: (pos ? "+" : "−") + Math.abs(f.diff).toFixed(1) }),
          h("span", { "class": "pattern-bar", "aria-hidden": "true" }, bar),
          h("span", { "class": "pattern-meta", text: "avg drive " + f.avgYes.toFixed(1) + " with (" + f.nYes + " days) vs " + f.avgNo.toFixed(1) + " without (" + f.nNo + ")" }));
      })));
    }
    root.appendChild(h("p", { "class": "patterns-note", text: "Patterns, not proof. Unchecked counts as “not done”. Worth talking through with someone you trust before changing anything important." }));
  }

  function renderSide() {
    buildHeatmap($("heatmap"), HEAT_WEEKS);
    renderLegend();
    renderStats();
    renderTrend();
    renderPatterns();
  }

  /* ---------- day / data actions ---------- */

  function clearDay() {
    if (!entries[current]) return;
    if (!confirm("Clear everything logged for " + C.formatDate(current, { month: "long", day: "numeric" }) + "?")) return;
    delete entries[current];
    saveNow();
    goTo(current);
    renderBanners();
    toast("Day cleared");
  }

  function exportAll() {
    flush();
    var n = Object.keys(entries).length;
    download("pilot-light-" + today() + ".json", C.buildExport(entries, settings));
    toast("Exported " + n + " day" + (n === 1 ? "" : "s") + ". Keep the file somewhere private.");
  }

  function importText(text) {
    var parsed;
    try { parsed = C.parseImport(text); } catch (err) { toast(err.message); return; }
    if (parsed.kind === "setup") {
      if (!confirm("Apply this setup? It changes which sections and checklists you see. Your days are not changed.")) return;
      updateSettings(function (st) {
        var next = C.applySetup(st, parsed.settings);
        Object.keys(next).forEach(function (k) { st[k] = next[k]; });
        st.onboarded = true;
      }, { rerenderSettings: $("settingsDialog").open });
      renderBanners();
      toast("Setup applied");
      return;
    }
    if (!parsed.entries.length && !parsed.settings) { toast("No days found in that file."); return; }
    var incoming = parsed.entries;
    var clashes = incoming.filter(function (e) { return entries[e.date]; }).length;
    if (clashes && !confirm(clashes + " of these days already exist here. Replace them with the imported version?\n\nOK = replace · Cancel = only add new days")) {
      incoming = incoming.filter(function (e) { return !entries[e.date]; });
    }
    var res = C.mergeEntries(entries, incoming);
    var useSettings = parsed.settings && confirm("This file also includes settings (modules, lists, time zone). Use them on this device?");
    if (useSettings) {
      settings = parsed.settings;
      settings.onboarded = true;
    } else if (incoming.length) {
      settings.onboarded = true;
    }
    saveNow();
    applyTheme();
    renderAll();
    if ($("settingsDialog").open) renderSettings();
    toast("Imported " + (res.added + res.updated) + " day" + (res.added + res.updated === 1 ? "" : "s") +
      " (" + res.added + " new, " + res.updated + " replaced)" + (parsed.skipped ? " · skipped " + parsed.skipped + " unreadable" : ""));
  }

  function pickImport() { $("importFile").click(); }

  function loadExamples() {
    var added = 0;
    C.exampleEntries(today(), 28).forEach(function (e) {
      if (!entries[e.date]) { entries[e.date] = e; added++; }
    });
    settings.onboarded = true;
    saveNow();
    renderAll();
    toast(added ? "Added " + added + " example days — they’re striped and easy to remove." : "You already have days logged in that range.");
  }

  function removeExamples() {
    var n = 0;
    Object.keys(entries).forEach(function (k) { if (entries[k].example) { delete entries[k]; n++; } });
    saveNow();
    renderAll();
    if ($("settingsDialog").open) renderSettings();
    toast("Removed " + n + " example day" + (n === 1 ? "" : "s"));
  }

  function eraseAll() {
    if (!confirm("Erase every day and all settings on this device?\n\nThis can’t be undone. Export first if you want a backup.")) return;
    try { localStorage.removeItem(KEY_ENTRIES); localStorage.removeItem(KEY_SETTINGS); } catch (e) { /* storage blocked */ }
    load();
    current = today();
    applyTheme();
    $("settingsDialog").close();
    renderAll();
    toast("Everything on this device was erased");
  }

  /* ---------- settings sheet ---------- */

  function openSettings(sectionId) {
    renderSettings();
    var dlg = $("settingsDialog");
    if (!dlg.open) dlg.showModal();
    if (sectionId) {
      var el = $(sectionId);
      if (el) el.scrollIntoView({ block: "start" });
    }
  }

  function setSection(id, title, intro, kids) {
    return h("section", { "class": "set-section", id: id, "aria-labelledby": id + "-t" },
      h("h3", { id: id + "-t", text: title }), intro ? h("p", { text: intro }) : null, kids);
  }

  function toggleItem(title, desc, checked, onChange) {
    var input = h("input", { type: "checkbox", role: "switch", checked: checked, "aria-label": title });
    input.addEventListener("change", function () { onChange(input.checked); });
    return h("li", { "class": "toggle-item" },
      h("div", null, h("b", { text: title }), desc ? h("span", { text: desc }) : null),
      h("span", { "class": "switch" }, input, h("i")));
  }

  function listEditor(key, heading, placeholder) {
    var list = settings[key];
    var rows = h("ul", { "class": "list-editor" });
    list.forEach(function (it) {
      var label = h("input", { "class": "input", type: "text", maxlength: "60", value: it.label, "aria-label": heading + " item" });
      label.addEventListener("input", function () {
        var v = C.cleanLabel(label.value);
        if (v) updateSettings(function (st) { st[key].forEach(function (x) { if (x.id === it.id) x.label = v; }); });
      });
      label.addEventListener("blur", function () { if (!C.cleanLabel(label.value)) label.value = it.label; });
      var show = h("input", { type: "checkbox", checked: it.on, "aria-label": "Show " + it.label });
      show.addEventListener("change", function () {
        updateSettings(function (st) { st[key].forEach(function (x) { if (x.id === it.id) x.on = show.checked; }); });
      });
      rows.appendChild(h("li", { "class": "list-row" },
        h("label", { "class": "show", title: "Show on the check-in" }, show, h("span", { text: "show" })),
        label,
        h("button", { type: "button", "class": "icon-btn", "aria-label": "Remove " + it.label, title: "Remove (past days keep their data)", onclick: function () {
          updateSettings(function (st) { st[key] = st[key].filter(function (x) { return x.id !== it.id; }); }, { rerenderSettings: true });
        } }, icon("trash"))));
    });
    var add = h("input", { "class": "input", type: "text", maxlength: "60", placeholder: placeholder, "aria-label": "Add to " + heading });
    function doAdd() {
      var v = C.cleanLabel(add.value);
      if (!v) return;
      var taken = {};
      settings[key].forEach(function (x) { taken[x.id] = true; });
      updateSettings(function (st) { st[key].push({ id: C.makeId(v, taken), label: v, on: true }); }, { rerenderSettings: true });
      var again = document.querySelector("[data-add='" + key + "']");
      if (again) again.focus();
    }
    add.setAttribute("data-add", key);
    add.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); doAdd(); } });
    return h("div", { "class": "sub-group" },
      h("h4", { text: heading }),
      list.length ? rows : h("p", { "class": "fine", text: "Nothing here yet." }),
      h("div", { "class": "list-add" }, add, h("button", { type: "button", "class": "btn btn-sm", onclick: doAdd }, icon("plus"), h("span", { text: "Add" }))));
  }

  function setupLink() {
    var base = location.href.split("#")[0];
    return base + "#" + C.encodeSetupHash(settings);
  }

  function copyText(input) {
    var text = input.value;
    function fallback() {
      input.focus();
      input.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      toast(ok ? "Link copied" : "Select the link and copy it manually");
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast("Link copied"); }, fallback);
    else fallback();
  }

  function renderSettings() {
    var body = $("settingsBody");
    var keep = body.scrollTop;
    body.textContent = "";

    var presets = h("div", { "class": "preset-row" }, Object.keys(C.PRESETS).map(function (k) {
      var p = C.PRESETS[k];
      return h("button", { type: "button", "class": "preset", onclick: function () {
        updateSettings(function (st) { st.modules = C.presetModules(k); }, { rerenderSettings: true });
        toast(p.label + " preset applied");
      } }, h("b", { text: p.label }), h("span", { text: p.desc }));
    }));

    var modules = h("ul", { "class": "toggle-list" }, C.MODULES.map(function (m) {
      return toggleItem(m.id === "body" ? settings.bodyLabel : m.label, m.desc, settings.modules[m.id], function (v) {
        updateSettings(function (st) { st.modules[m.id] = v; });
      });
    }));

    var bodyLabel = h("input", { "class": "input", type: "text", maxlength: "60", value: settings.bodyLabel, "aria-label": "Body card title" });
    bodyLabel.addEventListener("input", function () {
      var v = C.cleanLabel(bodyLabel.value);
      if (v) updateSettings(function (st) { st.bodyLabel = v; });
    });

    var tzList = h("datalist", { id: "tzList" });
    try {
      (Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : []).forEach(function (z) { tzList.appendChild(h("option", { value: z })); });
    } catch (e) { /* older browsers */ }
    var tz = h("input", { "class": "input", type: "text", list: "tzList", value: settings.timezone, "aria-label": "Time zone", spellcheck: "false" });
    tz.addEventListener("change", function () {
      var v = tz.value.trim();
      if (C.isValidTz(v)) { updateSettings(function (st) { st.timezone = v; }); goTo(current); toast("Time zone set to " + v); }
      else { toast("Unknown time zone — try a name like America/New_York"); tz.value = settings.timezone; }
    });
    var deviceTz = (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone;

    var week = h("select", { "class": "input", "aria-label": "Week starts on", value: String(settings.weekStart) },
      h("option", { value: "0", text: "Sunday" }), h("option", { value: "1", text: "Monday" }));
    week.addEventListener("change", function () { updateSettings(function (st) { st.weekStart = +week.value; }); });

    var theme = h("select", { "class": "input", "aria-label": "Appearance", value: settings.theme },
      h("option", { value: "auto", text: "Match device" }), h("option", { value: "light", text: "Light" }), h("option", { value: "dark", text: "Dark" }));
    theme.addEventListener("change", function () { updateSettings(function (st) { st.theme = theme.value; }); });

    var sharedBy = h("input", { "class": "input", type: "text", maxlength: "60", value: settings.sharedBy, placeholder: "e.g. Dr. Rivera · Riverside Counseling", "aria-label": "Set up by" });
    var linkBox = h("input", { "class": "input", type: "text", readonly: true, value: setupLink(), "aria-label": "Setup link" });
    sharedBy.addEventListener("input", function () {
      updateSettings(function (st) { st.sharedBy = C.cleanLabel(sharedBy.value); });
      linkBox.value = setupLink();
    });
    var isFile = location.protocol === "file:";

    var nEx = countExamples();

    append(body, [
      setSection("set-presets", "Quick setup", "Start from a preset, then switch individual sections on or off below.", presets),
      setSection("set-modules", "What to track", "Drive and Notes are always on. Everything else is optional.", modules),
      setSection("set-lists", "Your lists", "Rename, hide or remove anything. Removing an item keeps what you already logged for past days.", [
        listEditor("scales", "Check-in scales (0–10)", "Add a scale, e.g. Anxiety, Craving, Pain"),
        listEditor("levers", "Levers — your daily protocol", "Add a lever, e.g. Cold shower, Journaling"),
        listEditor("meds", "Meds & supplements", "Add a medication, vitamin or supplement"),
        listEditor("habits", "Substances & habits", "e.g. Alcohol, Nicotine, Cannabis, Gaming, Doomscrolling"),
        h("div", { "class": "sub-group" }, h("h4", { text: "Body card title" }), bodyLabel,
          h("p", { "class": "fine", text: "Make it specific if that helps — “Back pain”, “Headache”, “Recovery”." }))
      ]),
      setSection("set-time", "Time & display", "Days roll over at midnight in this time zone.", [
        h("div", { "class": "fields" },
          h("label", { "class": "field" }, h("span", { text: "Time zone" }), tz, tzList),
          h("label", { "class": "field" }, h("span", { text: "Week starts on" }), week),
          h("label", { "class": "field" }, h("span", { text: "Appearance" }), theme)),
        deviceTz && deviceTz !== settings.timezone
          ? h("p", { "class": "fine" }, "This device is set to " + deviceTz + ". ",
            h("button", { type: "button", "class": "link-btn", text: "Use it", onclick: function () {
              updateSettings(function (st) { st.timezone = deviceTz; }, { rerenderSettings: true }); goTo(current);
            } }))
          : null
      ]),
      setSection("set-share", "Share this setup", "For clinicians, coaches and friends: send someone your module choices and lists so they start with the same check-in. A setup never includes any days or notes.", [
        h("label", { "class": "field" }, h("span", { text: "Set up by (optional, shown to the person you share with)" }), sharedBy),
        h("div", { "class": "share-box" }, linkBox, h("button", { type: "button", "class": "btn btn-sm", text: "Copy link", onclick: function () { copyText(linkBox); } })),
        h("div", { "class": "row" }, h("button", { type: "button", "class": "btn btn-sm btn-quiet", text: "Download setup file", onclick: function () {
          download("pilot-light-setup.json", C.buildSetup(settings));
          toast("Setup file downloaded — they can open it with Import.");
        } })),
        h("p", { "class": "fine", text: (isFile
          ? "You’re running Pilot Light from a file, so this link only works on this computer. Send the setup file instead, or host the folder (for example on Bright Eyed Therapist) and share that link. "
          : "The setup rides in the part of the link after “#”, which browsers don’t send to the server. ") +
          "Your meds and habits lists are included — clear them first if they’re personal." })
      ]),
      setSection("set-data", "Your data", "Stored only in this browser (localStorage). Clearing browser data erases it, so export now and then.", [
        h("div", { "class": "row" },
          h("button", { type: "button", "class": "btn btn-sm btn-primary", text: "Export JSON", onclick: exportAll }),
          h("button", { type: "button", "class": "btn btn-sm", text: "Import JSON", onclick: pickImport }),
          h("button", { type: "button", "class": "btn btn-sm", text: "Load example days", onclick: loadExamples }),
          nEx ? h("button", { type: "button", "class": "btn btn-sm", text: "Remove " + nEx + " example days", onclick: removeExamples }) : null,
          h("button", { type: "button", "class": "btn btn-sm btn-quiet btn-danger", text: "Erase everything", onclick: eraseAll })),
        h("p", { "class": "fine", text: Object.keys(entries).length + " day(s) stored · format " + C.FORMAT + " v" + C.VERSION })
      ]),
      setSection("set-about", "About", null, [
        h("p", { "class": "fine", text: "Pilot Light is a self-reflection tool, not medical advice, diagnosis or treatment. It makes no network requests, uses no cookies or analytics, and has no account. Shared via Bright Eyed Therapist." })
      ])
    ]);
    body.scrollTop = keep;
  }

  /* ---------- print summary ---------- */

  function buildPrint() {
    var root = $("printSummary");
    root.textContent = "";
    var days = 30;
    var end = today();
    var start = C.addDays(end, -(days - 1));
    var sm = C.summary(entries, end, days);
    var f = C.factors(entries, settings, end, PATTERN_DAYS).filter(function (x) { return x.nYes + x.nNo > 0; });
    var fmt = function (d) { return C.formatDate(d, { month: "short", day: "numeric", year: "numeric" }); };
    var scales = settings.modules.checkin ? settings.scales.filter(function (x) { return x.on; }) : [];
    var levers = settings.levers.filter(function (x) { return x.on; });

    var heat = h("div", { "class": "heatmap" });
    buildHeatmap(heat, 12, { print: true });

    var rows = [];
    for (var i = 0; i < days; i++) {
      var d = C.addDays(end, -i), e = entries[d];
      if (!C.hasContent(e)) continue;
      var notes = [e.notes, e.win && "Win: " + e.win, e.session && "For session: " + e.session].filter(Boolean).join(" · ");
      rows.push(h("tr", null,
        h("td", { text: C.formatDate(d, { weekday: "short", month: "short", day: "numeric" }) + (e.example ? " (ex.)" : "") }),
        h("td", { text: e.drive === null ? "–" : String(e.drive) }),
        scales.map(function (sc) { return h("td", { text: e.scales[sc.id] !== undefined ? String(e.scales[sc.id]) : "–" }); }),
        settings.modules.sleep ? h("td", { text: e.sleep.quality === null ? "–" : String(e.sleep.quality) }) : null,
        settings.modules.levers ? h("td", { text: levers.filter(function (l) { return e.levers[l.id]; }).length + "/" + levers.length }) : null,
        h("td", { text: notes.length > 220 ? notes.slice(0, 217) + "…" : notes })));
    }

    append(root, [
      h("div", { "class": "p-head" },
        h("div", null, h("h1", { text: "Pilot Light — drive summary" }),
          h("div", { text: fmt(start) + " – " + fmt(end) + " · " + days + " days · " + settings.timezone })),
        h("div", { "class": "p-meta" },
          h("div", { text: "Name: ______________________" }),
          h("div", { text: "Printed " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }),
          settings.sharedBy ? h("div", { text: "Set up by " + settings.sharedBy }) : null)),
      h("div", { "class": "p-stats" },
        h("div", null, h("b", { text: sm.avg === null ? "–" : sm.avg.toFixed(1) }), "average drive"),
        h("div", null, h("b", { text: sm.prevAvg === null ? "–" : sm.prevAvg.toFixed(1) }), "previous 30 days"),
        h("div", null, h("b", { text: sm.logged + "/" + days }), "days logged"),
        h("div", null, h("b", { text: sm.best ? String(sm.best.value) : "–" }), "highest"),
        h("div", null, h("b", { text: sm.low ? String(sm.low.value) : "–" }), "lowest")),
      h("div", { "class": "p-grid" },
        h("div", null, h("h2", { text: "Trend (7-day average and daily ratings)" }), trendSvg(days, { print: true, width: 440, height: 180 }) || h("p", { text: "No ratings yet." })),
        h("div", null, h("h2", { text: "Heatmap · last 12 weeks" }), heat)),
      h("h2", { text: "Patterns · average drive with vs. without (last " + PATTERN_DAYS + " days)" }),
      f.length ? h("table", null,
        h("thead", null, h("tr", null, ["Factor", "With", "Without", "Difference", "Days (with / without)"].map(function (t) { return h("th", { text: t }); }))),
        h("tbody", null, f.map(function (x) {
          return h("tr", null,
            h("td", { text: x.label }),
            h("td", { text: x.avgYes === null ? "–" : x.avgYes.toFixed(1) }),
            h("td", { text: x.avgNo === null ? "–" : x.avgNo.toFixed(1) }),
            h("td", { text: x.ready && x.diff !== null ? (x.diff >= 0 ? "+" : "−") + Math.abs(x.diff).toFixed(1) : "not enough days" }),
            h("td", { text: x.nYes + " / " + x.nNo }));
        }))) : h("p", { text: "No factors tracked yet." }),
      h("h2", { text: "Daily log · last 30 days" }),
      rows.length ? h("table", null,
        h("thead", null, h("tr", null,
          h("th", { text: "Day" }), h("th", { text: "Drive" }),
          scales.map(function (sc) { return h("th", { text: sc.label }); }),
          settings.modules.sleep ? h("th", { text: "Sleep" }) : null,
          settings.modules.levers ? h("th", { text: "Levers" }) : null,
          h("th", { text: "Notes" }))),
        h("tbody", null, rows)) : h("p", { text: "Nothing logged in this period." }),
      h("p", { "class": "p-foot", text: "Self-reported, for reflection and conversation. Patterns are descriptive, not proof of cause. Not medical advice. Made with Pilot Light · Shared via Bright Eyed Therapist · Stored only on the device that printed it." })
    ]);
  }

  function printSummary() {
    flush();
    buildPrint();
    window.print();
  }

  /* ---------- wiring ---------- */

  function renderAll() {
    if (!current || current > today()) current = today();
    renderHeader();
    renderBanners();
    renderMeta();
    renderForm();
    renderSide();
  }

  function isTyping(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  function bind() {
    $("btnPrev").addEventListener("click", function () { goTo(C.addDays(current, -1)); });
    $("btnNext").addEventListener("click", function () { goTo(C.addDays(current, 1)); });
    $("btnToday").addEventListener("click", function () { goTo(today()); });
    $("datePicker").addEventListener("change", function (ev) { if (ev.target.value) goTo(ev.target.value); });
    $("btnExport").addEventListener("click", exportAll);
    $("btnImport").addEventListener("click", pickImport);
    $("btnSettings").addEventListener("click", function () { openSettings(); });
    $("btnPrint").addEventListener("click", printSummary);
    $("btnCloseSettings").addEventListener("click", function () { $("settingsDialog").close(); });
    $("settingsDialog").addEventListener("click", function (ev) { if (ev.target === ev.currentTarget) ev.currentTarget.close(); });
    $("importFile").addEventListener("change", function (ev) {
      var file = ev.target.files && ev.target.files[0];
      ev.target.value = "";
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) { toast("That file is too large to be a Pilot Light export."); return; }
      var reader = new FileReader();
      reader.onload = function () { importText(String(reader.result)); };
      reader.onerror = function () { toast("Couldn’t read that file."); };
      reader.readAsText(file);
    });

    Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
      b.addEventListener("click", function () {
        trendDays = +b.getAttribute("data-range");
        Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        renderStats();
        renderTrend();
      });
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey || $("settingsDialog").open || isTyping(ev.target)) return;
      if (ev.key === "ArrowLeft") { goTo(C.addDays(current, -1)); ev.preventDefault(); }
      else if (ev.key === "ArrowRight") { goTo(C.addDays(current, 1)); ev.preventDefault(); }
      else if (ev.key === "t" || ev.key === "T") goTo(today());
      else if (/^[0-9]$/.test(ev.key) && driveCardEl) driveCardEl.setDrive(+ev.key);
    });

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) flush();
      else if (current === C.addDays(today(), -1) && !entries[current]) goTo(today());
    });
    window.addEventListener("storage", function (ev) {
      if (ev.key !== KEY_ENTRIES && ev.key !== KEY_SETTINGS) return;
      load();
      applyTheme();
      renderAll();
      toast("Updated from another tab");
    });
    window.addEventListener("hashchange", function () {
      var s2 = C.decodeSetupHash(location.hash);
      if (s2) { pendingSetup = s2; renderBanners(); window.scrollTo(0, 0); }
    });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onScheme = function () { if (settings.theme === "auto") renderSide(); };
      if (mq.addEventListener) mq.addEventListener("change", onScheme);
    }
    window.addEventListener("beforeprint", function () { if (!$("printSummary").children.length) buildPrint(); });
    window.addEventListener("afterprint", function () { $("printSummary").textContent = ""; });
  }

  function boot() {
    load();
    applyTheme();
    pendingSetup = C.decodeSetupHash(location.hash);
    current = today();
    bind();
    renderAll();
    setStatus(storageOk ? (Object.keys(entries).length ? "Saved on this device" : "") : "Not saved", storageOk ? (Object.keys(entries).length ? "ok" : "") : "err");
  }

  boot();
})();
