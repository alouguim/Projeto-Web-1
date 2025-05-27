function pegar_dados() {
    let nome = document.getElementById("nome").value
    let email = document.getElementById("email").value
    let senha = document.getElementById("senha").value
    let classe = document.querySelector('input[name="classe"]:checked').value;

    dados = {
        "nome": nome,
        "email": email,
        "senha": senha,
        "icon": classe
    }

    window.localStorage.setItem("dados_usuario", JSON.stringify(dados))
}

function logar(user,senha) {
    const dados_cadastro = window.localStorage.getItem("dados_usuario")

    if (!dados_cadastro) {
        alert("Nenhum usuário cadastrado!");
        location.reload();
        return;
    }

    if ((user == dados_cadastro['nome'] || user == dados_cadastro['email']) && (senha == dados_cadastro['senha']) ) {
        alert("Logado com Sucesso!")

        window.location.href = "index.html";
    } else {
        alert("Usuário ou senha incorretos.");
        location.reload();
    }
}