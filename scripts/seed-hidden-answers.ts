/**
 * Sube las 160 preguntas de producción con respuestas ocultas ("???").
 * Para testear sin spoilers. Usa Firebase Admin SDK.
 *
 * Uso: npx tsx scripts/seed-hidden-answers.ts
 */

import { db } from "./firebase-config";
import { readFileSync } from "fs";
import { resolve } from "path";

const preguntasRaw = JSON.parse(readFileSync(resolve("src/lib/preguntas-app.json"), "utf-8"));
const preguntas: { id: number; pregunta: string }[] = preguntasRaw.respuestas;

async function seed(): Promise<void> {
    console.log("🗑️  Eliminando preguntas anteriores...");
    const questionsRef = db.collection("questions");
    const existing = await questionsRef.get();
    const batch = db.batch();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`  ✓ ${existing.size} preguntas eliminadas`);

    console.log(`\n📝 Subiendo ${preguntas.length} preguntas con respuestas ocultas...`);

    for (const p of preguntas) {
        await questionsRef.doc(`q${p.id}`).set({
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
