const audioPlayer = document.getElementById("audioPlayer");

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

    if(audioPlayer.src === "") return;

    if(tocando){

        audioPlayer.pause();
        tocando = false;

    }else{

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

        musicaAtual = playlist.length-1;

    }

    tocar(musicaAtual);

}

audioPlayer.addEventListener("ended",proxima);
