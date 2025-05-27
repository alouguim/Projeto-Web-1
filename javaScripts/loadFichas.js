let fichas = JSON.parse(localStorage.getItem('dadosFicha')) || [];

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
    if (!ficha || !ficha.detalhesSociais) return document.createTextNode("Ficha inválida");

    carregarEstilosCSS("../style/root.css", "../style/fichas.css");

    const container = document.createElement("div");
    container.className = "ficha";

    container.innerHTML = `
      <div class="main-ficha">
        <a href="destino.html?id=${ficha.id}" class="artbut">
          <img src="${ficha.imagem || '../Imagens/noimg.png'}" alt="${ficha.detalhesSociais.nomePersonagem}" class="art">
          <ul class="listainfo">
            <li>${ficha.detalhesSociais.nomePersonagem}</li>
            <li>${ficha.classe || ""}</li>
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
    botaoDeletar.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja deletar esta ficha?")) {
        const idParaRemover = Number(botaoDeletar.dataset.id);
        fichas = fichas.filter(f => f.id !== idParaRemover);
        localStorage.setItem("dadosFicha", JSON.stringify(fichas));
        loadFichas();
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

function loadFichas() {
  fichas = JSON.parse(localStorage.getItem('dadosFicha')) || [];

  fichasRow.innerHTML = '';

  if (fichas.length === 0) {
    mensagemVazia.style.display = 'block';
    fecharPainelEdicao();
    return;
  } else {
    mensagemVazia.style.display = 'none';
  }

  fichas.forEach(ficha => {
    const col = showFicha(ficha);
    fichasRow.appendChild(col);
  });
}

function editarFicha(ficha) {
  fichaAtual = ficha;

  document.getElementById('edit-nomePersonagem').value = ficha.detalhesSociais.nomePersonagem || '';
  document.getElementById('edit-origem').value = ficha.origem || '';
  document.getElementById('edit-caminho').value = ficha.caminho || '';
  document.getElementById('edit-classe').value = ficha.classe || '';
  document.getElementById('edit-personalidade').value = ficha.personalidade || '';

  const detalhes = ficha.detalhesCombate || {};
  document.getElementById('edit-forca').value = detalhes.forca || 0;
  document.getElementById('edit-destreza').value = detalhes.destreza || 0;
  document.getElementById('edit-constituicao').value = detalhes.constituicao || 0;
  document.getElementById('edit-inteligencia').value = detalhes.inteligencia || 0;
  document.getElementById('edit-sabedoria').value = detalhes.sabedoria || 0;
  document.getElementById('edit-carisma').value = detalhes.carisma || 0;

  painelEdicao.style.display = 'block';
}

formEdicao.addEventListener('submit', e => {
  e.preventDefault();

  if (!fichaAtual) return;

  fichaAtual.detalhesSociais.nomePersonagem = document.getElementById('edit-nomePersonagem').value;
  fichaAtual.origem = document.getElementById('edit-origem').value;
  fichaAtual.caminho = document.getElementById('edit-caminho').value;
  fichaAtual.classe = document.getElementById('edit-classe').value;
  fichaAtual.personalidade = document.getElementById('edit-personalidade').value;

  if (!fichaAtual.detalhesCombate) fichaAtual.detalhesCombate = {};

  fichaAtual.detalhesCombate.forca = Number(document.getElementById('edit-forca').value);
  fichaAtual.detalhesCombate.destreza = Number(document.getElementById('edit-destreza').value);
  fichaAtual.detalhesCombate.constituicao = Number(document.getElementById('edit-constituicao').value);
  fichaAtual.detalhesCombate.inteligencia = Number(document.getElementById('edit-inteligencia').value);
  fichaAtual.detalhesCombate.sabedoria = Number(document.getElementById('edit-sabedoria').value);
  fichaAtual.detalhesCombate.carisma = Number(document.getElementById('edit-carisma').value);


  const index = fichas.findIndex(f => f.id === fichaAtual.id);
  if (index > -1) {
    fichas[index] = fichaAtual;
  }

  localStorage.setItem('dadosFicha', JSON.stringify(fichas));
  loadFichas();
  fecharPainelEdicao();
});

btnCancelar.addEventListener('click', () => {
  fecharPainelEdicao();
});

function fecharPainelEdicao() {
  painelEdicao.style.display = 'none';
  fichaAtual = null;
}

loadFichas();
