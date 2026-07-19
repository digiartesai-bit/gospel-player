/**
 * recursos.js - Funções Utilitárias: Arrasto de Carrosséis, Compartilhamento e Favoritos
 */

document.addEventListener('DOMContentLoaded', () => {
  initArrastoCarrossel();
  initBotaoCompartilhar();
  renderizarFavoritosHorizontais();
});

// Atualiza a secao de favoritos sempre que as musicas forem carregadas
document.addEventListener('musicasCarregadas', () => {
  renderizarFavoritosHorizontais();
});

/**
 * RECURSO 1: Clique e arraste para carrosséis no Desktop
 */
function initArrastoCarrossel() {
  const carrosseis = document.querySelectorAll('#albuns, #continueOuvindo, #favoritosHorizontal, #maisOuvidas');

  carrosseis.forEach((slider) => {
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let foiArrasto = false;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      foiArrasto = false;
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;

      // Se moveu mais de 5px, considera como arrasto e anula o clique
      if (Math.abs(walk) > 5) {
        foiArrasto = true;
      }
      slider.scrollLeft = scrollLeft - walk;
    });

    // Evita acionar o play se o usuario estava apenas arrastando
    slider.addEventListener('click', (e) => {
      if (foiArrasto) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
}

/**
 * RECURSO 2: Compartilhamento via Web Share API ou WhatsApp
 */
function initBotaoCompartilhar() {
  const btnCompartilhar = document.getElementById('btnCompartilhar');
  if (btnCompartilhar) {
    btnCompartilhar.addEventListener('click', compartilharMusicaAtual);
  }
}

function compartilharMusicaAtual() {
  const elTitulo = document.getElementById('miniTitulo');
  const elArtista = document.getElementById('miniArtista');

  const titulo = elTitulo ? elTitulo.textContent : '';
  const artista = elArtista ? elArtista.textContent : 'AdoraPlay';

  if (!titulo || titulo === 'Nenhuma música') return;

  const baseUrl = 'https://digiartesai-bit.github.io/adora-play/';
  const urlAppComMusica = `${baseUrl}?musica=${encodeURIComponent(titulo)}`;
  const textoMensagem = `Ouça "${titulo}" de ${artista} no AdoraPlay! 🎶`;

  const abrirWhatsAppFallback = () => {
    const textoCompleto = encodeURIComponent(`${textoMensagem}\n\n${urlAppComMusica}`);
    const urlWhatsapp = `https://api.whatsapp.com/send?text=${textoCompleto}`;
    window.open(urlWhatsapp, '_blank');
  };

  if (navigator.share) {
    navigator.share({
      title: 'AdoraPlay',
      text: textoMensagem,
      url: urlAppComMusica
    }).catch(() => {
      abrirWhatsAppFallback();
    });
  } else {
    abrirWhatsAppFallback();
  }
}

/**
 * RECURSO 3: Exibir e atualizar o carrossel de Favoritos
 */
window.renderizarFavoritosHorizontais = function () {
  const secaoFavoritos = document.getElementById('secaoFavoritos');
  const favoritosHorizontal = document.getElementById('favoritosHorizontal');

  if (!secaoFavoritos || !favoritosHorizontal) return;

  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  if (favoritos.length === 0) {
    secaoFavoritos.style.display = 'none';
    return;
  }

  favoritosHorizontal.innerHTML = '';
  const listaDeMusicas = window.musicasGlobais || [];

  favoritos.forEach((musica) => {
    let indexReal = listaDeMusicas.findIndex(
      (m) => m.audio === musica.audio || m.titulo === musica.titulo
    );
    if (indexReal === -1) indexReal = 0;

    const capaMusica = musica.capa_musica || musica.capa || 'assets/icons/album.svg';

    favoritosHorizontal.innerHTML += `
      <div class="carrossel-item card-favorito" role="button" tabindex="0" onclick="tocarEstaMusica(${indexReal})">
        <img src="${capaMusica}" onerror="this.src='assets/icons/album.svg'" alt="Capa" class="capa-album">
        <strong class="titulo-album">${escaparTexto(musica.titulo || 'Sem título')}</strong>
      </div>
    `;
  });

  secaoFavoritos.style.display = 'block';
};

function escaparTexto(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
