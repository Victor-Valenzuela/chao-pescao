/**
 * Sube las 160 preguntas de producción con respuestas ocultas ("???").
 * Para testear sin spoilearse las respuestas.
 *
 * Uso: npx tsx scripts/seed-hidden-answers.ts
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

const preguntasRaw = JSON.parse(readFileSync(resolve("src/lib/preguntas-app.json"), "utf-8"));
const preguntas: { id: number; pregunta: string }[] = preguntasRaw.respuestas;

async function seed(): Promise<void> {
    console.log("🗑️  Eliminando preguntas anteriores...");
    const questionsRef = collection(db, "questions");
    const existing = await getDocs(questionsRef);
    for (const docSnap of existing.docs) {
        await deleteDoc(doc(db, "questions", docSnap.id));
    }
    console.log(`  ✓ ${existing.size} preguntas eliminadas`);

    console.log(`\n📝 Subiendo ${preguntas.length} preguntas con respuestas ocultas...`);

    for (const p of preguntas) {
        const docRef = doc(questionsRef, `q${p.id}`);
        await setDoc(docRef, {
            id: `q${p.id}`,
            text: p.pregunta,
            answer: "???",
        });
    }

    console.log(`\n✅ Listo! ${preguntas.length} preguntas subidas con respuesta "???".`);
}

seed().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
