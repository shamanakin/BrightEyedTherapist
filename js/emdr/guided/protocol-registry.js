/**
 * Guided EMDR protocol registry
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    const DEFAULT_ID = 'standard';

    function allProtocols() {
        return [
            global.BET.GuidedProtocolStandard,
            global.BET.GuidedProtocolPresentTrigger,
            global.BET.GuidedProtocolFlashForward,
            global.BET.GuidedProtocolFutureTemplate,
            global.BET.GuidedProtocolRecentEvent,
        ].filter(Boolean);
    }

    global.BET.GuidedProtocolRegistry = {
        defaultId: DEFAULT_ID,

        list() {
            return allProtocols().map((p) => ({
                id: p.id,
                displayName: p.displayName || p.name,
                pickerDescription: p.pickerDescription || '',
                prong: p.prong,
            }));
        },

        get(id) {
            const found = allProtocols().find((p) => p.id === id);
            return found || global.BET.GuidedProtocolStandard;
        },

        getAllowedPhases(protocol) {
            return protocol.allowedPhases || [
                'setup',
                'pods',
                'assess',
                'desensitize',
                'rehearse',
                'wholeEvent',
                'install',
                'bodyScan',
                'closure',
            ];
        },
    };
})(typeof window !== 'undefined' ? window : global);
