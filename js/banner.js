// ==========================================
// CONTROLE DO BANNER DINÂMICO (EXIBIR/OCULTAR POR DATA)
// ==========================================

// Guarda a lista de lançamentos encontrados na semana
let lancamentosDaSemana = [];

// Função que roda automaticamente para decidir se mostra ou oculta o banner
function verificarLancamentos() {
    const banner = document.querySelector(".banner");
    if (!banner) return;

    try {
        // Verifica se a lista de músicas global existe
        if (typeof musicas !== "undefined" && musicas.length > 0) {
            const hoje = new Date();
            const seteDiasAtras = new Date();
            seteDiasAtras.setDate(hoje.getDate() - 7);

            // Filtra músicas cadastradas nos últimos 7 dias
            lancamentosDaSemana = musicas.filter(musica => {
                if (!musica.data_cadastro) return false;
                
                // Converte a data do JSON (AAAA-MM-DD) garantindo o fuso horário local
                const partesData = musica.data_cadastro.split("-");
                const dataCadastro = new Date(partesData[0], partesData[1] - 1, partesData[2]);
                
                return dataCadastro >= seteDiasAtras && dataCadastro <= hoje;
            });

            // REGRA: Se tiver lançamentos, mostra o banner. Se não, oculta.
            if (lancamentosDaSemana.length > 0) {
                banner.style.display = "block";
            } else {
                banner.style.display = "none";
            }
        } else {
            banner.style.display = "none";
        }
    } catch (erro) {
        console.warn("Erro ao processar datas de lançamentos:", erro);
        banner.style.display = "none";
    }
}

// 1. Função para Abrir a Tela de Lançamentos
function abrirTelaLancamentos() {
    if (lancamentosDaSemana.length === 0) return;

    // Esconde todas as seções da Home e o Banner
    const banner = document.querySelector(".banner");
    if (banner) banner.style.display = "none";
    
    document.querySelectorAll(".secao").forEach(secao => secao.style.display = "none");
    
    // Mostra a tela de Lançamentos
    const tela = document.getElementById("telaLancamentos");
    if (tela) {
        tela.style.display = "block";
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Pega o lançamento mais recente da lista de novidades
    const maisRecente = lancamentosDaSemana[lancamentosDaSemana.length - 1];
    
    // Preenche as informações na tela
    document.getElementById("lancamentoTitulo").textContent = maisRecente.titulo;
    document.getElementById("lancamentoArtista").textContent = maisRecente.artista || "AdoraPlay";
    
    const imgCapa = document.getElementById("lancamentoCapa");
    if (imgCapa) {
        imgCapa.src = maisRecente.capa_musica || maisRecente.capa || "assets/icons/album.svg";
    }
    
    // Configura a ação do botão de tocar
    const btnOuvir = document.getElementById("btnOuvirLancamento");
    if (btnOuvir) {
        btnOuvir.onclick = () => tocarEstaMusica(maisRecente);
    }
}

// 2. Função para Voltar para a Home
function voltarParaHome() {
    const tela = document.getElementById("telaLancamentos");
    if (tela) tela.style.display = "none";
    
    // Verifica novamente se o banner deve voltar a aparecer
    verificarLancamentos();
    
    // Restaura as seções originais
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

// 3. Função para dar play na música do lançamento
function tocarEstaMusica(musica) {
    if (!musica) return;

    let indiceReal = 0;
    if (typeof musicas !== "undefined") {
        indiceReal = musicas.findIndex(m => m.id === musica.id);
        if (indiceReal === -1) indiceReal = 0;
    }

    if (typeof carregarPlaylist === "function") {
        carregarPlaylist(musicas);
    } else if (typeof playlist !== "undefined") {
        playlist = [...musicas];
    }

    if (typeof tocar === "function") {
        tocar(indiceReal);
    }
}

// Inicializa a checagem assim que o script carregar
// Usamos um pequeno tempo de espera (timeout) para garantir que o array 'musicas' já foi carregado pelo seu app.js
setTimeout(verificarLancamentos, 100);
