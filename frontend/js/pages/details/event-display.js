// Importar o módulo do Google Maps
import { loadGoogleMapsAPI } from '../../modules/google-maps.js';

// Ícones (mantidos como antes)
const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/></svg>`;
const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>`;
const categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2A2 2 0 0 1 4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/></svg>`;
const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/></svg>`;
const heartIconSvg = `<svg class="icon heart-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const qrCodeIcon = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v9M7 3h9M3 3h4v4H3zM17 17h4v4h-4zM17 3h4v4h-4zM3 17h4v4H3zM17 8v9"></path></svg>`;
const listQrIcon = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>`;
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const scanIcon = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v9M7 3h9M3 3h4v4H3zM17 17h4v4h-4zM17 3h4v4h-4zM3 17h4v4H3zM17 8v9M7 17v-4M12 17v-4"></path></svg>`;

// Adicionando a função setupEventHandlers da branch main
let currentEventId;

/**
 * Configura manipuladores de eventos para a página de detalhes
 * @param {string|number} eventIdParam - ID do evento atual
 */
export function setupEventHandlers(eventIdParam) {
  currentEventId = eventIdParam;
  console.log(`Configurando Handlers para Evento ID: ${currentEventId}`);

  // Configura o botão de edição
  setupEventEditButton(currentEventId);

  // Verifica se os elementos necessários existem
  if (!document.getElementById('qrcode-modal') ||
    !document.getElementById('view-qrcodes-modal') ||
    !document.getElementById('delete-qrcode-modal')) {
    console.log('Elementos modais não encontrados. Alguns handlers não serão configurados.');
    return;
  }

  // Configurar modais
  setupCreateModal();
  setupViewModal();
  setupDeleteConfirmationModal();
}

/**
 * Configura o botão de edição do evento
 * @param {string|number} eventId - ID do evento
 */
function setupEventEditButton(eventId) {
  const editButton = document.getElementById('edit-event-btn');
  if (!editButton) {
    console.log('Botão de edição não encontrado');
    return;
  }

  editButton.addEventListener('click', function () {
    console.log(`Redirecionando para edição do evento ID: ${eventId}`);
    // Usar window.location.hash para navegação com hash router
    window.location.hash = `create-event?edit=${eventId}`;
  });
}

/**
 * Configura o modal de criação de QR Code/Promoção
 */
function setupCreateModal() {
  // Esta é apenas uma implementação de placeholder. 
  // A implementação real dependerá de como seus modais funcionam.
  console.log('Configurando modal de criação de QR Code');
  const modal = document.getElementById('qrcode-modal');
  const closeBtn = document.getElementById('close-qrcode-modal');
  const openBtn = document.getElementById('create-qrcode-btn');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

/**
 * Configura o modal de visualização de QR Codes/Promoções
 */
function setupViewModal() {
  // Esta é apenas uma implementação de placeholder.
  console.log('Configurando modal de visualização de QR Codes');
  const modal = document.getElementById('view-qrcodes-modal');
  const closeBtn = document.getElementById('close-view-qrcodes-modal');
  const openBtn = document.getElementById('view-qrcodes-btn');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

/**
 * Configura o modal de confirmação de exclusão
 */
function setupDeleteConfirmationModal() {
  // Esta é apenas uma implementação de placeholder.
  console.log('Configurando modal de confirmação de exclusão');
  const modal = document.getElementById('delete-qrcode-modal');
  const closeBtn = document.getElementById('close-delete-qrcode-modal');
  const cancelBtn = document.getElementById('cancel-delete-qrcode');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

/**
 * Formata a data/hora do evento para exibição amigável em pt-BR.
 * @param {string | null} dateString - String da data (pode ser YYYY-MM-DD ou ISO 8601 como YYYY-MM-DDTHH:MM:SS.sssZ).
 * @param {string | null} timeString - String da hora (HH:MM), usada como fallback se dateString não tiver hora.
 * @returns {string} Data e hora formatadas (ex: "15 de abril de 2025 às 00:00") ou 'Data não definida'.
 */
export function formatEventDate(dateString, timeString) {
  if (!dateString) return 'Data não definida';

  try {
    // 1. Cria o objeto Date e verifica validade
    let dateObj;

    // Tenta criar a data diretamente da string principal
    if (dateString.includes('T')) {
      // Se já tem informação de timezone (ISO 8601)
      dateObj = new Date(dateString);
    } else {
      // Se é apenas data (YYYY-MM-DD), trata como UTC para evitar problemas de fuso
      const [year, month, day] = dateString.split('-');
      dateObj = new Date(Date.UTC(year, month - 1, day));
    }

    // Se a data é inválida, tenta combinar com timeString
    if (isNaN(dateObj.getTime()) && timeString) {
      const [hours, minutes] = timeString.split(':');
      dateObj = new Date(Date.UTC(
        parseInt(dateString.split('-')[0]), // ano
        parseInt(dateString.split('-')[1]) - 1, // mês (0-11)
        parseInt(dateString.split('-')[2]), // dia
        parseInt(hours),
        parseInt(minutes)
      ));
    }

    // Se ainda inválida, lança erro
    if (isNaN(dateObj.getTime())) {
      throw new Error("Data/hora inválida recebida");
    }

    // 2. Compensação do fuso horário
    const timezoneOffset = dateObj.getTimezoneOffset() * 60000;
    const localDate = new Date(dateObj.getTime() - timezoneOffset);

    // 3. Formatação
    const dateOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    let formattedString = localDate.toLocaleDateString('pt-BR', dateOptions);

    // 4. Verifica se precisa incluir horário
    const hasTime = timeString ||
      (dateString.includes('T') &&
        !dateString.endsWith('T00:00:00.000Z') &&
        !dateString.endsWith('T00:00:00Z'));

    if (hasTime) {
      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      formattedString += ` às ${localDate.toLocaleTimeString('pt-BR', timeOptions)}`;
    }

    return formattedString;

  } catch (e) {
    console.error("Erro ao formatar data/hora:", dateString, timeString, e);
    // Fallback: mostra a data original ou mensagem de erro
    return dateString ? dateString.split('T')[0] : 'Data inválida';
  }
}

/**
 * Renderiza o HTML da página de detalhes do evento.
 * @param {Object} event - Dados do evento.
 * @param {Object|null} user - Usuário logado ou null.
 * @param {boolean} canManageQrCodes - Se o usuário pode gerenciar QR Codes.
 * @param {Array} userQRCodes - Lista de QR Codes do usuário para este evento.
 * @param {Array} availablePromotions - Lista de promoções disponíveis para este evento.
 * @returns {string} HTML da página.
 */
export function renderEventDisplay(event, user, canManageQrCodes, userQRCodes = [], availablePromotions = []) {
  if (!event) return '<p>Erro: Dados do evento não disponíveis.</p>';

  // Remove a verificação do horário na string e formata a data/hora
  const eventDateOnly = event.event_date ? event.event_date.split('T')[0] : '';
  const eventDateFormatted = formatEventDate(eventDateOnly, event.event_time);

  const eventCategory = `${event.category_name || ''}${event.subcategory_name ? ` / ${event.subcategory_name}` : ''}`.trim();
  const eventLinkDisplay = event.event_link ? `<a href="${event.event_link}" target="_blank" rel="noopener noreferrer" class="event-detail-link">${event.event_link}</a>` : 'Não informado';

  // Verificar se o evento tem coordenadas para exibir o mapa
  const hasCoordinates = event.coordinates && event.coordinates.match(/\([^)]+\)/);

  // Criar a seção do mapa
  const mapSection = hasCoordinates ? `
    <section class="event-location-map content-section">
      <h2 class="section-title">Localização</h2>
      <div id="event-map" class="event-map"></div>
      <div class="map-actions">
        <button id="get-directions" class="btn-directions">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5V9h4.5A1.5 1.5 0 0 0 14 7.5v-3A1.5 1.5 0 0 0 12.5 3h-3z"/>
            <path d="M7 3.5v5H3a.5.5 0 0 0-.5.5v2.5a.5.5 0 0 0 .5.5h4.293L5.646 14.146a.5.5 0 1 0 .708.708l2.5-2.5a.5.5 0 0 0 0-.708l-2.5-2.5a.5.5 0 1 0-.708.708L7.293 12H3a.5.5 0 0 1-.5-.5V9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 0 .5-.5v-5A.5.5 0 0 0 8 3H5.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5H7v-1z"/>
          </svg>
          Como chegar
        </button>
      </div>
    </section>
  ` : '';

  // Renderiza promoções disponíveis
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


  // Renderiza ações do criador/admin
  const renderCreatorActions = () => {
    if (!canManageQrCodes) return '';
    return `
            <section class="creator-actions content-section">
                <h2 class="section-title">Gerenciar Evento</h2>
                <div class="creator-action-buttons grid-2x2">
                    <button class="btn-profile-action" id="create-qrcode-btn" title="Criar Promoção">
                        ${qrCodeIcon} Criar Promoção/QR Code
                    </button>
                    <button class="btn-profile-action" id="view-qrcodes-btn" title="Ver Promoções">
                        ${listQrIcon} Visualizar Promoções/QR Codes
                    </button>
                    <button class="btn-profile-action" id="edit-event-btn" data-event-id="${event.id}" title="Editar Evento">
                         ${editIcon} Editar Detalhes do Evento
                     </button>
                     <button class="btn-profile-action" id="open-scan-modal-btn" title="Escanear QR Code">
                         ${scanIcon} Escanear QR Code
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
          <button class="back-button" id="details-back-button" title="Voltar">${backIcon}</button>
          <h1>${event.event_name || 'Detalhes do Evento'}</h1>
        </header>

        <main class="event-details-content">
          <section class="event-image-container-detail">
            <img id="event-image" class="event-image-detail" src="${event.photo_url || 'https://via.placeholder.com/1000x400/1a1a1a/666666?text=Imagem+Indispon%C3%ADvel'}" alt="Imagem de ${event.event_name || 'evento'}">
          </section>

          <section class="event-key-info content-section">
             <div class="info-item"> ${calendarIcon} <span>${eventDateFormatted}</span> </div>

            ${event.event_time ? `<div class="info-item"> ${clockIcon} <span>Início às ${event.event_time}</span> </div>` : ''}

             <div class="info-item">
              ${locationIcon} 
              <address>
                ${event.location ?
      `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" target="_blank" rel="noopener noreferrer">
                    ${event.location}
                  </a>` :
      'Local não informado'
    }
              </address>
            </div>
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

          ${mapSection}

          ${event.description ? `
          <section class="event-description content-section">
            <h2 class="section-title">Sobre o Evento</h2>
            <p id="event-description">${event.description}</p>
          </section>` : ''}

          <div id="user-promotions-container">
             ${!user ? '<p style="text-align: center; color: var(--details-text-secondary); padding: 20px;">Faça login para ver as promoções.</p>' : ''}
          </div>

          ${renderCreatorActions()}

          ${event.event_link ? `
          <section class="event-external-link content-section">
              <h2 class="section-title">Mais Informações</h2>
              ${eventLinkDisplay}
          </section>
          ` : ''}

          ${(event.video_urls && Array.isArray(event.video_urls) && event.video_urls.filter(url => url).length > 0) ? `
          <section class="video-section content-section">
            <h2 class="section-title">Vídeos Relacionados</h2>
            <div id="video-container" class="video-grid">
            </div>
          </section>` : ''}

        </main>

        <div class="modal" id="qrcode-modal"> <div class="modal-content"> <span class="close-modal" id="close-qrcode-modal">&times;</span> <h3>Criar Promoção/QR Code</h3> <form id="qrcode-form"> <div class="form-group"> <label for="qrcode-description">Descrição da Promoção*</label> <input type="text" id="qrcode-description" placeholder="Ex: 10% OFF na entrada" required> </div> <div class="form-group"> <label for="qrcode-benefit-type">Tipo de Benefício*</label> <select id="qrcode-benefit-type" required> <option value="">Selecione</option> <option value="discount">Desconto (%)</option> <option value="gift">Brinde</option> <option value="vip">Acesso VIP</option> <option value="other">Outro</option> </select> </div> <div class="form-group" id="discount-group"> <label for="qrcode-discount">Percentual de Desconto*</label> <input type="number" id="qrcode-discount" min="1" max="100" placeholder="Ex: 15"> </div> <div class="form-group"> <label for="qrcode-benefit-description">Descrição Detalhada do Benefício*</label> <textarea id="qrcode-benefit-description" placeholder="Ex: Ganhe uma bebida especial na compra do ingresso" required rows="3"></textarea> </div> <div class="form-group"> <label for="qrcode-max-codes">Limite de Códigos (Opcional)</label> <input type="number" id="qrcode-max-codes" min="1" placeholder="Deixe em branco para ilimitado"> </div> <div class="form-group"> <label for="qrcode-generation-deadline">Gerar Até (Opcional)</label> <input type="datetime-local" id="qrcode-generation-deadline"> </div> <div class="form-group"> <label for="qrcode-usage-deadline">Usar Até (Opcional)</label> <input type="datetime-local" id="qrcode-usage-deadline"> </div> <div id="qrcode-error-message" class="form-error-message" style="display: none;"> </div><div class="modal-buttons"> <button type="submit" class="btn" style= background: --details-accent-primary";">Criar Promoção</button> </div> </form> </div> </div>
        <div class="modal" id="view-qrcodes-modal"> <div class="modal-content" style="max-width: 750px;"> <span class="close-modal" id="close-view-qrcodes-modal">&times;</span> <h3>Promoções Atuais</h3> <div id="qrcodes-list" class="qrcodes-list admin-promotions-list"> <p>Carregando...</p> </div> </div> </div>
        <div class="modal" id="delete-qrcode-modal"> <div class="modal-content"> <span class="close-modal" id="close-delete-qrcode-modal">&times;</span> <h3>Confirmar Exclusão</h3> <p id="delete-confirm-message">Tem certeza que deseja excluir? Esta ação não pode ser desfeita.</p> <div class="modal-buttons"> <button id="confirm-delete-qrcode" class="btn danger">Excluir</button> <button id="cancel-delete-qrcode" class="btn secondary">Cancelar</button> </div> </div> </div>
        <div class="modal" id="scan-qrcode-modal"> <div class="modal-content"> <span class="close-modal" id="close-scan-modal">&times;</span> <h3>Validar QR Code</h3> <div id="scan-modal-content"> </div> </div> </div></div> </div>`;
}

/**
 * Inicializa o mapa na página de detalhes do evento
 * @param {Object} event - Dados do evento
 */
export async function initializeEventMap(event) {
  // Verifica se o evento tem coordenadas
  if (!event || !event.coordinates) {
    console.log('Evento sem coordenadas válidas. Mapa não será mostrado.');
    return;
  }

  // Extrair coordenadas do formato "(lat,lng)"
  const coordsMatch = event.coordinates.match(/\(([^,]+),([^)]+)\)/);
  if (!coordsMatch || coordsMatch.length !== 3) {
    console.log('Formato de coordenadas inválido:', event.coordinates);
    return;
  }

  const lat = parseFloat(coordsMatch[1]);
  const lng = parseFloat(coordsMatch[2]);
  if (isNaN(lat) || isNaN(lng)) {
    console.log('Coordenadas não são números válidos:', lat, lng);
    return;
  }

  try {
    console.log('Inicializando mapa para coordenadas:', lat, lng);

    // Carregar a API do Google Maps
    await loadGoogleMapsAPI();
    console.log('API do Google Maps carregada com sucesso');

    // Obter elemento do mapa
    const mapElement = document.getElementById('event-map');
    if (!mapElement) {
      console.error('Elemento do mapa não encontrado no DOM');
      return;
    }

    // Criar mapa
    const position = { lat, lng };
    const map = new google.maps.Map(mapElement, {
      center: position,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        // Estilos para mapa escuro, compatível com seu tema
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        // ...mais estilos podem ser adicionados aqui
      ]
    });

    // Adicionar marcador
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP,
      title: event.event_name || 'Evento'
    });

    // Adicionar infowindow com endereço
    const infowindow = new google.maps.InfoWindow({
      content: `<div style="color: #333; padding: 5px;">${event.address || event.location || 'Localização do evento'}</div>`
    });

    marker.addListener('click', () => {
      infowindow.open(map, marker);
    });

    // Configurar botão "Como chegar"
    const directionsButton = document.getElementById('get-directions');
    if (directionsButton) {
      directionsButton.addEventListener('click', () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      });
    }

    // Adicionar estilos ao mapa
    addEventMapStyles();
    console.log('Mapa inicializado com sucesso');

  } catch (error) {
    console.error("Erro ao inicializar mapa de evento:", error);
    const mapElement = document.getElementById('event-map');
    if (mapElement) {
      mapElement.innerHTML = '<div class="map-error">Não foi possível carregar o mapa. Verifique sua conexão.</div>';
    }
  }
}

/**
 * Adiciona estilos específicos para o mapa da página de detalhes
 */
function addEventMapStyles() {
  const styleId = 'event-map-styles';
  if (document.getElementById(styleId)) return;

  const styles = document.createElement('style');
  styles.id = styleId;
  styles.textContent = `
    .event-map {
      height: 300px;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 15px;
      border: 1px solid #3a3a3c;
      background-color: #1d1d1d;
    }
    
    .map-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
    
    .btn-directions {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #3a3a3c;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 15px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    
    .btn-directions:hover {
      background: #4a4a4c;
    }
    
    .map-error {
      padding: 15px;
      text-align: center;
      color: #e57373;
      font-style: italic;
    }
  `;

  document.head.appendChild(styles);
}// Importar o módulo do Google Maps