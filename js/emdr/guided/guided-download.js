/**
 * Guided EMDR — trigger plain-text file download in the browser
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    function sanitizeFilenamePart(s) {
        return String(s || '')
            .trim()
            .replace(/[^\w\-]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 32);
    }

    function buildFilename({ protocolId, label }) {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const date =
            d.getFullYear() +
            '-' +
            pad(d.getMonth() + 1) +
            '-' +
            pad(d.getDate()) +
            '_' +
            pad(d.getHours()) +
            pad(d.getMinutes());
        const proto = sanitizeFilenamePart(protocolId || 'session');
        const tag = sanitizeFilenamePart(label);
        return 'EMDR-Guided_' + proto + '_' + date + (tag ? '_' + tag : '') + '.txt';
    }

    global.BET.GuidedDownload = {
        sanitizeFilenamePart,
        buildFilename,

        triggerDownload(text, filename) {
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'EMDR-Guided-session.txt';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                URL.revokeObjectURL(url);
                a.remove();
            }, 0);
        },
    };
})(typeof window !== 'undefined' ? window : global);
