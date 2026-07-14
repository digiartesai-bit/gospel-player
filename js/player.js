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
const btnPlayImg = document.querySelector("#btnPlay img");
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

    // Atualiza o botão de Play/Pause
    if (btnPlayImg) {
        btnPlayImg.src = tocando ? "assets/icons/pause.svg" : "assets/icons/play.svg";
        btnPlayImg.alt = tocando ? "Pausar" : "Reproduzir";
    }

    atualizarIconeFavorito();
}

// EVENTOS DO ÁUDIO (Progresso e Fim da Música)
if (audio) {
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        const progresso = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.value = progresso;

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

// ATIVAR / DESATIVAR SHUFFLE
function alternarShuffle() {
    shuffleAtivo = !shuffleAtivo;
    const btnShuffle = document.getElementById("btnShuffle");
    if (btnShuffle) {
        btnShuffle.style.opacity = shuffleAtivo ? "1" : "0.5";
    }
}

// ATIVAR / DESATIVAR REPEAT
function alternarRepeat() {
    repeatAtivo = !repeatAtivo;
    const btnRepeat = document.getElementById("btnRepeat");
    if (btnRepeat) {
        btnRepeat.style.opacity = repeatAtivo ? "1" : "0.5";
    }
}

// GERENCIAMENTO DE FAVORITOS
function atualizarIconeFavorito() {
    if (!imgFavorito || playlist.length === 0) return;
    
    const musica = playlist[indexMusicaAtual];
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const isFavorito = favoritos.some(f => f.audio === musica.audio);

    if (isFavorito) {
        imgFavorito.src = "assets/icons/heart-filled.svg"; // Ícone coração preenchido
        imgFavorito.style.transform = "scale(1.15)";
    } else {
        imgFavorito.src = "assets/icons/heart.svg"; // Ícone normal
        imgFavorito.style.transform = "scale(1)";
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

    // Atualiza a tela do app.js se a função de renderizar existir
    if (typeof renderizarFavoritosHorizontais === "function") {
        renderizarFavoritosHorizontais();
    }
}

// HISTÓRICO DE REPRODUÇÕES (Últimas Ouvidas - Limite de 3)
function salvarNoHistorico(musica) {
    let historico = JSON.parse(localStorage.getItem('historico_adoraplay')) || [];

    // Remove para não ter repetições duplicadas próximas
    historico = historico.filter(m => m.audio !== musica.audio);
    
    // Adiciona na primeira posição (topo)
    historico.unshift(musica);

    // Mantém apenas os 3 últimos itens
    if (historico.length > 3) {
        historico.pop();
    }

    localStorage.setItem('historico_adoraplay', JSON.stringify(historico));

    // Atualiza a tela dinamicamente se a função do app.js existir
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


