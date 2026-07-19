const secaoFavoritos = document.getElementById("secaoFavoritos");
const favoritosHorizontal = document.getElementById("favoritosHorizontal");
const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

let musicas = [];
let filtroAtivo = null;

// ==========================================================================
// 1. CARREGAMENTO DOS DADOS (JSON) E SELEÇÃO DE MÚSICA COMPARTILHADA
// ==========================================================================
fetch("musicas.json")
.then(response => response.json())
.then(data => {
    musicas = data;
    window.musicas = data; // Torna a lista visível para outros scripts (como o recursos.js)
    
    if (typeof carregarPlaylist === "function") {
        carregarPlaylist(musicas);
    } else {
        window.playlist = musicas;
    }
    
    carregarTela();

    // INICIALIZAÇÃO DO PLAYER: Chama a função assim que os dados estão prontos!
    if (typeof inicializarPlayerComTop1 === "function") {
        inicializarPlayerComTop1();
    }

    // 🔥 VERIFICA SE O APP FOI ABERTO COM UMA MÚSICA COMPARTILHADA NO LINK
    const urlParams = new URLSearchParams(window.location.search);
    const musicaParaTocar = urlParams.get('musica');

    if (musicaParaTocar) {
        // Encontra o índice da música correspondente na lista que acabou de baixar
        const indexMusica = musicas.findIndex(m => m.titulo === musicaParaTocar);
        
        // Se a música for encontrada no banco de dados, dá o play automático!
        if (indexMusica !== -1 && typeof tocar === "function") {
            setTimeout(() => {
                tocar(indexMusica);
            }, 500); // Meio segundo de atraso para garantir que a interface está pronta
        }
    }
})
.catch(err => console.error("Erro ao carregar músicas:", err));


// ==========================================================================
// 2. FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE (UI)
// ==========================================================================
function carregarTela() {
    document.querySelectorAll(".secao").forEach(sec => sec.style.display = "block");

    const titulo = document.getElementById("tituloListaMusicas");
    if (titulo) titulo.textContent = "Adicionados recentemente";

    if (albuns) albuns.innerHTML = "";
    if (listaMusicas) listaMusicas.innerHTML = "";

    // Chama a renderização de favoritos com 500ms de atraso para garantir
    // que todo o HTML/JSON esteja assentado e o recursos.js desenhe firme na tela
    setTimeout(() => {
        if (typeof window.renderizarFavoritosHorizontais === "function") {
            window.renderizarFavoritosHorizontais();
        }
    }, 500);

    renderizarUltimasOuvidas();
    
    // Renderiza a seção de "Adicionados Recentemente" (as 3 últimas criadas no JSON)
    const ultimasAdicionadas = [...musicas].slice(-3).reverse(); 
    
    ultimasAdicionadas.forEach((musica) => {
        const indexOriginal = musicas.findIndex(m => m.audio === musica.audio);
        if (listaMusicas) {
            renderizarItemMusica(musica, indexOriginal, listaMusicas);
        }
    });

    // Renderiza a Navegação por Álbum
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

        const capaMusica = typeof obterCapaMusica === "function" ? obterCapaMusica(musica) : "assets/icons/album.svg";

        continueOuvindo.innerHTML += `
        <div class="card" onclick="tocar(${indexOriginal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${capaMusica}" onerror="this.src='${musica.capa || 'assets/icons/album.svg'}'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });
}

// RENDERIZAÇÃO DOS ITENS DA LISTA (Com clique exclusivo no botão Play)
function renderizarItemMusica(musica, index, container) {
    const capaMusica = typeof obterCapaMusica === "function" ? obterCapaMusica(musica) : "assets/icons/album.svg";

    // 🔴 IMPORTANTE: A div PAI NÃO possui 'onclick' ou 'cursor: pointer'
    container.innerHTML += `
    <div class="card-lancamento" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; margin-bottom: 15px;">
        
    container.innerHTML += `
    <div style="display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 16px; cursor: default;">
             
        <img src="${musica.capa_musica || musica.capa}" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover;">
        <div style="flex: 1;">
            <h4 style="margin: 0; color: #fff; font-size: 16px;">${musica.titulo}</h4>
            <p style="margin: 3px 0 0; color: #94a3b8; font-size: 13px;">${musica.artista}</p>
        </div>

       <button onclick='tocarEstaMusica(${JSON.stringify(musica)})' style="background: #D4AF37; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <img src="assets/icons/play.svg" width="12" height="12" style="filter: brightness(0); margin-left: 2px; pointer-events: none;">
        </button>

    </div>
`;
}

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
// 3. CONTROLE DA TELA VIRTUAL DE LANÇAMENTOS DA SEMANA
// ==========================================================================
let idMusicaLancamento = null;

function abrirTelaLancamentos() {
    const banner = document.querySelector(".banner");
    const telaLancamentos = document.getElementById("telaLancamentos");
    const secoesHome = document.querySelectorAll(".secao");

    // Esconde a Home/Banner e abre a Tela de Lançamentos
    if (banner) banner.style.display = "none";
    secoesHome.forEach(sec => sec.style.display = "none");
    if (telaLancamentos) telaLancamentos.style.display = "block";

    // Pega a última música cadastrada no JSON como Lançamento da Semana
    if (musicas && musicas.length > 0) {
        idMusicaLancamento = musicas.length - 1; 
        const lancamento = musicas[idMusicaLancamento];

        const elTitulo = document.getElementById("lancamentoTitulo");
        const elArtista = document.getElementById("lancamentoArtista");
        const elCapa = document.getElementById("lancamentoCapa");

        if (elTitulo) elTitulo.textContent = lancamento.titulo;
        if (elArtista) elArtista.textContent = lancamento.artista;
        if (elCapa) {
            const capa = typeof obterCapaMusica === "function" ? obterCapaMusica(lancamento) : (lancamento.capa_musica || lancamento.capa || "assets/icons/album.svg");
            elCapa.src = capa;
        }
    }
}

function tocarLancamento() {
    if (idMusicaLancamento !== null && typeof tocar === "function") {
        tocar(idMusicaLancamento);
    }
}

function voltarParaHome() {
    const banner = document.querySelector(".banner");
    const telaLancamentos = document.getElementById("telaLancamentos");

    // Oculta tela de lançamentos e restaura a navegação principal
    if (telaLancamentos) telaLancamentos.style.display = "none";
    if (banner) banner.style.display = "block";

    carregarTela();
}


// ==========================================================================
// 4. INSTALAÇÃO DO PROMPT DO PWA (CONFIGURAÇÃO SECUNDÁRIA)
// ==========================================================================
let instaladorPrompt;
const btnInstalar = document.getElementById('seu-botao-de-instalar');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    instaladorPrompt = e;
    if (btnInstalar) {
        btnInstalar.style.display = 'flex';
    }
});

if (btnInstalar) {
    btnInstalar.addEventListener('click', async (e) => {
        e.preventDefault();
        if (instaladorPrompt) {
            instaladorPrompt.prompt();
            const { outcome } = await instaladorPrompt.userChoice;
            console.log(`Escolha do usuário: ${outcome}`);
            instaladorPrompt = null;
            btnInstalar.style.display = 'none';
        }
    });
}

window.addEventListener('appinstalled', () => {
    if (btnInstalar) {
        btnInstalar.style.display = 'none';
    }
    console.log('App instalado com sucesso e adicionado à tela de início!');
});
