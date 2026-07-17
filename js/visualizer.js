// Arquivo isolado para controle de efeitos visuais baseados no áudio
(function() {
    // Referências dos elementos existentes
    const audioElement = document.getElementById("audioPlayer");
    const targetButton = document.getElementById("btnPlay");

    // Variáveis de controle da Web Audio API
    let audioContext = null;
    let analyzer = null;
    let source = null;
    let animacaoId = null;

    // Configura o analisador de áudio (rodado apenas uma vez, no primeiro clique de som)
    function inicializarAudioContext() {
        if (audioContext) return; // Já inicializado

        try {
            // Cria o contexto de áudio nativo do navegador
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            
            // Cria o nó analisador de frequências
            analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 64; // Tamanho pequeno para capturar batidas gerais rapidamente
            
            // Conecta o elemento <audio> ao analisador e de volta às caixas de som
            source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyzer);
            analyzer.connect(audioContext.destination);
        } catch (e) {
            console.warn("Web Audio API não suportada ou bloqueada neste navegador:", e);
        }
    }

    // Loop de animação em tempo real (roda a até 60 frames por segundo)
    function renderizarPulso() {
        if (!analyzer || !targetButton) return;

        // Cria um array para guardar os dados de frequência
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Pega as frequências de sub-grave e graves (início do array)
        analyzer.getByteFrequencyData(dataArray);

        // Calcula a média das frequências mais baixas (ritmo/batida)
        let somaGraves = 0;
        const nosConsiderados = Math.min(bufferLength, 8); // Foca nos primeiros canais (graves)
        
        for (let i = 0; i < nosConsiderados; i++) {
            somaGraves += dataArray[i];
        }
        
        const mediaVolume = somaGraves / nosConsiderados;

        // Transforma o volume (0 a 255) em uma escala CSS sutil (1.0 a 1.18)
        // Se a música estiver silenciosa, a escala fica em 1 (tamanho normal)
        const escala = 1 + (mediaVolume / 255) * 0.18;

        // Aplica o efeito visual no botão usando transform
        targetButton.style.transform = `scale(${escala})`;
        targetButton.style.transition = "transform 0.05s ease-out"; // Amortece para não quebrar o visual

        // Continua o loop enquanto a música estiver rodando
        animacaoId = requestAnimationFrame(renderizarPulso);
    }

    // Gerencia o início e parada da animação com base no estado do player
    if (audioElement && targetButton) {
        
        // Monitora quando o áudio começa a tocar
        audioElement.addEventListener("play", () => {
            inicializarAudioContext();
            
            // Ativa o contexto se o navegador o colocou em standby (regra de segurança do Chrome/Safari)
            if (audioContext && audioContext.state === "suspended") {
                audioContext.resume();
            }

            // Inicia o loop visual
            if (animacaoId) cancelAnimationFrame(animacaoId);
            renderizarPulso();
        });

        // Monitora quando o áudio pausa ou termina
        const pararAnimacao = () => {
            if (animacaoId) cancelAnimationFrame(animacaoId);
            // Reseta o botão para o tamanho original suavemente
            if (targetButton) {
                targetButton.style.transform = "scale(1)";
            }
        };

        audioElement.addEventListener("pause", pararAnimacao);
        audioElement.addEventListener("ended", pararAnimacao);
    }
})();
