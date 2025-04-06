// Arquivo: frontend/js/pages/details/qrcode-manager.js
// Gerencia a lógica de interação com QR Codes e Promoções na página de detalhes

import { createPromotion, getEventPromotions, deleteQRCode } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';

// Variáveis de módulo
let itemToDeleteId = null; // Armazena o ID do item (promoção/QR) a ser excluído
let currentEventId = null; // Armazena o ID do evento sendo visualizado

// --- Funções Auxiliares ---

/**
 * Formata a data para exibição (D/M/AAAA HH:MM).
 * @param {string | Date | null} dateString - Data.
 * @returns {string} Data formatada ou 'Sem data limite'.
 */
export function formatExpirationDate(dateString) {
    if (!dateString) return 'Sem data limite';
    try {
        const date = new Date(dateString);
        // Verifica se a data é válida antes de formatar
        if (isNaN(date.getTime())) {
            throw new Error("Data inválida recebida");
        }
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        console.error("Erro ao formatar data:", dateString, e);
        return 'Data inválida';
    }
}

/**
 * Obtém a descrição formatada do benefício.
 * @param {Object} promoOrQr - Objeto da promoção ou QR Code.
 * @returns {string} Descrição do benefício.
 */
export function getBenefitDescription(promoOrQr) {
    if (!promoOrQr) return 'Benefício não especificado';
    if (promoOrQr.benefit_type === 'discount' && promoOrQr.discount_percentage) {
        return `Desconto de ${promoOrQr.discount_percentage}%`;
    }
    // Retorna a descrição do benefício OU a descrição geral da promoção se a específica não existir
    return promoOrQr.benefit_description || promoOrQr.description || 'Benefício especial';
}

/**
 * Calcula o tempo restante para uma data.
 * @param {string | Date | null} dateString - Data limite.
 * @returns {string} Tempo restante formatado ou 'Encerrado'/'Sem prazo'.
 */
export function getRemainingTime(dateString) {
     if (!dateString) return 'Sem prazo';
     try {
        const targetDate = new Date(dateString);
         if (isNaN(targetDate.getTime())) throw new Error("Data inválida");
        const now = new Date();
        if (targetDate <= now) return 'Encerrado';
        const diffMs = targetDate - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return `~${diffDays} dia(s)`;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours > 0) return `~${diffHours} hora(s)`;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        // Mostra minutos apenas se for menos de 1 hora
        if (diffMinutes > 0) return `~${diffMinutes} min`;
        return 'Menos de 1 min'; // Caso seja segundos
     } catch (e) {
        console.error("Erro ao calcular tempo restante:", dateString, e);
        return "Inválido";
     }
}

/**
 * Verifica se uma promoção ainda está disponível para GERAÇÃO de QR Code.
 * @param {Object} promotion - Objeto da promoção (registro base).
 * @returns {boolean} True se ainda pode gerar, False caso contrário.
 */
export function isPromotionAvailable(promotion) { // <-- Exportada corretamente
    if (!promotion) {
        // console.warn("isPromotionAvailable chamada com promoção inválida");
        return false;
    }
    const now = new Date();

    // 1. Verifica prazo de GERAÇÃO
    const generationDeadline = promotion.generation_deadline ? new Date(promotion.generation_deadline) : null;
    if (generationDeadline && generationDeadline < now) {
        // console.log(`Promoção ${promotion.promotion_id || promotion.id}: Indisponível (Prazo de Geração Expirado)`);
        return false;
    }

    // 2. Verifica limite de códigos (se aplicável)
    if (promotion.max_codes !== null) {
        // Usa o cálculo gerados vs max_codes, pois remaining_codes pode estar dessincronizado
        const generatedCount = promotion.generated_codes || 0; // Assume 0 se nulo/undefined
        if (generatedCount >= promotion.max_codes) {
            // console.log(`Promoção ${promotion.promotion_id || promotion.id}: Indisponível (Limite Atingido - ${generatedCount}/${promotion.max_codes})`);
            return false;
        }
    }

    // Se passou nas verificações, está disponível para gerar
    // console.log(`Promoção ${promotion.promotion_id || promotion.id}: Disponível para geração.`);
    return true;
}


// --- Renderização QR Codes do Usuário (Para a página principal) ---

/**
 * Renderiza o HTML para uma lista de QR Codes gerados pelo usuário.
 * @param {Array} userQRCodes - Lista de objetos QR Code do usuário.
 * @returns {string} String HTML contendo os cards dos QR Codes do usuário.
 */
export function renderUserQRCodes(userQRCodes) {
    console.log("Renderizando QR Codes do usuário:", userQRCodes ? userQRCodes.length : 0);
    if (!userQRCodes || userQRCodes.length === 0) {
        return ''; // A seção não será mostrada se não houver QRs
    }
    // Estilos para os cards (Mova para CSS se preferir mais organização)
    const cardStyle = `border: 1px solid #333; border-radius: 8px; background: #1f1f1f; overflow: hidden; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);`;
    const headerStyle = `background: #2a2a2e; padding: 5px 10px; text-align: right; border-bottom: 1px solid #444;`;
    const statusStyleBase = `font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 10px; color: white;`;
    const statusColors = { active: '#28a745', used: '#ffc107', expired: '#dc3545' };
    const imgContainerStyle = `padding: 15px; background: white; margin: 10px auto; display: flex; justify-content: center; align-items: center; width: fit-content; border-radius: 4px;`; // Fundo branco para QR
    const infoStyle = `padding: 12px 15px; text-align: left; background: #252528;`; // Fundo ligeiramente diferente
    const descStyle = `font-weight: 500; color: #eee; margin-bottom: 5px; font-size: 0.9rem;`;
    const benefitStyle = `color: #bbb; font-size: 0.85rem; margin-bottom: 8px;`;
    const expiryStyle = `color: #888; font-size: 0.75rem;`;

    return userQRCodes.map(qr => {
        const qrValue = qr.qr_code_value;
        // Validação crucial: só tenta renderizar se qrValue existir
        if (!qrValue) {
            console.warn("QR Code sem valor encontrado, pulando renderização:", qr);
            return `<div class="qr-code-card user-qr-card qr-error-card" style="${cardStyle}"><p style="padding:10px; color:#ff6b6b;">Erro: QR Code inválido.</p></div>`;
        }
        // Gera URL da imagem
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(qrValue)}&q=L&bgcolor=ffffff`; // Tamanho ajustado
        const benefitDesc = getBenefitDescription(qr);
        // Usa valid_until que deve ser preenchido com usage_deadline na geração
        const expiryDateFormatted = formatExpirationDate(qr.valid_until || qr.usage_deadline);
        const now = new Date();
        const usageDeadline = qr.valid_until ? new Date(qr.valid_until) : null;
        let status = 'Ativo';
        let statusColor = statusColors.active;

        if (qr.status === 'usado' || qr.is_used) {
            status = 'Utilizado'; statusColor = statusColors.used;
        } else if (usageDeadline && usageDeadline < now) {
            status = 'Expirado'; statusColor = statusColors.expired;
        }

        return `
          <div class="qr-code-card user-qr-card" style="${cardStyle}">
            <div class="qr-code-header" style="${headerStyle}">
                <span class="qr-code-status" style="${statusStyleBase} background-color: ${statusColor};">${status}</span>
            </div>
            <div class="qr-code-img" style="${imgContainerStyle}">
                <img src="${qrImageUrl}" alt="QR Code para ${qr.description || 'promoção'}" loading="lazy">
            </div>
            <div class="qr-code-info" style="${infoStyle}">
                <p class="qr-code-description" style="${descStyle}">${qr.description || 'Promoção Padrão'}</p>
                <p class="qr-code-benefit" style="${benefitStyle}">${benefitDesc}</p>
                <p class="qr-code-expiry" style="${expiryStyle}">Usar até: ${expiryDateFormatted}</p>
            </div>
          </div>
        `;
    }).join('');
}


// --- Renderização Lista Admin/Criador (VISUALIZAÇÃO SIMPLIFICADA) ---
/**
 * Renderiza a lista de promoções/QR codes na visão do admin/criador (estilo simplificado).
 * Usado dentro do modal de visualização do admin/criador.
 * @param {Array} items - Lista de promoções (registros base de promoções).
 * @returns {string} HTML da lista.
 */
function renderPromotionsListAdmin(items) {
    if (!items || items.length === 0) {
        return '<p class="no-items-message" style="text-align: center; color: #888; padding: 20px;">Nenhuma promoção criada para este evento.</p>';
    }

    // Estilos atualizados
    const listStyle = `list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto; border-top: 1px solid #333; margin-top: 15px;`;
    const itemStyle = `border-bottom: 1px solid #333; padding: 12px 5px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;`;
    const statusColors = { active: '#28a745', used: '#ffc107', expired: '#dc3545' };

    return `
    <div style="border-top: 1px solid #333; margin-top: 15px;">
        <ul style="${listStyle}">
          ${items.map(item => {
            // REMOVEMOS a verificação incorreta de qr_code_value
            const title = item.description || 'Promoção Principal';
            const now = new Date();
            let status = 'Ativa';
            let statusColor = statusColors.active;

            // Cálculo do status corrigido
            if (item.generation_deadline && new Date(item.generation_deadline) < now) {
                status = 'Geração Encerrada';
                statusColor = statusColors.expired;
            } else if (item.usage_deadline && new Date(item.usage_deadline) < now) {
                status = 'Expirada';
                statusColor = statusColors.expired;
            } else if (item.max_codes !== null && (item.generated_codes >= item.max_codes)) {
                status = 'Esgotada';
                statusColor = statusColors.used;
            }

            return `
              <li style="${itemStyle}">
                <div style="flex-grow: 1; font-size: 0.9rem;">
                  <strong style="font-weight: 600; color: #eee; display: block; margin-bottom: 4px;">
                    ${title}
                    <span style="font-size: 0.7rem; background-color: ${statusColor}20; border: 1px solid ${statusColor}80; color: ${statusColor}; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">
                      ${status}
                    </span>
                  </strong>
                  <span style="color: #aaa; font-size: 0.8rem; display: block;">
                    ${getBenefitDescription(item)}
                  </span>
                  <span style="color: #aaa; font-size: 0.8rem; display: block;">
                    ${item.max_codes ? `Limite: ${item.max_codes} (Restam: ${item.max_codes - (item.generated_codes || 0)})` : 'Sem limite'}
                  </span>
                  ${item.generation_deadline ? `
                    <span style="color: #aaa; font-size: 0.8rem; display: block;">
                      Gerar até: ${formatExpirationDate(item.generation_deadline)}
                    </span>` : ''}
                  ${item.usage_deadline ? `
                    <span style="color: #aaa; font-size: 0.8rem; display: block;">
                      Usar até: ${formatExpirationDate(item.usage_deadline)}
                    </span>` : ''}
                </div>
                <button 
                  class="delete-item-btn" 
                  data-id="${item.id}" 
                  title="Excluir Promoção" 
                  style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 1.3rem; padding: 0 0 0 10px; line-height: 1;">
                  &times;
                </button>
              </li>
            `;
          }).join('')}
        </ul>
    </div>
    `;
}



// --- Configuração dos Handlers (Modais, Forms, Botões) ---

/**
 * Configura todos os event handlers relacionados a QR Codes e Promoções.
 * @param {string} eventIdParam - O ID do evento atual.
 */
export function setupEventHandlers(eventIdParam) {
    // Só configura se os elementos base dos modais existirem
    if (!document.getElementById('qrcode-modal') ||
        !document.getElementById('view-qrcodes-modal') ||
        !document.getElementById('delete-qrcode-modal')) {
        console.log("Modais de QR Code não encontrados no DOM. Pulando setup de handlers.");
        return;
    }
    currentEventId = eventIdParam;
    console.log(`Configurando Handlers de QR Code para Evento ID: ${currentEventId}`);
    setupCreateModal();
    setupViewModal();
    setupDeleteConfirmationModal();
}

/** Configura o modal e o formulário de criação. */
function setupCreateModal() {
    const createBtn = document.getElementById('create-qrcode-btn');
    const modal = document.getElementById('qrcode-modal');
    const closeBtn = document.getElementById('close-qrcode-modal');
    const form = document.getElementById('qrcode-form');
    const benefitTypeSelect = document.getElementById('qrcode-benefit-type');
    const discountGroup = document.getElementById('discount-group');

    if (!createBtn || !modal || !closeBtn || !form || !benefitTypeSelect || !discountGroup) {
        console.warn("Elementos do modal de criação não encontrados."); return;
    }

    // Funções de handler (para poder remover listeners depois)
    const openModal = () => { form.reset(); discountGroup.style.display = 'none'; modal.classList.add('active'); };
    const closeModal = () => modal.classList.remove('active');
    const handleBenefitChange = function () {
        const isDiscount = this.value === 'discount';
        discountGroup.style.display = isDiscount ? 'block' : 'none';
        const discountInput = document.getElementById('qrcode-discount');
        if(discountInput) discountInput.required = isDiscount;
    };
    const closeOnClickOutside = (event) => { if (modal && event.target === modal) closeModal(); };

    // Limpa listeners antigos e adiciona novos
    createBtn.replaceWith(createBtn.cloneNode(true));
    document.getElementById('create-qrcode-btn')?.addEventListener('click', openModal);

    closeBtn.replaceWith(closeBtn.cloneNode(true));
    document.getElementById('close-qrcode-modal')?.addEventListener('click', closeModal);

    benefitTypeSelect.replaceWith(benefitTypeSelect.cloneNode(true));
    document.getElementById('qrcode-benefit-type')?.addEventListener('change', handleBenefitChange);

    form.replaceWith(form.cloneNode(true));
    document.getElementById('qrcode-form')?.addEventListener('submit', handleCreatePromotionSubmit);

    // Remove listener genérico anterior antes de adicionar o específico
    window.removeEventListener("click", closeOnClickOutside);
    window.addEventListener("click", closeOnClickOutside);

    console.log("Modal de criação configurado.");
}

/** Manipula o envio do formulário de criação. */
async function handleCreatePromotionSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true; submitButton.textContent = 'Criando...';

    try {
        if (!currentEventId) throw new Error("ID do evento não definido.");
        // Coleta dados e valida
        const promotionData = {
            eventId: currentEventId,
            description: form.querySelector('#qrcode-description')?.value.trim(),
            benefitType: form.querySelector('#qrcode-benefit-type')?.value,
            benefitDescription: form.querySelector('#qrcode-benefit-description')?.value.trim(),
            discountPercentage: null,
            maxCodes: form.querySelector('#qrcode-max-codes')?.value || null,
            generationDeadline: form.querySelector('#qrcode-generation-deadline')?.value || null,
            usageDeadline: form.querySelector('#qrcode-usage-deadline')?.value || null
        };
        if (!promotionData.description || !promotionData.benefitType || !promotionData.benefitDescription) throw new Error("Preencha os campos obrigatórios (*)");
        if (promotionData.benefitType === 'discount') {
            const discountInput = form.querySelector('#qrcode-discount');
            if (!discountInput?.value) throw new Error("Informe o percentual de desconto.");
            promotionData.discountPercentage = parseInt(discountInput.value, 10);
            if (isNaN(promotionData.discountPercentage) || promotionData.discountPercentage < 1 || promotionData.discountPercentage > 100) throw new Error("Percentual de desconto inválido (1-100).");
        }
         if (promotionData.maxCodes) promotionData.maxCodes = parseInt(promotionData.maxCodes);

        // Chama API
        await createPromotion(promotionData);
        showMessage('Promoção criada com sucesso!', 'success');
        document.getElementById('qrcode-modal')?.classList.remove('active');
        await refreshAdminPromotionsList(); // Atualiza lista no modal de visualização

    } catch (error) {
        console.error('Erro ao criar promoção:', error);
        showMessage(error.message || 'Erro ao criar promoção', 'error');
    } finally {
        submitButton.disabled = false; submitButton.textContent = originalButtonText;
    }
}

/** Configura o modal de visualização. */
function setupViewModal() {
    const viewBtn = document.getElementById('view-qrcodes-btn');
    const modal = document.getElementById('view-qrcodes-modal');
    const closeBtn = document.getElementById('close-view-qrcodes-modal');
    const listContainer = document.getElementById('qrcodes-list');
    if (!viewBtn || !modal || !closeBtn || !listContainer) { console.warn("Elementos do modal de visualização não encontrados."); return; }

    // Handlers
    const openModal = async () => { listContainer.innerHTML = '<p>Carregando...</p>'; modal.classList.add('active'); await refreshAdminPromotionsList(); };
    const closeModal = () => modal.classList.remove('active');
    const closeOnClickOutside = (event) => { if (modal && event.target === modal) closeModal(); };

    // Limpa e adiciona listeners
    viewBtn.replaceWith(viewBtn.cloneNode(true));
    document.getElementById('view-qrcodes-btn')?.addEventListener('click', openModal);

    closeBtn.replaceWith(closeBtn.cloneNode(true));
    document.getElementById('close-view-qrcodes-modal')?.addEventListener('click', closeModal);

    window.removeEventListener("click", closeOnClickOutside);
    window.addEventListener("click", closeOnClickOutside);

    console.log("Modal de visualização configurado.");
}

/** Atualiza a lista no modal admin/criador. */
async function refreshAdminPromotionsList() {
    const listContainer = document.getElementById('qrcodes-list');
    if (!listContainer || !currentEventId) {
        console.error("Não é possível atualizar lista admin: container ou ID do evento faltando.");
        return;
    }
    listContainer.innerHTML = '<p>Atualizando lista...</p>';
    try {
        // Busca as PROMOÇÕES principais (registros base) para o evento
        const promotions = await getEventPromotions(currentEventId);
        listContainer.innerHTML = renderPromotionsListAdmin(promotions); // Renderiza a lista simplificada
        setupAdminListDeleteButtons(); // (Re)Configura botões de exclusão na nova lista
    } catch (error) {
        console.error('Erro ao atualizar lista de promoções (admin):', error);
        listContainer.innerHTML = '<p class="error-message" style="color:#ff6b6b; text-align:center;">Erro ao carregar.</p>';
    }
}

/** Configura os botões de exclusão na lista admin. */
function setupAdminListDeleteButtons() {
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const confirmMessage = document.getElementById('delete-confirm-message');
    if(!deleteModal || !confirmMessage) { console.warn("Modal de exclusão ou mensagem não encontrado para configurar botões."); return; }

    // Seleciona botões dentro da lista renderizada
    const listContainer = document.getElementById('qrcodes-list');
    if (!listContainer) return;

    listContainer.querySelectorAll('.delete-item-btn').forEach(button => {
         const newButton = button.cloneNode(true);
         button.parentNode.replaceChild(newButton, button); // Limpa listener antigo
         newButton.addEventListener('click', (e) => {
            e.stopPropagation();
            itemToDeleteId = newButton.getAttribute('data-id');
            const itemType = newButton.getAttribute('data-type') || 'item';
            // Tenta encontrar o título no elemento pai 'li'
            const titleElement = newButton.closest('li')?.querySelector('.admin-qr-title');
            const itemTitle = titleElement?.textContent || 'este item';
            // Mensagem de confirmação específica para promoções
            confirmMessage.textContent = `Tem certeza que deseja excluir ${itemType === 'PROMOÇÃO' ? 'esta PROMOÇÃO e TODOS os QR Codes associados a ela' : 'este QR Code'} (${itemTitle})? Esta ação não pode ser desfeita.`;
            deleteModal.classList.add('active');
        });
    });
}

/** Configura o modal de confirmação de exclusão. */
function setupDeleteConfirmationModal() {
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const closeBtn = document.getElementById('close-delete-qrcode-modal');
    const confirmBtn = document.getElementById('confirm-delete-qrcode');
    const cancelBtn = document.getElementById('cancel-delete-qrcode');
    if (!deleteModal || !closeBtn || !confirmBtn || !cancelBtn) { console.warn("Elementos do modal de exclusão não encontrados."); return; }

    const closeModal = () => { deleteModal.classList.remove('active'); itemToDeleteId = null; };

    // Limpa e adiciona listeners
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    document.getElementById('close-delete-qrcode-modal')?.addEventListener('click', closeModal);

    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    document.getElementById('cancel-delete-qrcode')?.addEventListener('click', closeModal);

    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    document.getElementById('confirm-delete-qrcode')?.addEventListener('click', async (e) => {
        if (!itemToDeleteId) { closeModal(); return; }
        const button = e.currentTarget; const originalText = button.textContent;
        button.disabled = true; button.textContent = 'Excluindo...';
        try {
            await deleteQRCode(itemToDeleteId); // Chama API para excluir (backend deve lidar se é promoção ou QR)
            showMessage('Item excluído com sucesso!', 'success');
            closeModal();
            await refreshAdminPromotionsList(); // Atualiza a lista após excluir
        } catch (error) {
            console.error("Erro ao excluir:", error)
            showMessage(error.message || 'Erro ao excluir', 'error');
            button.disabled = false; button.textContent = originalText;
            // Não fecha o modal em caso de erro para o usuário ver a mensagem
        }
    });

     const closeDeleteModalOnClickOutside = (event) => { if (deleteModal && event.target === deleteModal) closeModal(); };
     window.removeEventListener("click", closeDeleteModalOnClickOutside);
     window.addEventListener("click", closeDeleteModalOnClickOutside);

     console.log("Modal de exclusão configurado.");
}