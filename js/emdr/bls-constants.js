/**
 * EMDR BLS shared constants — Bright Eyed Therapist
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    global.BET.BlsConstants = {
        STATE_SCHEMA_VERSION: 2,
        TRAVEL_PERCENTAGE: 0.95,
        BAR_THICKNESS: 18,
        LIGHTBAR_DOT_COUNT: 32,
        LIGHTBAR_ELEMENT_DOT_PX: 18,
        SACCADIC_SLOTS: 9,

        PATH_HORIZONTAL: 'horizontal',
        PATH_DIAGONAL: 'diagonal',
        PATH_SACCADIC: 'saccadic',

        DOT_SIZE_MIN: 28,
        DOT_SIZE_MAX: 90,
        DOT_SIZE_DEFAULT: 50,
        LIGHTBAR_SCALE_MIN: 0.88,
        LIGHTBAR_SCALE_MAX: 1.12,
        LIGHTBAR_SCALE_DEFAULT: 1,

        SIZE_PRESETS: [
            { index: 1, px: 28, label: 'XS' },
            { index: 2, px: 36, label: 'S' },
            { index: 3, px: 44, label: 'M' },
            { index: 4, px: 50, label: 'Default' },
            { index: 5, px: 60, label: 'L' },
            { index: 6, px: 72, label: 'XL' },
            { index: 7, px: 90, label: 'XXL' },
        ],

        SPEED_MAP: {
            1: { name: '1. Very Slow (Resourcing)', ms: 2000, desc: 'Slow, for resourcing and stabilization.' },
            2: { name: '2. Slow', ms: 1500, desc: 'Gentle and steady.' },
            3: { name: '3. Medium Slow', ms: 1000, desc: 'Standard slow pace.' },
            4: { name: '4. Medium Fast (Default)', ms: 750, desc: 'Standard processing pace.' },
            5: { name: '5. Fast', ms: 500, desc: 'Rapid processing.' },
            6: { name: '6. Very Fast', ms: 333, desc: 'Maximum speed tolerance.' },
        },

        COLORS_MAP: {
            '#FFFFFF': { name: 'White', class: 'text-white', hex: '#FFFFFF' },
            '#5EEAD4': { name: 'Turquoise', class: 'text-teal-300', hex: '#5EEAD4' },
            '#A5B4FC': { name: 'Lavender', class: 'text-indigo-300', hex: '#A5B4FC' },
            '#FDE047': { name: 'Yellow', class: 'text-yellow-300', hex: '#FDE047' },
        },

        defaultState() {
            return {
                schemaVersion: 2,
                pattern: 'dot',
                path: 'horizontal',
                speed: 4,
                dotSize: 50,
                lightbarScale: 1,
                color: '#FFFFFF',
                audioEnabled: false,
                setCount: 0,
                isRunning: false,
                lastEventId: Date.now(),
            };
        },
    };
})(typeof window !== 'undefined' ? window : global);
