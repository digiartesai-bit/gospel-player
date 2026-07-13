const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

let musicas = [];

fetch("musicas.json")
.then(response => response.json())
.then(data => {

    musicas = data;

    carregarPlaylist(musicas);

    carregarTela();

});

function carregarTela(){

    continueOuvindo.innerHTML = "";
    albuns.innerHTML = "";
    listaMusicas.innerHTML = "";

    musicas.forEach((musica,index)=>{

        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${index})">
            <img src="${musica.capa}"
            onerror="this.src='https://placehold.co/300x300?text=Capa'">
            <p>${musica.titulo}</p>
        </div>`;

        albuns.innerHTML += `
        <div class="card">
            <img src="${musica.capa}"
            onerror="this.src='https://placehold.co/300x300?text=Album'">
            <p>${musica.album}</p>
        </div>`;

        listaMusicas.innerHTML += `
        <div class="musica">

            <div>

                <strong>${musica.titulo}</strong><br>

                <small>${musica.artista}</small>

            </div>

            <button onclick="tocar(${index})">
                ▶
            </button>

        </div>`;

    });

}

function atualizarMiniPlayer(){

    if(!playlist.length) return;

    const mini = document.querySelector(".mini-player");

    mini.innerHTML = `

        <div>

            <strong>${playlist[musicaAtual].titulo}</strong><br>

            <small>${playlist[musicaAtual].artista}</small>

        </div>

        <div>

            <button onclick="anterior()">⏮</button>

            <button onclick="playPause()">

                ${tocando ? "⏸" : "▶"}

            </button>

            <button onclick="proxima()">⏭</button>

        </div>

    `;

}
