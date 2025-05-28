function pegar_dados() {
    let nome = document.getElementById("nome").value
    let email = document.getElementById("email").value
    let senha = document.getElementById("senha").value
    let classe = document.querySelector('input[name="classe"]:checked').value

    dados = {
        "nome": nome,
        "email": email,
        "senha": senha,
        "icon": classe,
        "fundo" : null
    }

    window.localStorage.setItem("dados_usuario", JSON.stringify(dados))
}

function logar() {
    const dados_cadastro = window.localStorage.getItem("dados_usuario")
    const dados_cadastro_atual = JSON.parse(dados_cadastro)

    const dados = document.getElementById("dados_login")
    const dados_login = new FormData(dados)

    const user = dados_login.get("nome")
    const senha = dados_login.get("senha")

    if (!dados_cadastro) {
        alert("Nenhum usuário cadastrado!")
        location.reload()
        return;
    }

    if ((user == dados_cadastro_atual['nome'] || user == dados_cadastro_atual['email']) && (senha == dados_cadastro_atual['senha']) ) {
        alert("Logado com Sucesso!")

        window.location.href= "/html/index.html"
    } else {
        alert("Usuário ou senha incorretos.")
        location.reload()
    }
}