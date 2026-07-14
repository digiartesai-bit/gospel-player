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
    const miniPlayer = document.getElementById("miniPlayer");
    
    // Força o player a aparecer na tela
    miniPlayer.style.display = "flex"; 

    if (!playlist || !playlist[musicaAtual]) return;

    const musica = playlist[musicaAtual];

    // Atualiza os textos da música ativa
    miniTitulo.textContent = musica.titulo;
    miniArtista.textContent = musica.artista;

    // Atualiza a capa
    miniCapa.src = musica.capa || "assets/icons/album.svg";
    miniCapa.onerror = function() { 
        this.src = "assets/icons/album.svg"; 
    };

    // ALTERAÇÃO DO ÍCONE DE PLAY/PAUSE (Super Segura)
    const btnPlay = document.getElementById("btnPlay");
    if (btnPlay) {
        let img = btnPlay.querySelector("img");
        
        // Se por algum motivo a imagem sumiu de dentro do botão, nós a recriamos
        if (!img) {
            img = document.createElement("img");
            img.width = 14;
            img.height = 14;
            btnPlay.appendChild(img);
        }

        // Troca a imagem dependendo de estar tocando ou pausado
        if (tocando) {
            img.src = "assets/icons/pause.svg";
            img.alt = "Pausar";
        } else {
            img.src = "assets/icons/play.svg";
            img.alt = "Reproduzir";
        }
    }
}

// Navegação
function proxima() {
    musicaAtual = (musicaAtual + 1) % playlist.length;
    tocar(musicaAtual);
}

// Anterior
function anterior() {
    musicaAtual = (musicaAtual - 1 + playlist.length) % playlist.length;
    tocar(musicaAtual);
}

// Função auxiliar para formatar o tempo (0:00)
function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// ==========================================
// MONITORAMENTO E EVENTOS DO PROGRESO
// ==========================================

// Atualiza a barra de progresso e textos de minutos conforme o áudio toca
audioPlayer.addEventListener("timeupdate", () => {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;

    if (duration) {
        // Atualiza o valor do slide (input range) proporcionalmente de 0 a 100
        progressBar.value = (current / duration) * 100;
    } else {
        progressBar.value = 0;
    }

    // Atualiza os tempos textuais na interface
    currentTime.textContent = formatarTempo(current);
    durationTime.textContent = formatarTempo(duration || 0);
});

// Permite clicar ou arrastar na barra para avançar/voltar a música
progressBar.addEventListener("input", () => {
    if (!audioPlayer.duration) return;
    // Calcula o tempo em segundos com base na posição da barra (0-100)
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
});

// Eventos de Navegação e Erro do reprodutor
audioPlayer.addEventListener("ended", proxima);

// Tratamento de erro de áudio (caso o link do R2 falhe)
audioPlayer.addEventListener("error", () => {
    console.error("Erro no arquivo de áudio.");
    tocando = false;
    atualizarMiniPlayer();
});
// Função para alternar o status de favorito
function toggleFavorito(musica) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const index = favoritos.findIndex(f => f.titulo === musica.titulo);

    if (index > -1) {
        favoritos.splice(index, 1); // Remove dos favoritos
    } else {
        favoritos.push(musica); // Adiciona aos favoritos
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarBotaoFavorito(); // Atualiza o ícone visualmente
}

// Verifica se a música atual é favorita para definir o visual do coração
function atualizarBotaoFavorito() {
    const btnFavorito = document.getElementById("btnFavorito"); // Certifique-se de ter esse id no seu botão
    if (!btnFavorito) return;
    
    const musica = playlist[musicaAtual];
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const ehFavorito = favoritos.find(f => f.titulo === musica.titulo);
    
    // Altera a cor ou a imagem do coração baseado no status
    btnFavorito.style.filter = ehFavorito ? "brightness(1) saturate(10)" : "brightness(0.5)";
}
