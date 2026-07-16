// ==========================================
// CONTROLE DO BANNER - MONITORAMENTO AUTOMÁTICO
// ==========================================

// Função que verifica a cada meio segundo se as músicas já carregaram
const intervaloVerificacao = setInterval(() => {
    if (typeof musicas !== "undefined" && musicas.length > 0) {
        clearInterval(intervaloVerificacao); // Para de verificar pois já carregou
        iniciarBanner();
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
        // Armazena para ser usado na tela de lançamentos
        window.lancamentosAtuais = lancamentosDaSemana; 
    } else {
        banner.style.display = "none";
    }
}

// Quando clicar em "Ver Lançamentos", usamos a lista completa filtrada
function abrirTelaLancamentos() {
    const lista = window.lancamentosAtuais || [];
    if (lista.length === 0) return;

    // Pega o mais recente para o destaque principal
    const maisRecente = lista[lista.length - 1];

    document.querySelector(".banner").style.display = "none";
    document.querySelectorAll(".secao").forEach(s => s.style.display = "none");
    
    const tela = document.getElementById("telaLancamentos");
    tela.style.display = "block";
    
    document.getElementById("lancamentoTitulo").textContent = maisRecente.titulo;
    document.getElementById("lancamentoArtista").textContent = maisRecente.artista;
    document.getElementById("lancamentoCapa").src = maisRecente.capa_musica;
    
    document.getElementById("btnOuvirLancamento").onclick = () => tocarEstaMusica(maisRecente);
}

function voltarParaHome() {
    document.getElementById("telaLancamentos").style.display = "none";
    document.querySelector(".banner").style.display = "block";
    
    document.querySelectorAll(".secao").forEach(s => s.style.display = "block");
}

function tocarEstaMusica(musica) {
    if (typeof carregarPlaylist === "function") carregarPlaylist(musicas);
    const idx = musicas.findIndex(m => m.id === musica.id);
    if (typeof tocar === "function") tocar(idx >= 0 ? idx : 0);
}
