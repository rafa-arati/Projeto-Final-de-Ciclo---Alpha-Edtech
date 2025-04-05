import { createPromotion, getEventPromotions } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { navigateTo } from '../../modules/router.js';

// Variável para armazenar o ID do QR Code a ser excluído
let qrCodeToDelete = null;

/**
 * Configura manipuladores de eventos relacionados aos QR Codes
 * @param {string} eventId - ID do evento
 * @param {Array} qrCodes - Lista de QR Codes iniciais
 */
export function setupEventHandlers(eventId, qrCodes) {
    // Botão de criar QR Code/Promoção
    const createQRCodeBtn = document.getElementById('create-qrcode-btn');
    if (createQRCodeBtn) {
        createQRCodeBtn.addEventListener('click', () => {
            const modal = document.getElementById('qrcode-modal');
            if (modal) modal.classList.add('active');
        });
        createQRCodeBtn.title = "Criar Promoção";
    }

    // Botão de visualizar QR Codes
    const viewQRCodesBtn = document.getElementById('view-qrcodes-btn');
    if (viewQRCodesBtn) {
        viewQRCodesBtn.addEventListener('click', async () => {
            try {
                // Buscar promoções do evento para o admin
                const promotions = await getEventPromotions(eventId);

                // Obter o nome do evento a partir da página
                const eventName = document.getElementById('event-title')?.textContent || 'Evento';

                // Atualizar o conteúdo do modal
                const modal = document.getElementById('view-qrcodes-modal');
                const modalTitle = modal.querySelector('h3');
                const qrCodesList = document.getElementById('qrcodes-list');

                modalTitle.textContent = `Promoções para ${eventName}`;

                if (promotions && promotions.length > 0) {
                    qrCodesList.innerHTML = renderPromotionsListAdmin(promotions, eventId);
                } else {
                    qrCodesList.innerHTML = '<p>Nenhuma promoção criada para este evento.</p>';
                }

                // Configurar botões de exclusão
                setupDeleteButtons();

                // Mostrar o modal
                if (modal) {
                    modal.classList.add('active');
                }
            } catch (error) {
                console.error('Erro ao carregar promoções:', error);
                showMessage(`Erro ao carregar promoções: ${error.message}`);
            }
        });
    }

    // Botão de voltar
    document.getElementById('back-button')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('events');
    });

    // Botões para fechar modais
    document.getElementById('close-qrcode-modal')?.addEventListener('click', () => {
        document.getElementById('qrcode-modal').classList.remove('active');
    });

    document.getElementById('close-view-qrcodes-modal')?.addEventListener('click', () => {
        document.getElementById('view-qrcodes-modal').classList.remove('active');
    });

    // Configuração do modal de exclusão de QR Code
    setupDeleteModal(eventId);

    // Configurar formulário de criação de QR Code/promoção
    setupQRCodeForm(eventId);

    // Mudar exibição se o tipo de benefício for desconto
    const benefitTypeSelect = document.getElementById('qrcode-benefit-type');
    const discountGroup = document.getElementById('discount-group');

    if (benefitTypeSelect && discountGroup) {
        benefitTypeSelect.addEventListener('change', function () {
            if (this.value === 'discount') {
                discountGroup.style.display = 'block';
            } else {
                discountGroup.style.display = 'none';
            }
        });
    }

    // Clique fora do modal para fechar
    setupModalOutsideClick();

    // Inicializar configuração de botões de exclusão
    setupDeleteButtons();
}

/**
 * Configura o formulário de criação de QR Code/promoção
 * @param {string} eventId - ID do evento
 */
function setupQRCodeForm(eventId) {
    const qrcodeForm = document.getElementById('qrcode-form');

    if (qrcodeForm) {
        qrcodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const description = document.getElementById('qrcode-description').value;
            const benefitType = document.getElementById('qrcode-benefit-type').value;
            const benefitDescription = document.getElementById('qrcode-benefit-description').value;
            const maxCodes = document.getElementById('qrcode-max-codes').value;
            const generationDeadline = document.getElementById('qrcode-generation-deadline').value;
            const usageDeadline = document.getElementById('qrcode-usage-deadline').value;

            let discountPercentage = null;
            if (benefitType === 'discount') {
                discountPercentage = document.getElementById('qrcode-discount').value;
            }

            try {
                await createPromotion({
                    eventId,
                    description,
                    benefitType,
                    benefitDescription,
                    discountPercentage,
                    maxCodes: maxCodes || null,
                    generationDeadline: generationDeadline || null,
                    usageDeadline: usageDeadline || null
                });

                // Fechar modal
                document.getElementById('qrcode-modal').classList.remove('active');

                // Mostrar mensagem de sucesso
                showMessage('Promoção criada com sucesso!');

                // Limpar o formulário para nova entrada
                qrcodeForm.reset();

                // Atualizar a lista de promoções
                await refreshQRCodesList(eventId);

            } catch (error) {
                console.error('Erro ao criar promoção:', error);
                showMessage(error.message || 'Erro ao criar promoção');
            }
        });
    }
}

/**
 * Configura o modal de exclusão
 * @param {string} eventId - ID do evento
 */
function setupDeleteModal(eventId) {
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const closeDeleteModal = document.getElementById('close-delete-qrcode-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-qrcode');
    const cancelDeleteBtn = document.getElementById('cancel-delete-qrcode');

    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', () => {
            deleteModal.classList.remove('active');
            qrCodeToDelete = null;
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.classList.remove('active');
            qrCodeToDelete = null;
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!qrCodeToDelete) {
                deleteModal.classList.remove('active');
                return;
            }

            try {
                const response = await fetch(`/api/qrcode/${qrCodeToDelete}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao excluir QR Code');
                }

                showMessage('QR Code excluído com sucesso!');

                // Atualizar a lista de QR Codes imediatamente
                await refreshQRCodesList(eventId);

            } catch (error) {
                console.error('Erro ao excluir QR Code:', error);
                showMessage(error.message || 'Erro ao excluir QR Code');
            } finally {
                deleteModal.classList.remove('active');
                qrCodeToDelete = null;
            }
        });
    }
}

/**
 * Configura fechamento de modais ao clicar fora
 */
function setupModalOutsideClick() {
    window.addEventListener('click', (event) => {
        const qrcodeModal = document.getElementById('qrcode-modal');
        if (event.target === qrcodeModal) {
            qrcodeModal.classList.remove('active');
        }

        const viewQrcodesModal = document.getElementById('view-qrcodes-modal');
        if (event.target === viewQrcodesModal) {
            viewQrcodesModal.classList.remove('active');
        }

        const deleteModal = document.getElementById('delete-qrcode-modal');
        if (event.target === deleteModal) {
            deleteModal.classList.remove('active');
            qrCodeToDelete = null;
        }
    });
}

/**
 * Configura botões de exclusão de QR Code
 */
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-qr-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Armazenar o ID do QR Code a ser excluído
            qrCodeToDelete = button.getAttribute('data-id');

            // Mostrar o modal de confirmação
            const deleteModal = document.getElementById('delete-qrcode-modal');
            if (deleteModal) {
                deleteModal.classList.add('active');
            }
        });
    });
}

/**
 * Atualiza a lista de QR Codes no modal
 * @param {string} eventId - ID do evento
 * @returns {Array} Lista atualizada de QR Codes
 */
export async function refreshQRCodesList(eventId) {
    try {
        const response = await fetch(`/api/qrcode/event/${eventId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar QR Codes');
        }

        const qrCodes = await response.json();

        // Atualiza a lista de QR Codes no DOM
        const qrCodesList = document.getElementById('qrcodes-list');
        if (qrCodesList) {
            qrCodesList.innerHTML = qrCodes.length > 0
                ? renderQRCodesList(qrCodes)
                : '<p>Nenhum QR Code criado para este evento.</p>';

            // Adiciona eventos aos novos botões de exclusão
            setupDeleteButtons();
        }

        return qrCodes;
    } catch (error) {
        console.error('Erro ao atualizar lista de QR Codes:', error);
        return [];
    }
}

/**
 * Renderiza a lista de QR Codes
 * @param {Array} qrCodes - Lista de QR Codes
 * @returns {string} HTML da lista
 */
export function renderQRCodesList(qrCodes) {
    if (!qrCodes || qrCodes.length === 0) {
        return '<p>Nenhum QR Code encontrado.</p>';
    }

    return `
    <div class="qr-codes-grid">
      ${qrCodes.map(qr => {
        // Determinar status do QR Code
        let status = 'Ativo';
        let statusClass = 'status-active';

        if (qr.is_used) {
            status = 'Utilizado';
            statusClass = 'status-used';
        } else if (qr.valid_until && new Date(qr.valid_until) < new Date()) {
            status = 'Expirado';
            statusClass = 'status-expired';
        }

        // Formatar descrição do benefício
        const benefitDesc = qr.benefit_type === 'discount'
            ? `${qr.discount_percentage}% de desconto`
            : qr.benefit_description;

        return `
          <div class="qr-code-card">
            <div class="qr-code-header">
              <span class="qr-code-status ${statusClass}">${status}</span>
              <button class="delete-qr-btn" data-id="${qr.id}">×</button>
            </div>
            
            <div class="qr-code-img">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr.qr_code_value}" alt="QR Code">
            </div>
            
            <div class="qr-code-info">
              <p class="qr-code-description">${qr.description}</p>
              <p class="qr-code-benefit">${benefitDesc}</p>
              ${qr.valid_until ? `<p class="qr-code-expiry">Válido até: ${new Date(qr.valid_until).toLocaleString('pt-BR')}</p>` : ''}
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;
}

/**
 * Renderiza a lista de promoções para administradores
 * @param {Array} promotions - Lista de promoções
 * @param {string} eventId - ID do evento
 * @returns {string} HTML da lista
 */
export function renderPromotionsListAdmin(promotions, eventId) {
    if (!promotions || promotions.length === 0) {
        return '<p>Nenhuma promoção encontrada.</p>';
    }

    return `
    <div class="qr-codes-grid">
      ${promotions.map(promotion => {
        // Determinar status da promoção
        let status = 'Ativa';
        let statusClass = 'status-active';

        if (promotion.generation_deadline && new Date(promotion.generation_deadline) < new Date()) {
            status = 'Encerrada';
            statusClass = 'status-expired';
        }

        // Formatar informações de limite
        const limitInfo = promotion.max_codes
            ? `Limite: ${promotion.max_codes} códigos (${promotion.remaining_codes} restantes)`
            : 'Sem limite de códigos';

        return `
          <div class="qr-code-card">
            <div class="qr-code-header">
              <span class="qr-code-status ${statusClass}">${status}</span>
              <button class="delete-qr-btn" data-id="${promotion.id}">×</button>
            </div>
            
            <div class="qr-code-info">
              <p class="qr-code-description">${promotion.description || 'Promoção'}</p>
              <p class="qr-code-benefit">${getBenefitDescription(promotion)}</p>
              <p class="qr-code-limit">${limitInfo}</p>
              ${promotion.generation_deadline ?
                `<p class="qr-code-expiry">Geração até: ${formatExpirationDate(promotion.generation_deadline)}</p>` : ''}
              ${promotion.usage_deadline ?
                `<p class="qr-code-expiry">Uso até: ${formatExpirationDate(promotion.usage_deadline)}</p>` : ''}
              <p class="qr-code-stats">Códigos gerados: ${promotion.generated_codes || 0}</p>
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;
}

/**
 * Renderiza QR Codes do usuário
 * @param {Array} userQRCodes - Lista de QR Codes do usuário
 * @returns {string} HTML dos QR Codes
 */
export function renderUserQRCodes(userQRCodes) {
    return userQRCodes.map(qr => {
        // Determinar status do QR Code
        let status = 'Ativo';
        let statusClass = 'status-active';

        if (qr.status === 'usado' || qr.is_used) {
            status = 'Utilizado';
            statusClass = 'status-used';
        } else if (qr.usage_deadline && new Date(qr.usage_deadline) < new Date()) {
            status = 'Expirado';
            statusClass = 'status-expired';
        }

        return `
      <div class="qr-code-card">
        <div class="qr-code-header">
          <span class="qr-code-status ${statusClass}">${status}</span>
        </div>
        
        <div class="qr-code-img">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr.qr_code_value}" alt="QR Code">
        </div>
        
        <div class="qr-code-info">
          <p class="qr-code-description">${qr.description || 'Promoção'}</p>
          <p class="qr-code-benefit">${getBenefitDescription(qr)}</p>
          ${qr.usage_deadline ? `<p class="qr-code-expiry">Válido até: ${formatExpirationDate(qr.usage_deadline)}</p>` : ''}
        </div>
      </div>
    `;
    }).join('');
}

/**
 * Formata a data de expiração para exibição
 * @param {string} dateString - Data em formato string
 * @returns {string} Data formatada
 */
export function formatExpirationDate(dateString) {
    if (!dateString) return 'Data não definida';

    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

/**
 * Verifica se uma promoção ainda está disponível
 * @param {Object} promotion - Dados da promoção
 * @returns {boolean} Se a promoção está disponível
 */
export function isPromotionAvailable(promotion) {
    // Verificar se já passou da data limite de geração
    if (promotion.generation_deadline && new Date(promotion.generation_deadline) < new Date()) {
        return false;
    }

    // Verificar se atingiu o limite de códigos gerados
    if (promotion.max_codes !== null && promotion.generated_codes >= promotion.max_codes) {
        return false;
    }

    return true;
}

/**
 * Calcula o tempo restante em formato amigável
 * @param {string} dateString - Data em formato string
 * @returns {string} Tempo restante formatado
 */
export function getRemainingTime(dateString) {
    if (!dateString) return '';

    const targetDate = new Date(dateString);
    const now = new Date();

    // Verificar se já passou da data
    if (targetDate <= now) {
        return 'Encerrado';
    }

    const diffMs = targetDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
    } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    } else {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }
}

/**
 * Obtém a descrição do benefício
 * @param {Object} promotion - Dados da promoção
 * @returns {string} Descrição formatada
 */
export function getBenefitDescription(promotion) {
    if (promotion.benefit_type === 'discount' && promotion.discount_percentage) {
        return `${promotion.discount_percentage}% de desconto`;
    }
    return promotion.benefit_description || 'Benefício especial';
}