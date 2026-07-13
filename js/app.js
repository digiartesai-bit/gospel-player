const continueOuvindo = document.getElementById("continueOuvindo");
const albuns = document.getElementById("albuns");
const listaMusicas = document.getElementById("listaMusicas");

const musicas = [
  {titulo:"Graça Infinita", artista:"AdoraPlay"},
  {titulo:"Tu És Santo", artista:"AdoraPlay"},
  {titulo:"Perto de Ti", artista:"AdoraPlay"},
  {titulo:"Esperança", artista:"AdoraPlay"},
  {titulo:"Rei dos Reis", artista:"AdoraPlay"}
];

musicas.forEach(musica => {

  continueOuvindo.innerHTML += `
    <div class="card">
      <img src="https://placehold.co/300x300?text=Album" alt="Capa">
      <p>${musica.titulo}</p>
    </div>
  `;

  albuns.innerHTML += `
    <div class="card">
      <img src="https://placehold.co/300x300?text=Album" alt="Álbum">
      <p>${musica.artista}</p>
    </div>
  `;

  listaMusicas.innerHTML += `
    <div class="musica">
      <div>
        <strong>${musica.titulo}</strong><br>
        <small>${musica.artista}</small>
      </div>

      <button onclick="alert('Player será implementado na próxima etapa')">▶</button>
    </div>
  `;
});
