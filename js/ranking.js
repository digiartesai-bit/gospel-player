/**
 * ranking.js - Gerenciamento e Exibição do Ranking Mundial / Mais Ouvidas
 */

document.addEventListener('DOMContentLoaded', () => {
  // Se as músicas já tiverem sido carregadas, carrega o ranking diretamente
  if (window.musicasGlobais && window.musicasGlobais.length > 0) {
    carregarRanking();
  }
});

// Escuta o evento de carregamento vindo do app.js
document.addEventListener('musicasCarregadas', () => {
  carregarRanking();
});

async function carregarRanking() {
  const secao = document.getElementById("secaoMaisOuvidas");
  const container = document.getElementById("maisOuvidas");

  if (!secao || !container) return;

  try {
    const resposta = await fetch("https://adoraplay-api.digiartesai.workers.dev/");
    if (!resposta.ok) {
      secao.style.display = "none";
      return;
    }

    const ranking = await resposta.json();
    if (!ranking || ranking.length === 0) {
      secao.style.display = "none";
      return;
    }

    const musicas = window.musicasGlobais || [];
    if (musicas.length === 0) return;

    container.innerHTML = "";
    secao.style.display = "block";

    const medalhas = ["🥇", "🥈", "🥉"];

    ranking.forEach((item, posicao) => {
      // Encontra a música pelo ID
      const musica = musicas.find(m => Number(m.id) === Number(item.id));
      if (!musica) return;

      const indice = musicas.findIndex(m => Number(m.id) === Number(item.id));
      const medalha = medalhas[posicao] ? `${medalhas[posicao]} ` : `${posicao + 1}º `;
      const capa = musica.capa_musica || musica.capa || 'assets/icons/album.svg';

      container.innerHTML += `
        <div class="carrossel-item card-ranking" role="button" tabindex="0" onclick="tocarEstaMusica(${indice})">
          <img src="${capa}" onerror="this.src='assets/icons/album.svg'" alt="Capa de ${escaparHTML(musica.titulo)}" class="capa-album">
          <span class="badge-posicao">${medalha}</span>
          <div class="info-ranking">
            <strong class="titulo-album">${escaparHTML(musica.titulo)}</strong>
            <small class="reproducoes-qtd">${item.reproducoes || 0} reproduções</small>
          </div>
        </div>
      `;
    });

  } catch (erro) {
    console.error("Erro ao carregar ranking:", erro);
    secao.style.display = "none";
  }
}

/**
 * Função utilitária local para prevenir XSS
 */
function escaparHTML(texto) {
  if (!texto) return '';
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
