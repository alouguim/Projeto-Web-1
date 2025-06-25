import { Ficha } from './ficha.js';
import { db, auth } from './firebase.js'; // Ajuste o caminho conforme necessário
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
// REMOVIDO: import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js";


// REMOVIDO: Inicialização do Storage aqui (se estivesse)
// const storage = getStorage(app);


let modoEdicao = null;

const FICHAS_COLLECTION_NAME = 'fichas';
const fichasCol = collection(db, FICHAS_COLLECTION_NAME);

document.addEventListener("DOMContentLoaded", () => {
    // REMOVIDO: Função uploadImage
    // async function uploadImage(file, filePath) { /* ... */ }

    async function carregarTodasFichas() {
        try {
            const fichas = [];
            const querySnapshot = await getDocs(fichasCol);
            querySnapshot.forEach((docSnap) => {
                fichas.push(new Ficha({ id: docSnap.id, ...docSnap.data() }));
            });
            console.log("Fichas carregadas do Firestore:", fichas);
            return fichas;
        } catch (error) {
            console.error("Erro ao carregar todas as fichas do Firestore:", error);
            alert("Erro ao carregar fichas. Verifique sua conexão e permissões do Firebase.");
            return [];
        }
    }

    async function adicionarFicha(ficha) {
        try {
            const docRef = await addDoc(fichasCol, ficha.toJSON());
            console.log("Ficha adicionada com ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao adicionar ficha ao Firestore:", error);
            alert("Erro ao adicionar ficha. Tente novamente.");
            throw error;
        }
    }

    function carregarFichaAtual() {
        const dataJSON = localStorage.getItem("fichaAtual");
        return new Ficha(dataJSON ? JSON.parse(dataJSON) : undefined);
    }

    function salvarFichaAtual(ficha) {
        localStorage.setItem("fichaAtual", JSON.stringify(ficha.toJSON()));
        console.log("Ficha atual salva no localStorage:", ficha);
    }

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf("/") + 1);

    if (page === "atributos.html") {
        const form = document.querySelector("form");
        const checkboxes = form.querySelectorAll('input[type="checkbox"][name="atributoSocial"]');

        const ficha = carregarFichaAtual();
        if (ficha.atributoCombateEscolhido) {
            const radio = form.querySelector(`input[name="atributoCombate"][value="${ficha.atributoCombateEscolhido}"]`);
            if (radio) radio.checked = true;
        }
        if (Array.isArray(ficha.atributosSociaisEscolhidos)) {
            ficha.atributosSociaisEscolhidos.forEach(attr => {
                const checkbox = form.querySelector(`input[name="atributoSocial"][value="${attr}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                const selected = Array.from(checkboxes).filter(cb => cb.checked);
                if (selected.length > 2) {
                    checkbox.checked = false;
                }
            });
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const ficha = carregarFichaAtual();

            if (ficha.atributoCombateEscolhido && ficha.atributos.hasOwnProperty(ficha.atributoCombateEscolhido)) {
                ficha.atributos[ficha.atributoCombateEscolhido] -= 1;
            }
            if (Array.isArray(ficha.atributosSociaisEscolhidos)) {
                ficha.atributosSociaisEscolhidos.forEach(attr => {
                    if (ficha.atributos.hasOwnProperty(attr)) {
                        ficha.atributos[attr] -= 1;
                    }
                });
            }

            const atributoCombate = formData.get("atributoCombate");
            if (atributoCombate) {
                ficha.aumentarAtributo(atributoCombate, 1);
                ficha.atributoCombateEscolhido = atributoCombate;
            }

            const sociaisSelecionados = formData.getAll("atributoSocial");
            if (sociaisSelecionados.length !== 2) {
                alert("Por favor, selecione exatamente 2 atributos sociais.");
                return;
            }

            sociaisSelecionados.forEach(attr => ficha.aumentarAtributo(attr, 1));
            ficha.atributosSociaisEscolhidos = sociaisSelecionados;

            salvarFichaAtual(ficha);
            window.location.href = form.action;
        });

    } else if (page === "origem.html") {
        const form = document.querySelector("form");

        const bonusPorCaminho = {
            Abundância: { bonusCura: 1, recarga: 1 },
            Caça: { destreza: 1, proficiencia: 1 },
            Destruição: { forca: 1, resistencia: 1 },
            Harmonia: { proficiencia: 1, recarga: 1 },
            Inexistência: { recarga: 1, coragem: 1 },
            Permanência: { resistencia: 1, destreza: 1 },
            Preservação: { resistencia: 1, recarga: 1 },
            Propagação: { vontade: 1, carisma: 1 },
            Conhecimento: { maestriaHonkai: 1, inteligencia: 1 },
            Controle: { carisma: 1, inteligencia: 1 },
            Equilíbrio: { inteligencia: 1, vontade: 1 }
        };

        const ficha = carregarFichaAtual();
        if (ficha.origem) {
            const radioOrigem = form.querySelector(`input[name="origem"][value="${ficha.origem}"]`);
            if (radioOrigem) radioOrigem.checked = true;
        }
        if (ficha.caminho) {
            const radioCaminho = form.querySelector(`input[name="caminho"][value="${ficha.caminho}"]`);
            if (radioCaminho) radioCaminho.checked = true;
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const origemSelecionada = formData.get("origem");
            const caminhoSelecionado = formData.get("caminho");

            if (!origemSelecionada || !caminhoSelecionado) {
                alert("Por favor, selecione uma Origem e um Caminho.");
                return;
            }

            const ficha = carregarFichaAtual();

            console.log("Ficha carregada do localStorage:", ficha);
            console.log("Força antes de aplicar o bônus do caminho:", ficha.atributos.forca);

            ficha.setOrigem(origemSelecionada);
            console.log("Chamando setCaminho com caminho:", caminhoSelecionado);
            ficha.setCaminho(caminhoSelecionado, bonusPorCaminho);

            console.log("Força após aplicar o bônus do caminho:", ficha.atributos.forca);

            salvarFichaAtual(ficha);
            window.location.href = form.action;
        });

    } else if (page === "classe.html") {
        const form = document.querySelector("form");

        const bonusPorClasse = {
            Guerreiro: { forca: 1, destreza: 1 },
            Tank: { resistencia: 2 },
            Assassino: { destreza: 1, proficiencia: 1 },
            Mago: { maestriaHonkai: 1, recarga: 1 },
            Lutador: { destreza: 1, resistencia: 1 },
            atirador: { proficiencia: 1, recarga: 1 },
            curandeiro: { bonusCura: 2 },
            suporte: { recarga: 1, resistencia: 1 }
        };

        const ficha = carregarFichaAtual();
        if (ficha.classe) {
            const radioClasse = form.querySelector(`input[name="classe"][value="${ficha.classe}"]`);
            if (radioClasse) radioClasse.checked = true;
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const classeSelecionada = formData.get("classe");
            if (!classeSelecionada) {
                alert("Por favor, selecione uma Classe.");
                return;
            }

            const ficha = carregarFichaAtual();
            ficha.setClasse(classeSelecionada, bonusPorClasse);

            salvarFichaAtual(ficha);
            window.location.href = form.action;
        });

    } else if (page === "detalhes.html") {
        const form = document.querySelector("form");
        const inputImagem = document.getElementById("imagem-personagem"); // Este input ainda precisa existir no HTML, mas não será usado

        const ficha = carregarFichaAtual();
        if (ficha.detalhesSociais) {
            document.getElementById("nome-personagem").value = ficha.detalhesSociais.nomePersonagem || '';
            document.getElementById("nome-jogador").value = ficha.detalhesSociais.nomeJogador || '';
            document.getElementById("aparencia").value = ficha.detalhesSociais.aparencia || '';
            document.getElementById("personalidade").value = ficha.detalhesSociais.personalidade || '';
            document.getElementById("objetivo").value = ficha.detalhesSociais.objetivo || '';
            document.getElementById("classe-social").value = ficha.detalhesSociais.classeSocial || '';
            document.getElementById("ranking").value = ficha.detalhesSociais.ranking || '';
            document.getElementById("historia").value = ficha.detalhesSociais.historia || '';
            document.getElementById("familia").value = ficha.detalhesSociais.familia || '';
        }
        if (ficha.detalhesCombate) {
            document.getElementById("visao").value = ficha.detalhesCombate.visao || '';
            document.getElementById("manifestacao").value = ficha.detalhesCombate.manifestacao || '';
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const ficha = carregarFichaAtual();

            const detalhesSociais = {
                nomePersonagem: formData.get("nome-personagem"),
                nomeJogador: formData.get("nome-jogador"),
                aparencia: formData.get("aparencia"),
                personalidade: formData.get("personalidade"),
                objetivo: formData.get("objetivo"),
                classeSocial: formData.get("classe-social"),
                ranking: formData.get("ranking"),
                historia: formData.get("historia"),
                familia: formData.get("familia")
            };

            const detalhesCombate = {
                visao: formData.get("visao"),
                manifestacao: formData.get("manifestacao")
            };

             ficha.setDetalhesSociais(detalhesSociais);
            ficha.setDetalhesCombate(detalhesCombate);

            const currentUser = auth.currentUser;

            if (currentUser) {
                ficha.usuario = currentUser.uid;
            } else {
                alert("Você precisa estar logado para criar uma ficha!");
                window.location.href = "../html/login.html";
                return;
            }

            ficha.imagem = null; // Sempre define imagem como null

            // --- ADICIONE ESTES CONSOLE.LOGS BEM AQUI ---
            console.log("--- DEBUG DE CRIAÇÃO DE FICHA ---");
            console.log("currentUser:", currentUser);
            console.log("currentUser.uid:", currentUser ? currentUser.uid : "N/A");
            console.log("ficha.usuario ANTES de adicionarFicha:", ficha.usuario);
            console.log("ficha.toJSON() ANTES de adicionarFicha:", ficha.toJSON());
            console.log("----------------------------------");
            // --- FIM DOS CONSOLE.LOGS ---

            try {
                const newId = await adicionarFicha(ficha);
                ficha.id = newId;
                localStorage.removeItem("fichaAtual");

                alert("Ficha criada com sucesso!");
                window.location.href = form.action;
            } catch (error) {
                console.error("Erro ao finalizar ficha:", error);
                alert("Não foi possível criar a ficha. Verifique o console para mais detalhes.");
            }
        });

    } else {
        const fichasContainer = document.getElementById('lista-de-fichas');
        if (fichasContainer) {
            carregarTodasFichas().then(fichas => {
                if (fichas.length > 0) {
                    fichasContainer.innerHTML = '<h2>Fichas Existentes:</h2>';
                    fichas.forEach(f => {
                        const fichaElement = document.createElement('div');
                        fichaElement.innerHTML = `
                                <div class="card mb-3 p-3">
                                    <h3>${f.detalhesSociais?.nomePersonagem || 'Personagem Sem Nome'} (ID: ${f.id})</h3>
                                    <p>Origem: ${f.origem || 'N/A'}</p>
                                    <p>Classe: ${f.classe || 'N/A'}</p>
                                    <p>Caminho: ${f.caminho || 'N/A'}</p>
                                    ${f.imagem ? `<img src="${f.imagem}" alt="Imagem do Personagem" style="max-width: 100px; height: auto; margin-top: 10px;">` : ''}
                                </div>
                            `;
                        fichasContainer.appendChild(fichaElement);
                    });
                } else {
                    fichasContainer.innerHTML = '<p>Nenhuma ficha encontrada no Firestore.</p>';
                }
            });
        }
        localStorage.removeItem("fichaAtual");
    }
});