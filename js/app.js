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

    // Criamos um Set para evitar renderizar álbuns duplicados na seção de Álbuns
    const albunsAdicionados = new Set();

    musicas.forEach((musica, index) => {
        // Continue Ouvindo (Cards das músicas)
        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${index})">
            <img src="${musica.capa}" 
                 onerror="this.src='assets/icons/album.svg'">
            <p>${musica.titulo}</p>
        </div>`;

        // Seção de Álbuns (Garante que cada álbum apareça apenas uma vez)
        if (!albunsAdicionados.has(musica.album)) {
            albunsAdicionados.add(musica.album);
            albuns.innerHTML += `
            <div class="card">
                <img src="${musica.capa}" 
                     onerror="this.src='assets/icons/album.svg'">
                <p>${musica.album}</p>
            </div>`;
        }

        // Adicionados Recentemente (Lista de músicas com o ícone play.svg)
        listaMusicas.innerHTML += `
        <div class="musica">
            <div>
                <strong>${musica.titulo}</strong><br>
                <small>${musica.artista}</small>
            </div>
            <button onclick="tocar(${index})">
                <img src="assets/icons/play.svg" alt="Tocar" width="16" height="16">
            </button>
        </div>`;
    });
}
