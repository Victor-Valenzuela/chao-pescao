/**
 * Sube las preguntas y respuestas traducidas a Firestore.
 * Crea colecciones questions_es, questions_en, questions_de.
 * Usa Firebase Admin SDK.
 *
 * Uso: npx tsx scripts/seed-translations.ts
 */

import { db } from "./firebase-config";
import { readFileSync } from "fs";
import { resolve } from "path";

interface QEntry { id: number; pregunta: string; }
interface AEntry { id: number; respuesta: string; }

const locales = [
    {
        code: "es",
        questions: JSON.parse(readFileSync(resolve("src/lib/preguntas-app.json"), "utf-8")).respuestas as QEntry[],
        answers: JSON.parse(readFileSync(resolve("src/lib/respuestas-app.json"), "utf-8")).respuestas as AEntry[],
    },
    {
        code: "en",
        questions: JSON.parse(readFileSync(resolve("src/lib/i18n/preguntas-en.json"), "utf-8")).respuestas as QEntry[],
        answers: JSON.parse(readFileSync(resolve("src/lib/i18n/respuestas-en.json"), "utf-8")).respuestas as AEntry[],
    },
    {
        code: "de",
        questions: JSON.parse(readFileSync(resolve("src/lib/i18n/preguntas-de.json"), "utf-8")).respuestas as QEntry[],
        answers: JSON.parse(readFileSync(resolve("src/lib/i18n/respuestas-de.json"), "utf-8")).respuestas as AEntry[],
    },
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

        const answerMap = new Map<number, string>();
        for (const a of locale.answers) {
            answerMap.set(a.id, a.respuesta);
        }

        console.log(`📝 Subiendo ${locale.questions.length} preguntas a ${collName}...`);
        let uploaded = 0;
        for (const q of locale.questions) {
            const answer = answerMap.get(q.id) ?? "???";
            await db.collection(collName).doc(`q${q.id}`).set({
                id: `q${q.id}`,
                text: q.pregunta,
                answer: answer,
            });
            uploaded++;
        }
        console.log(`✅ ${uploaded} preguntas subidas a ${collName}`);
    }

    console.log("\n🎉 ¡Traducciones completas!");
}

seed().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
