/**
 * Script de seed para PRODUCCIÓN.
 * Lee preguntas-app.json y respuestas-app.json, las combina y sube a Firestore.
 * Usa Firebase Admin SDK (bypasea reglas de seguridad).
 *
 * Uso: npx tsx scripts/seed-production.ts
 */

import { db } from "./firebase-config";
import { readFileSync } from "fs";
import { resolve } from "path";

const preguntasRaw = JSON.parse(readFileSync(resolve("src/lib/preguntas-app.json"), "utf-8"));
const respuestasRaw = JSON.parse(readFileSync(resolve("src/lib/respuestas-app.json"), "utf-8"));

const preguntas: { id: number; pregunta: string }[] = preguntasRaw.respuestas;
const respuestas: { id: number; respuesta: string }[] = respuestasRaw.respuestas;

const respuestaMap = new Map<number, string>();
for (const r of respuestas) {
    respuestaMap.set(r.id, r.respuesta);
}

async function seedProduction(): Promise<void> {
    console.log("🗑️  Eliminando preguntas anteriores...");
    const questionsRef = db.collection("questions");
    const existing = await questionsRef.get();
    const batch1 = db.batch();
    existing.docs.forEach((doc) => batch1.delete(doc.ref));
    await batch1.commit();
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
        await questionsRef.doc(`q${p.id}`).set({
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
