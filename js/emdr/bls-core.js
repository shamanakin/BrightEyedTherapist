/**
 * EMDR BLS animation engine — paths, lightbar, audio pan
 */
(function (global) {
    'use strict';

    global.BET = global.BET || {};
    const C = () => global.BET.BlsConstants;
    const Sync = () => global.BET.BlsSync;

    function trianglePositionFactor(phase) {
        if (phase < 0.5) return phase * 2;
        return 1 - (phase - 0.5) * 2;
    }

    function getCurrentSetState(phase) {
        if (phase < 0.05) return 4;
        if (phase < 0.45 && phase > 0.05) return 1;
        if (phase >= 0.45 && phase <= 0.55) return 2;
        if (phase > 0.55 && phase < 0.95) return 3;
        if (phase >= 0.95) return 4;
        return 0;
    }

    function computeTravelBounds(containerW, containerH) {
        const travelW = containerW * C().TRAVEL_PERCENTAGE;
        const travelH = containerH * C().TRAVEL_PERCENTAGE;
        const marginX = (containerW - travelW) / 2;
        const marginY = (containerH - travelH) / 2;
        return {
            xCenterMin: marginX,
            xCenterMax: containerW - marginX,
            yCenterMin: marginY,
            yCenterMax: containerH - marginY,
            centerY: containerH / 2,
        };
    }

    function computeCenter(path, positionFactor, bounds, timing) {
        const { xCenterMin, xCenterMax, yCenterMin, yCenterMax, centerY } = bounds;
        let centerX;
        let centerYOut = centerY;

        if (path === C().PATH_SACCADIC && timing && timing.halfCycleMs > 0) {
            const halfIndex = Math.floor(timing.elapsed / timing.halfCycleMs);
            const onRight = halfIndex % 2 === 1;
            centerX = onRight ? xCenterMax : xCenterMin;
        } else if (path === C().PATH_DIAGONAL) {
            centerX = xCenterMin + (xCenterMax - xCenterMin) * positionFactor;
            centerYOut = yCenterMin + (yCenterMax - yCenterMin) * positionFactor;
        } else {
            centerX = xCenterMin + (xCenterMax - xCenterMin) * positionFactor;
        }

        return { centerX, centerY: centerYOut };
    }

    function updateLightbarHighlight(lightbarEl, positionFactor, color) {
        const dots = lightbarEl.querySelectorAll('.lightbar-dot');
        dots.forEach((dot) => {
            const pos = parseFloat(dot.dataset.pos);
            const distance = Math.abs(pos - positionFactor);
            let opacity;
            if (distance < 0.03) opacity = 1.0;
            else if (distance < 0.12) opacity = 0.55;
            else if (distance < 0.25) opacity = 0.22;
            else opacity = 0.08;
            dot.style.opacity = opacity.toString();
            dot.style.backgroundColor = color;
        });
    }

    global.BET.BlsCore = {
        trianglePositionFactor,
        getCurrentSetState,
        computeTravelBounds,
        computeCenter,
        updateLightbarHighlight,

        createAudioController() {
            let audioContext = null;
            let stereoPanner = null;
            let oscillator = null;
            let gainNode = null;
            let audioReady = false;
            let enabled = false;

            return {
                init() {
                    if (audioReady) return;
                    try {
                        audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        stereoPanner = audioContext.createStereoPanner();
                        gainNode = audioContext.createGain();
                        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
                        oscillator = audioContext.createOscillator();
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 440;
                        oscillator.connect(stereoPanner);
                        stereoPanner.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        oscillator.start();
                        audioReady = true;
                    } catch (e) {
                        console.error('Audio init failed:', e);
                    }
                },
                setEnabled(on) {
                    enabled = !!on;
                    if (!enabled && gainNode && audioContext) {
                        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
                    }
                },
                isEnabled() {
                    return enabled;
                },
                playPannedTone(panValue, force) {
                    if (!audioReady || !gainNode || !audioContext) return;
                    if (!enabled && !force) return;
                    if (audioContext.state === 'suspended') {
                        audioContext.resume();
                    }
                    const now = audioContext.currentTime;
                    const toneDuration = 0.05;
                    const maxVol = 0.2;
                    stereoPanner.pan.setValueAtTime(panValue, now);
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(0.0001, now);
                    gainNode.gain.linearRampToValueAtTime(maxVol, now + 0.001);
                    gainNode.gain.linearRampToValueAtTime(0.0001, now + toneDuration);
                },
                setPan(panValue) {
                    if (!audioReady || !stereoPanner || !audioContext) return;
                    stereoPanner.pan.setValueAtTime(panValue, audioContext.currentTime);
                },
                mute() {
                    if (gainNode && audioContext) {
                        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
                    }
                },
            };
        },

        generateLightbar(lightbarEl, color, dotPx) {
            lightbarEl.innerHTML = '';
            const dotCount = C().LIGHTBAR_DOT_COUNT;
            const px = dotPx || C().LIGHTBAR_ELEMENT_DOT_PX;
            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('div');
                dot.classList.add('lightbar-dot');
                dot.style.width = `${px}px`;
                dot.style.height = `${px}px`;
                dot.style.backgroundColor = color;
                const pos = dotCount === 1 ? 0 : i / (dotCount - 1);
                dot.dataset.pos = pos.toString();
                dot.style.left = `${pos * 100}%`;
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                lightbarEl.appendChild(dot);
            }
            updateLightbarHighlight(lightbarEl, 0.5, color);
        },

        updateLightbarGeometry(lightbarContainerEl, lightbarEl, containerW, containerH, path, color, lightbarScale) {
            const scale = Sync().normalizeLightbarScale(lightbarScale);
            const barPath = Sync().lightbarPath(path);
            const travelW = containerW * C().TRAVEL_PERCENTAGE;
            const travelH = containerH * C().TRAVEL_PERCENTAGE;
            const baseLength =
                barPath === C().PATH_DIAGONAL
                    ? Math.sqrt(travelW * travelW + travelH * travelH)
                    : travelW;
            const barLength = baseLength * scale;
            const barThickness = C().BAR_THICKNESS * scale;
            const dotPx = C().LIGHTBAR_ELEMENT_DOT_PX * scale;
            lightbarContainerEl.style.width = `${barLength}px`;
            lightbarContainerEl.style.height = `${barThickness}px`;
            if (barPath === C().PATH_DIAGONAL) {
                const angleDeg = (Math.atan2(travelH, travelW) * 180) / Math.PI;
                lightbarContainerEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
            } else {
                lightbarContainerEl.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            }
            this.generateLightbar(lightbarEl, color, dotPx);
        },

        applyDotSize(stimulusEl, dotSizePx) {
            const px = Sync().normalizeDotSize(dotSizePx);
            stimulusEl.style.width = `${px}px`;
            stimulusEl.style.height = `${px}px`;
            return px;
        },

        centerDot(stimulusEl, containerEl, dotSizePx) {
            const px = Sync().normalizeDotSize(dotSizePx);
            const cx = containerEl.clientWidth / 2 - px / 2;
            const cy = containerEl.clientHeight / 2 - px / 2;
            stimulusEl.style.left = `${cx}px`;
            stimulusEl.style.top = `${cy}px`;
        },

        stepFrame(timestamp, ctx) {
            if (!ctx.startTime) ctx.startTime = timestamp;
            const elapsed = timestamp - ctx.startTime;
            const totalCycleTime = ctx.halfCycleMs * 2;
            const phase = (elapsed % totalCycleTime) / totalCycleTime;
            const positionFactor = trianglePositionFactor(phase);
            const bounds = computeTravelBounds(ctx.containerW, ctx.containerH);
            const effectivePath =
                ctx.pattern === 'lightbar' ? Sync().lightbarPath(ctx.path) : ctx.path;
            const timing = { elapsed, halfCycleMs: ctx.halfCycleMs };
            const { centerX, centerY } = computeCenter(
                effectivePath,
                positionFactor,
                bounds,
                timing
            );
            const dotSize = Sync().normalizeDotSize(ctx.dotSize);
            const isSaccadic =
                effectivePath === C().PATH_SACCADIC && ctx.pattern === 'dot';
            const saccadicOnRight =
                isSaccadic && Math.floor(elapsed / ctx.halfCycleMs) % 2 === 1;
            const saccadicFactor = saccadicOnRight ? 1 : 0;

            if (ctx.pattern === 'dot') {
                ctx.stimulusEl.style.left = `${centerX - dotSize / 2}px`;
                ctx.stimulusEl.style.top = `${centerY - dotSize / 2}px`;
            } else {
                updateLightbarHighlight(ctx.lightbarEl, positionFactor, ctx.color);
            }

            const panVal = isSaccadic ? saccadicFactor * 2 - 1 : positionFactor * 2 - 1;
            if (ctx.audio) ctx.audio.setPan(panVal);

            const setState = getCurrentSetState(phase);
            return { setState, positionFactor, panVal, phase };
        },
    };
})(typeof window !== 'undefined' ? window : global);
