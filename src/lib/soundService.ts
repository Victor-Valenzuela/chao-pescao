/**
 * Sound effects using preloaded MP3 files.
 */

let muted = false;
const STORAGE_KEY = 'sound_muted';

if (typeof window !== 'undefined') {
    muted = localStorage.getItem(STORAGE_KEY) === 'true';
}

const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(name: string): HTMLAudioElement {
    if (!audioCache[name]) {
        audioCache[name] = new Audio(`/sounds/${name}.mp3`);
    }
    return audioCache[name];
}

function play(name: string) {
    if (muted || typeof window === 'undefined') return;
    const audio = getAudio(name);
    audio.currentTime = 0;
    audio.volume = 0.3;
    audio.play().catch(() => { });
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

/** Bubble/splash — round starts, roles assigned */
export function soundRoundStart() {
    play('round-start');
}

/** Fishing hook — fisher confirms discard */
export function soundDiscard() {
    play('discard');
}

/** Reveal red fish — correct discard */
export function soundRevealRed() {
    play('reveal-red');
}

/** Reveal blue fish — wrong discard, dramatic */
export function soundRevealBlue() {
    play('reveal-blue');
}

/** Coin — point gained */
export function soundPointGain() {
    play('point-gain');
}

/** Victory fanfare — someone reaches 15 points */
export function soundVictory() {
    play('victory');
}

/** Tick — countdown timer */
export function soundTick() {
    play('tick2');
}
