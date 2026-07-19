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
let modoRepeat = false;

// Variável de controle para contar apenas uma vez por reprodução
let streamRegistrado = false;

function obterCapaMusica(musica) {
    if (!musica) return "assets/icons/album.svg";
    if (musica.capa_musica) {
        return musica.capa_musica;
    }
    return musica.capa || "assets/icons/album.svg";
}

function carregarPlaylist(lista) { 
    playlist = [...lista]; 
    window.playlist = playlist;
    atualizarBotoesModo();
}

if (window.playlist && window.playlist.length > 0) {
    playlist = [...window.playlist];
}

// Toca uma música com base no índice
function tocar(indice) {
    if (!playlist || playlist.length === 0) {
        if (window.musicas && window.musicas.length > 0) {
            carregarPlaylist(window.musicas);
        } else {
            return;
        }
    }
    
    if (indice < 0 || indice >= playlist.length) return;
    
    musicaAtual = indice;
    const musica = playlist[indice];
    
    streamRegistrado = false;
    
    salvarNoHistorico(musica);
    
    audioPlayer.src = musica.audio;
    
    if (miniPlayer) {
        miniPlayer.style.display = "flex";
    }
    
    atualizarMiniPlayer();
    
    audioPlayer.play()
        .then(() => {
            tocando = true;
            atualizarMiniPlayer(); 
        })
        .catch(erro => {
            console.warn("A reprodução foi impedida pelo navegador ou o áudio falhou:", erro);
            tocando = false;
            atualizarMiniPlayer();
        });
}

function playPause() {
    if (!audioPlayer.src || audioPlayer.src === "" || audioPlayer.src === window.location.href) {
        if (typeof musicas !== "undefined" && musicas.length > 0) {
            carregarPlaylist(musicas);
            let indiceParaTocar = 0;

            if (typeof maisOuvidas !== "undefined" && maisOuvidas.length > 0) {
                const top1 = maisOuvidas[0]; 
                const idxTop1 = musicas.findIndex(m => m.id === top1.id);
                if (idxTop1 >= 0) {
                    indiceParaTocar = idxTop1;
                }
            }

            tocar(indiceParaTocar);
            return;
        }
    }

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

function atualizarMiniPlayer() {
    if (!miniPlayer) return;
    miniPlayer.style.display = "flex";
    
    if (!playlist || !playlist[musicaAtual]) return;
    const musica = playlist[musicaAtual];
    
    if (miniTitulo) miniTitulo.textContent = musica.titulo;
    if (miniArtista) miniArtista.textContent = musica.artista;
    
    if (miniCapa) {
        const capaIndividual = obterCapaMusica(musica);
        miniCapa.src = capaIndividual;
        miniCapa.onerror = () => {
            miniCapa.src = musica.capa || "assets/icons/album.svg";
        };
    }
    
    if (btnPlay) {
        let img = btnPlay.querySelector("img");
        if (img) {
            img.src = tocando ? "assets/icons/pause.svg" : "assets/icons/play.svg";
            img.style.marginLeft = tocando ? "0px" : "2px";
        }
    }
    
    atualizarBotoesModo();
    atualizarBotaoFavorito();
}

function proxima() { 
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
        musicaAtual = (musicaAtual + 1) % playlist.length; 
    }
    
    tocar(musicaAtual); 
}

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

function alternarShuffle() {
    modoShuffle = !modoShuffle;
    if (modoShuffle) {
        modoRepeat = false;
    }
    atualizarBotoesModo();
}

function alternarRepeat() {
    modoRepeat = !modoRepeat;
    if (modoRepeat) {
        modoShuffle = false;
    }
    atualizarBotoesModo();
}

function atualizarBotoesModo() {
    const btnShuffle = document.getElementById("btnShuffle");
    const btnRepeat = document.getElementById("btnRepeat");

    const filtroAtivo = "brightness(1.5) saturate(10) drop-shadow(0px 0px 5px rgba(212, 175, 55, 0.9))";
    const filtroInativo = "brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(1067%) hue-rotate(352deg) brightness(85%) contrast(85%)";

    if (btnShuffle) {
        let img = btnShuffle.querySelector("img");
        if (img) {
            img.style.filter = modoShuffle ? filtroAtivo : filtroInativo;
            img.style.opacity = modoShuffle ? "1" : "0.5";
        }
    }
    
    if (btnRepeat) {
        let img = btnRepeat.querySelector("img");
        if (img) {
            img.style.filter = modoRepeat ? filtroAtivo : filtroInativo;
            img.style.opacity = modoRepeat ? "1" : "0.5";
        }
    }
}

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

if (audioPlayer) {
    audioPlayer.addEventListener("play", () => {
        if (audioPlayer.currentTime < 1) {
            streamRegistrado = false;
        }
    });

    audioPlayer.addEventListener("timeupdate", () => {
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        if (progressBar) {
            progressBar.value = duration ? (current / duration) * 100 : 0;
        }

        if (currentTime) currentTime.textContent = formatarTempo(current);
        if (durationTime) durationTime.textContent = formatarTempo(duration || 0);

        if (duration && !streamRegistrado) {
            const porcentagemOuvida = (current / duration) * 100;
            
            if (porcentagemOuvida >= 90) {
                if (playlist[musicaAtual] && playlist[musicaAtual].id) {
                    registrarReproducao(playlist[musicaAtual].id);
                }
                streamRegistrado = true;
            }
        }
    });

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

// LÓGICA DE FAVORITOS
function toggleFavorito() {
    if (!playlist || !playlist[musicaAtual]) return;
    const musica = playlist[musicaAtual];
    
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const index = favoritos.findIndex(f => f.titulo.trim() === musica.titulo.trim());
    
    if (index > -1) {
        favoritos.splice(index, 1);
    } else {
        favoritos.push(musica);
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarBotaoFavorito();

    if (typeof window.renderizarFavoritosHorizontais === "function") {
        window.renderizarFavoritosHorizontais();
    }
}

function atualizarBotaoFavorito() {
    const btnFavoritar = document.getElementById("btnFavoritar");
    const imgFavorito = btnFavoritar ? btnFavoritar.querySelector("img") : document.getElementById("imgFavorito");
    if (!imgFavorito) return;
    
    const musica = playlist[musicaAtual];
    if (!musica) return;
    
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const ehFavorito = favoritos.some(f => f.titulo.trim() === musica.titulo.trim());
    
    const filtroAtivo = "brightness(1.2) saturate(10) drop-shadow(0px 0px 4px rgba(212, 175, 55, 0.8))";
    const filtroInativo = "brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(1067%) hue-rotate(352deg) brightness(85%) contrast(85%)";

    imgFavorito.style.filter = ehFavorito ? filtroAtivo : filtroInativo;
    imgFavorito.style.opacity = ehFavorito ? "1" : "0.5";
}

// Vincula o clique do botão favoritar
document.addEventListener("DOMContentLoaded", () => {
    const btnFavoritar = document.getElementById("btnFavoritar");
    if (btnFavoritar) {
        btnFavoritar.onclick = toggleFavorito;
    }
});

// GESTÃO DE HISTÓRICO
function salvarNoHistorico(musica) {
    if (!musica) return;
    let historico = JSON.parse(localStorage.getItem('historico_adoraplay')) || [];

    historico = historico.filter(m => m.audio !== musica.audio);
    historico.unshift(musica);

    if (historico.length > 3) {
        historico.pop();
    }

    localStorage.setItem('historico_adoraplay', JSON.stringify(historico));
    
    if (typeof renderizarUltimasOuvidas === "function") {
        renderizarUltimasOuvidas();
    }
}

async function registrarReproducao(id) {
    try {
        await fetch("https://adoraplay-api.digiartesai.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
    } catch (erro) {
        console.warn("Falha ao computar reprodução:", erro.message);
    }
}

function inicializarPlayerComTop1() {
    if (typeof musicas !== "undefined" && musicas.length > 0) {
        carregarPlaylist(musicas);
        
        let indiceTop1 = 0;

        if (typeof maisOuvidas !== "undefined" && maisOuvidas.length > 0) {
            const top1 = maisOuvidas[0];
            const idxTop1 = musicas.findIndex(m => m.id === top1.id);
            if (idxTop1 >= 0) {
                indiceTop1 = idxTop1;
            }
        }

        musicaAtual = indiceTop1;
        const musica = playlist[musicaAtual];

        if (audioPlayer && musica) {
            audioPlayer.src = musica.audio;
        }

        atualizarMiniPlayer();
    }
}
