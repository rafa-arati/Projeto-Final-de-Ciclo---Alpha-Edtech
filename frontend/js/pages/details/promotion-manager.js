import { generateUserQRCode } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { formatExpirationDate, isPromotionAvailable, getRemainingTime, getBenefitDescription } from './qrcode-manager.js'; // Reutiliza helpers
import { getLoggedInUser } from '../../modules/store.js'; 
import { getToken } from '../../modules/auth.js'; 

// Referências locais para estado dinâmico
let localUserQRCodes = [];
let localPromotions = []; // <<< Guarda as promoções carregadas
let socket = null;

function setupWebSocketConnection() {
    const user = getLoggedInUser();
    if (!user || socket) { // Não conecta se não logado ou já conectado
         if(socket) console.log("WebSocket já conectado.");
         return;
    }

    console.log("Tentando conectar ao WebSocket...");
    // Conecta ao servidor WebSocket (geralmente a mesma URL do seu servidor HTTP)
    socket = io({
         // Opcional: Enviar token para autenticação no backend
         // auth: { token: getToken() } // Descomente se implementou autenticação no backend
    });

    socket.on('connect', () => {
        console.log('Conectado ao servidor WebSocket com ID:', socket.id);

        // Se implementou autenticação no backend, emita o evento 'authenticate'
        const token = getToken(); // Pega o token JWT do cookie ou localStorage
        if(token) {
            socket.emit('authenticate', token);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('Desconectado do WebSocket:', reason);
        socket = null; // Limpa a referência
    });

    socket.on('connect_error', (error) => {
        console.error('Erro na conexão WebSocket:', error);
        socket = null; // Limpa a referência
    });

    socket.on('qrCodeStatusUpdate', (data) => {
        console.log('Recebido evento qrCodeStatusUpdate:', data);
        // Verifica se temos os dados necessários e o status é 'usado'
        if (data && data.promotionId && data.qrCodeValue && data.status === 'usado') {
            
            // Encontra o CARD da promoção usando o promotionId
            const promotionCard = document.querySelector(`.promotion-card[data-promotion-ref-id="${data.promotionId}"]`);
    
            if (promotionCard) {
                 console.log(`Atualizando card da Promoção ${data.promotionId} para 'usado' via WebSocket.`);
                 
                 // Encontra a área de ação dentro do card específico
                 const actionContainer = promotionCard.querySelector('.promotion-action');
                 if (actionContainer) {
                     // Substitui o conteúdo pela mensagem "Utilizado"
                     actionContainer.innerHTML = `<div class="qr-code-used-message" style="color: var(--accent-secondary, #00E5FF); font-weight: bold;">QR Code Utilizado!</div>`;
                 }
                 
                 // Adiciona a classe CSS para estilização adicional
                 promotionCard.classList.add('used-qrcode-card');
    
            } else {
                 console.warn(`Card para Promoção ${data.promotionId} não encontrado para atualização WebSocket.`);
            }
        }
    });
}

function disconnectWebSocket() {
    if (socket) {
        console.log("Desconectando WebSocket...");
        socket.disconnect();
        socket = null;
    }
}

/**
 * Renderiza promoções para usuários comuns na página
 * @param {Array} promotions - Lista de promoções disponíveis para o evento
 * @param {Array} userQRCodesForEvent - Lista de QR Codes que o usuário JÁ gerou PARA ESTE EVENTO
 */
export function renderPromotionsForUser(promotions, userQRCodesForEvent) {
    const container = document.getElementById('user-promotions-container');
    if (!container) return;

    // Atualiza referências locais
    localUserQRCodes = [...userQRCodesForEvent];
    localPromotions = [...promotions]; // <<< Armazena as promoções

    console.log(`Renderizando ${localPromotions.length} promoções. Usuário já tem ${localUserQRCodes.length} QR Codes para este evento.`);

    if (localPromotions.length === 0) {
        container.innerHTML = `
            <section class="event-promotions content-section">
              <h2 class="section-title">Promoções Disponíveis</h2>
              <p class="no-promotions-message">Nenhuma promoção disponível no momento.</p>
            </section>
        `;
        return;
    }

    container.innerHTML = `
        <section class="event-promotions content-section">
          <h2 class="section-title">Promoções Disponíveis</h2>
          <div class="promotions-list promotions-container">
            ${renderPromotionsList(localPromotions, localUserQRCodes)}
          </div>
        </section>
    `;

    setupPromotionButtons(); // Não precisa passar promoções aqui, pegará da var local
}

/**
 * Gera o HTML da lista de cards de promoções
 * @param {Array} promotionsToRender - Lista de promoções a serem renderizadas
 * @param {Array} currentLocalUserQRCodes - Array atualizado dos QR Codes do usuário
 * @returns {string} HTML da lista de promoções
 */
// frontend/js/pages/details/promotion-manager.js

// Encontre a função renderPromotionsList e substitua seu conteúdo interno
function renderPromotionsList(promotionsToRender, currentLocalUserQRCodes) {
    if (!promotionsToRender || promotionsToRender.length === 0) {
        return '<p class="no-promotions-message">Nenhuma promoção disponível no momento.</p>';
    }

    return promotionsToRender.map(promotion => {
        // Encontra QUALQUER QR code (gerado ou usado) para esta promoção pelo usuário
        const userQRCode = currentLocalUserQRCodes.find(qr => qr.promotion_id === promotion.promotion_id);

        // Lógica de disponibilidade e prazos (mantida)
        const isAvailable = isPromotionAvailable(promotion);
        const remainingTime = getRemainingTime(promotion.generation_deadline);
        const useDeadlineFormatted = formatExpirationDate(promotion.usage_deadline);
        const limitInfoHTML = generateLimitSpanHTML(promotion);
        const generated = promotion.generated_codes || 0;
        const isEsgotado = promotion.max_codes !== null && generated >= promotion.max_codes;

        let actionContent = '';

        // --- NOVA LÓGICA DE EXIBIÇÃO BASEADA NO STATUS ---
        if (userQRCode) { // Se o usuário tem um QR code para esta promo (gerado ou usado)
            if (userQRCode.status === 'gerado') {
                // 1. STATUS GERADO: Mostra a imagem do QR code
                const qrValue = userQRCode.qr_code_value;
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}&bgcolor=1c1c1e&color=ffffff&q=L&margin=1`;
                actionContent = `
                    <div class="qr-code-display-container" title="Seu QR Code">
                        <img src="${qrImageUrl}" alt="Seu QR Code" loading="lazy" class="generated-qr-image">
                        <span class="qr-code-value-text" data-qrcode-value="${qrValue}">${qrValue}</span> 
                    </div>`;
            } else if (userQRCode.status === 'usado') {
                // 2. STATUS USADO: Mostra a mensagem "Utilizado"
                actionContent = `<div class="qr-code-used-message" style="color: var(--accent-secondary, #00E5FF); font-weight: bold;">QR Code Utilizado!</div>`;
            } else {
                // 3. Outro status (inesperado, mas tratar): Mostra o status
                 actionContent = `<div class="qr-code-used-message" style="color: var(--text-tertiary); font-style: italic;">Status: ${userQRCode.status}</div>`;
            }
        } else if (isAvailable && !isEsgotado) {
            // 4. SEM QR CODE e PROMOÇÃO DISPONÍVEL/NÃO ESGOTADA: Mostra botão "Gerar"
            actionContent = `<button class="btn generate-qrcode-btn" data-promotion-id="${promotion.promotion_id}" style = "color: black">Gerar meu QR Code</button>`;
        } else {
            // 5. SEM QR CODE e PROMOÇÃO INDISPONÍVEL/ESGOTADA: Mostra botão desabilitado
            const reason = isEsgotado ? 'esgotada' : (remainingTime === 'Encerrado' ? 'encerrada' : 'indisponível');
            actionContent = `<button class="btn disabled" disabled title="Esta promoção não está mais disponível para gerar QR Code">Promoção ${reason}</button>`;
        }
        // --- FIM DA NOVA LÓGICA ---

        // Monta o HTML do card (adiciona a classe 'used-qrcode-card' se necessário)
        return `
          <div class="promotion-card ${userQRCode && userQRCode.status === 'usado' ? 'used-qrcode-card' : ''}" data-promotion-ref-id="${promotion.promotion_id}">
            <div class="promotion-header">
              <h3>${promotion.description || 'Promoção Especial'}</h3>
              ${remainingTime && remainingTime !== 'Sem prazo' && remainingTime !== 'Encerrado' ? `<span class="promotion-time">Gerar em: ${remainingTime}</span>` : ''}
            </div>
            <div class="promotion-details">
              <p>${getBenefitDescription(promotion)}</p>
              ${limitInfoHTML}
              <p class="promotion-expiry">Usar até: ${useDeadlineFormatted}</p>
            </div>
            <div class="promotion-action">
              ${actionContent}
            </div>
          </div>
        `;
    }).join('');
}

/**
 * Helper para gerar o HTML do span de limite de códigos com a classe correta.
 * @param {Object} promotion - Objeto da promoção.
 * @returns {string} HTML do span.
 */
function generateLimitSpanHTML(promotion) {
    let limitInfoText = '';
    let limitClass = '';
    let isEsgotado = false;

    if (promotion.max_codes !== null) {
        // Usa ?? 0 para garantir que generated_codes seja numérico
        const generated = promotion.generated_codes ?? 0;
        const max = promotion.max_codes;
        const remaining = Math.max(0, max - generated);
        isEsgotado = remaining <= 0;
        limitClass = isEsgotado ? 'limit-exhausted' : 'limit-available';
        limitInfoText = isEsgotado ? 'Esgotado' : `${remaining} de ${max} disponíveis`;
    } else {
        // Se não há limite, podemos mostrar um status "disponível" genérico ou nada
        limitClass = 'limit-available'; // Assume disponível se não há limite
        limitInfoText = 'Disponível (sem limite)'; // Ou deixe vazio: ''
    }

    // Retorna o HTML completo do span
    return `<span class="promotion-limit ${limitClass}">${limitInfoText}</span>`;
}


/**
 * Configura os eventos de clique para os botões "Gerar meu QR Code" usando event delegation
 */
function setupPromotionButtons() {
    const promotionsContainer = document.getElementById('user-promotions-container');
    if (!promotionsContainer) return;

    promotionsContainer.removeEventListener('click', handleGenerateButtonClick);
    promotionsContainer.addEventListener('click', handleGenerateButtonClick);
    console.log("Event delegation configurada para botões .generate-qrcode-btn.");
}

/**
 * Handler para o clique no botão de gerar QR code (usado com event delegation)
 * CORRIGIDO para evitar múltiplas atualizações de contador.
 */
async function handleGenerateButtonClick(event) {
    // Se o clique não foi no botão de gerar, ignora
    if (!event.target.matches('.generate-qrcode-btn')) return;

    const button = event.target;
    const promotionId = button.getAttribute('data-promotion-id');
    if (!promotionId) return;

    // --- TRAVA PARA EVITAR PROCESSAMENTO MÚLTIPLO ---
    // Verifica se o botão já está marcado como "processando"
    if (button.hasAttribute('data-processing')) {
        console.warn(`Botão para promoção ${promotionId} já está processando. Clique ignorado.`);
        return; // Sai da função se já estiver processando
    }
    // Marca o botão como "processando" para bloquear cliques subsequentes
    button.setAttribute('data-processing', 'true');
    // --- FIM DA TRAVA ---

    const card = button.closest('.promotion-card');
    const actionContainer = card ? card.querySelector('.promotion-action') : null;
    const limitSpan = card ? card.querySelector('.promotion-limit') : null;

    // Se não encontrar o container de ação, libera o botão e sai
    if (!actionContainer) {
         console.error("Container de ação não encontrado no card.");
         button.removeAttribute('data-processing'); // Libera a trava
         return;
    }

    // Desabilita o botão visualmente e muda o texto
    button.disabled = true;
    button.textContent = 'Gerando...';
    console.log(`[handleGenerateButtonClick] Iniciando geração para promoção ${promotionId}`);

    try {
        // Chama a API para gerar o QR Code
        const result = await generateUserQRCode(promotionId);
        // Valida a resposta da API
        if (!result || !result.qrCode || !result.qrCode.qr_code_value) {
            throw new Error("Resposta inválida da API ao gerar QR Code.");
        }
        const newQRCodeData = result.qrCode;
        console.log(`[handleGenerateButtonClick] QR Code ${newQRCodeData.qr_code_value} gerado com sucesso.`);

        // 1. Atualiza a UI para mostrar o QR Code gerado
        const qrValue = newQRCodeData.qr_code_value;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}&bgcolor=1c1c1e&color=ffffff&q=L&margin=1`;
        actionContainer.innerHTML = `
            <div class="qr-code-display-container" title="Seu QR Code">
                <img src="${qrImageUrl}" alt="Seu QR Code" loading="lazy" class="generated-qr-image">
                <span class="qr-code-value-text">${qrValue}</span>
            </div>
        `;

        // 2. Atualiza o array local que guarda os QR Codes do usuário
        localUserQRCodes.push(newQRCodeData);

        // 3. Atualiza o contador de disponibilidade (limitSpan) localmente
        if (limitSpan) {
            // Encontra a promoção correspondente no array local 'localPromotions'
            const promotion = localPromotions.find(p => p.promotion_id === promotionId);
            if (promotion) {
                console.log(`[handleGenerateButtonClick] Promoção ${promotionId} encontrada. Contagem ANTES: ${promotion.generated_codes ?? 0}`);

                // Incrementa a contagem localmente (APENAS UMA VEZ por execução bem-sucedida)
                promotion.generated_codes = (promotion.generated_codes ?? 0) + 1;
                console.log(`[handleGenerateButtonClick] Contagem DEPOIS do incremento local: ${promotion.generated_codes}`);

                // Recalcula texto e classe do span baseado na contagem ATUALIZADA
                let updatedLimitText = '';
                let updatedLimitClass = '';
                let updatedIsEsgotado = false;

                if (promotion.max_codes !== null) {
                    const generated = promotion.generated_codes; // Usa valor já incrementado
                    const max = promotion.max_codes;
                    const remaining = Math.max(0, max - generated);
                    updatedIsEsgotado = remaining <= 0;
                    updatedLimitClass = updatedIsEsgotado ? 'limit-exhausted' : 'limit-available';
                    updatedLimitText = updatedIsEsgotado ? 'Esgotado' : `${remaining} de ${max} disponíveis`;
                    console.log(`[handleGenerateButtonClick] Atualizando span para: ${updatedLimitText} (Restantes: ${remaining})`);
                } else {
                    // Promoção sem limite, mantém texto original
                    updatedLimitClass = 'limit-available';
                    updatedLimitText = limitSpan.textContent;
                    console.log(`[handleGenerateButtonClick] Promoção sem limite, mantendo texto: ${updatedLimitText}`);
                }

                // Atualiza o DOM do span
                limitSpan.textContent = updatedLimitText;
                limitSpan.className = `promotion-limit ${updatedLimitClass}`;

            } else {
                console.warn(`Promoção ${promotionId} não encontrada nos dados locais para atualizar contador.`);
            }
        } else {
             console.warn("Span .promotion-limit não encontrado no card para atualizar.");
        }

        showMessage('QR Code gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        showMessage(error.message || 'Erro ao gerar QR Code. Tente novamente.');
        // Reabilita o botão visualmente em caso de erro
        button.disabled = false;
        button.textContent = 'Gerar meu QR Code';
    } finally {
         // --- REMOVE A TRAVA do botão, permitindo novo clique ---
         button.removeAttribute('data-processing');
         console.log(`[handleGenerateButtonClick] Processamento finalizado para ${promotionId}. Botão liberado.`);
    }
}