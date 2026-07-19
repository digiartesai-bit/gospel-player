/**
 * pesquisa.js - Gerenciamento da Busca Instantânea e Flutuante
 */

document.addEventListener('DOMContentLoaded', () => {
  initPesquisa();
});

function initPesquisa() {
  const searchInput = document.getElementById('search-input');
  const resultadosContainer = document.getElementById('resultados-busca-flutuante');

  if (!searchInput || !resultadosContainer) return;

  let debounceTimer = null;

  // Evento ao digitar no campo de busca
  searchInput.addEventListener('input', (e) => {
    const termo = e.target.value.trim();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      executarBusca(termo, resultadosContainer);
    }, 250);
  });

  // Fechar resultados ao clicar fora do container de busca
  document.addEventListener('click', (e) => {
    const searchWrapper = searchInput.closest('.search-wrapper');
    if (searchWrapper && !searchWrapper.contains(e.target)) {
      resultadosContainer.style.display = 'none';
    }
  });

  // Fechar ao pressionar a tecla ESC
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultadosContainer.style.display = 'none';
      searchInput.blur();
    }
  });

  // Reabrir resultados ao focar no input se houver texto
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
      resultadosContainer.style.display = 'block';
    }
  });
}

/**
 * Normaliza e filtra a lista de músicas
 */
function executarBusca(termo, container) {
  if (!termo || termo.length < 1) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  const musicas = window.musicasGlobais || [];
  const termoNormalizado = removerAcentos(termo.toLowerCase());

  const resultados = musicas.filter((musica) => {
    const titulo = removerAcentos((musica.titulo || '').toLowerCase());
    const artista = removerAcentos((musica.artista || '').toLowerCase());
    const album = removerAcentos((musica.album || '').toLowerCase());

    return titulo.includes(termoNormalizado) ||
           artista.includes(termoNormalizado) ||
           album.includes(termoNormalizado);
  });

  renderizarResultadosBusca(resultados, container);
}

/**
 * Renderiza as sugestões encontradas na caixa flutuante
 */
function renderizarResultadosBusca(resultados, container) {
  if (resultados.length === 0) {
    container.innerHTML = '<div class="sugestao-item sem-resultado"><small>Nenhuma música encontrada</small></div>';
    container.style.display = 'block';
    return;
  }

  // Limita a exibição às 6 primeiras correspondências
  const ultimosResultados = resultados.slice(0, 6);

  container.innerHTML = ultimosResultados.map((musica) => {
    const capa = musica.capa || 'assets/icons/album.svg';
    const idOuIndex = musica.id !== undefined ? musica.id : window.musicasGlobais.indexOf(musica);

    return `
      <div class="sugestao-item" role="button" tabindex="0" onclick="selecionarDaBusca(${idOuIndex})">
        <img src="${capa}" alt="Capa" onerror="this.src='assets/icons/album.svg'" class="sugestao-capa">
        <div class="sugestao-info">
          <strong>${escaparHTML(musica.titulo || 'Sem título')}</strong>
          <small>${escaparHTML(musica.artista || 'Artista desconhecido')}</small>
        </div>
      </div>
    `;
  }).join('');

  container.style.display = 'block';
}

/**
 * Toca a música selecionada na busca e oculta o dropdown
 */
function selecionarDaBusca(indexOuId) {
  const container = document.getElementById('resultados-busca-flutuante');
  if (container) container.style.display = 'none';

  if (typeof window.tocarEstaMusica === 'function') {
    window.tocarEstaMusica(indexOuId);
  } else if (typeof window.tocarMusicaPorIndex === 'function') {
    window.tocarMusicaPorIndex(indexOuId);
  }
}

/**
 * Remove acentos de uma string para busca insensível a diacríticos
 */
function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Utilitário de sanitização de strings
 */
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
