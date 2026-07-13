const audioPlayer = document.getElementById("audioPlayer");
const miniCapa = document.getElementById("miniCapa");
const miniTitulo = document.getElementById("miniTitulo");
const miniArtista = document.getElementById("miniArtista");
const btnPlay = document.getElementById("btnPlay");

let playlist = [];
let musicaAtual = 0;
let tocando = false;

function carregarPlaylist(lista){
    playlist = lista;
}

function tocar(indice){
    if(!playlist.length) return;

    musicaAtual = indice;
    audioPlayer.src = playlist[indice].audio;
    audioPlayer.play();
    tocando = true;

    atualizarMiniPlayer();
}

function playPause(){
    if(!audioPlayer.src || audioPlayer.src === window.location.href) return;

    if(tocando){
        audioPlayer.pause();
        tocando = false;
    } else {
        audioPlayer.play();
        tocando = true;
    }

    atualizarMiniPlayer();
}

function proxima(){
    if(!playlist.length) return;

    musicaAtual++;
    if(musicaAtual >= playlist.length){
        musicaAtual = 0;
    }
    tocar(musicaAtual);
}

function anterior(){
    if(!playlist.length) return;

    musicaAtual--;
    if(musicaAtual < 0){
        musicaAtual = playlist.length - 1;
    }
    tocar(musicaAtual);
}

// Atualiza a interface do Mini Player com base no estado da música atual
function atualizarMiniPlayer() {
    if(!playlist.length || !playlist[musicaAtual]) return;

    const miniPlayer = document.getElementById("miniPlayer");
    miniPlayer.style.display = "flex"; // Revela o player na tela!

    // Atualiza textos
    miniTitulo.textContent = musica.titulo;
    miniArtista.textContent = musica.artista;

    // Atualiza a imagem da capa (usa o album.svg como fallback se falhar)
    miniCapa.src = musica.capa || "assets/icons/album.svg";
    miniCapa.onerror = function() {
        this.src = "assets/icons/album.svg";
    };

    // Alterna o SVG do botão principal entre Play e Pause de forma limpa
    const imgPlay = btnPlay.querySelector("img");
    if (imgPlay) {
        if (tocando) {
            imgPlay.src = "assets/icons/pause.svg";
            imgPlay.alt = "Pausar";
        } else {
            imgPlay.src = "assets/icons/play.svg";
            imgPlay.alt = "Reproduzir";
        }
    }
}

// Evento disparado quando a música chega ao fim
audioPlayer.addEventListener("ended", proxima);
