// Elementos
const audioPlayer = document.getElementById("audioPlayer");
const miniPlayer = document.getElementById("miniPlayer");
const miniCapa = document.getElementById("miniCapa");
const miniTitulo = document.getElementById("miniTitulo");
const miniArtista = document.getElementById("miniArtista");
const btnPlay = document.getElementById("btnPlay");

const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const durationTime = document.getElementById("durationTime");

// Estado
let playlist = [];
let musicaAtual = 0;
let tocando = false;

let modoShuffle = false;
let modoRepeat = false;

let streamRegistrado = false;


// Capa da música
function obterCapaMusica(musica) {
    if (!musica) return "assets/icons/album.svg";

    return musica.capa_musica ||
           musica.capa ||
           "assets/icons/album.svg";
}


// Playlist
function carregarPlaylist(lista) {
    playlist = [...lista];
    atualizarBotoesModo();
}

if (window.playlist && window.playlist.length) {
    playlist = [...window.playlist];
}


// Tocar música
function tocar(indice) {

    if (!playlist.length) return;
    if (indice < 0 || indice >= playlist.length) return;

    musicaAtual = indice;
    streamRegistrado = false;

    const musica = playlist[musicaAtual];

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
        .catch(() => {
            tocando = false;
            atualizarMiniPlayer();
        });
}


// Play / Pause
function playPause() {

    if (!audioPlayer.src && typeof musicas !== "undefined") {

        carregarPlaylist(musicas);

        let indice = 0;

        if (
            typeof maisOuvidas !== "undefined" &&
            maisOuvidas.length
        ) {

            const top = maisOuvidas[0];

            const encontrado = musicas.findIndex(
                m => Number(m.id) === Number(top.id)
            );

            if (encontrado >= 0) {
                indice = encontrado;
            }
        }

        tocar(indice);
        return;
    }


    if (tocando) {

        audioPlayer.pause();
        tocando = false;

    } else {

        audioPlayer.play()
            .then(() => {
                tocando = true;
            })
            .catch(() => {
                tocando = false;
            });
    }

    atualizarMiniPlayer();
}


// Atualiza mini player
function atualizarMiniPlayer() {

    if (!miniPlayer) return;

    miniPlayer.style.display = "flex";


    const musica = playlist[musicaAtual];

    if (!musica) return;


    if (miniTitulo) {
        miniTitulo.textContent = musica.titulo;
    }

    if (miniArtista) {
        miniArtista.textContent = musica.artista;
    }


    if (miniCapa) {

        miniCapa.src = obterCapaMusica(musica);

        miniCapa.onerror = () => {
            miniCapa.src =
                musica.capa ||
                "assets/icons/album.svg";
        };
    }


    if (btnPlay) {

        const img = btnPlay.querySelector("img");

        if (img) {

            img.src = tocando
                ? "assets/icons/pause.svg"
                : "assets/icons/play.svg";

            img.style.marginLeft =
                tocando ? "0px" : "2px";
        }
    }


    atualizarBotoesModo();
    atualizarBotaoFavorito();
}


// Próxima música
function proxima() {

    if (!playlist.length) return;


    if (modoShuffle) {

        let novo;

        do {

            novo = Math.floor(
                Math.random() * playlist.length
            );

        } while (
            novo === musicaAtual &&
            playlist.length > 1
        );

        musicaAtual = novo;

    } else {

        musicaAtual =
            (musicaAtual + 1) %
            playlist.length;
    }


    tocar(musicaAtual);
}


// Música anterior
function anterior() {

    if (!playlist.length) return;


    if (modoShuffle) {

        let novo;

        do {

            novo = Math.floor(
                Math.random() * playlist.length
            );

        } while (
            novo === musicaAtual &&
            playlist.length > 1
        );

        musicaAtual = novo;

    } else {

        musicaAtual =
            (musicaAtual - 1 + playlist.length) %
            playlist.length;
    }


    tocar(musicaAtual);
}


// Shuffle
function alternarShuffle() {

    modoShuffle = !modoShuffle;

    if (modoShuffle) {
        modoRepeat = false;
    }

    atualizarBotoesModo();
}


// Repeat
function alternarRepeat() {

    modoRepeat = !modoRepeat;

    if (modoRepeat) {
        modoShuffle = false;
    }

    atualizarBotoesModo();
}


// Visual dos modos
function atualizarBotoesModo() {

    const shuffle =
        document.getElementById("btnShuffle");

    const repeat =
        document.getElementById("btnRepeat");


    const ativo =
        "brightness(1.5) saturate(10) drop-shadow(0 0 5px rgba(212,175,55,.9))";


    const inativo =
        "brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(1067%) hue-rotate(352deg) brightness(85%) contrast(85%)";


    if (shuffle) {

        const img = shuffle.querySelector("img");

        if (img) {

            img.style.filter =
                modoShuffle ? ativo : inativo;

            img.style.opacity =
                modoShuffle ? "1" : "0.5";
        }
    }


    if (repeat) {

        const img = repeat.querySelector("img");

        if (img) {

            img.style.filter =
                modoRepeat ? ativo : inativo;

            img.style.opacity =
                modoRepeat ? "1" : "0.5";
        }
    }
            }
// Próxima música
function proxima() {
    if (!playlist.length) return;

    if (modoShuffle) {
        let novo;
        do {
            novo = Math.floor(Math.random() * playlist.length);
        } while (novo === musicaAtual && playlist.length > 1);

        musicaAtual = novo;
    } else {
        musicaAtual = (musicaAtual + 1) % playlist.length;
    }

    tocar(musicaAtual);
}


// Música anterior
function anterior() {
    if (!playlist.length) return;

    if (modoShuffle) {
        let novo;
        do {
            novo = Math.floor(Math.random() * playlist.length);
        } while (novo === musicaAtual && playlist.length > 1);

        musicaAtual = novo;
    } else {
        musicaAtual = (musicaAtual - 1 + playlist.length) % playlist.length;
    }

    tocar(musicaAtual);
}


// Shuffle
function alternarShuffle() {
    modoShuffle = !modoShuffle;

    if (modoShuffle) {
        modoRepeat = false;
    }

    atualizarBotoesModo();
}


// Repeat
function alternarRepeat() {
    modoRepeat = !modoRepeat;

    if (modoRepeat) {
        modoShuffle = false;
    }

    atualizarBotoesModo();
}


// Atualiza visual dos botões
function atualizarBotoesModo() {

    const ativo =
    "brightness(1.5) saturate(10) drop-shadow(0 0 5px rgba(212,175,55,.9))";

    const inativo =
    "brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(1067%) hue-rotate(352deg) brightness(85%) contrast(85%)";


    if (btnShuffle) {

        const img = btnShuffle.querySelector("img");

        if (img) {
            img.style.filter = modoShuffle ? ativo : inativo;
            img.style.opacity = modoShuffle ? "1" : "0.5";
        }
    }


    if (btnRepeat) {

        const img = btnRepeat.querySelector("img");

        if (img) {
            img.style.filter = modoRepeat ? ativo : inativo;
            img.style.opacity = modoRepeat ? "1" : "0.5";
        }
    }
}


function formatarTempo(segundos) {

    if (isNaN(segundos)) return "0:00";

    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);

    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
}

// EVENTOS DO ÁUDIO
// Eventos de Progresso do Áudio
if (audioPlayer) {

    audioPlayer.addEventListener("timeupdate", () => {

        const atual = audioPlayer.currentTime;
        const total = audioPlayer.duration;

        // Atualiza barra visual
        if (progressBar) {
            progressBar.value = total ? (atual / total) * 100 : 0;
        }

        if (currentTime) {
            currentTime.textContent = formatarTempo(atual);
        }

        if (durationTime) {
            durationTime.textContent = formatarTempo(total || 0);
        }

        // =====================================
        // REGISTRO REAL - 90% DA MÚSICA OUVIDA
        // =====================================
      /* if (
            !streamRegistrado &&
            total > 0 &&
            atual / total >= 0.90 &&
            playlist[musicaAtual]
        ) {

            registrarReproducao(
                playlist[musicaAtual].id
            );

            streamRegistrado = true;
        }

    });*/

        // =====================================
// REGISTRO REAL - 90% DE TEMPO OUVIDO
// IGNORA AVANÇO MANUAL DA BARRA
// =====================================

if (
    audioPlayer &&
    !audioPlayer.paused &&
    !streamRegistrado &&
    total > 0
) {

    tempoOuvidoAcumulado += 1;

    const percentualOuvido = tempoOuvidoAcumulado / total;

    if (percentualOuvido >= 0.90) {

        registrarReproducao(
            playlist[musicaAtual].id
        );

        streamRegistrado = true;

        console.log("Reprodução registrada");
    }
}

    // =====================================
    // QUANDO A MÚSICA TERMINA
    // =====================================
    audioPlayer.addEventListener("ended", () => {


        // Segurança caso o último timeupdate não aconteça
        if (
            !streamRegistrado &&
            audioPlayer.duration > 0 &&
            playlist[musicaAtual] &&
            audioPlayer.currentTime / audioPlayer.duration >= 0.90
        ) {

            registrarReproducao(
                playlist[musicaAtual].id
            );

            streamRegistrado = true;
        }

        // =====================================
        // REPEAT
        // Nova reprodução = novo streaming possível
        // =====================================
        if (modoRepeat) {

            streamRegistrado = false;

            audioPlayer.currentTime = 0;

            audioPlayer.play()
                .catch(err => console.log(err));

        } else {

            proxima();

        }

    });

    audioPlayer.addEventListener("error", () => {

        console.warn("Erro ao carregar áudio");

        tocando = false;

        atualizarMiniPlayer();

    });

}

// Barra manual

if (progressBar) {

    progressBar.addEventListener("input", () => {

        if (audioPlayer.duration) {

            audioPlayer.currentTime =
            (progressBar.value / 100) *
            audioPlayer.duration;

        }

    });

}

// FAVORITOS

function toggleFavorito() {

    const musica = playlist[musicaAtual];

    if (!musica) return;


    let favoritos =
    JSON.parse(localStorage.getItem("favoritos")) || [];


    const existe =
    favoritos.findIndex(
        f => f.id === musica.id
    );


    if (existe >= 0) {

        favoritos.splice(existe,1);

    } else {

        favoritos.push(musica);

    }


    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );


    atualizarBotaoFavorito();


    if (typeof renderizarFavoritosHorizontais === "function") {

        renderizarFavoritosHorizontais();

    }

}



function atualizarBotaoFavorito() {


    const img =
    document.getElementById("imgFavorito");


    if (!img || !playlist[musicaAtual])
        return;


    const favoritos =
    JSON.parse(localStorage.getItem("favoritos")) || [];


    const ativo =
    favoritos.some(
        f => f.id === playlist[musicaAtual].id
    );


    img.style.opacity =
    ativo ? "1" : "0.5";


    img.style.filter =
    ativo
    ?
    "brightness(1.2) saturate(10) drop-shadow(0 0 4px rgba(212,175,55,.8))"
    :
    "brightness(0) saturate(100%) invert(84%) sepia(23%)";

}



// HISTÓRICO


function salvarNoHistorico(musica) {


    let historico =
    JSON.parse(localStorage.getItem("historico_adoraplay")) || [];


    historico =
    historico.filter(
        m => m.id !== musica.id
    );


    historico.unshift(musica);


    if (historico.length > 3)
        historico.pop();



    localStorage.setItem(
        "historico_adoraplay",
        JSON.stringify(historico)
    );


    if (typeof renderizarUltimasOuvidas === "function") {

        renderizarUltimasOuvidas();

    }

}



// API

async function registrarReproducao(id) {

    try {

        await fetch(
        "https://adoraplay-api.digiartesai.workers.dev/",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({id})
        });


    } catch(e) {

        console.warn(
        "Erro ao registrar reprodução",
        e
        );

    }

}

// Inicialização

function inicializarPlayerComTop1() {


    if (
        typeof musicas === "undefined" ||
        !musicas.length
    )
    return;


    carregarPlaylist(musicas);


    musicaAtual = 0;


    if (typeof maisOuvidas !== "undefined"
        && maisOuvidas.length) {


        const id =
        maisOuvidas[0].id;


        const index =
        musicas.findIndex(
            m => m.id === id
        );


        if (index >= 0)
            musicaAtual = index;

    }



    const musica =
    playlist[musicaAtual];


    if (audioPlayer && musica) {

        audioPlayer.src =
        musica.audio;

    }


    atualizarMiniPlayer();

}
