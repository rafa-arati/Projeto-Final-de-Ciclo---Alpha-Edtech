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

        <div id="qr-test-mode" style="display: flex; gap: 10px; align-items: center;">
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
  console.log("Adicionando listeners do modo de teste manual...");

  // CORREÇÃO: Usar os IDs corretos conforme definidos no HTML
  const testButton = document.getElementById('manual-qrcode-button');
  const testInput = document.getElementById('manual-qrcode-input');

  console.log("Botão teste:", testButton);
  console.log("Input teste:", testInput);

  if (testButton && testInput) {
    // Removemos os listeners antigos (caso existam)
    const newTestButton = testButton.cloneNode(true);
    testButton.parentNode.replaceChild(newTestButton, testButton);

    // Adicionamos o novo listener para o botão
    newTestButton.addEventListener('click', () => {
      console.log("Botão de teste clicado");
      if (testInput.value.trim()) {
        console.log("Testando código manual:", testInput.value.trim());
        window.checkQRCode(testInput.value.trim());
      } else {
        alert("Digite um código para testar");
      }
    });

    // Também para o input, para poder pressionar Enter
    const newTestInput = testInput.cloneNode(true);
    testInput.parentNode.replaceChild(newTestInput, testInput);

    newTestInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && newTestInput.value.trim()) {
        e.preventDefault();
        console.log("Testando código manual (Enter):", newTestInput.value.trim());
        window.checkQRCode(newTestInput.value.trim());
      }
    });

    console.log("Listeners do modo teste adicionados com sucesso.");
  } else {
    console.error("Elementos de teste (#manual-qrcode-input ou #manual-qrcode-button) não encontrados no DOM.");
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
          if (video.videoWidth > 0 && video.videoHeight > 0) {
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
          if (video.videoWidth > 0 && video.videoHeight > 0) {
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
  const currentQRCode = window.currentQRCode;
  if (!currentQRCode) {
    console.error("Sem QR code para validar");
    return;
  }

  const validateButton = document.getElementById('validate-qrcode-btn');
  const resultContainer = document.getElementById('qrcode-validation-result');
  const buttonsContainer = document.getElementById('qrcode-validation-buttons');
  const eventId = window.currentEventId;

  if (!resultContainer || !buttonsContainer || !validateButton) return;

  try {
    validateButton.disabled = true;
    validateButton.textContent = 'Validando...';

    // Primeiro, verificamos novamente os detalhes do QR Code para garantir a validação do evento
    const detailsResponse = await fetch(`/api/qrcode/validate/${encodeURIComponent(currentQRCode)}`);
    const detailsData = await detailsResponse.json();

    // Verificar se o QR Code é para o evento atual
    if (detailsData.eventId && eventId && String(detailsData.eventId) !== String(eventId)) {
      throw new Error(`QR Code pertence a outro evento: ${detailsData.eventName}`);
    }

    // Se tudo estiver correto, prosseguimos com a validação
    const response = await fetch(`/api/qrcode/use/${encodeURIComponent(currentQRCode)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok && data.success !== false) {
      showResult(`
                <div class="validated-qrcode">
                    <div class="qrcode-validation-success">✅ Entrada Validada com Sucesso</div>
                    <div class="qrcode-detail-item">O QR Code foi validado e não poderá ser utilizado novamente.</div>
                </div>
            `, 'success', resultContainer);
      buttonsContainer.classList.add('hidden');
      window.currentQRCode = null;
    } else {
      throw new Error(data.message || 'Erro ao validar entrada');
    }
  } catch (error) {
    console.error('Erro validar entrada:', error);
    showResult(`
            <div class="invalid-qrcode">
                <div class="qrcode-verification-error">❌ Erro na Validação</div>
                <div class="qrcode-error-message">${error.message}</div>
            </div>
        `, 'error', resultContainer);
    buttonsContainer.classList.add('hidden');
    window.currentQRCode = null;
  } finally {
    validateButton.disabled = false;
    validateButton.textContent = 'Validar Entrada';
  }
}

/**
 * Função global para verificar QR Code (API /validate)
 */
window.checkQRCode = async (qrValue) => {
  if (!qrValue || qrValue.trim() === '') {
    showResult('QR Code inválido.', 'warning', document.getElementById('qrcode-validation-result'));
    return;
  }
  window.currentQRCode = qrValue;
  const eventId = window.currentEventId;
  console.log(`Verificando QR: ${qrValue} Evento ID: ${eventId}`);

  const resultContainer = document.getElementById('qrcode-validation-result');
  const buttonsContainer = document.getElementById('qrcode-validation-buttons');
  const startScanBtn = document.getElementById('start-scan-btn');

  if (!resultContainer || !buttonsContainer || !startScanBtn) return;

  startScanBtn.disabled = true;
  startScanBtn.textContent = 'Verificando...';
  resultContainer.innerHTML = '<p>Verificando...</p>';
  resultContainer.className = 'qrcode-result';
  resultContainer.classList.remove('hidden');
  buttonsContainer.classList.add('hidden');

  try {
    // Primeiro, obtemos o nome do evento atual
    let currentEventName = "";
    try {
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventData = await eventResponse.json();
      currentEventName = eventData.event_name || "";
      console.log("Nome do evento atual:", currentEventName);
    } catch (error) {
      console.error("Erro ao obter dados do evento atual:", error);
    }

    // Agora validamos o QR Code
    const response = await fetch(`/api/qrcode/validate/${encodeURIComponent(qrValue)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();

    console.log("Resposta da validação:", data);

    if (response.ok && data.isValid) {
      // Capturar todos os dados disponíveis
      const userName = data.user?.name || "Nome não disponível";
      const birthDate = data.user?.birthDate || data.user?.birth_date || "Data não disponível";
      const formattedBirthDate = formatBirthDate(birthDate);
      const eventName = data.eventName || "Nome do evento não disponível";
      const eventDate = data.eventDate ? new Date(data.eventDate).toLocaleDateString('pt-BR') : "Data não disponível";
      const benefitType = data.benefit?.type || "Tipo não disponível";
      const benefitDescription = data.benefit?.description || "Descrição não disponível";
      const discountPercentage = data.benefit?.discountPercentage || "";

      // Verificar se o QR Code pertence ao evento atual apenas pelo nome
      if (currentEventName && eventName && currentEventName !== eventName) {
        showResult(`
                    <div class="invalid-qrcode">
                        <div class="qrcode-verification-error">❌ QR Code inválido para este evento</div>
                        <div class="qrcode-error-message">Este QR Code pertence ao evento: <strong>${eventName}</strong></div>
                    </div>
                `, 'error', resultContainer);
        window.currentQRCode = null;
        return;
      }

      // Exibir informações detalhadas com a data do evento
      showResult(`
                <div class="valid-qrcode">
                    <div class="qrcode-verification-success">✅ QR Code Válido</div>
                    <div class="qrcode-detail-item"><strong>Evento:</strong> ${eventName}</div>
                    <div class="qrcode-detail-item"><strong>Data do Evento:</strong> ${eventDate}</div>
                    <div class="qrcode-detail-item"><strong>Usuário:</strong> ${userName}</div>
                    <div class="qrcode-detail-item"><strong>Data de Nascimento:</strong> ${formattedBirthDate}</div>
                    <div class="qrcode-detail-item"><strong>Benefício:</strong> ${benefitType} ${discountPercentage ? `(${discountPercentage}%)` : ''}</div>
                    <div class="qrcode-detail-item"><strong>Descrição:</strong> ${benefitDescription}</div>
                </div>
            `, 'success', resultContainer);

      buttonsContainer.classList.remove('hidden');
    } else {
      // Mensagem de erro mais detalhada
      const errorMessage = data.message || "QR Code inválido ou já utilizado";
      showResult(`
                <div class="invalid-qrcode">
                    <div class="qrcode-verification-error">❌ QR Code Inválido</div>
                    <div class="qrcode-error-message">${errorMessage}</div>
                </div>
            `, 'error', resultContainer);
      window.currentQRCode = null;
    }
  } catch (error) {
    console.error('Erro check QR:', error);
    showResult(`
            <div class="invalid-qrcode">
                <div class="qrcode-verification-error">❌ Erro</div>
                <div class="qrcode-error-message">Erro ao verificar QR Code: ${error.message}</div>
            </div>
        `, 'error', resultContainer);
    window.currentQRCode = null;
  } finally {
    if (startScanBtn) {
      startScanBtn.disabled = false;
      startScanBtn.innerHTML = `${cameraIconSVG} Escanear QR Code`;
    }
  }
};


/**
 * Função auxiliar para mostrar resultado
 */
function showResult(html, type, container) {
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
  console.log(`Configurando validador p/ evento: ${eventIdParam}`);
  window.currentEventId = eventIdParam;

  const validateButton = document.getElementById('validate-qrcode-btn');
  const cancelButton = document.getElementById('cancel-qrcode-btn');
  const resultContainer = document.getElementById('qrcode-validation-result');
  const buttonsContainer = document.getElementById('qrcode-validation-buttons');
  const testModeContainer = document.getElementById('qr-test-mode');

  if (!validateButton || !cancelButton || !resultContainer || !buttonsContainer) {
    console.error('Elementos validação não encontrados');
    return;
  }

  // Garantir que a área de teste esteja visível
  if (testModeContainer) {
    testModeContainer.style.display = "flex";
  } else {
    console.error('Área de teste manual não encontrada no DOM');
  }

  const cancelValidation = () => {
    resultContainer.classList.add('hidden');
    buttonsContainer.classList.add('hidden');
    window.currentQRCode = null;
    console.log("Validação cancelada.");
    const startScanBtn = document.getElementById('start-scan-btn');
    if (startScanBtn) startScanBtn.disabled = false;
  };

  const newValidateButton = validateButton.cloneNode(true);
  validateButton.parentNode.replaceChild(newValidateButton, validateButton);
  newValidateButton.addEventListener('click', validateQRCodeAPI);

  const newCancelButton = cancelButton.cloneNode(true);
  cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
  newCancelButton.addEventListener('click', cancelValidation);

  await setupQRScanner();

  // Configurar listeners para o modo de teste manual
  const manualButton = document.getElementById('manual-qrcode-button');
  const manualInput = document.getElementById('manual-qrcode-input');

  if (manualButton && manualInput) {
    console.log("Configurando listeners para teste manual");

    // Remover eventos anteriores se existirem
    const newManualButton = manualButton.cloneNode(true);
    manualButton.parentNode.replaceChild(newManualButton, manualButton);

    // Adicionar evento de clique no botão
    newManualButton.addEventListener('click', function () {
      const inputValue = document.getElementById('manual-qrcode-input').value;
      console.log("Botão manual clicado. Valor do input:", inputValue);

      // Enviar o valor diretamente, sem verificar se está vazio
      window.checkQRCode(inputValue);
    });

    // Adicionar evento de tecla Enter no input
    manualInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const inputValue = this.value;
        console.log("Enter pressionado. Valor do input:", inputValue);

        // Enviar o valor diretamente, sem verificar se está vazio
        window.checkQRCode(inputValue);
      }
    });

    console.log("Listeners de teste manual configurados.");
  } else {
    console.error("Elementos de teste manual não encontrados!");
  }

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