/**
 * app.js - Módulo principal do AdoraPlay
 * Responsável pelo carregamento de dados (musicas.json) e renderização das seções.
 */

window.musicasGlobais = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarMusicas();
});

/**
 * Busca o arquivo JSON com a lista de músicas
 */
async function carregarMusicas() {
  const listaContainer = document.getElementById('listaMusicas');
  if (listaContainer) {
    listaContainer.innerHTML = '<p class="carregando">Carregando louvores...</p>';
  }

  try {
    const resposta = await fetch('musicas.json');
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar dados: ${resposta.status}`);
    }

    const dados = await resposta.json();
    window.musicasGlobais = Array.isArray(dados) ? dados : (dados.musicas || []);

    if (window.musicasGlobais.length === 0) {
      if (listaContainer) {
        listaContainer.innerHTML = '<p class="vazio">Nenhuma música encontrada.</p>';
      }
      return;
    }

    // Renderiza as seções da interface
    renderizarAlbuns(window.musicasGlobais);
    renderizarListaMusicas(window.musicasGlobais);

    // Notifica outros módulos que as músicas foram carregadas
    document.dispatchEvent(new CustomEvent('musicasCarregadas', { detail: window.musicasGlobais }));

  } catch (erro) {
    console.error('Erro no carregamento do app.js:', erro);
    if (listaContainer) {
      listaContainer.innerHTML = '<p class="erro">Não foi possível carregar as músicas. Tente novamente mais tarde.</p>';
    }
  }
}

/**
 * Renderiza o carrossel de Álbuns
 */
function renderizarAlbuns(musicas) {
  const albunsContainer = document.getElementById('albuns');
  if (!albunsContainer) return;

  // Extrai álbuns únicos
  const albunsMapeados = [];
  const albunsVistos = new Set();

  musicas.forEach((m) => {
    const nomeAlbum = m.album || 'Avulso';
    if (!albunsVistos.has(nomeAlbum)) {
      albunsVistos.add(nomeAlbum);
      albunsMapeados.push({
        nome: nomeAlbum,
        capa: m.capa || 'assets/icons/album.svg',
        artista: m.artista || 'Vários Artistas'
      });
    }
  });

  albunsContainer.innerHTML = albunsMapeados.map((album) => `
    <div class="card-album" role="button" tabindex="0" onclick="filtrarPorAlbum('${escaparAspas(album.nome)}')">
      <img src="${album.capa}" alt="Capa do álbum ${escaparAspas(album.nome)}" onerror="this.src='assets/icons/album.svg'" class="capa-album">
      <strong class="titulo-album">${album.nome}</strong>
      <small class="artista-album">${album.artista}</small>
    </div>
  `).join('');
}

/**
 * Renderiza a lista principal de músicas adicionadas recentemente
 */
function renderizarListaMusicas(musicas) {
  const listaContainer = document.getElementById('listaMusicas');
  if (!listaContainer) return;

  listaContainer.innerHTML = musicas.map((musica, index) => {
    const capa = musica.capa || 'assets/icons/album.svg';
    const titulo = musica.titulo || 'Música sem título';
    const artista = musica.artista || 'Artista desconhecido';

    return `
      <div class="musica-item" data-id="${musica.id || index}" role="button" tabindex="0" onclick="tocarEstaMusica(${index})">
        <div class="musica-info-col">
          <img src="${capa}" alt="Capa de ${escaparAspas(titulo)}" onerror="this.src='assets/icons/album.svg'" class="musica-capa-thumb">
          <div class="musica-textos">
            <strong class="musica-titulo">${titulo}</strong>
            <small class="musica-artista">${artista}</small>
          </div>
        </div>
        <button class="btn-play-item" aria-label="Tocar ${escaparAspas(titulo)}">
          <img src="assets/icons/play.svg" alt="" aria-hidden="true">
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Filtra a exibição para apenas um álbum específico
 */
function filtrarPorAlbum(nomeAlbum) {
  const musicasFiltradas = window.musicasGlobais.filter(m => (m.album || 'Avulso') === nomeAlbum);
  const tituloSecao = document.getElementById('tituloListaMusicas');
  
  if (tituloSecao) {
    tituloSecao.textContent = `Álbum: ${nomeAlbum}`;
  }

  renderizarListaMusicas(musicasFiltradas);
}

/**
 * Atualiza o destaque visual da faixa que está tocando no momento
 */
function marcarMusicaTocando(idOuIndex) {
  const itens = document.querySelectorAll('.musica-item');
  itens.forEach((item, index) => {
    const idItem = item.getAttribute('data-id');
    if (idItem == idOuIndex || index == idOuIndex) {
      item.classList.add('tocando');
    } else {
      item.classList.remove('tocando');
    }
  });
}

/**
 * Função utilitária para escapar aspas em strings inseridas no HTML inline
 */
function escaparAspas(texto) {
  if (!texto) return '';
  return texto.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
