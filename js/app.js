// ================================
// APP.JS - DIGIARTES AI STREAMING
// ================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Digiartes AI iniciado");

    carregarVideos();

});


// ================================
// BANCO DE VÍDEOS TEMPORÁRIO
// (depois ligaremos ao banco de dados)
// ================================

const videos = [
    {
        titulo: "Os Cinco Pãezinhos",
        categoria: "Infantil",
        imagem: "assets/capa1.jpg",
        video: "videos/paozinhos.mp4"
    },
    {
        titulo: "A Criação do Universo",
        categoria: "Documentário",
        imagem: "assets/capa2.jpg",
        video: "videos/criacao.mp4"
    }
];


// ================================
// CARREGAR CATÁLOGO
// ================================

function carregarVideos(){

    const lista = document.getElementById("listaVideos");

    if(!lista) return;


    videos.forEach(video => {

        const card = document.createElement("div");

        card.className = "card-video";


        card.innerHTML = `
            <img src="${video.imagem}">
            <h3>${video.titulo}</h3>
            <p>${video.categoria}</p>
            <button onclick="abrirVideo('${video.video}')">
                Assistir
            </button>
        `;


        lista.appendChild(card);

    });

}


// ================================
// ABRIR PLAYER
// ================================

function abrirVideo(video){

    const player = document.getElementById("player");

    if(player){

        player.src = video;
        player.play();

    }

}
