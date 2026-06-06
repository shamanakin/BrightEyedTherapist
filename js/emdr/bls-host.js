/**
 * EMDR BLS host (therapist) — bottom toolbar, session share
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const C = () => global.BET.BlsConstants;
    const Core = () => global.BET.BlsCore;
    const Sync = () => global.BET.BlsSync;

    const HOST_PUSH_MS = 1500;
    const PATH_CYCLE = () => [C().PATH_HORIZONTAL, C().PATH_DIAGONAL, C().PATH_SACCADIC];

    global.BET.BlsHost = {
        init(options) {
            options = options || {};
            const guidedMode = !!options.guidedMode;
            const analyticsApp = guidedMode ? 'emdr-guided' : 'emdr';
            const onSetComplete = typeof options.onSetComplete === 'function' ? options.onSetComplete : null;
            const onShareChange = typeof options.onShareChange === 'function' ? options.onShareChange : null;
            const helpExtraHtml = options.helpExtraHtml || '';

            const els = {
                container: document.getElementById('bls-container'),
                stimulus: document.getElementById('stimulus'),
                lightbarContainer: document.getElementById('lightbar-container'),
                lightbar: document.getElementById('lightbar'),
                toggleBtn: document.getElementById('toggle-btn'),
                setCount: document.getElementById('set-count'),
                settingsModal: document.getElementById('settings-modal'),
                modalTitle: document.getElementById('modal-title'),
                modalContent: document.getElementById('modal-content'),
                modalCloseBtn: document.getElementById('modal-close-btn'),
                speedBtn: document.getElementById('speed-btn'),
                modeBtn: document.getElementById('mode-btn'),
                colorBtn: document.getElementById('color-btn'),
                pathBtn: document.getElementById('path-btn'),
                pathIconHorizontal: document.getElementById('path-icon-horizontal'),
                pathIconDiagonal: document.getElementById('path-icon-diagonal'),
                pathIconSaccadic: document.getElementById('path-icon-saccadic'),
                pathLabel: document.getElementById('path-label'),
                dotSizeControl: document.getElementById('dot-size-control'),
                lightbarSizeControl: document.getElementById('lightbar-size-control'),
                dotSizeSlider: document.getElementById('dot-size-slider'),
                lightbarScaleSlider: document.getElementById('lightbar-scale-slider'),
                audioBtn: document.getElementById('audio-btn'),
                audioOnIcon: document.getElementById('audio-on-icon'),
                audioOffIcon: document.getElementById('audio-off-icon'),
                fullscreenBtn: document.getElementById('fullscreen-btn'),
                shareBtn: document.getElementById('share-btn'),
                helpBtn: document.getElementById('help-btn'),
                dotIcon: document.getElementById('dot-icon'),
                lightbarIcon: document.getElementById('lightbar-icon'),
            };

            const state = C().defaultState();
            const audio = Core().createAudioController();
            let animationFrameId = null;
            let animCtx = null;
            let lastSetState = 0;
            let setCounter = 0;
            let currentSessionToken = null;
            let sessionUpdateInterval = null;
            let _emdrSessionStart = null;
            let sizeSliderDragging = false;
            let sizeSyncTimer = null;

            function openModal(title, html) {
                els.modalTitle.textContent = title;
                els.modalContent.innerHTML = html;
                els.settingsModal.classList.remove('hidden');
            }

            function closeModal() {
                els.settingsModal?.classList.add('hidden');
            }

            function showToast(message, type) {
                const t = document.createElement('div');
                t.className = 'emdr-toast';
                t.textContent = message;
                t.style.background = type === 'error' ? '#dc2626' : '#2C5558';
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 4000);
            }

            function buildAnimCtx() {
                return {
                    startTime: 0,
                    halfCycleMs: Sync().getHalfCycleMs(state.speed),
                    containerW: els.container.clientWidth,
                    containerH: els.container.clientHeight,
                    pattern: state.pattern,
                    path: state.path,
                    dotSize: state.dotSize,
                    color: state.color,
                    stimulusEl: els.stimulus,
                    lightbarEl: els.lightbar,
                    audio,
                };
            }

            function animate(timestamp) {
                if (!animCtx) animCtx = buildAnimCtx();
                animCtx.containerW = els.container.clientWidth;
                animCtx.containerH = els.container.clientHeight;
                const { setState } = Core().stepFrame(timestamp, animCtx);
                if (setState !== lastSetState) {
                    if (setState === 2) {
                        setCounter++;
                        els.setCount.textContent = String(setCounter);
                        audio.playPannedTone(1.0);
                        if (onSetComplete) onSetComplete(setCounter);
                    } else if (setState === 4) {
                        audio.playPannedTone(-1.0);
                    }
                }
                lastSetState = setState;
                animationFrameId = requestAnimationFrame(animate);
            }

            function updateUI() {
                animCtx = buildAnimCtx();
                if (state.pattern === 'dot') {
                    els.stimulus.style.display = 'block';
                    els.lightbarContainer.style.display = 'none';
                    els.dotIcon.classList.remove('hidden');
                    els.lightbarIcon.classList.add('hidden');
                    Core().applyDotSize(els.stimulus, state.dotSize);
                } else {
                    els.stimulus.style.display = 'none';
                    els.lightbarContainer.style.display = 'block';
                    els.dotIcon.classList.add('hidden');
                    els.lightbarIcon.classList.remove('hidden');
                    refreshLightbarGeometry();
                }

                els.stimulus.style.backgroundColor = state.color;
                const colorKey = Object.keys(C().COLORS_MAP).find((k) => C().COLORS_MAP[k].hex === state.color);
                els.colorBtn.classList.remove('text-white', 'text-teal-300', 'text-indigo-300', 'text-yellow-300', 'text-sky-300');
                els.colorBtn.classList.add(colorKey ? C().COLORS_MAP[colorKey].class : 'text-sky-300');

                const pathUi = {
                    [C().PATH_HORIZONTAL]: {
                        label: 'Horiz',
                        title: 'Horizontal sweep',
                        icon: els.pathIconHorizontal,
                    },
                    [C().PATH_DIAGONAL]: {
                        label: 'Diag',
                        title: 'Diagonal sweep',
                        icon: els.pathIconDiagonal,
                    },
                    [C().PATH_SACCADIC]: {
                        label: 'Saccade',
                        title: 'Left–right jumps (dot only)',
                        icon: els.pathIconSaccadic,
                    },
                };
                [els.pathIconHorizontal, els.pathIconDiagonal, els.pathIconSaccadic].forEach((el) => {
                    el?.classList.add('hidden');
                });
                const activePath = pathUi[state.path] || pathUi[C().PATH_HORIZONTAL];
                activePath.icon?.classList.remove('hidden');
                if (els.pathLabel) els.pathLabel.textContent = activePath.label;
                if (els.pathBtn) els.pathBtn.title = activePath.title;

                syncSizeControls();

                if (state.isRunning) {
                    cancelAnimationFrame(animationFrameId);
                    animCtx.startTime = performance.now();
                    lastSetState = 0;
                    animationFrameId = requestAnimationFrame(animate);
                }
            }

            function collectSessionState() {
                return Sync().exportSessionPayload({
                    ...state,
                    setCount: setCounter,
                    isRunning: state.isRunning,
                    lastEventId: Date.now(),
                });
            }

            async function sendSessionUpdate() {
                if (!currentSessionToken || typeof Auth === 'undefined') return;
                try {
                    await Auth.apiRequest('/emdr/update_session.php', {
                        method: 'POST',
                        body: JSON.stringify({
                            sessionToken: currentSessionToken,
                            state: collectSessionState(),
                        }),
                    });
                } catch (e) {
                    console.error('Failed to update session:', e);
                }
            }

            function startBLS() {
                if (state.isRunning) return;
                if (!_emdrSessionStart) {
                    _emdrSessionStart = Date.now();
                    if (!guidedMode && typeof Auth !== 'undefined') Auth.trackAppUsage(analyticsApp, 'start');
                }
                audio.init();
                state.isRunning = true;
                setCounter = 0;
                lastSetState = 0;
                els.setCount.textContent = '0';
                animCtx = buildAnimCtx();
                animCtx.startTime = performance.now();
                animationFrameId = requestAnimationFrame(animate);
                els.toggleBtn.textContent = 'Stop BLS (Spacebar)';
                els.toggleBtn.setAttribute('aria-pressed', 'true');
                sendSessionUpdate();
                if (currentSessionToken) {
                    sessionUpdateInterval = setInterval(sendSessionUpdate, HOST_PUSH_MS);
                }
            }

            function stopBLS() {
                if (!state.isRunning) return;
                state.isRunning = false;
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                if (sessionUpdateInterval) {
                    clearInterval(sessionUpdateInterval);
                    sessionUpdateInterval = null;
                }
                setCounter = 0;
                lastSetState = 0;
                els.setCount.textContent = '0';
                els.toggleBtn.textContent = 'Start BLS (Spacebar)';
                els.toggleBtn.setAttribute('aria-pressed', 'false');
                sendSessionUpdate();
                if (state.pattern === 'dot') {
                    Core().centerDot(els.stimulus, els.container, state.dotSize);
                } else {
                    Core().updateLightbarHighlight(els.lightbar, 0.5, state.color);
                }
                audio.mute();
            }

            function toggleBLS() {
                if (state.isRunning) stopBLS();
                else startBLS();
            }

            function cyclePath() {
                const cycle = PATH_CYCLE();
                const idx = cycle.indexOf(state.path);
                let next = cycle[(idx + 1) % cycle.length];
                if (state.pattern === 'lightbar' && next === C().PATH_SACCADIC) {
                    next = C().PATH_HORIZONTAL;
                }
                state.path = next;
                updateUI();
                if (!state.isRunning && state.pattern === 'dot') {
                    Core().centerDot(els.stimulus, els.container, state.dotSize);
                }
                sendSessionUpdate();
            }

            function refreshLightbarGeometry() {
                Core().updateLightbarGeometry(
                    els.lightbarContainer,
                    els.lightbar,
                    els.container.clientWidth,
                    els.container.clientHeight,
                    state.path,
                    state.color,
                    state.lightbarScale
                );
            }

            function scheduleSizeSync() {
                clearTimeout(sizeSyncTimer);
                sizeSyncTimer = setTimeout(sendSessionUpdate, 120);
            }

            function syncSizeControls() {
                els.dotSizeControl?.classList.toggle('bls-size-control-hidden', state.pattern !== 'dot');
                els.lightbarSizeControl?.classList.toggle(
                    'bls-size-control-hidden',
                    state.pattern !== 'lightbar'
                );
                if (sizeSliderDragging) return;
                if (els.dotSizeSlider) {
                    els.dotSizeSlider.value = String(state.dotSize);
                    els.dotSizeSlider.title = `Dot size — ${Sync().dotSizeLabel(state.dotSize)}`;
                }
                if (els.lightbarScaleSlider) {
                    els.lightbarScaleSlider.value = String(Math.round(state.lightbarScale * 100));
                }
            }

            function setDotSize(px, options) {
                const sync = !options || options.sync !== false;
                state.dotSize = Sync().normalizeDotSize(px);
                if (animCtx) animCtx.dotSize = state.dotSize;
                Core().applyDotSize(els.stimulus, state.dotSize);
                if (!state.isRunning && state.pattern === 'dot') {
                    Core().centerDot(els.stimulus, els.container, state.dotSize);
                }
                if (!sizeSliderDragging && els.dotSizeSlider) {
                    els.dotSizeSlider.value = String(state.dotSize);
                    els.dotSizeSlider.title = `Dot size — ${Sync().dotSizeLabel(state.dotSize)}`;
                }
                if (sync) scheduleSizeSync();
            }

            function setLightbarScaleFromPercent(percent, options) {
                const sync = !options || options.sync !== false;
                state.lightbarScale = Sync().normalizeLightbarScale(parseFloat(percent) / 100);
                if (state.pattern === 'lightbar') {
                    refreshLightbarGeometry();
                }
                if (!sizeSliderDragging && els.lightbarScaleSlider) {
                    els.lightbarScaleSlider.value = String(Math.round(state.lightbarScale * 100));
                }
                if (sync) scheduleSizeSync();
            }

            function bindSizeSlider(slider, onValue, onRelease) {
                if (!slider) return;
                const start = () => {
                    sizeSliderDragging = true;
                };
                const end = () => {
                    sizeSliderDragging = false;
                    if (typeof onRelease === 'function') onRelease();
                    sendSessionUpdate();
                };
                slider.addEventListener('pointerdown', start);
                slider.addEventListener('pointerup', end);
                slider.addEventListener('pointercancel', end);
                slider.addEventListener('input', (e) => {
                    onValue(e.target.value, { sync: false });
                    scheduleSizeSync();
                });
            }

            function setAudioEnabled(on) {
                state.audioEnabled = on;
                audio.setEnabled(on);
                if (on) {
                    els.audioBtn.classList.remove('text-gray-400');
                    els.audioBtn.classList.add('text-indigo-300');
                    els.audioOnIcon.classList.remove('hidden');
                    els.audioOffIcon.classList.add('hidden');
                } else {
                    els.audioBtn.classList.remove('text-indigo-300');
                    els.audioBtn.classList.add('text-gray-400');
                    els.audioOnIcon.classList.add('hidden');
                    els.audioOffIcon.classList.remove('hidden');
                }
                sendSessionUpdate();
            }

            function openSpeedModal() {
                let html = '<p class="text-sm text-gray-300 mb-3">A full set is one full left → right → left cycle.</p>';
                Object.keys(C().SPEED_MAP).forEach((k) => {
                    const s = C().SPEED_MAP[k];
                    const isCurrent = parseInt(k, 10) === state.speed;
                    html += `<button data-speed="${k}" class="w-full text-left p-3 rounded-lg transition ${isCurrent ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'} speed-option">
                        <span class="font-semibold">${s.name}</span>
                        <p class="text-xs text-gray-400 mt-1">${s.desc}</p>
                    </button>`;
                });
                openModal('Speed Settings', html);
                els.modalContent.querySelectorAll('.speed-option').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        state.speed = parseInt(e.currentTarget.dataset.speed, 10);
                        updateUI();
                        closeModal();
                        sendSessionUpdate();
                    });
                });
            }

            function openColorModal() {
                let html = '<div class="grid grid-cols-2 gap-4">';
                Object.values(C().COLORS_MAP).forEach((c) => {
                    const isCurrent = c.hex === state.color;
                    html += `<button data-color="${c.hex}" class="color-option p-4 rounded-lg shadow-md flex flex-col items-center justify-center transition ${isCurrent ? 'bg-indigo-600 ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600'}">
                        <div class="h-8 w-8 rounded-full shadow-lg" style="background-color:${c.hex};"></div>
                        <span class="mt-2 text-sm ${c.class}">${c.name}</span>
                    </button>`;
                });
                html += '</div>';
                openModal('Stimulus Color', html);
                els.modalContent.querySelectorAll('.color-option').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        state.color = e.currentTarget.dataset.color;
                        updateUI();
                        closeModal();
                        sendSessionUpdate();
                    });
                });
            }

            function helpKbd(label) {
                return `<kbd class="help-kbd">${label}</kbd>`;
            }

            function helpIconRow(btnId, name, desc) {
                const btn = document.getElementById(btnId);
                let iconHtml = '';
                if (btn) {
                    const clone = btn.cloneNode(true);
                    clone.removeAttribute('id');
                    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
                    clone.classList.remove('share-btn-active', 'is-active');
                    iconHtml = clone.outerHTML;
                }
                return `<div class="help-row"><div class="help-row-icon">${iconHtml}</div><div class="help-row-text"><strong>${name}</strong><span>${desc}</span></div></div>`;
            }

            function helpSizeRow() {
                return `<div class="help-row"><div class="help-row-icon"><div class="help-size-icon"><label>Size</label><input type="range" min="28" max="90" value="50" tabindex="-1" aria-hidden="true"></div></div><div class="help-row-text"><strong>Size</strong><span>Slider for dot or bar size.</span></div></div>`;
            }

            function openHelpModal() {
                const html = `
                  <div class="help-sheet">
                    <section>
                      <h4>Start here</h4>
                      <ol>
                        <li>Have your client settle where they can comfortably track the whole screen.</li>
                        <li>Choose a path, speed, and size together — what matters is what your client tracks easily.</li>
                        <li>Press <strong>Start BLS</strong> or tap ${helpKbd('Space')}. Same to stop between sets.</li>
                        <li>Telehealth? Click <strong>Share</strong> and send your client the link.</li>
                      </ol>
                    </section>
                    <section>
                      <h4>Controls</h4>
                      ${helpIconRow('speed-btn', 'Speed', 'How fast the target moves. Start slow; adjust to your client\'s tracking.')}
                      ${helpIconRow('mode-btn', 'Mode', 'Moving dot or full lightbar.')}
                      ${helpIconRow('color-btn', 'Color', 'Pick what your client tracks comfortably against the dark screen.')}
                      ${helpIconRow('path-btn', 'Path', 'Horizontal (smooth sweep), Diagonal, or Saccade (instant left-right jumps — some clients track jumps better than sweeps).')}
                      ${helpSizeRow()}
                      ${helpIconRow('audio-btn', 'Audio', 'Tones that alternate left-right in sync with the visual. Headphones on the client\'s side work best.')}
                      ${helpIconRow('fullscreen-btn', 'Full', 'Fullscreen for sessions.')}
                      ${helpIconRow('share-btn', 'Share', 'Creates a private link your client opens on their end. They see only the moving target — never your controls and never any clinical information.')}
                    </section>
                    ${helpExtraHtml}
                    <section>
                      <h4>Keys</h4>
                      <div class="help-key-row">${helpKbd('Space')} <span>Start / stop a set</span></div>
                      <div class="help-key-row">${helpKbd('Esc')} <span>Close any window</span></div>
                    </section>
                    <p class="help-footer">Sets are counted at the bottom of the screen. For trained EMDR clinicians — pace within your client's window of tolerance.</p>
                  </div>`;
                openModal('Help — EMDR BLS', html);
            }

            let lastViewerUrl = null;

            async function endShare() {
                if (currentSessionToken && typeof Auth !== 'undefined') {
                    try {
                        await Auth.apiRequest('/emdr/end_session.php', {
                            method: 'POST',
                            body: JSON.stringify({ sessionToken: currentSessionToken }),
                        });
                    } catch (e) {
                        console.error('[Host] Failed to end session:', e);
                    }
                }
                currentSessionToken = null;
                lastViewerUrl = null;
                els.shareBtn.classList.remove('share-btn-active');
                if (onShareChange) onShareChange(false, null, null);
                if (sessionUpdateInterval) {
                    clearInterval(sessionUpdateInterval);
                    sessionUpdateInterval = null;
                }
                closeModal();
            }

            async function createSession() {
                if (typeof Auth === 'undefined') return;
                if (currentSessionToken && lastViewerUrl) {
                    showShareModal(lastViewerUrl);
                    return;
                }
                try {
                    const response = await Auth.apiRequest('/emdr/create_session.php', {
                        method: 'POST',
                        body: JSON.stringify({ guided: guidedMode }),
                    });
                    if (response.success) {
                        currentSessionToken = response.sessionToken;
                        lastViewerUrl = response.viewerUrl;
                        els.shareBtn.classList.add('share-btn-active');
                        try {
                            if (onShareChange) {
                                onShareChange(true, currentSessionToken, response.viewerUrl);
                            }
                        } catch (shareCbErr) {
                            console.error('[BlsHost] onShareChange failed:', shareCbErr);
                        }
                        showShareModal(response.viewerUrl);
                        await sendSessionUpdate();
                    } else {
                        showToast(response.error || 'Failed to create sharing session', 'error');
                    }
                } catch (e) {
                    console.error('Session creation failed:', e);
                    showToast(e.message || 'Failed to create sharing session', 'error');
                }
            }

            function escapeAttr(value) {
                return String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;');
            }

            function showShareModal(viewerUrl) {
                openModal('Get Link to Watch', `
                    <p class="mb-4">Share this link with your client:</p>
                    <div class="bg-gray-700 p-3 rounded-lg mb-4">
                        <input type="text" value="${escapeAttr(viewerUrl)}" readonly class="w-full bg-transparent text-white text-sm font-mono" id="viewer-url-input">
                    </div>
                    <div class="flex space-x-2">
                        <button id="copy-url-btn" class="flex-1 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">Copy Link</button>
                        <button id="stop-sharing-btn" class="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">Stop Sharing</button>
                    </div>`);
                document.getElementById('copy-url-btn').addEventListener('click', () => {
                    const input = document.getElementById('viewer-url-input');
                    input.select();
                    document.execCommand('copy');
                    const btn = document.getElementById('copy-url-btn');
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
                });
                document.getElementById('stop-sharing-btn').addEventListener('click', () => {
                    endShare();
                });
            }

            function endSessionBestEffort() {
                if (!currentSessionToken || typeof Auth === 'undefined') return;
                const payload = JSON.stringify({
                    sessionToken: currentSessionToken,
                    authToken: Auth.getToken(),
                });
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/emdr/end_session.php', new Blob([payload], { type: 'application/json' }));
                    return;
                }
                fetch('/api/emdr/end_session.php', {
                    method: 'POST',
                    keepalive: true,
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                }).catch(() => {});
            }

            Core().centerDot(els.stimulus, els.container, state.dotSize);
            updateUI();
            setAudioEnabled(false);

            els.toggleBtn.addEventListener('click', toggleBLS);
            els.speedBtn.addEventListener('click', openSpeedModal);
            els.colorBtn.addEventListener('click', openColorModal);
            els.pathBtn.addEventListener('click', cyclePath);
            bindSizeSlider(els.dotSizeSlider, (value) => setDotSize(value, { sync: false }));
            bindSizeSlider(els.lightbarScaleSlider, (value) =>
                setLightbarScaleFromPercent(value, { sync: false })
            );
            if (els.dotSizeSlider) {
                els.dotSizeSlider.min = String(C().DOT_SIZE_MIN);
                els.dotSizeSlider.max = String(C().DOT_SIZE_MAX);
                els.dotSizeSlider.value = String(state.dotSize);
            }
            if (els.lightbarScaleSlider) {
                els.lightbarScaleSlider.min = String(Math.round(C().LIGHTBAR_SCALE_MIN * 100));
                els.lightbarScaleSlider.max = String(Math.round(C().LIGHTBAR_SCALE_MAX * 100));
                els.lightbarScaleSlider.value = String(Math.round(state.lightbarScale * 100));
            }
            els.modeBtn.addEventListener('click', () => {
                state.pattern = state.pattern === 'dot' ? 'lightbar' : 'dot';
                if (state.pattern === 'lightbar' && state.path === C().PATH_SACCADIC) {
                    state.path = C().PATH_HORIZONTAL;
                }
                updateUI();
                if (!state.isRunning && state.pattern === 'dot') {
                    Core().centerDot(els.stimulus, els.container, state.dotSize);
                }
                sendSessionUpdate();
            });
            els.shareBtn.addEventListener('click', createSession);
            els.helpBtn.addEventListener('click', openHelpModal);
            els.modalCloseBtn.addEventListener('click', closeModal);
            els.audioBtn.addEventListener('click', () => {
                audio.init();
                setAudioEnabled(!state.audioEnabled);
            });
            els.fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch((err) => console.error(err));
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            });

            function shouldBlockSpaceHotkey() {
                const el = document.activeElement;
                if (!el || el === document.body || el === document.documentElement) {
                    return false;
                }
                if (!(el instanceof HTMLElement)) return false;
                if (el.isContentEditable) return true;
                const tag = el.tagName;
                if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'INPUT' || tag === 'BUTTON') {
                    return true;
                }
                if (guidedMode && el.closest('#guided-panel')) return true;
                if (!els.settingsModal.classList.contains('hidden')) return true;
                return false;
            }

            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    if (shouldBlockSpaceHotkey()) return;
                    if (els.settingsModal.classList.contains('hidden')) {
                        e.preventDefault();
                        toggleBLS();
                    }
                } else if (e.code === 'Escape' && !els.settingsModal.classList.contains('hidden')) {
                    closeModal();
                }
            });

            els.settingsModal.addEventListener('click', (e) => {
                if (e.target === els.settingsModal) closeModal();
            });

            window.addEventListener('resize', () => {
                if (!state.isRunning && state.pattern === 'dot') {
                    Core().centerDot(els.stimulus, els.container, state.dotSize);
                } else if (state.pattern === 'lightbar') {
                    refreshLightbarGeometry();
                }
            });

            window.addEventListener('beforeunload', () => {
                if (_emdrSessionStart && !guidedMode && typeof Auth !== 'undefined') {
                    const dur = Math.round((Date.now() - _emdrSessionStart) / 1000);
                    Auth.trackAppUsage(analyticsApp, 'end', dur);
                }
                if (currentSessionToken) endSessionBestEffort();
            });
            window.addEventListener('pagehide', () => {
                if (currentSessionToken) endSessionBestEffort();
            });

            return {
                getSessionToken: () => currentSessionToken,
                getSetCount: () => setCounter,
                isRunning: () => state.isRunning,
                stopBLS,
                startBLS,
                endShare,
            };
        },
    };
})(typeof window !== 'undefined' ? window : global);
