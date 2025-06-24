document.addEventListener("DOMContentLoaded", () => {
  class Ficha {
    constructor(data) {
      data = data || {};
      this.id = data.id || "";
      this.origem = data.origem || "";
      this.classe = data.classe || "";
      this.caminho = data.caminho || "";
      this.atributos = Object.assign({
        forca: 1,
        resistencia: 1,
        destreza: 1,
        proficiencia: 1,
        maestriaHonkai: 1,
        bonusCura: 1,
        recarga: 1,
        inteligencia: 1,
        carisma: 1,
        coragem: 1,
        empatia: 1,
        vontade: 1
      }, data.atributos || {});

      Object.defineProperty(this.atributos, 'iniciativa', {
        get: () => this.atributos.destreza,
        enumerable: true
      });
      this.detalhesSociais = data.detalhesSociais || {};
      this.detalhesCombate = data.detalhesCombate || {};
      this.imagem = data.imagem || null;
      this.atributoCombateEscolhido = data.atributoCombateEscolhido || null;
      this.atributosSociaisEscolhidos = data.atributosSociaisEscolhidos || [];
    }

    aumentarAtributo(attr, val = 1) {
      if (this.atributos.hasOwnProperty(attr)) {
        console.log(`Antes de aumentar ${attr}:`, this.atributos[attr]);
        this.atributos[attr] += val;
        console.log(`Depois de aumentar ${attr}:`, this.atributos[attr]);
      } else {
        this.atributos[attr] = val;
        console.log(`Inicializando ${attr} com:`, val);
      }
    }

    setOrigem(origem) {
      this.origem = origem;
    }

    setId() {
      const dataJSON = localStorage.getItem("dadosFicha");
      let ids = 0;

      if (dataJSON !== null) {
        const data = JSON.parse(dataJSON);
        ids = data.length + 1;
      } else {
        ids = 1;
      }

      this.id = ids;
    }

    setClasse(classe, bonusPorClasse) {
      // Se já tinha uma classe antes, remova seus bônus
      if (this.classe && bonusPorClasse[this.classe]) {
        for (const [attr, val] of Object.entries(bonusPorClasse[this.classe])) {
          this.atributos[attr] -= val;
        }
      }

      this.classe = classe;

      // Aplique os bônus da nova classe
      if (bonusPorClasse[classe]) {
        for (const [attr, val] of Object.entries(bonusPorClasse[classe])) {
          this.aumentarAtributo(attr, val);
        }
      }
    }

    setCaminho(caminho, bonusPorCaminho) {
      // Se já tinha um caminho antes, remova seus bônus
      if (this.caminho && bonusPorCaminho[this.caminho]) {
        for (const [attr, val] of Object.entries(bonusPorCaminho[this.caminho])) {
          this.atributos[attr] -= val;
        }
      }

      this.caminho = caminho;

      // Aplique os bônus do novo caminho
      if (bonusPorCaminho[caminho]) {
        for (const [attr, val] of Object.entries(bonusPorCaminho[caminho])) {
          this.aumentarAtributo(attr, val);
        }
      }
    }

    setDetalhesSociais(detalhes) {
      this.detalhesSociais = detalhes;
    }

    setDetalhesCombate(detalhes) {
      this.detalhesCombate = detalhes;
    }

    toJSON() {
      const atributosCopiados = Object.assign({}, this.atributos);
      atributosCopiados.iniciativa = this.atributos.iniciativa;

      return {
        id: this.id,
        origem: this.origem,
        classe: this.classe,
        caminho: this.caminho,
        atributos: atributosCopiados,
        detalhesSociais: this.detalhesSociais,
        detalhesCombate: this.detalhesCombate,
        atributoCombateEscolhido: this.atributoCombateEscolhido,
        atributosSociaisEscolhidos: this.atributosSociaisEscolhidos,
        imagem: this.imagem
      };
    }
  }

  function carregarTodasFichas() {
    const dataJSON = localStorage.getItem("dadosFicha");
    const fichas = dataJSON ? JSON.parse(dataJSON) : [];
    return fichas.map(data => new Ficha(data));
  }

  function adicionarFicha(ficha) {
    const fichas = carregarTodasFichas();
    fichas.push(ficha.toJSON());
    localStorage.setItem("dadosFicha", JSON.stringify(fichas));
  }

  function carregarFichaAtual() {
    const dataJSON = localStorage.getItem("fichaAtual");
    return new Ficha(dataJSON ? JSON.parse(dataJSON) : undefined);
  }

  function salvarFichaAtual(ficha) {
    localStorage.setItem("fichaAtual", JSON.stringify(ficha.toJSON()));
  }

  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf("/") + 1);

  if (page === "atributos.html") {
    const form = document.querySelector("form");
    const checkboxes = form.querySelectorAll('input[type="checkbox"][name="atributoSocial"]');

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

      // Remover bônus antigos se existirem
      if (ficha.atributoCombateEscolhido) {
        ficha.atributos[ficha.atributoCombateEscolhido] -= 1;
      }
      if (Array.isArray(ficha.atributosSociaisEscolhidos)) {
        ficha.atributosSociaisEscolhidos.forEach(attr => {
          ficha.atributos[attr] -= 1;
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

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const origemSelecionada = formData.get("origem");
      const caminhoSelecionado = formData.get("caminho");

      if (!origemSelecionada || !caminhoSelecionado) return;

      const ficha = carregarFichaAtual();

      // Coloque estes logs de debug aqui:
      console.log("Ficha carregada do localStorage:", ficha);
      console.log("Força antes de aplicar o bônus do caminho:", ficha.atributos.forca);

      ficha.setId();
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

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const classeSelecionada = formData.get("classe");
      if (!classeSelecionada) return;

      const ficha = carregarFichaAtual();
      ficha.setClasse(classeSelecionada, bonusPorClasse);

      salvarFichaAtual(ficha);
      window.location.href = form.action;
    });

  } else if (page === "detalhes.html") {
    const form = document.querySelector("form");
    const inputImagem = document.getElementById("imagem-personagem");

    form.addEventListener("submit", (e) => {
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

      const file = inputImagem.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          ficha.imagem = event.target.result;

          adicionarFicha(ficha);
          localStorage.removeItem("fichaAtual");

          alert("Ficha criada com sucesso!");
          window.location.href = form.action;
        };
        reader.readAsDataURL(file);
      } else {
        ficha.imagem = null;
        adicionarFicha(ficha);
        localStorage.removeItem("fichaAtual");

        alert("Ficha criada com sucesso!");
        window.location.href = form.action;
      }
    });
  }

});
