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

function addTestMode() {
  const scanBtnContainer = document.querySelector('.scan-btn-container');
  if (!scanBtnContainer) return;

  const testModeHTML = `
    <div class="test-input-container" style="margin-top: 15px;">
      <input type="text" id="test-qrcode-input" placeholder="Digite o código QR para teste" style="padding: 8px; width: 250px; margin-right: 10px;">
      <button id="test-qrcode-btn" class="btn btn-secondary">Testar</button>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = testModeHTML;
  scanBtnContainer.appendChild(div);

  document.getElementById('test-qrcode-btn').addEventListener('click', () => {
    const testInput = document.getElementById('test-qrcode-input');
    if (testInput && testInput.value.trim()) {
      window.checkQRCode(testInput.value.trim());
    }
  });
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
          checkQRCode(code.data);
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
 * Configura os eventos da interface de validação
 */
export async function setupQRCodeValidator() {
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
  let currentQRCode = null;

  // Função global para verificar QR Code (será chamada pelo scanner)
  window.checkQRCode = async (qrValue) => {
    if (!qrValue || qrValue.trim() === '') {
      showResult('QR Code inválido ou vazio', 'warning');
      return;
    }

    currentQRCode = qrValue;
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

      if (response.ok && data.isValid) {
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
        currentQRCode = null;
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
      currentQRCode = null;
    } finally {
      document.getElementById('start-scan-btn').disabled = false;
      document.getElementById('start-scan-btn').textContent = 'Escanear QR Code';
    }
  };

  // Função para validar (usar) QR Code
  const validateQRCode = async () => {
    if (!currentQRCode) return;

    validateButton.disabled = true;
    validateButton.textContent = 'Validando...';

    try {
      // Chamar o endpoint autenticado para usar o QR Code
      // O cookie será enviado automaticamente devido a 'credentials: include'
      const response = await fetch(`/api/qrcode/use/${encodeURIComponent(currentQRCode)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include' // Isso garante que cookies sejam enviados
      });

      const data = await response.json();

      if (response.ok) {
        // QR Code usado com sucesso
        showResult(`
        <div class="validated-qrcode">
          <div class="qrcode-validation-success">✓ QR Code Validado com Sucesso</div>
          <div class="qrcode-detail-item">QR Code marcado como utilizado.</div>
        </div>
      `, 'success');

        // Limpar estado e interface
        currentQRCode = null;
        buttonsContainer.classList.add('hidden');

        // Após 3 segundos, limpar o resultado e permitir novo escaneamento
        setTimeout(() => {
          resultContainer.classList.add('hidden');
        }, 3000);
      } else {
        // Erro ao usar QR Code
        showResult(`
        <div class="invalid-qrcode">
          <div class="qrcode-verification-error">✗ Erro ao Validar</div>
          <div class="qrcode-error-message">${data.message || 'Não foi possível validar este QR Code.'}</div>
        </div>
      `, 'error');
      }
    } catch (error) {
      console.error('Erro ao validar QR Code:', error);
      showResult(`
      <div class="invalid-qrcode">
        <div class="qrcode-verification-error">✗ Erro ao Validar</div>
        <div class="qrcode-error-message">${error.message || 'Ocorreu um erro ao validar o QR Code.'}</div>
      </div>
    `, 'error');
    } finally {
      validateButton.disabled = false;
      validateButton.textContent = 'Validar Entrada';
    }
  };

  // Função para cancelar validação
  const cancelValidation = () => {
    resultContainer.classList.add('hidden');
    buttonsContainer.classList.add('hidden');
    currentQRCode = null;
  };

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

  // Adicionar eventos aos elementos
  validateButton.addEventListener('click', validateQRCode);
  cancelButton.addEventListener('click', cancelValidation);

  // Configurar o scanner de QR Code
  await setupQRScanner();

  // Adicionar modo de teste (temporário, para desenvolvimento)
  addTestMode();
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
        justify-content: center;
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
    `;
    document.head.appendChild(styles);
  }
}