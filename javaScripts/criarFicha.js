document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf("/") + 1);
  
    if (page === "atributos.html") {
      const form = document.querySelector("form");
      const checkboxes = form.querySelectorAll('input[type="checkbox"][name="atributoSocial"]');
  
      // Limite de 2 checkboxes marcados
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
          const selected = Array.from(checkboxes).filter(cb => cb.checked);
          if (selected.length > 2) {
            checkbox.checked = false;
            console.log("Você só pode selecionar até 2 atributos sociais.");
          }
        });
      });
  
      form.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const formData = new FormData(form);
  
        const atributos = {
          forca: 1,
          resistencia: 1,
          destreza: 1,
          maestriaHonkai: 1,
          bonusCura: 1,
          recarga: 1,
          inteligencia: 1,
          carisma: 1,
          coragem: 1,
          empatia: 1,
          vontade: 1,
        };
  
        const atributoCombate = formData.get("atributoCombate");
        if (atributoCombate && atributos.hasOwnProperty(atributoCombate)) {
          atributos[atributoCombate] += 1;
        }
  
        const sociaisSelecionados = formData.getAll("atributoSocial");
        if (sociaisSelecionados.length !== 2) {
          console.log("Você deve selecionar exatamente 2 atributos sociais.");
          return;
        }
  
        sociaisSelecionados.forEach(attr => {
          if (atributos.hasOwnProperty(attr)) {
            atributos[attr] += 1;
          }
        });
  
        localStorage.setItem("atributosPersonagem", JSON.stringify(atributos));
  
        const atributosSalvosJSON = localStorage.getItem("atributosPersonagem");
        if (atributosSalvosJSON) {
          console.log("Atributos atualmente salvos:", JSON.parse(atributosSalvosJSON));
        } else {
          console.log("Nenhum atributo salvo ainda.");
        }
  
        window.location.href = form.action;
      });
  
    } else if (page === "origem.html") {
      const form = document.querySelector("form");
  
      form.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const formData = new FormData(form);
        const origemSelecionada = formData.get("origem");
  
        if (!origemSelecionada) {
          console.log("Nenhuma origem selecionada.");
          return;
        }
  
        const atributosSalvosJSON = localStorage.getItem("atributosPersonagem");
        let atributos = atributosSalvosJSON ? JSON.parse(atributosSalvosJSON) : {};
  
        const bonusPorOrigem = {
          amnesico: { forca: 1, inteligencia: 1 },
          artista: { carisma: 2, vontade: 1 },
        };
  
        const bonus = bonusPorOrigem[origemSelecionada] || {};
  
        // Aplica bônus da origem
        Object.keys(bonus).forEach(chave => {
          atributos[chave] = (atributos[chave] || 1) + bonus[chave];
        });
  
        const dadosFicha = {
          origem: origemSelecionada,
          atributos: atributos
        };
  
        localStorage.setItem("dadosFicha", JSON.stringify(dadosFicha));
  
        const dadosFichaSalvosJSON = localStorage.getItem("dadosFicha");
        if (dadosFichaSalvosJSON) {
          console.log("Dados da ficha atualmente salvos:", JSON.parse(dadosFichaSalvosJSON));
        } else {
          console.log("Nenhum dado da ficha salvo ainda.");
        }
  
        window.location.href = form.action;
      });
  
    } else if (page === "classe.html") {
      const form = document.querySelector("form");
  
      const bonusPorClasse = {
        guerreiro: { forca: 1, resistencia: 1 },
        tank: { resistencia: 2},
        assassino: { destreza: 1, forca: 1 },
        mago: { maestriaHonkai: 3, inteligencia: 1 },
        atirador: { destreza: 2, maestriaHonkai: 1 },
        curandeiro: { bonusCura: 3, empatia: 1 },
        suporte: { carisma: 2, vontade: 1 }
      };
  
      form.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const formData = new FormData(form);
        const classeSelecionada = formData.get("classe");
  
        if (!classeSelecionada) {
          console.log("Nenhuma classe selecionada.");
          return;
        }
  
        // Puxa os dados da ficha (origem + atributos)
        const dadosFichaJSON = localStorage.getItem("dadosFicha");
        let dadosFicha = dadosFichaJSON ? JSON.parse(dadosFichaJSON) : { atributos: {} };
  
        // Garante que existe o objeto atributos
        if (!dadosFicha.atributos) {
          dadosFicha.atributos = {};
        }
  
        // Garante que todos os atributos estão definidos (mínimo 1)
        const todosAtributos = ["forca", "resistencia", "destreza", "maestriaHonkai", "bonusCura", "recarga", "inteligencia", "carisma", "coragem", "empatia", "vontade"];
        todosAtributos.forEach(attr => {
          if (!(attr in dadosFicha.atributos)) {
            dadosFicha.atributos[attr] = 1;
          }
        });
  
        // Aplica bônus da classe
        const bonus = bonusPorClasse[classeSelecionada] || {};
        Object.entries(bonus).forEach(([attr, val]) => {
          dadosFicha.atributos[attr] = (dadosFicha.atributos[attr] || 1) + val;
        });
  
        // Salva classe escolhida
        dadosFicha.classe = classeSelecionada;
  
        // Salva no localStorage
        localStorage.setItem("dadosFicha", JSON.stringify(dadosFicha));
  
        // Imprime no console
        console.log("Classe selecionada:", classeSelecionada);
        console.log("Dados da ficha atualizados:", dadosFicha);
  
        // Vai para próxima página (detalhes.html)
        window.location.href = form.action;
      });
    }
  });
  