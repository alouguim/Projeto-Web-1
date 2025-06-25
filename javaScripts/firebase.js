// firebase.js
// Centraliza a inicialização do Firebase App e a exportação das instâncias de serviço.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCTRckw_dyNjk1IN6wIn9KJy77UqphVnCI",
    authDomain: "genesisrpg-dd66f.firebaseapp.com",
    projectId: "genesisrpg-dd66f",
    storageBucket: "genesisrpg-dd66f.firebasestorage.app",
    messagingSenderId: "462567056660",
    appId: "1:462567056660:web:d987330cc5753659ee4e01",
    measurementId: "G-Y25HNE4R8L"
};

// Verifica se já existe uma instância do Firebase App para evitar duplicações
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // Opcional: Se quiser usar Analytics, inicialize aqui, caso contrário remova.
    // getAnalytics(app); 
} else {
    app = getApp(); // Se já existe, pega a instância existente
}


// Exporta as instâncias dos serviços do Firebase
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const firebaseApp = app; // Se precisar da instância do app em si
