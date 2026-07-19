// Arquivo isolado para gerenciar a dica explicativa do Ranking do AdoraPlay
(function () {
    const textoAjuda = "Este ranking exibe as músicas mais tocadas pelos usuários. Para uma reprodução ser contabilizada aqui, a faixa precisa ser ouvida por pelo menos 90% da sua duração total.";

    function inicializarAjudaRanking() {
        const secaoMaisOuvidas = document.getElementById("secaoMaisOuvidas");
        if (!secaoMaisOuvidas) return;

        const tituloRanking = secaoMaisOuvidas.querySelector("h3");
        if (!tituloRanking) return;

        // Estiliza o título h3 para alinhar o texto e o botão (?)
        tituloRanking.style.display = "inline-flex";
        tituloRanking.style.alignItems = "center";
        tituloRanking.style.gap = "8px";
        tituloRanking.style.position = "relative";

        // 1. Cria o botão (?)
        const btnAjuda = document.createElement("span");
        btnAjuda.id = "btnAjudaRanking";
        btnAjuda.textContent = "?";
        btnAjuda.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            font-size: 11px;
            font-weight: bold;
            color: #d4af37;
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 50%;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
        `;

        // 2. Cria o Popover onde a mensagem vai ficar
        const popover = document.createElement("div");
        popover.id = "popoverAjudaRanking";
        popover.textContent = textoAjuda;
        popover.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            width: 260px;
            padding: 12px;
            background: rgba(13, 35, 58, 0.95);
            color: #e2e8f0;
            font-size: 0.75rem;
            font-weight: normal;
            line-height: 1.4;
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            backdrop-filter: blur(8px);
            z-index: 100;
        `;

        // 3. Adiciona o botão e o popover ao título
        tituloRanking.appendChild(btnAjuda);
        tituloRanking.appendChild(popover);

        // 4. Evento de clique para abrir/fechar a mensagem
        btnAjuda.addEventListener("click", (e) => {
            e.stopPropagation();
            const estaVisivel = popover.style.display === "block";
            popover.style.display = estaVisivel ? "none" : "block";
        });

        // Fechar a mensagem ao clicar em qualquer outro lugar da tela
        document.addEventListener("click", (e) => {
            if (!popover.contains(e.target) && e.target !== btnAjuda) {
                popover.style.display = "none";
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializarAjudaRanking);
    } else {
        inicializarAjudaRanking();
    }
})();
