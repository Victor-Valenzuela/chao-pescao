import {
    doc,
    setDoc,
    deleteDoc,
    runTransaction,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Room, Player, RoomError } from "./types";

export const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 4;

/**
 * Generates a random 4-character room code from the allowed charset
 * (no I, O, 0, 1 to avoid ambiguity).
 */
export function generateRoomCode(): string {
    let code = "";
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return code;
}

/**
 * Creates a new room in Firestore with the given host name.
 * Returns the generated room code.
 */
export async function createRoom(hostName: string, playerId: string, avatar: string): Promise<string> {
    const code = generateRoomCode();
    const hostId = playerId;

    const host: Player = {
        id: hostId,
        name: hostName,
        avatar,
        isConnected: true,
        joinedAt: Timestamp.now() as any,
    };

    const room: Omit<Room, "createdAt"> & { createdAt: any } = {
        code,
        status: "waiting",
        hostId,
        players: [host],
        currentRound: null,
        usedQuestionIds: [],
        scores: { [hostId]: 0 },
        createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "rooms", code), room);
    return code;
}


/**
 * Joins an existing room. Validates that the room exists and is in "waiting" state.
 * Uses a Firestore transaction to avoid race conditions.
 */
export async function joinRoom(
    roomCode: string,
    playerName: string,
    playerId: string,
    avatar: string,
): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) {
            throw new RoomServiceError("ROOM_NOT_FOUND");
        }

        const room = roomSnap.data() as Room;

        if (room.status !== "waiting") {
            throw new RoomServiceError("GAME_ALREADY_STARTED");
        }

        const nameTaken = room.players.some(
            (p) => p.name.toLowerCase() === playerName.toLowerCase()
        );
        if (nameTaken) {
            throw new RoomServiceError("NAME_TAKEN");
        }

        const avatarTaken = room.players.some((p) => p.avatar === avatar);
        if (avatarTaken) {
            throw new RoomServiceError("AVATAR_TAKEN");
        }

        const newPlayer: Player = {
            id: playerId,
            name: playerName,
            avatar,
            isConnected: true,
            joinedAt: Timestamp.now() as any,
        };

        const updatedPlayers = [...room.players, newPlayer];
        const updatedScores = { ...room.scores, [playerId]: 0 };

        transaction.update(roomRef, {
            players: updatedPlayers,
            scores: updatedScores,
        });
    });
}

/**
 * Subscribes to real-time updates for a room document.
 * Calls the callback whenever the room data changes.
 */
export function subscribeToRoom(
    roomCode: string,
    callback: (room: Room | null) => void,
): Unsubscribe {
    const roomRef = doc(db, "rooms", roomCode);

    return onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as Room);
        } else {
            callback(null);
        }
    });
}

/**
 * Removes a player from the room.
 * If the room is playing and fewer than 3 players remain, deletes the room.
 * If the room is waiting and no players remain, deletes the room.
 */
export async function leaveRoom(
    roomCode: string,
    playerId: string,
): Promise<void> {
    await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, "rooms", roomCode);
        const roomSnap = await transaction.get(roomRef);

        if (!roomSnap.exists()) return;

        const room = roomSnap.data() as Room;
        const updatedPlayers = room.players.filter((p) => p.id !== playerId);

        // Delete room if empty, or if playing with not enough players
        if (
            updatedPlayers.length === 0 ||
            (room.status === "playing" && updatedPlayers.length < 3)
        ) {
            transaction.delete(roomRef);
            return;
        }

        const updatedScores = { ...room.scores };
        delete updatedScores[playerId];

        transaction.update(roomRef, {
            players: updatedPlayers,
            scores: updatedScores,
        });
    });
}

/**
 * Validates whether a player can join a room based on its current status.
 * Returns null if valid, or a RoomError code if invalid.
 */
export function validateJoinRoom(
    roomExists: boolean,
    roomStatus: string | undefined,
): RoomError | null {
    if (!roomExists) {
        return "ROOM_NOT_FOUND";
    }
    if (roomStatus !== "waiting") {
        return "GAME_ALREADY_STARTED";
    }
    return null;
}

/**
 * Custom error class for room service errors with typed error codes.
 */
export class RoomServiceError extends Error {
    code: RoomError;

    constructor(code: RoomError) {
        const messages: Record<RoomError, string> = {
            ROOM_NOT_FOUND: "La sala no existe",
            GAME_ALREADY_STARTED: "La partida ya está en curso",
            NAME_TAKEN: "Ya hay un jugador con ese nombre en la sala",
            AVATAR_TAKEN: "Ese avatar ya fue elegido por otro jugador",
        };
        super(messages[code]);
        this.code = code;
        this.name = "RoomServiceError";
    }
}