const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

let musicas = [];

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
    // Mostra as seções que o favoritos pode ter escondido
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");
    document.querySelector(".secao h3").parentElement.style.display = "block"; // garante que tudo apareça

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

        // Seção de Álbuns
        if (musica.album && !albunsAdicionados.has(musica.album)) {
            albunsAdicionados.add(musica.album);
            albuns.innerHTML += `
            <div class="card">
                <img src="${musica.capa || 'assets/icons/album.svg'}" onerror="this.src='assets/icons/album.svg'">
                <p>${musica.album}</p>
            </div>`;
        }

        // Adicionados Recentemente
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

// Renderiza a lista de Favoritos na tela
function carregarFavoritosNaTela() {
    // Esconde as seções que não pertencem aos favoritos
    continueOuvindo.parentElement.style.display = "none"; 
    albuns.parentElement.style.display = "none";
    
    // Altera o título da seção final para marcar "Favoritos"
    const tituloSecao = listaMusicas.parentElement.querySelector("h3");
    if (tituloSecao) tituloSecao.textContent = "Meus Favoritos";

    listaMusicas.innerHTML = "";
    
    // Busca a lista atualizada do localStorage na hora do clique!
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.length === 0) {
        listaMusicas.innerHTML = "<p style='color: #a0a0a0; padding: 15px;'>Você ainda não favoritou nenhuma música.</p>";
        return;
    }

    favoritos.forEach((musica) => {
        // Busca o índice real com base no título (removendo espaços extras para segurança)
        let indexReal = musicas.findIndex(m => m.titulo.trim() === musica.titulo.trim());

        // Se por acaso não achar o índice (música antiga ou erro), usa o primeiro índice como fallback
        if (indexReal === -1) {
            indexReal = 0;
        }

        listaMusicas.innerHTML += `
        <div class="musica">
            <div>
                <strong>${musica.titulo}</strong><br>
                <small>${musica.artista}</small>
            </div>
            <button onclick="tocar(${indexReal})">
                <img src="assets/icons/play.svg" alt="Tocar" width="16" height="16">
            </button>
        </div>`;
    });
}

// Configuração de cliques no menu inferior para navegar pelas abas
document.addEventListener("DOMContentLoaded", () => {
    const botoesMenu = document.querySelectorAll(".menu button");

    botoesMenu.forEach(botao => {
        const texto = botao.querySelector("span").textContent.trim();

        if (texto === "Início") {
            botao.addEventListener("click", () => {
                const tituloSecao = listaMusicas.parentElement.querySelector("h3");
                if (tituloSecao) tituloSecao.textContent = "Adicionados recentemente";
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
