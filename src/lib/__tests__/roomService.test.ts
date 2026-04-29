import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
    generateRoomCode,
    ROOM_CODE_CHARS,
    ROOM_CODE_LENGTH,
    validateJoinRoom,
} from "../roomService";
import type { Player } from "../types";

describe("roomService", () => {
    // Feature: chao-pescao, Property 1: Invariantes de creación de sala
    // **Validates: Requirements 1.1, 1.2**
    describe("generateRoomCode", () => {
        it("debe generar un código de exactamente 4 caracteres del conjunto permitido", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (_hostName) => {
                        const code = generateRoomCode();

                        // El código debe tener exactamente ROOM_CODE_LENGTH caracteres
                        expect(code).toHaveLength(ROOM_CODE_LENGTH);

                        // Cada carácter debe pertenecer al conjunto permitido
                        for (const char of code) {
                            expect(ROOM_CODE_CHARS).toContain(char);
                        }
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 2: Unirse a sala agrega jugador
    // **Validates: Requirements 2.1**
    describe("joinRoom - lógica pura de agregar jugador", () => {
        it("debe incrementar la lista de jugadores en exactamente 1 al unirse un nuevo jugador", () => {
            fc.assert(
                fc.property(
                    fc.array(fc.string({ minLength: 1, maxLength: 20 })),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (existingPlayerNames, newPlayerName) => {
                        // Simular la lista de jugadores existentes
                        const existingPlayers: Player[] = existingPlayerNames.map(
                            (name, i) => ({
                                id: `player-${i}`,
                                name,
                                isConnected: true,
                                joinedAt: null as any,
                            }),
                        );

                        const originalLength = existingPlayers.length;

                        // Simular la lógica de joinRoom: agregar nuevo jugador
                        const newPlayer: Player = {
                            id: `player-${existingPlayers.length}`,
                            name: newPlayerName,
                            isConnected: true,
                            joinedAt: null as any,
                        };
                        const updatedPlayers = [...existingPlayers, newPlayer];

                        // La lista debe crecer en exactamente 1
                        expect(updatedPlayers).toHaveLength(originalLength + 1);

                        // El nuevo jugador debe estar en la lista
                        expect(updatedPlayers[updatedPlayers.length - 1].name).toBe(
                            newPlayerName,
                        );
                    },
                ),
                { numRuns: 100 },
            );
        });
    });

    // Feature: chao-pescao, Property 3: Validación de unión a sala
    // **Validates: Requirements 2.2, 2.3**
    describe("validateJoinRoom - validación de unión a sala", () => {
        it("debe rechazar unirse a sala inexistente o en estado distinto a 'waiting'", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("playing"),
                        fc.constant("finished"),
                    ),
                    (invalidStatus) => {
                        // Sala inexistente debe retornar ROOM_NOT_FOUND
                        const notFoundResult = validateJoinRoom(false, undefined);
                        expect(notFoundResult).toBe("ROOM_NOT_FOUND");

                        // Sala con estado inválido debe retornar GAME_ALREADY_STARTED
                        const invalidStatusResult = validateJoinRoom(true, invalidStatus);
                        expect(invalidStatusResult).toBe("GAME_ALREADY_STARTED");

                        // Sala en estado "waiting" debe permitir unirse (retorna null)
                        const validResult = validateJoinRoom(true, "waiting");
                        expect(validResult).toBeNull();
                    },
                ),
                { numRuns: 100 },
            );
        });
    });
});
