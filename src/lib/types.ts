import type { Timestamp } from "firebase/firestore";

// --- Modelos de datos ---

export interface Room {
    code: string;
    status: "waiting" | "playing" | "finished";
    hostId: string;
    players: Player[];
    currentRound: RoundState | null;
    usedQuestionIds: string[];
    scores: Record<string, number>;
    createdAt: Timestamp;
}

export interface Player {
    id: string;
    name: string;
    avatar: string;
    isConnected: boolean;
    joinedAt: Timestamp;
}

export interface RoundState {
    roundNumber: number;
    fisherId: string;
    question: Question;
    roles: Record<string, "red" | "blue">;
    discardedPlayerIds: string[];
    currentDiscard: DiscardState | null;
    status: "assigning" | "fishing" | "discarding" | "revealing" | "ended";
    fisherRoundPoints: number; // Points earned by fisher this round
    endReason?: "blue_found" | "fisher_stopped" | "last_blue" | null; // Why the round ended
}

export interface DiscardState {
    targetPlayerId: string;
    startedAt: Timestamp;
    result: "red" | "blue" | null;
}

export interface Question {
    id: string;
    text: string;
    answer: string;
    text_es?: string;
    text_en?: string;
    text_de?: string;
    answer_es?: string;
    answer_en?: string;
    answer_de?: string;
}

export interface QuestionDoc {
    id: string;
    text: string;
    answer: string;
    category?: string;
}

export interface LocalPlayerState {
    playerId: string;
    playerName: string;
    currentRoomCode: string | null;
}

// --- Tipos de error ---

export type RoomError = "ROOM_NOT_FOUND" | "GAME_ALREADY_STARTED" | "NAME_TAKEN" | "AVATAR_TAKEN";

export type GameError =
    | "NOT_ENOUGH_PLAYERS"
    | "NO_QUESTIONS_LEFT"
    | "PLAYER_ALREADY_DISCARDED"
    | "NOT_HOST"
    | "NOT_FISHER"
    | "INVALID_STATE";

// --- Tipos de resultado ---

export interface DiscardResult {
    targetPlayerId: string;
}
