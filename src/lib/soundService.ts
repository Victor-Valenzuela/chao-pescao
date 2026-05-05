/**
 * Sound effects using Web Audio API — no audio files needed.
 * All sounds are synthesized programmatically.
 */

let ctx: AudioContext | null = null;
let muted = false;

const STORAGE_KEY = 'sound_muted';

// Load mute preference
if (typeof window !== 'undefined') {
    muted = localStorage.getItem(STORAGE_KEY) === 'true';
}

function getCtx(): AudioContext {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.5) {
    if (muted) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
}

function playNoise(duration: number, volume = 0.3) {
    if (muted) return;
    const c = getCtx();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * volume;
    }
    const source = c.createBufferSource();
    const gain = c.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
    source.connect(gain);
    gain.connect(c.destination);
    source.start();
}

// --- Public API ---

export function isMuted(): boolean {
    return muted;
}

export function toggleMute(): boolean {
    muted = !muted;
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(muted));
    }
    return muted;
}

/** Splash/bubble — round starts, roles assigned */
export function soundRoundStart() {
    playTone(300, 0.1, 'sine', 0.4);
    setTimeout(() => playTone(450, 0.1, 'sine', 0.4), 80);
    setTimeout(() => playTone(600, 0.15, 'sine', 0.5), 160);
    setTimeout(() => playNoise(0.08, 0.15), 200);
}

/** Fishing hook — fisher selects a player to discard */
export function soundDiscard() {
    playTone(800, 0.06, 'sine', 0.4);
    setTimeout(() => playTone(600, 0.06, 'sine', 0.3), 50);
    setTimeout(() => playTone(400, 0.08, 'sine', 0.3), 100);
    setTimeout(() => playTone(250, 0.15, 'triangle', 0.4), 160);
}

/** Reveal red fish — correct discard, positive */
export function soundRevealRed() {
    playTone(523, 0.12, 'sine', 0.6);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.6), 100);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.6), 200);
}

/** Reveal blue fish — wrong discard, dramatic */
export function soundRevealBlue() {
    playTone(400, 0.15, 'square', 0.4);
    setTimeout(() => playTone(350, 0.15, 'square', 0.4), 120);
    setTimeout(() => playTone(280, 0.2, 'square', 0.5), 240);
    setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.3), 400);
}

/** Coin/point gained */
export function soundPointGain() {
    playTone(880, 0.08, 'sine', 0.5);
    setTimeout(() => playTone(1100, 0.12, 'sine', 0.5), 70);
}

/** Victory fanfare — someone reaches 15 points */
export function soundVictory() {
    playTone(523, 0.1, 'sine', 0.5);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.5), 100);
    setTimeout(() => playTone(784, 0.1, 'sine', 0.5), 200);
    setTimeout(() => playTone(1047, 0.15, 'sine', 0.6), 300);
    setTimeout(() => playTone(784, 0.08, 'sine', 0.4), 450);
    setTimeout(() => playTone(1047, 0.3, 'sine', 0.6), 530);
}

/** Tick — countdown timer */
export function soundTick() {
    playTone(1000, 0.04, 'sine', 0.25);
}

/** Button click — subtle feedback */
export function soundClick() {
    playTone(700, 0.03, 'sine', 0.2);
}
