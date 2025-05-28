function preencher_perfil() {
    const dados_cadastro = window.localStorage.getItem("dados_usuario")
    const dados_cadastro_atual = JSON.parse(dados_cadastro)

    document.getElementById("nome").value = dados_cadastro_atual['nome']
    document.getElementById("email").value =dados_cadastro_atual['email']
    mudar_background(dados_cadastro_atual['fundo'])
    mudar_icon(dados_cadastro_atual['icon'])
}

function mudar_background(cor_desejada) {
    document.getElementById("perfil_usuario").style.backgroundColor = cor_desejada
    document.getElementById("cor_perfil").value = cor_desejada
    return
}

function mudar_icon(icon_desejado) {


    if (icon_desejado == "guerreiro") {
        document.getElementById("icon").src = "/Imagens/Token-guerreiro.png"
        document.getElementById("icon").alt = "Guerreiro"
    }

    if (icon_desejado == "tank") {
        document.getElementById("icon").src = "/Imagens/Token-tank.png"
        document.getElementById("icon").alt = "Tank"
    }
    if (icon_desejado == "assassino") {
        document.getElementById("icon").src = "/Imagens/token-assassino.png"
        document.getElementById("icon").alt = "Assassino"
    }
    if (icon_desejado == "mago") {
        document.getElementById("icon").src = "/Imagens/token-mago.png"
        document.getElementById("icon").alt = "Mago"
    }
    if (icon_desejado == "atirador") {
        document.getElementById("icon").src = "/Imagens/token-atirador.png"
        document.getElementById("icon").alt = "Atirador"
    }
    if (icon_desejado == "curandeiro") {
        document.getElementById("icon").src = "/Imagens/Token-curandeiro.png"
        document.getElementById("icon").alt = "Guerreiro"
    }
    if (icon_desejado == "suporte") {
        document.getElementById("icon").src = "/Imagens/token-suporte.png"
        document.getElementById("icon").alt = "Suporte"
    }
}

function atualizar_dados() {

    const dados_cadastro = JSON.parse(localStorage.getItem("dados_usuario") || "{}");
    

    let nome = document.getElementById("nome").value
    let email = document.getElementById("email").value
    let cor = document.getElementById("cor_perfil").value
    let classe = document.querySelector('input[name="classe"]:checked').value

    dados_cadastro["nome"] = nome
    dados_cadastro["email"] = email
    dados_cadastro["icon"] = classe
    dados_cadastro["fundo"] = cor

    window.localStorage.setItem("dados_usuario", JSON.stringify(dados_cadastro))

    alert("Perfil Atualizado!")
}