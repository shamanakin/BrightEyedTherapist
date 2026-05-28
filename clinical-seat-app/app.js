/* LMFT Clinical Exam Prep — quiz engine
 *
 * Question banks register themselves into window.LMFT_BANK via the data/questions/*.js files.
 * Blueprint is loaded inline at the top of index.html.
 *
 * Storage: localStorage key `lmft_prep_v1` holds { stats, flagged, prefs }.
 */

(function () {
  'use strict';

  // -------- STORAGE --------
  const STORAGE_KEY = 'lmft_prep_v1';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const merged = Object.assign(defaultState(), parsed);
      // Deep-merge prefs so new prefs added in updates pick up their defaults
      merged.prefs = Object.assign(defaultState().prefs, parsed.prefs || {});
      return merged;
    } catch (e) {
      console.warn('Failed to load state, resetting.', e);
      return defaultState();
    }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function defaultState() {
    return {
      stats: {},
      tagStats: {},
      flagged: [],
      notes: {},
      sr: {},
      calibration: {},
      activity: [],
      // First-run welcome shown: tracks whether onboarding was dismissed
      welcomeShown: false,
      prefs: { sessionLength: 20, confidenceRating: true, weeklyGoal: 0, examDate: '' }
    };
  }

  function dateKey(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function recordActivity(mode, items, correct) {
    const ts = Date.now();
    state.activity.push({ ts, mode, items, correct, dateKey: dateKey(ts) });
  }

  function activitySummary() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * oneDay;
    const thirtyDaysAgo = now - 30 * oneDay;

    // Cumulative
    let cumulativeItems = 0;
    let cumulativeCorrect = 0;
    state.activity.forEach(a => { cumulativeItems += a.items; cumulativeCorrect += a.correct; });

    // This week (last 7 days, rolling)
    const lastWeek = state.activity.filter(a => a.ts >= sevenDaysAgo);
    const weekItems = lastWeek.reduce((sum, a) => sum + a.items, 0);
    const weekSessions = lastWeek.length;
    const weekCorrect = lastWeek.reduce((sum, a) => sum + a.correct, 0);

    // 30-day calendar map
    const byDay = {};
    state.activity.forEach(a => {
      if (a.ts < thirtyDaysAgo) return;
      const k = a.dateKey;
      if (!byDay[k]) byDay[k] = { items: 0, sessions: 0 };
      byDay[k].items += a.items;
      byDay[k].sessions += 1;
    });

    return {
      totalSessions: state.activity.length,
      cumulativeItems,
      cumulativeCorrect,
      weekItems, weekSessions, weekCorrect,
      byDay
    };
  }

  function recordCalibration(itemId, confidence, correct) {
    if (!state.calibration[itemId]) state.calibration[itemId] = [];
    state.calibration[itemId].push({ confidence, correct, ts: Date.now() });
  }

  // Returns items the user got wrong but rated "sure" or "probable" — the highest-priority study targets.
  function overconfidentWrongItems() {
    const result = [];
    for (const itemId of Object.keys(state.calibration)) {
      const history = state.calibration[itemId];
      // Look at the most recent call
      const last = history[history.length - 1];
      if (!last.correct && (last.confidence === 'sure' || last.confidence === 'probable')) {
        result.push({ itemId, lastCall: last, history });
      }
    }
    return result;
  }

  function calibrationSummary() {
    // Tally: for each confidence level, what fraction were correct?
    const tallies = { sure: { total: 0, correct: 0 }, probable: { total: 0, correct: 0 }, guess: { total: 0, correct: 0 } };
    for (const history of Object.values(state.calibration)) {
      for (const call of history) {
        const t = tallies[call.confidence];
        if (!t) continue;
        t.total += 1;
        if (call.correct) t.correct += 1;
      }
    }
    return tallies;
  }

  // Spaced repetition intervals (days) by box number (1-indexed)
  const SR_INTERVALS_DAYS = [1, 3, 7, 14, 30];
  const DAY_MS = 24 * 60 * 60 * 1000;

  function updateSR(itemId, correct) {
    const entry = state.sr[itemId] || { box: 1, nextDue: 0, lastSeen: 0, misses: 0 };
    if (correct) {
      entry.box = Math.min(5, entry.box + 1);
    } else {
      entry.box = 1;
      entry.misses = (entry.misses || 0) + 1;
    }
    entry.lastSeen = Date.now();
    entry.nextDue = Date.now() + SR_INTERVALS_DAYS[entry.box - 1] * DAY_MS;
    state.sr[itemId] = entry;
  }

  function dueForReview() {
    const now = Date.now();
    return BANK.filter(item => {
      const entry = state.sr[item.id];
      if (!entry) return false; // never seen — not in SR queue
      return entry.nextDue <= now;
    });
  }

  function srCounts() {
    const now = Date.now();
    let due = 0, scheduled = 0, mastered = 0;
    Object.values(state.sr).forEach(e => {
      if (e.box >= 5 && e.nextDue > now) mastered++;
      else if (e.nextDue <= now) due++;
      else scheduled++;
    });
    return { due, scheduled, mastered };
  }

  let state = loadState();

  // -------- DATA --------
  const BLUEPRINT = window.LMFT_BLUEPRINT;
  const BANK = window.LMFT_BANK || [];
  const VIGNETTES = window.LMFT_VIGNETTES || [];

  function itemsForDomain(domainId) {
    return BANK.filter(it => it.domain === domainId);
  }
  function itemsForSubsection(subId) {
    return BANK.filter(it => it.subsection === subId);
  }
  function itemsForTag(tag) {
    return BANK.filter(it => Array.isArray(it.tags) && it.tags.includes(tag));
  }

  // Group all tags from the bank, sorted by item count descending.
  function allTagsWithCounts() {
    const counts = {};
    BANK.forEach(it => {
      if (!Array.isArray(it.tags)) return;
      it.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }
  function countByDomain() {
    const c = {};
    BLUEPRINT.domains.forEach(d => c[d.id] = itemsForDomain(d.id).length);
    return c;
  }

  // Stratified sample: pick n items proportional to subsection weights, with
  // adaptive boost on subsections where the user has lower accuracy.
  // First, include SR-due items (capped at half the session) so spaced-rep
  // work happens organically inside Adaptive mode without a separate visit.
  function buildAdaptiveSession(n) {
    // Step 1: pull SR-due items first, capped at half the session length
    const dueItems = dueForReview();
    shuffle(dueItems);
    const srSlot = Math.floor(n / 2);
    const srPicked = dueItems.slice(0, srSlot);
    const srPickedIds = new Set(srPicked.map(it => it.id));

    // Step 2: fill remainder with accuracy-weighted adaptive selection
    const remaining = n - srPicked.length;
    if (remaining <= 0) {
      shuffle(srPicked);
      return srPicked;
    }

    const targets = []; // {subId, weight}
    BLUEPRINT.domains.forEach(d => {
      d.subsections.forEach(s => {
        const stat = state.stats[s.id] || { seen: 0, correct: 0 };
        const accuracy = stat.seen >= 3 ? stat.correct / stat.seen : 0.7; // neutral if insufficient
        const errorBoost = 1 + Math.max(0, 0.8 - accuracy) * 2; // accuracy 0.0 -> 2.6x; 0.5 -> 1.6x; 0.8+ -> 1.0x
        targets.push({ subId: s.id, weight: s.weight * errorBoost });
      });
    });
    const totalW = targets.reduce((a, b) => a + b.weight, 0);
    const adaptiveBatch = [];
    targets.forEach(t => {
      const count = Math.max(0, Math.round(remaining * t.weight / totalW));
      const available = itemsForSubsection(t.subId).filter(it => !srPickedIds.has(it.id));
      shuffle(available);
      adaptiveBatch.push(...available.slice(0, count));
    });

    const combined = srPicked.concat(adaptiveBatch.slice(0, remaining));
    shuffle(combined);
    return combined.slice(0, n);
  }

  function buildBlueprintSession(n) {
    const session = [];
    BLUEPRINT.domains.forEach(d => {
      d.subsections.forEach(s => {
        const count = Math.max(0, Math.round(n * s.weight / 100));
        const available = itemsForSubsection(s.id);
        shuffle(available);
        session.push(...available.slice(0, count));
      });
    });
    shuffle(session);
    return session.slice(0, n);
  }

  function buildDomainSession(domainId, n) {
    const available = itemsForDomain(domainId).slice();
    shuffle(available);
    return available.slice(0, n);
  }

  function buildFlaggedSession() {
    const ids = new Set(state.flagged.map(f => f.itemId));
    return BANK.filter(it => ids.has(it.id));
  }

  function itemsByDifficulty(min) {
    return BANK.filter(it => (it.difficulty || 2) >= min);
  }

  // Items the user has missed within a given window (default 7 days).
  // Uses calibration history (which records correct/incorrect with timestamps).
  function recentlyMissedItems(windowDays = 7) {
    const cutoff = Date.now() - windowDays * DAY_MS;
    const missedIds = new Set();
    for (const [itemId, history] of Object.entries(state.calibration || {})) {
      // Look at attempts within window — include if the most recent attempt in window was wrong
      const inWindow = history.filter(h => h.ts >= cutoff);
      if (inWindow.length === 0) continue;
      const last = inWindow[inWindow.length - 1];
      if (!last.correct) missedIds.add(itemId);
    }
    return BANK.filter(it => missedIds.has(it.id));
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // -------- RENDER --------
  const root = document.getElementById('app');
  let view = 'home';
  let session = null; // { items, index, results }

  function render() {
    root.innerHTML = '';
    root.appendChild(renderTopbar());
    if (view === 'home') root.appendChild(renderHome());
    else if (view === 'quiz') root.appendChild(renderQuiz());
    else if (view === 'stats') root.appendChild(renderStats());
    else if (view === 'flagged') root.appendChild(renderFlagged());
    else if (view === 'reference') root.appendChild(renderReference());
    else if (view === 'activity') root.appendChild(renderActivity());
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));
  }

  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'onclick') e.onclick = v;
      else if (k.startsWith('on')) e[k] = v;
      else if (v === false || v == null) { /* skip */ }
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function renderTopbar() {
    return el('header', { class: 'topbar' },
      el('h1', null, 'Clinical Seat ', el('small', null, `· ${BANK.length} items · CA LMFT`)),
      el('div', { class: 'nav' },
        el('button', { class: view === 'home' ? 'active' : '', onclick: () => go('home') }, 'Practice'),
        el('button', { class: view === 'activity' ? 'active' : '', onclick: () => go('activity') }, 'Activity'),
        el('button', { class: view === 'stats' ? 'active' : '', onclick: () => go('stats') }, 'Stats'),
        el('button', { class: view === 'flagged' ? 'active' : '', onclick: () => go('flagged') }, `Flagged (${state.flagged.length})`),
        el('button', { class: view === 'reference' ? 'active' : '', onclick: () => go('reference') }, 'Reference'),
        el('button', { class: 'topbar-help', onclick: showWelcomeOverlay, title: 'Help / About' }, '?')
      )
    );
  }

  // Generate the most useful next-step suggestions based on current state.
  // Returns up to 3 prioritized suggestions.
  function nextStepSuggestions() {
    const suggestions = [];
    const sr = srCounts();
    const overconfident = overconfidentWrongItems();
    const totalSessions = state.activity.length;

    // 1. Overconfident-wrong items are the highest study priority (gaps you don't know you have)
    if (overconfident.length >= 3) {
      suggestions.push({
        priority: 1,
        title: `Review ${overconfident.length} overconfident-wrong items`,
        why: 'Items you were Sure or Probable on but missed — highest-priority study targets.',
        action: () => {
          const items = overconfident.map(o => BANK.find(b => b.id === o.itemId)).filter(Boolean);
          startSession(items, 'Overconfident-wrong review');
        },
        actionLabel: 'Drill these'
      });
    }

    // 2. SR-due items if there are enough to constitute a session
    if (sr.due >= 5) {
      suggestions.push({
        priority: 2,
        title: `${sr.due} items due for spaced-rep review`,
        why: 'These are items the SR queue says you should see today to consolidate.',
        action: () => startSession(dueForReview(), 'Due for review'),
        actionLabel: 'Review queue'
      });
    }

    // 3. Weakest subsection (if user has sufficient data)
    let weakest = null;
    BLUEPRINT.domains.forEach(d => d.subsections.forEach(s => {
      const stat = state.stats[s.id];
      if (!stat || stat.seen < 4) return;
      const acc = stat.correct / stat.seen;
      if (acc < 0.7 && (!weakest || acc < weakest.acc)) {
        weakest = { sub: s, dom: d, acc, seen: stat.seen };
      }
    }));
    if (weakest) {
      suggestions.push({
        priority: 3,
        title: `Drill ${weakest.sub.id} — your weakest subsection (${Math.round(weakest.acc * 100)}%)`,
        why: `${weakest.sub.name}, ${weakest.seen} items answered.`,
        action: () => {
          const items = itemsForSubsection(weakest.sub.id);
          shuffle(items);
          startSession(items.slice(0, state.prefs.sessionLength), `${weakest.sub.id} drill`);
        },
        actionLabel: 'Drill weakest'
      });
    }

    // 4. First-time setup hint
    if (totalSessions === 0 && suggestions.length === 0) {
      suggestions.push({
        priority: 4,
        title: 'Take a Blueprint mix to calibrate',
        why: 'A representative 20-item session establishes a baseline across all domains. After 3+ sessions, Adaptive mode will use the data to focus.',
        action: () => startSession(buildBlueprintSession(20), 'Blueprint mix · baseline'),
        actionLabel: 'Start baseline'
      });
    }

    // 5. Exam countdown nudge when exam is close (< 14 days)
    if (state.prefs.examDate) {
      const exam = new Date(state.prefs.examDate + 'T00:00:00');
      const today = new Date(); today.setHours(0,0,0,0);
      const daysLeft = Math.ceil((exam - today) / 86400000);
      if (daysLeft > 0 && daysLeft <= 14) {
        suggestions.push({
          priority: 5,
          title: `${daysLeft} day${daysLeft === 1 ? '' : 's'} until exam — consider a mock exam`,
          why: 'Final-stretch prep benefits from full-length timed simulation to acclimate to sustained focus and pacing.',
          action: () => {
            if (!confirm('Start a full mock exam? 130 items, 240-minute timer.')) return;
            const items = buildBlueprintSession(130);
            startMockExam(items);
          },
          actionLabel: 'Start mock'
        });
      }
    }

    return suggestions.slice(0, 3);
  }

  function renderHome() {
    const container = el('div', { class: 'home' });

    // Smart next-step block at the top
    const suggestions = nextStepSuggestions();
    if (suggestions.length > 0) {
      container.appendChild(el('h2', null, 'What\'s next'));
      const sugList = el('div', { class: 'suggestion-list' });
      suggestions.forEach(s => {
        sugList.appendChild(el('div', { class: 'suggestion-card' },
          el('div', { class: 'suggestion-body' },
            el('div', { class: 'suggestion-title' }, s.title),
            el('div', { class: 'suggestion-why' }, s.why)
          ),
          el('button', { class: 'primary', onclick: s.action }, s.actionLabel)
        ));
      });
      container.appendChild(sugList);
    }

    container.appendChild(el('h2', null, 'Session length'));
    const config = el('div', { class: 'config' },
      el('label', null,
        'Items per session: ',
        el('input', {
          type: 'number', min: '5', max: '130', value: state.prefs.sessionLength,
          onchange: (e) => { state.prefs.sessionLength = parseInt(e.target.value) || 20; saveState(); }
        })
      ),
      el('label', null,
        el('input', {
          type: 'checkbox',
          checked: state.prefs.confidenceRating !== false,
          onchange: (e) => { state.prefs.confidenceRating = e.target.checked; saveState(); render(); }
        }),
        ' Confidence rating (Sure / Probably / Guess) on each answer'
      )
    );
    container.appendChild(config);

    container.appendChild(el('h2', null, 'Mode'));
    const sr = srCounts();
    const dueLabel = sr.due > 0 ? `${sr.due} due today` : (Object.keys(state.sr).length === 0 ? 'Nothing scheduled yet' : 'Caught up');
    container.appendChild(el('div', { class: 'mode-grid' },
      modeCard('Adaptive', 'Weighted toward weak subsections', () => startSession(buildAdaptiveSession(state.prefs.sessionLength), 'Adaptive')),
      modeCard('Blueprint mix', 'Proportional to BBS domain percentages', () => startSession(buildBlueprintSession(state.prefs.sessionLength), 'Blueprint mix')),
      modeCard('Due for review', dueLabel, () => {
        const items = dueForReview();
        if (items.length === 0) {
          alert(Object.keys(state.sr).length === 0
            ? 'Take a session in another mode first — items only enter the review queue once you\'ve seen them.'
            : 'Nothing due right now. Items return at 1d, 3d, 7d, 14d, then 30d intervals based on whether you got them right.');
          return;
        }
        startSession(items.map(i => i), 'Due for review');
      }),
      modeCard('Recently missed', `Items missed in the last 7 days (${recentlyMissedItems(7).length})`, () => {
        const items = recentlyMissedItems(7);
        if (items.length === 0) {
          alert('No items missed in the last 7 days. Take more sessions with confidence rating on to populate this queue.');
          return;
        }
        startSession(items, 'Recently missed (7d)');
      }),
      modeCard('Hard items only', `Difficulty-3 items (${itemsByDifficulty(3).length} available)`, () => {
        const items = itemsByDifficulty(3);
        if (items.length === 0) { alert('No difficulty-3 items in the bank.'); return; }
        shuffle(items);
        startSession(items.slice(0, state.prefs.sessionLength), 'Hard items only');
      }),
      modeCard('Crisis vignettes', `${VIGNETTES.length} branching scenarios`, () => {
        if (VIGNETTES.length === 0) { alert('No vignettes loaded.'); return; }
        startVignette(VIGNETTES[Math.floor(Math.random() * VIGNETTES.length)]);
      }),
      modeCard('Mock exam', 'Full 130-item timed run (240 min)', () => {
        if (!confirm('Start a full mock exam? 130 items, 240-minute timer, no rationale until the end. Make sure you can sit uninterrupted.')) return;
        const items = buildBlueprintSession(130);
        if (items.length < 130) {
          if (!confirm(`Bank currently has ${items.length} items. Run a shorter mock with what's available?`)) return;
        }
        startMockExam(items);
      })
    ));

    container.appendChild(el('h2', null, 'Domains'));
    container.appendChild(el('p', { class: 'lede' }, 'Drill a single content domain. Counts reflect items currently in the bank.'));
    const counts = countByDomain();
    const list = el('div', { class: 'domain-list' });
    BLUEPRINT.domains.forEach(d => {
      const count = counts[d.id];
      list.appendChild(el('div', { class: 'domain-row' + (count === 0 ? ' empty' : '') },
        el('span', { class: 'dom-id' }, String(d.id)),
        el('span', { class: 'dom-name' }, d.name),
        el('span', { class: 'dom-weight' }, d.weight + '%'),
        el('span', { class: 'dom-count' }, count + ' items'),
        el('button', {
          class: 'dom-action',
          disabled: count === 0,
          onclick: () => count > 0 && startSession(buildDomainSession(d.id, state.prefs.sessionLength), d.name)
        }, 'Drill')
      ));
    });
    container.appendChild(list);

    // Item text search — find items by text in stem
    container.appendChild(el('h2', null, 'Search items'));
    const searchResultsEl = el('div', { class: 'search-results', id: 'item-search-results' });
    container.appendChild(el('div', { class: 'config', style: 'padding: 0; background: transparent; border: none;' },
      el('input', {
        type: 'text',
        placeholder: 'Search stems by keyword (e.g. "Tarasoff", "couple conflict", "panic")…',
        class: 'tag-filter',
        oninput: (e) => {
          const q = e.target.value.toLowerCase().trim();
          searchResultsEl.innerHTML = '';
          if (q.length < 2) return;
          const matches = BANK.filter(it =>
            it.stem.toLowerCase().includes(q) ||
            (Array.isArray(it.tags) && it.tags.some(t => t.toLowerCase().includes(q))) ||
            it.id.toLowerCase().includes(q)
          ).slice(0, 30);
          if (matches.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.style.padding = '12px';
            empty.textContent = `No items match "${q}".`;
            searchResultsEl.appendChild(empty);
            return;
          }
          matches.forEach(item => {
            const row = document.createElement('div');
            row.className = 'domain-row';
            row.innerHTML = `
              <span class="dom-id">${item.subsection}</span>
              <span class="dom-name">${escapeHTML(item.stem.slice(0, 110))}${item.stem.length > 110 ? '…' : ''}</span>
              <span></span>
              <span></span>
            `;
            const btn = document.createElement('button');
            btn.className = 'dom-action';
            btn.textContent = 'Drill';
            btn.onclick = () => startSession([item], `Search: ${item.id}`);
            row.appendChild(btn);
            searchResultsEl.appendChild(row);
          });
          if (BANK.filter(it => it.stem.toLowerCase().includes(q)).length > 30) {
            const more = document.createElement('div');
            more.className = 'empty-state';
            more.style.padding = '8px';
            more.textContent = `Showing first 30. Refine query for more.`;
            searchResultsEl.appendChild(more);
          }
        }
      })
    ));
    container.appendChild(searchResultsEl);

    // Tag-based drilling — concepts that recur across items.
    const tags = allTagsWithCounts();
    if (tags.length > 0) {
      container.appendChild(el('h2', null, 'Drill by concept'));
      container.appendChild(el('p', { class: 'lede' }, 'Items grouped by concept tags (each item carries 1-3 tags). Click any concept to drill all items with that tag. Useful for targeted last-mile prep on specific concepts.'));
      // Filter input
      const tagSearch = el('input', {
        type: 'text',
        placeholder: 'Filter concepts (e.g. CANRA, EFT, theory)…',
        class: 'tag-filter',
        oninput: (e) => {
          const q = e.target.value.toLowerCase();
          const cloud = document.getElementById('tag-cloud');
          if (!cloud) return;
          Array.from(cloud.children).forEach(chip => {
            const tag = chip.dataset.tag || '';
            chip.style.display = tag.toLowerCase().includes(q) ? '' : 'none';
          });
        }
      });
      container.appendChild(tagSearch);
      const cloud = el('div', { class: 'tag-cloud', id: 'tag-cloud' });
      const INITIAL_SHOWN = 40;
      const initialBatch = tags.slice(0, INITIAL_SHOWN);
      const overflowBatch = tags.slice(INITIAL_SHOWN);
      initialBatch.forEach(({ tag, count }) => {
        const chip = el('button', {
          class: 'tag-chip',
          'data-tag': tag,
          onclick: () => {
            const items = itemsForTag(tag);
            if (items.length === 0) return;
            startSession(items.slice(), `Concept: ${tag}`);
          }
        },
          el('span', { class: 'tag-chip-label' }, tag),
          el('span', { class: 'tag-chip-count' }, String(count))
        );
        cloud.appendChild(chip);
      });
      container.appendChild(cloud);
      if (overflowBatch.length > 0) {
        const expandBtn = el('button', {
          class: 'secondary',
          style: 'margin-top: 8px;',
          onclick: function() {
            // Append remaining chips
            overflowBatch.forEach(({ tag, count }) => {
              const chip = el('button', {
                class: 'tag-chip',
                'data-tag': tag,
                onclick: () => {
                  const items = itemsForTag(tag);
                  if (items.length === 0) return;
                  startSession(items.slice(), `Concept: ${tag}`);
                }
              },
                el('span', { class: 'tag-chip-label' }, tag),
                el('span', { class: 'tag-chip-count' }, String(count))
              );
              cloud.appendChild(chip);
            });
            this.remove();
          }
        }, `Show ${overflowBatch.length} more concept${overflowBatch.length === 1 ? '' : 's'}`);
        container.appendChild(expandBtn);
      }
    }

    return container;
  }

  function modeCard(title, desc, onclick) {
    return el('div', { class: 'mode-card', onclick },
      el('h3', null, title),
      el('p', null, desc)
    );
  }

  function startSession(items, label) {
    if (!items || items.length === 0) {
      alert('No items available for that selection yet.');
      return;
    }
    // Shuffle option order per item per session. Build a presentation view that
    // randomizes the display order while preserving the link back to the source
    // indices for rationale display.
    const presented = items.map(it => shuffleItemOptions(it));
    session = { items: presented, index: 0, results: [], label, answered: false, selectedIndex: null, mode: 'practice' };
    view = 'quiz';
    render();
  }

  function startVignette(vignette) {
    session = {
      mode: 'vignette',
      vignette,
      stageIndex: 0,
      choices: [], // [{stage, choice, score, ts}]
      selectedOption: null,
      stageAnswered: false,
      label: `Vignette: ${vignette.title}`,
      finished: false
    };
    view = 'quiz';
    render();
  }

  function selectVignetteOption(i) {
    if (session.stageAnswered) return;
    session.selectedOption = i;
    render();
  }

  function submitVignetteChoice() {
    if (session.selectedOption == null || session.stageAnswered) return;
    const stage = session.vignette.stages[session.stageIndex];
    const score = stage.scores[session.selectedOption];
    session.choices.push({
      stage: session.stageIndex,
      choice: session.selectedOption,
      score,
      ts: Date.now()
    });
    session.stageAnswered = true;
    render();
  }

  function nextVignetteStage() {
    const stage = session.vignette.stages[session.stageIndex];
    const next = stage.nextStageByChoice[session.selectedOption];
    if (next == null) {
      // Vignette complete
      session.finished = true;
      // Record activity
      const totalScore = session.choices.reduce((sum, c) => sum + c.score, 0);
      const possible = session.vignette.stages.length * 2; // max score per stage = 2
      const normalizedCorrect = Math.max(0, Math.round((totalScore / possible) * session.choices.length));
      recordActivity(`Vignette: ${session.vignette.title}`, session.choices.length, normalizedCorrect);
      // Update tag stats
      const tags = session.vignette.tags || [];
      tags.forEach(t => {
        const ts = state.tagStats[t] || { seen: 0, correct: 0 };
        ts.seen += session.choices.length;
        ts.correct += normalizedCorrect;
        state.tagStats[t] = ts;
      });
      saveState();
    } else {
      session.stageIndex = next;
      session.selectedOption = null;
      session.stageAnswered = false;
    }
    render();
  }

  function startMockExam(items) {
    const presented = items.map(it => shuffleItemOptions(it));
    // Mock mode: timed, no rationale until end, navigation between items
    session = {
      items: presented,
      index: 0,
      // answers indexed by item position: null = unanswered, number = selected display index
      answers: new Array(presented.length).fill(null),
      label: `Mock exam (${presented.length} items)`,
      mode: 'mock',
      startedAt: Date.now(),
      durationMs: 240 * 60 * 1000, // 240 minutes
      finished: false
    };
    view = 'quiz';
    render();
    startMockTimer();
  }

  let mockTimerHandle = null;
  function startMockTimer() {
    if (mockTimerHandle) clearInterval(mockTimerHandle);
    mockTimerHandle = setInterval(() => {
      if (!session || session.mode !== 'mock' || session.finished) {
        clearInterval(mockTimerHandle);
        mockTimerHandle = null;
        return;
      }
      const remaining = session.durationMs - (Date.now() - session.startedAt);
      if (remaining <= 0) {
        finishMockExam(true);
        return;
      }
      // Patch only the timer element to avoid full re-render
      const el = document.getElementById('mock-timer');
      if (el) el.textContent = formatRemaining(remaining);
    }, 1000);
  }

  function formatRemaining(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function finishMockExam(timedOut) {
    if (!session || session.mode !== 'mock') return;
    session.finished = true;
    if (mockTimerHandle) { clearInterval(mockTimerHandle); mockTimerHandle = null; }
    // Score all answered items and update stats + SR
    let totalAnswered = 0;
    let totalCorrect = 0;
    session.items.forEach((item, idx) => {
      const ans = session.answers[idx];
      if (ans == null) return;
      totalAnswered += 1;
      const isCorrect = ans === item.correctIndex;
      if (isCorrect) totalCorrect += 1;
      const s = state.stats[item.subsection] || { seen: 0, correct: 0 };
      s.seen += 1;
      if (isCorrect) s.correct += 1;
      state.stats[item.subsection] = s;
      // Tag stats too
      const tags = (item.source && item.source.tags) || item.tags || [];
      tags.forEach(t => {
        const ts = state.tagStats[t] || { seen: 0, correct: 0 };
        ts.seen += 1;
        if (isCorrect) ts.correct += 1;
        state.tagStats[t] = ts;
      });
      updateSR(item.id, isCorrect);
    });
    // Record mock as a single activity entry
    recordActivity(session.label || 'Mock exam', totalAnswered, totalCorrect);
    saveState();
    session.timedOut = timedOut;
    render();
  }

  // Returns a wrapped copy of the item with options shuffled. Adds:
  //   displayOptions: string[]        — options in display order
  //   displayToSource: number[]       — displayToSource[displayIdx] = sourceIdx
  //   correctDisplayIndex: number     — index in displayOptions of the correct answer
  // The original item is kept as `source` for rationale mapping.
  function shuffleItemOptions(item) {
    const sourceIndices = [0, 1, 2, 3];
    shuffle(sourceIndices);
    const displayOptions = sourceIndices.map(i => item.options[i]);
    const correctDisplayIndex = sourceIndices.indexOf(item.correctIndex);
    return {
      // Pass-throughs from the source item
      id: item.id, domain: item.domain, subsection: item.subsection,
      stem: item.stem, difficulty: item.difficulty, tags: item.tags,
      lawCitation: item.lawCitation,
      // Display state
      options: displayOptions,
      correctIndex: correctDisplayIndex,
      // Mapping back to source for rationale display
      displayToSource: sourceIndices,
      // Original item retained for rationale.distractors lookup
      source: item
    };
  }

  function go(v) { view = v; render(); }

  function renderQuiz() {
    if (session.mode === 'vignette') {
      return session.finished ? renderVignetteReview() : renderVignetteStage();
    }
    if (session.mode === 'mock' && session.finished) return renderMockReview();
    if (session.mode === 'mock') return renderMockQuiz();
    if (session.index >= session.items.length) return renderCompletion();
    return renderPracticeQuiz();
  }

  function renderVignetteStage() {
    const v = session.vignette;
    const stage = v.stages[session.stageIndex];
    const letters = ['a', 'b', 'c', 'd'];
    const stageNum = session.choices.length + 1;
    const totalStages = v.stages.length;
    const score = session.stageAnswered ? stage.scores[session.selectedOption] : null;
    const scoreLabel = { '-1': 'Harmful', '0': 'Problematic', '1': 'Adequate', '2': 'Best' }[String(score)] || '';
    const scoreCls = score === 2 ? 'correct' : score >= 1 ? 'selected' : 'wrong';

    const container = el('div');
    container.appendChild(el('div', { class: 'quiz-header' },
      el('span', { class: 'progress' }, `Stage ${stageNum} / ~${totalStages}`),
      el('span', { class: 'domain-tag', style: 'background: #3a2e1e; color: #f0c674' }, 'Vignette: ' + v.title)
    ));

    const card = el('div', { class: 'item-card' });
    card.appendChild(el('div', { class: 'vignette-context' },
      el('p', { class: 'item-stem' }, stage.text)
    ));
    card.appendChild(el('p', { class: 'vignette-prompt' }, stage.prompt));

    const optsEl = el('div', { class: 'options' });
    stage.options.forEach((opt, i) => {
      let cls = 'option';
      if (session.stageAnswered) {
        if (i === session.selectedOption) {
          cls += ' ' + scoreCls;
        } else if (stage.scores[i] === 2) {
          // Highlight the best option even if user picked something else
          cls += ' correct';
        }
      } else if (session.selectedOption === i) {
        cls += ' selected';
      }
      optsEl.appendChild(el('button', {
        class: cls,
        disabled: session.stageAnswered,
        onclick: () => selectVignetteOption(i)
      },
        el('span', { class: 'letter' }, letters[i] + '.'),
        el('span', null, opt)
      ));
    });
    card.appendChild(optsEl);

    if (session.stageAnswered) {
      const rationaleEl = el('div', { class: 'rationale' });
      rationaleEl.appendChild(el('h4', null, `Your choice: ${scoreLabel}`));
      const yourRat = stage.rationale[session.selectedOption];
      if (yourRat) {
        const yourCls = score === 2 ? 'correct-rationale' : 'distractor-rationale';
        rationaleEl.appendChild(el('div', { class: yourCls }, yourRat));
      }
      // Show the best option's rationale if user didn't pick it
      if (score !== 2) {
        const bestIdx = stage.scores.indexOf(2);
        if (bestIdx !== -1) {
          rationaleEl.appendChild(el('h4', null, `Best option (${letters[bestIdx]})`));
          rationaleEl.appendChild(el('div', { class: 'correct-rationale' }, stage.rationale[bestIdx]));
        }
      }
      card.appendChild(rationaleEl);
    }

    card.appendChild(el('div', { class: 'actions' },
      el('button', { class: 'secondary', onclick: () => go('home') }, 'Exit vignette'),
      session.stageAnswered
        ? el('button', { class: 'primary', onclick: nextVignetteStage },
            stage.nextStageByChoice[session.selectedOption] == null ? 'See summary' : 'Next stage →')
        : el('button', { class: 'primary', disabled: session.selectedOption == null, onclick: submitVignetteChoice }, 'Submit choice')
    ));
    container.appendChild(card);
    return container;
  }

  function renderVignetteReview() {
    const v = session.vignette;
    const letters = ['a', 'b', 'c', 'd'];
    const totalScore = session.choices.reduce((sum, c) => sum + c.score, 0);
    const possible = session.choices.length * 2;
    const pct = possible > 0 ? Math.round((totalScore / possible) * 100) : 0;

    const container = el('div');
    const head = el('div', { class: 'completion' });
    head.appendChild(el('h2', null, 'Vignette complete'));
    head.appendChild(el('p', null, v.title));
    head.appendChild(el('div', { class: 'score' }, `${totalScore} / ${possible}`));
    head.appendChild(el('p', null, `${pct}% of max score · ${session.choices.length} stages completed`));
    head.appendChild(el('div', { class: 'actions', style: 'justify-content: center;' },
      el('button', { class: 'primary', onclick: () => go('home') }, 'Back to home'),
      el('button', { class: 'secondary', onclick: () => {
        if (VIGNETTES.length === 0) return;
        // Pick a different vignette if possible
        const others = VIGNETTES.filter(vg => vg.id !== v.id);
        const pick = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : VIGNETTES[0];
        startVignette(pick);
      } }, 'Try another vignette')
    ));
    container.appendChild(head);

    // Per-stage breakdown
    container.appendChild(el('h2', { style: 'margin-top:32px' }, 'Your path'));
    const list = el('div', { class: 'domain-list' });
    session.choices.forEach((c, idx) => {
      const stage = v.stages[c.stage];
      const yourLetter = letters[c.choice];
      const optimalLetter = letters[stage.scores.indexOf(2)];
      const scoreLabel = { '-1': 'Harmful', '0': 'Problematic', '1': 'Adequate', '2': 'Best' }[String(c.score)] || '';
      const match = yourLetter === optimalLetter ? ' ✓' : '';
      list.appendChild(el('div', { class: 'domain-row' },
        el('span', { class: 'dom-id' }, `Stage ${idx + 1}`),
        el('span', { class: 'dom-name' }, `You chose ${yourLetter} — ${scoreLabel}${match}`),
        el('span', { class: 'dom-weight' }, `Best: ${optimalLetter}`),
        el('span', { class: 'dom-count' }, c.score >= 1 ? 'On track' : 'Off track'),
        el('span', null, '')
      ));
    });
    container.appendChild(list);

    return container;
  }

  function renderPracticeQuiz() {
    const item = session.items[session.index];

    const container = el('div');
    container.appendChild(el('div', { class: 'quiz-header' },
      el('span', { class: 'progress' }, `${session.index + 1} / ${session.items.length}`),
      el('span', null,
        el('span', { class: 'domain-tag', style: 'margin-right:8px' }, item.subsection + ' · ' + (BLUEPRINT.domains.find(d => d.id === item.domain)?.name.slice(0, 30) || '')),
        el('button', { class: 'kbd-hint', onclick: toggleKeyboardHelp, title: 'Keyboard shortcuts' }, '⌨ ?')
      )
    ));

    const card = el('div', { class: 'item-card' });
    card.appendChild(el('div', { class: 'item-stem' }, item.stem));

    const optsEl = el('div', { class: 'options' });
    const letters = ['a', 'b', 'c', 'd'];
    item.options.forEach((opt, i) => {
      let cls = 'option';
      if (session.answered) {
        if (i === item.correctIndex) cls += ' correct';
        else if (i === session.selectedIndex) cls += ' wrong';
      } else if (session.selectedIndex === i) {
        cls += ' selected';
      }
      optsEl.appendChild(el('button', {
        class: cls,
        disabled: session.answered,
        onclick: () => selectOption(i)
      },
        el('span', { class: 'letter' }, letters[i] + '.'),
        el('span', null, opt)
      ));
    });
    card.appendChild(optsEl);

    if (session.answered) {
      card.appendChild(renderRationale(item));
    }

    card.appendChild(renderActions(item));
    container.appendChild(card);
    return container;
  }

  function renderMockQuiz() {
    const item = session.items[session.index];
    const currentAnswer = session.answers[session.index];
    const letters = ['a', 'b', 'c', 'd'];
    const remaining = session.durationMs - (Date.now() - session.startedAt);
    const answeredCount = session.answers.filter(a => a != null).length;

    const container = el('div');

    container.appendChild(el('div', { class: 'quiz-header' },
      el('span', { class: 'progress' }, `${session.index + 1} / ${session.items.length} · ${answeredCount} answered`),
      el('span', { class: 'domain-tag', id: 'mock-timer-tag', style: 'background:#3a2e1e;color:#f0c674' },
        el('span', { id: 'mock-timer' }, formatRemaining(remaining)),
        ' remaining'
      )
    ));

    const card = el('div', { class: 'item-card' });
    card.appendChild(el('div', { class: 'item-stem' }, item.stem));

    const optsEl = el('div', { class: 'options' });
    item.options.forEach((opt, i) => {
      let cls = 'option' + (currentAnswer === i ? ' selected' : '');
      optsEl.appendChild(el('button', {
        class: cls,
        onclick: () => {
          session.answers[session.index] = (session.answers[session.index] === i ? null : i);
          render();
        }
      },
        el('span', { class: 'letter' }, letters[i] + '.'),
        el('span', null, opt)
      ));
    });
    card.appendChild(optsEl);

    // Mock-mode actions: previous/next + finish
    card.appendChild(el('div', { class: 'actions' },
      el('div', { style: 'display:flex; gap:6px;' },
        el('button', { class: 'secondary', disabled: session.index === 0, onclick: () => { session.index -= 1; render(); } }, '← Prev'),
        el('button', { class: 'secondary', disabled: session.index >= session.items.length - 1, onclick: () => { session.index += 1; render(); } }, 'Next →')
      ),
      el('div', { style: 'display:flex; gap:6px;' },
        el('button', { class: 'secondary', onclick: showMockNavGrid }, 'Item list'),
        el('button', { class: 'primary', onclick: () => {
          const unanswered = session.answers.filter(a => a == null).length;
          const msg = unanswered > 0
            ? `End mock with ${unanswered} items unanswered? You will not be able to return to them.`
            : 'End mock and view results?';
          if (confirm(msg)) finishMockExam(false);
        } }, 'End mock')
      )
    ));
    container.appendChild(card);
    return container;
  }

  function showMockNavGrid() {
    // Build a simple modal-ish overlay showing all item statuses
    const overlay = el('div', { class: 'mock-nav-overlay', onclick: function(e) { if (e.target === this) document.body.removeChild(this); } });
    const inner = el('div', { class: 'mock-nav-inner' });
    inner.appendChild(el('h3', null, 'Item navigation'));
    inner.appendChild(el('p', { class: 'lede' }, `${session.answers.filter(a => a != null).length} of ${session.items.length} answered. Click any item to jump.`));
    const grid = el('div', { class: 'mock-nav-grid' });
    session.items.forEach((_, idx) => {
      const status = session.answers[idx] == null ? 'unanswered' : 'answered';
      grid.appendChild(el('button', {
        class: 'mock-nav-cell ' + status + (idx === session.index ? ' current' : ''),
        onclick: () => { session.index = idx; document.body.removeChild(overlay); render(); }
      }, String(idx + 1)));
    });
    inner.appendChild(grid);
    inner.appendChild(el('button', { class: 'secondary', style: 'margin-top:16px', onclick: () => document.body.removeChild(overlay) }, 'Close'));
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
  }

  function renderMockReview() {
    const correct = session.items.reduce((acc, item, idx) => acc + (session.answers[idx] === item.correctIndex ? 1 : 0), 0);
    const answered = session.answers.filter(a => a != null).length;
    const total = session.items.length;
    const elapsed = Math.min(session.durationMs, Date.now() - session.startedAt);

    const container = el('div');
    const head = el('div', { class: 'completion' });
    head.appendChild(el('h2', null, session.timedOut ? 'Time expired' : 'Mock exam complete'));
    head.appendChild(el('p', null, session.label));
    head.appendChild(el('div', { class: 'score' }, correct + ' / ' + total));
    head.appendChild(el('p', null, `${Math.round(100 * correct / total)}% overall · ${answered}/${total} answered · ${formatRemaining(elapsed)} used`));
    head.appendChild(el('div', { class: 'actions', style: 'justify-content: center;' },
      el('button', { class: 'primary', onclick: () => go('home') }, 'Back to home'),
      el('button', { class: 'secondary', onclick: () => go('stats') }, 'View stats')
    ));
    container.appendChild(head);

    // Per-subsection breakdown
    const subTallies = {};
    session.items.forEach((item, idx) => {
      const s = subTallies[item.subsection] || { total: 0, correct: 0 };
      s.total += 1;
      if (session.answers[idx] === item.correctIndex) s.correct += 1;
      subTallies[item.subsection] = s;
    });
    const subsHeader = el('h2', { style: 'margin-top:32px' }, 'By subsection');
    container.appendChild(subsHeader);
    const grid = el('div', { class: 'stats-grid' });
    BLUEPRINT.domains.forEach(d => d.subsections.forEach(s => {
      const t = subTallies[s.id];
      if (!t) return;
      const acc = t.correct / t.total;
      const cls = acc >= 0.8 ? 'good' : acc < 0.6 ? 'bad' : '';
      grid.appendChild(el('div', { class: 'stat-row' },
        el('div', { class: 'label' },
          el('span', null, `${s.id}. ${s.name}`),
          el('span', { class: 'pct' }, `${Math.round(acc * 100)}% (${t.correct}/${t.total})`)
        ),
        el('div', { class: 'stat-bar' }, el('div', { class: 'fill ' + cls, style: `width: ${acc * 100}%` }))
      ));
    }));
    container.appendChild(grid);

    // Missed items
    const missed = session.items
      .map((item, idx) => ({ item, idx, ans: session.answers[idx] }))
      .filter(r => r.ans !== r.item.correctIndex);
    if (missed.length > 0) {
      container.appendChild(el('h2', { style: 'margin-top:32px' }, `Missed items (${missed.length})`));
      container.appendChild(el('p', { class: 'lede' }, 'Open any item to review the stem, your answer, and the rationale.'));
      const list = el('div', { class: 'domain-list' });
      missed.forEach(r => {
        const expanded = r.idx === session.expandedReviewIdx;
        const row = el('div', { class: 'review-item' });
        row.appendChild(el('button', {
          class: 'review-item-header',
          onclick: () => { session.expandedReviewIdx = expanded ? null : r.idx; render(); }
        },
          el('span', { class: 'dom-id' }, r.item.subsection),
          el('span', { class: 'dom-name' }, (r.ans == null ? '⊘ Unanswered · ' : '✗ ') + r.item.stem.slice(0, 90) + (r.item.stem.length > 90 ? '…' : '')),
          el('span', { class: 'dom-action' }, expanded ? '▾' : '▸')
        ));
        if (expanded) {
          const detail = el('div', { class: 'review-detail' });
          detail.appendChild(el('div', { class: 'item-stem' }, r.item.stem));
          const optsEl = el('div', { class: 'options' });
          const letters = ['a', 'b', 'c', 'd'];
          r.item.options.forEach((opt, i) => {
            let cls = 'option';
            if (i === r.item.correctIndex) cls += ' correct';
            else if (i === r.ans) cls += ' wrong';
            optsEl.appendChild(el('div', { class: cls },
              el('span', { class: 'letter' }, letters[i] + '.'),
              el('span', null, opt)
            ));
          });
          detail.appendChild(optsEl);
          detail.appendChild(renderRationale(r.item));
          // Inline flag toggle for mock review
          const isFlagged = !!state.flagged.find(f => f.itemId === r.item.source.id);
          detail.appendChild(el('div', { class: 'actions', style: 'margin-top:14px' },
            el('button', {
              class: 'secondary' + (isFlagged ? ' flagged' : ''),
              onclick: () => toggleFlag(r.item.source)
            }, isFlagged ? '⚑ Flagged for revision' : '⚐ Flag for revision')
          ));
          row.appendChild(detail);
        }
        list.appendChild(row);
      });
      container.appendChild(list);
    }

    return container;
  }

  function selectOption(i) {
    if (session.answered) return;
    session.selectedIndex = i;
    render();
  }

  function renderActions(item) {
    const flagged = state.flagged.find(f => f.itemId === item.id);
    const useConfidence = state.prefs.confidenceRating;
    return el('div', { class: 'actions' },
      el('div', null,
        el('button', {
          class: 'secondary' + (flagged ? ' flagged' : ''),
          onclick: () => toggleFlag(item)
        }, flagged ? '⚑ Flagged' : '⚐ Flag item')
      ),
      el('div', { class: 'submit-cluster' },
        session.answered
          ? el('button', { class: 'primary', onclick: nextItem }, session.index + 1 < session.items.length ? 'Next →' : 'Finish')
          : (useConfidence
              ? el('div', { class: 'confidence-buttons' },
                  el('button', { class: 'primary confidence-btn sure', disabled: session.selectedIndex == null, onclick: () => submitAnswer('sure'), title: 'Submit — I am sure' }, 'Sure'),
                  el('button', { class: 'primary confidence-btn probable', disabled: session.selectedIndex == null, onclick: () => submitAnswer('probable'), title: 'Submit — probably correct' }, 'Probably'),
                  el('button', { class: 'primary confidence-btn guess', disabled: session.selectedIndex == null, onclick: () => submitAnswer('guess'), title: 'Submit — I am guessing' }, 'Guess')
                )
              : el('button', { class: 'primary', disabled: session.selectedIndex == null, onclick: () => submitAnswer(null) }, 'Submit')
            )
      )
    );
  }

  function toggleFlag(item) {
    const existingIdx = state.flagged.findIndex(f => f.itemId === item.id);
    if (existingIdx >= 0) state.flagged.splice(existingIdx, 1);
    else state.flagged.push({ itemId: item.id, ts: Date.now() });
    saveState();
    render();
  }

  function submitAnswer(confidence) {
    if (session.selectedIndex == null) return;
    const item = session.items[session.index];
    const isCorrect = session.selectedIndex === item.correctIndex;
    session.results.push({ itemId: item.id, correct: isCorrect, selected: session.selectedIndex, confidence });
    session.answered = true;
    session.lastConfidence = confidence;
    // Update subsection stats
    const s = state.stats[item.subsection] || { seen: 0, correct: 0 };
    s.seen += 1;
    if (isCorrect) s.correct += 1;
    state.stats[item.subsection] = s;
    // Update per-tag stats (use source.tags for the wrapped item)
    const tags = (item.source && item.source.tags) || item.tags || [];
    tags.forEach(t => {
      const ts = state.tagStats[t] || { seen: 0, correct: 0 };
      ts.seen += 1;
      if (isCorrect) ts.correct += 1;
      state.tagStats[t] = ts;
    });
    // Update spaced repetition (box advances on correct, resets on miss)
    updateSR(item.id, isCorrect);
    // Record calibration if confidence was given
    if (confidence) recordCalibration(item.id, confidence, isCorrect);
    saveState();
    render();
  }

  function nextItem() {
    session.index += 1;
    session.answered = false;
    session.selectedIndex = null;
    render();
  }

  function renderRationale(item) {
    const letters = ['a', 'b', 'c', 'd'];
    const wrap = el('div', { class: 'rationale' });
    const source = item.source;
    wrap.appendChild(el('h4', null, 'Why ' + letters[item.correctIndex] + ' is correct'));
    wrap.appendChild(el('div', { class: 'correct-rationale' }, source.rationale.correct));
    wrap.appendChild(el('h4', null, 'Why the others are wrong'));
    item.options.forEach((_, displayIdx) => {
      if (displayIdx === item.correctIndex) return;
      const sourceIdx = item.displayToSource[displayIdx];
      const r = source.rationale.distractors[sourceIdx];
      if (!r) return;
      const div = el('div', { class: 'distractor-rationale' },
        el('span', { class: 'letter' }, letters[displayIdx] + '.'),
        document.createTextNode(r)
      );
      wrap.appendChild(div);
    });
    if (source.lawCitation) wrap.appendChild(el('div', { class: 'citation' }, '📖 ' + source.lawCitation));
    wrap.appendChild(renderNoteEditor(source.id));
    return wrap;
  }

  function renderNoteEditor(itemId) {
    const note = (state.notes && state.notes[itemId]) || { text: '', updatedAt: 0 };
    const noteWrap = el('div', { class: 'note-editor' });
    noteWrap.appendChild(el('h4', null, '📝 Your note'));
    const textarea = el('textarea', {
      class: 'note-textarea',
      placeholder: 'Add a personal note about this item — a mnemonic, a key concept, a connection to another item, or something to remember…',
      rows: '3'
    });
    textarea.value = note.text;
    textarea.addEventListener('blur', () => {
      const text = textarea.value.trim();
      if (!state.notes) state.notes = {};
      if (text) {
        state.notes[itemId] = { text, updatedAt: Date.now() };
      } else if (state.notes[itemId]) {
        delete state.notes[itemId];
      }
      saveState();
    });
    noteWrap.appendChild(textarea);
    if (note.updatedAt > 0) {
      const d = new Date(note.updatedAt);
      noteWrap.appendChild(el('div', { class: 'note-meta' }, `Last updated ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`));
    }
    return noteWrap;
  }

  function renderCompletion() {
    const correct = session.results.filter(r => r.correct).length;
    const total = session.results.length;
    const pct = total > 0 ? Math.round(100 * correct / total) : 0;
    // Record activity once when the user reaches the completion screen.
    if (!session.activityRecorded && total > 0) {
      recordActivity(session.label || 'Practice', total, correct);
      session.activityRecorded = true;
      saveState();
    }
    const c = el('div', { class: 'completion' });
    c.appendChild(el('h2', null, 'Session complete'));
    c.appendChild(el('p', null, session.label));
    c.appendChild(el('div', { class: 'score' }, correct + ' / ' + total));
    c.appendChild(el('p', null, pct + '% correct'));
    c.appendChild(el('div', { class: 'actions', style: 'justify-content: center;' },
      el('button', { class: 'primary', onclick: () => go('home') }, 'Back to home'),
      el('button', { class: 'secondary', onclick: () => go('stats') }, 'View stats'),
      el('button', { class: 'secondary', onclick: () => go('activity') }, 'View activity')
    ));
    return c;
  }

  function renderStats() {
    const c = el('div');
    c.appendChild(el('h2', null, 'Performance by subsection'));
    c.appendChild(el('p', { class: 'lede' }, 'Built from your answers across all sessions. The adaptive mode upweights subsections where your accuracy is below 80%.'));
    const grid = el('div', { class: 'stats-grid' });
    let anyStats = false;
    BLUEPRINT.domains.forEach(d => {
      d.subsections.forEach(s => {
        const stat = state.stats[s.id];
        if (!stat || stat.seen === 0) return;
        anyStats = true;
        const acc = stat.correct / stat.seen;
        const cls = acc >= 0.8 ? 'good' : acc < 0.6 ? 'bad' : '';
        grid.appendChild(el('div', { class: 'stat-row' },
          el('div', { class: 'label' },
            el('span', null, `${s.id}. ${s.name}`),
            el('span', { class: 'pct' }, `${Math.round(acc * 100)}% (${stat.correct}/${stat.seen})`)
          ),
          el('div', { class: 'stat-bar' }, el('div', { class: 'fill ' + cls, style: `width: ${acc * 100}%` }))
        ));
      });
    });
    if (!anyStats) c.appendChild(el('div', { class: 'empty-state' }, 'No stats yet. Take a session to populate this view.'));
    else c.appendChild(grid);

    // Per-tag stats — accuracy by concept tag
    const tagEntries = Object.entries(state.tagStats || {})
      .filter(([_, v]) => v.seen >= 3) // need 3+ attempts for meaningful signal
      .sort((a, b) => (a[1].correct / a[1].seen) - (b[1].correct / b[1].seen)); // weakest first
    if (tagEntries.length > 0) {
      c.appendChild(el('h2', { style: 'margin-top:32px' }, 'Performance by concept (tag)'));
      c.appendChild(el('p', { class: 'lede' }, 'Accuracy on items grouped by concept tag. Sorted weakest first. Tags appear here after you have answered 3+ items carrying that tag.'));
      const tagGrid = el('div', { class: 'stats-grid' });
      tagEntries.slice(0, 15).forEach(([tag, t]) => {
        const acc = t.correct / t.seen;
        const cls = acc >= 0.8 ? 'good' : acc < 0.6 ? 'bad' : '';
        tagGrid.appendChild(el('div', { class: 'stat-row' },
          el('div', { class: 'label' },
            el('span', null, tag),
            el('span', { class: 'pct' }, `${Math.round(acc * 100)}% (${t.correct}/${t.seen})`)
          ),
          el('div', { class: 'stat-bar' }, el('div', { class: 'fill ' + cls, style: `width: ${acc * 100}%` }))
        ));
      });
      c.appendChild(tagGrid);
      if (tagEntries.length > 15) {
        c.appendChild(el('p', { style: 'font-size: 12px; color: var(--text-dim); margin-top: 8px;' }, `Showing the 15 weakest. ${tagEntries.length - 15} more tags also tracked.`));
      }
    }

    // Calibration display (confidence vs accuracy)
    const cal = calibrationSummary();
    const calTotal = cal.sure.total + cal.probable.total + cal.guess.total;
    if (calTotal > 0) {
      c.appendChild(el('h2', { style: 'margin-top:32px' }, 'Calibration'));
      c.appendChild(el('p', { class: 'lede' }, 'How often you were right at each confidence level. Well-calibrated readers are right ~90% of "sure" calls, ~70% of "probably," and ~40-50% of "guess." Large gaps reveal where to focus.'));
      const calGrid = el('div', { class: 'stats-grid' });
      ['sure', 'probable', 'guess'].forEach(level => {
        const t = cal[level];
        if (t.total === 0) return;
        const acc = t.correct / t.total;
        const cls = acc >= 0.7 ? 'good' : acc < 0.4 ? 'bad' : '';
        const labelMap = { sure: 'Sure', probable: 'Probably', guess: 'Guess' };
        calGrid.appendChild(el('div', { class: 'stat-row' },
          el('div', { class: 'label' },
            el('span', null, labelMap[level]),
            el('span', { class: 'pct' }, `${Math.round(acc * 100)}% (${t.correct}/${t.total})`)
          ),
          el('div', { class: 'stat-bar' }, el('div', { class: 'fill ' + cls, style: `width: ${acc * 100}%` }))
        ));
      });
      c.appendChild(calGrid);

      // Overconfident-wrong items (study priority)
      const overconfident = overconfidentWrongItems();
      if (overconfident.length > 0) {
        c.appendChild(el('h2', { style: 'margin-top:24px' }, `Overconfident wrong (${overconfident.length})`));
        c.appendChild(el('p', { class: 'lede' }, 'Items you rated "Sure" or "Probably" but got wrong on your most recent attempt. Highest-priority study targets — these are knowledge gaps you don\'t yet know you have.'));
        c.appendChild(el('div', { class: 'actions' },
          el('button', {
            class: 'primary',
            onclick: () => {
              const items = overconfident
                .map(o => BANK.find(b => b.id === o.itemId))
                .filter(Boolean);
              if (items.length === 0) { alert('No overconfident-wrong items in the bank.'); return; }
              startSession(items, 'Overconfident-wrong review');
            }
          }, 'Review these items')
        ));
        const list = el('div', { class: 'domain-list', style: 'margin-top: 12px;' });
        overconfident.slice(0, 20).forEach(o => {
          const item = BANK.find(b => b.id === o.itemId);
          if (!item) return;
          list.appendChild(el('div', { class: 'domain-row' },
            el('span', { class: 'dom-id' }, item.subsection),
            el('span', { class: 'dom-name' }, `[${o.lastCall.confidence}] ${item.stem.slice(0, 80)}${item.stem.length > 80 ? '…' : ''}`)
          ));
        });
        if (overconfident.length > 20) {
          list.appendChild(el('div', { class: 'empty-state', style: 'padding: 8px;' }, `… and ${overconfident.length - 20} more`));
        }
        c.appendChild(list);
      }
    }

    // Spaced repetition queue summary
    const sr = srCounts();
    const srTotal = sr.due + sr.scheduled + sr.mastered;
    if (srTotal > 0) {
      c.appendChild(el('h2', { style: 'margin-top:32px' }, 'Spaced repetition'));
      c.appendChild(el('p', { class: 'lede' }, 'Items move through 5 boxes as you get them right. Each box has a longer review interval: 1d → 3d → 7d → 14d → 30d. A miss resets the box to 1.'));
      const srGrid = el('div', { class: 'stats-grid' });
      srGrid.appendChild(el('div', { class: 'stat-row' },
        el('div', { class: 'label' },
          el('span', null, 'Due for review now'),
          el('span', { class: 'pct' }, String(sr.due))
        ),
      ));
      srGrid.appendChild(el('div', { class: 'stat-row' },
        el('div', { class: 'label' },
          el('span', null, 'Scheduled for later'),
          el('span', { class: 'pct' }, String(sr.scheduled))
        ),
      ));
      srGrid.appendChild(el('div', { class: 'stat-row' },
        el('div', { class: 'label' },
          el('span', null, 'In top box (30d interval)'),
          el('span', { class: 'pct' }, String(sr.mastered))
        ),
      ));
      c.appendChild(srGrid);
    }

    c.appendChild(el('div', { style: 'margin-top: 32px;' },
      el('button', { class: 'secondary', onclick: resetStats }, 'Reset performance stats'),
      ' ',
      el('button', { class: 'secondary', onclick: resetSR }, 'Reset spaced-rep queue'),
      ' ',
      el('button', { class: 'secondary', onclick: resetCalibration }, 'Reset calibration')
    ));
    return c;
  }

  function resetCalibration() {
    if (confirm('Reset calibration history? Performance stats, SR queue, and flags will be kept.')) {
      state.calibration = {};
      saveState();
      render();
    }
  }

  function resetStats() {
    if (confirm('Reset all performance stats (subsection and tag)? Flagged items and spaced-rep queue will be kept.')) {
      state.stats = {};
      state.tagStats = {};
      saveState();
      render();
    }
  }

  function resetSR() {
    if (confirm('Reset the spaced-rep queue? Items will need to be seen again to re-enter the queue. Performance stats and flags will be kept.')) {
      state.sr = {};
      saveState();
      render();
    }
  }

  function renderFlagged() {
    const c = el('div');
    c.appendChild(el('h2', null, 'Flagged items'));
    const notedItemIds = Object.keys(state.notes || {});
    if (state.flagged.length === 0 && notedItemIds.length === 0) {
      c.appendChild(el('div', { class: 'empty-state' }, 'Nothing flagged or noted. Flag items during a session to revisit them here, or add notes via the rationale section after answering.'));
      return c;
    }
    if (state.flagged.length > 0) {
      c.appendChild(el('p', { class: 'lede' }, `${state.flagged.length} items flagged. Use these to review weak areas or mark items that read as off-voice for revision.`));
      c.appendChild(el('div', { class: 'actions' },
        el('button', { class: 'primary', onclick: () => startSession(buildFlaggedSession(), 'Flagged items') }, 'Review flagged'),
        el('button', { class: 'secondary', onclick: exportFlagged }, 'Export flagged list')
      ));
    }
    if (state.flagged.length > 0) {
      const list = el('div', { class: 'domain-list', style: 'margin-top: 16px;' });
      state.flagged.forEach(f => {
        const item = BANK.find(b => b.id === f.itemId);
        if (!item) return;
        list.appendChild(el('div', { class: 'domain-row' },
          el('span', { class: 'dom-id' }, item.subsection),
          el('span', { class: 'dom-name' }, item.stem.slice(0, 90) + (item.stem.length > 90 ? '…' : '')),
          el('span', null, ''),
          el('span', null, ''),
          el('button', { class: 'dom-action', onclick: () => toggleFlag(item) }, 'Unflag')
        ));
      });
      c.appendChild(list);
    }

    // Items with user notes — separate list
    if (notedItemIds.length > 0) {
      c.appendChild(el('h2', { style: 'margin-top: 32px;' }, `Your notes (${notedItemIds.length})`));
      c.appendChild(el('p', { class: 'lede' }, 'Items where you have attached a personal note. Click any item to drill it (the note appears in the rationale after answering).'));
      const noteList = el('div', { class: 'note-list' });
      notedItemIds.forEach(itemId => {
        const item = BANK.find(b => b.id === itemId);
        if (!item) return;
        const note = state.notes[itemId];
        const card = el('div', { class: 'note-card' });
        card.appendChild(el('div', { class: 'note-card-header' },
          el('span', { class: 'dom-id' }, item.subsection),
          el('span', { class: 'note-card-stem' }, item.stem.slice(0, 110) + (item.stem.length > 110 ? '…' : '')),
          el('button', { class: 'dom-action', onclick: () => startSession([item], 'Note review') }, 'Drill')
        ));
        card.appendChild(el('div', { class: 'note-card-text' }, note.text));
        noteList.appendChild(card);
      });
      c.appendChild(noteList);
    }

    return c;
  }

  function exportFlagged() {
    const data = state.flagged.map(f => {
      const item = BANK.find(b => b.id === f.itemId);
      return { id: f.itemId, ts: f.ts, subsection: item?.subsection, stem: item?.stem };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lmft-flagged-review.json';
    a.click();
  }

  function exportBank() {
    // Export full question bank as a single JSON file for backup, sharing,
    // or external editing. Includes all source-side data (no UI state).
    const payload = {
      exported: new Date().toISOString(),
      itemCount: BANK.length,
      blueprint: BLUEPRINT,
      items: BANK
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lmft-bank-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function exportState() {
    // Export user state (stats, SR, calibration, flags, activity) so the user
    // can move their progress between machines or back it up.
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lmft-state-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importState() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON shape');
          if (!confirm('Replace current progress with the imported state? This cannot be undone.')) return;
          state = Object.assign(defaultState(), parsed);
          state.prefs = Object.assign(defaultState().prefs, parsed.prefs || {});
          saveState();
          render();
          alert('State imported.');
        } catch (err) {
          alert('Import failed: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // -------- REFERENCE VIEW (CA statutes & key thresholds) --------
  const REFERENCE_DATA = [
    {
      group: 'Confidentiality and Privilege',
      entries: [
        {
          title: 'Psychotherapist-patient privilege',
          citation: 'Cal. Evidence Code §§ 1010-1015',
          summary: 'Privilege belongs to the patient. The therapist asserts privilege on behalf of the patient unless waived. An attorney-issued subpoena does NOT alone override the privilege — a court order or signed authorization is required to compel disclosure.'
        },
        {
          title: 'Limits to confidentiality — informed-consent disclosures',
          citation: 'CAMFT Code of Ethics 1.2; Cal. B&P Code § 4982',
          summary: 'Therapist must inform clients of limits at the outset. Standard limits in California: mandated reporting (child, elder/dependent-adult, suspected abuse), Tarasoff duty to protect identifiable victims, court orders, and danger to self requiring 5150.'
        },
        {
          title: 'Confidentiality of Medical Information Act (CMIA)',
          citation: 'Cal. Civ. Code §§ 56-56.37',
          summary: 'California\'s medical-information confidentiality law. CMIA is generally MORE protective than HIPAA — providers must follow the stricter standard. Authorizations to release records must be specific (purpose, recipient, expiration). Distinct from HIPAA notice requirements.'
        }
      ]
    },
    {
      group: 'Mandated Reporting',
      entries: [
        {
          title: 'Child Abuse and Neglect Reporting Act (CANRA)',
          citation: 'Cal. Penal Code §§ 11164-11174.3',
          summary: 'LMFTs are mandated reporters. Standard: reasonable suspicion based on facts that, in light of professional training and experience, lead to such suspicion. Report by phone as soon as practicable and submit written follow-up within 36 hours. Categories: physical abuse, sexual abuse, neglect, willful cruelty, unjustifiable mental suffering. Failure to report = misdemeanor.'
        },
        {
          title: 'Elder and Dependent Adult Abuse Reporting',
          citation: 'Cal. Welf. & Inst. Code § 15630',
          summary: 'LMFTs are mandated reporters of suspected physical abuse, neglect, financial abuse, abandonment, isolation, abduction, or other treatment resulting in physical harm or mental suffering of an elder (65+) or dependent adult. Phone report immediately or as soon as practicable; written follow-up within 2 working days.'
        },
        {
          title: 'Tarasoff / Duty to Protect',
          citation: 'Cal. Civ. Code § 43.92; Tarasoff v. Regents (1976); Ewing v. Goldstein (2004)',
          summary: 'Therapist has duty to protect when a patient communicates a serious threat of physical violence against a reasonably identifiable victim. Discharge of duty: warn the intended victim AND notify law enforcement. Ewing extended this to threats communicated by family members of the patient. Statute provides immunity for good-faith communications made to discharge the duty.'
        }
      ]
    },
    {
      group: 'Crisis and Involuntary Holds',
      entries: [
        {
          title: 'LPS Act — 5150 hold',
          citation: 'Cal. Welf. & Inst. Code § 5150',
          summary: 'Up to 72-hour involuntary hold for evaluation and treatment of a person who, as a result of a mental health disorder, is a danger to self, danger to others, OR gravely disabled. Designated officers (peace officers, designated mental health professionals) initiate; LMFTs generally do not initiate but may evaluate and refer for evaluation.'
        },
        {
          title: '5585 — Minor hold',
          citation: 'Cal. Welf. & Inst. Code § 5585',
          summary: 'The minor-specific equivalent of 5150. Up to 72-hour involuntary hold for a minor who, as a result of a mental disorder, is a danger to self, others, or gravely disabled.'
        },
        {
          title: 'Gravely disabled — meaning',
          citation: 'Cal. Welf. & Inst. Code § 5008(h)',
          summary: 'Unable to provide for basic personal needs of food, clothing, or shelter due to a mental health disorder. (As amended by SB 43, effective 2024, the definition expanded to also include severe substance use disorder. Implementation timelines vary by county.)'
        }
      ]
    },
    {
      group: 'Minor Consent',
      entries: [
        {
          title: 'Minor consent to outpatient mental health',
          citation: 'Cal. Family Code § 6924',
          summary: 'A minor 12 or older may consent to outpatient mental health treatment or counseling without parental consent IF (1) the minor is mature enough to participate intelligently in the treatment AND (2) the minor would present a danger of serious physical or mental harm to self or others without the services OR is the alleged victim of incest or child abuse. Provider must involve parent/guardian unless documented as inappropriate.'
        },
        {
          title: 'Minor consent — substance abuse and sexual assault',
          citation: 'Cal. Family Code §§ 6929, 6927',
          summary: '§6929: minor 12+ may consent to drug- or alcohol-related counseling and treatment. §6927: minor 12+ may consent to medical care and counseling for sexual assault, without parental consent or notification.'
        }
      ]
    },
    {
      group: 'LMFT Practice and Scope',
      entries: [
        {
          title: 'LMFT scope of practice',
          citation: 'Cal. B&P Code § 4980.02',
          summary: 'The practice of MFT includes assessment of, and counseling, premarital, marital, family, and divorce counseling; the application of psychotherapeutic and counseling techniques; the use of psychotherapeutic techniques to help individuals, couples, and families. Does NOT include prescribing medication or independent psychological testing within psychologist scope.'
        },
        {
          title: 'Supervision and AMFT scope',
          citation: 'Cal. B&P Code §§ 4980.03, 4980.43',
          summary: 'AMFTs (Associate MFTs) must be supervised by qualified LMFT (or licensed psychologist, LCSW, LPCC, psychiatrist, etc.). Supervisor is responsible for the AMFT\'s clinical work and must ensure work is within scope. AMFTs must inform clients of supervised status and supervisor identity.'
        },
        {
          title: 'Unprofessional conduct',
          citation: 'Cal. B&P Code § 4982',
          summary: 'Grounds for board discipline include: gross negligence or incompetence; sexual contact with client (current or within 2 years of termination per §4982(o) and related); paying or accepting consideration for client referrals; impairment due to substance abuse; conviction of substantially-related crime; false advertising; misrepresentation; failure to maintain records.'
        },
        {
          title: 'Records retention',
          citation: 'Cal. B&P Code § 4980.49',
          summary: 'LMFTs must retain clinical records for a minimum of 7 years from the date of last service. For minor patients, retain for 7 years after the patient reaches age 18 (i.e., until at least age 25).'
        }
      ]
    }
  ];

  function renderActivity() {
    const c = el('div');
    const summary = activitySummary();
    c.appendChild(el('h2', null, 'Activity'));
    c.appendChild(el('p', { class: 'lede' }, 'Records of completed sessions. Shows what you have done, not what you have missed — designed to make practice visible without adding pressure.'));

    if (summary.totalSessions === 0) {
      c.appendChild(el('div', { class: 'empty-state' }, 'No sessions yet. Take a session and your activity will appear here.'));
      return c;
    }

    // Exam countdown + paced target (only shows if exam date is set)
    const examDate = state.prefs.examDate;
    if (examDate) {
      const exam = new Date(examDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0,0,0,0);
      const daysLeft = Math.ceil((exam - today) / 86400000);
      const weeksLeft = Math.max(0, Math.ceil(daysLeft / 7));
      // Target: cover bank ~2x in remaining weeks (so user sees each item ~2x average)
      const targetPerWeek = weeksLeft > 0 ? Math.ceil((BANK.length * 2) / weeksLeft) : 0;
      const currentWeekPace = summary.weekItems;
      const onTrack = currentWeekPace >= targetPerWeek * 0.7;
      const countdown = el('div', { class: 'exam-countdown' + (daysLeft < 0 ? ' past' : '') });
      if (daysLeft < 0) {
        countdown.appendChild(el('div', { class: 'countdown-label' }, 'Exam date passed'));
        countdown.appendChild(el('div', { class: 'countdown-detail' }, `Set to ${exam.toLocaleDateString()}. Update or clear below.`));
      } else if (daysLeft === 0) {
        countdown.appendChild(el('div', { class: 'countdown-label' }, 'Exam today'));
        countdown.appendChild(el('div', { class: 'countdown-detail' }, 'Good luck — you\'ve got this.'));
      } else {
        countdown.appendChild(el('div', { class: 'countdown-label' }, `${daysLeft} day${daysLeft === 1 ? '' : 's'} until exam (${weeksLeft} week${weeksLeft === 1 ? '' : 's'})`));
        countdown.appendChild(el('div', { class: 'countdown-detail' },
          `Suggested pace to see each item ~2x: ${targetPerWeek} items/week · You did ${currentWeekPace} this week · ${onTrack ? 'On track.' : currentWeekPace === 0 ? 'No items yet this week.' : 'Below target pace.'}`
        ));
      }
      c.appendChild(countdown);
    }

    // Top-line cumulative numbers
    const headStats = el('div', { class: 'activity-headline' });
    headStats.appendChild(activityStatCard('Sessions', String(summary.totalSessions), 'all time'));
    headStats.appendChild(activityStatCard('Items practiced', String(summary.cumulativeItems), 'all time'));
    headStats.appendChild(activityStatCard('Items this week', String(summary.weekItems), `${summary.weekSessions} session${summary.weekSessions === 1 ? '' : 's'}`));
    headStats.appendChild(activityStatCard('Accuracy this week', summary.weekItems > 0 ? `${Math.round(100 * summary.weekCorrect / summary.weekItems)}%` : '—', 'rolling 7 days'));
    c.appendChild(headStats);

    // Optional weekly goal + exam date
    c.appendChild(el('h3', { class: 'ref-group' }, 'Targets (optional)'));
    const goalConfig = el('div', { class: 'config' });
    goalConfig.appendChild(el('label', null,
      'Items per week (0 to disable): ',
      el('input', {
        type: 'number', min: '0', max: '500', step: '5',
        value: state.prefs.weeklyGoal || 0,
        onchange: (e) => { state.prefs.weeklyGoal = parseInt(e.target.value) || 0; saveState(); render(); }
      })
    ));
    goalConfig.appendChild(el('label', null,
      'Exam date (for countdown and paced target): ',
      el('input', {
        type: 'date',
        value: state.prefs.examDate || '',
        onchange: (e) => { state.prefs.examDate = e.target.value; saveState(); render(); }
      })
    ));
    if (state.prefs.weeklyGoal > 0) {
      const pct = Math.min(100, Math.round(100 * summary.weekItems / state.prefs.weeklyGoal));
      goalConfig.appendChild(el('div', { class: 'stat-row', style: 'margin-top:8px' },
        el('div', { class: 'label' },
          el('span', null, `Toward this week's goal of ${state.prefs.weeklyGoal}`),
          el('span', { class: 'pct' }, `${summary.weekItems} (${pct}%)`)
        ),
        el('div', { class: 'stat-bar' }, el('div', { class: 'fill good', style: `width: ${pct}%` }))
      ));
      goalConfig.appendChild(el('p', { style: 'font-size: 12px; color: var(--text-dim); margin-top: 8px;' },
        'Rolling 7-day window. Missing the target one week is not held against you the next week — the count just resets to the new 7-day window.'
      ));
    }
    c.appendChild(goalConfig);

    // Accuracy trend across recent sessions
    const recentForTrend = state.activity.slice(-20);
    if (recentForTrend.length >= 3) {
      c.appendChild(el('h3', { class: 'ref-group' }, 'Accuracy across recent sessions'));
      const trendWrap = el('div', { class: 'accuracy-trend' });
      // Build bars manually as styled divs (no SVG dependency)
      const maxBarHeight = 60;
      recentForTrend.forEach((a, idx) => {
        const acc = a.items > 0 ? a.correct / a.items : 0;
        const height = Math.max(2, Math.round(acc * maxBarHeight));
        const cls = acc >= 0.8 ? 'good' : acc < 0.6 ? 'bad' : '';
        const d = new Date(a.ts);
        const label = `${d.toLocaleDateString()} · ${a.correct}/${a.items} (${Math.round(acc * 100)}%) · ${a.mode}`;
        trendWrap.appendChild(el('div', { class: 'trend-col', title: label },
          el('div', { class: 'trend-bar ' + cls, style: `height: ${height}px` }),
          el('div', { class: 'trend-label' }, String(idx + 1))
        ));
      });
      c.appendChild(trendWrap);
      // Rolling average accuracy
      const totalItems = recentForTrend.reduce((s, a) => s + a.items, 0);
      const totalCorrect = recentForTrend.reduce((s, a) => s + a.correct, 0);
      const avgPct = totalItems > 0 ? Math.round(100 * totalCorrect / totalItems) : 0;
      c.appendChild(el('p', { style: 'font-size: 12px; color: var(--text-dim); margin-top: 4px;' },
        `Average across last ${recentForTrend.length} session${recentForTrend.length === 1 ? '' : 's'}: ${avgPct}% · Hover bars for session detail.`
      ));
    }

    // 30-day calendar grid (additive coloring — practice days lit up; no gap-shaming)
    c.appendChild(el('h3', { class: 'ref-group' }, 'Last 30 days'));
    const cal = el('div', { class: 'activity-calendar' });
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const k = dateKey(d.getTime());
      const data = summary.byDay[k];
      const intensity = data ? Math.min(4, Math.floor(data.items / 10)) : -1;
      const cellClass = data ? 'activity-cell active-' + intensity : 'activity-cell';
      const label = data ? `${k}: ${data.items} item${data.items === 1 ? '' : 's'} in ${data.sessions} session${data.sessions === 1 ? '' : 's'}` : `${k}: no sessions`;
      cal.appendChild(el('div', { class: cellClass, title: label }));
    }
    c.appendChild(cal);
    c.appendChild(el('p', { style: 'font-size: 12px; color: var(--text-dim); margin-top: 4px;' }, 'Hover over a cell for the day\'s summary. Color intensifies with more items practiced that day.'));

    // Recent sessions list (last 10)
    c.appendChild(el('h3', { class: 'ref-group' }, 'Recent sessions'));
    const recent = state.activity.slice().reverse().slice(0, 10);
    const list = el('div', { class: 'domain-list' });
    recent.forEach(a => {
      const d = new Date(a.ts);
      const when = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const pct = a.items > 0 ? Math.round(100 * a.correct / a.items) : 0;
      list.appendChild(el('div', { class: 'domain-row' },
        el('span', { class: 'dom-id' }, when),
        el('span', { class: 'dom-name' }, a.mode),
        el('span', { class: 'dom-weight' }, `${a.items} items`),
        el('span', { class: 'dom-count' }, `${pct}%`),
        el('span', null, '')
      ));
    });
    c.appendChild(list);

    // Data management — backup, transfer, reset
    c.appendChild(el('h3', { class: 'ref-group' }, 'Data management'));
    c.appendChild(el('p', { style: 'font-size: 13px; color: var(--text-dim); margin: 0 0 12px;' },
      'Export your progress as JSON for backup or to transfer between machines. Importing replaces the current progress.'
    ));
    c.appendChild(el('div', { style: 'display: flex; gap: 8px; flex-wrap: wrap;' },
      el('button', { class: 'secondary', onclick: exportState }, '↓ Export progress'),
      el('button', { class: 'secondary', onclick: importState }, '↑ Import progress'),
      el('button', { class: 'secondary', onclick: exportBank }, '↓ Export bank (read-only copy)')
    ));
    c.appendChild(el('div', { style: 'margin-top: 24px;' },
      el('button', { class: 'secondary', onclick: resetActivity }, 'Reset activity log')
    ));
    return c;
  }

  function activityStatCard(label, value, sub) {
    return el('div', { class: 'activity-stat' },
      el('div', { class: 'activity-stat-label' }, label),
      el('div', { class: 'activity-stat-value' }, value),
      el('div', { class: 'activity-stat-sub' }, sub)
    );
  }

  function resetActivity() {
    if (confirm('Reset the activity log? Stats, SR queue, calibration, and flags will be kept.')) {
      state.activity = [];
      saveState();
      render();
    }
  }

  // BBS content outline — condensed per-subsection summaries of what each tests.
  // Derived from Pearson VUE Stock# 5805-04 (Effective Jan 1, 2021) task and knowledge statements.
  const CONTENT_OUTLINE_SUMMARIES = {
    '1A': 'Establishing the therapeutic relationship and exploring the reason for therapy. Tests: determining the unit of treatment, establishing rapport, exploring presenting problems, evaluating client goals and motivation, engaging reluctant or involuntary clients, and assessing the impact of prior therapy experiences.',
    '1B': 'Evaluating physical and psychological factors. Tests: mental status examination, assessment of physical/medical conditions and their impact on functioning, treatment compliance, psychotropic medications, substance use and addictive behaviors, and cultural perspectives on mental health.',
    '1C': 'Evaluating developmental, psychosocial, and diversity factors. Tests: developmental milestones, life-stage transitions, academic and employment history, legal-system involvement, military experiences, socioeconomic and psychosocial stressors, religious/spiritual factors, racial/ethnic/cultural identity, and sexual/gender minority experiences.',
    '1D': 'Evaluating interpersonal and family relationships. Tests: social patterns and isolation, interpersonal relationships and conflicts, intimacy and sexual experiences, family-of-origin history and dynamics, and primary support group functioning.',
    '1E': 'Assessing experiences with trauma, abuse, and violence. Tests: trauma and abuse history, grief and loss, aggression and impulse dysregulation, and client strengths and protective factors.',
    '1F': 'Consultations and further evaluations. Tests: administering standardized instruments, consulting with collateral providers, referring for psychiatric evaluation, medical evaluation, psychological/neurocognitive testing, school-based services, and multidisciplinary care.',
    '2A': 'Disorders involving mood, anxiety, and thought. Tests provisional/differential diagnosis of: bipolar and related disorders, depressive disorders, anxiety disorders, obsessive-compulsive and related disorders, trauma- and stressor-related disorders, dissociative disorders, and schizophrenia spectrum/psychotic disorders.',
    '2B': 'Other disorders of clinical significance. Tests provisional/differential diagnosis of: somatic and related disorders, disruptive/impulse-control/conduct disorders, sexual dysfunction disorders, personality disorders, feeding and eating disorders, gender dysphoria, sleep-wake disorders, and substance-related and addictive disorders.',
    '3A': 'Managing imminent danger. Tests: evaluating substance intoxication/overdose/withdrawal as crisis, suicide risk, danger to others (Tarasoff duty to protect), and clinical disposition including involuntary holds (W&I 5150/5585) when criteria are met.',
    '3B': 'Managing effects of crisis exposure or situations. Tests: intimate partner violence safety planning, child/elder/dependent-adult abuse responses, witness-to-violence acute response, trauma/transitional stressors, immigration/migration trauma, and acute disaster response (psychological first aid).',
    '4A': 'Planning therapeutic goals and defining the course of treatment. Tests: establishing measurable goals, defining outcome measures, monitoring therapeutic progress, and maintaining the therapeutic alliance.',
    '4B': 'Implementing theory in treatment. Tests theoretical framework selection and application from: family systems (Bowen, structural, strategic), postmodern approaches (narrative, SFBT), psychodynamic, experiential (Satir, Gestalt), cognitive-behavioral, and integrative/specialized frameworks (IFS, FBT, EMDR).',
    '4C': 'Planning for termination. Tests: indicators of termination readiness, processing the ending, transition planning when therapy ends, and managing therapist-initiated termination (relocation, leave, scope change).',
    '5A': 'Addressing interpersonal, couple, and family relationships. Tests interventions for: attachment, intimacy and sexual interactions, couple cycles and repair, family structure and subsystems, blended families, and intergenerational dynamics.',
    '5B': 'Addressing the impact of grief, trauma, and violence. Tests interventions for: grief and loss (across the lifespan and cultures), trauma processing (after stabilization), and survivors of intimate partner violence or sexual assault.',
    '5C': 'Addressing the impact of physical and psychological issues. Tests interventions for: illness/injury/disability adjustment, treatment compliance, mood/anxiety/emotional dysregulation, body image and eating disorders, and substance use treatment across stages of change.',
    '5D': 'Addressing developmental or psychosocial issues. Tests interventions for: differentiation and identity formation across the lifespan, life-stage transitions, psychosocial stressors, discrimination/microaggression impact, immigration/biculturalism, and minority stress.',
    '5E': 'Applying theory in practice. Tests fidelity-of-application for: CBT (cognitive restructuring, exposure, behavioral activation), EFT, family systems modalities, narrative externalization, SFBT, motivational interviewing, ACT, DBT, IPT, and psychodynamic techniques (transference, free association).',
    '6': 'Managing legal and ethical obligations within the therapeutic relationship. Tests: informed consent, confidentiality and privilege (Cal. Evidence Code §§ 1010-1015), CANRA mandated reporting, elder/dependent-adult abuse reporting, Tarasoff duty to protect, telehealth jurisdiction, dual relationships, court orders vs. subpoenas, records retention (B&P 4980.49), supervision and AMFT scope, fee splitting (B&P 4982(o)), advertising standards, and termination/abandonment.'
  };

  function renderAbout() {
    const c = el('div');
    c.appendChild(el('h2', null, 'About this app'));

    c.appendChild(el('h3', { class: 'ref-group' }, 'What it is'));
    c.appendChild(el('p', { class: 'about-para' }, `An independent, browser-based study tool for the California LMFT Clinical Examination — the 130-scored / 240-minute final exam administered by Pearson VUE on behalf of the BBS. Built to give exam candidates a practical practice tool that mirrors the BBS content blueprint, with adaptive logic and spaced repetition rather than a static question dump.`));

    c.appendChild(el('h3', { class: 'ref-group' }, 'What it is not'));
    c.appendChild(el('ul', { class: 'about-list' },
      el('li', null, 'Not affiliated with the California Board of Behavioral Sciences, Pearson VUE, or any commercial prep vendor.'),
      el('li', null, 'Not a substitute for completing supervised hours, the BBS-published candidate handbook, or the foundational coursework required for licensure.'),
      el('li', null, 'Not a guarantee of exam pass. Practice on this app is one input alongside other study and your accumulated clinical experience.')
    ));

    c.appendChild(el('h3', { class: 'ref-group' }, 'Content sources'));
    c.appendChild(el('p', { class: 'about-para' }, 'Items were authored independently from publicly available sources. Specifically:'));
    c.appendChild(el('ul', { class: 'about-list' },
      el('li', null, 'BBS / Pearson VUE Stock# 5805-04 — Licensed Marriage and Family Therapist Written Clinical Examination Outline (Effective Date January 1, 2021). The content domains, subsection percentages, and task/knowledge statements are publicly published; the blueprint in this app mirrors it.'),
      el('li', null, 'BBS Examination Candidate Handbook (#580500, rev 12/2024) — including the 5 official sample items used as voice-calibration reference.'),
      el('li', null, 'California Business & Professions Code, Civil Code, Welfare & Institutions Code, Penal Code, Family Code, Evidence Code — for law/ethics items grounded in specific California statutes.'),
      el('li', null, 'DSM-5-TR diagnostic criteria — for diagnostic items.'),
      el('li', null, 'Published item-writing literature and professional standards (CAMFT Code of Ethics, AAMFT Code) — for ethics and item-structure guidance.')
    ));
    c.appendChild(el('p', { class: 'about-para' }, 'No leaked, copyrighted, or commercial-prep-vendor content is included. Items were composed for this app and reflect the author\'s clinical and item-writing judgment.'));

    c.appendChild(el('h3', { class: 'ref-group' }, 'Known limitations'));
    c.appendChild(el('ul', { class: 'about-list' },
      el('li', null, 'Bank size: at the current item count, intensive daily practice over 2+ months will repeat items multiple times. Repetition memorization is a real risk past 3-4 passes; pair practice on this app with other resources for variation.'),
      el('li', null, 'Voice fidelity: items approximate the BBS voice but the 5 official BBS sample items are noticeably denser. Voice tightening is ongoing.'),
      el('li', null, 'Law/ethics currency: statutes change. The items reflect California statutes as understood at time of authoring (late 2025 / early 2026). Verify against primary sources for high-stakes content.'),
      el('li', null, 'Diagnostic items: DSM-5-TR criteria can be revised; items reflect criteria as published. The DSM-5-TR Revisions tracker is the authoritative source for any updates.'),
      el('li', null, 'No psychometric calibration: items have not been statistically validated against actual exam performance. Difficulty ratings reflect author judgment, not measured difficulty.')
    ));

    c.appendChild(el('h3', { class: 'ref-group' }, 'Privacy'));
    c.appendChild(el('p', { class: 'about-para' }, `All your progress — stats, spaced-repetition queue, flagged items, calibration history, activity, and notes — is stored in your browser's localStorage. Nothing is sent to a server. The app has no analytics, no account system, and no third-party tracking. Use the Export Progress feature in the Activity tab to back up your state or move it between machines. Clearing your browser site data will erase your progress.`));

    c.appendChild(el('h3', { class: 'ref-group' }, 'Feedback and iteration'));
    c.appendChild(el('p', { class: 'about-para' }, `Items that read off-voice, telegraph the answer, contain factual errors, or land as clinically unrepresentative are flaggable in-app. The bank is intended to be iterated on — flag freely, and revisions will follow.`));

    c.appendChild(el('h3', { class: 'ref-group' }, 'Version'));
    c.appendChild(el('p', { class: 'about-para' }, `${BANK.length} items + ${(window.LMFT_VIGNETTES || []).length} multi-stage crisis vignettes. Content outline effective January 2021 (still current per the BBS rev 12/2024 candidate handbook).`));

    return c;
  }

  function renderContentOutline() {
    const c = el('div');
    c.appendChild(el('h3', { class: 'ref-group' }, 'BBS content outline (condensed)'));
    c.appendChild(el('p', { class: 'lede' }, 'What each domain and subsection tests, derived from Pearson VUE Stock# 5805-04 (Effective Jan 1, 2021). Use this to orient your study and identify gaps in coverage.'));
    BLUEPRINT.domains.forEach(d => {
      const domCard = el('div', { class: 'outline-domain' });
      domCard.appendChild(el('div', { class: 'outline-domain-header' },
        el('span', { class: 'outline-domain-id' }, String(d.id)),
        el('span', { class: 'outline-domain-name' }, d.name),
        el('span', { class: 'outline-domain-weight' }, `${d.weight}%`)
      ));
      d.subsections.forEach(s => {
        const summary = CONTENT_OUTLINE_SUMMARIES[s.id] || '';
        domCard.appendChild(el('div', { class: 'outline-sub' },
          el('div', { class: 'outline-sub-header' },
            el('span', { class: 'outline-sub-id' }, s.id),
            el('span', { class: 'outline-sub-name' }, s.name),
            el('span', { class: 'outline-sub-weight' }, `${s.weight}%`)
          ),
          summary ? el('div', { class: 'outline-sub-summary' }, summary) : null
        ));
      });
      c.appendChild(domCard);
    });
    return c;
  }

  function renderReference() {
    const c = el('div');
    const ref = state.prefs.referenceTab || 'statutes';
    c.appendChild(el('div', { class: 'reference-tabs' },
      el('button', {
        class: 'reference-tab' + (ref === 'statutes' ? ' active' : ''),
        onclick: () => { state.prefs.referenceTab = 'statutes'; saveState(); render(); }
      }, 'Statutes'),
      el('button', {
        class: 'reference-tab' + (ref === 'outline' ? ' active' : ''),
        onclick: () => { state.prefs.referenceTab = 'outline'; saveState(); render(); }
      }, 'Content outline'),
      el('button', {
        class: 'reference-tab' + (ref === 'about' ? ' active' : ''),
        onclick: () => { state.prefs.referenceTab = 'about'; saveState(); render(); }
      }, 'About')
    ));
    if (ref === 'outline') {
      c.appendChild(renderContentOutline());
      return c;
    }
    if (ref === 'about') {
      c.appendChild(renderAbout());
      return c;
    }
    c.appendChild(el('h2', null, 'California statute reference'));
    c.appendChild(el('p', { class: 'lede' }, 'Quick lookup for the CA-specific statutes and standards that the exam tests heavily. Plain-language summaries of key thresholds — read the full statute for the actual language. Not a substitute for legal advice.'));
    REFERENCE_DATA.forEach(group => {
      c.appendChild(el('h3', { class: 'ref-group' }, group.group));
      const list = el('div', { class: 'ref-list' });
      group.entries.forEach(entry => {
        list.appendChild(el('div', { class: 'ref-card' },
          el('div', { class: 'ref-card-title' }, entry.title),
          el('div', { class: 'ref-card-citation' }, entry.citation),
          el('div', { class: 'ref-card-summary' }, entry.summary)
        ));
      });
      c.appendChild(list);
    });
    return c;
  }

  // -------- KEYBOARD SHORTCUTS --------
  // Quiz mode bindings:
  //   1-4 or A-D : select option
  //   Enter / Space : submit (or finish/next if already answered)
  //   Y : submit with "sure" (when confidence on)
  //   M : submit with "probable"
  //   G : submit with "guess"
  //   F : flag/unflag current item
  //   N / →  : next item (after answered)
  //   ← : previous item (mock mode only)
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    // Global: ? opens keyboard help
    if (e.key === '?') {
      e.preventDefault();
      toggleKeyboardHelp();
      return;
    }
    // Escape closes any open overlay
    if (e.key === 'Escape') {
      const overlay = document.querySelector('.keyboard-help-overlay, .mock-nav-overlay');
      if (overlay) { overlay.remove(); return; }
    }

    if (view !== 'quiz' || !session) return;
    if (session.mode === 'mock' && !session.finished) {
      handleMockKey(e);
      return;
    }
    if (session.mode !== 'mock') {
      handlePracticeKey(e);
    }
  });

  function toggleKeyboardHelp() {
    const existing = document.querySelector('.keyboard-help-overlay');
    if (existing) { existing.remove(); return; }
    const overlay = el('div', {
      class: 'keyboard-help-overlay',
      onclick: function(ev) { if (ev.target === this) this.remove(); }
    });
    const inner = el('div', { class: 'keyboard-help-inner' });
    inner.appendChild(el('h3', null, 'Keyboard shortcuts'));
    const groups = [
      { title: 'Practice mode', shortcuts: [
        ['A / B / C / D or 1-4', 'Select option'],
        ['Y / M / G', 'Submit with Sure / probably / Guess (confidence on)'],
        ['Enter / Space', 'Submit (defaults to Probably when confidence is on) or Next when answered'],
        ['N or →', 'Next item (after answered)'],
        ['F', 'Flag / unflag current item']
      ]},
      { title: 'Mock exam mode', shortcuts: [
        ['A / B / C / D or 1-4', 'Toggle answer for current item'],
        ['→ or N', 'Next item'],
        ['← or P', 'Previous item'],
        ['F', 'Flag / unflag current item']
      ]},
      { title: 'Global', shortcuts: [
        ['?', 'Open / close this help'],
        ['Esc', 'Close overlay']
      ]}
    ];
    groups.forEach(g => {
      inner.appendChild(el('div', { class: 'kbd-group-title' }, g.title));
      const tbl = el('div', { class: 'kbd-list' });
      g.shortcuts.forEach(([k, desc]) => {
        tbl.appendChild(el('div', { class: 'kbd-row' },
          el('span', { class: 'kbd' }, k),
          el('span', null, desc)
        ));
      });
      inner.appendChild(tbl);
    });
    inner.appendChild(el('button', { class: 'secondary', style: 'margin-top:16px', onclick: () => overlay.remove() }, 'Close'));
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
  }

  function handlePracticeKey(e) {
    const item = session.items[session.index];
    if (!item) return;
    const key = e.key.toLowerCase();

    // Option selection
    const optionMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    if (optionMap[key] !== undefined && !session.answered) {
      e.preventDefault();
      session.selectedIndex = optionMap[key];
      render();
      return;
    }

    // Confidence-tagged submit
    if (!session.answered && session.selectedIndex != null && state.prefs.confidenceRating) {
      if (key === 'y') { e.preventDefault(); submitAnswer('sure'); return; }
      if (key === 'm') { e.preventDefault(); submitAnswer('probable'); return; }
      if (key === 'g') { e.preventDefault(); submitAnswer('guess'); return; }
    }

    // Submit / next
    if ((key === 'enter' || key === ' ') && session.selectedIndex != null && !session.answered) {
      e.preventDefault();
      if (state.prefs.confidenceRating) {
        // Default to "probable" if user hits enter with confidence on
        submitAnswer('probable');
      } else {
        submitAnswer(null);
      }
      return;
    }
    if ((key === 'enter' || key === ' ' || key === 'n' || key === 'arrowright') && session.answered) {
      e.preventDefault();
      nextItem();
      return;
    }

    // Flag
    if (key === 'f') {
      e.preventDefault();
      toggleFlag(item.source || item);
      return;
    }
  }

  function handleMockKey(e) {
    const item = session.items[session.index];
    if (!item) return;
    const key = e.key.toLowerCase();
    const optionMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    if (optionMap[key] !== undefined) {
      e.preventDefault();
      const i = optionMap[key];
      session.answers[session.index] = (session.answers[session.index] === i ? null : i);
      render();
      return;
    }
    if (key === 'arrowright' || key === 'n') {
      e.preventDefault();
      if (session.index < session.items.length - 1) { session.index += 1; render(); }
      return;
    }
    if (key === 'arrowleft' || key === 'p') {
      e.preventDefault();
      if (session.index > 0) { session.index -= 1; render(); }
      return;
    }
    if (key === 'f') {
      e.preventDefault();
      toggleFlag(item.source || item);
      return;
    }
  }

  // -------- WELCOME OVERLAY (first-run onboarding) --------
  function showWelcomeOverlay() {
    const existing = document.querySelector('.welcome-overlay');
    if (existing) existing.remove();

    const overlay = el('div', {
      class: 'welcome-overlay',
      onclick: function(ev) { if (ev.target === this) this.remove(); }
    });
    const inner = el('div', { class: 'welcome-inner' });

    inner.appendChild(el('h2', { class: 'welcome-title' }, 'Clinical Seat'));
    inner.appendChild(el('p', { class: 'welcome-subtitle' }, `Independent CA LMFT Clinical Exam prep for associates on the path to licensure. ${BANK.length} practice items + branching crisis vignettes. No account, no server — everything stays on your device.`));

    inner.appendChild(el('h3', { class: 'welcome-section' }, 'How to use it'));
    const stepsList = el('div', { class: 'welcome-steps' });
    [
      ['1', 'Set your exam date in the Activity tab', 'Optional but useful — gives you a paced weekly target.'],
      ['2', 'Take a Blueprint mix to calibrate', '20 items proportional to the BBS blueprint. Establishes a baseline across all domains.'],
      ['3', 'Switch to Adaptive after a few sessions', 'After enough data, Adaptive weights toward your weak subsections and pulls in items due for spaced-repetition review.'],
      ['4', 'Try a Mock exam at least twice before your real test', 'Full 130-item timed run. Different cognitive load than 20-item drilling — practice the endurance.'],
      ['5', 'Use the Crisis vignettes for unfolding judgment', 'Multi-stage branching scenarios. Closer to how clinical decisions actually compound.']
    ].forEach(([num, title, desc]) => {
      stepsList.appendChild(el('div', { class: 'welcome-step' },
        el('div', { class: 'welcome-step-num' }, num),
        el('div', { class: 'welcome-step-body' },
          el('div', { class: 'welcome-step-title' }, title),
          el('div', { class: 'welcome-step-desc' }, desc)
        )
      ));
    });
    inner.appendChild(stepsList);

    inner.appendChild(el('h3', { class: 'welcome-section' }, 'Important to know'));
    const disclaimerList = el('ul', { class: 'welcome-disclaimers' });
    [
      'Not affiliated with the California Board of Behavioral Sciences (BBS), Pearson VUE, or any commercial prep vendor.',
      'Items are authored independently from publicly available sources (BBS content outline, California statutes, item-writing literature). No leaked, copyrighted, or commercial content is included.',
      'Performance on this app is a coarse proxy for exam readiness, not a guarantee. Use alongside other study and clinical experience.',
      'Law/ethics items reflect California statutes as understood at time of authoring. Statutes change — verify against primary sources when stakes are high.',
      'All your progress is stored in your browser only. Use the Export feature to back up.'
    ].forEach(text => {
      disclaimerList.appendChild(el('li', null, text));
    });
    inner.appendChild(disclaimerList);

    inner.appendChild(el('div', { class: 'welcome-actions' },
      el('button', {
        class: 'primary',
        onclick: () => {
          state.welcomeShown = true;
          saveState();
          overlay.remove();
        }
      }, 'Get started'),
      el('button', { class: 'secondary', onclick: () => overlay.remove() }, 'Close (show again next time)')
    ));

    overlay.appendChild(inner);
    document.body.appendChild(overlay);
  }

  // -------- BOOT --------
  if (!BLUEPRINT) {
    root.innerHTML = '<div style="padding: 24px; max-width: 600px; color: #e87a7a;">' +
      '<h2 style="color: var(--text); margin-top: 0;">App did not load correctly</h2>' +
      '<p style="color: var(--text-dim);">The content outline (blueprint) failed to load. This usually means the app was opened in a way that prevents script-tag loading of data files.</p>' +
      '<p style="color: var(--text-dim);">Try opening the app via a local web server (e.g., <code>python -m http.server</code> in the lmft-prep directory) and navigating to <code>app/index.html</code>, OR use a browser that allows file:// script loading.</p>' +
      '</div>';
    return;
  }
  if (BANK.length === 0) {
    root.innerHTML = '<div style="padding: 24px; max-width: 600px; color: #e87a7a;">' +
      '<h2 style="color: var(--text); margin-top: 0;">Question bank failed to load</h2>' +
      '<p style="color: var(--text-dim);">The blueprint loaded but no items were registered. The data/questions/*.js files may have failed to load. Check the browser console for errors.</p>' +
      '</div>';
    return;
  }
  render();
  // Show welcome on first run
  if (!state.welcomeShown) {
    showWelcomeOverlay();
  }
})();
