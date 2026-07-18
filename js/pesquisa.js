// Variável global para armazenar os dados vindos do JSON
let catalogoMusicas = [];

/**
 * Carrega os dados do arquivo JSON de músicas
 */
async function inicializarPesquisa() {
    try {
        // Altere o caminho abaixo para o local exato do seu arquivo .json
        const response = await fetch('musicas.json'); 
        catalogoMusicas = await response.json();
        
        // Carrega todas as músicas na tela logo ao abrir o app
        renderizarResultados(catalogoMusicas);
    } catch (error) {
        console.error("Erro ao carregar o arquivo JSON de músicas:", error);
    }
}

/**
 * Remove acentos, caracteres especiais e espaços extras para facilitar a busca
 */
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Função principal disparada a cada letra digitada no input
 */
function filtrarMusicas() {
    const inputBusca = document.getElementById('search-input');
    if (!inputBusca) return;

    const termoFormatado = normalizarTexto(inputBusca.value);

    // Se o campo estiver vazio, exibe o catálogo completo novamente
    if (termoFormatado === "") {
        renderizarResultados(catalogoMusicas);
        return;
    }

    // Filtra procurando por Título, Álbum ou Categoria
    const resultadosFiltrados = catalogoMusicas.filter(musica => {
        const titulo = normalizarTexto(musica.titulo);
        const album = normalizarTexto(musica.album);
        const categoria = normalizarTexto(musica.categoria);

        return titulo.includes(termoFormatado) || 
               album.includes(termoFormatado) || 
               categoria.includes(termoFormatado);
    });

    renderizarResultados(resultadosFiltrados);
}

/**
 * Monta o HTML dos cards de música dinamicamente na tela
 */
function renderizarResultados(lista) {
    const container = document.getElementById('lista-musicas');
    if (!container) return;

    container.innerHTML = ""; // Limpa a lista atual

    // Se a busca não retornar nada
    if (lista.length === 0) {
        container.innerHTML = `<p class="sem-resultado">Nenhum louvor encontrado com esse termo 🤷</p>`;
        return;
    }

    // Cria o HTML baseado exatamente na estrutura do seu JSON
    lista.forEach(musica => {
        const card = document.createElement('div');
        card.className = 'musica-card';
        
        // Vincula o clique ao player (ajuste o nome da sua função global de dar play aqui)
        if (typeof tocarMusica === "function") {
            card.onclick = () => tocarMusica(musica);
        }

        card.innerHTML = `
            <div class="capa-wrapper">
                <img src="${musica.capa_musica}" alt="${musica.titulo}" class="capa-resultado" onerror="this.src='assets/capas/default.jpg'">
            </div>
            <div class="musica-info">
                <h3>${musica.titulo}</h3>
                <p>${musica.artista} • ${musica.album}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Executa a carga inicial assim que o arquivo script for interpretado
document.addEventListener('DOMContentLoaded', inicializarPesquisa);
