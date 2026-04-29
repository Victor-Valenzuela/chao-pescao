import {
    collection,
    getDocs,
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

/**
 * Fetches a random question from Firestore that hasn't been used yet.
 * Throws if no questions are available.
 */
export async function getRandomQuestion(
    usedQuestionIds: string[],
): Promise<Question> {
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

    return {
        id: selected.id,
        text: selected.text,
        answer: selected.answer,
    };
}
