const secaoFavoritos = document.getElementById("secaoFavoritos");
const favoritosHorizontal = document.getElementById("favoritosHorizontal");
const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

// Configuração da API do Cloudflare
const API_URL = "https://aged-pine-6b20.digiartesai.workers.dev";

let musicas = [];
let filtroAtivo = null;

// Carrega as músicas inicialmente do JSON
fetch("musicas.json")
.then(response => response.json())
.then(data => {
    musicas = data;
    
    if (typeof carregarPlaylist === "function") {
        carregarPlaylist(musicas);
    } else {
        window.playlist = musicas;
    }
    
    carregarTela();
})
.catch(err => console.error("Erro ao carregar músicas:", err));


// Renderiza os dados iniciais na tela
function carregarTela() {
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");

    const titulo = document.getElementById("tituloListaMusicas");
    if (titulo) titulo.textContent = "Adicionados recentemente";

    if (albuns) albuns.innerHTML = "";
    if (listaMusicas) listaMusicas.innerHTML = "";

    // 1. Renderiza a seção "Mais Ouvidas" vinda do Cloudflare KV
    renderizarMaisOuvidas();

    // 2. Renderiza os Favoritos horizontais
    renderizarFavoritosHorizontais();

    // 3. Renderiza o histórico de 3 músicas "Continue Ouvindo"
    renderizarContinueOuvindo();

    // 4. Renderiza a seção de "Adicionados Recentemente" (as 3 últimas músicas do JSON)
    const ultimasAdicionadas = [...musicas].slice(-3).reverse(); 
    
    ultimasAdicionadas.forEach((musica) => {
        const indexOriginal = musicas.findIndex(m => m.audio === musica.audio);
        if (listaMusicas) {
            renderizarItemMusica(musica, indexOriginal, listaMusicas);
        }
    });

    // 5. Renderiza os Álbuns baseados em todas as músicas
    const albunsAdicionados = new Set();
    musicas.forEach((musica) => {
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
    });
}

// Renderiza o Ranking Global puxado do Cloudflare KV
function renderizarMaisOuvidas() {
    const secaoMaisOuvidas = document.getElementById("secaoMaisOuvidas");
    const maisOuvidas = document.getElementById("maisOuvidas");
    if (!maisOuvidas) return;

    fetch(`${API_URL}/ranking`)
        .then(res => res.json())
        .then(rankingGlobal => {
            if (!rankingGlobal || rankingGlobal.length === 0) {
                if (secaoMaisOuvidas) secaoMaisOuvidas.style.display = "none";
                return;
            }

            if (secaoMaisOuvidas) secaoMaisOuvidas.style.display = "block";
            maisOuvidas.innerHTML = "";

            // Seleciona no máximo as 3 mais tocadas
            const top3 = rankingGlobal.slice(0, 3);

            top3.forEach((itemDoRanking) => {
                const musicaOriginal = musicas.find(m => m.audio === itemDoRanking.audio);
                if (musicaOriginal) {
                    const indexOriginal = musicas.findIndex(m => m.audio === musicaOriginal.audio);
                    
                    // Prioriza capa_musica (capa individual), cai de volta para capa (álbum)
                    const imagemCapa = musicaOriginal.capa_musica || musicaOriginal.capa || 'assets/icons/album.svg';

                    maisOuvidas.innerHTML += `
                    <div class="card" onclick="tocar(${indexOriginal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top; position: relative;">
                        <!-- Selo de play dourado moderno com contagem total de execuções -->
                        <span style="position: absolute; top: 5px; right: 5px; background: rgba(8, 24, 38, 0.95); color: #d4af37; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px; border: 1px solid #d4af37; box-shadow: 0px 2px 4px rgba(0,0,0,0.5); z-index: 10;">
                            ${itemDoRanking.quantidade} ▶
                        </span>
                        <div style="width: 100px; height: 100px; border-radius: 8px; overflow: hidden; position: relative;">
                            <img src="${imagemCapa}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; display: block;">
                        </div>
                        <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musicaOriginal.titulo}</p>
                    </div>`;
                }
            });
        })
        .catch(err => {
            console.error("Erro ao puxar o ranking global:", err);
            if (secaoMaisOuvidas) secaoMaisOuvidas.style.display = "none";
        });
}

// Renderiza a lista de 3 itens no "Continue Ouvindo"
function renderizarContinueOuvindo() {
    const secaoContinue = document.getElementById("secaoContinue") || document.querySelector(".continue-ouvindo");
    if (!continueOuvindo) return;

    const historico = JSON.parse(localStorage.getItem('historico_adoraplay')) || [];

    if (historico.length === 0) {
        if (secaoContinue) secaoContinue.style.display = "none";
        return;
    }

    if (secaoContinue) secaoContinue.style.display = "block";
    continueOuvindo.innerHTML = "";

    historico.forEach((musica) => {
        let indexOriginal = musicas.findIndex(m => m.audio === musica.audio);
        if (indexOriginal === -1) indexOriginal = 0;

        const imagemCapa = musica.capa_musica || musica.capa || 'assets/icons/album.svg';

        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${indexOriginal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${imagemCapa}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });
}

// Renderiza o item de música da lista vertical de adicionados recentemente
function renderizarItemMusica(musica, index, container) {
    const imagemCapa = musica.capa_musica || musica.capa || 'assets/icons/album.svg';
    container.innerHTML += `
    <div class="musica">
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${imagemCapa}" onerror="this.src='assets/icons/album.svg'" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
            <div>
                <strong>${musica.titulo}</strong><br>
                <small>${musica.artista}</small>
            </div>
        </div>
        <button onclick="tocar(${index})">
            <img src="assets/icons/play.svg" alt="Tocar" width="16" height="16">
        </button>
    </div>`;
}

// Renderiza os Favoritos horizontais
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
        let indexReal = musicas.findIndex(m => m.audio === musica.audio);
        if (indexReal === -1) indexReal = 0;

        const imagemCapa = musica.capa_musica || musica.capa || 'assets/icons/album.svg';

        favoritosHorizontal.innerHTML += `
        <div class="card" onclick="tocar(${indexReal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${imagemCapa}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });
}

// Filtra por álbum ao clicar na seção de álbuns
function filtrarPorAlbum(nomeAlbum) {
    const titulo = document.getElementById("tituloListaMusicas");
    if (!listaMusicas) return;
    listaMusicas.innerHTML = "";

    if (filtroAtivo === nomeAlbum) {
        filtroAtivo = null;
        if (titulo) titulo.textContent = "Adicionados recentemente";
        
        const ultimasAdicionadas = [...musicas].slice(-3).reverse();
        ultimasAdicionadas.forEach((musica) => {
            const indexOriginal = musicas.findIndex(m => m.audio === musica.audio);
            renderizarItemMusica(musica, indexOriginal, listaMusicas);
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
