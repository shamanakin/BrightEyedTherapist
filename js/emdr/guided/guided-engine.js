/**
 * Guided EMDR phase state machine (multi-protocol)
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const Registry = () => global.BET.GuidedProtocolRegistry;

    function newPodId() {
        return 'pod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    }

    function copySets(sets) {
        return (sets || []).map((s) => ({ ...s }));
    }

    function resetTargetFields(clinical, opts) {
        opts = opts || {};
        clinical.assessStepIndex = 0;
        clinical.targetLabel = '';
        clinical.image = '';
        clinical.nc = '';
        clinical.pc = '';
        clinical.voc = 1;
        clinical.emotion = '';
        clinical.sudInitial = null;
        clinical.sudCurrent = null;
        clinical.body = '';
        clinical.sets = [];
        clinical.bodyScanClear = false;
        clinical.closureType = null;
        if (!opts.keepPods) {
            clinical.pods = [];
            clinical.activePodIndex = 0;
            clinical.eventLabel = '';
            clinical.wholeEventSud = null;
            clinical.wholeEventSets = [];
        }
        if (!opts.keepMovie) {
            clinical.movieRuns = [];
            clinical.movieRunCount = 0;
            clinical.bumpUsed = false;
            clinical.futureSituation = '';
        }
    }

    global.BET.GuidedEngine = {
        create(initialClinical) {
            const clinical =
                global.BET.GuidedStorage.migrateClinical(
                    initialClinical || global.BET.GuidedStorage.defaultClinical()
                );
            const protocol = Registry().get(clinical.protocolId);

            function reloadProtocol() {
                return Registry().get(clinical.protocolId);
            }

            return {
                get clinical() {
                    return clinical;
                },
                get protocol() {
                    return reloadProtocol();
                },

                replaceClinical(data) {
                    const next = global.BET.GuidedStorage.migrateClinical(
                        data || global.BET.GuidedStorage.defaultClinical()
                    );
                    Object.keys(clinical).forEach((k) => {
                        delete clinical[k];
                    });
                    Object.assign(clinical, next);
                },

                /** Full in-memory reset to protocol picker (new session). */
                resetSession() {
                    const next = global.BET.GuidedStorage.migrateClinical(
                        global.BET.GuidedStorage.defaultClinical()
                    );
                    next.setupComplete = false;
                    next.phaseId = 'setup';
                    next.protocolLocked = false;
                    next.assessStepIndex = 0;
                    Object.keys(clinical).forEach((k) => {
                        delete clinical[k];
                    });
                    Object.assign(clinical, next);
                    return clinical;
                },

                getProtocolMeta() {
                    const p = reloadProtocol();
                    return {
                        id: p.id,
                        name: p.displayName || p.name,
                        prong: p.prong,
                        description: p.pickerDescription,
                    };
                },

                getPhaseMeta() {
                    const p = reloadProtocol();
                    const phase = p.phases.find((ph) => ph.id === clinical.phaseId);
                    if (phase) {
                        return { number: phase.number, label: phase.label, id: phase.id };
                    }
                    if (clinical.phaseId === 'setup') {
                        return { number: 0, label: 'Session setup', id: 'setup' };
                    }
                    return { number: 3, label: 'Assessment', id: 'assess' };
                },

                canSelectProtocol() {
                    return !clinical.protocolLocked && clinical.sets.length === 0;
                },

                recordEvent(type, detail) {
                    if (!Array.isArray(clinical.sessionEvents)) clinical.sessionEvents = [];
                    clinical.sessionEvents.push({
                        type,
                        detail: detail || '',
                        at: Date.now(),
                        phaseId: clinical.phaseId,
                    });
                },

                snapshotCurrentAspect(reason) {
                    const pod = clinical.pods[clinical.activePodIndex];
                    const hasWork =
                        clinical.sets.length > 0 ||
                        clinical.targetLabel ||
                        clinical.image ||
                        clinical.nc ||
                        clinical.pc;
                    if (!hasWork && !pod) return null;
                    const record = {
                        reason: reason || 'snapshot',
                        capturedAt: Date.now(),
                        phaseAtCapture: clinical.phaseId,
                        podId: pod ? pod.id : null,
                        podIndex: clinical.activePodIndex,
                        podLabel: pod ? pod.label : '',
                        eventLabel: clinical.eventLabel || '',
                        targetLabel: clinical.targetLabel,
                        image: clinical.image,
                        nc: clinical.nc,
                        pc: clinical.pc,
                        voc: clinical.voc,
                        emotion: clinical.emotion,
                        sudInitial: clinical.sudInitial,
                        sudCurrent: clinical.sudCurrent,
                        body: clinical.body,
                        sets: copySets(clinical.sets),
                        bodyScanClear: clinical.bodyScanClear,
                        closureType: clinical.closureType,
                    };
                    if (!Array.isArray(clinical.aspectRecords)) clinical.aspectRecords = [];
                    clinical.aspectRecords.push(record);
                    this.recordEvent('aspect_snapshot', reason + (pod ? ': ' + pod.label : ''));
                    return record;
                },

                hasSubstantiveNotes() {
                    return global.BET.GuidedStorage.hasSubstantiveNotes(clinical);
                },

                markDownloaded(optionalLabel) {
                    if (!clinical.sessionMeta) {
                        clinical.sessionMeta = global.BET.GuidedStorage.defaultSessionMeta();
                    }
                    clinical.sessionMeta.lastDownloadAt = Date.now();
                    clinical.sessionMeta.downloadCount =
                        (clinical.sessionMeta.downloadCount || 0) + 1;
                    if (optionalLabel != null && String(optionalLabel).trim()) {
                        clinical.sessionMeta.optionalLabel = String(optionalLabel).trim();
                    }
                    this.recordEvent('report_downloaded', clinical.sessionMeta.optionalLabel || '');
                },

                buildReport(hostMeta) {
                    if (!global.BET.GuidedReport) return this.summaryTextLegacy();
                    return global.BET.GuidedReport.build({
                        clinical,
                        protocol: reloadProtocol(),
                        hostMeta: hostMeta || {},
                    });
                },

                selectProtocol(id) {
                    const p = Registry().get(id);
                    clinical.protocolId = p.id;
                    clinical.prong = p.prong;
                    clinical.setupComplete = true;
                    resetTargetFields(clinical);
                    clinical.phaseId = p.startPhase || 'assess';
                    this.recordEvent('protocol_selected', p.displayName || p.id);
                    return true;
                },

                resetProtocolSelection(force) {
                    if (!force && !this.canSelectProtocol()) return false;
                    clinical.setupComplete = false;
                    clinical.phaseId = 'setup';
                    clinical.protocolLocked = false;
                    resetTargetFields(clinical);
                    return true;
                },

                lockProtocol() {
                    clinical.protocolLocked = true;
                },

                getAssessStep() {
                    const phase = reloadProtocol().phases.find((p) => p.id === 'assess');
                    if (!phase || !phase.steps) return { field: 'targetLabel', prompt: '', required: true };
                    return phase.steps[clinical.assessStepIndex] || phase.steps[0];
                },

                assessFieldComplete(step) {
                    const val = clinical[step.field];
                    if (step.input === 'voc' || step.input === 'sud') {
                        return val !== null && val !== undefined && val !== '';
                    }
                    if (step.input === 'checkbox') {
                        return !!val;
                    }
                    return typeof val === 'string' && val.trim().length > 0;
                },

                canAdvanceAssess() {
                    const step = this.getAssessStep();
                    return !step.required || this.assessFieldComplete(step);
                },

                advanceAssess() {
                    const p = reloadProtocol();
                    const phase = p.phases.find((ph) => ph.id === 'assess');
                    if (!phase) return { phaseId: clinical.phaseId, done: false };

                    if (clinical.assessStepIndex < phase.steps.length - 1) {
                        clinical.assessStepIndex += 1;
                        return { phaseId: 'assess', done: false };
                    }

                    if (p.desensitizeMode === 'movie') {
                        clinical.phaseId = 'rehearse';
                    } else {
                        clinical.phaseId = 'desensitize';
                    }
                    if (clinical.sudCurrent === null) {
                        clinical.sudCurrent = clinical.sudInitial;
                    }
                    if (p.id === 'future_template') {
                        clinical.futureSituation = clinical.targetLabel;
                    }
                    return { phaseId: clinical.phaseId, done: false };
                },

                goToPhase(phaseId) {
                    const allowed = Registry().getAllowedPhases(reloadProtocol());
                    if (!allowed.includes(phaseId)) return false;
                    clinical.phaseId = phaseId;
                    this.recordEvent('phase_entered', phaseId);
                    return true;
                },

                logSet(entry) {
                    const n = clinical.sets.length + 1;
                    clinical.sets.push({
                        n,
                        note: entry.note || '',
                        sud: entry.sud != null ? entry.sud : null,
                        at: Date.now(),
                        podIndex: clinical.activePodIndex,
                    });
                    if (entry.sud != null) {
                        clinical.sudCurrent = entry.sud;
                    }
                    if (clinical.sets.length === 1) {
                        clinical.protocolLocked = true;
                    }
                    this.recordEvent(
                        'set_logged',
                        `Set ${n} SUD ${entry.sud != null ? entry.sud : '—'}`
                    );
                },

                logWholeEventSet(entry) {
                    const n = clinical.wholeEventSets.length + 1;
                    clinical.wholeEventSets.push({
                        n,
                        note: entry.note || '',
                        sud: entry.sud != null ? entry.sud : null,
                        at: Date.now(),
                    });
                    if (entry.sud != null) {
                        clinical.wholeEventSud = entry.sud;
                    }
                    this.recordEvent(
                        'whole_event_set_logged',
                        `Set ${n} SUD ${entry.sud != null ? entry.sud : '—'}`
                    );
                },

                logMovieRun(entry) {
                    const n = clinical.movieRuns.length + 1;
                    clinical.movieRuns.push({
                        n,
                        note: entry.note || '',
                        bump: !!entry.bump,
                        at: Date.now(),
                    });
                    clinical.movieRunCount = clinical.movieRuns.length;
                    if (entry.bump) clinical.bumpUsed = true;
                    this.recordEvent('movie_run_logged', `Run ${n}${entry.bump ? ' bump' : ''}`);
                },

                shouldSuggestReturnToTarget() {
                    if (clinical.sets.length < 2) return false;
                    const last = clinical.sets.slice(-2);
                    return last.every((s) => s.sud != null && last[0].sud === last[1].sud);
                },

                canSuggestInstallation() {
                    return clinical.sudCurrent === 0 || clinical.sudCurrent === 1;
                },

                addPod(label) {
                    const text = (label || '').trim();
                    if (!text) return false;
                    clinical.pods.push({
                        id: newPodId(),
                        label: text,
                        assessComplete: false,
                        sudInitial: null,
                        sudCurrent: null,
                    });
                    return true;
                },

                removePod(index) {
                    if (index < 0 || index >= clinical.pods.length) return false;
                    clinical.pods.splice(index, 1);
                    if (clinical.activePodIndex >= clinical.pods.length) {
                        clinical.activePodIndex = Math.max(0, clinical.pods.length - 1);
                    }
                    return true;
                },

                startPodProcessing(index) {
                    if (index < 0 || index >= clinical.pods.length) return false;
                    clinical.activePodIndex = index;
                    resetTargetFields(clinical, { keepPods: true });
                    clinical.phaseId = 'assess';
                    return true;
                },

                allPodsProcessed() {
                    return clinical.pods.length > 0 && clinical.pods.every((p) => p.assessComplete);
                },

                markCurrentPodComplete() {
                    const pod = clinical.pods[clinical.activePodIndex];
                    if (pod) pod.assessComplete = true;
                },

                hasMorePods() {
                    return clinical.pods.some((p) => !p.assessComplete);
                },

                nextUnprocessedPodIndex() {
                    return clinical.pods.findIndex((p) => !p.assessComplete);
                },

                startWholeEvent() {
                    clinical.phaseId = 'wholeEvent';
                    clinical.wholeEventSud = clinical.wholeEventSud ?? clinical.sudCurrent;
                    this.recordEvent('whole_event_started', '');
                },

                advanceAfterPodClosure() {
                    this.snapshotCurrentAspect('pod_complete');
                    this.markCurrentPodComplete();
                    const next = this.nextUnprocessedPodIndex();
                    if (next >= 0) {
                        this.startPodProcessing(next);
                        this.recordEvent('pod_started', clinical.pods[next]?.label || '');
                        return 'nextPod';
                    }
                    this.startWholeEvent();
                    return 'wholeEvent';
                },

                summaryTextLegacy() {
                    const meta = this.getProtocolMeta();
                    const lines = [
                        'EMDR Guided Session Summary',
                        `Protocol: ${meta.name} (${meta.prong} prong)`,
                        '---',
                    ];
                    if (clinical.eventLabel) {
                        lines.push(`Episode: ${clinical.eventLabel}`);
                    }
                    if (clinical.pods.length) {
                        lines.push('Points of disturbance:');
                        clinical.pods.forEach((p, i) => {
                            lines.push(`  ${i + 1}. ${p.label}${p.assessComplete ? ' (processed)' : ''}`);
                        });
                    }
                    lines.push(
                        `Target: ${clinical.targetLabel || '(not set)'}`,
                        `Image: ${clinical.image || ''}`,
                        `NC: ${clinical.nc || ''}`,
                        `PC: ${clinical.pc || ''}`,
                        `VOC: ${clinical.voc}`,
                        `Emotion: ${clinical.emotion || ''}`,
                        `SUD initial: ${clinical.sudInitial}`,
                        `SUD final: ${clinical.sudCurrent}`
                    );
                    if (clinical.movieRuns.length) {
                        lines.push(`Movie runs: ${clinical.movieRuns.length}`);
                        clinical.movieRuns.forEach((r) => {
                            lines.push(`  Run ${r.n}${r.bump ? ' (bump)' : ''}: ${r.note || ''}`);
                        });
                    }
                    clinical.sets.forEach((s) => {
                        lines.push(`  Set ${s.n}: SUD ${s.sud ?? '—'} — ${s.note || ''}`);
                    });
                    if (clinical.wholeEventSets.length) {
                        lines.push('Whole event sets:');
                        clinical.wholeEventSets.forEach((s) => {
                            lines.push(`  ${s.n}: SUD ${s.sud ?? '—'} — ${s.note || ''}`);
                        });
                    }
                    lines.push(`Closure: ${clinical.closureType || 'pending'}`);
                    return lines.join('\n');
                },

                summaryText() {
                    return this.buildReport({});
                },
            };
        },
    };
})(typeof window !== 'undefined' ? window : global);
