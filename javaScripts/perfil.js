// perfil.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

let usuarioRef = null;
let usuarioExiste = false;

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Usuário não logado.");
      window.location.href = "/html/login.html";
      return;
    }

    const uid = user.uid;
    const email = user.email;
    usuarioRef = doc(db, "usuarios", uid);

    document.getElementById("email").value = email;
    document.getElementById("email").disabled = true;

    try {
      const docSnap = await getDoc(usuarioRef);
      if (docSnap.exists()) {
        usuarioExiste = true;
        const dados = docSnap.data();

        document.getElementById("nome").value = dados.nome || "";
        mudar_background(dados.fundo || "#ffffff");
        mudar_icon(dados.icon || "guerreiro");

        const radio = document.querySelector(`input[name="classe"][value="${dados.icon}"]`);
        if (radio) radio.checked = true;
      }
    } catch (erro) {
      console.error("Erro ao carregar perfil:", erro);
    }
  });

  document.getElementById("dados_login").addEventListener("submit", async (e) => {
    e.preventDefault();
    await salvarDados();
    window.location.href = "/html/index.html";
  });

  document.getElementById("cor_perfil").addEventListener("input", (e) => {
    mudar_background(e.target.value);
  });

  document.getElementById("dados").addEventListener("change", () => {
    const classe = document.querySelector('input[name="classe"]:checked')?.value;
    mudar_icon(classe);
  });

  document.getElementById("logout_btn").addEventListener("click", async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("logado");
      window.location.href = "/html/login.html";
    } catch (error) {
      console.error("Erro ao deslogar: ", error)
      alert("Erro ao sair.")
    }
  });
});

async function salvarDados() {
  const user = auth.currentUser;
  if (!user) return;

  const nome = document.getElementById("nome").value;
  const cor = document.getElementById("cor_perfil").value;
  const classe = document.querySelector('input[name="classe"]:checked')?.value || "guerreiro";

  const dadosParaSalvar = {
    nome,
    email: user.email,
    fundo: cor,
    icon: classe,
  };

  const usuarioRef = doc(db, "usuarios", user.uid);

  try {
    const docSnap = await getDoc(usuarioRef);

    if (docSnap.exists()) {
      await updateDoc(usuarioRef, dadosParaSalvar);
    } else {
      await setDoc(usuarioRef, dadosParaSalvar);
    }

    alert("Dados salvos com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    alert("Erro ao salvar dados: " + error.message);
  }
}

function mudar_background(cor) {
  document.getElementById("perfil_usuario").style.backgroundColor = cor;
  document.getElementById("cor_perfil").value = cor;
}

function mudar_icon(icon) {
  const map = {
    guerreiro: ["Token-guerreiro.png", "Guerreiro"],
    tank: ["Token-tank.png", "Tank"],
    assassino: ["token-assassino.png", "Assassino"],
    mago: ["token-mago.png", "Mago"],
    atirador: ["token-atirador.png", "Atirador"],
    curandeiro: ["Token-curandeiro.png", "Curandeiro"],
    suporte: ["token-suporte.png", "Suporte"],
  };

  if (map[icon]) {
    const [src, alt] = map[icon];
    const img = document.getElementById("icon");
    img.src = `/Imagens/${src}`;
    img.alt = alt;
  }
}
