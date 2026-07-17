// Arquivo isolado para controle de efeitos visuais baseados no áudio
(function() {
    const audioElement = document.getElementById("audioPlayer");
    const targetButton = document.getElementById("btnPlay");

    let audioContext = null;
    let analyzer = null;
    let source = null;
    let animacaoId = null;

    // Configura o analisador de áudio tratando o bloqueio de segurança (CORS)
    function inicializarAudioContext() {
        if (audioContext) return; 

        try {
            // 1. Libera o áudio para o JavaScript ler as frequências sem bloquear o som
            if (audioElement && !audioElement.crossOrigin) {
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
            console.warn("Erro ao iniciar contexto ou bloqueio de CORS:", e);
        }
    }

    // Loop de animação em tempo real
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

        // Amortece e calcula a escala do botão baseada no som real
        const escala = 1 + (mediaVolume / 255) * 0.15;

        // Aplica o efeito visual no botão
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
            if (targetButton) {
                targetButton.style.transform = "scale(1)";
            }
        };

        audioElement.addEventListener("pause", pararAnimacao);
        audioElement.addEventListener("ended", pararAnimacao);
    }
})();
