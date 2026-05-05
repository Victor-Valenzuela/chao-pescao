import { writable, derived, get } from 'svelte/store';
import es from './es.json';
import en from './en.json';
import de from './de.json';

export type Locale = 'es' | 'en' | 'de';

const translations: Record<Locale, Record<string, string>> = {
    es,
    en,
    de,
};

const STORAGE_KEY = 'app_locale';

function getInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'es';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in translations) return saved as Locale;
    return '';  // empty means not chosen yet
}

export const locale = writable<Locale | ''>(getInitialLocale());

// Persist locale changes
locale.subscribe((val) => {
    if (typeof window !== 'undefined' && val) {
        localStorage.setItem(STORAGE_KEY, val);
    }
});

export const localeReady = derived(locale, ($locale) => $locale !== '');

const currentTranslations = derived(locale, ($locale) => {
    return translations[$locale as Locale] ?? translations.es;
});

/**
 * Translate a key, with optional interpolation.
 * Usage: t('lobby.playersTitle', { count: 4 }) → "🎮 Jugadores (4)"
 */
export function t(key: string, params?: Record<string, string | number>): string {
    const dict = get(currentTranslations);
    let text = dict[key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replaceAll(`{${k}}`, String(v));
        }
    }
    return text;
}

/**
 * Reactive translation store — use $tt(key, params) in Svelte templates.
 * Returns a function that translates using the current locale reactively.
 */
export const tt = derived(currentTranslations, (dict) => {
    return (key: string, params?: Record<string, string | number>): string => {
        let text = dict[key] ?? key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                text = text.replaceAll(`{${k}}`, String(v));
            }
        }
        return text;
    };
});

export const LOCALES: { code: Locale; flag: string; name: string }[] = [
    { code: 'es', flag: '/images/es.png', name: 'Español' },
    { code: 'en', flag: '/images/en.png', name: 'English' },
    { code: 'de', flag: '/images/de.png', name: 'Deutsch' },
];

import type { Question } from '../types';

/**
 * Resolves question text for the current locale.
 * Falls back to base 'text' field if locale-specific field is missing.
 */
export function getQuestionText(question: Question, loc?: string): string {
    const l = loc || get(locale) || 'es';
    const key = `text_${l}` as keyof Question;
    return (question[key] as string) ?? question.text;
}

/**
 * Resolves question answer for the current locale.
 * Falls back to base 'answer' field if locale-specific field is missing.
 */
export function getQuestionAnswer(question: Question, loc?: string): string {
    const l = loc || get(locale) || 'es';
    const key = `answer_${l}` as keyof Question;
    return (question[key] as string) ?? question.answer;
}
