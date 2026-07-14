const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");
const tituloListaMusicas = document.getElementById("tituloListaMusicas");

let musicas = [];
let filtroAtivo = null;

// Carrega as músicas inicialmente
fetch("musicas.json")
.then(response => response.json())
.then(data => {
    musicas = data;
    carregarPlaylist(musicas);
    carregarTela();
})
.catch(err => console.error("Erro ao carregar músicas:", err));

// Renderiza a tela inicial padrão com suporte às novas capas dos álbuns
function carregarTela() {
    // Garante que todas as seções voltem a aparecer
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");
    
    // Altera o título da lista se o elemento existir
    const titulo = document.getElementById("tituloListaMusicas") || document.querySelector(".secao h3:last-of-type");
    if (titulo) titulo.textContent = "Adicionados recentemente";

    continueOuvindo.innerHTML = "";
    albuns.innerHTML = "";
    listaMusicas.innerHTML = "";

    const albunsAdicionados = new Set();

    musicas.forEach((musica, index) => {
        // Continue Ouvindo (Card Individual da Música com sua respectiva capa)
        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${index})" style="cursor: pointer;">
            <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'">
            <p>${musica.titulo}</p>
        </div>`;

        // Seção de Álbuns (Gera o card do Álbum com a capa da música que o representa)
        if (musica.album && !albunsAdicionados.has(musica.album)) {
            albunsAdicionados.add(musica.album);
            
            // Usamos a mesma capa definida na música para ilustrar o Álbum de forma automática!
            albuns.innerHTML += `
            <div class="card" onclick="filtrarPorAlbum('${musica.album}')" style="cursor: pointer;">
                <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'">
                <p>${musica.album}</p>
            </div>`;
        }

        // Adicionados Recentemente
        renderizarItemMusica(musica, index, listaMusicas);
    });
}

// Função para renderizar cada linha de música na lista
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

// Filtra as músicas da seção de baixo com base no álbum clicado
function filtrarPorAlbum(nomeAlbum) {
    console.log("Álbum clicado:", nomeAlbum); // Veja se isso aparece no seu console!

    const titulo = document.getElementById("tituloListaMusicas") || document.querySelector(".secao h3:last-of-type");
    listaMusicas.innerHTML = "";

    // Se clicar no mesmo álbum ativo, desativa o filtro e mostra todas as músicas de novo
    if (filtroAtivo === nomeAlbum) {
        filtroAtivo = null;
        if (titulo) titulo.textContent = "Adicionados recentemente";
        musicas.forEach((musica, index) => {
            renderizarItemMusica(musica, index, listaMusicas);
        });
        return;
    }

    // Caso contrário, ativa o filtro do álbum correspondente
    filtroAtivo = nomeAlbum;
    if (titulo) titulo.textContent = `Músicas de: ${nomeAlbum}`;

    musicas.forEach((musica, index) => {
        if (musica.album === nomeAlbum) {
            renderizarItemMusica(musica, index, listaMusicas);
        }
    });
}

// Renderiza a lista de Favoritos na tela
function carregarFavoritosNaTela() {
    continueOuvindo.parentElement.style.display = "none"; 
    albuns.parentElement.style.display = "none";
    
    const titulo = document.getElementById("tituloListaMusicas") || document.querySelector(".secao h3:last-of-type");
    if (titulo) titulo.textContent = "Meus Favoritos";
    
    listaMusicas.innerHTML = "";
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.length === 0) {
        listaMusicas.innerHTML = "<p style='color: #a0a0a0; padding: 15px;'>Você ainda não favoritou nenhuma música.</p>";
        return;
    }

    favoritos.forEach((musica) => {
        let indexReal = musicas.findIndex(m => m.titulo.trim() === musica.titulo.trim());
        if (indexReal === -1) indexReal = 0;

        renderizarItemMusica(musica, indexReal, listaMusicas);
    });
}

// Escuta os cliques no menu inferior
document.addEventListener("DOMContentLoaded", () => {
    const botoesMenu = document.querySelectorAll(".menu button");

    botoesMenu.forEach(botao => {
        const texto = botao.querySelector("span").textContent.trim();

        if (texto === "Início") {
            botao.addEventListener("click", () => {
                filtroAtivo = null;
                carregarTela();
            });
        } 
        else if (texto === "Favoritos") {
            botao.addEventListener("click", () => {
                carregarFavoritosNaTela();
            });
        }
    });
});
