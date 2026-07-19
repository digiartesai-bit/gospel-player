/**
 * player.js - Controlador do Tocador de Áudio e Interface do Mini Player
 */

// Estado Global do Player
let playlist = [];
let musicaAtualIndex = 0;
let tocando = false;
let modoShuffle = false;
let modoRepeat = false;
let streamRegistrado = false;

// Elementos de Áudio e UI
let audioPlayer = null;
let miniPlayer = null;
let progressBar = null;

document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
});

function initPlayer() {
  audioPlayer = document.getElementById('audioPlayer');
  miniPlayer = document.getElementById('miniPlayer');
  progressBar = document.getElementById('progressBar');

  if (!audioPlayer) return;

  // Escutadores da Barra de Controle Inferior
  const btnPlay = document.getElementById('btnPlay');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProxima = document.getElementById('btnProxima');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnRepeat = document.getElementById('btnRepeat');
  const btnFavoritar = document.getElementById('btnFavoritar');

  if (btnPlay) btnPlay.addEventListener('click', alternarPlayPause);
  if (btnAnterior) btnAnterior.addEventListener('click', faixaAnterior);
  if (btnProxima) btnProxima.addEventListener('click', proximaFaixa);
  if (btnShuffle) btnShuffle.addEventListener('click', alternarShuffle);
  if (btnRepeat) btnRepeat.addEventListener('click', alternarRepeat);
  if (btnFavoritar) btnFavoritar.addEventListener('click', toggleFavorito);

  // Eventos de Progresso e Fim do Áudio
  audioPlayer.addEventListener('timeupdate', atualizarBarraProgresso);
  audioPlayer.addEventListener('ended', aoFinalizarFaixa);

  if (progressBar) {
    progressBar.addEventListener('input', () => {
      if (audioPlayer.duration) {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
      }
    });
  }
}

/**
 * Carrega e define a playlist ativa
 */
function carregarPlaylist(lista) {
  if (Array.isArray(lista) && lista.length > 0) {
    playlist = [...lista];
    window.playlist = playlist;
  }
}

/**
 * Toca uma faixa dado o seu índice na playlist
 */
function tocarPorIndice(index) {
  if (!playlist || playlist.length === 0) {
    if (window.musicasGlobais && window.musicasGlobais.length > 0) {
      carregarPlaylist(window.musicasGlobais);
    } else {
      return;
    }
  }

  if (index < 0 || index >= playlist.length) return;

  musicaAtualIndex = index;
  const musica = playlist[index];
  streamRegistrado = false;

  audioPlayer.src = musica.audio;
  if (miniPlayer) miniPlayer.style.display = 'flex';

  salvarNoHistorico(musica);
  atualizarInterfaceMiniPlayer();

  audioPlayer.play()
    .then(() => {
      tocando = true;
      atualizarEstadoBotaoPlay();
      if (typeof window.marcarMusicaTocando === 'function') {
        window.marcarMusicaTocando(musica.id || index);
      }
    })
    .catch((err) => {
      console.warn('Reprodução bloqueada pelo navegador ou falha no áudio:', err);
      tocando = false;
      atualizarEstadoBotaoPlay();
    });
}

/**
 * Alterna entre Tocar (Play) e Pausar (Pause)
 */
function alternarPlayPause() {
  if (!audioPlayer.src || audioPlayer.src === '' || audioPlayer.src === window.location.href) {
    if (window.musicasGlobais && window.musicasGlobais.length > 0) {
      carregarPlaylist(window.musicasGlobais);
      tocarPorIndice(0);
    }
    return;
  }

  if (tocando) {
    audioPlayer.pause();
    tocando = false;
  } else {
    audioPlayer.play()
      .then(() => { tocando = true; })
      .catch((err) => console.error('Erro ao dar play:', err));
  }
  atualizarEstadoBotaoPlay();
}

/**
 * Avança para a próxima música respeitando os modos de reprodução
 */
function proximaFaixa() {
  if (playlist.length === 0) return;

  if (modoShuffle && playlist.length > 1) {
    let novoIndex;
    do {
      novoIndex = Math.floor(Math.random() * playlist.length);
    } while (novoIndex === musicaAtualIndex);
    musicaAtualIndex = novoIndex;
  } else {
    musicaAtualIndex = (musicaAtualIndex + 1) % playlist.length;
  }

  tocarPorIndice(musicaAtualIndex);
}

/**
 * Retorna para a faixa anterior
 */
function faixaAnterior() {
  if (playlist.length === 0) return;

  if (modoShuffle && playlist.length > 1) {
    let novoIndex;
    do {
      novoIndex = Math.floor(Math.random() * playlist.length);
    } while (novoIndex === musicaAtualIndex);
    musicaAtualIndex = novoIndex;
  } else {
    musicaAtualIndex = (musicaAtualIndex - 1 + playlist.length) % playlist.length;
  }

  tocarPorIndice(musicaAtualIndex);
}

function alternarShuffle() {
  modoShuffle = !modoShuffle;
  if (modoShuffle) modoRepeat = false;
  atualizarIndicadoresModo();
}

function alternarRepeat() {
  modoRepeat = !modoRepeat;
  if (modoRepeat) modoShuffle = false;
  atualizarIndicadoresModo();
}

/**
 * Ações executadas ao final da faixa
 */
function aoFinalizarFaixa() {
  if (modoRepeat) {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(console.error);
  } else {
    proximaFaixa();
  }
}

/**
 * Atualiza o mini player com os dados da faixa atual
 */
function atualizarInterfaceMiniPlayer() {
  if (!playlist || !playlist[musicaAtualIndex]) return;

  const musica = playlist[musicaAtualIndex];
  const miniTitulo = document.getElementById('miniTitulo');
  const miniArtista = document.getElementById('miniArtista');
  const miniCapa = document.getElementById('miniCapa');

  if (miniTitulo) miniTitulo.textContent = musica.titulo || 'Música sem título';
  if (miniArtista) miniArtista.textContent = musica.artista || 'Artista AdoraPlay';
  if (miniCapa) {
    miniCapa.src = musica.capa || musica.capa_musica || 'assets/icons/album.svg';
    miniCapa.onerror = () => { miniCapa.src = 'assets/icons/album.svg'; };
  }

  atualizarEstadoBotaoPlay();
  atualizarIndicadoresModo();
  atualizarBotaoFavorito();
}

function atualizarEstadoBotaoPlay() {
  const btnPlay = document.getElementById('btnPlay');
  if (!btnPlay) return;

  const img = btnPlay.querySelector('img');
  if (img) {
    img.src = tocando ? 'assets/icons/pause.svg' : 'assets/icons/play.svg';
  }
}

function atualizarIndicadoresModo() {
  const btnShuffle = document.getElementById('btnShuffle');
  const btnRepeat = document.getElementById('btnRepeat');

  if (btnShuffle) {
    if (modoShuffle) btnShuffle.classList.add('ativo');
    else btnShuffle.classList.remove('ativo');
  }

  if (btnRepeat) {
    if (modoRepeat) btnRepeat.classList.add('ativo');
    else btnRepeat.classList.remove('ativo');
  }
}

/**
 * Atualiza tempo corrido e registra reprodução (>90% ouvida)
 */
function atualizarBarraProgresso() {
  if (!audioPlayer) return;

  const atual = audioPlayer.currentTime;
  const duracao = audioPlayer.duration;

  if (progressBar) {
    progressBar.value = duracao ? (atual / duracao) * 100 : 0;
  }

  const elCurrentTime = document.getElementById('currentTime');
  const elDurationTime = document.getElementById('durationTime');

  if (elCurrentTime) elCurrentTime.textContent = formatarTempo(atual);
  if (elDurationTime) elDurationTime.textContent = formatarTempo(duracao || 0);

  // Registra contagem no ranking caso tenha ouvido mais de 90%
  if (duracao && !streamRegistrado) {
    const porcentagem = (atual / duracao) * 100;
    if (porcentagem >= 90) {
      if (playlist[musicaAtualIndex] && playlist[musicaAtualIndex].id) {
        registrarReproducao(playlist[musicaAtualIndex].id);
      }
      streamRegistrado = true;
    }
  }
}

function formatarTempo(segundos) {
  if (isNaN(segundos)) return '0:00';
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

/**
 * Gerenciamento de Favoritos (LocalStorage)
 */
function toggleFavorito() {
  if (!playlist || !playlist[musicaAtualIndex]) return;

  const musica = playlist[musicaAtualIndex];
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const index = favoritos.findIndex((f) => f.titulo === musica.titulo);

  if (index > -1) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push(musica);
  }

  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  atualizarBotaoFavorito();
}

function atualizarBotaoFavorito() {
  const btnFavoritar = document.getElementById('btnFavoritar');
  if (!btnFavoritar || !playlist[musicaAtualIndex]) return;

  const musica = playlist[musicaAtualIndex];
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const ehFavorito = favoritos.some((f) => f.titulo === musica.titulo);

  if (ehFavorito) {
    btnFavoritar.classList.add('ativo');
  } else {
    btnFavoritar.classList.remove('ativo');
  }
}

/**
 * Salva a faixa reproduzida no histórico recente
 */
function salvarNoHistorico(musica) {
  if (!musica) return;
  let historico = JSON.parse(localStorage.getItem('historico_adoraplay')) || [];
  historico = historico.filter((m) => m.audio !== musica.audio);
  historico.unshift(musica);

  if (historico.length > 5) historico.pop();
  localStorage.setItem('historico_adoraplay', JSON.stringify(historico));
}

/**
 * Envia contagem de reprodução para o Cloudflare Worker da API
 */
async function registrarReproducao(id) {
  try {
    await fetch('https://adoraplay-api.digiartesai.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  } catch (erro) {
    console.warn('Falha ao registrar reprodução:', erro.message);
  }
}

// Funções Globais expostas para consumo dos demais arquivos (app.js, pesquisa.js, etc.)
window.tocarEstaMusica = (index) => tocarPorIndice(index);
window.tocarMusicaPorIndex = (index) => tocarPorIndice(index);
window.tocarMusicaPorObjeto = (musicaObjeto) => {
  const index = playlist.findIndex((m) => m.audio === musicaObjeto.audio);
  if (index >= 0) {
    tocarPorIndice(index);
  } else {
    playlist.unshift(musicaObjeto);
    carregarPlaylist(playlist);
    tocarPorIndice(0);
  }
};
