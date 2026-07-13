// Elementos Globais
const audioPlayer = document.getElementById("audioPlayer");
const miniPlayer = document.getElementById("miniPlayer");
const miniCapa = document.getElementById("miniCapa");
const miniTitulo = document.getElementById("miniTitulo");
const miniArtista = document.getElementById("miniArtista");
const btnPlay = document.getElementById("btnPlay");

// Estado
let playlist = [];
let musicaAtual = 0;
let tocando = false;

// Função para receber os dados do app.js
function carregarPlaylist(lista) {
    playlist = lista;
}

// Lógica de Tocar
function tocar(indice) {
    if (!playlist || playlist.length === 0) return;

    musicaAtual = indice;
    const musica = playlist[indice];

    // Carrega o áudio
    audioPlayer.src = musica.audio;
    
    // Força o player a aparecer na tela
    miniPlayer.style.display = "flex";

    audioPlayer.play()
        .then(() => {
            tocando = true;
            atualizarMiniPlayer();
        })
        .catch(error => {
            console.error("Erro ao reproduzir:", error);
            alert("Não foi possível reproduzir este arquivo.");
        });
}

// Lógica de Play/Pause
function playPause() {
    if (!audioPlayer.src) return;

    if (tocando) {
        audioPlayer.pause();
        tocando = false;
    } else {
        audioPlayer.play();
        tocando = true;
    }
    atualizarMiniPlayer();
}

// Atualização da Interface
function atualizarMiniPlayer() {
    if (!playlist[musicaAtual]) return;

    const musica = playlist[musicaAtual];

    miniTitulo.textContent = musica.titulo;
    miniArtista.textContent = musica.artista;
    
    // Fallback de imagem
    miniCapa.src = musica.capa || "assets/icons/album.svg";
    miniCapa.onerror = function() { this.src = "assets/icons/album.svg"; };

    // Troca o ícone (SVG)
    const img = btnPlay.querySelector("img");
    if (img) {
        img.src = tocando ? "assets/icons/pause.svg" : "assets/icons/play.svg";
    }
}

// Navegação
function proxima() {
    musicaAtual = (musicaAtual + 1) % playlist.length;
    tocar(musicaAtual);
}

function anterior() {
    musicaAtual = (musicaAtual - 1 + playlist.length) % playlist.length;
    tocar(musicaAtual);
}

// Eventos
audioPlayer.addEventListener("ended", proxima);

// Tratamento de erro de áudio (caso o link do R2 falhe)
audioPlayer.addEventListener("error", () => {
    console.error("Erro no arquivo de áudio.");
    tocando = false;
    atualizarMiniPlayer();
});
