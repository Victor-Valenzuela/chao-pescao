import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCfwsSvtB835qotaCmbUHECFyJ5wRVVZYc",
    authDomain: "chao-pescao-game.firebaseapp.com",
    projectId: "chao-pescao-game",
    storageBucket: "chao-pescao-game.firebasestorage.app",
    messagingSenderId: "76427374452",
    appId: "1:76427374452:web:befb259a0443ddc8cc0621",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
