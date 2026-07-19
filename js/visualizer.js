/**
 * visualizer.js - Efeitos Visuais e Animação do Botão Play (Pulsação no Ritmo)
 */

(function () {
  function initVisualizer() {
    const audioElement = document.getElementById("audioPlayer");
    const targetButton = document.getElementById("btnPlay");

    if (!audioElement || !targetButton) return;

    let animacaoId = null;
    let angulo = 0;

    /**
     * Faz o botão crescer e diminuir simulando uma batida suave (onda senoidal)
     */
    function simularPulsacao() {
      if (!targetButton || !audioElement || audioElement.paused) {
        if (targetButton) {
          targetButton.style.transform = "scale(1)";
        }
        return;
      }

      // Variação angular para o ciclo de oscilação
      angulo += 0.15;

      // Transforma a oscilação entre escala 1.0 e 1.08 (efeito sutil de pulso)
      const variacao = (Math.sin(angulo) + 1) / 2;
      const escala = 1 + (variacao * 0.08);

      targetButton.style.transform = `scale(${escala})`;
      targetButton.style.transition = "transform 0.05s ease-out";

      animacaoId = requestAnimationFrame(simularPulsacao);
    }

    const pararPulso = () => {
      if (animacaoId) {
        cancelAnimationFrame(animacaoId);
        animacaoId = null;
      }
      if (targetButton) {
        targetButton.style.transform = "scale(1)";
      }
    };

    // Escuta os eventos do player para iniciar ou pausar o pulso
    audioElement.addEventListener("play", () => {
      pararPulso();
      simularPulsacao();
    });

    audioElement.addEventListener("pause", pararPulso);
    audioElement.addEventListener("ended", pararPulso);
    audioElement.addEventListener("error", pararPulso);
  }

  // Garante que o DOM está carregado antes de capturar os elementos
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVisualizer);
  } else {
    initVisualizer();
  }
})();
