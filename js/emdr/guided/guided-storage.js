/**
 * Guided EMDR clinical state — tab-local draft only (no server PHI)
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    const PREFIX = 'bet-guided-clinical-';
    const DRAFT_KEY = 'bet-guided-draft';

    function defaultSessionMeta() {
        return {
            startedAt: Date.now(),
            lastDownloadAt: null,
            downloadCount: 0,
            optionalLabel: '',
        };
    }

    function defaultClinical() {
        return {
            protocolId: 'standard',
            setupComplete: false,
            protocolLocked: false,
            prong: 'past',
            phaseId: 'setup',
            assessStepIndex: 0,
            targetLabel: '',
            image: '',
            nc: '',
            pc: '',
            voc: 1,
            emotion: '',
            sudInitial: null,
            sudCurrent: null,
            body: '',
            sets: [],
            bodyScanClear: false,
            closureType: null,
            guidanceEnabled: true,
            eventLabel: '',
            pods: [],
            activePodIndex: 0,
            wholeEventSud: null,
            wholeEventSets: [],
            movieRuns: [],
            movieRunCount: 0,
            bumpUsed: false,
            futureSituation: '',
            aspectRecords: [],
            sessionEvents: [],
            sessionMeta: defaultSessionMeta(),
            updatedAt: Date.now(),
        };
    }

    function migrateClinical(data) {
        const base = defaultClinical();
        const merged = { ...base, ...data };
        if (merged.sessionMeta && typeof merged.sessionMeta === 'object') {
            merged.sessionMeta = { ...defaultSessionMeta(), ...merged.sessionMeta };
            if (!merged.sessionMeta.startedAt) merged.sessionMeta.startedAt = Date.now();
        } else {
            merged.sessionMeta = defaultSessionMeta();
        }
        if (merged.setupComplete === undefined || merged.setupComplete === null) {
            merged.setupComplete = merged.phaseId !== 'setup' && merged.phaseId !== undefined;
        }
        if (!merged.phaseId) {
            merged.phaseId = merged.setupComplete ? 'assess' : 'setup';
        }
        if (!Array.isArray(merged.pods)) merged.pods = [];
        if (!Array.isArray(merged.movieRuns)) merged.movieRuns = [];
        if (!Array.isArray(merged.wholeEventSets)) merged.wholeEventSets = [];
        if (!Array.isArray(merged.sets)) merged.sets = [];
        if (!Array.isArray(merged.aspectRecords)) merged.aspectRecords = [];
        if (!Array.isArray(merged.sessionEvents)) merged.sessionEvents = [];
        return merged;
    }

    global.BET.GuidedStorage = {
        DRAFT_KEY,

        key(sessionToken) {
            return PREFIX + (sessionToken || 'local');
        },

        load(sessionToken) {
            if (!sessionToken) {
                return defaultClinical();
            }
            try {
                const raw = sessionStorage.getItem(this.key(sessionToken));
                if (!raw) return defaultClinical();
                return migrateClinical(JSON.parse(raw));
            } catch (e) {
                console.error('[GuidedStorage] load failed', e);
                return defaultClinical();
            }
        },

        loadDraft() {
            try {
                const raw = sessionStorage.getItem(DRAFT_KEY);
                if (!raw) return null;
                return migrateClinical(JSON.parse(raw));
            } catch (e) {
                console.error('[GuidedStorage] loadDraft failed', e);
                return null;
            }
        },

        save(sessionToken, data) {
            const payload = migrateClinical({ ...data, updatedAt: Date.now() });
            if (!sessionToken) {
                return payload;
            }
            try {
                sessionStorage.setItem(this.key(sessionToken), JSON.stringify(payload));
            } catch (e) {
                console.error('[GuidedStorage] save failed', e);
            }
            return payload;
        },

        saveDraft(data) {
            try {
                const payload = migrateClinical({ ...data, updatedAt: Date.now() });
                sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
                return payload;
            } catch (e) {
                console.error('[GuidedStorage] saveDraft failed', e);
                return data;
            }
        },

        clear(sessionToken) {
            if (!sessionToken) return;
            try {
                sessionStorage.removeItem(this.key(sessionToken));
            } catch (e) {
                /* ignore */
            }
        },

        clearDraft() {
            try {
                sessionStorage.removeItem(DRAFT_KEY);
            } catch (e) {
                /* ignore */
            }
        },

        clearAll() {
            try {
                const keys = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const k = sessionStorage.key(i);
                    if (k && (k.startsWith(PREFIX) || k === DRAFT_KEY)) keys.push(k);
                }
                keys.forEach((k) => sessionStorage.removeItem(k));
            } catch (e) {
                /* ignore */
            }
        },

        freshClinical() {
            this.clearAll();
            return this.defaultClinical();
        },

        hasSubstantiveNotes(clinical) {
            if (!clinical) return false;
            if (clinical.setupComplete && clinical.phaseId !== 'setup') return true;
            if (clinical.sets.length || clinical.wholeEventSets.length || clinical.movieRuns.length) {
                return true;
            }
            if (clinical.aspectRecords.length) return true;
            if (clinical.pods.length) return true;
            const fields = [
                clinical.targetLabel,
                clinical.image,
                clinical.nc,
                clinical.pc,
                clinical.emotion,
                clinical.body,
                clinical.eventLabel,
            ];
            return fields.some((f) => typeof f === 'string' && f.trim().length > 0);
        },

        defaultClinical,
        defaultSessionMeta,
        migrateClinical,
    };
})(typeof window !== 'undefined' ? window : global);
