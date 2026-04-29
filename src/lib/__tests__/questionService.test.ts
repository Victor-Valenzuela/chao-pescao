import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateQuestion } from "../questionService";

describe("questionService", () => {
    // Feature: chao-pescao, Property 14: Validez estructural de preguntas
    // **Validates: Requirements 11.1**
    describe("validateQuestion - Property 14", () => {
        it("debe pasar validación cuando text y answer son no vacíos", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        text: fc.string({ minLength: 1 }),
                        answer: fc.string({ minLength: 1 }),
                    }),
                    (question) => {
                        expect(validateQuestion(question)).toBe(true);
                    },
                ),
                { numRuns: 100 },
            );
        });

        it("debe fallar validación cuando text es vacío", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        text: fc.constant(""),
                        answer: fc.string({ minLength: 1 }),
                    }),
                    (question) => {
                        expect(validateQuestion(question)).toBe(false);
                    },
                ),
                { numRuns: 100 },
            );
        });

        it("debe fallar validación cuando answer es vacío", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        text: fc.string({ minLength: 1 }),
                        answer: fc.constant(""),
                    }),
                    (question) => {
                        expect(validateQuestion(question)).toBe(false);
                    },
                ),
                { numRuns: 100 },
            );
        });

        it("debe fallar validación cuando ambos son vacíos", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        text: fc.constant(""),
                        answer: fc.constant(""),
                    }),
                    (question) => {
                        expect(validateQuestion(question)).toBe(false);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });
});
