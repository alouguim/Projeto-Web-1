function pegar_dados() {
    nome = document.getElementById("nome").value
    email = document.getElementById("email").value
    senha = document.getElementById("senha").value
    classe = document.getElementsByTagName("radio")
    icon = classe[0]

    dados = {
        "nome": nome,
        "email": email,
        "senha": senha,
        "icon": icon
    }

    window.localStorage.setItem("dados_usuario", JSON.stringify(dados))
    console.log("peguei!")
}