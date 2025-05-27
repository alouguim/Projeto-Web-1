document.addEventListener("DOMContentLoaded", () => {
  class Ficha {
    constructor(data) {
      data = data || {};
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
        vontade: 1,
        bonusIniciativa: 0
      }, data.atributos || {});
      Object.defineProperty(this.atributos, 'iniciativa', {
        get: () => this.atributos.destreza + this.atributos.bonusIniciativa,
        enumerable: true
      });
      this.detalhesSociais = data.detalhesSociais || {};
      this.detalhesCombate = data.detalhesCombate || {};
    }

    aumentarAtributo(attr, val = 1) {
      if (this.atributos.hasOwnProperty(attr)) {
        this.atributos[attr] += val;
      } else {
        this.atributos[attr] = val;
      }
    }

    setOrigem(origem) {
      this.origem = origem;
    }

    setClasse(classe, bonusPorClasse) {
      this.classe = classe;
      if (bonusPorClasse[classe]) {
        for (const [attr, val] of Object.entries(bonusPorClasse[classe])) {
          this.aumentarAtributo(attr, val);
        }
      }
    }

    setCaminho(caminho, bonusPorCaminho) {
      this.caminho = caminho;
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
        origem: this.origem,
        classe: this.classe,
        caminho: this.caminho,
        atributos: atributosCopiados,
        detalhesSociais: this.detalhesSociais,
        detalhesCombate: this.detalhesCombate
      };
    }
  }

  // UTILITÁRIOS DO LOCALSTORAGE
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

  // LÓGICA POR PÁGINA
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

      const atributoCombate = formData.get("atributoCombate");
      if (atributoCombate) {
        ficha.aumentarAtributo(atributoCombate, 1);
      }

      const sociaisSelecionados = formData.getAll("atributoSocial");
      if (sociaisSelecionados.length !== 2) {
        return;
      }

      sociaisSelecionados.forEach(attr => ficha.aumentarAtributo(attr, 1));

      salvarFichaAtual(ficha);
      window.location.href = form.action;
    });

  } else if (page === "origem.html") {
    const form = document.querySelector("form");

    const bonusPorCaminho = {
      abundancia: { bonusCura: 1, recarga: 1 },
      caca: { destreza: 1, proficiencia: 1 },
      destruicao: { forca: 1, resistencia: 1 },
      harmonia: { proficiencia: 1, recarga: 1 },
      inexistencia: { recarga: 1, coragem: 1 },
      permanencia: { resistencia: 1, destreza: 1 },
      preservacao: { resistencia: 1, recarga: 1 },
      propagacao: { vontade: 1, carisma: 1 },
      conhecimento: { maestriaHonkai: 1, inteligencia: 1 },
      controle: { carisma: 1, inteligencia: 1 },
      equilibrio: { inteligencia: 1, vontade: 1 }
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const origemSelecionada = formData.get("origem");
      const caminhoSelecionado = formData.get("caminho");

      if (!origemSelecionada || !caminhoSelecionado) return;

      const ficha = carregarFichaAtual();
      ficha.setOrigem(origemSelecionada);
      ficha.setCaminho(caminhoSelecionado, bonusPorCaminho);

      salvarFichaAtual(ficha);
      window.location.href = form.action;
    });

  } else if (page === "classe.html") {
    const form = document.querySelector("form");

    const bonusPorClasse = {
      guerreiro: { forca: 1, resistencia: 1 },
      tank: { resistencia: 2 },
      assassino: { destreza: 1, proficiencia: 1 },
      mago: { maestriaHonkai: 1, recarga: 1 },
      lutador: { destreza: 1, resistencia: 1 },
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

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
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

      const ficha = carregarFichaAtual();
      ficha.setDetalhesSociais(detalhesSociais);
      ficha.setDetalhesCombate(detalhesCombate);

      adicionarFicha(ficha); // salva no array
      localStorage.removeItem("fichaAtual"); // limpa temporário

      alert("Ficha criada com sucesso!");
      window.location.href = form.action;
    });
  }
});
