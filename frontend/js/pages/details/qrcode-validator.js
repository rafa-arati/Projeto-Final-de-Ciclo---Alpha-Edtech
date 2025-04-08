// qrcode-validator.js
// Módulo para validar QR Codes em eventos usando a câmera

// --- Definição do Ícone de Câmera (SVG com currentColor) ---
// Este é o SVG que você pediu, com stroke="currentColor" para poder ser colorido via CSS
const cameraIconSVG = `<svg class="icon camera-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8V6C2 4.89543 2.89543 4 4 4H7L9 2H15L17 4H20C21.1046 4 22 4.89543 22 6V8M2 8V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8M2 8H22M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// -------------------------------------------------------------

/**
 * Renderiza a interface de validação de QR Code para admin/premium
 * @returns {string} HTML do componente de validação (sem a tag <section> externa)
 */
export function renderQRCodeValidator() {
    return `
      <div class="qrcode-validator-container">
        <div class="scan-btn-container">
          <button id="start-scan-btn" class="btn btn-primary">
             ${cameraIconSVG}
             Escanear QR Code
          </button>
        </div>
\
        <div id="scanner-container" class="scanner-container hidden">
          <div class="scanner-header">
            <span class="scanner-title">Escaneando QR Code...</span>
            <button id="close-scanner-btn" class="btn-close">×</button>
          </div>
          <video id="qr-video"></video>
          <div class="scanner-overlay">
            <div class="scanner-frame"></div>
          </div>
        </div>
\
        <div id="qrcode-validation-result" class="qrcode-result hidden"></div>

        <div id="qrcode-validation-buttons" class="qrcode-buttons hidden">
          <button id="validate-qrcode-btn" class="btn btn-success">Validar Entrada</button>
          <button id="cancel-qrcode-btn" class="btn btn-secondary">Cancelar</button>
        </div>

        <div id="qr-test-mode" style="display: none; display: flex; gap: 10px; align-items: center;">
         <input id="manual-qrcode-input" type="text" placeholder="Cole aqui o código" style="width: 80%;" />
         <button id="manual-qrcode-button">Testar</button>
        </div>

      </div>
      `;
}


/**
 * Carrega a biblioteca jsQR para leitura de QR Code via câmera
 */
function loadJsQR() {
    // (Código inalterado)
    return new Promise((resolve, reject) => {
        if (window.jsQR) { resolve(window.jsQR); return; }
        console.log("Iniciando carregamento da biblioteca jsQR...");
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => { console.log("Biblioteca jsQR carregada!"); resolve(window.jsQR); };
        script.onerror = (e) => { console.error("Erro jsQR:", e); reject(new Error('Erro jsQR')); };
        document.head.appendChild(script);
    });
}

/**
 * Formata data de nascimento para exibição
 */
function formatBirthDate(dateString) {
    // (Código inalterado)
    if (!dateString) return 'Não informada';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { console.error("Erro data nasc:", e); return dateString; }
}

/**
 * Adiciona os listeners para o modo de teste manual (sem câmera)
 */
function addTestMode() {
    // (Código inalterado - já estava correto para adicionar listeners)
    console.log("Adicionando listeners do modo de teste manual...");
    const testButton = document.getElementById('test-qrcode-btn');
    const testInput = document.getElementById('test-qrcode-input');

    if (testButton && testInput) {
        const newTestButton = testButton.cloneNode(true);
        testButton.parentNode.replaceChild(newTestButton, testButton);

        newTestButton.addEventListener('click', () => {
            if (testInput.value.trim()) {
                console.log("Testando código manual:", testInput.value.trim());
                window.checkQRCode(testInput.value.trim());
            } else { alert("Digite um código para testar"); }
        });

        const newTestInput = testInput.cloneNode(true);
        testInput.parentNode.replaceChild(newTestInput, testInput);

        newTestInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && newTestInput.value.trim()) {
                e.preventDefault();
                console.log("Testando código manual (Enter):", newTestInput.value.trim());
                window.checkQRCode(newTestInput.value.trim());
            }
        });
        console.log("Listeners do modo teste adicionados.");
    } else {
        console.error("Elementos de teste (#test-qrcode-input ou #test-qrcode-btn) não encontrados no DOM.");
    }
}


/**
 * Configura e inicia o scanner de QR Code
 */
async function setupQRScanner() {
    // (Código inalterado)
     try {
        const jsQR = await loadJsQR();
        const video = document.getElementById('qr-video');
        const scannerContainer = document.getElementById('scanner-container');
        const resultContainer = document.getElementById('qrcode-validation-result');
        let streamRef = null;
        let animationFrameId = null;

        if (!video || !scannerContainer) { console.error("Vídeo ou container scanner não encontrado."); return; }

        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

        async function startCamera() {
            stopCamera();
            try {
                console.log("Tentando iniciar câmera...");
                const constraints = { video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } } };
                streamRef = await navigator.mediaDevices.getUserMedia(constraints);
                video.srcObject = streamRef;
                video.setAttribute("playsinline", true);
                await video.play();
                console.log("Câmera iniciada.");
                video.addEventListener('loadedmetadata', () => {
                    if(video.videoWidth > 0 && video.videoHeight > 0){
                       canvas.width = video.videoWidth;
                       canvas.height = video.videoHeight;
                       console.log(`Canvas redimensionado ${canvas.width}x${canvas.height}`);
                    }
                }, { once: true });
                animationFrameId = requestAnimationFrame(scanQRCode);
                scannerContainer.classList.remove('hidden');
            } catch (error) {
                console.error('Erro câmera:', error);
                 if (resultContainer) {
                     showResult(`Erro ao acessar câmera: Verifique permissões.`, 'error', resultContainer);
                 }
                scannerContainer.classList.add('hidden');
            }
        }

        function stopCamera() {
             if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
             if (streamRef) { streamRef.getTracks().forEach(track => track.stop()); streamRef = null; console.log("Câmera parada."); }
             if (video) video.srcObject = null;
             if (scannerContainer) scannerContainer.classList.add('hidden');
        }

        function scanQRCode() {
             if (!streamRef || video.readyState !== video.HAVE_ENOUGH_DATA) { animationFrameId = requestAnimationFrame(scanQRCode); return; }
             try {
                 if (canvas.width === 0 || canvas.height === 0) {
                      if(video.videoWidth > 0 && video.videoHeight > 0){
                          canvas.width = video.videoWidth;
                          canvas.height = video.videoHeight;
                      } else { animationFrameId = requestAnimationFrame(scanQRCode); return; }
                  }
                 canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
                 const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
                 const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                 if (code) { console.log("QR detectado:", code.data); stopCamera(); window.checkQRCode(code.data); return; }
             } catch (err) { console.warn("Erro scan:", err); }
             animationFrameId = requestAnimationFrame(scanQRCode);
        }

        const startScanBtn = document.getElementById('start-scan-btn');
        const closeScannerBtn = document.getElementById('close-scanner-btn');

        if (startScanBtn) {
            const newStartBtn = startScanBtn.cloneNode(true);
            startScanBtn.parentNode.replaceChild(newStartBtn, startScanBtn);
            newStartBtn.addEventListener('click', startCamera);
        } else { console.error("Botão #start-scan-btn não encontrado."); }

        if (closeScannerBtn) {
            const newCloseBtn = closeScannerBtn.cloneNode(true);
            closeScannerBtn.parentNode.replaceChild(newCloseBtn, closeScannerBtn);
            newCloseBtn.addEventListener('click', stopCamera);
        } else { console.error("Botão #close-scanner-btn não encontrado."); }

    } catch (error) {
        console.error('Erro fatal config scanner:', error);
        const startBtn = document.getElementById('start-scan-btn');
        if (startBtn) { startBtn.disabled = true; startBtn.textContent = 'Scanner Indisponível'; startBtn.title = error.message; }
    }
}


/**
 * Função global para validar um código QR via API /use
 */
async function validateQRCodeAPI() {
    // (Código inalterado)
     const currentQRCode = window.currentQRCode;
     if (!currentQRCode) { console.error("Sem QR code para validar"); return; }

     const validateButton = document.getElementById('validate-qrcode-btn');
     const resultContainer = document.getElementById('qrcode-validation-result');
     const buttonsContainer = document.getElementById('qrcode-validation-buttons');
     const eventId = window.currentEventId;

     if (!resultContainer || !buttonsContainer || !validateButton) return;

     try {
         validateButton.disabled = true; validateButton.textContent = 'Validando...';
         const response = await fetch(`/api/qrcode/use/${encodeURIComponent(currentQRCode)}`, {
             method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, credentials: 'include'
         });
         const data = await response.json();

         if (response.ok && data.success !== false) {
             const detailsResponse = await fetch(`/api/qrcode/details/${encodeURIComponent(currentQRCode)}`);
             const detailsData = detailsResponse.ok ? await detailsResponse.json() : {};

              if (detailsData.event_id && String(detailsData.event_id) !== String(eventId)) {
                   throw new Error(`QR Code pertence a outro evento (ID: ${detailsData.event_id}).`);
              }
             showResult(`...Entrada Validada...`, 'success', resultContainer);
             buttonsContainer.classList.add('hidden'); window.currentQRCode = null;
         } else { throw new Error(data.message || 'Erro validar entrada'); }
     } catch (error) {
         console.error('Erro validar entrada:', error);
         showResult(`...Erro validar entrada...`, 'error', resultContainer);
         buttonsContainer.classList.add('hidden'); window.currentQRCode = null;
     } finally {
         validateButton.disabled = false; validateButton.textContent = 'Validar Entrada';
     }
}

/**
 * Função global para verificar QR Code (API /validate)
 */
window.checkQRCode = async (qrValue) => {
    // (Código inalterado)
      if (!qrValue || qrValue.trim() === '') { showResult('QR Code inválido.', 'warning', document.getElementById('qrcode-validation-result')); return; }
      window.currentQRCode = qrValue;
      const eventId = window.currentEventId;
      console.log(`Verificando QR: ${qrValue} Evento: ${eventId}`);

      const resultContainer = document.getElementById('qrcode-validation-result');
      const buttonsContainer = document.getElementById('qrcode-validation-buttons');
      const startScanBtn = document.getElementById('start-scan-btn');

      if (!resultContainer || !buttonsContainer || !startScanBtn) return;

      startScanBtn.disabled = true; startScanBtn.textContent = 'Verificando...';
      resultContainer.innerHTML = '<p>Verificando...</p>'; resultContainer.className = 'qrcode-result'; resultContainer.classList.remove('hidden');
      buttonsContainer.classList.add('hidden');

      try {
          const response = await fetch(`/api/qrcode/validate/${encodeURIComponent(qrValue)}?eventId=${eventId}`, { method: 'GET', headers: { 'Accept': 'application/json' } });
          const data = await response.json();
          console.log("Resp validação:", data);

          if (response.ok && data.isValid) {
              const birthDate = data.user?.birthDate || data.user?.birth_date;
              const formattedBirthDate = formatBirthDate(birthDate);
              showResult(`...QR Válido...`, 'success', resultContainer); // Simplificado
              buttonsContainer.classList.remove('hidden');
          } else {
              showResult(`...Inválido/Usado/Outro Evento...`, 'error', resultContainer); // Simplificado
              window.currentQRCode = null;
          }
      } catch (error) {
          console.error('Erro check QR:', error);
          showResult(`...Erro Verificação...`, 'error', resultContainer);
          window.currentQRCode = null;
      } finally {
          if (startScanBtn) { startScanBtn.disabled = false; startScanBtn.textContent = 'Escanear QR Code'; }
      }
};


/**
 * Função auxiliar para mostrar resultado
 */
function showResult(html, type, container) {
     // (Código inalterado)
      if (!container) { console.error("Container de resultado não encontrado"); return; }
      container.innerHTML = html;
      container.className = 'qrcode-result';
      container.classList.add(`qrcode-result-${type}`);
      container.classList.remove('hidden');
      setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

/**
 * Configura os eventos da interface de validação
 */
export async function setupQRCodeValidator(eventIdParam) {
    // (Código inalterado)
     console.log(`Configurando validador p/ evento: ${eventIdParam}`);
     window.currentEventId = eventIdParam;

     const validateButton = document.getElementById('validate-qrcode-btn');
     const cancelButton = document.getElementById('cancel-qrcode-btn');
     const resultContainer = document.getElementById('qrcode-validation-result');
     const buttonsContainer = document.getElementById('qrcode-validation-buttons');

     if (!validateButton || !cancelButton || !resultContainer || !buttonsContainer) { console.error('Elementos validação não encontrados'); return; }

     const cancelValidation = () => { resultContainer.classList.add('hidden'); buttonsContainer.classList.add('hidden'); window.currentQRCode = null; console.log("Validação cancelada."); const startScanBtn = document.getElementById('start-scan-btn'); if(startScanBtn) startScanBtn.disabled = false; };

     const newValidateButton = validateButton.cloneNode(true);
     validateButton.parentNode.replaceChild(newValidateButton, validateButton);
     newValidateButton.addEventListener('click', validateQRCodeAPI);

     const newCancelButton = cancelButton.cloneNode(true);
     cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
     newCancelButton.addEventListener('click', cancelValidation);

     await setupQRScanner();
     addTestMode(); // Adiciona listeners para o modo teste
     console.log("Validador configurado.");
}


/**
 * Adiciona os estilos CSS (placeholder)
 */
export function addQRCodeValidatorStyles() {
    // (Código inalterado)
     if (document.getElementById('qrcode-validator-styles')) { console.log("Estilos validador já existem."); return; }
     const styles = document.createElement('style');
     styles.id = 'qrcode-validator-styles';
     styles.textContent = `/* Estilos em frontend/css/qrcode-validator.css */`;
     document.head.appendChild(styles);
     console.log("Placeholder estilos validador adicionado.");
}