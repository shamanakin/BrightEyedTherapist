/**
 * Guided EMDR — wire BlsHost, engine, storage, and panel
 */
(function (global) {
    'use strict';

    function boot() {
        const storage = global.BET.GuidedStorage;
        const draft = storage.loadDraft();
        let sessionToken = null;
        const engine = global.BET.GuidedEngine.create(
            draft || storage.defaultClinical()
        );

        let panel = null;

        const hostApi = global.BET.BlsHost.init({
            guidedMode: true,
            onSetComplete: () => {
                if (!panel?.isResettingSession?.()) panel?.refresh();
            },
            onShareChange: (active, token, viewerUrl) => {
                if (active && token) {
                    sessionToken = token;
                    panel?.setShareState({ active: true, token, viewerUrl });
                    showClientOnlyHint(true);
                } else {
                    if (sessionToken) storage.clear(sessionToken);
                    sessionToken = null;
                    panel?.setShareState({ active: false, token: null, viewerUrl: null });
                    showClientOnlyHint(false);
                }
                if (!panel?.isResettingSession?.()) panel?.refresh();
            },
        });

        panel = global.BET.GuidedPanel.init({
            engine,
            storage,
            hostApi,
        });

        panel.refresh();

        if (typeof Auth !== 'undefined' && Auth.trackAppUsage) {
            const _guidedOpenedAt = Date.now();
            Auth.trackAppUsage('emdr-guided', 'start');
            window.addEventListener('beforeunload', () => {
                const dur = Math.round((Date.now() - _guidedOpenedAt) / 1000);
                Auth.trackAppUsage('emdr-guided', 'end', dur);
            });
        }

        function showClientOnlyHint(active) {
            const el = document.getElementById('guided-client-only');
            if (!el) return;
            el.classList.toggle('hidden', !active);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(typeof window !== 'undefined' ? window : global);
