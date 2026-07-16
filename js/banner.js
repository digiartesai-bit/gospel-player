// ==========================================
// CONTROLE DO BANNER E NAVEGAÇÃO DE LANÇAMENTOS
// ==========================================

// Função que verifica a cada meio segundo se as músicas carregaram
const intervaloVerificacao = setInterval(() => {
    if (typeof musicas !== "undefined" && musicas.length > 0) {
        clearInterval(intervaloVerificacao);
        iniciarBanner();
        configurarBotaoHomeFisico(); // Garante o clique na casinha inferior
    }
}, 500);

function iniciarBanner() {
    const banner = document.querySelector(".banner");
    if (!banner) return;

    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    // Filtra todas as músicas da semana
    const lancamentosDaSemana = musicas.filter(musica => {
        if (!musica.data_cadastro) return false;
        const [ano, mes, dia] = musica.data_cadastro.split("-");
        const dataCadastro = new Date(ano, mes - 1, dia);
        return dataCadastro >= seteDiasAtras && dataCadastro <= hoje;
    });

    if (lancamentosDaSemana.length > 0) {
        banner.style.display = "block";
        window.lancamentosAtuais = lancamentosDaSemana; 
    } else {
        banner.style.display = "none";
    }
}

// 1. ABRIR TELA DE LANÇAMENTOS (Exibe a lista inteira se houver mais de um)
function abrirTelaLancamentos() {
    const lista = window.lancamentosAtuais || [];
    if (lista.length === 0) return;

    // Oculta elementos da Home
    const banner = document.querySelector(".banner");
    if (banner) banner.style.display = "none";
    document.querySelectorAll(".secao").forEach(s => s.style.display = "none");
    
    const tela = document.getElementById("telaLancamentos");
    if (!tela) return;
    tela.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // --- RENDERIZAR OS LANÇAMENTOS DINAMICAMENTE ---
    // Se houver apenas 1 lançamento, mantém o layout centralizado bonito do print
    if (lista.length === 1) {
        const musica = lista[0];
        tela.querySelector(".container-lancamentos-dinamico")?.remove(); // Limpa se houver anterior
        
        document.getElementById("lancamentoCapa").style.display = "block";
        document.getElementById("lancamentoCapa").src = musica.capa_musica || musica.capa;
        document.getElementById("lancamentoTitulo").style.display = "block";
        document.getElementById("lancamentoTitulo").textContent = musica.titulo;
        document.getElementById("lancamentoArtista").style.display = "block";
        document.getElementById("lancamentoArtista").textContent = musica.artista;
        
        const btnPlay = document.getElementById("btnOuvirLancamento");
        btnPlay.style.display = "inline-flex";
        btnPlay.onclick = () => tocarEstaMusica(musica);
    } 
    // Se houver mais de 1 lançamento na semana, constrói uma lista limpa e bonita para escolher!
    else {
        // Oculta os placeholders padrão de uma única música
        document.getElementById("lancamentoCapa").style.display = "none";
        document.getElementById("lancamentoTitulo").style.display = "none";
        document.getElementById("lancamentoArtista").style.display = "none";
        document.getElementById("btnOuvirLancamento").style.display = "none";

        // Remove lista antiga se existir para não duplicar
        tela.querySelector(".container-lancamentos-dinamico")?.remove();

        // Cria o container da lista de novidades da semana
        const container = document.createElement("div");
        container.className = "container-lancamentos-dinamico";
        container.style.cssText = "display: flex; flex-direction: column; gap: 15px; margin-top: 20px; text-align: left;";

        lista.reverse().forEach(musica => {
            const itemHtml = `
                <div onclick="tocarEstaMusica(${JSON.stringify(musica).replace(/"/g, '&quot;')})" style="display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 16px; cursor: pointer; transition: 0.2s;">
                    <img src="${musica.capa_musica || musica.capa}" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: #fff; font-size: 16px;">${musica.titulo}</h4>
                        <p style="margin: 3px 0 0; color: #94a3b8; font-size: 13px;">${musica.artista}</p>
                    </div>
                    <button style="background: #D4AF37; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <img src="assets/icons/play.svg" width="12" height="12" style="filter: brightness(0); margin-left: 2px;">
                    </button>
                </div>
            `;
            container.innerHTML += itemHtml;
        });

        // Adiciona a lista dentro do card da tela de lançamentos
        tela.querySelector("div[style*='text-align: center']").appendChild(container);
    }
}

// 2. VOLTAR PARA A HOME (RESTAURA TODAS AS SEÇÕES)
function voltarParaHome() {
    const tela = document.getElementById("telaLancamentos");
    if (tela) tela.style.display = "none";
    
    // Restaura o banner principal caso ainda esteja no período de exibição
    iniciarBanner();
    
    // Exibe as seções padrão
    if (typeof carregarTela === "function") {
        carregarTela();
    } else {
        document.querySelectorAll(".secao").forEach(secao => {
            if (secao.id !== "secaoMaisOuvidas" && secao.id !== "secaoFavoritos" && secao.id !== "secaoContinue") {
                secao.style.display = "block";
            }
        });
    }
}

// 3. CAPTURA O CLIQUE NA "CASINHA" DA BARRA INFERIOR PARA LIMPAR A TELA DE LANÇAMENTOS
function configurarBotaoHomeFisico() {
    // Procura o botão de início na barra de navegação (geralmente tem id="btnInicio", onclick="irParaHome" ou texto "Início")
    // Encontra o elemento que tem o ícone de início/home ou texto "Início"
    const botoesMenu = document.querySelectorAll("footer a, .nav-bar button, div[onclick*='Tela'], div[onclick*='home'], #btnInicio");
    
    botoesMenu.forEach(botao => {
        if (botao.textContent.includes("Início") || botao.innerHTML.includes("home") || botao.getAttribute("onclick")?.includes("Home")) {
            const acaoOriginal = botao.onclick;
            
            botao.onclick = function(e) {
                // Fecha a tela de lançamentos primeiro
                const tela = document.getElementById("telaLancamentos");
                if (tela) tela.style.display = "none";
                
                // Executa a ação padrão do seu aplicativo que reconstrói a Home
                if (acaoOriginal) {
                    acaoOriginal.apply(this, arguments);
                } else if (typeof carregarTela === "function") {
                    carregarTela();
                } else {
                    voltarParaHome();
                }
            };
        }
    });
}

function tocarEstaMusica(musica) {
    if (!musica) return;
    if (typeof carregarPlaylist === "function") carregarPlaylist(musicas);
    const idx = musicas.findIndex(m => m.id === musica.id);
    if (typeof tocar === "function") tocar(idx >= 0 ? idx : 0);
}
