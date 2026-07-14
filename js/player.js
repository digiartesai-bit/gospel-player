// Elementos Globais
const audioPlayer = document.getElementById("audioPlayer");
const miniPlayer = document.getElementById("miniPlayer");
const miniCapa = document.getElementById("miniCapa");
const miniTitulo = document.getElementById("miniTitulo");
const miniArtista = document.getElementById("miniArtista");
const btnPlay = document.getElementById("btnPlay");

// Novos Elementos Globais para Shuffle e Repeat
const btnShuffle = document.getElementById("btnShuffle");
const btnRepeat = document.getElementById("btnRepeat");

// Elementos da Barra de Progresso
const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const durationTime = document.getElementById("durationTime");

// Estado
let playlist = [];
let musicaAtual = 0;
let tocando = false;

// Estados das novas funções
let modoShuffle = false;
let modoRepeat = false; // false = sem repetição, true = repete a música atual

// Garante o carregamento da playlist dinâmica do app.js
function carregarPlaylist(lista) { 
    playlist = [...lista]; 
    // Se o shuffle já estiver ativo ao carregar uma nova lista, garante a consistência do estado
    atualizarBotoesModo();
}

if (window.playlist && window.playlist.length > 0) {
    playlist = [...window.playlist];
}

// Toca uma música com base no índice
function tocar(indice) {
    if (!playlist || playlist.length === 0) return;
    
    // Proteção contra índices inválidos
    if (indice < 0 || indice >= playlist.length) return;
    
    musicaAtual = indice;
    const musica = playlist[indice];
    
    // Define o áudio
    audioPlayer.src = musica.audio;
    
    // Exibe o mini-player IMEDIATAMENTE
    if (miniPlayer) {
        miniPlayer.style.display = "flex";
    }
    
    // Atualiza as informações na tela na mesma hora
    atualizarMiniPlayer();
    
    // Inicia a reprodução tratando possíveis bloqueios do navegador
    audioPlayer.play()
        .then(() => {
            tocando = true;
            atualizarMiniPlayer(); // Atualiza novamente para garantir o ícone de Pause
        })
        .catch(erro => {
            console.warn("A reprodução foi impedida pelo navegador ou o áudio falhou:", erro);
            tocando = false;
            atualizarMiniPlayer();
        });
}

// Controla o Play e o Pause com segurança
function playPause() {
    if (!audioPlayer.src) return;
    
    if (tocando) {
        audioPlayer.pause();
        tocando = false;
        atualizarMiniPlayer();
    } else {
        audioPlayer.play()
            .then(() => {
                tocando = true;
                atualizarMiniPlayer();
            })
            .catch(erro => {
                console.error("Erro ao tentar reproduzir:", erro);
                tocando = false;
                atualizarMiniPlayer();
            });
    }
}

// Atualiza o estado visual do player
function atualizarMiniPlayer() {
    if (!miniPlayer) return;
    miniPlayer.style.display = "flex";
    
    if (!playlist || !playlist[musicaAtual]) return;
    const musica = playlist[musicaAtual];
    
    if (miniTitulo) miniTitulo.textContent = musica.titulo;
    if (miniArtista) miniArtista.textContent = musica.artista;
    if (miniCapa) miniCapa.src = musica.capa || "assets/icons/album.svg";
    
    // Atualiza o ícone do botão de Play/Pause dinamicamente
    if (btnPlay) {
        let img = btnPlay.querySelector("img");
        if (img) {
            img.src = tocando ? "assets/icons/pause.svg" : "assets/icons/play.svg";
        }
    }
    
    // Atualiza o estado dos botões de Shuffle e Repeat (muda a opacidade/brilho)
    atualizarBotoesModo();
    
    // Atualiza o estado visual do coração do favorito
    atualizarBotaoFavorito();
}

// Pula para a próxima música (Lógica de Shuffle integrada)
function proxima() { 
    if (playlist.length === 0) return;

    if (modoShuffle) {
        // Escolhe um índice aleatório dentro da playlist ativa na tela
        if (playlist.length > 1) {
            let novoIndice;
            do {
                novoIndice = Math.floor(Math.random() * playlist.length);
            } while (novoIndice === musicaAtual);
            musicaAtual = novoIndice;
        } else {
            musicaAtual = 0;
        }
    } else {
        // Segue a ordem normal da lista ativa na tela
        musicaAtual = (musicaAtual + 1) % playlist.length; 
    }
    
    tocar(musicaAtual); 
}

// Volta para a música anterior
function anterior() { 
    if (playlist.length === 0) return;

    if (modoShuffle) {
        if (playlist.length > 1) {
            let novoIndice;
            do {
                novoIndice = Math.floor(Math.random() * playlist.length);
            } while (novoIndice === musicaAtual);
            musicaAtual = novoIndice;
        } else {
            musicaAtual = 0;
        }
    } else {
        musicaAtual = (musicaAtual - 1 + playlist.length) % playlist.length; 
    }
    
    tocar(musicaAtual); 
}

// FUNÇÃO: Ativa / Desativa o Modo Aleatório (Shuffle)
// FUNÇÃO: Ativa / Desativa o Modo Aleatório (Shuffle)
function alternarShuffle() {
    modoShuffle = !modoShuffle;
    
    // Se ativou o Shuffle, desativa o Repeat imediatamente para evitar conflito!
    if (modoShuffle) {
        modoRepeat = false;
    }
    
    console.log(modoShuffle ? "Modo Aleatório Ativado 🔀" : "Modo Aleatório Desativado ➡️");
    
    // Força a atualização visual imediata de ambos os botões!
    atualizarBotoesModo();
}

// FUNÇÃO: Ativa / Desativa a Repetição (Repeat de 1 música)
function alternarRepeat() {
    modoRepeat = !modoRepeat;
    
    // Se ativou o Repeat, desativa o Shuffle imediatamente!
    if (modoRepeat) {
        modoShuffle = false;
    }
    
    console.log(modoRepeat ? "Repetição Ativada 🔁" : "Repetição Desativada ➡️");
    
    // Força a atualização visual imediata de ambos os botões!
    atualizarBotoesModo();
}


// FUNÇÃO: Ativa / Desativa a Repetição (Repeat de 1 música)
function alternarRepeat() {
    modoRepeat = !modoRepeat;
    
    // Se ativou o Repeat, desativa o Shuffle imediatamente!
    if (modoRepeat) {
        modoShuffle = false;
    }
    
    console.log(modoRepeat ? "Repetição Ativada 🔁" : "Repetição Desativada ➡️");
    atualizarBotoesModo();
}

// Atualiza o visual dos botões de Shuffle e Repeat
function atualizarBotoesModo() {
    const btnShuffle = document.getElementById("btnShuffle");
    const btnRepeat = document.getElementById("btnRepeat");

    if (btnShuffle) {
        let img = btnShuffle.querySelector("img");
        if (img) {
            img.style.transition = "all 0.2s ease";
            img.style.filter = modoShuffle ? "brightness(1.5) saturate(10) drop-shadow(0px 0px 5px rgba(212, 175, 55, 0.9))" : "grayscale(100%)";
            img.style.opacity = modoShuffle ? "1" : "0.4";
        }
    }
    
    if (btnRepeat) {
        let img = btnRepeat.querySelector("img");
        if (img) {
            img.style.transition = "all 0.2s ease";
            img.style.filter = modoRepeat ? "brightness(1.5) saturate(10) drop-shadow(0px 0px 5px rgba(212, 175, 55, 0.9))" : "grayscale(100%)";
            img.style.opacity = modoRepeat ? "1" : "0.4";
        }
    }
}

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// Eventos de Progresso do Áudio
if (audioPlayer) {
    audioPlayer.addEventListener("timeupdate", () => {
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        if (progressBar) {
            progressBar.value = duration ? (current / duration) * 100 : 0;
        }
        if (currentTime) currentTime.textContent = formatarTempo(current);
        if (durationTime) durationTime.textContent = formatarTempo(duration || 0);
    });

    // Ao acabar a música atual...
    audioPlayer.addEventListener("ended", () => {
        if (modoRepeat) {
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(err => console.log(err));
        } else {
            proxima();
        }
    });
}

if (progressBar) {
    progressBar.addEventListener("input", () => {
        if (audioPlayer && audioPlayer.duration) {
            audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
        }
    });
}

// LÓGICA DE FAVORITOS (Comunicação bidirecional com o app.js)
function toggleFavorito() {
    if (!playlist || !playlist[musicaAtual]) return;
    const musica = playlist[musicaAtual];

    console.log("Favoritando/Desfavoritando:", musica.titulo);
    
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const index = favoritos.findIndex(f => f.titulo.trim() === musica.titulo.trim());
    
    if (index > -1) {
        favoritos.splice(index, 1);
        console.log("Removido dos favoritos.");
    } else {
        favoritos.push(musica);
        console.log("Adicionado aos favoritos.");
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarBotaoFavorito();

    if (typeof renderizarFavoritosHorizontais === "function") {
        renderizarFavoritosHorizontais();
    }
}

function atualizarBotaoFavorito() {
    const imgFavorito = document.getElementById("imgFavorito");
    if (!imgFavorito) return;
    
    const musica = playlist[musicaAtual];
    if (!musica) return;
    
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const ehFavorito = favoritos.some(f => f.titulo.trim() === musica.titulo.trim());
    
    imgFavorito.style.filter = ehFavorito ? "brightness(1.2) saturate(10) drop-shadow(0px 0px 4px rgba(212, 175, 55, 0.8))" : "grayscale(100%)";
    imgFavorito.style.opacity = ehFavorito ? "1" : "0.4";
}
