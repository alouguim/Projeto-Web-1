import { Ficha } from './ficha.js';
// Importa as funções necessárias do SDK do Firebase e Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// Sua configuração do Firebase (obtida do console do Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyCTRckw_dyNjk1IN6wIn9KJy77UqphVnCI",
    authDomain: "genesisrpg-dd66f.firebaseapp.com",
    projectId: "genesisrpg-dd66f",
    storageBucket: "genesisrpg-dd66f.firebasestorage.app",
    messagingSenderId: "462567056660",
    appId: "1:462567056660:web:d987330cc5753659ee4e01",
    measurementId: "G-Y25HNE4R8L"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Opcional, para Analytics
const db = getFirestore(app); // Instância do Firestore

// Variáveis de estado do aplicativo (mantidas para compatibilidade, mas o estado principal virá do Firestore)
let modoEdicao = null; // Mantém o ID da ficha que está sendo editada (se for implementado um sistema de edição de fichas já criadas)

// Coleção principal para as fichas
const FICHAS_COLLECTION_NAME = 'fichas';
const fichasCol = collection(db, FICHAS_COLLECTION_NAME);


document.addEventListener("DOMContentLoaded", () => {

    /**
     * Carrega todas as fichas do Firestore.
     * @returns {Promise<Ficha[]>} Um array de instâncias Ficha.
     */
    async function carregarTodasFichas() {
        try {
            const fichas = [];
            const querySnapshot = await getDocs(fichasCol);
            querySnapshot.forEach((docSnap) => {
                // Cria uma nova instância de Ficha com os dados e o ID do documento do Firestore
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

    /**
     * Adiciona uma nova ficha ao Firestore.
     * @param {Ficha} ficha - A instância da Ficha a ser adicionada.
     * @returns {Promise<string>} O ID do documento recém-criado no Firestore.
     */
    async function adicionarFicha(ficha) {
        try {
            const docRef = await addDoc(fichasCol, ficha.toJSON());
            console.log("Ficha adicionada com ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao adicionar ficha ao Firestore:", error);
            alert("Erro ao adicionar ficha. Tente novamente.");
            throw error; // Re-lança o erro para que o chamador possa tratá-lo
        }
    }

    /**
     * Carrega a ficha atualmente em edição do localStorage.
     * @returns {Ficha} A ficha atual ou uma nova instância se não existir.
     */
    function carregarFichaAtual() {
        const dataJSON = localStorage.getItem("fichaAtual");
        return new Ficha(dataJSON ? JSON.parse(dataJSON) : undefined);
    }

    /**
     * Salva a ficha atualmente em edição no localStorage.
     * @param {Ficha} ficha - A instância da Ficha a ser salva.
     */
    function salvarFichaAtual(ficha) {
        localStorage.setItem("fichaAtual", JSON.stringify(ficha.toJSON()));
        console.log("Ficha atual salva no localStorage:", ficha);
    }

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf("/") + 1);

    if (page === "atributos.html") {
        const form = document.querySelector("form");
        const checkboxes = form.querySelectorAll('input[type="checkbox"][name="atributoSocial"]');

        // Carrega a ficha atual ao carregar a página para pré-preencher
        const ficha = carregarFichaAtual();
        // Lógica para pré-preencher o formulário com dados da ficha (se houver)
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

            // Remover bônus antigos se existirem antes de aplicar novos
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

            // Atributo de combate
            const atributoCombate = formData.get("atributoCombate");
            if (atributoCombate) {
                ficha.aumentarAtributo(atributoCombate, 1);
                ficha.atributoCombateEscolhido = atributoCombate; // salvar para controlar depois
            }

            // Atributos sociais
            const sociaisSelecionados = formData.getAll("atributoSocial");
            if (sociaisSelecionados.length !== 2) {
                alert("Por favor, selecione exatamente 2 atributos sociais.");
                return;
            }

            sociaisSelecionados.forEach(attr => ficha.aumentarAtributo(attr, 1));
            ficha.atributosSociaisEscolhidos = sociaisSelecionados; // salvar para controle

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

        // Carrega a ficha atual ao carregar a página para pré-preencher
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

        // Carrega a ficha atual ao carregar a página para pré-preencher
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
        const inputImagem = document.getElementById("imagem-personagem");

        // Carrega a ficha atual ao carregar a página para pré-preencher
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
        // Exibir imagem pré-existente se houver (opcional)
        // const imgPreview = document.getElementById("imagem-preview");
        // if (ficha.imagem && imgPreview) {
        //     imgPreview.src = ficha.imagem;
        //     imgPreview.style.display = 'block';
        // }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const ficha = carregarFichaAtual(); // Pega a ficha mais recente do localStorage

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

            const file = inputImagem.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = async function (event) {
                    ficha.imagem = event.target.result; // Data URL da imagem

                    try {
                        const newId = await adicionarFicha(ficha); // Adiciona ao Firestore
                        ficha.id = newId; // Atribui o ID gerado pelo Firestore à ficha
                        localStorage.removeItem("fichaAtual"); // Limpa o rascunho do localStorage

                        alert("Ficha criada com sucesso!");
                        window.location.href = form.action; // Redireciona
                    } catch (error) {
                        console.error("Erro ao finalizar ficha com imagem:", error);
                        alert("Não foi possível criar a ficha com imagem. Tente novamente.");
                    }
                };
                reader.readAsDataURL(file);
            } else {
                ficha.imagem = null; // Garante que a imagem é nula se nenhum arquivo for selecionado

                try {
                    const newId = await adicionarFicha(ficha); // Adiciona ao Firestore
                    ficha.id = newId; // Atribui o ID gerado pelo Firestore à ficha
                    localStorage.removeItem("fichaAtual"); // Limpa o rascunho do localStorage

                    alert("Ficha criada com sucesso!");
                    window.location.href = form.action; // Redireciona
                } catch (error) {
                    console.error("Erro ao finalizar ficha sem imagem:", error);
                    alert("Não foi possível criar a ficha sem imagem. Tente novamente.");
                }
            }
        });
    } else {
        // Lógica para a página inicial (se houver) para listar fichas
        // Exemplo simples de como você pode exibir as fichas existentes:
        const fichasContainer = document.getElementById('lista-de-fichas'); // Você precisaria adicionar um elemento com este ID no seu HTML
        if (fichasContainer) {
            carregarTodasFichas().then(fichas => {
                if (fichas.length > 0) {
                    fichasContainer.innerHTML = '<h2>Fichas Existentes:</h2>';
                    fichas.forEach(f => {
                        const fichaElement = document.createElement('div');
                        fichaElement.innerHTML = `
                            <div class="card mb-3 p-3">
                                <h3>${f.detalhesSociais.nomePersonagem || 'Personagem Sem Nome'} (ID: ${f.id})</h3>
                                <p>Origem: ${f.origem || 'N/A'}</p>
                                <p>Classe: ${f.classe || 'N/A'}</p>
                                <p>Caminho: ${f.caminho || 'N/A'}</p>
                                <!-- Adicione mais detalhes aqui conforme necessário -->
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
        // Se esta for a página de índice principal, pode ser útil começar uma nova ficha aqui
        // ou listar as existentes. Se for uma página de "criação de nova ficha", pode limpar o localStorage.
        localStorage.removeItem("fichaAtual"); // Garante que uma nova ficha comece do zero
    }
});