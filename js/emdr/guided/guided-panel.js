/**
 * Guided EMDR clinician side panel UI
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};

    global.BET.GuidedPanel = {
        init({ engine, storage, hostApi }) {
            const root = document.getElementById('guided-panel');
            const body = document.getElementById('guided-panel-fields');
            const footer = document.getElementById('guided-panel-footer');
            const breadcrumb = document.getElementById('guided-breadcrumb');
            const promptEl = document.getElementById('guided-prompt');
            const shareBadge = document.getElementById('guided-share-badge');
            const guidanceToggle = document.getElementById('guided-guidance-toggle');
            const blsSetDisplay = document.getElementById('guided-bls-sets');
            const confirmOverlay = document.getElementById('guided-confirm-overlay');
            const confirmMessage = document.getElementById('guided-confirm-message');
            const confirmOkBtn = document.getElementById('guided-confirm-ok');
            const confirmCancelBtn = document.getElementById('guided-confirm-cancel');
            const downloadOverlay = document.getElementById('guided-download-overlay');
            const downloadLabelInput = document.getElementById('guided-download-label-input');
            const downloadOkBtn = document.getElementById('guided-download-ok');
            const downloadCancelBtn = document.getElementById('guided-download-cancel');
            const downloadReportBtn = document.getElementById('guided-download-report');

            if (!root) {
                console.error('[GuidedPanel] #guided-panel not found');
                return {
                    setShareState: () => {},
                    setPanelCollapsed: () => {},
                    togglePanel: () => false,
                    refresh: () => {},
                    getClinical: () => engine?.clinical,
                    isResettingSession: () => false,
                };
            }

            let sessionToken = null;
            let shareViewerUrl = null;
            let pendingProtocolId = engine.clinical.protocolId || 'standard';
            let confirmOnOk = null;
            let resettingSession = false;
            let persistTimer = null;

            function setShareState({ active, token, viewerUrl }) {
                sessionToken = active ? token : null;
                shareViewerUrl = active ? viewerUrl : null;
                updateShareBadge();
            }

            function updateShareBadge() {
                if (!shareBadge) return;
                if (sessionToken && shareViewerUrl) {
                    shareBadge.textContent = 'Client link · Copy';
                    shareBadge.classList.add('live');
                    shareBadge.disabled = false;
                    shareBadge.title = 'Click to copy client viewer link';
                } else {
                    shareBadge.textContent = 'No client link';
                    shareBadge.classList.remove('live');
                    shareBadge.disabled = true;
                    shareBadge.title = 'Use Share in the toolbar to create a client link';
                }
            }

            function hideConfirm() {
                confirmOnOk = null;
                confirmOverlay?.classList.add('hidden');
            }

            function showConfirm(message, onOk) {
                if (confirmOverlay && confirmMessage) {
                    confirmMessage.textContent = message;
                    confirmOnOk = onOk;
                    confirmOverlay.classList.remove('hidden');
                    confirmOkBtn?.focus();
                    return;
                }
                if (window.confirm(message)) onOk();
            }

            async function applyNewSession() {
                const sharing =
                    hostApi &&
                    typeof hostApi.getSessionToken === 'function' &&
                    hostApi.getSessionToken();
                resettingSession = true;
                try {
                    setShareState({ active: false, token: null, viewerUrl: null });
                    storage.clearAll();
                    if (typeof engine.resetSession === 'function') {
                        engine.resetSession();
                    } else if (typeof engine.replaceClinical === 'function') {
                        engine.replaceClinical(storage.freshClinical?.() || storage.defaultClinical());
                    } else {
                        engine.resetProtocolSelection?.(true);
                    }
                    pendingProtocolId = engine.clinical.protocolId || 'standard';
                    engine.clinical.guidanceEnabled = true;
                    if (guidanceToggle) guidanceToggle.checked = true;
                    if (blsSetDisplay) blsSetDisplay.textContent = '0';
                    breadcrumb.textContent = 'Session setup';
                    promptEl.classList.add('hidden');
                    promptEl.textContent = '';
                    body.innerHTML = '';
                    footer.innerHTML = '';
                    setPanelCollapsed(false);
                    renderSetup();
                    if (sharing && typeof hostApi.endShare === 'function') {
                        await hostApi.endShare();
                    }
                } catch (err) {
                    console.error('[GuidedPanel] New session failed:', err);
                    window.alert('Could not reset the session. Try refreshing the page.');
                } finally {
                    resettingSession = false;
                }
            }

            function needsDownloadWarning() {
                return (
                    typeof engine.hasSubstantiveNotes === 'function' &&
                    engine.hasSubstantiveNotes() &&
                    !engine.clinical.sessionMeta?.lastDownloadAt
                );
            }

            function getHostMeta() {
                return {
                    blsSetCount:
                        hostApi && typeof hostApi.getSetCount === 'function'
                            ? hostApi.getSetCount()
                            : null,
                };
            }

            function performDownload(label) {
                const Report = global.BET.GuidedReport;
                const Download = global.BET.GuidedDownload;
                if (!Report || !Download) {
                    window.alert('Report download is not available. Try refreshing the page.');
                    return;
                }
                const text = engine.buildReport(getHostMeta());
                const filename = Download.buildFilename({
                    protocolId: engine.clinical.protocolId,
                    label: label || engine.clinical.sessionMeta?.optionalLabel || '',
                });
                Download.triggerDownload(text, filename);
                engine.markDownloaded(label);
                persist(true);
            }

            function hideDownloadModal() {
                downloadOverlay?.classList.add('hidden');
            }

            function openDownloadModal() {
                if (downloadLabelInput) {
                    downloadLabelInput.value = engine.clinical.sessionMeta?.optionalLabel || '';
                }
                downloadOverlay?.classList.remove('hidden');
                downloadLabelInput?.focus();
            }

            function syncDownloadButton() {
                if (!downloadReportBtn) return;
                const show = !!engine.clinical.setupComplete;
                downloadReportBtn.classList.toggle('hidden', !show);
            }

            function requestNewSession() {
                const sharing =
                    hostApi &&
                    typeof hostApi.getSessionToken === 'function' &&
                    hostApi.getSessionToken();
                const runClear = () => {
                    const message = sharing
                        ? 'Start a new session? All protocol fields and set notes in this tab will be cleared, and the active client BLS link will be stopped.'
                        : 'Start a new session? All protocol fields and set notes in this tab will be cleared. This cannot be undone.';
                    showConfirm(message, applyNewSession);
                };
                if (needsDownloadWarning()) {
                    showConfirm(
                        'You have not downloaded a session report yet. Download a report for your EHR before clearing, or continue to clear without downloading.',
                        runClear
                    );
                    return;
                }
                runClear();
            }

            root.addEventListener('click', (e) => {
                if (e.target.closest('#guided-new-session')) {
                    e.preventDefault();
                    e.stopPropagation();
                    requestNewSession();
                }
                if (e.target.closest('#guided-download-report')) {
                    e.preventDefault();
                    e.stopPropagation();
                    openDownloadModal();
                }
            });

            downloadOkBtn?.addEventListener('click', () => {
                const label = downloadLabelInput?.value?.trim() || '';
                performDownload(label);
                hideDownloadModal();
            });
            downloadCancelBtn?.addEventListener('click', hideDownloadModal);
            downloadOverlay?.addEventListener('click', (e) => {
                if (e.target === downloadOverlay) hideDownloadModal();
            });

            window.addEventListener('beforeunload', (e) => {
                if (!needsDownloadWarning()) return;
                e.preventDefault();
                e.returnValue = '';
            });

            confirmOkBtn?.addEventListener('click', () => {
                const fn = confirmOnOk;
                hideConfirm();
                if (fn) fn();
            });
            confirmCancelBtn?.addEventListener('click', hideConfirm);
            confirmOverlay?.addEventListener('click', (e) => {
                if (e.target === confirmOverlay) hideConfirm();
            });

            updateShareBadge();

            function persist(immediate) {
                const save = () => {
                    storage.saveDraft(engine.clinical);
                    if (sessionToken) storage.save(sessionToken, engine.clinical);
                };
                if (immediate) {
                    clearTimeout(persistTimer);
                    save();
                    return;
                }
                clearTimeout(persistTimer);
                persistTimer = setTimeout(save, 2000);
            }

            function renderBreadcrumb() {
                const meta = engine.getProtocolMeta();
                const phase = engine.getPhaseMeta();
                breadcrumb.innerHTML = `${escapeHtml(meta.name)} · Phase <strong>${phase.number}</strong> · ${escapeHtml(phase.label)}`;
            }

            function renderPrompt(text) {
                if (!engine.clinical.guidanceEnabled || !text) {
                    promptEl.classList.add('hidden');
                    promptEl.textContent = '';
                    return;
                }
                promptEl.classList.remove('hidden');
                promptEl.textContent = text;
            }

            function renderSetLog(targetSets) {
                const sets = targetSets || engine.clinical.sets;
                const rows = sets
                    .map(
                        (s) =>
                            `<tr><td>${s.n}</td><td>${s.sud != null ? s.sud : '—'}</td><td>${escapeHtml(s.note || '')}</td></tr>`
                    )
                    .join('');
                const table = `<table><thead><tr><th>#</th><th>SUD</th><th>Note</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No sets logged yet</td></tr>'}</tbody></table>`;
                const existing = body.querySelector('.guided-set-log');
                if (existing) existing.innerHTML = table;
            }

            function stepLabel(step) {
                const labels = {
                    targetLabel: 'Target moment',
                    image: 'Worst image',
                    nc: 'Negative cognition (NC)',
                    pc: 'Positive cognition (PC)',
                    voc: 'Validity of cognition (VOC)',
                    emotion: 'Emotion',
                    sudInitial: 'Subjective units (SUD)',
                    body: 'Body sensation',
                };
                return labels[step.field] || step.field;
            }

            function escapeHtml(s) {
                return String(s)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }

            function fieldInput(step, value) {
                const id = `guided-field-${step.field}`;
                if (step.input === 'textarea') {
                    return `<textarea id="${id}" rows="3">${escapeHtml(value || '')}</textarea>`;
                }
                if (step.input === 'voc') {
                    const v = value != null ? value : 1;
                    return `<div class="guided-sud-row"><input type="range" id="${id}" min="1" max="7" step="1" value="${v}"><span id="${id}-val">${v}</span></div>`;
                }
                if (step.input === 'sud') {
                    const v = value != null ? value : 5;
                    return `<div class="guided-sud-row"><input type="range" id="${id}" min="0" max="10" step="1" value="${v}"><span id="${id}-val">${v}</span></div>`;
                }
                if (step.input === 'checkbox') {
                    return `<label><input type="checkbox" id="${id}" ${value ? 'checked' : ''}> Complete</label>`;
                }
                return `<input type="text" id="${id}" value="${escapeHtml(value || '')}">`;
            }

            function bindRange(id, field) {
                const input = document.getElementById(id);
                const val = document.getElementById(`${id}-val`);
                if (!input) return;
                input.addEventListener('input', () => {
                    engine.clinical[field] = parseInt(input.value, 10);
                    if (val) val.textContent = input.value;
                    persist();
                });
            }

            function bindBlsButtons() {
                document.getElementById('guided-bls-toggle')?.addEventListener('click', () => {
                    if (!hostApi) return;
                    if (hostApi.isRunning()) hostApi.stopBLS();
                    else hostApi.startBLS();
                    render();
                });
            }

            function blsFooterButtons(primaryLabel) {
                const running = hostApi && hostApi.isRunning();
                return `
                    <div class="guided-footer-stack">
                        <div class="guided-footer-bls">
                            <button type="button" class="guided-btn guided-btn-secondary" id="guided-bls-toggle">${running ? 'Stop BLS' : 'Start BLS'}</button>
                            <button type="button" class="guided-btn guided-btn-secondary" id="guided-log-set">Log set</button>
                        </div>
                        <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">${primaryLabel}</button>
                    </div>`;
            }

            function renderSetup() {
                breadcrumb.innerHTML = 'Session setup';
                promptEl.classList.add('hidden');

                const list = global.BET.GuidedProtocolRegistry.list();
                const options = list
                    .map(
                        (p) =>
                            `<option value="${p.id}" ${p.id === pendingProtocolId ? 'selected' : ''}>${escapeHtml(p.displayName)}</option>`
                    )
                    .join('');

                const selected = list.find((p) => p.id === pendingProtocolId) || list[0];

                body.innerHTML = `
                    <div class="guided-field">
                        <label for="guided-protocol-select">Protocol</label>
                        <select id="guided-protocol-select" class="guided-select">${options}</select>
                        <p id="guided-protocol-desc" class="guided-protocol-desc">${escapeHtml(selected.pickerDescription)}</p>
                    </div>
                    <div class="guided-protocol-hint">
                        <strong>Flash forward</strong> = worst-case future image (desensitize). 
                        <strong>Future template</strong> = rehearse adaptive coping in a realistic upcoming situation.
                    </div>
                    ${engine.canSelectProtocol() ? '<button type="button" class="guided-btn-ghost guided-link-btn" id="guided-change-protocol">Change protocol</button>' : ''}
                `;

                const sel = document.getElementById('guided-protocol-select');
                const desc = document.getElementById('guided-protocol-desc');
                sel.addEventListener('change', () => {
                    pendingProtocolId = sel.value;
                    const p = list.find((x) => x.id === pendingProtocolId);
                    if (p && desc) desc.textContent = p.pickerDescription;
                });

                document.getElementById('guided-change-protocol')?.addEventListener('click', () => {
                    if (
                        confirm(
                            'Change protocol? This clears in-progress target fields for this tab.'
                        )
                    ) {
                        engine.resetProtocolSelection();
                        pendingProtocolId = engine.clinical.protocolId;
                        persist();
                        render();
                    }
                });

                footer.innerHTML = `
                    <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">Continue to session</button>
                `;
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    engine.selectProtocol(pendingProtocolId);
                    persist();
                    render();
                });
            }

            function renderPods() {
                const phase = engine.protocol.phases.find((p) => p.id === 'pods');
                renderBreadcrumb();
                renderPrompt(phase?.prompt || 'List disturbing aspects of the recent episode.');

                const podRows = engine.clinical.pods
                    .map(
                        (p, i) => `
                    <div class="guided-pod-row">
                        <span>${i + 1}. ${escapeHtml(p.label)}</span>
                        <button type="button" class="guided-btn-ghost guided-pod-remove" data-index="${i}">Remove</button>
                    </div>`
                    )
                    .join('');

                body.innerHTML = `
                    <div class="guided-field">
                        <label>Episode label</label>
                        <input type="text" id="guided-event-label" value="${escapeHtml(engine.clinical.eventLabel || '')}" placeholder="e.g. Car accident, March 2026">
                    </div>
                    <div class="guided-field">
                        <label>Points of disturbance (PODs)</label>
                        <div class="guided-pod-list">${podRows || '<p class="guided-muted">No aspects added yet.</p>'}</div>
                        <div class="guided-pod-add">
                            <input type="text" id="guided-new-pod" placeholder="Disturbing aspect">
                            <button type="button" class="guided-btn guided-btn-secondary" id="guided-add-pod">Add</button>
                        </div>
                    </div>
                `;

                document.getElementById('guided-event-label')?.addEventListener('input', (e) => {
                    engine.clinical.eventLabel = e.target.value;
                    persist();
                });

                document.getElementById('guided-add-pod')?.addEventListener('click', () => {
                    const input = document.getElementById('guided-new-pod');
                    if (engine.addPod(input.value)) {
                        input.value = '';
                        persist();
                        render();
                    }
                });

                body.querySelectorAll('.guided-pod-remove').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        engine.removePod(parseInt(btn.getAttribute('data-index'), 10));
                        persist();
                        render();
                    });
                });

                footer.innerHTML = `
                    <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn" ${engine.clinical.pods.length ? '' : 'disabled'}>Begin first aspect</button>
                `;
                document.getElementById('guided-primary-btn')?.addEventListener('click', () => {
                    if (!engine.clinical.pods.length) return;
                    engine.startPodProcessing(0);
                    persist();
                    render();
                });
            }

            function renderAssess() {
                const step = engine.getAssessStep();
                const pod = engine.clinical.pods[engine.clinical.activePodIndex];
                renderBreadcrumb();
                let promptText = step.prompt;
                if (pod && engine.protocol.id === 'recent_event') {
                    promptText = `Aspect: ${pod.label}\n\n${step.prompt}`;
                }
                renderPrompt(promptText);

                let chips = '';
                if (step.ncCategories) {
                    chips = `<div class="guided-nc-chips">${step.ncCategories
                        .map(
                            (c) =>
                                `<button type="button" class="guided-nc-chip" data-nc="${escapeHtml(c.examples[0])}">${c.label}</button>`
                        )
                        .join('')}</div>`;
                }

                body.innerHTML = `
                    <div class="guided-field">
                        <label>${stepLabel(step)}</label>
                        ${fieldInput(step, engine.clinical[step.field])}
                        ${step.field === 'nc' ? chips : ''}
                    </div>
                `;

                const input = document.getElementById(`guided-field-${step.field}`);
                if (step.input === 'checkbox') {
                    input.addEventListener('change', () => {
                        engine.clinical[step.field] = input.checked;
                        persist();
                    });
                } else if (input) {
                    input.addEventListener('input', () => {
                        engine.clinical[step.field] =
                            step.input === 'textarea' ? input.value : input.value;
                        persist();
                    });
                }

                if (step.field === 'nc') {
                    body.querySelectorAll('.guided-nc-chip').forEach((btn) => {
                        btn.addEventListener('click', () => {
                            engine.clinical.nc = btn.getAttribute('data-nc');
                            const ta = document.getElementById('guided-field-nc');
                            if (ta) ta.value = engine.clinical.nc;
                            persist();
                        });
                    });
                }

                bindRange(`guided-field-${step.field}`, step.field);

                const assessPhase = engine.protocol.phases.find((p) => p.id === 'assess');
                const lastStep =
                    assessPhase &&
                    engine.clinical.assessStepIndex >= assessPhase.steps.length - 1;
                let cta = 'Next';
                if (lastStep) {
                    cta =
                        engine.protocol.desensitizeMode === 'movie'
                            ? 'Begin rehearsal (Phase 4)'
                            : 'Begin Phase 4 (Desensitization)';
                }

                footer.innerHTML = `<button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">${cta}</button>`;
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    const s = engine.getAssessStep();
                    const inputEl = document.getElementById(`guided-field-${s.field}`);
                    if (s.input === 'checkbox') {
                        engine.clinical[s.field] = inputEl.checked;
                    } else if (inputEl && s.input !== 'voc' && s.input !== 'sud') {
                        engine.clinical[s.field] = inputEl.value;
                    }
                    if (!engine.canAdvanceAssess()) return;
                    engine.advanceAssess();
                    persist();
                    render();
                });
            }

            function renderDesensitize() {
                const phase = engine.protocol.phases.find((p) => p.id === 'desensitize');
                renderBreadcrumb();
                let hint = phase.prompts.startSet;
                if (engine.shouldSuggestReturnToTarget()) {
                    hint = phase.prompts.returnToTarget;
                } else if (engine.canSuggestInstallation()) {
                    hint = phase.prompts.suggestInstall;
                }
                renderPrompt(hint);

                body.innerHTML = `
                    <div class="guided-field"><label>SUD start</label><div>${engine.clinical.sudInitial ?? '—'}</div></div>
                    <div class="guided-field">
                        <label>SUD now</label>
                        <div class="guided-sud-row">
                            <input type="range" id="guided-sud-now" min="0" max="10" step="1" value="${engine.clinical.sudCurrent ?? 5}">
                            <span id="guided-sud-now-val">${engine.clinical.sudCurrent ?? '—'}</span>
                        </div>
                    </div>
                    <div class="guided-field">
                        <label>Channel note (after set)</label>
                        <textarea id="guided-set-note" rows="2" placeholder="What did the client notice?"></textarea>
                    </div>
                    <div class="guided-set-log"></div>
                `;

                bindRange('guided-sud-now', 'sudCurrent');
                renderSetLog();

                footer.innerHTML = blsFooterButtons('Ready for Installation?');
                bindBlsButtons();
                document.getElementById('guided-log-set').addEventListener('click', () => {
                    const note = document.getElementById('guided-set-note').value;
                    engine.logSet({ note, sud: engine.clinical.sudCurrent });
                    document.getElementById('guided-set-note').value = '';
                    persist();
                    render();
                });
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    engine.goToPhase('install');
                    persist();
                    render();
                });
            }

            function renderRehearse() {
                const phase = engine.protocol.phases.find((p) => p.id === 'rehearse');
                renderBreadcrumb();
                let hint = phase.prompts.startRun;
                if (engine.clinical.bumpUsed) {
                    hint = phase.prompts.suggestInstall;
                } else if (engine.clinical.movieRunCount >= 3) {
                    hint = phase.prompts.suggestInstall;
                }
                renderPrompt(hint);

                const runRows = engine.clinical.movieRuns
                    .map((r) => `<li>Run ${r.n}${r.bump ? ' (bump)' : ''}: ${escapeHtml(r.note || '—')}</li>`)
                    .join('');

                body.innerHTML = `
                    <div class="guided-field"><label>Situation</label><div>${escapeHtml(engine.clinical.futureSituation || engine.clinical.targetLabel || '—')}</div></div>
                    <div class="guided-field"><label>Movie runs</label><ul class="guided-movie-runs">${runRows || '<li>None logged yet</li>'}</ul></div>
                    <div class="guided-field">
                        <label>Note (after run)</label>
                        <textarea id="guided-set-note" rows="2" placeholder="What did the client notice in the movie?"></textarea>
                    </div>
                `;

                footer.innerHTML = `
                    <div class="guided-footer-stack">
                        <div class="guided-footer-bls guided-footer-bls-3">
                            <button type="button" class="guided-btn guided-btn-secondary" id="guided-bls-toggle">${hostApi && hostApi.isRunning() ? 'Stop BLS' : 'Start BLS'}</button>
                            <button type="button" class="guided-btn guided-btn-secondary" id="guided-log-set">Log run</button>
                            <button type="button" class="guided-btn guided-btn-secondary" id="guided-bump-btn">Bump</button>
                        </div>
                        <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">Ready for Installation?</button>
                    </div>`;
                bindBlsButtons();
                document.getElementById('guided-log-set').addEventListener('click', () => {
                    const note = document.getElementById('guided-set-note').value;
                    engine.logMovieRun({ note, bump: false });
                    document.getElementById('guided-set-note').value = '';
                    persist();
                    render();
                });
                document.getElementById('guided-bump-btn').addEventListener('click', () => {
                    renderPrompt(phase.prompts.bumpIntro);
                    const note = window.prompt('Bump complication note (optional):', '') || '';
                    engine.logMovieRun({ note, bump: true });
                    persist();
                    render();
                });
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    engine.goToPhase('install');
                    persist();
                    render();
                });
            }

            function renderWholeEvent() {
                const phase = engine.protocol.phases.find((p) => p.id === 'wholeEvent');
                renderBreadcrumb();
                renderPrompt(phase?.prompts?.startSet || 'Silent review of whole episode with BLS.');

                body.innerHTML = `
                    <div class="guided-field"><label>Episode</label><div>${escapeHtml(engine.clinical.eventLabel || '—')}</div></div>
                    <div class="guided-field">
                        <label>SUD (whole event)</label>
                        <div class="guided-sud-row">
                            <input type="range" id="guided-sud-whole" min="0" max="10" step="1" value="${engine.clinical.wholeEventSud ?? 5}">
                            <span id="guided-sud-whole-val">${engine.clinical.wholeEventSud ?? '—'}</span>
                        </div>
                    </div>
                    <div class="guided-field">
                        <label>Note (after set)</label>
                        <textarea id="guided-set-note" rows="2"></textarea>
                    </div>
                    <div class="guided-set-log"></div>
                `;

                const input = document.getElementById('guided-sud-whole');
                const val = document.getElementById('guided-sud-whole-val');
                input?.addEventListener('input', () => {
                    engine.clinical.wholeEventSud = parseInt(input.value, 10);
                    if (val) val.textContent = input.value;
                    persist();
                });

                renderSetLog(engine.clinical.wholeEventSets);

                footer.innerHTML = blsFooterButtons('Proceed to final Closure');
                bindBlsButtons();
                document.getElementById('guided-log-set').addEventListener('click', () => {
                    const note = document.getElementById('guided-set-note').value;
                    engine.logWholeEventSet({ note, sud: engine.clinical.wholeEventSud });
                    document.getElementById('guided-set-note').value = '';
                    persist();
                    render();
                });
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    engine.goToPhase('closure');
                    persist();
                    render();
                });
            }

            function renderInstall() {
                renderBreadcrumb();
                const installPhase = engine.protocol.phases.find((p) => p.id === 'install');
                renderPrompt(installPhase?.installPrompt || '');

                body.innerHTML = `
                    <div class="guided-field">
                        <label>Positive cognition</label>
                        <textarea id="guided-pc-install" rows="2">${escapeHtml(engine.clinical.pc || '')}</textarea>
                    </div>
                    <div class="guided-field">
                        <label>VOC (1–7)</label>
                        <div class="guided-sud-row">
                            <input type="range" id="guided-voc-install" min="1" max="7" value="${engine.clinical.voc}">
                            <span id="guided-voc-install-val">${engine.clinical.voc}</span>
                        </div>
                    </div>
                `;

                document.getElementById('guided-pc-install').addEventListener('input', (e) => {
                    engine.clinical.pc = e.target.value;
                    persist();
                });
                bindRange('guided-voc-install', 'voc');

                footer.innerHTML = `
                    <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">Ready for Body Scan?</button>
                `;
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    engine.goToPhase('bodyScan');
                    persist();
                    render();
                });
            }

            function renderBodyScan() {
                renderBreadcrumb();
                const phase = engine.protocol.phases.find((p) => p.id === 'bodyScan');
                renderPrompt(phase?.steps?.[0]?.prompt || '');

                body.innerHTML = `
                    <div class="guided-field">
                        <label><input type="checkbox" id="guided-body-clear" ${engine.clinical.bodyScanClear ? 'checked' : ''}> Body scan clear (no disturbance)</label>
                    </div>
                `;

                document.getElementById('guided-body-clear').addEventListener('change', (e) => {
                    engine.clinical.bodyScanClear = e.target.checked;
                    persist();
                });

                footer.innerHTML = `
                    <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">Proceed to Closure</button>
                `;
                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    engine.goToPhase('closure');
                    persist();
                    render();
                });
            }

            function renderClosure() {
                renderBreadcrumb();
                renderPrompt('Choose whether reprocessing is complete or the session ends incomplete.');

                body.innerHTML = `
                    <div class="guided-field">
                        <label><input type="radio" name="closure" value="complete" ${engine.clinical.closureType === 'complete' ? 'checked' : ''}> Complete</label>
                        <label style="display:block;margin-top:0.35rem;"><input type="radio" name="closure" value="incomplete" ${engine.clinical.closureType === 'incomplete' ? 'checked' : ''}> Incomplete</label>
                    </div>
                    <div id="guided-closure-copy" class="guided-prompt" style="margin-top:0.75rem;"></div>
                `;

                const copyEl = document.getElementById('guided-closure-copy');
                const branches = engine.protocol.phases.find((p) => p.id === 'closure').branches;

                function updateClosureCopy() {
                    const t = engine.clinical.closureType;
                    if (t === 'complete') {
                        copyEl.textContent = branches.complete.debrief;
                    } else if (t === 'incomplete') {
                        copyEl.textContent =
                            'Incomplete closure: do not take SUD/VOC on the open target. ' +
                            branches.incomplete.steps.join(' ');
                    } else {
                        copyEl.textContent = '';
                    }
                }

                body.querySelectorAll('input[name="closure"]').forEach((r) => {
                    r.addEventListener('change', () => {
                        if (r.checked) {
                            engine.clinical.closureType = r.value;
                            persist();
                            updateClosureCopy();
                        }
                    });
                });
                updateClosureCopy();

                let primaryLabel = 'Finish session';
                if (engine.protocol.id === 'recent_event') {
                    const unprocessed = engine.clinical.pods.filter((p) => !p.assessComplete);
                    if (unprocessed.length > 1) {
                        primaryLabel = 'Next aspect →';
                    } else if (unprocessed.length === 1) {
                        primaryLabel = 'Whole event pass →';
                    }
                }

                footer.innerHTML = `
                    <button type="button" class="guided-btn guided-btn-secondary" id="guided-download-closure">Download session report</button>
                    <button type="button" class="guided-btn-ghost guided-link-btn" id="guided-copy-summary">Copy to clipboard</button>
                    <button type="button" class="guided-btn guided-btn-primary" id="guided-primary-btn">${primaryLabel}</button>
                `;

                document.getElementById('guided-download-closure')?.addEventListener('click', () => {
                    openDownloadModal();
                });

                document.getElementById('guided-copy-summary')?.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(engine.buildReport(getHostMeta()));
                    } catch (e) {
                        window.prompt('Copy session report:', engine.buildReport(getHostMeta()));
                    }
                });

                document.getElementById('guided-primary-btn').addEventListener('click', () => {
                    if (engine.protocol.id === 'recent_event') {
                        const unprocessed = engine.clinical.pods.filter((p) => !p.assessComplete);
                        if (unprocessed.length > 1 || unprocessed.length === 1) {
                            engine.advanceAfterPodClosure();
                            persist();
                            render();
                            return;
                        }
                    }
                    persist();
                    if (needsDownloadWarning()) {
                        openDownloadModal();
                    } else {
                        alert(
                            'Session complete. Download a report anytime from the header if you need another copy for your EHR.'
                        );
                    }
                });
            }

            function render() {
                if (blsSetDisplay) {
                    const n =
                        engine.clinical.phaseId === 'wholeEvent'
                            ? engine.clinical.wholeEventSets.length
                            : engine.clinical.sets.length;
                    blsSetDisplay.textContent = String(n);
                }
                const phaseId = engine.clinical.phaseId;
                if (!engine.clinical.setupComplete || phaseId === 'setup') renderSetup();
                else if (phaseId === 'pods') renderPods();
                else if (phaseId === 'assess') renderAssess();
                else if (phaseId === 'desensitize') renderDesensitize();
                else if (phaseId === 'rehearse') renderRehearse();
                else if (phaseId === 'wholeEvent') renderWholeEvent();
                else if (phaseId === 'install') renderInstall();
                else if (phaseId === 'bodyScan') renderBodyScan();
                else if (phaseId === 'closure') renderClosure();
                syncDownloadButton();
            }

            guidanceToggle?.addEventListener('change', () => {
                engine.clinical.guidanceEnabled = guidanceToggle.checked;
                persist();
                render();
            });
            if (guidanceToggle) guidanceToggle.checked = engine.clinical.guidanceEnabled;

            const protocolFab = document.getElementById('guided-protocol-fab');

            function syncProtocolFab() {
                const collapsed = root.classList.contains('collapsed');
                if (protocolFab) {
                    protocolFab.textContent = collapsed ? 'Show protocol' : 'Hide protocol';
                    protocolFab.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
                }
            }

            function setPanelCollapsed(collapsed) {
                root.classList.toggle('collapsed', collapsed);
                syncProtocolFab();
            }

            function togglePanel() {
                setPanelCollapsed(!root.classList.contains('collapsed'));
                return !root.classList.contains('collapsed');
            }

            protocolFab?.addEventListener('click', (e) => {
                e.preventDefault();
                togglePanel();
            });
            syncProtocolFab();

            if (!engine.clinical.setupComplete) {
                setPanelCollapsed(false);
            }

            shareBadge?.addEventListener('click', async () => {
                if (!shareViewerUrl) return;
                try {
                    await navigator.clipboard.writeText(shareViewerUrl);
                    shareBadge.textContent = 'Copied!';
                } catch (e) {
                    window.prompt('Copy client link:', shareViewerUrl);
                    shareBadge.textContent = 'Copied!';
                }
                setTimeout(() => updateShareBadge(), 2000);
            });

            return {
                setShareState,
                setPanelCollapsed,
                togglePanel,
                refresh: render,
                getClinical: () => engine.clinical,
                isResettingSession: () => resettingSession,
            };
        },
    };
})(typeof window !== 'undefined' ? window : global);
