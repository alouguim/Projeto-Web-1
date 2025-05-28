window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../arquivosParaFetch/cabecalho.html");
        const html = await response.text();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);

        // Verifica se está logado
        const logado = localStorage.getItem("logado");
        const dadosUsuario = localStorage.getItem("dados_usuario");

        if (logado === "true" && dadosUsuario) {
            const usuario = JSON.parse(dadosUsuario);
            const nome = usuario.nome || "Usuário";
            const loginSpan = document.getElementById("usuario-logado");

            if (loginSpan) {
                loginSpan.innerHTML = `<a href="../html/perfil.html">${nome}</a>`;
            }
        }

    } catch (erro) {
        console.error("Erro ao carregar o cabeçalho:", erro);
    }
});
