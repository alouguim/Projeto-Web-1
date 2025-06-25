import { db, auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// CADASTRO
export function cadastrar_usuario() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const classe = document.querySelector('input[name="classe"]:checked').value;

    createUserWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            const user = userCredential.user;

            return setDoc(doc(db, "usuarios", user.uid), {
                nome: nome,
                email: email,
                icon: classe,
                fundo: null
            });
        })
        .then(() => {
            alert("Usuário cadastrado com sucesso!");
            window.location.href = "/html/index.html";
        })
        .catch((error) => {
            console.error("Erro:", error);
            alert("Erro: " + error.message);
        });
}

// LOGIN
export function logar() {
    const dados = document.getElementById("dados_login");
    const dados_login = new FormData(dados);

    const email_ou_nome = dados_login.get("nome"); // aqui espera o email (ou você pode ajustar)
    const senha = dados_login.get("senha");

    // Firebase Auth não suporta login por nome, apenas email/senha.
    // Então certifique-se que "nome" do form seja um email.
    signInWithEmailAndPassword(auth, email_ou_nome, senha)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Logado com sucesso!");
            localStorage.setItem("logado", "true");
            window.location.href = "/html/index.html";
        })
        .catch((error) => {
            console.error("Erro ao logar:", error);
            alert("Erro ao logar: " + error.message);
        });
}
