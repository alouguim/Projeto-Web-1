window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../arquivosParaFetch/cabecalho.html");
        const html = await response.text();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);
    } catch (erro) {
        console.error("Erro ao carregar o cabeçalho:", erro);
    }
});

