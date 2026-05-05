import {
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Room, GameError, RoundState, Question } from "./types";
import { getRandomQuestion } from "./questionService";

/** Points needed to win the game */
export const WIN_SCORE = 15;

/**
 * Custom error class for game service errors with typed error codes.
 */
export class GameServiceError extends Error {
    code: GameError;

    constructor(code: GameError) {
        const messages: Record<GameError, string> = {
            NOT_ENOUGH_PLAYERS: "Se necesitan al menos 3 jugadores",
            NOT_HOST: "Solo el anfitrión puede iniciar la partida",
            INVALID_STATE: "Estado de juego inválido para esta acción",
            NO_QUESTIONS_LEFT: "No quedan preguntas disponibles",
            PLAYER_ALREADY_DISCARDED: "El jugador ya fue descartado",
            NOT_FISHER: "Solo el pescador puede realizar esta acción",
        };
        super(messages[code]);
        this.code = code;
        this.name = "GameServiceError";
    }
}

/**
 * Assigns roles to non-fisher players: exactly 1 blue (Pez_Azul) and the rest red (Pez_Rojo).
 * The fisher does not receive a role.
 * Exported as a pure function for property-based testing.
 */
export function assignRoles(
    playerIds: string[],
    fisherId: string,
): Record<string, "red" | "blue"> {
    const nonFisherIds = playerIds.filter((id) => id !== fisherId);
    const blueIndex = Math.floor(Math.random() * nonFisherIds.length);

    const roles: Record<string, "red" | "blue"> = {};
    nonFisherIds.forEach((id, index) => {
        roles[id] = index === blueIndex ? "blue" : "red";
    });

    return roles;
}


/**
 * Validates whether a game can be started based on the player count.
 * Returns true if the player count meets the minimum requirement (>= 3).
 * Exported as a pure function for property-based testing.
 */
export function validatePlayerCount(playerCount: number): boolean {
    return playerCount >= 3;
}

/**
 * Starts a game for the given room.
 * Validates at least 3 players, changes status to "playing",
 * selects the first player as the fisher, and initializes all scores to 0.
 * Uses a Firestore transaction for consistency.
 */
export async function startGame(roomCode: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new GameServiceError("INVALID_STATE");
        }

        const room = roomSnap.data() as Room;

        if (room.status !== "waiting") {
            throw new GameServiceError("INVALID_STATE");
        }

        if (room.players.length < 3) {
            throw new GameServiceError("NOT_ENOUGH_PLAYERS");
        }

        // Select first player as the fisher
        const firstFisherId = room.players[0].id;

        // Initialize all scores to 0
        const scores: Record<string, number> = {};
        room.players.forEach((player) => {
            scores[player.id] = 0;
        });

        transaction.update(roomRef, {
            status: "playing",
            scores,
            currentRound: null,
            usedQuestionIds: [],
        });
    });
}

/**
 * Starts a new round for the given room.
 * Selects a random non-repeated question, assigns roles, and creates a RoundState
 * with status "fishing". Uses a Firestore transaction for consistency.
 */
export async function startRound(roomCode: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new GameServiceError("INVALID_STATE");
        }

        const room = roomSnap.data() as Room;

        if (room.status !== "playing") {
            throw new GameServiceError("INVALID_STATE");
        }

        // Determine round number
        const roundNumber = room.currentRound
            ? room.currentRound.roundNumber + 1
            : 1;

        // Determine fisher: first round uses first player, subsequent rounds rotate
        let fisherId: string;
        if (!room.currentRound) {
            fisherId = room.players[0].id;
        } else {
            const currentFisherIndex = room.players.findIndex(
                (p) => p.id === room.currentRound!.fisherId,
            );
            fisherId =
                room.players[(currentFisherIndex + 1) % room.players.length].id;
        }

        // Get a random question that hasn't been used
        let question: Question;
        try {
            question = await getRandomQuestion(room.usedQuestionIds);
        } catch {
            throw new GameServiceError("NO_QUESTIONS_LEFT");
        }

        // Assign roles to non-fisher players
        const playerIds = room.players.map((p) => p.id);
        const roles = assignRoles(playerIds, fisherId);

        const newRound: RoundState = {
            roundNumber,
            fisherId,
            question,
            roles,
            discardedPlayerIds: [],
            currentDiscard: null,
            status: "fishing",
            fisherRoundPoints: 0,
            endReason: null,
        };

        transaction.update(roomRef, {
            currentRound: newRound,
            usedQuestionIds: [...room.usedQuestionIds, question.id],
        });
    });
}

/**
 * Pure helper: calculates the result of discarding a player based on their role.
 * - If role is 'red': fisher gains +1 point, round continues
 * - If role is 'blue': fisher's score resets to 0, round ends
 * Exported for property-based testing.
 */
export function calculateDiscardResult(
    currentScore: number,
    role: "red" | "blue",
): { newScore: number; roundEnded: boolean } {
    if (role === "red") {
        return { newScore: currentScore + 1, roundEnded: false };
    }
    return { newScore: 0, roundEnded: true };
}

/**
 * Pure helper: returns the next fisher index using cyclic rotation.
 * Exported for property-based testing.
 */
export function getNextFisherIndex(
    currentIndex: number,
    totalPlayers: number,
): number {
    return (currentIndex + 1) % totalPlayers;
}

/**
 * Initiates a discard action on a target player.
 * Creates a DiscardState with timestamp, changes round status to "discarding".
 * Validates the round is in "fishing" state and the player hasn't been discarded already.
 */
export async function discardPlayer(
    roomCode: string,
    targetPlayerId: string,
): Promise<{ targetPlayerId: string }> {
    return runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new GameServiceError("INVALID_STATE");
        }

        const room = roomSnap.data() as Room;

        if (!room.currentRound || room.currentRound.status !== "fishing") {
            throw new GameServiceError("INVALID_STATE");
        }

        if (room.currentRound.discardedPlayerIds.includes(targetPlayerId)) {
            throw new GameServiceError("PLAYER_ALREADY_DISCARDED");
        }

        transaction.update(roomRef, {
            "currentRound.currentDiscard": {
                targetPlayerId,
                startedAt: serverTimestamp(),
                result: null,
            },
            "currentRound.status": "discarding",
        });

        return { targetPlayerId };
    });
}

/**
 * Reveals the result of the current discard.
 * Reads the target player's role and applies scoring:
 * - Pez_Rojo: +1 point to fisher, player added to discarded list, round continues (status → "fishing")
 * - Pez_Azul: fisher's score → 0, round ends (status → "ended")
 */
export async function revealDiscard(roomCode: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new GameServiceError("INVALID_STATE");
        }

        const room = roomSnap.data() as Room;

        if (
            !room.currentRound ||
            room.currentRound.status !== "discarding" ||
            !room.currentRound.currentDiscard
        ) {
            throw new GameServiceError("INVALID_STATE");
        }

        const { targetPlayerId } = room.currentRound.currentDiscard;
        const role = room.currentRound.roles[targetPlayerId];

        if (!role) {
            throw new GameServiceError("INVALID_STATE");
        }

        const fisherId = room.currentRound.fisherId;
        const currentFisherScore = room.scores[fisherId] ?? 0;
        const roundPoints = room.currentRound.fisherRoundPoints ?? 0;

        if (role === "red") {
            // Pez Rojo descubierto: only add to round points, NOT to total yet
            const newRoundPoints = roundPoints + 1;
            transaction.update(roomRef, {
                "currentRound.fisherRoundPoints": newRoundPoints,
                "currentRound.currentDiscard.result": role,
                "currentRound.discardedPlayerIds": [
                    ...room.currentRound.discardedPlayerIds,
                    targetPlayerId,
                ],
                "currentRound.status": "revealing",
            });
        } else {
            // Pez Azul descubierto: fisher loses round points, blue fish point added at end of round
            transaction.update(roomRef, {
                "currentRound.currentDiscard.result": role,
                "currentRound.fisherRoundPoints": 0,
                "currentRound.discardedPlayerIds": [
                    ...room.currentRound.discardedPlayerIds,
                    targetPlayerId,
                ],
                "currentRound.status": "revealing",
                "currentRound.endReason": "blue_found",
            });
        }
    });
}

/**
 * Continues the game after the reveal screen.
 * If the discarded player was Pez_Azul, the round ends.
 * If the discarded player was Pez_Rojo, fishing continues.
 */
export async function continueAfterReveal(roomCode: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new GameServiceError("INVALID_STATE");
        }

        const room = roomSnap.data() as Room;

        if (
            !room.currentRound ||
            room.currentRound.status !== "revealing" ||
            !room.currentRound.currentDiscard
        ) {
            throw new GameServiceError("INVALID_STATE");
        }

        const result = room.currentRound.currentDiscard.result;
        const fisherId = room.currentRound.fisherId;

        if (result === "blue") {
            // Blue was found — round ends
            // Fisher loses round points (they were never added to total, so nothing to subtract)
            // Blue fish gets +1 (supo mentir)
            // Red fish NOT discarded get +1 each
            const updates: Record<string, any> = {
                "currentRound.status": "ended",
                "currentRound.endReason": "blue_found",
            };
            const targetPlayerId = room.currentRound.currentDiscard.targetPlayerId;
            updates[`scores.${targetPlayerId}`] = (room.scores[targetPlayerId] ?? 0) + 1; // blue fish +1
            const nonFisherIds = Object.keys(room.currentRound.roles);
            for (const pid of nonFisherIds) {
                if (room.currentRound.roles[pid] === "red" && !room.currentRound.discardedPlayerIds.includes(pid)) {
                    updates[`scores.${pid}`] = (room.scores[pid] ?? 0) + 1;
                }
            }
            // Check win
            const allScores = { ...room.scores };
            for (const [k, v] of Object.entries(updates)) {
                if (k.startsWith("scores.")) allScores[k.split(".")[1]] = v as number;
            }
            if (Object.values(allScores).some((s) => s >= WIN_SCORE)) {
                updates["status"] = "finished";
            }
            transaction.update(roomRef, updates);
        } else {
            // Red was found — check if only blue fish remains
            const nonFisherIds = Object.keys(room.currentRound.roles);
            const remainingIds = nonFisherIds.filter(
                (id) => !room.currentRound!.discardedPlayerIds.includes(id)
            );

            if (remainingIds.length === 1 && room.currentRound.roles[remainingIds[0]] === "blue") {
                // Only blue fish left! Fisher gets round points + 1 bonus
                const fisherScore = room.scores[fisherId] ?? 0;
                const roundPts = room.currentRound.fisherRoundPoints ?? 0;
                const newFisherScore = fisherScore + roundPts + 1;
                const updates: Record<string, any> = {
                    [`scores.${fisherId}`]: newFisherScore,
                    "currentRound.status": "ended",
                    "currentRound.endReason": "last_blue",
                };
                if (newFisherScore >= WIN_SCORE) {
                    updates["status"] = "finished";
                }
                transaction.update(roomRef, updates);
            } else {
                // More fish remain — continue fishing
                const fisherScore = room.scores[fisherId] ?? 0;
                if (fisherScore >= WIN_SCORE) {
                    transaction.update(roomRef, {
                        status: "finished",
                        "currentRound.status": "ended",
                    });
                } else {
                    transaction.update(roomRef, {
                        "currentRound.status": "fishing",
                    });
                }
            }
        }
    });
}

/**
 * Fisher voluntarily stops fishing. Keeps current score, ends the round.
 */
export async function stopFishing(roomCode: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new GameServiceError("INVALID_STATE");
        }

        const room = roomSnap.data() as Room;

        if (!room.currentRound || room.currentRound.status !== "fishing") {
            throw new GameServiceError("INVALID_STATE");
        }

        const fisherId = room.currentRound.fisherId;
        const roundPoints = room.currentRound.fisherRoundPoints ?? 0;
        const currentFisherScore = room.scores[fisherId] ?? 0;

        const updates: Record<string, any> = {
            "currentRound.status": "ended",
            "currentRound.endReason": "fisher_stopped",
            [`scores.${fisherId}`]: currentFisherScore + roundPoints, // add round points to total
        };

        // Red fish NOT discarded get +1 point each (they survived)
        const nonFisherIds = Object.keys(room.currentRound.roles);
        for (const pid of nonFisherIds) {
            if (room.currentRound.roles[pid] === "red" && !room.currentRound.discardedPlayerIds.includes(pid)) {
                updates[`scores.${pid}`] = (room.scores[pid] ?? 0) + 1;
            }
        }
        // Blue fish not discovered gets 0 (already default)

        // Check win
        const allScores = { ...room.scores };
        for (const [k, v] of Object.entries(updates)) {
            if (k.startsWith("scores.")) allScores[k.split(".")[1]] = v as number;
        }
        if (Object.values(allScores).some((s) => s >= WIN_SCORE)) {
            updates["status"] = "finished";
        }

        transaction.update(roomRef, updates);
    });
}

/**
 * Advances to the next round. Internally calls startRound which handles
 * fisher rotation via cyclic (i+1) % N logic.
 */
export async function nextRound(roomCode: string): Promise<void> {
    await startRound(roomCode);
}

/**
 * Generates a ranking of players sorted by score descending.
 * Pure function exported for property-based testing.
 */
export function generateRanking(
    scores: Record<string, number>,
    players: { id: string; name: string; avatar?: string }[],
): { id: string; name: string; avatar: string; score: number }[] {
    return players
        .map((p) => ({ id: p.id, name: p.name, avatar: p.avatar ?? 'magikarp', score: scores[p.id] ?? 0 }))
        .sort((a, b) => b.score - a.score);
}
