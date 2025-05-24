class Ficha {
  constructor(nome, jogador, lore, atributos, imagem) {
    this.nome = nome;
    this.jogador = jogador;
    this.lore = lore;
    this.atributos = atributos;
    this.imagem = imagem;
  }

  gerarHTMLResumo(arquivoHTMLDestino = "#") {
    carregarEstilosCSS("../style/root.css", "../style/fichas.css");

    const container = document.createElement("div");
    container.className = "ficha";

    container.innerHTML = `
        <a href="${arquivoHTMLDestino}" class="artbut">
        <img src="../Imagens/donk.jpg" alt="${this.nome}" class="art">
        <div class="lista">
            <ul class="listainfo">
            <li>${this.nome}</li>
            <li>${this.lore?.origem || ""}</li>
            <li>${this.lore?.caminho || ""}</li>
            <li>${this.atributos?.classe || ""}</li>
            <li>${this.lore?.personalidade || ""}</li>
            </ul>
        </div>
        </a>
    `;

    return container;
    }

  gerarHTMLCompleto() {
    carregarEstilosCSS("../style/root.css", "../style/artficha.css");

    return `
      <div class="ficha">
        <span class="voltar">
          <a href="fichas.html" class="volt">Voltar</a>
        </span>
        <img src=${this.imagem} alt="art" class="art">

        <div class="lista">
          <form class="infos">
            ${this._inputTexto("label", "nome", "Nome", this.nome || "Donklii")}
            ${this._inputTexto("label", "origem", "Origem", this.lore.origem || "Eremita")}
            ${this._inputTexto("label", "caminho", "Caminho", this.lore.caminho || "Conhecimento")}
            ${this._inputTexto("label", "classe", "Classe", this.atributos.classe || "Mago")}
            ${this._inputTexto("label", "personalidade", "Personalidade", this.lore.personalidade || "Sem medo")}
          </form>
        </div>

        <div class="atributos">
          Atributos de Combate
          <div class="combate">
            ${this._inputNumero("label2", "forca", "Força", this.atributos.forca)}
            ${this._inputNumero("label2", "resistencia", "Resistência", this.atributos.resistencia)}
            ${this._inputNumero("label2", "agilidade", "Agilidade", this.atributos.agilidade)}
            ${this._inputNumero("label2", "maestria_honkai", "Maestria Honkai", this.atributos.maestriaHonkai)}
            ${this._inputNumero("label2", "bonus_de_cura", "Bônus de Cura", this.atributos.bonusCura)}
            ${this._inputNumero("label2", "recarga", "Recarga", this.atributos.recarga)}
          </div>

          <br>Atributos Sociais
          <div class="sociais">
            ${this._inputNumero("label2", "inteligencia", "Inteligência", this.atributos.inteligencia)}
            ${this._inputNumero("label2", "carisma", "Carisma", this.atributos.carisma)}
            ${this._inputNumero("label2", "coragem", "Coragem", this.atributos.coragem)}
            ${this._inputNumero("label2", "empatia", "Empatia", this.atributos.empatia)}
            ${this._inputNumero("label2", "vontade", "Vontade", this.atributos.vontade)}
          </div>
        </div>

        <div class="lore">
          <label for="hist">História:</label>
          <textarea type="text" id="hist" name="hist">${this.lore.historia || ""}</textarea>
        </div>
      </div>
    `;
  }

  _inputTexto(classe, id, label, valor = "") {
    return `
      <div class="${classe}">
        <label for="${id}">${label}:</label>
        <input type="text" id="${id}" name="${id}" placeholder="${valor}" value="${valor}">
      </div>`;
  }

  _inputNumero(classe, id, label, valor = 0) {
    return `
      <div class="${classe}">
        <label for="${id}">${label}:</label>
        <input type="number" id="${id}" name="${id}" maxlength="2" placeholder="0" value="${valor}">
      </div>`;
  }
}



function carregarEstilosCSS(...caminhos) {
  caminhos.forEach(caminho => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = caminho;
    document.head.appendChild(link);
  });
}




class Lore {
  constructor(origem, caminho, personalidade, historia) {
    this.origem = origem;
    this.caminho = caminho;
    this.personalidade = personalidade;
    this.historia = historia;
  }
}


class Atributos {
  constructor(classe, 
    forca, resistencia, agilidade, maestriaHonkai, bonusCura, recarga,
    inteligencia, carisma, coragem, empatia, vontade) {
    this.classe = classe;

    // Atributos de Combate
    this.forca = forca;
    this.resistencia = resistencia;
    this.agilidade = agilidade;
    this.maestriaHonkai = maestriaHonkai;
    this.bonusCura = bonusCura;
    this.recarga = recarga;

    // Atributos Sociais
    this.inteligencia = inteligencia;
    this.carisma = carisma;
    this.coragem = coragem;
    this.empatia = empatia;
    this.vontade = vontade;
  }
}

                                                                                // EXEMPLO DE COMO USAR
//const atributos = new Atributos("Todas", 5 ,7 , 2 ,5 ,7 ,8, 9, 3 ,5 ,6 , 10);
//
//const novaLore = new Lore("casa", "avenida", "filho da puta", "nenhuma");
//
//const personagem = new Ficha("Donklii", "Jogador1", novaLore, atributos, "../Imagens/donk.jpg");
//  //document.body.innerHTML = personagem.gerarHTMLCompleto();
//
//const resumo = personagem.gerarHTMLResumo("donkficha.html");
//document.body.appendChild(resumo);