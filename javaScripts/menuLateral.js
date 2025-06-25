
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../arquivosParaFetch/menuLateral.html");
        const html = await response.text();

        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        document.body.insertBefore(wrapper, document.body.firstChild);

        // Verifica se está logado
        const logado = localStorage.getItem("logado");
        const dadosUsuario = localStorage.getItem("dados_usuario");

        if (logado === "true" && dadosUsuario) {
            const usuario = JSON.parse(dadosUsuario);
            const nome = usuario.nome || "Usuário";

            const linkUsuario = document.getElementById("usuario-logado-menu");
            if (linkUsuario) {
                linkUsuario.innerText = nome;
                linkUsuario.href = "../html/perfil.html"; // ou qualquer página de perfil
            }
        }

        // Espera o HTML ser totalmente injetado antes de pegar os elementos
        const menuBtn = document.getElementById("menu-btn");
        const offcanvasElement = document.getElementById("menuLateral");

        if (menuBtn && offcanvasElement) {
            offcanvasElement.addEventListener("show.bs.offcanvas", () => {
                menuBtn.style.display = "none";
            });

            offcanvasElement.addEventListener("hidden.bs.offcanvas", () => {
                menuBtn.style.display = "block";
            });
        }

    } catch (erro) {
        console.error("Erro ao carregar o menu lateral:", erro);
    }
});