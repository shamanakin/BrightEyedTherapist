/**
 * Guided EMDR — plain-text session report for EHR upload
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    function padRight(s, width) {
        const str = String(s == null ? '' : s);
        if (str.length >= width) return str.slice(0, width);
        return str + ' '.repeat(width - str.length);
    }

    function formatTime(ts) {
        if (!ts) return '—';
        try {
            return new Date(ts).toLocaleString();
        } catch (e) {
            return '—';
        }
    }

    function formatSud(v) {
        return v === null || v === undefined || v === '' ? '—' : String(v);
    }

    function section(title) {
        return ['', '---', title, '---', ''];
    }

    function linesFromFields(record, fields) {
        const out = [];
        fields.forEach(([label, key]) => {
            const val = record[key];
            if (val === null || val === undefined || val === '') return;
            out.push(`${label}: ${val}`);
        });
        return out;
    }

    function renderSetTable(sets, title) {
        if (!sets || !sets.length) return [`${title}: (none logged)`];
        const lines = [title + ':', padRight('#', 4) + padRight('SUD', 6) + 'Note'];
        sets.forEach((s) => {
            lines.push(
                padRight(String(s.n), 4) +
                    padRight(formatSud(s.sud), 6) +
                    (s.note || '').replace(/\n/g, ' ')
            );
        });
        return lines;
    }

    function snapshotFields() {
        return [
            ['Target', 'targetLabel'],
            ['Image / movie', 'image'],
            ['NC', 'nc'],
            ['PC', 'pc'],
            ['VOC', 'voc'],
            ['Emotion', 'emotion'],
            ['SUD initial', 'sudInitial'],
            ['SUD final', 'sudCurrent'],
            ['Body sensation', 'body'],
        ];
    }

    function buildAspectBlock(rec, index) {
        const lines = [];
        const label = rec.podLabel || rec.targetLabel || `Aspect ${index + 1}`;
        lines.push(`### Aspect ${index + 1}: ${label}`);
        if (rec.eventLabel) lines.push(`Episode: ${rec.eventLabel}`);
        lines.push(`Captured: ${formatTime(rec.capturedAt)} (${rec.reason || 'snapshot'})`);
        lines.push(...linesFromFields(rec, snapshotFields()));
        if (rec.sets && rec.sets.length) {
            lines.push(...renderSetTable(rec.sets, 'Desensitization sets'));
        }
        if (rec.bodyScanClear != null) {
            lines.push(`Body scan clear: ${rec.bodyScanClear ? 'yes' : 'no'}`);
        }
        if (rec.closureType) lines.push(`Closure (this aspect): ${rec.closureType}`);
        return lines;
    }

    global.BET.GuidedReport = {
        build({ clinical, protocol, hostMeta }) {
            hostMeta = hostMeta || {};
            const meta = protocol
                ? {
                      id: protocol.id,
                      name: protocol.displayName || protocol.name,
                      prong: protocol.prong,
                  }
                : { id: clinical.protocolId, name: clinical.protocolId, prong: clinical.prong };

            const sm = clinical.sessionMeta || {};
            const started = sm.startedAt || clinical.updatedAt;
            const generated = Date.now();
            const lines = [];

            lines.push('EMDR GUIDED — SESSION REPORT');
            lines.push('BrightEyedTherapist.com');
            lines.push('');
            lines.push(
                'This document was generated in your browser. It is not stored on BrightEyedTherapist servers.'
            );
            lines.push('Add client identifiers in your EHR. Do not rely on this file as a legal medical record.');
            lines.push('');
            lines.push(`Generated: ${formatTime(generated)}`);
            lines.push(`Session started: ${formatTime(started)}`);
            if (sm.optionalLabel) lines.push(`Session label: ${sm.optionalLabel}`);
            lines.push(`Protocol: ${meta.name} (${meta.prong} prong)`);
            lines.push(`Current phase at export: ${clinical.phaseId || '—'}`);
            if (hostMeta.blsSetCount != null) {
                lines.push(`BLS sets completed (host counter): ${hostMeta.blsSetCount}`);
            }
            lines.push(`Protocol guidance: ${clinical.guidanceEnabled !== false ? 'on' : 'off'}`);

            lines.push(...section('SESSION OVERVIEW'));
            if (clinical.eventLabel) lines.push(`Episode label: ${clinical.eventLabel}`);
            lines.push(`Closure status: ${clinical.closureType || 'not recorded'}`);
            lines.push(`Body scan clear: ${clinical.bodyScanClear ? 'yes' : 'no'}`);
            if (clinical.futureSituation) lines.push(`Future situation: ${clinical.futureSituation}`);

            if (clinical.pods && clinical.pods.length) {
                lines.push(...section('POINTS OF DISTURBANCE (PODs)'));
                clinical.pods.forEach((p, i) => {
                    lines.push(
                        `  ${i + 1}. ${p.label}${p.assessComplete ? ' [processed]' : ' [pending]'}`
                    );
                });
            }

            if (clinical.aspectRecords && clinical.aspectRecords.length) {
                lines.push(...section('COMPLETED ASPECTS (archived snapshots)'));
                clinical.aspectRecords.forEach((rec, i) => {
                    lines.push(...buildAspectBlock(rec, i));
                    lines.push('');
                });
            }

            const hasCurrentWork =
                clinical.targetLabel ||
                clinical.image ||
                clinical.nc ||
                clinical.sets.length ||
                clinical.movieRuns.length ||
                clinical.wholeEventSets.length;

            if (hasCurrentWork) {
                lines.push(...section('CURRENT / IN-PROGRESS WORK'));
                lines.push(...linesFromFields(clinical, snapshotFields()));
            }

            if (clinical.movieRuns && clinical.movieRuns.length) {
                lines.push(...section('FUTURE TEMPLATE — MOVIE RUNS'));
                lines.push(padRight('#', 4) + padRight('Bump', 6) + 'Note');
                clinical.movieRuns.forEach((r) => {
                    lines.push(
                        padRight(String(r.n), 4) +
                            padRight(r.bump ? 'yes' : 'no', 6) +
                            (r.note || '').replace(/\n/g, ' ')
                    );
                });
                if (clinical.bumpUsed) lines.push('Bump run used: yes');
            }

            if (clinical.sets && clinical.sets.length) {
                lines.push(...section('DESENSITIZATION SET LOG (current target)'));
                const showPod =
                    clinical.pods.length > 0 &&
                    clinical.sets.some((s) => s.podIndex != null && s.podIndex > 0);
                if (showPod) {
                    lines.push(
                        padRight('#', 4) +
                            padRight('POD', 5) +
                            padRight('SUD', 6) +
                            'Note'
                    );
                    clinical.sets.forEach((s) => {
                        lines.push(
                            padRight(String(s.n), 4) +
                                padRight(String((s.podIndex ?? 0) + 1), 5) +
                                padRight(formatSud(s.sud), 6) +
                                (s.note || '').replace(/\n/g, ' ')
                        );
                    });
                } else {
                    lines.push(...renderSetTable(clinical.sets, 'Sets'));
                }
            }

            if (clinical.wholeEventSets && clinical.wholeEventSets.length) {
                lines.push(...section('WHOLE EVENT PASS'));
                lines.push(`SUD (whole event): ${formatSud(clinical.wholeEventSud)}`);
                lines.push(...renderSetTable(clinical.wholeEventSets, 'Whole event sets'));
            }

            if (clinical.sessionEvents && clinical.sessionEvents.length) {
                lines.push(...section('SESSION TIMELINE (appendix)'));
                clinical.sessionEvents.forEach((ev) => {
                    const detail = ev.detail ? ` — ${ev.detail}` : '';
                    lines.push(`  ${formatTime(ev.at)}  ${ev.type}${detail}`);
                });
            }

            lines.push(...section('END OF REPORT'));
            lines.push('Upload this file to your EHR and attach to the appropriate client chart.');
            lines.push('Retain per your practice policies and applicable privacy regulations.');

            return lines.join('\n');
        },
    };
})(typeof window !== 'undefined' ? window : global);
