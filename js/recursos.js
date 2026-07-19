// ==========================================================================
// RECURSO 1: LIBERDADE DE REPRODUÇÃO - CLIQUE E ARRASTE NO DESKTOP (SEM TRAVAR CLIQUE)
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const carrosseis = document.querySelectorAll('#albuns, #continueOuvindo, #favoritosHorizontal, #maisOuvidas');

    carrosseis.forEach(slider => {
        if (!slider) return;

        let isDown = false;
        let startX, scrollLeft, foiArrasto = false;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            foiArrasto = false;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            if (Math.abs(walk) > 5) {
                foiArrasto = true; // Se moveu mais de 5px, considera arrasto e cancela clique
            }
            slider.scrollLeft = scrollLeft - walk;
        });

        // Evita abrir/tocar se foi apenas um movimento de arrasto
        slider.addEventListener('click', (e) => {
            if (foiArrasto) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    });
});

// ==========================================================================
// RECURSO 2: COMPARTILHAR MÚSICA COM LINK DIRETO PARA O PLAYER
// ==========================================================================
function compartilharMusicaAtual() {
    const titulo = document.getElementById("miniTitulo")?.textContent || "";
    const artista = document.getElementById("miniArtista")?.textContent || "AdoraPlay";
    
    if (!titulo || titulo === "Nenhuma música") return; 

    const baseUrl = "https://digiartesai-bit.github.io/adora-play/";
    const urlAppComMusica = `${baseUrl}?musica=${encodeURIComponent(titulo)}`;
    const textoMensagem = `Ouça "${titulo}" de ${artista} no AdoraPlay! 🎶`;

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
            abrirWhatsAppComoFallback();
        });
    } else {
        abrirWhatsAppComoFallback();
    }
}

// ==========================================================================
// RECURSO 3: EXIBIR E ATUALIZAR FAVORITOS (100% COMPATÍVEL COM MÚSICAS)
// ==========================================================================
window.renderizarFavoritosHorizontais = function() {
    const secaoFavoritos = document.getElementById("secaoFavoritos");
    const favoritosHorizontal = document.getElementById("favoritosHorizontal");
    
    if (!secaoFavoritos || !favoritosHorizontal) return;

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.length === 0) {
        secaoFavoritos.style.display = "none";
        return;
    }

    favoritosHorizontal.innerHTML = "";
    const listaDeMusicas = window.musicas || window.playlist || [];

    favoritos.forEach((musica) => {
        // Busca o index exato na lista global
        let indexReal = listaDeMusicas.findIndex(m => m.audio === musica.audio || m.titulo === musica.titulo);
        if (indexReal === -1) indexReal = 0;

        // Pega a capa de forma inteligente (suporta capa_musica e capa)
        const capaMusica = musica.capa_musica || musica.capa || "assets/icons/album.svg";

        favoritosHorizontal.innerHTML += `
        <div class="card" onclick="tocar(${indexReal})" style="cursor: pointer; width: 100px; display: inline-block; margin-right: 15px; vertical-align: top;">
            <img src="${capaMusica}" onerror="this.src='assets/icons/album.svg'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; display: block;">
            <p style="margin-top: 5px; font-size: 13px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${musica.titulo}</p>
        </div>`;
    });

    secaoFavoritos.style.display = "block";
};
