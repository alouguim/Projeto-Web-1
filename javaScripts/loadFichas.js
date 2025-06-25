import { Ficha } from './ficha.js';
import { db, auth } from './firebase.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

const ADMIN_UID = 'u8KVCrrHp3M5XuZwZ986PdRNRZ53';

const FICHAS_COLLECTION_NAME = 'fichas';
const fichasCol = collection(db, FICHAS_COLLECTION_NAME);

// --- NOVO: Nome da coleção de usuários (consistente com auth.js/regras) ---
const USERS_COLLECTION_NAME = 'usuarios'; // Você usa 'usuarios' nas regras e no cabecalho.js
const usersCol = collection(db, USERS_COLLECTION_NAME);

const lista = document.getElementById('lista-fichas');
const fichasRow = document.getElementById('fichas-row');
const mensagemVazia = document.getElementById('mensagem-vazia');

const painelEdicao = document.getElementById('painel-edicao');
const formEdicao = document.getElementById('form-edicao');
const btnCancelar = document.getElementById('btn-cancelar');

let fichaAtual = null;
let currentUser = null;
let userNamesMap = new Map(); // NOVO: Mapa para armazenar UID -> Nome do Usuário

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Usuário logado em loadFichas.js:", currentUser.email, currentUser.uid);
        loadFichas();
    } else {
        currentUser = null;
        console.log("Nenhum usuário logado em loadFichas.js.");
        fichasRow.innerHTML = '';
        mensagemVazia.textContent = "Faça login para ver suas fichas.";
        mensagemVazia.style.display = 'block';
        document.body.style.cssText = "background-blend-mode: luminosity;";
        fecharPainelEdicao();
    }
});

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

    // --- MUDANÇA AQUI: Usar userNamesMap para obter o nome do criador ---
    const criadorNome = userNamesMap.get(ficha.usuario) || 'Desconhecido';

    container.innerHTML = `
        <div class="main-ficha">
            <a href="visualizar.html?id=${ficha.id}" class="artbut">
                <img src="${ficha.imagem || '../Imagens/noimg.png'}" class="art">
                <ul class="listainfo">
                    <li style="font-weight: bold;">${ficha.detalhesSociais.nomePersonagem}</li>
                    <li style="opacity: 75%; font-style: italic;">${ficha.classe || "Classe Desconhecida"}</li>
                    <li style="font-size: 0.8em; color: gray;">${criadorNome}</li>
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
    userNamesMap.clear(); // Limpa o mapa a cada carregamento

    if (!currentUser) {
        console.log("loadFichas: Nenhum usuário logado. Não carregando fichas.");
        mensagemVazia.textContent = "Faça login para ver suas fichas.";
        mensagemVazia.style.display = 'block';
        document.body.style.cssText = "background-blend-mode: luminosity;";
        fecharPainelEdicao();
        return;
    }

    try {
        const fichasCarregadas = [];
        let q;
        let uidsParaBuscarNomes = new Set(); // NOVO: Conjunto para coletar UIDs únicos

        if (currentUser.uid === ADMIN_UID) {
            console.log("Admin logado. Carregando TODAS as fichas.");
            q = fichasCol;
        } else {
            console.log("Usuário normal logado. Carregando fichas do próprio usuário.");
            q = query(fichasCol, where("usuario", "==", currentUser.uid));
        }

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
            const fichaData = docSnap.data();
            fichasCarregadas.push(new Ficha({ id: docSnap.id, ...fichaData }));
            if (fichaData.usuario) {
                uidsParaBuscarNomes.add(fichaData.usuario); // Adiciona UID ao conjunto
            }
        });

        // --- NOVO: Buscar nomes dos usuários a partir dos UIDs coletados ---
        if (uidsParaBuscarNomes.size > 0) {
            // Firestore permite 'where(field, 'in', array)' para até 10 elementos.
            // Para mais, precisaria de múltiplas queries. Aqui, um loop simples é mais genérico.
            const uidsArray = Array.from(uidsParaBuscarNomes);
            
            // Loop para buscar cada nome de usuário (pode ser otimizado com query 'in' se for <= 10)
            for (const uid of uidsArray) {
                try {
                    const userDocRef = doc(db, USERS_COLLECTION_NAME, uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        userNamesMap.set(uid, userDocSnap.data().nome || uid); // Armazena o nome (ou UID como fallback)
                    } else {
                        userNamesMap.set(uid, 'Usuário Removido (' + uid.substring(0, 5) + '...)'); // Para UIDs sem perfil
                    }
                } catch (userFetchError) {
                    console.error("Erro ao buscar nome para UID:", uid, userFetchError);
                    userNamesMap.set(uid, 'Erro ao carregar (' + uid.substring(0, 5) + '...)');
                }
            }
        }
        // --- Fim da busca de nomes ---


        if (fichasCarregadas.length === 0) {
            if (currentUser.uid === ADMIN_UID) {
                 mensagemVazia.textContent = "Não há fichas cadastradas no total.";
            } else {
                 mensagemVazia.textContent = "Você ainda não tem fichas cadastradas.";
            }
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
        alert("Não foi possível carregar as fichas. Verifique sua conexão ou as regras do Firebase.");
        mensagemVazia.textContent = "Erro ao carregar fichas. Tente novamente.";
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