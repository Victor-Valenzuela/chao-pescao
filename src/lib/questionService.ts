import {
    collection,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Question, QuestionDoc } from "./types";

/**
 * Validates that a question has non-empty text and answer fields.
 * Returns true if the question is structurally valid.
 */
export function validateQuestion(question: { text: string; answer: string }): boolean {
    return (
        typeof question.text === "string" &&
        typeof question.answer === "string" &&
        question.text.length > 0 &&
        question.answer.length > 0
    );
}

const LOCALES = ["es", "en", "de"] as const;

/**
 * Fetches a random question from Firestore that hasn't been used yet.
 * Loads translations from questions_es, questions_en, questions_de collections.
 * Falls back to 'es' as the base text/answer.
 */
export async function getRandomQuestion(
    usedQuestionIds: string[],
): Promise<Question> {
    // Load base questions (Spanish)
    const questionsRef = collection(db, "questions");
    const snapshot = await getDocs(questionsRef);

    const availableQuestions: QuestionDoc[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data() as QuestionDoc;
        const questionWithId = { ...data, id: docSnap.id };
        if (!usedQuestionIds.includes(questionWithId.id)) {
            availableQuestions.push(questionWithId);
        }
    });

    if (availableQuestions.length === 0) {
        throw new Error("NO_QUESTIONS_LEFT");
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selected = availableQuestions[randomIndex];

    // Load translations for the selected question
    const translations: Record<string, { text: string; answer: string }> = {};
    for (const locale of LOCALES) {
        try {
            const localeDoc = await getDoc(doc(db, `questions_${locale}`, selected.id));
            if (localeDoc.exists()) {
                const data = localeDoc.data();
                translations[locale] = { text: data.text, answer: data.answer };
            }
        } catch {
            // Silently skip if translation not available
        }
    }

    return {
        id: selected.id,
        text: selected.text,
        answer: selected.answer,
        text_es: translations.es?.text ?? selected.text,
        text_en: translations.en?.text ?? selected.text,
        text_de: translations.de?.text ?? selected.text,
        answer_es: translations.es?.answer ?? selected.answer,
        answer_en: translations.en?.answer ?? selected.answer,
        answer_de: translations.de?.answer ?? selected.answer,
    };
}
