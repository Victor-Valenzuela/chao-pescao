import { writable, derived } from "svelte/store";
import { subscribeToRoom as firestoreSubscribeToRoom } from "../lib/roomService";
import type { Room, RoundState, Player } from "../lib/types";
import type { Unsubscribe } from "firebase/firestore";

/**
 * Store reactivo principal para el estado de la sala.
 */
export const room = writable<Room | null>(null);

let currentUnsubscribe: Unsubscribe | null = null;

/**
 * Conecta el listener de Firestore al store de la sala.
 * Si ya hay una suscripción activa, la cancela antes de crear una nueva.
 * Retorna una función para cancelar la suscripción.
 */
export function subscribeToRoom(roomCode: string): Unsubscribe {
    // Limpiar suscripción previa si existe
    if (currentUnsubscribe) {
        currentUnsubscribe();
        currentUnsubscribe = null;
    }

    currentUnsubscribe = firestoreSubscribeToRoom(roomCode, (roomData) => {
        room.set(roomData);
    });

    return () => {
        if (currentUnsubscribe) {
            currentUnsubscribe();
            currentUnsubscribe = null;
            room.set(null);
        }
    };
}

/**
 * Store derivado: estado de la ronda actual.
 */
export const currentRound = derived<typeof room, RoundState | null>(
    room,
    ($room) => $room?.currentRound ?? null,
);

/**
 * Store derivado: lista de jugadores de la sala.
 */
export const players = derived<typeof room, Player[]>(
    room,
    ($room) => $room?.players ?? [],
);

/**
 * Store derivado: mapa de puntuaciones.
 */
export const scores = derived<typeof room, Record<string, number>>(
    room,
    ($room) => $room?.scores ?? {},
);
