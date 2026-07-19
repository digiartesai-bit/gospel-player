// ==========================================================================
// RECURSO 1: LIBERDADE DE REPRODUÇÃO - CLIQUE E ARRASTE NO DESKTOP
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const carrosseis = document.querySelectorAll('#albuns, #continueOuvindo, #favoritosHorizontal');

    carrosseis.forEach(slider => {
        if (!slider) return;

        slider.addEventListener('dragstart', (e) => e.preventDefault());
        slider.querySelectorAll('*').forEach(el => {
            el.addEventListener('dragstart', (e) => e.preventDefault());
        });

        slider.addEventListener('mousedown', (e) => {
            slider.style.cursor = 'grabbing';
            let startX = e.pageX - slider.offsetLeft;
            let scrollLeft = slider.scrollLeft;

            const aoMoverMouse = (moveEvent) => {
                const x = moveEvent.pageX - slider.offsetLeft;
                const movimento = (x - startX) * 2; 
                slider.scrollLeft = scrollLeft - movimento;
            };

            const aoSoltarMouse = () => {
                slider.style.cursor = 'grab';
                document.removeEventListener('mousemove', aoMoverMouse);
                document.removeEventListener('mouseup', aoSoltarMouse);
            };

            document.addEventListener('mousemove', aoMoverMouse);
            document.addEventListener('mouseup', aoSoltarMouse);
        });
    });
});

// ==========================================================================
// RECURSO 2: COMPARTILHAR MÚSICA COM LINK DIRETO PARA O PLAYER
// ==========================================================================
function compartilharMusicaAtual() {
    const titulo = document.getElementById("miniTitulo")?.textContent || "";
    const artista = document.getElementById("miniArtista")?.textContent || "AdoraPlay";
    
    if (!titulo) return; 

    const baseUrl = "https://digiartesai-bit.github.io/adora-play/";
    const urlAppComMusica = `${baseUrl}?musica=${encodeURIComponent(titulo)}`;
    const textoMensagem = `Ouça "${titulo}" de ${artista} no AdoraPlay! 🎶`;

    // Função interna para o Plano B (WhatsApp Web/API)
    const abrirWhatsAppComoFallback = () => {
        const textoCompleto = encodeURIComponent(`${textoMensagem}\n\n${urlAppComMusica}`);
        const urlWhatsapp = `https://api.whatsapp.com/send?text=${textoCompleto}`;
        window.open(urlWhatsapp, '_blank');
    };

    if (navigator.share) {
        navigator.share({
            title: 'AdoraPlay',
            text: textoMensagem,
            url: urlAppComMusica
        })
        .then(() => console.log('Compartilhado com sucesso!'))
        .catch((error) => {
            console.log('Nativo falhou ou cancelado, abrindo WhatsApp...', error);
            // 🔥 Se o nativo falhar (AbortError), ele abre o WhatsApp imediatamente!
            abrirWhatsAppComoFallback();
        });
    } else {
        abrirWhatsAppComoFallback();
    }
}
// ==========================================================================
// RECURSO 3: EXIBIR E ATUALIZAR FAVORITOS (GLOBAL)
// ==========================================================================
window.renderizarFavoritosHorizontais = function() {
    const secaoFavoritos = document.getElementById("secaoFavoritos");
    const favoritosHorizontal = document.getElementById("favoritosHorizontal");
    
    if (!secaoFavoritos || !favoritosHorizontal) return;

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || []; // Ajuste para 'favoritos' se for o caso no seu banco

    if (favoritos.length === 0) {
        secaoFavoritos.style.display = "none";
        return;
    }

    secaoFavoritos.style.display = "block";
    favoritosHorizontal.innerHTML = "";

    // Como a lista global de músicas fica no app.js, usamos window.playlist para descobrir o index real
    const listaDeMusicas = window.playlist || [];

    favoritos.forEach((musica) => {
        let indexReal = listaDeMusicas.findIndex(m => m.audio === musica.audio);
        if (indexReal === -1) indexReal = 0;

        const capaMusica = typeof obterCapaMusica === "function" ? obterCapaMusica(musica) : "assets/icons/album.svg";

        favoritosHorizontal.innerHTML += `
        <div class="card" onclick="tocar(${indexReal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${capaMusica}" onerror="this.src='${musica.capa || 'assets/icons/album.svg'}'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });
};
