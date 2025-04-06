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
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false // Garante formato 24h se necessário
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
    if (generationDeadline && generationDeadline < now) return false;
    if (promotion.max_codes !== null) {
        const generatedCount = promotion.generated_codes || 0;
        if (generatedCount >= promotion.max_codes) return false;
    }
    return true;
}

/**
 * Renderiza o HTML para uma lista de QR Codes gerados pelo usuário.
 * @param {Array} userQRCodes - Lista de objetos QR Code do usuário.
 * @returns {string} String HTML contendo os cards dos QR Codes do usuário.
 */
export function renderUserQRCodes(userQRCodes) {
    console.log("Renderizando QR Codes do usuário:", userQRCodes ? userQRCodes.length : 0);
    if (!userQRCodes || userQRCodes.length === 0) {
        return ''; // Não retorna nada se não houver QRs para o usuário
    }

    // Estilos inline para simplicidade (mover para CSS é melhor a longo prazo)
    const cardStyle = `border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); overflow: hidden; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);`;
    const headerStyle = `background: var(--bg-primary); padding: 5px 10px; text-align: right; border-bottom: 1px solid var(--border-color);`;
    const statusStyleBase = `font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 10px; color: white;`; // Cor de texto padrão branca
    const statusColors = { active: '#28a745', used: '#ffc107', expired: '#dc3545' };
    const imgContainerStyle = `padding: 15px; background: white; margin: 10px auto; display: flex; justify-content: center; align-items: center; width: fit-content; max-width: 90%; border-radius: 4px;`;
    const infoStyle = `padding: 12px 15px; text-align: left; background: var(--bg-secondary);`;
    const descStyle = `font-weight: 500; color: var(--text-primary); margin-bottom: 5px; font-size: 0.9rem;`;
    const benefitStyle = `color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 8px;`;
    const expiryStyle = `color: var(--text-secondary); font-size: 0.75rem; opacity: 0.8;`;

    return userQRCodes.map(qr => {
        const qrValue = qr.qr_code_value;
        if (!qrValue) {
            console.warn("QR Code sem valor encontrado, pulando renderização:", qr);
            return `<div class="qr-code-card user-qr-card qr-error-card" style="${cardStyle}"><p style="padding:10px; color:var(--danger-bg);">Erro: QR Code inválido.</p></div>`;
        }

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(qrValue)}&q=L&bgcolor=ffffff`;
        const benefitDesc = getBenefitDescription(qr);
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

// --- Renderização Lista Admin/Criador ---
/**
 * Renderiza a lista de promoções/QR codes na visão do admin/criador (estilo simplificado).
 * @param {Array} items - Lista de promoções (registros base de promoções).
 * @returns {string} HTML da lista.
 */
function renderPromotionsListAdmin(items) {
    if (!items || items.length === 0) {
        return '<p class="no-items-message" style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhuma promoção criada para este evento.</p>';
    }

    const listStyle = `list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto; border-top: 1px solid var(--border-color); margin-top: 15px;`;
    const itemStyle = `border-bottom: 1px solid var(--border-color); padding: 12px 5px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;`;
    const statusColors = { active: '#28a745', used: '#ffc107', expired: '#dc3545' };

    return `
    <div style="border-top: 1px solid var(--border-color); margin-top: 15px;">
        <ul style="${listStyle}">
          ${items.map(item => {
            const title = item.description || 'Promoção Principal';
            const now = new Date();
            let status = 'Ativa';
            let statusColor = statusColors.active;
            let generated = item.generated_codes || 0;
            let remaining = item.max_codes ? item.max_codes - generated : '∞';

            if (item.generation_deadline && new Date(item.generation_deadline) < now) {
                status = 'Geração Encerrada'; statusColor = statusColors.expired;
            } else if (item.usage_deadline && new Date(item.usage_deadline) < now) {
                status = 'Expirada'; statusColor = statusColors.expired;
            } else if (item.max_codes !== null && generated >= item.max_codes) {
                status = 'Esgotada'; statusColor = statusColors.used; remaining = 0;
            }

            return `
              <li style="${itemStyle}">
                <div style="flex-grow: 1; font-size: 0.9rem;">
                  <strong style="font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 4px;">
                    ${title}
                    <span style="font-size: 0.7rem; background-color: ${statusColor}20; border: 1px solid ${statusColor}80; color: ${statusColor}; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">
                      ${status}
                    </span>
                  </strong>
                  <span style="color: var(--text-secondary); font-size: 0.8rem; display: block;">
                    ${getBenefitDescription(item)}
                  </span>
                  <span style="color: var(--text-secondary); font-size: 0.8rem; display: block;">
                    ${item.max_codes ? `Limite: ${item.max_codes} (Gerados: ${generated} / Restam: ${remaining})` : 'Sem limite'}
                  </span>
                  ${item.generation_deadline ? `
                    <span style="color: var(--text-secondary); font-size: 0.8rem; display: block;">
                      Gerar até: ${formatExpirationDate(item.generation_deadline)}
                    </span>` : ''}
                  ${item.usage_deadline ? `
                    <span style="color: var(--text-secondary); font-size: 0.8rem; display: block;">
                      Usar até: ${formatExpirationDate(item.usage_deadline)}
                    </span>` : ''}
                </div>
                <button
                  class="delete-item-btn"
                  data-id="${item.id || item.promotion_id}"
                  data-type="PROMOÇÃO"
                  title="Excluir Promoção e todos os QR Codes"
                  style="background: none; border: none; color: var(--danger-bg); cursor: pointer; font-size: 1.3rem; padding: 0 0 0 10px; line-height: 1;">
                  &times;
                </button>
              </li>
            `;
          }).join('')}
        </ul>
    </div>
    `;
}

// --- Função de Submit (Definida fora) ---
/**
 * Manipula o envio do formulário de criação de promoção.
 */
async function handleCreatePromotionSubmit(e) {
    e.preventDefault();
    console.log("[handleCreatePromotionSubmit] Iniciando submit...");

    if (!currentEventId) { console.error("ID do evento não está definido no submit"); return; }
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');

    if (!submitButton) { console.error("Botão de submit não encontrado dentro do form"); return; }

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true; submitButton.textContent = 'Criando...';

    try {
        // Coleta dados
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

        // Validação
        if (!promotionData.description || !promotionData.benefitType || !promotionData.benefitDescription) {
            throw new Error("Preencha os campos obrigatórios (*)");
        }
        if (promotionData.benefitType === 'discount') {
            const discountInput = form.querySelector('#qrcode-discount');
            if (!discountInput?.value) throw new Error("Informe o percentual de desconto.");
            promotionData.discountPercentage = parseInt(discountInput.value, 10);
            if (isNaN(promotionData.discountPercentage) || promotionData.discountPercentage < 1 || promotionData.discountPercentage > 100) {
                throw new Error("Percentual de desconto inválido (1-100).");
            }
        }
        if (promotionData.maxCodes) {
             promotionData.maxCodes = parseInt(promotionData.maxCodes);
             if(isNaN(promotionData.maxCodes) || promotionData.maxCodes < 1) {
                 throw new Error("Limite de códigos inválido.");
             }
        }
         const genDeadline = promotionData.generationDeadline ? new Date(promotionData.generationDeadline) : null;
         const useDeadline = promotionData.usageDeadline ? new Date(promotionData.usageDeadline) : null;
         if(genDeadline && useDeadline && genDeadline > useDeadline) {
             throw new Error("A data limite para gerar não pode ser depois da data limite para usar.");
         }


        // Chama API
        console.log("[handleCreatePromotionSubmit] Enviando dados para API:", promotionData);
        await createPromotion(promotionData);
        console.log("[handleCreatePromotionSubmit] Promoção criada na API.");

        showMessage('Promoção criada com sucesso!', 'success');
        document.getElementById('qrcode-modal')?.classList.remove('active');

        // Atualiza a lista admin no modal de visualização
        console.log("[handleCreatePromotionSubmit] Atualizando lista admin...");
        await refreshAdminPromotionsList();

    } catch (error) {
        console.error('Erro ao criar promoção:', error);
        showMessage(error.message || 'Erro ao criar promoção', 'error');
    } finally {
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
    console.log("[setupCreateModal] Iniciando...");

    const createBtn = document.getElementById('create-qrcode-btn');
    const modal = document.getElementById('qrcode-modal');
    const closeBtn = document.getElementById('close-qrcode-modal');
    const form = document.getElementById('qrcode-form');
    const benefitTypeSelect = document.getElementById('qrcode-benefit-type');
    const discountGroup = document.getElementById('discount-group');
    const discountInput = document.getElementById('qrcode-discount');

    if (!modal || !form || !benefitTypeSelect || !discountGroup || !discountInput) {
        console.error("ERRO CRÍTICO: Elementos essenciais do modal de criação não encontrados.");
        return;
    }
    console.log("[setupCreateModal] Elementos essenciais encontrados.");

    // Funções de handler
    const openModal = () => {
         console.log("[setupCreateModal] Abrindo modal...");
         form.reset();
         discountGroup.style.display = 'none';
         discountInput.required = false;
         modal.classList.add('active');
    };
    const closeModal = () => {
         console.log("[setupCreateModal] Fechando modal...");
         modal.classList.remove('active');
    };
    const handleBenefitChange = (event) => {
         console.log("[handleBenefitChange] Evento 'change' disparado!");
         const selectedValue = event.target.value;
         const isDiscount = selectedValue === 'discount';
         console.log(`[handleBenefitChange] Valor: ${selectedValue}, É Desconto: ${isDiscount}`);
         const currentDiscountGroup = document.getElementById('discount-group'); // Busca novamente por segurança
         const currentDiscountInput = document.getElementById('qrcode-discount');
         if(!currentDiscountGroup || !currentDiscountInput) {
              console.error("[handleBenefitChange] ERRO: discountGroup ou discountInput não encontrados ao executar!");
              return;
         }
         currentDiscountGroup.style.display = isDiscount ? 'block' : 'none';
         currentDiscountInput.required = isDiscount;
         if (!isDiscount) currentDiscountInput.value = '';
         console.log(`[handleBenefitChange] Display de #discount-group: ${currentDiscountGroup.style.display}`);
    };
    const closeOnClickOutside = (event) => { if (modal && event.target === modal) closeModal(); };

    // --- ATRIBUIÇÃO DE LISTENERS (Usando cloneNode para limpar antigos) ---
    if (createBtn) {
        const newCreateBtn = createBtn.cloneNode(true);
        createBtn.parentNode.replaceChild(newCreateBtn, createBtn);
        newCreateBtn.addEventListener('click', openModal);
    }
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeModal);
    }

    // Formulário e Select
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    const newBenefitTypeSelect = newForm.querySelector('#qrcode-benefit-type');

    if (newBenefitTypeSelect) {
         newBenefitTypeSelect.addEventListener('change', handleBenefitChange);
    } else {
         console.error("ERRO: Select #qrcode-benefit-type não encontrado DENTRO do formulário clonado!");
    }
    newForm.addEventListener('submit', handleCreatePromotionSubmit);
    console.log("[setupCreateModal] Listeners anexados ao #qrcode-form (clonado).");


    // Clique fora
    window.removeEventListener("click", closeOnClickOutside);
    window.addEventListener("click", closeOnClickOutside);

    console.log("[setupCreateModal] Configuração concluída.");
}

/** Configura o modal de visualização. */
function setupViewModal() {
    console.log("[setupViewModal] Iniciando...");
    const viewBtn = document.getElementById('view-qrcodes-btn');
    const modal = document.getElementById('view-qrcodes-modal');
    const closeBtn = document.getElementById('close-view-qrcodes-modal');
    const listContainer = document.getElementById('qrcodes-list');

    if (!modal) { console.error("Modal #view-qrcodes-modal não encontrado."); return; }
    if (!listContainer) { console.error("Container #qrcodes-list não encontrado."); return; }

    // Handlers
    const openModal = async () => {
        console.log("[setupViewModal] Abrindo modal de visualização...");
        listContainer.innerHTML = '<p>Carregando promoções...</p>';
        modal.classList.add('active');
        await refreshAdminPromotionsList(); // Carrega e renderiza a lista
    };
    const closeModal = () => {
         console.log("[setupViewModal] Fechando modal de visualização...");
         modal.classList.remove('active');
    };
    const closeOnClickOutside = (event) => { if (modal && event.target === modal) closeModal(); };

    // Limpa e adiciona listeners
    if (viewBtn) {
        const newViewBtn = viewBtn.cloneNode(true);
        viewBtn.parentNode.replaceChild(newViewBtn, viewBtn);
        newViewBtn.addEventListener('click', openModal);
    } else {
        console.warn("Botão #view-qrcodes-btn não encontrado.");
    }

    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeModal);
    } else {
        console.warn("Botão #close-view-qrcodes-modal não encontrado.");
    }

    window.removeEventListener("click", closeOnClickOutside); // Limpa genérico
    window.addEventListener("click", closeOnClickOutside); // Adiciona específico

    console.log("[setupViewModal] Configuração concluída.");
}

/** Atualiza a lista no modal admin/criador. */
async function refreshAdminPromotionsList() {
    const listContainer = document.getElementById('qrcodes-list');
    if (!listContainer || !currentEventId) {
        console.error("[refreshAdmin] Não é possível atualizar: container ou ID do evento faltando.");
        if(listContainer) listContainer.innerHTML = '<p style="color:red;">Erro ao carregar: ID do evento não definido.</p>';
        return;
    }
    listContainer.innerHTML = '<p>Atualizando lista...</p>';
    try {
        const promotions = await getEventPromotions(currentEventId); // Busca PROMOÇÕES
        console.log("[refreshAdmin] Promoções buscadas:", promotions.length);
        listContainer.innerHTML = renderPromotionsListAdmin(promotions); // Renderiza lista das PROMOÇÕES
        setupAdminListDeleteButtons(); // Configura botões de exclusão na NOVA lista
        console.log("[refreshAdmin] Lista admin atualizada.");
    } catch (error) {
        console.error('[refreshAdmin] Erro ao atualizar lista:', error);
        listContainer.innerHTML = '<p class="error-message" style="color:var(--danger-bg); text-align:center;">Erro ao carregar promoções.</p>';
    }
}

/** Configura os botões de exclusão na lista admin. */
function setupAdminListDeleteButtons() {
    console.log("[setupAdminListDeleteButtons] Configurando botões de exclusão...");
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const confirmMessage = document.getElementById('delete-confirm-message');
    const listContainer = document.getElementById('qrcodes-list'); // Container da lista

    if(!deleteModal || !confirmMessage || !listContainer) {
        console.warn("[setupAdminListDeleteButtons] Modal de exclusão, mensagem ou container da lista não encontrado.");
        return;
    }

    // Usa event delegation na lista para pegar cliques nos botões
    listContainer.removeEventListener('click', handleDeleteButtonClick); // Limpa listener antigo
    listContainer.addEventListener('click', handleDeleteButtonClick); // Adiciona novo
    console.log("[setupAdminListDeleteButtons] Listener de delegação adicionado a #qrcodes-list.");
}

// Handler para o clique no botão de deletar (usado com event delegation)
function handleDeleteButtonClick(event) {
     // Verifica se o clique foi no botão de deletar ou em um filho dele
    const deleteButton = event.target.closest('.delete-item-btn');
    if (!deleteButton) {
        return; // Sai se não foi no botão de deletar
    }
    event.stopPropagation(); // Previne outros cliques (como abrir detalhes do item)

    const itemId = deleteButton.getAttribute('data-id');
    const itemType = deleteButton.getAttribute('data-type') || 'item'; // Assume 'item' se não especificado
    console.log(`[handleDeleteButtonClick] Clique para deletar ${itemType} ID: ${itemId}`);

    // Encontra o modal e a mensagem de confirmação (busca novamente por segurança)
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const confirmMessage = document.getElementById('delete-confirm-message');
     if(!deleteModal || !confirmMessage || !itemId) {
         console.error("[handleDeleteButtonClick] ERRO: Modal, mensagem ou ID do item faltando.");
         return;
     }

    itemToDeleteId = itemId; // Armazena o ID para a confirmação

    // Tenta pegar um título descritivo do item na lista
    const listItem = deleteButton.closest('li');
    const titleElement = listItem?.querySelector('strong'); // Pega o <strong> que deve ter o título
    const itemTitle = titleElement?.textContent.split('\n')[0].trim() || `ID ${itemId}`; // Pega a primeira linha do strong

    // Mensagem de confirmação
     let confirmText = `Tem certeza que deseja excluir "${itemTitle}"?`;
     if (itemType === 'PROMOÇÃO') {
         confirmText = `Tem certeza que deseja excluir a PROMOÇÃO "${itemTitle}" e TODOS os QR Codes associados a ela?`;
     }
     confirmText += " Esta ação não pode ser desfeita.";
     confirmMessage.textContent = confirmText;

    deleteModal.classList.add('active'); // Mostra o modal de confirmação
}


/** Configura o modal de confirmação de exclusão. */
function setupDeleteConfirmationModal() {
    console.log("[setupDeleteConfirmationModal] Iniciando...");
    const deleteModal = document.getElementById('delete-qrcode-modal');
    const closeBtn = document.getElementById('close-delete-qrcode-modal');
    const confirmBtn = document.getElementById('confirm-delete-qrcode');
    const cancelBtn = document.getElementById('cancel-delete-qrcode');

    if (!deleteModal || !closeBtn || !confirmBtn || !cancelBtn) {
        console.warn("Elementos do modal de confirmação de exclusão não encontrados.");
        return;
    }

    const closeModal = () => {
        console.log("[setupDeleteConfirmationModal] Fechando modal de confirmação.");
        deleteModal.classList.remove('active');
        itemToDeleteId = null; // Limpa o ID ao fechar
    };

    // Limpa e adiciona listeners usando cloneNode
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', closeModal);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.addEventListener('click', closeModal);

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async (e) => {
        if (!itemToDeleteId) { closeModal(); return; } // Segurança extra

        const idToDelete = itemToDeleteId; // Copia para evitar race condition se modal fechar rápido
        console.log(`[setupDeleteConfirmationModal] Confirmada exclusão para ID: ${idToDelete}`);

        const button = e.currentTarget;
        const originalText = button.textContent;
        button.disabled = true; button.textContent = 'Excluindo...';

        try {
            // Chama a API para excluir (o backend decide se é promoção ou QR)
            await deleteQRCode(idToDelete);
            showMessage('Item excluído com sucesso!', 'success');
            closeModal(); // Fecha o modal de confirmação PRIMEIRO
            await refreshAdminPromotionsList(); // Atualiza a lista admin DEPOIS

        } catch (error) {
            console.error("[setupDeleteConfirmationModal] Erro ao excluir:", error);
            showMessage(error.message || 'Erro ao excluir item', 'error');
            // Não fecha o modal de confirmação em caso de erro
             button.disabled = false;
             button.textContent = originalText;
        }
    });

     const closeDeleteModalOnClickOutside = (event) => { if (deleteModal && event.target === deleteModal) closeModal(); };
     window.removeEventListener("click", closeDeleteModalOnClickOutside); // Limpa antigo
     window.addEventListener("click", closeDeleteModalOnClickOutside); // Adiciona novo

     console.log("[setupDeleteConfirmationModal] Configuração concluída.");
}


// --- Função Principal Exportada ---
/**
 * Configura todos os event handlers relacionados a QR Codes e Promoções.
 * @param {string} eventIdParam - O ID do evento atual.
 */
export function setupEventHandlers(eventIdParam) {
    // Só configura se os elementos base dos modais existirem
    if (!document.getElementById('qrcode-modal') ||
        !document.getElementById('view-qrcodes-modal') ||
        !document.getElementById('delete-qrcode-modal')) {
        console.log("[setupEventHandlers] Modais de QR Code não encontrados no DOM. Pulando setup.");
        return;
    }
    currentEventId = eventIdParam; // Define o ID do evento atual para o módulo
    if (!currentEventId) {
        console.error("[setupEventHandlers] ERRO: eventIdParam não foi fornecido!");
        return; // Não continua sem o ID do evento
    }
    console.log(`[setupEventHandlers] Configurando Handlers para Evento ID: ${currentEventId}`);
    setupCreateModal();
    setupViewModal();
    setupDeleteConfirmationModal(); // Garante que o modal de delete esteja pronto
}