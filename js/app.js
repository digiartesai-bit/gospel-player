const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");
const tituloListaMusicas = document.getElementById("tituloListaMusicas");

let musicas = [];
let filtroAtivo = null; // Guarda qual álbum/categoria está filtrado no momento

// Carrega as músicas inicialmente
fetch("musicas.json")
.then(response => response.json())
.then(data => {
    musicas = data;
    carregarPlaylist(musicas);
    carregarTela();
})
.catch(err => console.error("Erro ao carregar músicas:", err));

// Renderiza a tela inicial padrão
function carregarTela() {
    // Mostra as seções que o favoritos ou filtros podem ter escondido
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");
    if (tituloListaMusicas) tituloListaMusicas.textContent = "Adicionados recentemente";

    continueOuvindo.innerHTML = "";
    albuns.innerHTML = "";
    listaMusicas.innerHTML = "";

    const albunsAdicionados = new Set();

    musicas.forEach((musica, index) => {
        // Continue Ouvindo
        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${index})">
            <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'">
            <p>${musica.titulo}</p>
        </div>`;

        // Seção de Álbuns Única (Gera os cards clicáveis)
        if (musica.album && !albunsAdicionados.has(musica.album)) {
            albunsAdicionados.add(musica.album);
            
            // Criamos um elemento div para podermos adicionar o evento de clique de forma limpa
            const cardAlbum = document.createElement("div");
            cardAlbum.className = "card";
            cardAlbum.style.cursor = "pointer";
            cardAlbum.innerHTML = `
                <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'">
                <p>${musica.album}</p>
            `;
            // Ao clicar no card do Álbum, filtra as músicas abaixo!
            cardAlbum.addEventListener("click", () => filtrarPorAlbum(musica.album));
            albuns.appendChild(cardAlbum);
        }

        // Adicionados Recentemente (Lista completa inicial)
        renderizarItemMusica(musica, index, listaMusicas);
    });
}

// Função auxiliar para renderizar a linha da música
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

// Filtra a lista de baixo para mostrar apenas as músicas do álbum clicado
function filtrarPorAlbum(nomeAlbum) {
    // Se clicar no mesmo álbum que já está filtrado, desativa o filtro e mostra tudo
    if (filtroAtivo === nomeAlbum) {
        filtroAtivo = null;
        tituloListaMusicas.textContent = "Adicionados recentemente";
        listaMusicas.innerHTML = "";
        musicas.forEach((musica, index) => {
            renderizarItemMusica(musica, index, listaMusicas);
        });
        return;
    }

    filtroAtivo = nomeAlbum;
    tituloListaMusicas.textContent = `Músicas de: ${nomeAlbum}`;
    listaMusicas.innerHTML = "";

    musicas.forEach((musica, index) => {
        if (musica.album === nomeAlbum) {
            renderizarItemMusica(musica, index, listaMusicas);
        }
    });

    // Rola a tela suavemente para a lista de músicas filtradas
    listaMusicas.scrollIntoView({ behavior: 'smooth' });
}

// Renderiza a lista de Favoritos na tela
function carregarFavoritosNaTela() {
    // Esconde os blocos que não pertencem aos favoritos
    continueOuvindo.parentElement.style.display = "none"; 
    albuns.parentElement.style.display = "none";
    
    if (tituloListaMusicas) tituloListaMusicas.textContent = "Meus Favoritos";
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

// Configuração de cliques no menu inferior para navegar pelas abas
document.addEventListener("DOMContentLoaded", () => {
    const botoesMenu = document.querySelectorAll(".menu button");

    botoesMenu.forEach(botao => {
        const texto = botao.querySelector("span").textContent.trim();

        if (texto === "Início") {
            botao.addEventListener("click", () => {
                filtroAtivo = null; // reseta filtros ao voltar para o início
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
