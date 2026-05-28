/**
 * Future template — adaptive coping movie (third prong)
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const S = () => global.BET.GuidedProtocolShared;

    global.BET.GuidedProtocolFutureTemplate = {
        id: 'future_template',
        name: 'Future template',
        displayName: 'Future template',
        pickerDescription:
            'Third prong: rehearse coping in a realistic upcoming situation (movie + optional bump)—not worst-case catastrophe.',
        prong: 'future',
        desensitizeMode: 'movie',
        startPhase: 'assess',
        allowedPhases: ['setup', 'assess', 'rehearse', 'install', 'bodyScan', 'closure'],
        phases: [
            {
                id: 'assess',
                number: 3,
                label: 'Assessment',
                steps: [
                    {
                        id: 'target',
                        field: 'targetLabel',
                        prompt:
                            'Identify the realistic future situation to rehearse (not worst-case catastrophe):',
                        input: 'text',
                        required: true,
                    },
                    {
                        id: 'image',
                        field: 'image',
                        prompt:
                            'Describe the coping movie: how would the client like to handle this situation? (Adaptive response, not perfection.)',
                        input: 'textarea',
                        required: true,
                    },
                    {
                        id: 'pc',
                        field: 'pc',
                        prompt: 'What positive cognition fits handling this situation well?',
                        input: 'textarea',
                        required: true,
                    },
                    {
                        id: 'voc',
                        field: 'voc',
                        prompt: 'How true does the PC feel now before rehearsal? (1–7)',
                        input: 'voc',
                        required: true,
                    },
                    {
                        id: 'emotion',
                        field: 'emotion',
                        prompt: 'What emotion arises when imagining this future situation now?',
                        input: 'text',
                        required: true,
                    },
                    {
                        id: 'sud',
                        field: 'sudInitial',
                        prompt: 'How disturbing is imagining this situation now? (0–10)',
                        input: 'sud',
                        required: true,
                    },
                    {
                        id: 'body',
                        field: 'body',
                        prompt: 'Where do you feel it in your body?',
                        input: 'text',
                        required: true,
                    },
                ],
                beginReprocessingPrompt:
                    'Run the coping movie with BLS start/stop. Target 3–5 runs before optional bump.',
            },
            {
                id: 'rehearse',
                number: 4,
                label: 'Future rehearsal',
                setLoop: true,
                prompts: {
                    startRun:
                        'Guide the client to run the coping movie. Start BLS; stop and ask what they notice.',
                    bumpIntro:
                        'Optional: "What if [feared complication] happened?" Re-run the movie with resources.',
                    suggestInstall:
                        'When the movie feels adaptive enough, proceed to Installation.',
                },
            },
            S().installPhase('Strengthen the positive cognition while holding the future coping movie.'),
            S().bodyScanPhase('Scan body while holding the future situation and PC.'),
            S().closurePhase(),
        ],
    };
})(typeof window !== 'undefined' ? window : global);
