import { Ficha } from './ficha.js';
import { db } from './firebase.js'
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

const FICHAS_COLLECTION_NAME = 'fichas';
const fichasCol = collection(db, FICHAS_COLLECTION_NAME);

const lista = document.getElementById('lista-fichas');
const fichasRow = document.getElementById('fichas-row');
const mensagemVazia = document.getElementById('mensagem-vazia');

const painelEdicao = document.getElementById('painel-edicao');
const formEdicao = document.getElementById('form-edicao');
const btnCancelar = document.getElementById('btn-cancelar');

let fichaAtual = null;

function carregarEstilosCSS(...caminhos) {
    caminhos.forEach(caminho => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = caminho;
        document.head.appendChild(link);
    });
}

function showFicha(ficha) {
    if (!ficha || !ficha.detalhesSociais || !ficha.detalhesSociais.nomePersonagem) {
        const invalidFicha = document.createElement("div");
        invalidFicha.textContent = "Ficha inválida ou incompleta.";
        invalidFicha.className = "text-danger";
        return invalidFicha;
    }

    carregarEstilosCSS("../style/root.css", "../style/fichas.css");

    const container = document.createElement("div");
    container.className = "ficha";

    container.innerHTML = `
        <div class="main-ficha">
            <a href="visualizar.html?id=${ficha.id}" class="artbut">
                <img src="${ficha.imagem || '../Imagens/noimg.png'}" class="art">
                <ul class="listainfo">
                    <li style="font-weight: bold;">${ficha.detalhesSociais.nomePersonagem}</li>
                    <li style="opacity: 75%; font-style: italic;">${ficha.classe || "Classe Desconhecida"}</li>
                </ul>
            </a>
            <div class="buttons">
                <a href="#" class="buta" data-id="${ficha.id}">
                    <p>Edição Rápida</p>
                </a>
                <button class="butb" data-id="${ficha.id}">
                    Deletar
                </button>
            </div>
        </div>
    `;

    const botaoDeletar = container.querySelector(".butb");
    botaoDeletar.addEventListener("click", async () => {
        if (confirm("Tem certeza que deseja deletar esta ficha?")) {
            await deletarFicha(botaoDeletar.dataset.id);
            fecharPainelEdicao();
        }
    });

    const botaoEditar = container.querySelector(".buta");
    botaoEditar.addEventListener("click", (e) => {
        e.preventDefault();
        editarFicha(ficha);
    });

    return container;
}

async function loadFichas() {
    fichasRow.innerHTML = '';

    try {
        const fichasCarregadas = [];
        const querySnapshot = await getDocs(fichasCol);
        querySnapshot.forEach((docSnap) => {
            fichasCarregadas.push(new Ficha({ id: docSnap.id, ...docSnap.data() }));
        });

        if (fichasCarregadas.length === 0) {
            mensagemVazia.style.display = 'block';
            document.body.style.cssText = "background-blend-mode: luminosity;";
            fecharPainelEdicao();
        } else {
            document.body.style.cssText = "background-blend-mode: normal;";
            mensagemVazia.style.display = 'none';
            fichasCarregadas.forEach(ficha => {
                const col = showFicha(ficha);
                fichasRow.appendChild(col);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar fichas do Firestore:", error);
        alert("Não foi possível carregar as fichas. Verifique sua conexão e as regras do Firebase.");
        mensagemVazia.style.display = 'block';
        document.body.style.cssText = "background-blend-mode: luminosity;";
    }
}

function editarFicha(ficha) {
    console.log("-----------------------------------------");
    console.log("Chamando editarFicha.");
    console.log("Ficha recebida para edição:", ficha);
    fichaAtual = ficha;
    console.log("fichaAtual definida como:", fichaAtual);
    console.log("ID da fichaAtual no editarFicha:", fichaAtual ? fichaAtual.id : 'fichaAtual é nula');
    console.log("-----------------------------------------");

    const detalhesSociais = ficha.detalhesSociais || {};

    document.getElementById('edit-nomePersonagem').value = detalhesSociais.nomePersonagem || '';
    document.getElementById('edit-origem').value = ficha.origem || '';
    document.getElementById('edit-caminho').value = ficha.caminho || '';
    document.getElementById('edit-classe').value = ficha.classe || '';
    document.getElementById('edit-personalidade').value = detalhesSociais.personalidade || '';

    const atributos = ficha.atributos || {};
    document.getElementById('edit-forca').value = atributos.forca || 0;
    document.getElementById('edit-destreza').value = atributos.destreza || 0;
    document.getElementById('edit-resistencia').value = atributos.resistencia || 0;
    document.getElementById('edit-maestria').value = atributos.maestriaHonkai || 0;
    document.getElementById('edit-proficiencia').value = atributos.proficiencia || 0;
    document.getElementById('edit-bonus').value = atributos.bonusCura || 0;
    document.getElementById('edit-recarga').value = atributos.recarga || 0;

    painelEdicao.style.display = 'block';
}

formEdicao.addEventListener('submit', async e => {
    e.preventDefault();

    console.log("-----------------------------------------");
    console.log("Evento de submit do formulário de edição.");
    console.log("Valor de fichaAtual no submit:", fichaAtual);
    console.log("ID da fichaAtual no submit:", fichaAtual ? fichaAtual.id : 'fichaAtual é nula');
    console.log("-----------------------------------------");

    if (!fichaAtual || !fichaAtual.id) {
        console.error("Nenhuma ficha selecionada para edição ou ID ausente.");
        alert("Erro: Não foi possível identificar a ficha para salvar. Por favor, tente novamente.");
        return;
    }

    if (!fichaAtual.detalhesSociais) {
        fichaAtual.detalhesSociais = {};
    }
    if (!fichaAtual.detalhesCombate) {
        fichaAtual.detalhesCombate = {};
    }
    if (!fichaAtual.atributos) {
        fichaAtual.atributos = {};
    }

    fichaAtual.detalhesSociais.nomePersonagem = document.getElementById('edit-nomePersonagem').value;
    fichaAtual.origem = document.getElementById('edit-origem').value;
    fichaAtual.caminho = document.getElementById('edit-caminho').value;
    fichaAtual.classe = document.getElementById('edit-classe').value;
    fichaAtual.detalhesSociais.personalidade = document.getElementById('edit-personalidade').value;

    fichaAtual.atributos.forca = Number(document.getElementById('edit-forca').value);
    fichaAtual.atributos.destreza = Number(document.getElementById('edit-destreza').value);
    fichaAtual.atributos.resistencia = Number(document.getElementById('edit-resistencia').value);
    fichaAtual.atributos.maestriaHonkai = Number(document.getElementById('edit-maestria').value);
    fichaAtual.atributos.proficiencia = Number(document.getElementById('edit-proficiencia').value);
    fichaAtual.atributos.bonusCura = Number(document.getElementById('edit-bonus').value);
    fichaAtual.atributos.recarga = Number(document.getElementById('edit-recarga').value);

    try {
        const fichaRef = doc(db, FICHAS_COLLECTION_NAME, fichaAtual.id);
        const dataToUpdate = fichaAtual.toJSON();

        await updateDoc(fichaRef, dataToUpdate);
        console.log("Ficha atualizada no Firestore:", fichaAtual.id);
        await loadFichas();
        fecharPainelEdicao();
    } catch (error) {
        console.error("Erro ao atualizar ficha no Firestore:", error);
        alert("Não foi possível salvar as alterações. Tente novamente.");
    }
});

async function deletarFicha(id) {
    try {
        await deleteDoc(doc(db, FICHAS_COLLECTION_NAME, id));
        console.log("Ficha deletada do Firestore:", id);
        await loadFichas();
    } catch (error) {
        console.error("Erro ao deletar ficha do Firestore:", error);
        alert("Não foi possível deletar a ficha. Tente novamente.");
    }
}

btnCancelar.addEventListener('click', () => {
    fecharPainelEdicao();
});

function fecharPainelEdicao() {
    painelEdicao.style.display = 'none';
    fichaAtual = null;
}

loadFichas();