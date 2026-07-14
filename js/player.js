// VARIÁVEIS DO PLAYER
let playlist = [];
let indexMusicaAtual = 0;
let tocando = false;
let shuffleAtivo = false;
let repeatAtivo = false;

const audio = document.getElementById("audioPlayer");
const miniPlayer = document.getElementById("miniPlayer");
const miniCapa = document.getElementById("miniCapa");
const miniTitulo = document.getElementById("miniTitulo");
const miniArtista = document.getElementById("miniArtista");
const btnPlay = document.getElementById("btnPlay"); // Botão play/pause
const imgFavorito = document.getElementById("imgFavorito");
const progressBar = document.getElementById("progressBar");
const currentTimeLabel = document.getElementById("currentTime");
const durationTimeLabel = document.getElementById("durationTime");

// Função chamada pelo app.js para sincronizar a lista de músicas
function carregarPlaylist(novaPlaylist) {
    playlist = novaPlaylist;
    console.log("Playlist carregada no player:", playlist.length, "músicas");
}

// FUNÇÃO PARA TOCAR UMA MÚSICA ESPECÍFICA
function tocar(index) {
    if (!playlist || playlist.length === 0) return;
    
    // Proteção contra índice fora dos limites
    if (index < 0) index = 0;
    if (index >= playlist.length) index = playlist.length - 1;

    indexMusicaAtual = index;
    const musica = playlist[indexMusicaAtual];

    audio.src = musica.audio;
    audio.play()
        .then(() => {
            tocando = true;
            atualizarInterfacePlayer();
            salvarNoHistorico(musica);
        })
        .catch(err => {
            console.error("Erro ao reproduzir áudio:", err);
        });
}

// PLAY / PAUSE
function playPause() {
    if (!audio.src) {
        // Se não houver nada carregado, toca a primeira
        tocar(0);
        return;
    }

    if (audio.paused) {
        audio.play().then(() => {
            tocando = true;
            atualizarInterfacePlayer();
        });
    } else {
        audio.pause();
        tocando = false;
        atualizarInterfacePlayer();
    }
}

// PRÓXIMA MÚSICA
function proxima() {
    if (playlist.length === 0) return;

    if (shuffleAtivo) {
        const indexAleatorio = Math.floor(Math.random() * playlist.length);
        tocar(indexAleatorio);
    } else {
        let proximoIndex = indexMusicaAtual + 1;
        if (proximoIndex >= playlist.length) {
            proximoIndex = 0; // Volta para o início
        }
        tocar(proximoIndex);
    }
}

// MÚSICA ANTERIOR
function anterior() {
    if (playlist.length === 0) return;

    let anteriorIndex = indexMusicaAtual - 1;
    if (anteriorIndex < 0) {
        anteriorIndex = playlist.length - 1; // Vai para a última
    }
    tocar(anteriorIndex);
}

// ATUALIZAR INTERFACE DO MINI PLAYER
function atualizarInterfacePlayer() {
    if (playlist.length === 0) return;

    const musica = playlist[indexMusicaAtual];

    if (miniPlayer) miniPlayer.style.display = "flex";
    if (miniTitulo) miniTitulo.textContent = musica.titulo;
    if (miniArtista) miniArtista.textContent = musica.artista;
    if (miniCapa) {
        miniCapa.src = musica.capa_musica || musica.capa || 'assets/icons/album.svg';
    }

    // Atualiza a imagem de Play/Pause dentro do botão
    if (btnPlay) {
        const imgPlay = btnPlay.querySelector("img");
        if (imgPlay) {
            imgPlay.src = tocando ? "assets/icons/pause.svg" : "assets/icons/play.svg";
            imgPlay.alt = tocando ? "Pausar" : "Reproduzir";
        }
    }

    atualizarIconeFavorito();
}

// EVENTOS DO ÁUDIO (Progresso e Fim da Música)
if (audio) {
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        
        // Calcula o percentual para a barra de progresso
        const progresso = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.value = progresso;

        // Atualiza os textos do contador na tela
        if (currentTimeLabel) currentTimeLabel.textContent = formatarTempo(audio.currentTime);
        if (durationTimeLabel) durationTimeLabel.textContent = formatarTempo(audio.duration);
    });

    audio.addEventListener("loadedmetadata", () => {
        if (durationTimeLabel) durationTimeLabel.textContent = formatarTempo(audio.duration);
    });

    audio.addEventListener("ended", () => {
        if (repeatAtivo) {
            audio.currentTime = 0;
            audio.play();
        } else {
            proxima();
        }
    });
}

// Evento ao arrastar a barra de progresso manualmente
if (progressBar) {
    progressBar.addEventListener("input", () => {
        if (!audio.duration) return;
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    });
}

// ATIVAR / DESATIVAR SHUFFLE (Com feedback visual)
function alternarShuffle() {
    shuffleAtivo = !shuffleAtivo;
    const btnShuffle = document.getElementById("btnShuffle");
    if (btnShuffle) {
        const imgShuffle = btnShuffle.querySelector("img");
        if (imgShuffle) {
            imgShuffle.style.opacity = shuffleAtivo ? "1" : "0.35";
            imgShuffle.style.filter = shuffleAtivo ? "drop-shadow(0px 0px 4px #d4af37)" : "none";
        }
    }
}

// ATIVAR / DESATIVAR REPEAT (Com feedback visual)
function alternarRepeat() {
    repeatAtivo = !repeatAtivo;
    const btnRepeat = document.getElementById("btnRepeat");
    if (btnRepeat) {
        const imgRepeat = btnRepeat.querySelector("img");
        if (imgRepeat) {
            imgRepeat.style.opacity = repeatAtivo ? "1" : "0.35";
            imgRepeat.style.filter = repeatAtivo ? "drop-shadow(0px 0px 4px #d4af37)" : "none";
        }
    }
}

// GERENCIAMENTO DE FAVORITOS
function atualizarIconeFavorito() {
    const imgFav = document.getElementById("imgFavorito");
    if (!imgFav || playlist.length === 0) return;
    
    const musica = playlist[indexMusicaAtual];
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const isFavorito = favoritos.some(f => f.audio === musica.audio);

    if (isFavorito) {
        imgFav.src = "assets/icons/heart-filled.svg"; // Ícone coração preenchido
        imgFav.style.transform = "scale(1.15)";
        imgFav.style.filter = "none";
    } else {
        imgFav.src = "assets/icons/heart.svg"; // Ícone normal (vazio)
        imgFav.style.transform = "scale(1)";
        imgFav.style.filter = "none";
    }
}

function toggleFavorito() {
    if (playlist.length === 0) return;

    const musica = playlist[indexMusicaAtual];
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const index = favoritos.findIndex(f => f.audio === musica.audio);

    if (index > -1) {
        favoritos.splice(index, 1); // Remove dos favoritos
    } else {
        favoritos.push(musica); // Adiciona aos favoritos
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarIconeFavorito();

    // Atualiza as seções horizontais do app de forma imediata
    if (typeof renderizarFavoritosHorizontais === "function") {
        renderizarFavoritosHorizontais();
    }
}

// HISTÓRICO DE REPRODUÇÕES (Últimas Ouvidas)
function salvarNoHistorico(musica) {
    let historico = JSON.parse(localStorage.getItem('historico_adoraplay')) || [];

    // Remove duplicados anteriores
    historico = historico.filter(m => m.audio !== musica.audio);
    
    // Adiciona na frente (recente)
    historico.unshift(musica);

    // Limita a 3 músicas no histórico
    if (historico.length > 3) {
        historico.pop();
    }

    localStorage.setItem('historico_adoraplay', JSON.stringify(historico));

    if (typeof renderizarContinueOuvindo === "function") {
        renderizarContinueOuvindo();
    }
}

// AUXILIAR: FORMATADOR DE TEMPO (Minutos:Segundos)
function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}
