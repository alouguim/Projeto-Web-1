import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// Firebase inicializado previamente em firebase.js
import { auth, db } from "../javaScripts/firebase.js";

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../arquivosParaFetch/cabecalho.html");
        const html = await response.text();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);

        const header = document.querySelector("header");
        if (header) {
            header.classList.add("d-none", "d-lg-block");
        }

        // Verifica com Firebase se há usuário logado
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                let nomeExibido = user.email; // fallback

                try {
                    const docRef = doc(db, "usuarios", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const dados = docSnap.data();
                        if (dados.nome && dados.nome.trim() !== "") {
                            nomeExibido = dados.nome;
                        }
                    }
                } catch (erro) {
                    console.error("Erro ao buscar dados do usuário:", erro);
                }

                const loginSpan = document.getElementById("usuario-logado");
                if (loginSpan) {
                    loginSpan.innerHTML = `<a href="../html/perfil.html">${nomeExibido}</a>`;
                }
            }
        });

    } catch (erro) {
        console.error("Erro ao carregar o cabeçalho:", erro);
    }
});
