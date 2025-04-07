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
        if (isNaN(date.getTime())) {
            throw new Error("Data inválida recebida");
        }
        // Formato DD/MM/AAAA HH:MM
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
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
    // Retorna a descrição específica do benefício, se houver, senão a descrição geral
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
        if (diffMinutes > 0) return `~${diffMinutes} min`;
        return 'Menos de 1 min';
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
export function isPromotionAvailable(promotion) {
    if (!promotion) return false;
    const now = new Date();
    const generationDeadline = promotion.generation_deadline ? new Date(promotion.generation_deadline) : null;
    // Verifica se o prazo de geração já passou
    if (generationDeadline && generationDeadline < now) return false;
    // Verifica se há limite de códigos e se já foi atingido
    if (promotion.max_codes !== null) {
        const generatedCount = promotion.generated_codes || 0; // Usa contagem do backend
        if (generatedCount >= promotion.max_codes) return false;
    }
    return true; // Se passou pelas verificações, está disponível
}

// A função renderUserQRCodes foi removida deste arquivo pois a lógica
// de exibição do QR Code do usuário está agora em promotion-manager.js

// --- Renderização Lista Admin/Criador ---
/**
 * Renderiza a lista de promoções/QR codes na visão do admin/criador.
 * Inclui o botão de excluir.
 * @param {Array} items - Lista de promoções (registros base de promoções).
 * @returns {string} HTML da lista.
 */
function renderPromotionsListAdmin(items) {
    const listContainerId = 'admin-promotions-list-container';

    if (!items || items.length === 0) {
        return `<div id="${listContainerId}" class="admin-promotions-list"><p class="no-items-message">Nenhuma promoção criada para este evento.</p></div>`;
    }

    const statusColors = { active: '#28a745', used: '#ffc107', expired: '#dc3545', unavailable: '#6c757d' };

    const cardsHTML = items.map(item => {
        // Lógica para determinar status e detalhes (igual à versão anterior)
        const title = item.description || 'Promoção Principal';
        const now = new Date();
        let statusText = 'Ativa';
        let statusColor = statusColors.active;
        let generated = item.generated_codes || 0;
        let max = item.max_codes;
        let remaining = max ? Math.max(0, max - generated) : 'Ilimitado'; // Garante não negativo

        const generationDeadline = item.generation_deadline ? new Date(item.generation_deadline) : null;
        const usageDeadline = item.usage_deadline ? new Date(item.usage_deadline) : null;

        if (generationDeadline && generationDeadline < now) {
            statusText = 'Geração Encerrada'; statusColor = statusColors.unavailable;
        } else if (usageDeadline && usageDeadline < now) {
            statusText = 'Expirada'; statusColor = statusColors.expired;
        } else if (max !== null && generated >= max) {
            statusText = 'Esgotada'; statusColor = statusColors.used; remaining = 0;
        }

        const benefit = getBenefitDescription(item);
        const genDeadlineFormatted = formatExpirationDate(item.generation_deadline);
        const useDeadlineFormatted = formatExpirationDate(item.usage_deadline);

        return `
          <div class="promotion-admin-card" data-promotion-id="${item.id || item.promotion_id}">
            <div class="promo-card-header">
              <h4 class="promo-card-title">${title}</h4>
              <span class="promo-card-status" style="background-color: ${statusColor}; border: 1px solid ${statusColor};">
                ${statusText}
              </span>
            </div>
            <div class="promo-card-body">
              <p class="promo-card-benefit"><strong>Benefício:</strong> ${benefit}</p>
              <p class="promo-card-stats">
                <strong>Códigos:</strong>
                ${max ? `Limite: ${max} / Gerados: ${generated} / Restantes: ${remaining}` : 'Sem limite de códigos'}
              </p>
              ${item.generation_deadline ? `<p class="promo-card-deadline"><strong>Gerar até:</strong> ${genDeadlineFormatted}</p>` : ''}
              ${item.usage_deadline ? `<p class="promo-card-deadline"><strong>Usar até:</strong> ${useDeadlineFormatted}</p>` : ''}
            </div>
            <div class="promo-card-actions">
              <button
                  class="delete-item-btn" /* Somente esta classe */
                  data-id="${item.id || item.promotion_id}"
                  data-type="PROMOÇÃO"
                  title="Excluir Promoção e todos os QR Codes">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Excluir
              </button>
            </div>
          </div>
        `;
    }).join('');

    return `<div id="${listContainerId}" class="admin-promotions-list">${cardsHTML}</div>`;
}


// --- Função de Submit para Criar Promoção ---
/**
 * Manipula o envio do formulário de criação de promoção.
 */
async function handleCreatePromotionSubmit(e) {
    e.preventDefault();
    console.log("[handleCreatePromotionSubmit] Iniciando submit...");

    if (!currentEventId) { console.error("ID do evento não está definido no submit"); return; }
    const form = e.target; // << Pega a referência do formulário
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) { console.error("Botão de submit não encontrado dentro do form"); return; }

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true; submitButton.textContent = 'Criando...';

    // Pegar referências para discountGroup e discountInput AQUI
    const discountGroup = document.getElementById('discount-group');
    const discountInput = document.getElementById('qrcode-discount');

    try {
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

        // Validações... (iguais às anteriores)
        if (!promotionData.description || !promotionData.benefitType || !promotionData.benefitDescription) throw new Error("Preencha os campos obrigatórios (*)");
        if (promotionData.benefitType === 'discount') {
             if (!discountInput || !discountInput.value) throw new Error("Informe o percentual de desconto."); // Verifica se input existe
             promotionData.discountPercentage = parseInt(discountInput.value, 10);
             if (isNaN(promotionData.discountPercentage) || promotionData.discountPercentage < 1 || promotionData.discountPercentage > 100) throw new Error("Percentual de desconto inválido (1-100).");
        }
        // ... (outras validações) ...


        // Chama API
        await createPromotion(promotionData);
        showMessage('Promoção criada com sucesso!', 'success');

        // <<< --- LIMPEZA DO FORMULÁRIO --- >>>
        form.reset(); // Limpa todos os campos do formulário
        // Esconde o campo de desconto manualmente após o reset
        if (discountGroup) {
             discountGroup.classList.remove('discount-visible'); // Usa a classe CSS
        }
        if (discountInput) {
             discountInput.required = false; // Garante que não seja mais obrigatório
        }
        console.log("[handleCreatePromotionSubmit] Formulário limpo.");
        // <<< --- FIM DA LIMPEZA --- >>>

        document.getElementById('qrcode-modal')?.classList.remove('active'); // Fecha o modal
        await refreshAdminPromotionsList(); // Atualiza a lista no outro modal

    } catch (error) {
        console.error('Erro ao criar promoção:', error);
        showMessage(error.message || 'Erro ao criar promoção', 'error');
    } finally {
        // Garante que o botão seja reabilitado
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
        console.log("[handleCreatePromotionSubmit] Processo finalizado.");
    }
}

// --- Configuração dos Modais ---

/** Configura o modal e o formulário de criação. */
function setupCreateModal() {
    console.log("[setupCreateModal] Iniciando..."); // Log: Iniciando setup

    const createBtn = document.getElementById('create-qrcode-btn');
    const modal = document.getElementById('qrcode-modal');
    const closeBtn = document.getElementById('close-qrcode-modal');
    const form = document.getElementById('qrcode-form');
    const benefitTypeSelect = document.getElementById('qrcode-benefit-type'); // Select Tipo Benefício
    const discountGroup = document.getElementById('discount-group');       // Div do campo Desconto
    const discountInput = document.getElementById('qrcode-discount');        // Input do Desconto

    // Verifica se todos os elementos essenciais foram encontrados
    if (!modal || !form || !benefitTypeSelect || !discountGroup || !discountInput) {
        console.error("ERRO CRÍTICO: Elementos essenciais do modal de criação não encontrados:", {
            modal: !!modal,
            form: !!form,
            benefitTypeSelect: !!benefitTypeSelect,
            discountGroup: !!discountGroup,
            discountInput: !!discountInput
        });
        return; // Aborta se algum elemento estiver faltando
    }
    console.log("[setupCreateModal] Elementos essenciais encontrados.");

    // Funções de handler
    const openModal = () => {
         console.log("[setupCreateModal] Abrindo modal...");
         form.reset(); // Limpa o formulário
         discountGroup.style.display = 'none'; // Garante que o campo de desconto comece escondido
         discountInput.required = false;       // Garante que não seja obrigatório inicialmente
         modal.classList.add('active');        // Mostra o modal
    };
    const closeModal = () => {
         console.log("[setupCreateModal] Fechando modal...");
         modal.classList.remove('active'); // Esconde o modal
    };

    const handleBenefitChange = (event) => {
        const selectedValue = event.target.value;
        const isDiscount = selectedValue === 'discount';
        const currentDiscountGroup = document.getElementById('discount-group');
        const currentDiscountInput = document.getElementById('qrcode-discount');

        // Verifica se os elementos foram encontrados (boa prática)
        if(!currentDiscountGroup || !currentDiscountInput) {
             console.error("[handleBenefitChange] ERRO: Não encontrou #discount-group ou #qrcode-discount!");
             return;
        }

        // --- CORREÇÃO AQUI ---
        if (isDiscount) {
            // Adiciona a classe CSS para tornar visível (usando a animação do CSS)
            currentDiscountGroup.classList.add('discount-visible');
            currentDiscountInput.required = true; // Campo é obrigatório
        } else {
            // Remove a classe CSS para esconder (usando a animação do CSS)
            currentDiscountGroup.classList.remove('discount-visible');
            currentDiscountInput.required = false; // Campo não é mais obrigatório
            currentDiscountInput.value = '';      // Limpa o valor se não for desconto
        }
        // --- FIM DA CORREÇÃO ---

        console.log(` > Classe 'discount-visible' ${isDiscount ? 'adicionada' : 'removida'} a #discount-group`);
        console.log(` > Atributo 'required' em #qrcode-discount: ${currentDiscountInput.required}`);
   };

    const closeOnClickOutside = (event) => { if (modal && event.target === modal) closeModal(); };

    // --- ATRIBUIÇÃO DE LISTENERS ---
    // Botão de Abrir Modal
    if (createBtn) {
        const newCreateBtn = createBtn.cloneNode(true);
        createBtn.parentNode.replaceChild(newCreateBtn, createBtn);
        newCreateBtn.addEventListener('click', openModal);
    } else { console.warn("Botão #create-qrcode-btn não encontrado."); }

    // Botão de Fechar Modal
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeModal);
    } else { console.warn("Botão #close-qrcode-modal não encontrado."); }

    // Formulário (Submit) e Select (Change) - Clonar o form para garantir limpeza
    const newForm = form.cloneNode(true); // true para clonar profundamente
    form.parentNode.replaceChild(newForm, form);

    // Adiciona os listeners ao novo formulário
    newForm.addEventListener('submit', handleCreatePromotionSubmit);
    const newBenefitTypeSelect = newForm.querySelector('#qrcode-benefit-type');
    newBenefitTypeSelect.addEventListener('change', handleBenefitChange);

    if (newBenefitTypeSelect) {
         console.log("[setupCreateModal] Adicionando listener 'change' ao select #qrcode-benefit-type.");
         newBenefitTypeSelect.addEventListener('change', handleBenefitChange); // <<< Listener para mostrar/esconder
    } else {
         console.error("ERRO: Select #qrcode-benefit-type não encontrado DENTRO do formulário clonado!");
    }
    newForm.addEventListener('submit', handleCreatePromotionSubmit); // Listener para enviar
    console.log("[setupCreateModal] Listeners anexados ao #qrcode-form (clonado).");

    // Clique fora do modal
    window.removeEventListener("click", closeOnClickOutside); // Remove listener antigo (se houver)
    window.addEventListener("click", closeOnClickOutside); // Adiciona novo

    console.log("[setupCreateModal] Configuração concluída.");
}

/** Configura o modal de visualização. */
function setupViewModal() {
    console.log("[setupViewModal] Iniciando...");
    const viewBtn = document.getElementById('view-qrcodes-btn');
    const modal = document.getElementById('view-qrcodes-modal');
    const closeBtn = document.getElementById('close-view-qrcodes-modal');
    const listContainer = document.getElementById('qrcodes-list');
    if (!modal || !listContainer) return;

    const openModal = async () => { listContainer.innerHTML = '<p>Carregando promoções...</p>'; modal.classList.add('active'); await refreshAdminPromotionsList(); };
    const closeModal = () => { modal.classList.remove('active'); };
    const closeOnClickOutside = (event) => { if (modal && event.target === modal) closeModal(); };

    if (viewBtn) { const newViewBtn = viewBtn.cloneNode(true); viewBtn.parentNode.replaceChild(newViewBtn, viewBtn); newViewBtn.addEventListener('click', openModal); }
    if (closeBtn) { const newCloseBtn = closeBtn.cloneNode(true); closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn); newCloseBtn.addEventListener('click', closeModal); }
    window.removeEventListener("click", closeOnClickOutside); window.addEventListener("click", closeOnClickOutside);
    console.log("[setupViewModal] Configuração concluída.");
}

/** Atualiza a lista no modal admin/criador. */
async function refreshAdminPromotionsList() {
    const listContainer = document.getElementById('qrcodes-list');
    if (!listContainer || !currentEventId) { if(listContainer) listContainer.innerHTML = '<p style="color:red;">Erro ao carregar: ID do evento não definido.</p>'; return; }
    listContainer.innerHTML = '<p>Atualizando lista...</p>';
    try {
        const promotions = await getEventPromotions(currentEventId);
        listContainer.innerHTML = renderPromotionsListAdmin(promotions); // Renderiza com a função ATUALIZADA
        setupAdminListDeleteButtons(); // Reconfigura listeners na nova lista
        console.log("[refreshAdmin] Lista admin atualizada.");
    } catch (error) { console.error('[refreshAdmin] Erro ao atualizar lista:', error); listContainer.innerHTML = '<p class="error-message" style="color:var(--details-danger-color, #e57373); text-align:center;">Erro ao carregar promoções.</p>'; }
}

/** Configura os botões de exclusão na lista admin (usando event delegation). */
function setupAdminListDeleteButtons() {
    console.log("[setupAdminListDeleteButtons] Configurando botões de exclusão...");
    const listContainer = document.getElementById('qrcodes-list');
    if(!listContainer) { console.warn("[setupAdminListDeleteButtons] Container da lista não encontrado."); return; }

    // Usa event delegation na lista para pegar cliques nos botões de deletar
    listContainer.removeEventListener('click', handleDeleteButtonClick); // Limpa listener antigo
    listContainer.addEventListener('click', handleDeleteButtonClick); // Adiciona novo
    console.log("[setupAdminListDeleteButtons] Listener de delegação adicionado a #qrcodes-list.");
}

// <<< --- FUNÇÃO MODIFICADA PARA CORRIGIR EXCLUSÃO SEQUENCIAL --- >>>
/** Handler para o clique no botão de deletar (usado com event delegation). */
function handleDeleteButtonClick(event) {
    const deleteButton = event.target.closest('.delete-item-btn');
    if (!deleteButton) return; // Sai se não foi no botão de deletar
    event.stopPropagation(); // Previne outros eventos

    const itemId = deleteButton.getAttribute('data-id');
    const itemType = deleteButton.getAttribute('data-type') || 'item';
    console.log(`[handleDeleteButtonClick] Clique para deletar ${itemType} ID: ${itemId}`);

    const deleteModal = document.getElementById('delete-qrcode-modal');
    const confirmMessage = document.getElementById('delete-confirm-message');
    const confirmBtn = document.getElementById('confirm-delete-qrcode'); // Pega o botão de confirmação

    if(!deleteModal || !confirmMessage || !confirmBtn || !itemId) {
         console.error("[handleDeleteButtonClick] ERRO: Elementos do modal ou ID do item faltando.");
         return;
     }

    // Guarda o ID que será excluído *nesta* interação específica
    const idParaExcluir = itemId;

    // Define a mensagem de confirmação
    const listItem = deleteButton.closest('.promotion-admin-card'); // Busca o card pai
    const titleElement = listItem?.querySelector('.promo-card-title'); // Pega título do card
    const itemTitle = titleElement?.textContent.trim() || `ID ${idParaExcluir}`;
    let confirmText = `Tem certeza que deseja excluir "${itemTitle}"?`;
    if (itemType === 'PROMOÇÃO') {
        confirmText = `Tem certeza que deseja excluir a PROMOÇÃO "${itemTitle}" e TODOS os QR Codes associados a ela?`;
    }
    confirmText += " Esta ação não pode ser desfeita.";
    confirmMessage.textContent = confirmText;

    // --- Configuração dinâmica do listener do botão CONFIRMAR ---
    const newConfirmBtn = confirmBtn.cloneNode(true);
    // Reseta as propriedades do botão clonado para o estado original
    newConfirmBtn.disabled = false; // Garante que não venha desabilitado
    newConfirmBtn.textContent = 'Excluir'; // Texto original
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    const executarExclusao = async () => {
        console.log(`[executarExclusao] Confirmada exclusão para ID: ${idParaExcluir}`);
        newConfirmBtn.disabled = true;
        newConfirmBtn.textContent = 'Excluindo...';
    
        try {
            await deleteQRCode(idParaExcluir);
            showMessage('Item excluído com sucesso!', 'success');
            deleteModal.classList.remove('active');
            await refreshAdminPromotionsList();
        } catch (error) {
            console.error("[executarExclusao] Erro ao excluir:", error);
            showMessage(error.message || 'Erro ao excluir item', 'error');
            newConfirmBtn.disabled = false;
            newConfirmBtn.textContent = 'Excluir';
        } finally {
            // Garante que o botão seja restaurado mesmo em caso de sucesso
            // (mas como o modal é fechado, isso só afeta se houver erro)
            if (!deleteModal.classList.contains('active')) {
                newConfirmBtn.disabled = false;
                newConfirmBtn.textContent = 'Excluir';
            }
        }
    };
    // 3. Adiciona o novo listener ao botão clonado
    newConfirmBtn.addEventListener('click', executarExclusao);
    // --- Fim da configuração dinâmica ---

    deleteModal.classList.add('active'); // Mostra o modal de confirmação
}


// <<< --- FUNÇÃO MODIFICADA PARA CORRIGIR EXCLUSÃO SEQUENCIAL --- >>>
/** Configura o modal de confirmação de exclusão (APENAS botões de fechar/cancelar). */
function setupDeleteConfirmationModal() {
    console.log("[setupDeleteConfirmationModal] Iniciando setup (Close/Cancel)...");
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const closeBtn = document.getElementById('close-delete-qrcode-modal');
    const cancelBtn = document.getElementById('cancel-delete-qrcode');
    // O botão #confirm-delete-qrcode agora é configurado dinamicamente em handleDeleteButtonClick

    if (!deleteModal || !closeBtn || !cancelBtn) {
        console.warn("Elementos do modal de confirmação (close/cancel) não encontrados.");
        return;
    }

    const closeModal = () => {
        console.log("[setupDeleteConfirmationModal] Fechando modal de confirmação.");
        deleteModal.classList.remove('active');
        // Não limpamos itemToDeleteId aqui, ele é tratado no handleDeleteButtonClick
    };

    // Limpa e adiciona listeners APENAS para fechar/cancelar
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', closeModal);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.addEventListener('click', closeModal);

    // Listener para fechar clicando fora (mantido)
    const closeDeleteModalOnClickOutside = (event) => { if (deleteModal && event.target === deleteModal) closeModal(); };
    window.removeEventListener("click", closeDeleteModalOnClickOutside);
    window.addEventListener("click", closeDeleteModalOnClickOutside);

     console.log("[setupDeleteConfirmationModal] Configuração de Close/Cancel concluída.");
}


// --- Função Principal Exportada ---
/**
 * Configura todos os event handlers relacionados a QR Codes e Promoções.
 * @param {string} eventIdParam - O ID do evento atual.
 */
export function setupEventHandlers(eventIdParam) {
    if (!document.getElementById('qrcode-modal') || !document.getElementById('view-qrcodes-modal') || !document.getElementById('delete-qrcode-modal')) { console.log("[setupEventHandlers] Modais de QR Code não encontrados no DOM. Pulando setup."); return; }
    currentEventId = eventIdParam;
    if (!currentEventId) { console.error("[setupEventHandlers] ERRO: eventIdParam não foi fornecido!"); return; }
    console.log(`[setupEventHandlers] Configurando Handlers para Evento ID: ${currentEventId}`);
    setupCreateModal();
    setupViewModal();
    setupDeleteConfirmationModal(); // Configura apenas close/cancel agora
    // setupAdminListDeleteButtons é chamado DENTRO do refreshAdminPromotionsList
}