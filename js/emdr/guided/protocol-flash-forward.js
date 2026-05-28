/**
 * Flash forward — worst-case future imagery (present anticipatory anxiety)
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const S = () => global.BET.GuidedProtocolShared;

    global.BET.GuidedProtocolFlashForward = {
        id: 'flash_forward',
        name: 'Flash forward',
        displayName: 'Flash forward',
        pickerDescription:
            'Not future template: desensitize a feared worst-case future image using full Assessment through Closure.',
        prong: 'present',
        desensitizeMode: 'standard',
        startPhase: 'assess',
        allowedPhases: ['setup', 'assess', 'desensitize', 'install', 'bodyScan', 'closure'],
        phases: S().standardPhases37(
            {
                targetPrompt:
                    'Label the feared future scenario (push toward the worst realistic outcome the client imagines):',
                imagePrompt:
                    'What is the worst-case image or thought about the future? Encourage the client to go to the absolute worst they fear.',
                ncPrompt: 'What negative belief about yourself goes with that feared future image?',
                pcPrompt: 'What positive belief would you like to have instead about yourself in that scenario?',
                vocPrompt: 'How true does the positive belief feel now? (1–7)',
                emotionPrompt: 'What emotion do you feel now when you hold the feared future image and NC?',
                sudPrompt: 'How disturbing is that feared future image now? (0–10)',
                bodyPrompt: 'Where do you feel that in your body?',
                beginReprocessingPrompt:
                    'Hold the feared future image, NC, and sensation—then begin BLS (Phase 4). Past relevant work should be complete before flash forward.',
            },
            {
                startSet: 'Begin BLS on the feared future image. Pause: "What are you noticing now?"',
                goWithThat: 'Say "Go with that" and continue sets.',
                returnToTarget:
                    'Return to the feared future image: "When you bring that worst-case picture back, what do you notice now?"',
                checkSud: 'Check SUD on the feared future image. Continue until SUD 0 (or ecological 1), twice.',
                suggestInstall:
                    'Flash forward desensitization appears complete. Proceed to Installation when ready.',
            },
            'Install the positive cognition with the feared future image until VOC is ecological maximum.',
            'Body scan while holding the feared future image and positive cognition.'
        ),
    };
})(typeof window !== 'undefined' ? window : global);
