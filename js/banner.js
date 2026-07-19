/**
 * banner.js - Gerenciamento do Banner de Destaque e Tela de Lançamentos
 */

document.addEventListener('DOMContentLoaded', () => {
  initBanner();
});

// Atualiza as informações assim que as músicas forem carregadas do JSON
document.addEventListener('musicasCarregadas', (event) => {
  const musicas = event.detail;
  atualizarDadosLancamento(musicas);
});

let lancamentoAtual = null;

function initBanner() {
  const btnVerLancamentos = document.getElementById('btnVerLancamentos');
  const btnVoltarHome = document.getElementById('btnVoltarHome');
  const btnOuvirLancamento = document.getElementById('btnOuvirLancamento');

  const bannerDestaque = document.getElementById('bannerDestaque');
  const telaLancamentos = document.getElementById('telaLancamentos');

  // Abre a tela de lançamentos
  if (btnVerLancamentos) {
    btnVerLancamentos.addEventListener('click', () => {
      if (bannerDestaque) bannerDestaque.style.display = 'none';
      if (telaLancamentos) telaLancamentos.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Volta para a tela principal
  if (btnVoltarHome) {
    btnVoltarHome.addEventListener('click', () => {
      if (telaLancamentos) telaLancamentos.style.display = 'none';
      if (bannerDestaque) bannerDestaque.style.display = 'block';
    });
  }

  // Toca o lançamento ao clicar em "Ouvir Agora"
  if (btnOuvirLancamento) {
    btnOuvirLancamento.addEventListener('click', (e) => {
      e.stopPropagation();
      if (lancamentoAtual && typeof window.tocarMusicaPorObjeto === 'function') {
        window.tocarMusicaPorObjeto(lancamentoAtual);
      } else if (typeof window.tocarLancamento === 'function') {
        window.tocarLancamento();
      }
    });
  }
}

/**
 * Preenche a tela de lançamentos com a última música marcada como novidade ou a primeira da lista
 */
function atualizarDadosLancamento(musicas) {
  if (!musicas || musicas.length === 0) return;

  // Busca uma música com a flag 'lancamento: true' ou pega a primeira da lista
  lancamentoAtual = musicas.find((m) => m.lancamento === true) || musicas[0];

  const capa = document.getElementById('lancamentoCapa');
  const titulo = document.getElementById('lancamentoTitulo');
  const artista = document.getElementById('lancamentoArtista');
  const bannerDestaque = document.getElementById('bannerDestaque');

  if (capa) capa.src = lancamentoAtual.capa || 'assets/icons/album.svg';
  if (titulo) titulo.textContent = lancamentoAtual.titulo || 'Novo Lançamento';
  if (artista) artista.textContent = lancamentoAtual.artista || 'Artista AdoraPlay';

  // Exibe o banner na home
  if (bannerDestaque) {
    bannerDestaque.style.display = 'block';
  }
}
