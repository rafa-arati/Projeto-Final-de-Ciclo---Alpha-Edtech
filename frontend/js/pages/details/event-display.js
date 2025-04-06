import { renderUserQRCodes as renderUserQRCodesHTML} from './qrcode-manager.js';

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/></svg>`;
const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>`;
const categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2A2 2 0 0 1 4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/></svg>`;
const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/></svg>`;
const heartIconSvg = `<svg class="icon heart-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const qrCodeIcon = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v9M7 3h9M3 3h4v4H3zM17 17h4v4h-4zM17 3h4v4h-4zM3 17h4v4H3zM17 8v9"></path></svg>`;
const listQrIcon = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>`;
// *** ADICIONE ESTA LINHA ***
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
// *** FIM DA LINHA ADICIONADA ***

function setupEventEditButton(eventId) {
  const editButton = document.getElementById('edit-event-btn');
  if (editButton) {
      editButton.addEventListener('click', () => {
          window.location.href = `/events/edit/${eventId}`;
      });
  }
}

// *** MODIFIQUE A FUNÇÃO setupEventHandlers ***
export function setupEventHandlers(eventIdParam) {
  currentEventId = eventIdParam;
  
  // Configura o botão de edição
  setupEventEditButton(currentEventId);

  // Restante da configuração original
  if (!document.getElementById('qrcode-modal') ||
      !document.getElementById('view-qrcodes-modal') ||
      !document.getElementById('delete-qrcode-modal')) {
      return;
  }

  console.log(`Configurando Handlers para Evento ID: ${currentEventId}`);
  setupCreateModal();
  setupViewModal();
  setupDeleteConfirmationModal();
}

/**
 * Formata a data do evento para exibição
 * @param {string} date - Data do evento (YYYY-MM-DD)
 * @param {string} time - Horário do evento (HH:MM)
 * @returns {string} Data e hora formatadas
 */
export function formatEventDate(date, time) {
   // ... (código da função como antes) ...
    if (!date) return 'Data não definida';
    try {
        const dateObj = new Date(date);
        dateObj.setUTCDate(dateObj.getUTCDate() + 1);
        const optionsDate = { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' };
        let formatted = dateObj.toLocaleDateString('pt-BR', optionsDate);
        if (time) {
            const [hours, minutes] = time.split(':');
            formatted += ` às ${hours}h${minutes}`;
        }
        return formatted;
    } catch (e) {
        console.error("Erro ao formatar data/hora:", e);
        return `${date || ''}${time ? ' ' + time : ''}`;
    }
}


/**
 * Renderiza o HTML da página de detalhes do evento com layout aprimorado.
 * (Função renderEventDisplay como na resposta anterior, agora o editIcon estará definido)
 * @param {Object} event - Dados do evento.
 * @param {Object|null} user - Usuário logado ou null.
 * @param {boolean} canManageQrCodes - Se o usuário pode gerenciar QR Codes para este evento.
 * @param {Array} userQRCodes - Lista de QR Codes que o usuário gerou para este evento.
 * @param {Array} availablePromotions - Lista de promoções disponíveis para usuários gerarem QR Code.
 * @returns {string} HTML da página.
 */
export function renderEventDisplay(event, user, canManageQrCodes, userQRCodes = [], availablePromotions = []) {
    // ... (início da função como antes, definindo eventDateFormatted, eventCategory, etc.) ...
    const eventDateFormatted = formatEventDate(event.event_date, event.event_time);
    const eventCategory = `${event.category_name || ''}${event.subcategory_name ? ` / ${event.subcategory_name}` : ''}`;
    const eventLinkDisplay = event.event_link ? `<a href="${event.event_link}" target="_blank" rel="noopener noreferrer" class="event-detail-link">${event.event_link}</a>` : 'Não informado';


    // Placeholder para renderizar promoções
     const renderAvailablePromotions = () => {
        if (!user || !availablePromotions || availablePromotions.length === 0) return '';
        // A lógica real de renderização de promoções deve vir do promotion-manager.js
        // Este é apenas um exemplo:
        const firstPromoId = availablePromotions[0]?.promotion_id; // Pega o ID da primeira promoção como exemplo
        return `
            <section class="event-promotions content-section">
                <h2 class="section-title">Promoções Disponíveis (${availablePromotions.length})</h2>
                <div class="promotions-list">
                     <p><i>(Lista de promoções apareceria aqui)</i></p>
                     ${firstPromoId ? `<button class="btn generate-qrcode-btn" data-promotion-id="${firstPromoId}">Gerar QR Code (Exemplo)</button>` : ''}
                </div>
            </section>
        `;
    };

     // Placeholder para renderizar QR Codes do usuário
     const renderUserQRCodesSection = () => {
      if (!user || !userQRCodes || userQRCodes.length === 0) return '';
      const qrCodeCardsHTML = renderUserQRCodesHTML(userQRCodes); // Usa a função importada
      return `
          <section class="user-qrcodes-section content-section">
              <h2 class="section-title">Seu QR Code Gerado</h2>
              <div class="qr-codes-grid">
                  ${qrCodeCardsHTML || '<p>Erro ao renderizar QR Codes.</p>'}
              </div>
          </section>
      `;
  };

    // Renderiza ações do criador/admin
    const renderCreatorActions = () => {
        if (!canManageQrCodes) return '';
        return `
            <section class="creator-actions content-section">
                <h2 class="section-title">Gerenciar Evento</h2>
                <div class="creator-action-buttons">
                    <button class="btn-profile-action" id="create-qrcode-btn" title="Criar nova promoção ou QR Code avulso">
                        ${qrCodeIcon} Criar Promoção/QR Code
                    </button>
                    <button class="btn-profile-action" id="view-qrcodes-btn" title="Ver promoções e QR Codes existentes">
                        ${listQrIcon} Visualizar Promoções/QR Codes
                    </button>
                    <button class="btn-profile-action" id="edit-event-btn" data-event-id="${event.id}" title="Editar informações deste evento">
                         ${editIcon} Editar Detalhes do Evento
                     </button>
                </div>
            </section>
        `;
    };


    // Gera o HTML final
    return `
    <div class="app-wrapper event-details-page">
      <div class="app-container">
        <header class="page-header">
          <a href="#events" class="back-button" id="back-button" title="Voltar para Eventos">${backIcon}</a>
          <h1>${event.event_name || 'Detalhes do Evento'}</h1>
        </header>

        <main class="event-details-content">
          <section class="event-image-container-detail">
            <img id="event-image" class="event-image-detail" src="${event.photo_url || 'https://via.placeholder.com/1000x400/1a1a1a/666666?text=Imagem+Indispon%C3%ADvel'}" alt="Imagem de ${event.event_name || 'evento'}">
          </section>

          <section class="event-key-info content-section">
             <div class="info-item"> ${calendarIcon} <span>${eventDateFormatted}</span> </div>
             ${event.event_time ? `<div class="info-item"> ${clockIcon} <span>Início às ${event.event_time}</span> </div>` : ''}
             <div class="info-item"> ${locationIcon} <address>${event.location || 'Local não informado'}</address> </div>
             ${eventCategory ? `<div class="info-item"> ${categoryIcon} <span>${eventCategory}</span> </div>` : ''}
             ${event.creator_name ? `<div class="info-item"> ${userIcon} <span>Organizado por: ${event.creator_name}</span> </div>` : ''}
             <div class="info-item like-container">
                 <button id="like-button" class="icon-button like-button ${event.userHasLiked ? 'active' : ''}" aria-label="Curtir evento" aria-pressed="${event.userHasLiked ? 'true' : 'false'}" ${!user ? 'disabled title="Faça login para curtir"' : ''}>
                      ${heartIconSvg}
                 </button>
                 <span id="like-count" class="like-count">${event.likeCount !== undefined ? event.likeCount : 0}</span>
                 <span class="like-label">Curtidas</span>
             </div>
          </section>

          ${event.description ? `
          <section class="event-description content-section">
            <h2 class="section-title">Sobre o Evento</h2>
            <p id="event-description">${event.description}</p>
          </section>` : ''}

          ${renderAvailablePromotions()}

          ${renderUserQRCodesSection()}

          ${renderCreatorActions()}

          ${event.event_link ? `
          <section class="event-external-link content-section">
              <h2 class="section-title">Mais Informações</h2>
              ${eventLinkDisplay}
          </section>
          ` : ''}

          ${(event.video_urls && event.video_urls.length > 0) ? `
          <section class="video-section content-section">
            <h2 class="section-title">Vídeos Relacionados</h2>
            <div id="video-container" class="video-grid">
                </div>
          </section>` : ''}

        </main>

        <div class="modal" id="qrcode-modal"> <div class="modal-content"> <span class="close-modal" id="close-qrcode-modal">&times;</span> <h3>Criar Promoção/QR Code</h3> <form id="qrcode-form"> <div class="form-group"> <label for="qrcode-description">Descrição da Promoção*</label> <input type="text" id="qrcode-description" placeholder="Ex: 10% OFF na entrada" required> </div> <div class="form-group"> <label for="qrcode-benefit-type">Tipo de Benefício*</label> <select id="qrcode-benefit-type" required> <option value="">Selecione</option> <option value="discount">Desconto (%)</option> <option value="gift">Brinde</option> <option value="vip">Acesso VIP</option> <option value="other">Outro</option> </select> </div> <div class="form-group" id="discount-group" style="display:none;"> <label for="qrcode-discount">Percentual de Desconto*</label> <input type="number" id="qrcode-discount" min="1" max="100" placeholder="Ex: 15"> </div> <div class="form-group"> <label for="qrcode-benefit-description">Descrição Detalhada do Benefício*</label> <textarea id="qrcode-benefit-description" placeholder="Ex: Ganhe uma bebida especial na compra do ingresso" required rows="3"></textarea> </div> <div class="form-group"> <label for="qrcode-max-codes">Limite de Códigos (Opcional)</label> <input type="number" id="qrcode-max-codes" min="1" placeholder="Deixe em branco para ilimitado"> </div> <div class="form-group"> <label for="qrcode-generation-deadline">Gerar Até (Opcional)</label> <input type="datetime-local" id="qrcode-generation-deadline"> </div> <div class="form-group"> <label for="qrcode-usage-deadline">Usar Até (Opcional)</label> <input type="datetime-local" id="qrcode-usage-deadline"> </div> <div class="modal-buttons"> <button type="submit" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF);">Criar Promoção</button> </div> </form> </div> </div>
        <div class="modal" id="view-qrcodes-modal"> <div class="modal-content" style="max-width: 600px;"> <span class="close-modal" id="close-view-qrcodes-modal">&times;</span> <h3>Promoções Atuais</h3> <div id="qrcodes-list" class="qrcodes-list"> <p>Carregando...</p> </div> </div> </div>
        <div class="modal" id="delete-qrcode-modal"> <div class="modal-content"> <span class="close-modal" id="close-delete-qrcode-modal">&times;</span> <h3>Confirmar Exclusão</h3> <p id="delete-confirm-message">Tem certeza que deseja excluir? Esta ação não pode ser desfeita.</p> <div class="modal-buttons"> <button id="confirm-delete-qrcode" class="btn" style="background-color: #B33A3A;">Excluir</button> <button id="cancel-delete-qrcode" class="btn secondary">Cancelar</button> </div> </div> </div>


      </div> </div> `;
}