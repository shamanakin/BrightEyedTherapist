/**
 * Present trigger — Standard Phases 3–7 on a current disturbing situation
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const S = () => global.BET.GuidedProtocolShared;

    global.BET.GuidedProtocolPresentTrigger = {
        id: 'present_trigger',
        name: 'Present trigger',
        displayName: 'Present trigger',
        pickerDescription:
            'Second prong: a situation that still disturbs the client now. Same reprocessing flow as standard.',
        prong: 'present',
        desensitizeMode: 'standard',
        startPhase: 'assess',
        allowedPhases: ['setup', 'assess', 'desensitize', 'install', 'bodyScan', 'closure'],
        phases: S().standardPhases37(
            {
                targetPrompt:
                    'Identify the present situation or trigger that still disturbs the client. Brief label:',
                imagePrompt:
                    'When you bring up that situation now, what image or scene represents the worst part?',
                ncPrompt:
                    'What negative belief about yourself goes with that picture in the present?',
                pcPrompt: 'What would you like to believe about yourself instead in this situation?',
                vocPrompt:
                    'How true do those positive words feel now about this situation? (1 = false, 7 = true)',
                emotionPrompt:
                    'What emotion do you feel now when you hold this situation and negative belief together?',
                sudPrompt: 'How disturbing does this feel right now? (0–10)',
                bodyPrompt: 'Where do you feel it in your body right now?',
                beginReprocessingPrompt:
                    'Bring up the present trigger, NC, and body sensation—then begin BLS (Phase 4).',
            },
            {
                startSet: 'Begin a set of BLS. After 20–30 passes, pause: "What are you noticing now about this trigger?"',
                goWithThat: 'Say "Go with that" and begin another set.',
                returnToTarget:
                    'Return to the present trigger: "When you bring up that situation again, what do you notice now?"',
                checkSud: 'Check SUD on the present trigger (0–10). Continue until SUD is 0 or ecological 1, twice.',
                suggestInstall:
                    'Present-trigger desensitization appears complete. Confirm SUD, then proceed to Installation when ready.',
            },
            'Hold the positive cognition and present trigger together during installation sets.',
            'Scan body while holding the present trigger and PC together.'
        ),
    };
})(typeof window !== 'undefined' ? window : global);
