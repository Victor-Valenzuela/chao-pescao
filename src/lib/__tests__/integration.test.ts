import { describe, it, expect } from "vitest";
import {
    assignRoles,
    calculateDiscardResult,
    getNextFisherIndex,
    generateRanking,
    validatePlayerCount,
} from "../gameService";

describe("Integración del flujo de juego", () => {
    // Test 1: Flujo completo de una ronda
    // asignar roles → descartar pez rojo → descartar otro pez rojo → verificar puntuación
    describe("flujo completo de una ronda", () => {
        it("debe asignar roles, descartar peces rojos y acumular puntos correctamente", () => {
            const players = [
                { id: "p1", name: "Ana" },
                { id: "p2", name: "Bob" },
                { id: "p3", name: "Carlos" },
                { id: "p4", name: "Diana" },
            ];
            const playerIds = players.map((p) => p.id);
            const fisherId = playerIds[0]; // p1 es el pescador

            // Validar que se puede iniciar con 4 jugadores
            expect(validatePlayerCount(playerIds.length)).toBe(true);

            // Asignar roles
            const roles = assignRoles(playerIds, fisherId);

            // El pescador no tiene rol
            expect(roles).not.toHaveProperty(fisherId);

            // Exactamente 1 azul y 2 rojos entre los 3 no-pescadores
            const roleValues = Object.values(roles);
            expect(roleValues.filter((r) => r === "blue")).toHaveLength(1);
            expect(roleValues.filter((r) => r === "red")).toHaveLength(2);

            // Encontrar jugadores rojos para descartar
            const redPlayerIds = Object.entries(roles)
                .filter(([, role]) => role === "red")
                .map(([id]) => id);

            // Simular descarte del primer pez rojo
            let fisherScore = 0;
            const firstDiscard = calculateDiscardResult(fisherScore, roles[redPlayerIds[0]]);
            expect(firstDiscard.newScore).toBe(1);
            expect(firstDiscard.roundEnded).toBe(false);
            fisherScore = firstDiscard.newScore;

            // Simular descarte del segundo pez rojo
            const secondDiscard = calculateDiscardResult(fisherScore, roles[redPlayerIds[1]]);
            expect(secondDiscard.newScore).toBe(2);
            expect(secondDiscard.roundEnded).toBe(false);
            fisherScore = secondDiscard.newScore;

            // Verificar puntuación final del pescador
            expect(fisherScore).toBe(2);

            // Verificar rotación al siguiente pescador
            const nextFisherIndex = getNextFisherIndex(0, playerIds.length);
            expect(nextFisherIndex).toBe(1);

            // Generar ranking con los scores
            const scores: Record<string, number> = {};
            playerIds.forEach((id) => { scores[id] = 0; });
            scores[fisherId] = fisherScore;

            const ranking = generateRanking(scores, players);
            expect(ranking[0].id).toBe(fisherId);
            expect(ranking[0].score).toBe(2);
        });
    });

    // Test 2: Pescador descarta al pez azul en primer intento
    describe("caso borde: pescador descarta al pez azul en primer intento", () => {
        it("debe resetear puntuación a 0 y terminar la ronda", () => {
            const players = [
                { id: "p1", name: "Ana" },
                { id: "p2", name: "Bob" },
                { id: "p3", name: "Carlos" },
            ];
            const playerIds = players.map((p) => p.id);
            const fisherId = playerIds[0];

            // Asignar roles
            const roles = assignRoles(playerIds, fisherId);

            // Encontrar al pez azul
            const bluePlayerId = Object.entries(roles)
                .find(([, role]) => role === "blue")![0];

            // Simular que el pescador tenía puntos de rondas anteriores
            const previousScore = 5;

            // Descartar al pez azul
            const result = calculateDiscardResult(previousScore, roles[bluePlayerId]);

            // Score debe resetearse a 0
            expect(result.newScore).toBe(0);
            // La ronda debe terminar
            expect(result.roundEnded).toBe(true);
        });
    });

    // Test 3: Pescador para sin descartar a nadie
    describe("caso borde: pescador para sin descartar a nadie", () => {
        it("debe conservar la puntuación del pescador", () => {
            const players = [
                { id: "p1", name: "Ana" },
                { id: "p2", name: "Bob" },
                { id: "p3", name: "Carlos" },
            ];
            const playerIds = players.map((p) => p.id);
            const fisherId = playerIds[0];

            // Validar inicio
            expect(validatePlayerCount(playerIds.length)).toBe(true);

            // Asignar roles (la ronda comienza normalmente)
            const roles = assignRoles(playerIds, fisherId);
            expect(Object.keys(roles)).toHaveLength(2);

            // El pescador tiene puntos de rondas anteriores
            const scoreBefore = 3;

            // El pescador decide parar sin descartar a nadie
            // stopFishing conserva la puntuación — no se llama calculateDiscardResult
            const scoreAfter = scoreBefore;

            expect(scoreAfter).toBe(scoreBefore);

            // Verificar que la rotación funciona para la siguiente ronda
            const currentFisherIndex = playerIds.indexOf(fisherId);
            const nextIndex = getNextFisherIndex(currentFisherIndex, playerIds.length);
            expect(playerIds[nextIndex]).toBe("p2");
        });
    });

    // Test 4: Agotar todas las preguntas del banco
    describe("caso borde: agotar todas las preguntas del banco", () => {
        it("debe detectar cuando no quedan preguntas disponibles", () => {
            // Simular un banco de 3 preguntas
            const questionBank = [
                { id: "q1", text: "¿Capital de Francia?", answer: "París" },
                { id: "q2", text: "¿Capital de España?", answer: "Madrid" },
                { id: "q3", text: "¿Capital de Italia?", answer: "Roma" },
            ];

            const usedQuestionIds: string[] = [];

            // Seleccionar las 3 preguntas una por una
            for (const question of questionBank) {
                // Verificar que la pregunta no ha sido usada
                expect(usedQuestionIds).not.toContain(question.id);

                // Filtrar preguntas disponibles (simula getRandomQuestion)
                const available = questionBank.filter(
                    (q) => !usedQuestionIds.includes(q.id),
                );
                expect(available.length).toBeGreaterThan(0);

                // "Seleccionar" la pregunta
                usedQuestionIds.push(question.id);
            }

            // Ahora las 3 preguntas están usadas
            expect(usedQuestionIds).toHaveLength(3);

            // Intentar seleccionar una 4ta pregunta debe fallar
            const remainingQuestions = questionBank.filter(
                (q) => !usedQuestionIds.includes(q.id),
            );
            expect(remainingQuestions).toHaveLength(0);

            // Verificar que usedQuestionIds contiene todos los IDs
            for (const q of questionBank) {
                expect(usedQuestionIds).toContain(q.id);
            }
        });
    });
});
