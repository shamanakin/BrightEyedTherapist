/**
 * Canonical app slugs and display labels for admin usage analytics.
 *
 * Tools record a slug at session time; older sessions may use legacy slugs.
 * Display code merges aliases into one logical product (e.g. timeline → lifemap).
 */
const BET_APP_ALIASES = {
    timeline: 'lifemap',
    guided_clarity: 'guidedclarity',
    fear_facer: 'fearfacer',
};

const BET_APP_LABELS = {
    emdr: 'EMDR Suite',
    'emdr-guided': 'EMDR Guided',
    genogram: 'Genogram Genie',
    lifemap: 'Life Map',
    brainspotting: 'Brainspotting',
    guidedclarity: 'Guided Clarity (legacy)',
    notegenie: 'Note Genie (legacy)',
    fearfacer: 'Fear Facer (legacy)',
    website: 'Website / Account',
};

function normalizeAppSlug(slug) {
    if (slug == null || slug === '') return '';
    return BET_APP_ALIASES[slug] || slug;
}

function formatAppDisplayName(slug) {
    const canonical = normalizeAppSlug(slug);
    if (!canonical) return 'Unknown';
    if (BET_APP_LABELS[canonical]) return BET_APP_LABELS[canonical];
    return String(slug)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function aggregateAppUsageCounts(rows) {
    const merged = new Map();
    (rows || []).forEach((row) => {
        const raw = row && row.app_name != null ? String(row.app_name) : '';
        const canonical = normalizeAppSlug(raw) || raw || 'unknown';
        const count = Number.parseInt(row.count, 10);
        merged.set(canonical, (merged.get(canonical) || 0) + (Number.isFinite(count) ? count : 0));
    });
    return Array.from(merged.entries())
        .map(([app_name, count]) => ({ app_name, count }))
        .sort((a, b) => b.count - a.count);
}
