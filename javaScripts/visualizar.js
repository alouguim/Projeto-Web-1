import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { Ficha } from './ficha.js';

const firebaseConfig = {
    apiKey: "AIzaSyCTRckw_dyNjk1IN6wIn9KJy77UqphVnCI",
    authDomain: "genesisrpg-dd66f.firebaseapp.com",
    projectId: "genesisrpg-dd66f",
    storageBucket: "genesisrpg-dd66f.firebasestorage.app",
    messagingSenderId: "462567056660",
    appId: "1:462567056660:web:d987330cc5753659ee4e01",
    measurementId: "G-Y25HNE4R8L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FICHAS_COLLECTION_NAME = 'fichas';
const fichasCol = collection(db, FICHAS_COLLECTION_NAME);

const container = document.getElementById("ficha-container");

function getFichaIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function criarCampo(label, valor) {
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `<strong>${label}:</strong> ${valor || "<em>Não preenchido</em>"}`;
    return div;
}

function criarTitulo(titulo) {
    const h4 = document.createElement("h4");
    h4.className = "mt-4 border-bottom pb-2";
    h4.innerText = titulo;
    return h4;
}

function mostrarFicha(ficha) {
    const sociais = ficha.detalhesSociais || {};
    const atributos = ficha.atributos || {};
    const combate = ficha.detalhesCombate || {};

    container.appendChild(criarTitulo("Informações Gerais"));

    const rowInfoGerais = document.createElement("div");
    rowInfoGerais.className = "row g-3 align-items-start";

    const colImg = document.createElement("div");
    colImg.className = "col-md-2";
    if (ficha.imagem) {
        const img = document.createElement("img");
        img.src = ficha.imagem;
        img.alt = `Imagem de ${sociais.nomePersonagem || 'Personagem'}`;
        img.className = "img-fluid rounded mb-4 w-100";
        colImg.appendChild(img);
    } else {
        const imgPlaceholder = document.createElement("img");
        imgPlaceholder.src = '../Imagens/noimg.png';
        imgPlaceholder.alt = "Nenhuma imagem disponível";
        imgPlaceholder.className = "img-fluid rounded mb-4 w-100";
        colImg.appendChild(imgPlaceholder);
    }
    rowInfoGerais.appendChild(colImg);

    const colDados = document.createElement("div");
    colDados.className = "col-md-9";

    const rowCampos = document.createElement("div");
    rowCampos.className = "row g-3";

    const camposInfoGerais = [
        { label: "Nome do Personagem", value: sociais.nomePersonagem },
        { label: "Nome do Jogador", value: sociais.nomeJogador },
        { label: "Origem", value: ficha.origem },
        { label: "Classe", value: ficha.classe },
        { label: "Caminho", value: ficha.caminho },
        { label: "Visão", value: combate.visao },
        { label: "Manifestação", value: combate.manifestacao }
    ];

    camposInfoGerais.forEach(campo => {
        const colCampo = document.createElement("div");
        colCampo.className = "col-md-6";
        colCampo.appendChild(criarCampo(campo.label, campo.value));
        rowCampos.appendChild(colCampo);
    });

    colDados.appendChild(rowCampos);
    rowInfoGerais.appendChild(colDados);
    container.appendChild(rowInfoGerais);

    container.appendChild(criarTitulo("Detalhes Sociais"));
    const rowSociais = document.createElement("div");
    rowSociais.className = "row g-3";

    const camposSociais = [
        { label: "Classe Social", value: sociais.classeSocial },
        { label: "Aparência", value: sociais.aparencia },
        { label: "História", value: sociais.historia },
        { label: "Objetivo", value: sociais.objetivo },
        { label: "Personalidade", value: sociais.personalidade },
        { label: "Família", value: sociais.familia },
        { label: "Ranking", value: sociais.ranking }
    ];

    camposSociais.forEach(campo => {
        const col = document.createElement("div");
        col.className = "col-md-6";
        col.appendChild(criarCampo(campo.label, campo.value));
        rowSociais.appendChild(col);
    });

    container.appendChild(rowSociais);

    container.appendChild(criarTitulo("Atributos"));
    const rowAtributos = document.createElement("div");
    rowAtributos.className = "row g-3";
    rowAtributos.id = "atributos"

    Object.entries(atributos).forEach(([chave, valor]) => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.id = `${chave}`
        col.appendChild(
            criarCampo(chave.charAt(0).toUpperCase() + chave.slice(1), valor)
        );
        rowAtributos.appendChild(col);
    });

    container.appendChild(rowAtributos);

    document.getElementById('atributos').addEventListener('click', async function(event) {
  const atributoClicado = event.target.closest('.col-md-4');
  if (atributoClicado) {
    const dado_rolado = await rolar_dado(atributoClicado.id,ficha);
    alert(`Rolagem de ${dado_rolado['atributo']}\nValor do dado: ${dado_rolado['dado_total']}\nDetalhes de rolamento: ${dado_rolado['dado_result']} + ${dado_rolado['modificador']}` );
  }
});
}

async function rolar_dado(id_atributo, ficha) {

    const modificador = ficha.atributos[id_atributo];

    try {
    const response = await fetch('https://rolz.org/api/?1d20.json');

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const dados = await response.json();
    const dado_rolado = (dados.result + modificador)
    const detalhes = {
        "atributo" : id_atributo,
        "dado_total" : dado_rolado,
        "dado_result" : dados.result,
        "modificador" : modificador
    }

    return detalhes

} catch (erro) {
    console.error('Erro na chamada da API:', erro);
  }
}

async function init() {
    const fichaId = getFichaIdFromURL();

    if (!fichaId) {
        alert("ID da ficha não fornecido na URL!");
        window.location.href = "index.html";
        return;
    }

    try {
        const fichaRef = doc(db, FICHAS_COLLECTION_NAME, fichaId);
        const fichaSnap = await getDoc(fichaRef);

        if (fichaSnap.exists()) {
            const ficha = new Ficha({ id: fichaSnap.id, ...fichaSnap.data() });
            mostrarFicha(ficha);
        } else {
            alert("Ficha não encontrada no banco de dados!");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Erro ao carregar ficha do Firestore:", error);
        alert("Erro ao carregar a ficha. Verifique sua conexão e as regras do Firebase.");
        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", init);