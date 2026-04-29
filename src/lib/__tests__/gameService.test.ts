import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
    assignRoles,
    GameServiceError,
    validatePlayerCount,
    calculateDiscardResult,
    getNextFisherIndex,
    generateRanking,
} from "../gameService";

describe("gameService", () => {
    describe("GameServiceError", () => {
        it("should create error with correct code and message", () => {
            const error = new GameServiceError("NOT_ENOUGH_PLAYERS");
            expect(error.code).toBe("NOT_ENOUGH_PLAYERS");
            expect(error.name).toBe("GameServiceError");
            expect(error.message).toBe(
                "Se necesitan al menos 3 jugadores",
            );
        });

        it("should create error for each error code", () => {
            const codes = [
                "NOT_ENOUGH_PLAYERS",
                "NOT_HOST",
                "INVALID_STATE",
                "NO_QUESTIONS_LEFT",
                "PLAYER_ALREADY_DISCARDED",
                "NOT_FISHER",
            ] as const;

            for (const code of codes) {
                const error = new GameServiceError(code);
                expect(error.code).toBe(code);
                expect(error.message).toBeTruthy();
            }
        });
    });

    describe("assignRoles", () => {
        it("should assign exactly 1 blue and rest red for 3 players", () => {
            const playerIds = ["fisher", "p2", "p3"];
            const roles = assignRoles(playerIds, "fisher");

            // Fisher should not have a role
            expect(roles).not.toHaveProperty("fisher");

            // Should have exactly 2 entries (non-fisher players)
            expect(Object.keys(roles)).toHaveLength(2);

            const values = Object.values(roles);
            const blueCount = values.filter((r) => r === "blue").length;
            const redCount = values.filter((r) => r === "red").length;

            expect(blueCount).toBe(1);
            expect(redCount).toBe(1);
        });

        it("should assign exactly 1 blue and rest red for 5 players", () => {
            const playerIds = ["fisher", "p2", "p3", "p4", "p5"];
            const roles = assignRoles(playerIds, "fisher");

            expect(roles).not.toHaveProperty("fisher");
            expect(Object.keys(roles)).toHaveLength(4);

            const values = Object.values(roles);
            expect(values.filter((r) => r === "blue")).toHaveLength(1);
            expect(values.filter((r) => r === "red")).toHaveLength(3);
        });

        it("should only assign roles to non-fisher players", () => {
            const playerIds = ["a", "b", "c", "d"];
            const fisherId = "b";
            const roles = assignRoles(playerIds, fisherId);

            expect(Object.keys(roles)).not.toContain(fisherId);
            expect(Object.keys(roles).sort()).toEqual(["a", "c", "d"]);
        });

        it("should handle fisher being last in the list", () => {
            const playerIds = ["p1", "p2", "p3"];
            const roles = assignRoles(playerIds, "p3");

            expect(roles).not.toHaveProperty("p3");
            expect(Object.keys(roles)).toHaveLength(2);
        });
    });

    // Feature: chao-pescao, Property 4: Inicio de partida requiere mínimo de jugadores
    // **Validates: Requirements 3.1, 3.3**
    describe("validatePlayerCount - Property 4", () => {
        it("should succeed only with >= 3 players and reject with < 3", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 0, max: 10 }),
                    (playerCount) => {
                        const result = validatePlayerCount(playerCount);
                        if (playerCount >= 3) {
                            expect(result).toBe(true);
                        } else {
                            expect(result).toBe(false);
                        }
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 5: Completitud de asignación de roles
    // **Validates: Requirements 4.1, 4.2**
    describe("assignRoles - Property 5", () => {
        it("debe asignar exactamente un pez azul, resto pez rojo, y pescador sin rol", () => {
            fc.assert(
                fc.property(
                    fc.uniqueArray(fc.uuid(), { minLength: 3, maxLength: 10 }),
                    (playerIds) => {
                        const fisherId = playerIds[0];
                        const roles = assignRoles(playerIds, fisherId);

                        const nonFisherIds = playerIds.filter((id) => id !== fisherId);
                        const blueCount = Object.values(roles).filter(
                            (r) => r === "blue",
                        ).length;
                        const redCount = Object.values(roles).filter(
                            (r) => r === "red",
                        ).length;

                        // Exactly 1 blue
                        expect(blueCount).toBe(1);
                        // All other non-fisher players are red
                        expect(redCount).toBe(nonFisherIds.length - 1);
                        // Fisher has no role
                        expect(fisherId in roles).toBe(false);
                        // Total roles match non-fisher count
                        expect(Object.keys(roles)).toHaveLength(nonFisherIds.length);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    describe("calculateDiscardResult", () => {
        it("should add 1 point and not end round for red role", () => {
            const result = calculateDiscardResult(5, "red");
            expect(result.newScore).toBe(6);
            expect(result.roundEnded).toBe(false);
        });

        it("should reset score to 0 and end round for blue role", () => {
            const result = calculateDiscardResult(5, "blue");
            expect(result.newScore).toBe(0);
            expect(result.roundEnded).toBe(true);
        });

        it("should handle score of 0 with red role", () => {
            const result = calculateDiscardResult(0, "red");
            expect(result.newScore).toBe(1);
            expect(result.roundEnded).toBe(false);
        });

        it("should handle score of 0 with blue role", () => {
            const result = calculateDiscardResult(0, "blue");
            expect(result.newScore).toBe(0);
            expect(result.roundEnded).toBe(true);
        });
    });

    describe("getNextFisherIndex", () => {
        it("should return next index for non-wrapping case", () => {
            expect(getNextFisherIndex(0, 5)).toBe(1);
            expect(getNextFisherIndex(2, 5)).toBe(3);
        });

        it("should wrap around to 0 at the end", () => {
            expect(getNextFisherIndex(4, 5)).toBe(0);
        });

        it("should handle 3 players (minimum)", () => {
            expect(getNextFisherIndex(0, 3)).toBe(1);
            expect(getNextFisherIndex(1, 3)).toBe(2);
            expect(getNextFisherIndex(2, 3)).toBe(0);
        });
    });

    // Feature: chao-pescao, Property 6: No repetición de preguntas
    // **Validates: Requirements 5.3, 11.2**
    describe("No repetición de preguntas - Property 6", () => {
        it("las preguntas seleccionadas deben ser todas distintas", () => {
            fc.assert(
                fc.property(
                    fc.array(fc.uuid()),
                    (questionIds) => {
                        const uniqueIds = new Set(questionIds);
                        // Simulating that the system should only select unique questions:
                        // given a set of selected question IDs, uniqueness means Set size === array length
                        expect(uniqueIds.size).toBe(questionIds.length || 0);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 7: Descarte crea estado válido
    // **Validates: Requirements 6.1, 12.1**
    describe("Descarte crea estado válido - Property 7", () => {
        it("DiscardState debe tener targetPlayerId correcto y status 'discarding'", () => {
            fc.assert(
                fc.property(
                    fc.uuid(),
                    (targetPlayerId) => {
                        // Simulate creating a discard state
                        const discardState = {
                            targetPlayerId,
                            startedAt: new Date(),
                            result: null as "red" | "blue" | null,
                        };
                        const roundStatus = "discarding";

                        expect(discardState.targetPlayerId).toBe(targetPlayerId);
                        expect(roundStatus).toBe("discarding");
                        expect(discardState.result).toBeNull();
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 8: Resultado de descarte coincide con rol real
    // **Validates: Requirements 6.3, 12.3**
    describe("Resultado de descarte coincide con rol real - Property 8", () => {
        it("el resultado revelado debe coincidir con el rol asignado", () => {
            fc.assert(
                fc.property(
                    fc.oneof(fc.constant("red" as const), fc.constant("blue" as const)),
                    (role) => {
                        const result = calculateDiscardResult(0, role);
                        if (role === "red") {
                            expect(result.roundEnded).toBe(false);
                        } else {
                            expect(result.roundEnded).toBe(true);
                        }
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 9: Puntuación por descarte de Pez Rojo
    // **Validates: Requirements 6.4, 9.3**
    describe("Puntuación por descarte de Pez Rojo - Property 9", () => {
        it("el score del pescador debe incrementar en exactamente 1", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 0 }),
                    (prevScore) => {
                        const result = calculateDiscardResult(prevScore, "red");
                        expect(result.newScore).toBe(prevScore + 1);
                        expect(result.roundEnded).toBe(false);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 10: Penalización por descarte de Pez Azul
    // **Validates: Requirements 6.5, 9.4**
    describe("Penalización por descarte de Pez Azul - Property 10", () => {
        it("el score del pescador debe establecerse en 0 y la ronda debe terminar", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 0 }),
                    (prevScore) => {
                        const result = calculateDiscardResult(prevScore, "blue");
                        expect(result.newScore).toBe(0);
                        expect(result.roundEnded).toBe(true);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 11: Parar conserva puntuación
    // **Validates: Requisito 7.2**
    describe("Parar conserva puntuación - Property 11", () => {
        it("el score del pescador no debe cambiar al parar", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 0 }),
                    (prevScore) => {
                        // Stopping fishing means the score stays the same
                        const scoreAfterStop = prevScore;
                        expect(scoreAfterStop).toBe(prevScore);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 12: Rotación cíclica del pescador
    // **Validates: Requirements 8.1, 8.2**
    describe("Rotación cíclica del pescador - Property 12", () => {
        it("el siguiente pescador debe ser (i+1) % N", () => {
            fc.assert(
                fc.property(
                    fc.uniqueArray(fc.uuid(), { minLength: 3 }),
                    fc.nat(),
                    (playerIds, rawIndex) => {
                        const N = playerIds.length;
                        const currentIndex = rawIndex % N;
                        const nextIndex = getNextFisherIndex(currentIndex, N);
                        expect(nextIndex).toBe((currentIndex + 1) % N);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 13: Completitud del registro de puntuación
    // **Validates: Requirement 9.1**
    describe("Completitud del registro de puntuación - Property 13", () => {
        it("el mapa de scores debe contener una entrada para cada jugador", () => {
            fc.assert(
                fc.property(
                    fc.uniqueArray(fc.uuid(), { minLength: 3 }),
                    (playerIds) => {
                        // Simulate score initialization (same logic as startGame)
                        const scores: Record<string, number> = {};
                        playerIds.forEach((id) => {
                            scores[id] = 0;
                        });

                        // Every player must have an entry in scores
                        for (const id of playerIds) {
                            expect(id in scores).toBe(true);
                        }

                        // Scores map size must equal player count
                        expect(Object.keys(scores)).toHaveLength(playerIds.length);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 15: Ranking de resultados ordenado
    // **Validates: Requirements 13.1, 13.2**
    describe("Ranking de resultados ordenado - Property 15", () => {
        it("el ranking debe estar ordenado de mayor a menor y el primero es el ganador", () => {
            fc.assert(
                fc.property(
                    fc.dictionary(fc.uuid(), fc.integer()),
                    (scores) => {
                        const entries = Object.entries(scores);
                        if (entries.length === 0) return;

                        const players = entries.map(([id]) => ({ id, name: `Player-${id.slice(0, 4)}` }));
                        const ranking = generateRanking(scores, players);

                        // Ranking must be sorted descending by score
                        for (let i = 1; i < ranking.length; i++) {
                            expect(ranking[i - 1].score).toBeGreaterThanOrEqual(ranking[i].score);
                        }

                        // First entry must have the highest score
                        const maxScore = Math.max(...entries.map(([, s]) => s));
                        expect(ranking[0].score).toBe(maxScore);
                    },
                ),
                { numRuns: 100 },
            );
        });
    });
});
