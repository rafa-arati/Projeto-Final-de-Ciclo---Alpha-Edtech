import { generateUserQRCode } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { formatExpirationDate, isPromotionAvailable, getRemainingTime, getBenefitDescription } from './qrcode-manager.js'; // Reutiliza helpers

// Referências locais para estado dinâmico
let localUserQRCodes = [];
let localPromotions = []; // <<< Guarda as promoções carregadas

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
function renderPromotionsList(promotionsToRender, currentLocalUserQRCodes) {
    if (!promotionsToRender || promotionsToRender.length === 0) {
        return '<p class="no-promotions-message">Nenhuma promoção disponível no momento.</p>';
    }

    return promotionsToRender.map(promotion => {
        const userQRCode = currentLocalUserQRCodes.find(qr => qr.promotion_id === promotion.promotion_id);
        const isAvailable = isPromotionAvailable(promotion); // Disponível para GERAR
        const remainingTime = getRemainingTime(promotion.generation_deadline);
        const useDeadlineFormatted = formatExpirationDate(promotion.usage_deadline);

        // Usa a função helper para gerar o span de limite/status inicial
        const limitInfoHTML = generateLimitSpanHTML(promotion);

        let actionContent = '';
        // Verifica se esgotado para o botão (usa a propriedade isEsgotado calculada no helper)
        const generated = promotion.generated_codes || 0;
        const isEsgotado = promotion.max_codes !== null && generated >= promotion.max_codes;

        if (userQRCode) {
            const qrValue = userQRCode.qr_code_value;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}&bgcolor=1c1c1e&color=ffffff&q=L&margin=1`;
            actionContent = `
                <div class="qr-code-display-container" title="Seu QR Code">
                    <img src="${qrImageUrl}" alt="Seu QR Code para ${promotion.description || 'promoção'}" loading="lazy" class="generated-qr-image">
                    <span class="qr-code-value-text">${qrValue}</span>
                </div>
            `;
        } else if (isAvailable && !isEsgotado) { // Botão só aparece se disponível E não esgotado
            actionContent = `<button class="btn generate-qrcode-btn" data-promotion-id="${promotion.promotion_id}">Gerar meu QR Code</button>`;
        } else {
            const reason = isEsgotado ? 'esgotada' : (remainingTime === 'Encerrado' ? 'encerrada' : 'indisponível');
            actionContent = `<button class="btn disabled" disabled title="Esta promoção não está mais disponível para gerar QR Code">Promoção ${reason}</button>`;
        }

        return `
          <div class="promotion-card" data-promotion-ref-id="${promotion.promotion_id}">
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
 */
async function handleGenerateButtonClick(event) {
    if (!event.target.matches('.generate-qrcode-btn')) return;

    const button = event.target;
    const promotionId = button.getAttribute('data-promotion-id');
    if (!promotionId) return;

    const card = button.closest('.promotion-card'); // Encontra o card pai
    const actionContainer = card ? card.querySelector('.promotion-action') : null; // Container do botão/QR
    const limitSpan = card ? card.querySelector('.promotion-limit') : null; // <<< Encontra o span do limite

    if (!actionContainer) return;

    button.disabled = true;
    button.textContent = 'Gerando...';

    try {
        const result = await generateUserQRCode(promotionId); // Chama API
        if (!result || !result.qrCode || !result.qrCode.qr_code_value) {
            throw new Error("Resposta inválida da API ao gerar QR Code.");
        }
        const newQRCodeData = result.qrCode;

        // 1. Substitui o Botão pelo QR Code no DOM (como antes)
        const qrValue = newQRCodeData.qr_code_value;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}&bgcolor=1c1c1e&color=ffffff&q=L&margin=1`;
        actionContainer.innerHTML = `
            <div class="qr-code-display-container" title="Seu QR Code">
                <img src="${qrImageUrl}" alt="Seu QR Code para ${newQRCodeData.description || 'promoção'}" loading="lazy" class="generated-qr-image">
                <span class="qr-code-value-text">${qrValue}</span>
            </div>
        `;

        // 2. Atualiza o estado local do QR Code (como antes)
        localUserQRCodes.push(newQRCodeData);

        // <<< --- ATUALIZAÇÃO DO CONTADOR DE DISPONIBILIDADE --- >>>
        if (limitSpan) {
            // Encontra a promoção correspondente nos dados locais
            const promotion = localPromotions.find(p => p.promotion_id === promotionId);
            if (promotion) {
                 // Incrementa a contagem localmente (IMPORTANTE: ?? 0 para evitar NaN se for null)
                 promotion.generated_codes = (promotion.generated_codes ?? 0) + 1;

                 // Recalcula o status e o texto
                 let updatedLimitText = '';
                 let updatedLimitClass = '';
                 let updatedIsEsgotado = false;

                 if (promotion.max_codes !== null) {
                    const generated = promotion.generated_codes;
                    const max = promotion.max_codes;
                    const remaining = Math.max(0, max - generated);
                    updatedIsEsgotado = remaining <= 0;
                    updatedLimitClass = updatedIsEsgotado ? 'limit-exhausted' : 'limit-available';
                    updatedLimitText = updatedIsEsgotado ? 'Esgotado' : `${remaining} de ${max} disponíveis`;
                 } else {
                     // Se não havia limite, o texto não muda
                     updatedLimitClass = 'limit-available';
                     updatedLimitText = limitSpan.textContent; // Mantém o texto original ("Disponível (sem limite)" ou vazio)
                 }

                 // Atualiza o texto e a classe do span
                 limitSpan.textContent = updatedLimitText;
                 limitSpan.className = `promotion-limit ${updatedLimitClass}`; // Atualiza a classe
                 console.log(`Status de limite atualizado para promoção ${promotionId}: ${updatedLimitText}`);
            } else {
                console.warn(`Promoção ${promotionId} não encontrada nos dados locais para atualizar contador.`);
            }
        } else {
             console.warn("Span .promotion-limit não encontrado no card para atualizar.");
        }
        // <<< --- FIM DA ATUALIZAÇÃO DO CONTADOR --- >>>

        showMessage('QR Code gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        showMessage(error.message || 'Erro ao gerar QR Code. Tente novamente.');
        button.disabled = false; // Reabilita botão em caso de erro
        button.textContent = 'Gerar meu QR Code';
    }
}