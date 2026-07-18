const secaoFavoritos = document.getElementById("secaoFavoritos");
const favoritosHorizontal = document.getElementById("favoritosHorizontal");
const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

let musicas = [];
let filtroAtivo = null;

// Carrega as músicas do JSON
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
    carregarRanking();

    // INICIALIZAÇÃO DO PLAYER: Chama a função assim que os dados estão prontos!
    if (typeof inicializarPlayerComTop1 === "function") {
        inicializarPlayerComTop1();
    }
})
.catch(err => console.error("Erro ao carregar músicas:", err));


// Renderiza a tela principal
function carregarTela() {
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");

    const titulo = document.getElementById("tituloListaMusicas");
    if (titulo) titulo.textContent = "Adicionados recentemente";

    if (albuns) albuns.innerHTML = "";
    if (listaMusicas) listaMusicas.innerHTML = "";

    // 1. Renderiza os Favoritos horizontais
    renderizarFavoritosHorizontais();

    // 2. Renderiza o histórico real de 3 músicas
    renderizarUltimasOuvidas();
    
    // 3. Renderiza a seção de "Adicionados Recentemente" (as 3 últimas criadas no JSON)
    const ultimasAdicionadas = [...musicas].slice(-3).reverse(); 
    
    ultimasAdicionadas.forEach((musica) => {
        const indexOriginal = musicas.findIndex(m => m.audio === musica.audio);
        if (listaMusicas) {
            renderizarItemMusica(musica, indexOriginal, listaMusicas);
        }
    });

    // 4. Renderiza a Navegação por Álbum (Mostra a capa padrão do Álbum)
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

// Renderiza o histórico de reprodução
function renderizarUltimasOuvidas() {
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

        // Gera o caminho da capa individual da música de forma dinâmica
        const capaMusica = typeof obterCapaMusica === "function" ? obterCapaMusica(musica) : "assets/icons/album.svg";

        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${indexOriginal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${capaMusica}" onerror="this.src='${musica.capa || 'assets/icons/album.svg'}'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });
}

// Renderiza o item de música da lista vertical de adicionados recentemente (com a capa da música!)
function renderizarItemMusica(musica, index, container) {
    // Gera o caminho da capa individual de forma dinâmica
    const capaMusica = typeof obterCapaMusica === "function" ? obterCapaMusica(musica) : "assets/icons/album.svg";

    container.innerHTML += `
    <div class="musica">
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${capaMusica}" onerror="this.src='${musica.capa || 'assets/icons/album.svg'}'" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
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

// Renderiza os Favoritos horizontais (com a capa da música!)
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

        const capaMusica = typeof obterCapaMusica === "function" ? obterCapaMusica(musica) : "assets/icons/album.svg";

        favoritosHorizontal.innerHTML += `
        <div class="card" onclick="tocar(${indexReal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${capaMusica}" onerror="this.src='${musica.capa || 'assets/icons/album.svg'}'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
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
let instaladorPrompt;
const btnInstalar = document.getElementById('seu-botao-de-instalar');

// O navegador avisa que o app preenche os requisitos para ser instalado
/*
window.addEventListener('beforeinstallprompt', (e) => {
    // Impede o prompt padrão do navegador de subir sozinho
    e.preventDefault();
    // Guarda o evento para usar no clique do botão
    instaladorPrompt = e;
    // Faz o botão "Instalar" aparecer no seu menu inferior
    if (btnInstalar) {
        btnInstalar.style.display = 'flex'; // Usando 'flex' para manter o alinhamento da navbar
    }
}); */
// O navegador avisa que o app pode ser instalado
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    instaladorPrompt = e;
    
    if (btnInstalar) {
        // Faz o botão aparecer
        btnInstalar.style.display = 'flex'; 
        // Adiciona a classe 'active' para ele ficar Dourado igual à casinha
        btnInstalar.classList.add('active'); 
    }
});

// Quando o usuário clicar em "Instalar" na sua barra inferior
if (btnInstalar) {
    btnInstalar.addEventListener('click', async (e) => {
        e.preventDefault(); // Evita qualquer comportamento padrão
        
        if (instaladorPrompt) {
            // Abre a janelinha oficial de instalação do sistema
            instaladorPrompt.prompt();
            // Verifica se o usuário aceitou ou cancelou
            const { outcome } = await instaladorPrompt.userChoice;
            console.log(`Escolha do usuário: ${outcome}`);
            // Limpa o prompt para uso futuro
            instaladorPrompt = null;
            // Esconde o botão após a ação
            btnInstalar.style.display = 'none';
        }
    });
}

// Se o aplicativo já estiver instalado no celular, garante que o botão suma
window.addEventListener('appinstalled', () => {
    if (btnInstalar) {
        btnInstalar.style.display = 'none';
    }
    console.log('App instalado com sucesso e adicionado à tela de início!');
});
