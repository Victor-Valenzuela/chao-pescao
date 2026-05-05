import { writable } from "svelte/store";
import type { LocalPlayerState } from "../lib/types";

const PLAYER_ID_KEY = "chaoPescao_playerId";
const PLAYER_NAME_KEY = "chaoPescao_playerName";
const ROOM_CODE_KEY = "chaoPescao_currentRoomCode";

/**
 * Obtiene o genera el playerId persistido en localStorage.
 */
function getOrCreatePlayerId(): string {
    if (typeof localStorage === "undefined") {
        return crypto.randomUUID();
    }
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
}

function loadFromStorage(): LocalPlayerState {
    const playerId = getOrCreatePlayerId();
    const playerName =
        typeof localStorage !== "undefined"
            ? localStorage.getItem(PLAYER_NAME_KEY) ?? ""
            : "";
    const currentRoomCode =
        typeof localStorage !== "undefined"
            ? localStorage.getItem(ROOM_CODE_KEY)
            : null;

    return { playerId, playerName, currentRoomCode };
}

const initial = loadFromStorage();

/**
 * Store para la identidad del jugador local.
 */
export const playerStore = writable<LocalPlayerState>(initial);

/**
 * Establece el nombre del jugador y lo persiste en localStorage.
 */
export function setPlayerName(name: string): void {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(PLAYER_NAME_KEY, name);
    }
    playerStore.update((state) => ({ ...state, playerName: name }));
}

/**
 * Establece la sala actual y la persiste en localStorage.
 */
export function setCurrentRoom(roomCode: string | null): void {
    if (typeof localStorage !== "undefined") {
        if (roomCode) {
            localStorage.setItem(ROOM_CODE_KEY, roomCode);
        } else {
            localStorage.removeItem(ROOM_CODE_KEY);
        }
    }
    playerStore.update((state) => ({ ...state, currentRoomCode: roomCode }));
}
