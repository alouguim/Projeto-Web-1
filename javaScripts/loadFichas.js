let fichas = JSON.parse(localStorage.getItem('dadosFicha'));

const lista = document.getElementById('lista-fichas');
const fichasRow = document.getElementById('fichas-row');
const mensagemVazia = document.getElementById('mensagem-vazia');

function carregarEstilosCSS(...caminhos) {
  caminhos.forEach(caminho => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = caminho;
    document.head.appendChild(link);
  });
}

function showFicha(arquivoHTMLDestino = "#", ficha) {
    if (!ficha || !ficha.detalhesSociais) return document.createTextNode("Ficha inválida");

    carregarEstilosCSS("../style/root.css", "../style/fichas.css");

    const container = document.createElement("div");
    container.className = "ficha";

    container.innerHTML = `
        <a href="${arquivoHTMLDestino}" class="artbut">
        <img src="../Imagens/donk.jpg" alt="${ficha.detalhesSociais.nomePersonagem}" class="art">
        <div class="lista">
            <ul class="listainfo">
            <li>${ficha.detalhesSociais.nomePersonagem}</li>
            <li>${ficha.origem || ""}</li>
            <li>${ficha.caminho || ""}</li>
            <li>${ficha.classe || ""}</li>
            <li>${ficha.personalidade || ""}</li>
            </ul>
        </div>
        </a>
    `;

    return container;
}

function loadFichas() {
  console.log('Carregando fichas:', fichas);

    fichasRow.innerHTML = '';

  if (fichas.length === 0) {
    mensagemVazia.style.display = 'block';
    return;
  } else {
    mensagemVazia.style.display = 'none';
  }

  for (ficha of fichas) {
    col = showFicha("../html/detalhada.html",ficha);
    fichasRow.appendChild(col);
  }
}

loadFichas();