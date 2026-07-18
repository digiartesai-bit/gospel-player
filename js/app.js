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
// ==========================================================================
// CONTROLE DE INSTALAÇÃO DO PWA (VERSÃO CORRIGIDA COM CLASSE CSS)
// ==========================================================================
let instaladorPrompt;
const btnInstalar = document.querySelector('.btn-instalar-topo');[span_1](start_span)[span_1](end_span)

// 1. Se já abrir dentro do app instalado, adiciona a classe para sumir na hora
if (window.matchMedia('(display-mode: standalone)').matches) {
    if (btnInstalar) btnInstalar.classList.add('esconder-btn');
}

// 2. O navegador avisa que o app pode ser instalado
window.addEventListener('beforeinstallprompt', (e) => {[span_2](start_span)[span_2](end_span)
    e.preventDefault();[span_3](start_span)[span_3](end_span)
    instaladorPrompt = e;[span_4](start_span)[span_4](end_span)
    
    // Remove a classe de esconder caso o prompt esteja ativo (por segurança)
    if (btnInstalar) {
        btnInstalar.classList.remove('esconder-btn');
    }
});

// 3. Quando o usuário clica no botão do topo
if (btnInstalar) {[span_5](start_span)[span_5](end_span)
    btnInstalar.addEventListener('click', async (e) => {[span_6](start_span)[span_6](end_span)
        e.preventDefault();[span_7](start_span)[span_7](end_span)
        
        if (instaladorPrompt) {[span_8](start_span)[span_8](end_span)
            instaladorPrompt.prompt();[span_9](start_span)[span_9](end_span)
            const { outcome } = await instaladorPrompt.userChoice;[span_10](start_span)[span_10](end_span)
            
            if (outcome === 'accepted') {
                btnInstalar.classList.add('esconder-btn'); // Adiciona a classe ao aceitar
            }
            instaladorPrompt = null;[span_11](start_span)[span_11](end_span)
        } else {
            alert(
                "Para instalar o AdoraPlay agora:\n\n" +
                "1. Toque nos 3 pontinhos (Menu) do seu navegador.\n" +
                "2. Procure pela opção 'Instalar aplicativo' ou 'Adicionar à tela inicial'.\n\n" +
                "Pronto! O app será adicionado ao seu celular."
            );
        }
    });
}

// 4. Garante que suma se a instalação for concluída com sucesso
window.addEventListener('appinstalled', () => {[span_12](start_span)[span_12](end_span)
    if (btnInstalar) {[span_13](start_span)[span_13](end_span)
        btnInstalar.classList.add('esconder-btn');
    }
    instaladorPrompt = null;
});

