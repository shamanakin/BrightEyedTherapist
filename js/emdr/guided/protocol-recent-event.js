/**
 * Recent event — POD aspects then whole-event pass
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const S = () => global.BET.GuidedProtocolShared;

    global.BET.GuidedProtocolRecentEvent = {
        id: 'recent_event',
        name: 'Recent event',
        displayName: 'Recent event',
        pickerDescription:
            'Acute episode (often under ~3 months): list disturbing aspects (PODs), reprocess each, then whole-event pass.',
        prong: 'past',
        desensitizeMode: 'standard',
        startPhase: 'pods',
        allowedPhases: ['setup', 'pods', 'assess', 'desensitize', 'install', 'bodyScan', 'closure', 'wholeEvent'],
        phases: [
            {
                id: 'pods',
                number: 2,
                label: 'Points of disturbance',
                prompt: 'List each disturbing aspect of the recent episode. Process the worst or each in turn.',
            },
            {
                id: 'assess',
                number: 3,
                label: 'Assessment (current aspect)',
                steps: S().assessSteps({
                    targetPrompt: 'Label for this disturbing aspect of the episode:',
                    imagePrompt: 'What image represents the worst part of this aspect?',
                    ncPrompt: 'Negative cognition for this aspect:',
                    pcPrompt: 'Desired positive cognition:',
                    vocPrompt: 'VOC for PC now (1–7):',
                    emotionPrompt: 'Emotion with this aspect:',
                    sudPrompt: 'SUD for this aspect (0–10):',
                    bodyPrompt: 'Body sensation:',
                    beginReprocessingPrompt: 'Begin BLS on this aspect (Phase 4).',
                }),
            },
            S().desensitizePhase({
                startSet: 'BLS on this aspect. Pause: "What are you noticing?"',
                returnToTarget: 'Return to this aspect of the episode. What do you notice now?',
                suggestInstall: 'This aspect appears desensitized. Proceed to Installation.',
            }),
            S().installPhase('Install PC for this aspect.'),
            S().bodyScanPhase('Body scan for this aspect with PC.'),
            S().closurePhase(),
            {
                id: 'wholeEvent',
                number: 4,
                label: 'Whole event pass',
                setLoop: true,
                prompts: {
                    startSet:
                        'Silent review of the whole episode with BLS until clear. "Bring up the whole event from start to finish…"',
                    suggestInstall: 'Whole event clear. Install episode PC and proceed.',
                },
            },
        ],
    };
})(typeof window !== 'undefined' ? window : global);
