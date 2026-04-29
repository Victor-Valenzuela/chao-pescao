/**
 * Script de seed para el banco de preguntas de Chao Pescao.
 * Sube preguntas de cultura general a la colección `questions` de Firestore.
 *
 * Uso: npx tsx scripts/seed-questions.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

// Configuración Firebase — usa variables de entorno o placeholders
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

interface SeedQuestion {
    id: string;
    text: string;
    answer: string;
    category?: string;
}

const questions: SeedQuestion[] = [
    { id: "q1", text: "¿Cuál es la capital de Francia?", answer: "París", category: "Geografía" },
    { id: "q2", text: "¿Cuántos planetas tiene el sistema solar?", answer: "8", category: "Ciencia" },
    { id: "q3", text: "¿En qué año llegó el hombre a la Luna?", answer: "1969", category: "Historia" },
    { id: "q4", text: "¿Cuál es el océano más grande del mundo?", answer: "Pacífico", category: "Geografía" },
    { id: "q5", text: "¿Quién pintó la Mona Lisa?", answer: "Leonardo da Vinci", category: "Arte" },
    { id: "q6", text: "¿Cuál es el elemento químico con símbolo 'O'?", answer: "Oxígeno", category: "Ciencia" },
    { id: "q7", text: "¿En qué continente está Egipto?", answer: "África", category: "Geografía" },
    { id: "q8", text: "¿Cuántos lados tiene un hexágono?", answer: "6", category: "Matemáticas" },
    { id: "q9", text: "¿Cuál es el animal terrestre más rápido?", answer: "Guepardo", category: "Naturaleza" },
    { id: "q10", text: "¿Quién escribió Don Quijote de la Mancha?", answer: "Miguel de Cervantes", category: "Literatura" },
    { id: "q11", text: "¿Cuál es el río más largo del mundo?", answer: "Nilo", category: "Geografía" },
    { id: "q12", text: "¿Cuántos huesos tiene el cuerpo humano adulto?", answer: "206", category: "Ciencia" },
    { id: "q13", text: "¿En qué país se encuentra la Torre de Pisa?", answer: "Italia", category: "Geografía" },
    { id: "q14", text: "¿Cuál es el metal más abundante en la corteza terrestre?", answer: "Aluminio", category: "Ciencia" },
    { id: "q15", text: "¿Quién fue el primer presidente de Estados Unidos?", answer: "George Washington", category: "Historia" },
    { id: "q16", text: "¿Cuál es el idioma más hablado del mundo?", answer: "Chino mandarín", category: "Cultura" },
    { id: "q17", text: "¿Cuántas teclas tiene un piano estándar?", answer: "88", category: "Música" },
    { id: "q18", text: "¿Cuál es la moneda de Japón?", answer: "Yen", category: "Cultura" },
    { id: "q19", text: "¿Qué gas es esencial para la respiración humana?", answer: "Oxígeno", category: "Ciencia" },
    { id: "q20", text: "¿En qué año comenzó la Segunda Guerra Mundial?", answer: "1939", category: "Historia" },
    { id: "q21", text: "¿Cuál es el país más grande del mundo por superficie?", answer: "Rusia", category: "Geografía" },
    { id: "q22", text: "¿Cuántos colores tiene el arcoíris?", answer: "7", category: "Ciencia" },
    { id: "q23", text: "¿Quién compuso la Novena Sinfonía?", answer: "Beethoven", category: "Música" },
    { id: "q24", text: "¿Cuál es el hueso más largo del cuerpo humano?", answer: "Fémur", category: "Ciencia" },
    { id: "q25", text: "¿En qué ciudad se encuentran las pirámides de Giza?", answer: "El Cairo", category: "Geografía" },
    { id: "q26", text: "¿Cuál es el planeta más cercano al Sol?", answer: "Mercurio", category: "Ciencia" },
    { id: "q27", text: "¿Qué animal es el símbolo nacional de Australia?", answer: "Canguro", category: "Naturaleza" },
    { id: "q28", text: "¿Cuántos jugadores tiene un equipo de fútbol en cancha?", answer: "11", category: "Deportes" },
    { id: "q29", text: "¿Cuál es la capital de Argentina?", answer: "Buenos Aires", category: "Geografía" },
    { id: "q30", text: "¿Quién desarrolló la teoría de la relatividad?", answer: "Albert Einstein", category: "Ciencia" },
    { id: "q31", text: "¿Cuál es el desierto más grande del mundo?", answer: "Sahara", category: "Geografía" },
    { id: "q32", text: "¿En qué año se descubrió América?", answer: "1492", category: "Historia" },
    { id: "q33", text: "¿Cuál es la fórmula química del agua?", answer: "H2O", category: "Ciencia" },
    { id: "q34", text: "¿Qué instrumento toca un violinista?", answer: "Violín", category: "Música" },
    { id: "q35", text: "¿Cuál es el volcán más alto del mundo?", answer: "Ojos del Salado", category: "Geografía" },
];

async function seedQuestions(): Promise<void> {
    console.log(`Subiendo ${questions.length} preguntas a Firestore...`);

    const questionsRef = collection(db, "questions");

    for (const question of questions) {
        const docRef = doc(questionsRef, question.id);
        await setDoc(docRef, {
            id: question.id,
            text: question.text,
            answer: question.answer,
            ...(question.category && { category: question.category }),
        });
        console.log(`  ✓ ${question.id}: ${question.text}`);
    }

    console.log(`\n¡Listo! ${questions.length} preguntas subidas correctamente.`);
}

seedQuestions().catch((error) => {
    console.error("Error al subir preguntas:", error);
    process.exit(1);
});
