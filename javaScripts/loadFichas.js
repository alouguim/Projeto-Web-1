let fichas = JSON.parse(localStorage.getItem('fichas'));

const lista = document.getElementById('lista-fichas');
const fichasRow = document.getElementById('fichas-row');
const mensagemVazia = document.getElementById('mensagem-vazia');

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
    ficha.gerarHTMLResumo();
    fichasRow.appendChild(col);
  }
}