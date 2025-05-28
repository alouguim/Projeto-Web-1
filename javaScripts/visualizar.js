function getFichaIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

const fichaId = getFichaIdFromURL();
const fichas = JSON.parse(localStorage.getItem("dadosFicha")) || [];
const ficha = fichas.find(f => f.id === fichaId);

if (!ficha) {
  alert("Ficha não encontrada!");
  window.location.href = "index.html";
}

const container = document.getElementById("ficha-container");


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

mostrarFicha(ficha);
