const secaoFavoritos = document.getElementById("secaoFavoritos");
const favoritosHorizontal = document.getElementById("favoritosHorizontal");
const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

let musicas = [];
let filtroAtivo = null;

// Carrega as músicas inicialmente com garantia de sincronia
fetch("musicas.json")
.then(response => response.json())
.then(data => {
    musicas = data;
    
    // Tenta carregar na playlist global do player.js
    if (typeof carregarPlaylist === "function") {
        carregarPlaylist(musicas);
    } else {
        // Se o player.js demorou a carregar, define uma propriedade global temporária
        window.playlist = musicas;
    }
    
    carregarTela();
})
.catch(err => console.error("Erro ao carregar músicas:", err));


// Renderiza a tela inicial padrão com os Favoritos horizontais
function carregarTela() {
    // Garante que todas as seções voltem a aparecer
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");

    const titulo = document.getElementById("tituloListaMusicas");
    if (titulo) titulo.textContent = "Adicionados recentemente";

    if (continueOuvindo) continueOuvindo.innerHTML = "";
    if (albuns) albuns.innerHTML = "";
    if (listaMusicas) listaMusicas.innerHTML = "";

    // Renderiza os Favoritos de forma Horizontal
    renderizarFavoritosHorizontais();

    const albunsAdicionados = new Set();

    musicas.forEach((musica, index) => {
        // Continue Ouvindo (Cards das Músicas)
        if (continueOuvindo) {
            continueOuvindo.innerHTML += `
            <div class="card" onclick="tocar(${index})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
                <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
                <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
            </div>`;
        }

        // Seção de Álbuns (Cards dos Álbuns)
        if (musica.album && !albunsAdicionados.has(musica.album)) {
            albunsAdicionados.add(musica.album);
            
            if (albuns) {
                albuns.innerHTML += `
                <div class="card" onclick="filtrarPorAlbum('${musica.album}')" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
                    <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; display: block;">
                    <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.album}</p>
                </div>`;
            }
        }

        // Adicionados Recentemente (Lista Vertical)
        if (listaMusicas) {
            renderizarItemMusica(musica, index, listaMusicas);
        }
    });
}

// Renderiza a linha de música na lista vertical
function renderizarItemMusica(musica, index, container) {
    container.innerHTML += `
    <div class="musica">
        <div>
            <strong>${musica.titulo}</strong><br>
            <small>${musica.artista}</small>
        </div>
        <button onclick="tocar(${index})">
            <img src="assets/icons/play.svg" alt="Tocar" width="16" height="16">
        </button>
    </div>`;
}

// Renderiza a seção horizontal de favoritos apenas se houver itens favoritados
function renderizarFavoritosHorizontais() {
    if (!secaoFavoritos || !favoritosHorizontal) return;

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.length === 0) {
        secaoFavoritos.style.display = "none";
        return;
    }

    secaoFavoritos.style.display = "block";
    favoritosHorizontal.innerHTML = "";

    favoritos.forEach((musica) => {
        let indexReal = musicas.findIndex(m => m.titulo.trim() === musica.titulo.trim());
        if (indexReal === -1) indexReal = 0;

        favoritosHorizontal.innerHTML += `
        <div class="card" onclick="tocar(${indexReal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });
}

// Filtra por Álbum na lista vertical de baixo
function filtrarPorAlbum(nomeAlbum) {
    const titulo = document.getElementById("tituloListaMusicas");
    if (!listaMusicas) return;
    listaMusicas.innerHTML = "";

    if (filtroAtivo === nomeAlbum) {
        filtroAtivo = null;
        if (titulo) titulo.textContent = "Adicionados recentemente";
        musicas.forEach((musica, index) => {
            renderizarItemMusica(musica, index, listaMusicas);
        });
        return;
    }

    filtroAtivo = nomeAlbum;
    if (titulo) titulo.textContent = `Músicas de: ${nomeAlbum}`;

    musicas.forEach((musica, index) => {
        if (musica.album === nomeAlbum) {
            renderizarItemMusica(musica, index, listaMusicas);
        }
    });
}
