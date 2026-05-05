import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(process.cwd(), "service-account.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8")) as ServiceAccount;

const app = initializeApp({
    credential: cert(serviceAccount),
});

export const db = getFirestore(app);
