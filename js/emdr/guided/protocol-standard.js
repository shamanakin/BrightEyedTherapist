/**
 * Past memory — Standard EMDR protocol (Phases 3–7)
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const S = () => global.BET.GuidedProtocolShared;

    global.BET.GuidedProtocolStandard = {
        id: 'standard',
        name: 'Standard EMDR',
        displayName: 'Past memory (standard)',
        pickerDescription: 'Classic memory reprocessing: Assessment through Closure on a past target moment.',
        prong: 'past',
        desensitizeMode: 'standard',
        startPhase: 'assess',
        allowedPhases: ['setup', 'assess', 'desensitize', 'install', 'bodyScan', 'closure'],
        phases: S().standardPhases37(
            {
                targetPrompt:
                    'Identify a specific moment in time (not a long period). Brief label for this target:',
                imagePrompt: 'When you bring up that memory, what image represents the worst part?',
                ncPrompt:
                    'What words go best with that picture that express your negative belief about yourself now?',
                pcPrompt:
                    'When you bring up that picture, what would you like to believe about yourself instead?',
                vocPrompt:
                    'How true do those positive words feel now? (1 = completely false, 7 = completely true)',
                emotionPrompt:
                    'What emotion do you feel now when you hold the image and negative belief together?',
                sudPrompt: 'How disturbing does it feel now? (0 = none, 10 = worst imaginable)',
                bodyPrompt: 'Where do you feel it in your body?',
                beginReprocessingPrompt:
                    'Invite the client to bring up the picture, the negative cognition, and body sensation—then begin BLS (Phase 4).',
            },
            null,
            'Hold the positive cognition and memory together during installation sets.',
            null
        ),
    };
})(typeof window !== 'undefined' ? window : global);
