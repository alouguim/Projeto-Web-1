// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTRckw_dyNjk1IN6wIn9KJy77UqphVnCI",
  authDomain: "genesisrpg-dd66f.firebaseapp.com",
  projectId: "genesisrpg-dd66f",
  storageBucket: "genesisrpg-dd66f.appspot.com",
  messagingSenderId: "462567056660",
  appId: "1:462567056660:web:d987330cc5753659ee4e01",
  measurementId: "G-Y25HNE4R8L"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Exporta para uso nos outros scripts
export { app, analytics, db, auth, storage };
