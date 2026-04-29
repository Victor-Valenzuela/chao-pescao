/**
 * Script de seed para PRODUCCIÓN.
 * Lee preguntas-app.json y respuestas-app.json, las combina y sube a Firestore.
 *
 * Uso: npx tsx scripts/seed-production.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

const firebaseConfig = {
    apiKey: "AIzaSyCfwsSvtB835qotaCmbUHECFyJ5wRVVZYc",
    authDomain: "chao-pescao-game.firebaseapp.com",
    projectId: "chao-pescao-game",
    storageBucket: "chao-pescao-game.firebasestorage.app",
    messagingSenderId: "76427374452",
    appId: "1:76427374452:web:befb259a0443ddc8cc0621",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read JSON files
const preguntasRaw = JSON.parse(readFileSync(resolve("src/lib/preguntas-app.json"), "utf-8"));
const respuestasRaw = JSON.parse(readFileSync(resolve("src/lib/respuestas-app.json"), "utf-8"));

const preguntas: { id: number; pregunta: string }[] = preguntasRaw.respuestas;
const respuestas: { id: number; respuesta: string }[] = respuestasRaw.respuestas;

// Build a map of id -> respuesta
const respuestaMap = new Map<number, string>();
for (const r of respuestas) {
    respuestaMap.set(r.id, r.respuesta);
}

async function seedProduction(): Promise<void> {
    console.log("🗑️  Eliminando preguntas anteriores...");
    const questionsRef = collection(db, "questions");
    const existing = await getDocs(questionsRef);
    for (const docSnap of existing.docs) {
        await deleteDoc(doc(db, "questions", docSnap.id));
    }
    console.log(`  ✓ ${existing.size} preguntas eliminadas`);

    console.log(`\n📝 Subiendo ${preguntas.length} preguntas de producción...`);

    let uploaded = 0;
    let skipped = 0;

    for (const p of preguntas) {
        const answer = respuestaMap.get(p.id);
        if (!answer) {
            console.log(`  ⚠ Pregunta ${p.id} sin respuesta, saltando`);
            skipped++;
            continue;
        }

        const docRef = doc(questionsRef, `q${p.id}`);
        await setDoc(docRef, {
            id: `q${p.id}`,
            text: p.pregunta,
            answer: answer,
        });
        uploaded++;
    }

    console.log(`\n✅ Listo! ${uploaded} preguntas subidas, ${skipped} saltadas.`);
}

seedProduction().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
