/**
 * Sube las preguntas traducidas con respuestas ocultas ("???") a Firestore.
 * Para testear sin spoilers en todos los idiomas. Usa Firebase Admin SDK.
 *
 * Uso: npx tsx scripts/seed-translations-hidden.ts
 */

import { db } from "./firebase-config";
import { readFileSync } from "fs";
import { resolve } from "path";

interface QEntry { id: number; pregunta: string; }

const locales = [
    { code: "es", questions: JSON.parse(readFileSync(resolve("src/lib/preguntas-app.json"), "utf-8")).respuestas as QEntry[] },
    { code: "en", questions: JSON.parse(readFileSync(resolve("src/lib/i18n/preguntas-en.json"), "utf-8")).respuestas as QEntry[] },
    { code: "de", questions: JSON.parse(readFileSync(resolve("src/lib/i18n/preguntas-de.json"), "utf-8")).respuestas as QEntry[] },
];

async function clearCollection(name: string): Promise<number> {
    const ref = db.collection(name);
    const snap = await ref.get();
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return snap.size;
}

async function seed(): Promise<void> {
    for (const locale of locales) {
        const collName = `questions_${locale.code}`;
        console.log(`\n🗑️  Limpiando ${collName}...`);
        const deleted = await clearCollection(collName);
        console.log(`  ✓ ${deleted} documentos eliminados`);

        console.log(`📝 Subiendo ${locale.questions.length} preguntas a ${collName} con respuesta "???"...`);
        for (const q of locale.questions) {
            await db.collection(collName).doc(`q${q.id}`).set({
                id: `q${q.id}`,
                text: q.pregunta,
                answer: "???",
            });
        }
        console.log(`✅ ${locale.questions.length} preguntas subidas a ${collName}`);
    }

    console.log("\n🎉 ¡Traducciones con respuestas ocultas completas!");
}

seed().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
