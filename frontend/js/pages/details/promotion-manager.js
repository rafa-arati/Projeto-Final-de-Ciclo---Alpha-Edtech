import { generateUserQRCode } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { formatExpirationDate, isPromotionAvailable, getRemainingTime, getBenefitDescription } from './qrcode-manager.js';

/**
 * Renderiza promoções para usuários comuns na página
 * @param {Array} promotions - Lista de promoções
 * @param {Array} userQRCodes - Lista de QR Codes do usuário
 */
export function renderPromotionsForUser(promotions, userQRCodes) {
    if (!promotions || promotions.length === 0) return;

    let promotionsHTML = `
    <section class="event-promotions">
      <h2 class="section-title">Promoções Disponíveis</h2>
      <div class="promotions-list">
        ${renderPromotionsList(promotions, userQRCodes)}
      </div>
    </section>
  `;

    // Inserir no DOM após a descrição do evento
    const eventDescriptionSection = document.querySelector('.event-description');
    if (eventDescriptionSection) {
        const promotionsSection = document.createElement('div');
        promotionsSection.innerHTML = promotionsHTML;
        eventDescriptionSection.after(promotionsSection);

        // Configurar eventos para botões de geração
        setupPromotionButtons();
    }
}

/**
 * Renderiza a lista de promoções para usuários
 * @param {Array} promotions - Lista de promoções
 * @param {Array} userQRCodes - Lista de QR Codes do usuário
 * @returns {string} HTML da lista de promoções
 */
function renderPromotionsList(promotions, userQRCodes) {
    if (!promotions || promotions.length === 0) {
        return '<p>Nenhuma promoção disponível para este evento.</p>';
    }

    return `
    <div class="promotions-container">
      ${promotions.map(promotion => {
        // Verificar se o usuário já gerou um QR Code para esta promoção
        const alreadyGenerated = userQRCodes.some(qr => qr.promotion_id === promotion.promotion_id);

        // Verificar se a promoção ainda está disponível
        const isAvailable = isPromotionAvailable(promotion);

        // Formatar informações de limite
        let limitInfo = '';
        if (promotion.max_codes !== null) {
            const remaining = promotion.max_codes - promotion.generated_codes;
            limitInfo = `<span class="promotion-limit">${remaining} de ${promotion.max_codes} disponíveis</span>`;
        }

        // Formatar informações de prazo
        let timeInfo = '';
        if (promotion.generation_deadline) {
            const remainingTime = getRemainingTime(promotion.generation_deadline);
            timeInfo = `<span class="promotion-time">Validade para gerar: ${remainingTime}</span>`;
        }

        // Formatar o botão baseado no estado
        let actionButton = '';
        if (alreadyGenerated) {
            actionButton = `<button class="btn disabled" disabled>QR Code já gerado</button>`;
        } else if (!isAvailable) {
            actionButton = `<button class="btn disabled" disabled>Promoção indisponível</button>`;
        } else {
            actionButton = `<button class="btn generate-qrcode-btn" data-promotion-id="${promotion.promotion_id}">Gerar meu QR Code</button>`;
        }

        return `
          <div class="promotion-card">
            <div class="promotion-header">
              <h3>${promotion.description || 'Promoção Especial'}</h3>
              ${timeInfo}
            </div>
            
            <div class="promotion-details">
              <p>${getBenefitDescription(promotion)}</p>
              ${limitInfo}
              <p class="promotion-expiry">Promoção válida até: ${formatExpirationDate(promotion.usage_deadline)}</p>
            </div>
            
            <div class="promotion-action">
              ${actionButton}
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;
}

/**
 * Configura os botões de geração de QR Code
 */
function setupPromotionButtons() {
    document.querySelectorAll('.generate-qrcode-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const promotionId = this.getAttribute('data-promotion-id');
            if (!promotionId) return;

            try {
                // Desabilitar botão durante a requisição
                this.disabled = true;
                this.textContent = 'Gerando...';

                await generateUserQRCode(promotionId);

                // Sucesso
                showMessage('QR Code gerado com sucesso!');
                setTimeout(() => window.location.reload(), 1500);

            } catch (error) {
                console.error('Erro ao gerar QR Code:', error);
                showMessage(error.message || 'Erro ao gerar QR Code');

                // Reabilitar botão
                this.disabled = false;
                this.textContent = 'Gerar meu QR Code';
            }
        });
    });
}