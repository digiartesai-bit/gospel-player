// Arquivo de teste de frequência real usando Proxy CORS
(function() {
    const audioElement = document.getElementById("audioPlayer");
    const targetButton = document.getElementById("btnPlay");

    let audioContext = null;
    let analyzer = null;
    let source = null;
    let animacaoId = null;
    let linkOriginal = "";

    function inicializarAudioContext() {
        if (audioContext) return; 

        try {
            // TRUQUE DO PROXY: Se o áudio for do seu worker, joga pelo proxy CORS para o navegador liberar o som
            if (audioElement && audioElement.src && !audioElement.src.includes("corsproxy")) {
                linkOriginal = audioElement.src;
                // Usando um proxy público estável (allorigins)
                audioElement.src = "https://api.allorigins.win/raw?url=" + encodeURIComponent(linkOriginal);
                audioElement.crossOrigin = "anonymous";
            }

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            
            analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 64; 
            
            source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyzer);
            analyzer.connect(audioContext.destination);
        } catch (e) {
            console.warn("Erro no contexto de áudio:", e);
        }
    }

    function renderizarPulso() {
        if (!analyzer || !targetButton) return;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyzer.getByteFrequencyData(dataArray);

        let somaGraves = 0;
        const nosConsiderados = Math.min(bufferLength, 8); 
        for (let i = 0; i < nosConsiderados; i++) {
            somaGraves += dataArray[i];
        }
        
        const mediaVolume = somaGraves / nosConsiderados;
        const escala = 1 + (mediaVolume / 255) * 0.18; // Pulsação máxima de 18%

        targetButton.style.transform = `scale(${escala})`;
        targetButton.style.transition = "transform 0.05s ease-out";

        animacaoId = requestAnimationFrame(renderizarPulso);
    }

    if (audioElement && targetButton) {
        audioElement.addEventListener("play", () => {
            inicializarAudioContext();
            if (audioContext && audioContext.state === "suspended") {
                audioContext.resume();
            }
            if (animacaoId) cancelAnimationFrame(animacaoId);
            renderizarPulso();
        });

        const pararAnimacao = () => {
            if (animacaoId) cancelAnimationFrame(animacaoId);
            if (targetButton) targetButton.style.transform = "scale(1)";
        };

        audioElement.addEventListener("pause", pararAnimacao);
        audioElement.addEventListener("ended", pararAnimacao);
    }
})();
