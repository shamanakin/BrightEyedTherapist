/**
 * EMDR BLS viewer — polls host session, mirrors stimulation
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const C = () => global.BET.BlsConstants;
    const Core = () => global.BET.BlsCore;
    const Sync = () => global.BET.BlsSync;

    const VIEWER_POLL_MS = 500;
    const DEBUG = false;

    global.BET.BlsViewer = {
        init() {
            const els = {
                container: document.getElementById('viewer-container'),
                stimulus: document.getElementById('stimulus'),
                lightbarContainer: document.getElementById('lightbar-container'),
                lightbar: document.getElementById('lightbar'),
                statusIndicator: document.getElementById('status-indicator'),
                viewerGuidance: document.getElementById('viewer-guidance'),
                lockOverlay: document.getElementById('viewer-lock-overlay'),
                startBtn: document.getElementById('start-watching-btn-large'),
            };

            const state = C().defaultState();
            const audio = Core().createAudioController();
            let animationFrameId = null;
            let animCtx = null;
            let lastSetState = 0;
            let sessionToken = null;
            let pollInterval = null;
            let audioUnlocked = false;
            let remoteAudioEnabled = false;

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
                if (!state.isRunning) return;
                if (!animCtx) animCtx = buildAnimCtx();
                animCtx.containerW = els.container.clientWidth;
                animCtx.containerH = els.container.clientHeight;
                const { setState, panVal } = Core().stepFrame(timestamp, animCtx);
                if (remoteAudioEnabled) {
                    if (setState !== lastSetState) {
                        if (setState === 2) audio.playPannedTone(1.0, true);
                        else if (setState === 4) audio.playPannedTone(-1.0, true);
                    }
                }
                lastSetState = setState;
                animationFrameId = requestAnimationFrame(animate);
            }

            function updateDisplay() {
                Core().applyDotSize(els.stimulus, state.dotSize);
                els.stimulus.style.backgroundColor = state.color;
                if (state.pattern === 'dot') {
                    els.stimulus.style.display = 'block';
                    els.lightbarContainer.style.display = 'none';
                } else {
                    els.stimulus.style.display = 'none';
                    els.lightbarContainer.style.display = 'block';
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
                if (!state.isRunning) {
                    if (state.pattern === 'dot') {
                        Core().centerDot(els.stimulus, els.container, state.dotSize);
                    } else {
                        Core().updateLightbarHighlight(els.lightbar, 0.5, state.color);
                    }
                }
            }

            function startAnimation() {
                if (state.isRunning) return;
                audio.init();
                state.isRunning = true;
                animCtx = buildAnimCtx();
                animCtx.startTime = performance.now();
                lastSetState = 0;
                animationFrameId = requestAnimationFrame(animate);
            }

            function stopAnimation() {
                if (!state.isRunning) return;
                state.isRunning = false;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                animCtx = null;
                lastSetState = 0;
                updateDisplay();
                audio.mute();
            }

            function applyRemoteState(raw) {
                const next = Sync().normalizeIncomingState(Sync().extractBlsPayload(raw));
                const settingsChanged =
                    state.pattern !== next.pattern ||
                    state.path !== next.path ||
                    state.speed !== next.speed ||
                    state.dotSize !== next.dotSize ||
                    state.lightbarScale !== next.lightbarScale ||
                    state.color !== next.color;

                state.pattern = next.pattern;
                state.path = next.path;
                state.speed = next.speed;
                state.dotSize = next.dotSize;
                state.lightbarScale = next.lightbarScale;
                state.color = next.color;
                remoteAudioEnabled = next.audioEnabled;

                if (!remoteAudioEnabled) audio.mute();

                if (settingsChanged || !state.isRunning) updateDisplay();

                if (next.isRunning && !state.isRunning) {
                    startAnimation();
                } else if (!next.isRunning && state.isRunning) {
                    stopAnimation();
                } else if (next.isRunning && state.isRunning && settingsChanged) {
                    stopAnimation();
                    startAnimation();
                }
            }

            async function pollSessionState() {
                if (!sessionToken) return;
                try {
                    const cacheBuster = Date.now();
                    const response = await fetch(
                        `/api/emdr/get_session.php?session=${encodeURIComponent(sessionToken)}&_t=${cacheBuster}`,
                        { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }
                    );
                    if (response.status === 404 || response.status === 410) {
                        const data = await response.json();
                        handleSessionError(data.error || 'Session has ended');
                        return;
                    }
                    const data = await response.json();
                    if (data.success) {
                        applyRemoteState(data.state);
                        els.statusIndicator.textContent = 'Connected';
                        els.statusIndicator.className =
                            'px-3 py-2 bg-green-800 text-green-300 rounded-lg text-sm';
                    } else {
                        handleSessionError(data.error || 'Session error');
                    }
                } catch (e) {
                    console.error('[Viewer] Poll failed:', e);
                    els.statusIndicator.textContent = 'Reconnecting...';
                    els.statusIndicator.className =
                        'px-3 py-2 bg-yellow-800 text-yellow-300 rounded-lg text-sm';
                }
            }

            function handleSessionError(error) {
                console.error('[Viewer] Session error:', error);
                if (pollInterval) {
                    clearInterval(pollInterval);
                    pollInterval = null;
                }
                stopAnimation();
                sessionStorage.removeItem('currentSession');
                const overlay = document.createElement('div');
                overlay.className =
                    'fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50';
                overlay.innerHTML = `
                    <div class="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md">
                        <h2 class="text-2xl font-bold text-white mb-4">Host Session Has Ended</h2>
                        <p class="text-gray-300 mb-6">The clinician has ended this EMDR session.</p>
                        <button id="close-tab-btn" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Close Tab</button>
                    </div>`;
                document.body.appendChild(overlay);
                document.getElementById('close-tab-btn').addEventListener('click', () => window.close());
            }

            const urlParams = new URLSearchParams(window.location.search);
            const urlSessionToken = urlParams.get('session');
            const currentlyViewingSession = sessionStorage.getItem('currentSession');

            if (currentlyViewingSession && currentlyViewingSession !== urlSessionToken) {
                sessionStorage.clear();
                window.location.reload(true);
                return;
            }

            if (urlSessionToken) sessionStorage.setItem('currentSession', urlSessionToken);
            sessionToken = urlSessionToken;

            if (!sessionToken) {
                els.lockOverlay.innerHTML = `
                    <div class="text-center">
                        <p class="text-red-400 text-xl font-semibold">No session specified</p>
                        <p class="text-gray-400 mt-2">Invalid viewer URL</p>
                    </div>`;
                return;
            }

            Core().centerDot(els.stimulus, els.container, state.dotSize);
            updateDisplay();

            els.startBtn.addEventListener('click', () => {
                audio.init();
                audioUnlocked = true;
                els.viewerGuidance?.classList.add('hidden');
                els.lockOverlay.style.transition = 'opacity 0.3s';
                els.lockOverlay.style.opacity = '0';
                setTimeout(() => { els.lockOverlay.style.display = 'none'; }, 300);
                pollSessionState();
                pollInterval = setInterval(pollSessionState, VIEWER_POLL_MS);
                els.statusIndicator.textContent = 'Connecting...';
            });

            window.addEventListener('resize', () => {
                if (!state.isRunning) updateDisplay();
            });
        },
    };
})(typeof window !== 'undefined' ? window : global);
