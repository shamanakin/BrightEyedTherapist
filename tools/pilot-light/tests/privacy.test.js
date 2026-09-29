// Guards against personal details from the private reference prototype creeping back in.
// Terms are stored only as truncated SHA-256 digests so this file doesn't reintroduce them.
// Run: node --test tools/pilot-light/tests/*.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const BANNED = new Set([
  "c987adc38cb55365", "70e5a4e2d329e981", "68be7550846ecd87", "3afc676d803d1cc5",
  "f10048c6557cc533", "69ef5a88b0273f58", "5240d1bda203e433", "f8a9cd0c42a2b383",
  "856fa50792e3c845", "1304f24ded560fd9", "cc274586dc9d2f1e", "1439df9671220aa3",
  "312f0f10c925bad1", "c4d85249100bbce1", "dc4d899da1918e42"
]);

const ROOT = path.join(__dirname, "..");

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? files(p) : [p];
  });
}

test("no personal reference terms anywhere in the tool", () => {
  const hits = [];
  for (const file of files(ROOT)) {
    const text = fs.readFileSync(file, "utf8");
    const words = new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    for (const w of words) {
      const digest = crypto.createHash("sha256").update(w).digest("hex").slice(0, 16);
      if (BANNED.has(digest)) hits.push(path.relative(ROOT, file) + " (digest " + digest + ")");
    }
  }
  assert.deepStrictEqual(hits, []);
});

test("app makes no network requests", () => {
  const code = ["assets/app.js", "assets/core.js"].map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  assert.doesNotMatch(code, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/);
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /<(script|link)[^>]+(src|href)="https?:/);
});
