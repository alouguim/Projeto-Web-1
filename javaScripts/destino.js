//RESERVA
/////////////////
////////////////

function getFichaIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

const atributos = [
  "forca", "resistencia", "destreza", "proficiencia", "maestriaHonkai", "bonusCura",
  "recarga", "carisma", "coragem", "empatia", "iniciativa", "inteligencia", "vontade", "bonusIniciativa"
];

// Gera os inputs de atributos no HTML
const container = document.getElementById("atributos-container");
atributos.forEach(attr => {
  const label = document.createElement("label");
  label.className = "form-label mt-2";
  label.setAttribute("for", `atributo-${attr}`);
  label.innerText = attr.charAt(0).toUpperCase() + attr.slice(1);

  const input = document.createElement("input");
  input.className = "form-control";
  input.type = "number";
  input.id = `atributo-${attr}`;

  container.appendChild(label);
  container.appendChild(input);
});

let fichas = JSON.parse(localStorage.getItem("dadosFicha")) || [];
const fichaId = getFichaIdFromURL();
let fichaAtual = fichas.find(f => f.id === fichaId);

if (!fichaAtual) {
  alert("Ficha não encontrada!");
  window.location.href = "index.html";
}

function preencherFormulario(ficha) {
  const sociais = ficha.detalhesSociais || {};

  document.getElementById("img-perso").src = ficha.imagem || "";
  document.getElementById("nomePersonagem").value = sociais.nomePersonagem || "";
  document.getElementById("nomeJogador").value = sociais.nomeJogador || "";
  document.getElementById("classeSocial").value = sociais.classeSocial || "";
  document.getElementById("origem").value = ficha.origem || "";
  document.getElementById("classe").value = ficha.classe || "";
  document.getElementById("caminho").value = ficha.caminho || "";
  document.getElementById("aparencia").value = sociais.aparencia || "";
  document.getElementById("historia").value = sociais.historia || "";
  document.getElementById("objetivo").value = sociais.objetivo || "";
  document.getElementById("personalidade").value = sociais.personalidade || "";
  document.getElementById("familia").value = sociais.familia || "";
  document.getElementById("ranking").value = sociais.ranking || "";
  document.getElementById("imagem").value = ficha.imagem || "";

  atributos.forEach(attr => {
    const input = document.getElementById(`atributo-${attr}`);
    if (input) {
      input.value = ficha.atributos?.[attr] || 0;
    }
  });

  const combate = ficha.detalhesCombate || {};
  document.getElementById("visao").value = combate.visao || "";
  document.getElementById("manifestacao").value = combate.manifestacao || "";
  document.getElementById("combate-forca").value = combate.forca || 0;
  document.getElementById("combate-destreza").value = combate.destreza || 0;
  document.getElementById("combate-constituicao").value = combate.constituicao || 0;
  document.getElementById("combate-inteligencia").value = combate.inteligencia || 0;
  document.getElementById("combate-sabedoria").value = combate.sabedoria || 0;
  document.getElementById("combate-carisma").value = combate.carisma || 0;
}

preencherFormulario(fichaAtual);

document.getElementById("form-edicao-completa").addEventListener("submit", function (e) {
  e.preventDefault();

  fichaAtual.detalhesSociais = {
    nomePersonagem: document.getElementById("nomePersonagem").value,
    nomeJogador: document.getElementById("nomeJogador").value,
    classeSocial: document.getElementById("classeSocial").value,
    aparencia: document.getElementById("aparencia").value,
    historia: document.getElementById("historia").value,
    objetivo: document.getElementById("objetivo").value,
    personalidade: document.getElementById("personalidade").value,
    familia: document.getElementById("familia").value,
    ranking: document.getElementById("ranking").value,
  };

  fichaAtual.origem = document.getElementById("origem").value;
  fichaAtual.classe = document.getElementById("classe").value;
  fichaAtual.caminho = document.getElementById("caminho").value;
  fichaAtual.imagem = document.getElementById("imagem").value;

  fichaAtual.atributos = {};
  atributos.forEach(attr => {
    fichaAtual.atributos[attr] = Number(document.getElementById(`atributo-${attr}`).value);
  });

  fichaAtual.detalhesCombate = {
    visao: document.getElementById("visao").value,
    manifestacao: document.getElementById("manifestacao").value,
    forca: Number(document.getElementById("combate-forca").value),
    destreza: Number(document.getElementById("combate-destreza").value),
    constituicao: Number(document.getElementById("combate-constituicao").value),
    inteligencia: Number(document.getElementById("combate-inteligencia").value),
    sabedoria: Number(document.getElementById("combate-sabedoria").value),
    carisma: Number(document.getElementById("combate-carisma").value)
  };

  const index = fichas.findIndex(f => f.id === fichaAtual.id);
  if (index !== -1) {
    fichas[index] = fichaAtual;
    localStorage.setItem("dadosFicha", JSON.stringify(fichas));
    alert("Ficha atualizada com sucesso!");
  }
});
