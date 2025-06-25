export class Ficha {
    constructor(data) {
        data = data || {};
        this.id = data.id || "";
        this.origem = data.origem || "";
        this.classe = data.classe || "";
        this.caminho = data.caminho || "";
        this.usuario = data.usuario || "";
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
            this.atributos[attr] += val;
        } else {
            this.atributos[attr] = val;
        }
    }

    setOrigem(origem) {
        this.origem = origem;
    }

    setClasse(classe, bonusPorClasse) {
        if (this.classe && bonusPorClasse[this.classe]) {
            for (const [attr, val] of Object.entries(bonusPorClasse[this.classe])) {
                if (this.atributos.hasOwnProperty(attr)) {
                    this.atributos[attr] -= val;
                }
            }
        }
        this.classe = classe;
        if (bonusPorClasse[classe]) {
            for (const [attr, val] of Object.entries(bonusPorClasse[classe])) {
                this.aumentarAtributo(attr, val);
            }
        }
    }

    setCaminho(caminho, bonusPorCaminho) {
        if (this.caminho && bonusPorCaminho[this.caminho]) {
            for (const [attr, val] of Object.entries(bonusPorCaminho[this.caminho])) {
                if (this.atributos.hasOwnProperty(attr)) {
                    this.atributos[attr] -= val;
                }
            }
        }
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
        return {
            origem: this.origem,
            classe: this.classe,
            caminho: this.caminho,
            atributos: atributosCopiados,
            detalhesSociais: this.detalhesSociais,
            detalhesCombate: this.detalhesCombate,
            atributoCombateEscolhido: this.atributoCombateEscolhido,
            atributosSociaisEscolhidos: this.atributosSociaisEscolhidos,
            imagem: this.imagem,
            usuario: this.usuario
        };
    }
}