/**
 * Shared EMDR protocol config fragments (closure, NC chips, assess builders)
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    const NC_CATEGORIES = [
        { id: 'self-worth', label: 'Self-worth', examples: ['I am not good enough', 'I am unlovable'] },
        { id: 'safety', label: 'Safety', examples: ['I am in danger', 'I am not safe'] },
        { id: 'helplessness', label: 'Helplessness', examples: ['I am helpless', 'I have no control'] },
        { id: 'responsibility', label: 'Responsibility', examples: ['It was my fault', 'I should have known better'] },
    ];

    global.BET.GuidedProtocolShared = {
        NC_CATEGORIES,

        closurePhase() {
            return {
                id: 'closure',
                number: 7,
                label: 'Closure',
                branches: {
                    complete: {
                        label: 'Reprocessing complete',
                        debrief:
                            'The processing done today may continue after the session. Notice any insights, dreams, or memories. Use calm place or other resources between sessions.',
                    },
                    incomplete: {
                        label: 'Incomplete session',
                        steps: [
                            'Acknowledge effort. Ask what felt most important today.',
                            'Use container or calm place—do not take SUD/VOC on the open target.',
                            'Debrief: processing may continue; use resources; material can be addressed next session.',
                        ],
                    },
                },
            };
        },

        bodyScanPhase(prompt) {
            return {
                id: 'bodyScan',
                number: 6,
                label: 'Body Scan',
                steps: [
                    {
                        id: 'scan',
                        field: 'bodyScanClear',
                        prompt:
                            prompt ||
                            'Scan head to toe while holding target and PC. Note any tension or unusual sensation. Reprocess until clear or strengthen positive sensations.',
                        input: 'checkbox',
                        required: true,
                    },
                ],
            };
        },

        installPhase(installPrompt) {
            return {
                id: 'install',
                number: 5,
                label: 'Installation',
                steps: [
                    {
                        id: 'pc_confirm',
                        field: 'pc',
                        prompt: 'Do these positive words still fit, or is there a better positive cognition?',
                        input: 'textarea',
                        required: true,
                    },
                    {
                        id: 'voc_install',
                        field: 'voc',
                        prompt: 'Hold the target and positive words together. After BLS sets, rate how true the PC feels (1–7). Target: 7 or ecological maximum.',
                        input: 'voc',
                        required: true,
                    },
                ],
                installPrompt:
                    installPrompt ||
                    'Hold the positive cognition and target together during installation sets.',
            };
        },

        desensitizePhase(prompts) {
            return {
                id: 'desensitize',
                number: 4,
                label: 'Desensitization',
                setLoop: true,
                prompts: prompts || {
                    startSet: 'Begin a set of BLS. After 20–30 passes, pause and ask: "What are you noticing now?"',
                    goWithThat: 'Say "Go with that" and begin another set.',
                    returnToTarget:
                        'Return to the original target: "When you go back to the original memory, what do you notice now?"',
                    checkSud: 'Check SUD on the original target (0–10). Continue sets until SUD is 0 (or 1 if ecologically appropriate), twice.',
                    suggestInstall:
                        'Desensitization appears complete. Confirm SUD, then proceed to Installation when ready.',
                },
            };
        },

        assessSteps(config) {
            const c = config || {};
            return [
                {
                    id: 'target',
                    field: 'targetLabel',
                    prompt: c.targetPrompt,
                    input: 'text',
                    required: true,
                },
                {
                    id: 'image',
                    field: 'image',
                    prompt: c.imagePrompt,
                    input: 'textarea',
                    required: true,
                },
                {
                    id: 'nc',
                    field: 'nc',
                    prompt: c.ncPrompt,
                    input: 'textarea',
                    required: true,
                    ncCategories: c.ncCategories !== false ? NC_CATEGORIES : undefined,
                },
                {
                    id: 'pc',
                    field: 'pc',
                    prompt: c.pcPrompt,
                    input: 'textarea',
                    required: true,
                },
                {
                    id: 'voc',
                    field: 'voc',
                    prompt: c.vocPrompt,
                    input: 'voc',
                    required: true,
                },
                {
                    id: 'emotion',
                    field: 'emotion',
                    prompt: c.emotionPrompt,
                    input: 'text',
                    required: true,
                },
                {
                    id: 'sud',
                    field: 'sudInitial',
                    prompt: c.sudPrompt,
                    input: 'sud',
                    required: true,
                },
                {
                    id: 'body',
                    field: 'body',
                    prompt: c.bodyPrompt,
                    input: 'text',
                    required: true,
                },
            ];
        },

        standardPhases37(assessConfig, desensitizePrompts, installPrompt, bodyPrompt) {
            const S = global.BET.GuidedProtocolShared;
            return [
                {
                    id: 'assess',
                    number: 3,
                    label: 'Assessment',
                    steps: S.assessSteps(assessConfig),
                    beginReprocessingPrompt: assessConfig.beginReprocessingPrompt,
                },
                S.desensitizePhase(desensitizePrompts),
                S.installPhase(installPrompt),
                S.bodyScanPhase(bodyPrompt),
                S.closurePhase(),
            ];
        },
    };
})(typeof window !== 'undefined' ? window : global);
