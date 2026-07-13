const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

fetch("musicas.json")
.then(resposta => resposta.json())
.then(musicas => {

    musicas.forEach(musica => {

        continueOuvindo.innerHTML += `
            <div class="card">
                <img src="${musica.capa}" onerror="this.src='https://placehold.co/300x300?text=Capa'">
                <p>${musica.titulo}</p>
            </div>
        `;

        albuns.innerHTML += `
            <div class="card">
                <img src="${musica.capa}" onerror="this.src='https://placehold.co/300x300?text=Album'">
                <p>${musica.album}</p>
            </div>
        `;

        listaMusicas.innerHTML += `
            <div class="musica">
                <div>
                    <strong>${musica.titulo}</strong><br>
                    <small>${musica.artista}</small>
                </div>

                <button onclick="tocar('${musica.audio}','${musica.titulo}','${musica.artista}')">
                    ▶
                </button>
            </div>
        `;

    });

});

function tocar(audio,titulo,artista){

    alert("Em breve o player tocará: " + titulo);

}
