/**
 * EMDR BLS session state — normalize v1/v2, export for API
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const C = () => global.BET.BlsConstants;

    function clampSpeed(speed) {
        const n = parseInt(speed, 10);
        if (n >= 1 && n <= 6) return n;
        return 4;
    }

    function normalizeDotSize(raw) {
        const min = C().DOT_SIZE_MIN;
        const max = C().DOT_SIZE_MAX;
        let px = parseInt(raw, 10);
        if (Number.isNaN(px)) px = C().DOT_SIZE_DEFAULT;
        return Math.max(min, Math.min(max, px));
    }

    function normalizeLightbarScale(raw) {
        const min = C().LIGHTBAR_SCALE_MIN;
        const max = C().LIGHTBAR_SCALE_MAX;
        let scale = parseFloat(raw);
        if (Number.isNaN(scale)) {
            const pct = parseInt(raw, 10);
            scale = Number.isNaN(pct) ? C().LIGHTBAR_SCALE_DEFAULT : pct / 100;
        }
        return Math.round(Math.max(min, Math.min(max, scale)) * 1000) / 1000;
    }

    function dotSizeLabel(px) {
        const n = normalizeDotSize(px);
        const preset = C().SIZE_PRESETS.find((p) => p.px === n);
        if (preset) return preset.label;
        return String(n);
    }

    function pathFromLegacyDirection(direction) {
        return direction === 'diagonal' ? C().PATH_DIAGONAL : C().PATH_HORIZONTAL;
    }

    function legacyDirectionFromPath(path) {
        return path === C().PATH_DIAGONAL ? 'diagonal' : 'lateral';
    }

    function normalizePath(raw, legacyDirection) {
        const valid = [C().PATH_HORIZONTAL, C().PATH_DIAGONAL, C().PATH_SACCADIC];
        if (raw && valid.includes(raw)) return raw;
        if (legacyDirection) return pathFromLegacyDirection(legacyDirection);
        return C().PATH_HORIZONTAL;
    }

    function lightbarPath(path) {
        if (path === C().PATH_DIAGONAL) return C().PATH_DIAGONAL;
        return C().PATH_HORIZONTAL;
    }

    global.BET.BlsSync = {
        normalizeIncomingState(raw) {
            if (!raw || typeof raw !== 'object') {
                return C().defaultState();
            }

            const path = normalizePath(raw.path, raw.direction);
            const pattern = raw.pattern === 'lightbar' ? 'lightbar' : 'dot';
            const effectivePath =
                pattern === 'lightbar' && path === C().PATH_SACCADIC
                    ? C().PATH_HORIZONTAL
                    : path;

            return {
                schemaVersion: C().STATE_SCHEMA_VERSION,
                pattern,
                path: effectivePath,
                speed: clampSpeed(raw.speed),
                dotSize: normalizeDotSize(raw.dotSize),
                lightbarScale: normalizeLightbarScale(
                    raw.lightbarScale != null ? raw.lightbarScale : raw.lightbarScalePct
                ),
                color: raw.color || '#FFFFFF',
                audioEnabled: !!raw.audioEnabled,
                setCount: parseInt(raw.setCount, 10) || 0,
                isRunning: !!raw.isRunning,
                lastEventId: parseInt(raw.lastEventId, 10) || Date.now(),
                direction: legacyDirectionFromPath(effectivePath),
            };
        },

        extractBlsPayload(raw) {
            if (!raw || typeof raw !== 'object') {
                return {};
            }
            if (raw.bls && typeof raw.bls === 'object') {
                return raw.bls;
            }
            return raw;
        },

        exportState(state) {
            const normalized = this.normalizeIncomingState(state);
            return {
                schemaVersion: normalized.schemaVersion,
                pattern: normalized.pattern,
                path: normalized.path,
                speed: normalized.speed,
                dotSize: normalized.dotSize,
                lightbarScale: normalized.lightbarScale,
                color: normalized.color,
                audioEnabled: normalized.audioEnabled,
                setCount: normalized.setCount,
                isRunning: normalized.isRunning,
                lastEventId: normalized.lastEventId,
                direction: normalized.direction,
            };
        },

        exportSessionPayload(state) {
            return {
                schemaVersion: C().STATE_SCHEMA_VERSION,
                bls: this.exportState(state),
            };
        },

        getHalfCycleMs(speedIndex) {
            const cfg = C().SPEED_MAP[clampSpeed(speedIndex)];
            return cfg ? cfg.ms : 750;
        },

        getSpeedIndexFromMs(ms) {
            const entry = Object.entries(C().SPEED_MAP).find(([, cfg]) => cfg.ms === ms);
            return entry ? parseInt(entry[0], 10) : 4;
        },

        lightbarPath,
        legacyDirectionFromPath,
        pathFromLegacyDirection,
        normalizeDotSize,
        normalizeLightbarScale,
        dotSizeLabel,
        clampSpeed,
    };
})(typeof window !== 'undefined' ? window : global);
