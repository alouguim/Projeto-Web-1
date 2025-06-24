// Importa as funções necessárias do SDK do Firebase e Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
// Importa a classe Ficha, assumindo que ela está em './ficha.js' no mesmo nível
import { Ficha } from './ficha.js';

// Sua configuração do Firebase (copiada dos seus outros arquivos)
const firebaseConfig = {
    apiKey: "AIzaSyCTRckw_dyNjk1IN6wIn9KJy77UqphVnCI",
    authDomain: "genesisrpg-dd66f.firebaseapp.com",
    projectId: "genesisrpg-dd66f",
    storageBucket: "genesisrpg-dd66f.firebasestorage.app",
    messagingSenderId: "462567056660",
    appId: "1:462567056660:web:d987330cc5753659ee4e01",
    measurementId: "G-Y25HNE4R8L"
};

// Inicializa o Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência à coleção 'fichas' no Firestore (mesmo nome usado nos outros scripts)
const FICHAS_COLLECTION_NAME = 'fichas';
const fichasCol = collection(db, FICHAS_COLLECTION_NAME);

// Elemento container onde a ficha será renderizada
const container = document.getElementById("ficha-container");

/**
 * Obtém o ID da ficha da URL.
 * @returns {string | null} O ID da ficha como string, ou null se não encontrado.
 */
function getFichaIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); // O ID do Firestore é uma string, não um número
}

/**
 * Cria um elemento div para exibir um campo de informação.
 * @param {string} label - O rótulo do campo.
 * @param {string} valor - O valor do campo.
 * @returns {HTMLElement} O elemento div do campo.
 */
function criarCampo(label, valor) {
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `<strong>${label}:</strong> ${valor || "<em>Não preenchido</em>"}`;
    return div;
}

/**
 * Cria um elemento h4 para títulos de seção.
 * @param {string} titulo - O texto do título.
 * @returns {HTMLElement} O elemento h4 do título.
 */
function criarTitulo(titulo) {
    const h4 = document.createElement("h4");
    h4.className = "mt-4 border-bottom pb-2";
    h4.innerText = titulo;
    return h4;
}

/**
 * Exibe os detalhes da ficha no DOM.
 * @param {Ficha} ficha - A instância da Ficha a ser exibida.
 */
function mostrarFicha(ficha) {
    // Garante que sub-objetos existem para evitar TypeError
    const sociais = ficha.detalhesSociais || {};
    const atributos = ficha.atributos || {};
    const combate = ficha.detalhesCombate || {};

    // --- Informações Gerais ---
    container.appendChild(criarTitulo("Informações Gerais"));

    const rowInfoGerais = document.createElement("div");
    rowInfoGerais.className = "row g-3 align-items-start";

    const colImg = document.createElement("div");
    colImg.className = "col-md-2";
    if (ficha.imagem) {
        const img = document.createElement("img");
        img.src = ficha.imagem;
        img.alt = "Imagem do Personagem";
        img.className = "img-fluid rounded mb-4 w-100";
        colImg.appendChild(img);
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

    // --- Detalhes Sociais ---
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

    // --- Atributos ---
    container.appendChild(criarTitulo("Atributos"));
    const rowAtributos = document.createElement("div");
    rowAtributos.className = "row g-3";

    Object.entries(atributos).forEach(([chave, valor]) => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.appendChild(
            criarCampo(chave.charAt(0).toUpperCase() + chave.slice(1), valor)
        );
        rowAtributos.appendChild(col);
    });

    container.appendChild(rowAtributos);
}

/**
 * Função principal para carregar e exibir a ficha.
 */
async function init() {
    const fichaId = getFichaIdFromURL();

    if (!fichaId) {
        alert("ID da ficha não fornecido na URL!");
        window.location.href = "index.html"; // Redireciona se não houver ID
        return;
    }

    try {
        const fichaRef = doc(db, FICHAS_COLLECTION_NAME, fichaId);
        const fichaSnap = await getDoc(fichaRef);

        if (fichaSnap.exists()) {
            // Cria uma instância da classe Ficha com os dados do Firestore e o ID do documento
            const ficha = new Ficha({ id: fichaSnap.id, ...fichaSnap.data() });
            mostrarFicha(ficha);
        } else {
            alert("Ficha não encontrada no banco de dados!");
            window.location.href = "index.html"; // Redireciona se a ficha não existir
        }
    } catch (error) {
        console.error("Erro ao carregar ficha do Firestore:", error);
        alert("Erro ao carregar a ficha. Verifique sua conexão e as regras do Firebase.");
        window.location.href = "index.html"; // Redireciona em caso de erro
    }
}

// Inicia o processo quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", init);