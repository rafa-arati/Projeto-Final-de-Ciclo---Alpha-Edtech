// qrcode-validator.js
// Módulo para validar QR Codes em eventos usando a câmera

/**
 * Renderiza a interface de validação de QR Code para admin/premium
 * @returns {string} HTML do componente de validação
 */
export function renderQRCodeValidator() {
  return `
    <section class="qrcode-validator-section content-section">
      <h2 class="section-title">Validação de QR Code</h2>
      <div class="qrcode-validator-container">
        <div class="scan-btn-container">
          <button id="start-scan-btn" class="btn btn-primary">
            <span class="camera-icon">📷</span> Escanear QR Code
          </button>
        </div>
        
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
        
        <div id="qrcode-validation-result" class="qrcode-result hidden"></div>
        
        <div id="qrcode-validation-buttons" class="qrcode-buttons hidden">
          <button id="validate-qrcode-btn" class="btn btn-success">Validar Entrada</button>
          <button id="cancel-qrcode-btn" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </section>
  `;
}

/**
 * Carrega a biblioteca jsQR para leitura de QR Code via câmera
 * @returns {Promise} Promise que resolve quando a biblioteca estiver carregada
 */
function loadJsQR() {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      resolve(window.jsQR);
      return;
    }

    console.log("Iniciando carregamento da biblioteca jsQR...");
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    // Remover verificação de integridade para facilitar carregamento em desenvolvimento
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log("Biblioteca jsQR carregada com sucesso!");
      resolve(window.jsQR);
    };

    script.onerror = (e) => {
      console.error("Erro ao carregar biblioteca jsQR:", e);
      reject(new Error('Erro ao carregar biblioteca jsQR'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Formata data de nascimento para exibição
 * @param {string} dateString - Data no formato ISO
 * @returns {string} Data formatada no padrão brasileiro
 */
function formatBirthDate(dateString) {
  if (!dateString) return 'Não informada';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Retorna a string original se não for uma data válida
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error("Erro ao formatar data de nascimento:", e);
    return dateString;
  }
}

/**
 * Adiciona campo de entrada para teste manual (sem câmera)
 */
function addTestMode() {
  console.log("Adicionando modo de teste manual...");
  const scanBtnContainer = document.querySelector('.scan-btn-container');
  if (!scanBtnContainer) {
    console.error("Container de botão de scan não encontrado");
    return;
  }

  // Remove qualquer container de teste existente para evitar duplicação
  const existingTestContainer = document.querySelector('.test-input-container');
  if (existingTestContainer) {
    existingTestContainer.remove();
  }

  const testModeHTML = `
    <div class="test-input-container" style="margin-top: 15px;">
      <input type="text" id="test-qrcode-input" placeholder="Digite o código QR para teste" style="padding: 8px; width: 250px; margin-right: 10px;">
      <button id="test-qrcode-btn" class="btn btn-secondary">Testar</button>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = testModeHTML;
  scanBtnContainer.appendChild(div);

  // Adicionar evento ao botão de teste
  const testButton = document.getElementById('test-qrcode-btn');
  if (testButton) {
    // Remover listener anterior se existir
    const newTestButton = testButton.cloneNode(true);
    testButton.parentNode.replaceChild(newTestButton, testButton);

    newTestButton.addEventListener('click', () => {
      const testInput = document.getElementById('test-qrcode-input');
      if (testInput && testInput.value.trim()) {
        console.log("Testando código manualmente:", testInput.value.trim());
        window.checkQRCode(testInput.value.trim());
      } else {
        alert("Por favor, digite um código para testar");
      }
    });

    // Adicionar evento para enviar ao pressionar Enter no input
    const testInput = document.getElementById('test-qrcode-input');
    if (testInput) {
      testInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && testInput.value.trim()) {
          console.log("Testando código manualmente (via Enter):", testInput.value.trim());
          window.checkQRCode(testInput.value.trim());
        }
      });
    }
  } else {
    console.error("Botão de teste não encontrado após adição ao DOM");
  }

  console.log("Modo de teste manual adicionado com sucesso");
}

/**
 * Configura e inicia o scanner de QR Code
 */
async function setupQRScanner() {
  try {
    const jsQR = await loadJsQR();
    const video = document.getElementById('qr-video');
    const scannerContainer = document.getElementById('scanner-container');
    let canvasContext = null;
    let canvas = null;

    // Função para iniciar a câmera
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // Necessário para iOS
        video.play();

        // Criar canvas para processar frames
        canvas = document.createElement('canvas');
        canvasContext = canvas.getContext('2d', { willReadFrequently: true });

        requestAnimationFrame(scanQRCode);

        scannerContainer.classList.remove('hidden');
      } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        showResult(`
          <div class="invalid-qrcode">
            <div class="qrcode-verification-error">✗ Erro ao acessar câmera</div>
            <div class="qrcode-error-message">
              Verifique se você permitiu o acesso à câmera para este site.
              <br>Detalhes: ${error.message || 'Erro desconhecido'}
            </div>
          </div>
        `, 'error');
      }
    }

    // Função para parar a câmera
    function stopCamera() {
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }

      scannerContainer.classList.add('hidden');
    }

    // Função para escanear QR Code frame a frame
    function scanQRCode() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Ajustar canvas ao tamanho do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenhar frame atual no canvas
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obter dados de imagem
        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

        // Processar com jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // QR Code encontrado!
          stopCamera();
          window.checkQRCode(code.data);
          return;
        }
      }

      // Continuar escaneamento se não encontrou QR Code
      requestAnimationFrame(scanQRCode);
    }

    // Configurar botões
    const startScanBtn = document.getElementById('start-scan-btn');
    const closeScannerBtn = document.getElementById('close-scanner-btn');

    startScanBtn.addEventListener('click', startCamera);
    closeScannerBtn.addEventListener('click', stopCamera);

  } catch (error) {
    console.error('Erro ao configurar scanner de QR Code:', error);
    document.getElementById('start-scan-btn').disabled = true;
    document.getElementById('start-scan-btn').textContent = 'Scanner indisponível';
  }
}

/**
 * Função global para validar um código QR (será chamada tanto pela câmera quanto pelo modo teste)
 * @param {string} qrValue - O valor do código QR
 */
async function validateQRCode() {
  const currentQRCode = window.currentQRCode;
  if (!currentQRCode) {
    console.error("Nenhum QR code para validar");
    return;
  }

  const validateButton = document.getElementById('validate-qrcode-btn');
  const resultContainer = document.getElementById('qrcode-validation-result');
  const buttonsContainer = document.getElementById('qrcode-validation-buttons');

  try {
    validateButton.disabled = true;
    validateButton.textContent = 'Validando...';

    // Executar a validação no backend (marcar como usado)
    const response = await fetch(`/api/qrcode/use/${encodeURIComponent(currentQRCode)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // QR Code validado com sucesso
      resultContainer.innerHTML = `
        <div class="validated-qrcode">
          <div class="qrcode-validation-success">✓ Entrada Validada com Sucesso</div>
          <div class="qrcode-detail-item">
            <strong>Nome:</strong> ${data.userName || 'Usuário'}
          </div>
          <div class="qrcode-detail-item">
            <strong>Benefício:</strong> ${data.benefitDescription || 'Benefício confirmado'}
          </div>
          <div class="qrcode-detail-item">
            <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      `;
      resultContainer.className = 'qrcode-result qrcode-result-success';
      buttonsContainer.classList.add('hidden');
      window.currentQRCode = null;
    } else {
      throw new Error(data.message || 'Erro ao validar entrada');
    }
  } catch (error) {
    console.error('Erro ao validar entrada:', error);
    resultContainer.innerHTML = `
      <div class="invalid-qrcode">
        <div class="qrcode-verification-error">✗ Erro ao Validar Entrada</div>
        <div class="qrcode-error-message">${error.message || 'Ocorreu um erro ao processar a validação.'}</div>
      </div>
    `;
    resultContainer.className = 'qrcode-result qrcode-result-error';
  } finally {
    validateButton.disabled = false;
    validateButton.textContent = 'Validar Entrada';
  }
}

/**
 * Função para obter o nome do evento atual da página
 * Busca em diferentes elementos que podem conter o nome do evento
 * @returns {string|null} Nome do evento ou null se não encontrado
 */
function getCurrentEventName() {
  // Várias estratégias para encontrar o nome do evento na página

  // 1. Tentar obter do título principal (h1)
  const eventTitleElement = document.querySelector('h1.event-title, h1.details-title, h1');
  if (eventTitleElement) {
    console.log("Nome do evento encontrado no título principal:", eventTitleElement.textContent.trim());
    return eventTitleElement.textContent.trim();
  }

  // 2. Tentar obter da meta tag (se existir)
  const metaEventName = document.querySelector('meta[name="event-name"]');
  if (metaEventName && metaEventName.getAttribute('content')) {
    return metaEventName.getAttribute('content').trim();
  }

  // 3. Tentar obter do breadcrumb ou navegação
  const breadcrumbEventName = document.querySelector('.breadcrumb .current, .event-nav .current');
  if (breadcrumbEventName) {
    return breadcrumbEventName.textContent.trim();
  }

  // 4. Buscar em elementos com classes específicas de evento
  const eventNameElement = document.querySelector('.event-name, .event-header__title');
  if (eventNameElement) {
    return eventNameElement.textContent.trim();
  }

  // 5. Última tentativa: buscar em data attributes
  const eventElement = document.querySelector('[data-event-name]');
  if (eventElement) {
    return eventElement.getAttribute('data-event-name');
  }

  console.warn("Não foi possível determinar o nome do evento na página atual");
  return null;
}

/**
 * Configura os eventos da interface de validação
 * @param {string} eventId - ID do evento atual
 */
export async function setupQRCodeValidator(eventId) {
  console.log("Configurando validador de QR Code para evento ID:", eventId);

  // Obter os elementos da interface
  const validateButton = document.getElementById('validate-qrcode-btn');
  const cancelButton = document.getElementById('cancel-qrcode-btn');
  const resultContainer = document.getElementById('qrcode-validation-result');
  const buttonsContainer = document.getElementById('qrcode-validation-buttons');

  if (!validateButton || !cancelButton || !resultContainer || !buttonsContainer) {
    console.error('Elementos de validação de QR Code não encontrados');
    return;
  }

  // Variável para armazenar o QR code atual sendo verificado
  window.currentQRCode = null;
  window.currentEventId = eventId; // Armazenar o ID do evento para uso na validação

  // Função para mostrar resultado
  const showResult = (html, type) => {
    resultContainer.innerHTML = html;
    resultContainer.className = 'qrcode-result';
    resultContainer.classList.add(`qrcode-result-${type}`);
    resultContainer.classList.remove('hidden');

    // Rolar para o resultado
    setTimeout(() => {
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Função global para verificar QR Code (será chamada pelo scanner e pelo modo teste)
  window.checkQRCode = async (qrValue) => {
    if (!qrValue || qrValue.trim() === '') {
      showResult(`
        <div class="invalid-qrcode">
          <div class="qrcode-verification-error">✗ QR Code inválido</div>
          <div class="qrcode-error-message">O código QR está vazio ou inválido.</div>
        </div>
      `, 'warning');
      return;
    }

    window.currentQRCode = qrValue;
    console.log("Verificando QR Code:", qrValue);

    document.getElementById('start-scan-btn').disabled = true;
    document.getElementById('start-scan-btn').textContent = 'Verificando...';

    try {
      // Chamar o endpoint público de validação
      const response = await fetch(`/api/qrcode/validate/${encodeURIComponent(qrValue)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      // Log para debug
      console.log("Resposta da validação do QR code:", data);

      if (response.ok && data.isValid) {
        // VERIFICAÇÃO ADICIONAL: Verificar se o QR code pertence ao evento atual
        // Vamos buscar o nome do evento atual
        const currentEventName = getCurrentEventName();

        console.log("Comparando nomes de eventos:", {
          qrCodeEventName: data.eventName,
          currentEventName: currentEventName
        });

        if (currentEventName && data.eventName &&
          currentEventName !== data.eventName &&
          !currentEventName.includes(data.eventName) &&
          !data.eventName.includes(currentEventName)) {
          // QR Code válido mas de outro evento
          showResult(`
          <div class="invalid-qrcode">
            <div class="qrcode-verification-error">✗ QR Code de Outro Evento</div>
            <div class="qrcode-error-message">
              Este QR code é válido, mas pertence a outro evento: "${data.eventName}".
              <br>Por favor, use apenas QR codes deste evento: "${currentEventName}".
            </div>
          </div>
        `, 'warning');

          buttonsContainer.classList.add('hidden');
          window.currentQRCode = null;
          return;
        }

        // Formatar data de nascimento
        const birthDate = data.user.birthDate || data.user.birth_date;
        const formattedBirthDate = formatBirthDate(birthDate);

        // QR Code válido - mostrar detalhes e botões de ação
        showResult(`
        <div class="valid-qrcode">
          <div class="qrcode-verification-success">✓ QR Code Válido</div>
          <div class="qrcode-detail-item">
            <strong>Evento:</strong> ${data.eventName}
          </div>
          <div class="qrcode-detail-item">
            <strong>Nome:</strong> ${data.user.name}
          </div>
          <div class="qrcode-detail-item">
            <strong>Data de Nascimento:</strong> ${formattedBirthDate}
          </div>
          <div class="qrcode-detail-item">
            <strong>Benefício:</strong> ${data.benefit.description || data.benefit.type}
            ${data.benefit.discountPercentage ? ` (${data.benefit.discountPercentage}% desconto)` : ''}
          </div>
        </div>
      `, 'success');

        buttonsContainer.classList.remove('hidden');
      } else {
        // QR Code inválido
        showResult(`
        <div class="invalid-qrcode">
          <div class="qrcode-verification-error">✗ QR Code Inválido</div>
          <div class="qrcode-error-message">${data.message || 'Este QR code não é válido ou já foi utilizado.'}</div>
        </div>
      `, 'error');

        buttonsContainer.classList.add('hidden');
        window.currentQRCode = null;
      }
    } catch (error) {
      console.error('Erro ao verificar QR Code:', error);
      showResult(`
      <div class="invalid-qrcode">
        <div class="qrcode-verification-error">✗ Erro ao Verificar</div>
        <div class="qrcode-error-message">Ocorreu um erro ao validar o QR Code. Tente novamente.</div>
      </div>
    `, 'error');

      buttonsContainer.classList.add('hidden');
      window.currentQRCode = null;
    } finally {
      document.getElementById('start-scan-btn').disabled = false;
      document.getElementById('start-scan-btn').textContent = 'Escanear QR Code';
    }
  };

  // Função para cancelar validação
  const cancelValidation = () => {
    resultContainer.classList.add('hidden');
    buttonsContainer.classList.add('hidden');
    window.currentQRCode = null;
  };

  // Limpar e adicionar eventos aos elementos
  // Usando a técnica de clonar para garantir que não haja listeners duplicados

  // Botão Validar
  const newValidateButton = validateButton.cloneNode(true);
  validateButton.parentNode.replaceChild(newValidateButton, validateButton);
  newValidateButton.addEventListener('click', validateQRCode);

  // Botão Cancelar
  const newCancelButton = cancelButton.cloneNode(true);
  cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
  newCancelButton.addEventListener('click', cancelValidation);

  // Configurar o scanner de QR Code
  await setupQRScanner();

  // Adicionar modo de teste manual
  addTestMode();

  console.log("Validador de QR Code configurado com sucesso");
}

/**
 * Adiciona os estilos CSS para o validador de QR Code
 */
export function addQRCodeValidatorStyles() {
  if (!document.getElementById('qrcode-validator-styles')) {
    const styles = document.createElement('style');
    styles.id = 'qrcode-validator-styles';
    styles.textContent = `
      .qrcode-validator-section {
        margin-top: 20px;
        padding: 20px;
        background-color: #222;
        border-radius: 8px;
        border: 1px solid #333;
      }
      
      .qrcode-validator-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .scan-btn-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      #start-scan-btn {
        background: linear-gradient(45deg, #8000FF, #439DFE);
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.2s;
      }
      
      #start-scan-btn:hover {
        transform: translateY(-2px);
      }
      
      .camera-icon {
        font-size: 20px;
      }
      
      .scanner-container {
        background-color: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        max-width: 100%;
        height: 350px;
      }
      
      .scanner-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background-color: #333;
        color: white;
      }
      
      .scanner-title {
        font-weight: bold;
      }
      
      .btn-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }
      
      #qr-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .scanner-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
      }
      
      .scanner-frame {
        width: 200px;
        height: 200px;
        border: 2px solid #8000FF;
        border-radius: 20px;
        box-shadow: 0 0 0 5000px rgba(0, 0, 0, 0.5);
        position: relative;
      }
      
      .scanner-frame::before,
      .scanner-frame::after {
        content: '';
        position: absolute;
        width: 30px;
        height: 30px;
        border-color: #8000FF;
      }
      
      .scanner-frame::before {
        top: -2px;
        left: -2px;
        border-top: 4px solid;
        border-left: 4px solid;
        border-top-left-radius: 18px;
      }
      
      .scanner-frame::after {
        bottom: -2px;
        right: -2px;
        border-bottom: 4px solid;
        border-right: 4px solid;
        border-bottom-right-radius: 18px;
      }
      
      .qrcode-result {
        padding: 15px;
        background-color: #1a1a1a;
        border-radius: 8px;
        margin-top: 10px;
      }
      
      .qrcode-result-success {
        border-left: 4px solid #28a745;
      }
      
      .qrcode-result-error {
        border-left: 4px solid #dc3545;
      }
      
      .qrcode-result-warning {
        border-left: 4px solid #ffc107;
      }
      
      .valid-qrcode, .invalid-qrcode, .validated-qrcode {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .qrcode-verification-success {
        color: #28a745;
        font-weight: bold;
        font-size: 18px;
      }
      
      .qrcode-verification-error {
        color: #dc3545;
        font-weight: bold;
        font-size: 18px;
      }
      
      .qrcode-validation-success {
        color: #28a745;
        font-weight: bold;
        font-size: 18px;
      }
      
      .qrcode-detail-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 14px;
        margin-bottom: 5px;
      }
      
      .qrcode-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      
      .btn-success {
        background: linear-gradient(45deg, #28a745, #20c997);
      }
      
      .btn-secondary {
        background-color: #6c757d;
      }
      
      .hidden {
        display: none;
      }
      
      /* Estilos específicos para a entrada de teste manual */
      .test-input-container {
        margin-top: 15px;
        padding: 15px;
        background-color: #1a1a1a;
        border-radius: 8px;
        border: 1px dashed #666;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        max-width: 500px;
      }
      
      .test-input-container label {
        font-size: 14px;
        color: #ccc;
        margin-bottom: -5px;
      }
      
      #test-qrcode-input {
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #444;
        background-color: #333;
        color: white;
        width: 100%;
        font-family: monospace;
      }
      
      #test-qrcode-btn {
        align-self: flex-end;
        background-color: #6c757d;
        padding: 8px 20px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      #test-qrcode-btn:hover {
        background-color: #5a6268;
      }
      
      @media (min-width: 768px) {
        .test-input-container {
          flex-direction: row;
          align-items: flex-end;
        }
        
        .test-input-container > div {
          flex: 1;
        }
        
        #test-qrcode-btn {
          align-self: center;
        }
      }
    `;
    document.head.appendChild(styles);
  }
}