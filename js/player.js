// Elementos Globais
const audioPlayer = document.getElementById("audioPlayer");
const miniPlayer = document.getElementById("miniPlayer");
const miniCapa = document.getElementById("miniCapa");
const miniTitulo = document.getElementById("miniTitulo");
const miniArtista = document.getElementById("miniArtista");
const btnPlay = document.getElementById("btnPlay");

// Elementos da Barra de Progresso
const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const durationTime = document.getElementById("durationTime");

// Estado
let playlist = [];
let musicaAtual = 0;
let tocando = false;

function carregarPlaylist(lista) { playlist = lista; }

function tocar(indice) {
    if (!playlist || playlist.length === 0) return;
    musicaAtual = indice;
    const musica = playlist[indice];
    audioPlayer.src = musica.audio;
    miniPlayer.style.display = "flex";
    audioPlayer.play().then(() => {
        tocando = true;
        atualizarMiniPlayer();
    });
}

function playPause() {
    if (!audioPlayer.src) return;
    if (tocando) { audioPlayer.pause(); tocando = false; }
    else { audioPlayer.play(); tocando = true; }
    atualizarMiniPlayer();
}

function atualizarMiniPlayer() {
    miniPlayer.style.display = "flex";
    if (!playlist || !playlist[musicaAtual]) return;
    const musica = playlist[musicaAtual];
    miniTitulo.textContent = musica.titulo;
    miniArtista.textContent = musica.artista;
    miniCapa.src = musica.capa || "assets/icons/album.svg";
    
    // Atualiza ícone Play/Pause
    const btnPlay = document.getElementById("btnPlay");
    if (btnPlay) {
        let img = btnPlay.querySelector("img");
        if (img) img.src = tocando ? "assets/icons/pause.svg" : "assets/icons/play.svg";
    }
    
    // ATUALIZA O CORAÇÃO SEMPRE QUE MUDAR A MÚSICA
    atualizarBotaoFavorito();
}

function proxima() { musicaAtual = (musicaAtual + 1) % playlist.length; tocar(musicaAtual); }
function anterior() { musicaAtual = (musicaAtual - 1 + playlist.length) % playlist.length; tocar(musicaAtual); }

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// Eventos de Progresso
audioPlayer.addEventListener("timeupdate", () => {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    progressBar.value = duration ? (current / duration) * 100 : 0;
    currentTime.textContent = formatarTempo(current);
    durationTime.textContent = formatarTempo(duration || 0);
});

progressBar.addEventListener("input", () => {
    if (audioPlayer.duration) audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
});

// LOGICA DE FAVORITOS
function toggleFavorito() {
    const musica = playlist[musicaAtual];
    if (!musica) {
        console.log("Nenhuma música tocando para favoritar.");
        return;
    }
    
    console.log("Favoritando/Desfavoritando:", musica.titulo);
    
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const index = favoritos.findIndex(f => f.titulo === musica.titulo);
    
    if (index > -1) {
        favoritos.splice(index, 1);
        console.log("Removido dos favoritos.");
    } else {
        favoritos.push(musica);
        console.log("Adicionado aos favoritos.");
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarBotaoFavorito();
}


function atualizarBotaoFavorito() {
    const imgFavorito = document.getElementById("imgFavorito");
    if (!imgFavorito) return;
    const musica = playlist[musicaAtual];
    if (!musica) return;
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const ehFavorito = favoritos.some(f => f.titulo === musica.titulo);
    
    imgFavorito.style.filter = ehFavorito ? "brightness(1.2) saturate(10) drop-shadow(0px 0px 4px rgba(212, 175, 55, 0.8))" : "grayscale(100%)";
    imgFavorito.style.opacity = ehFavorito ? "1" : "0.4";
}
