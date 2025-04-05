import { renderUserQRCodes } from './qrcode-manager.js';

/**
 * Formata a data do evento para exibição
 * @param {string} date - Data do evento
 * @param {string} time - Horário do evento
 * @returns {string} Data formatada
 */
export function formatEventDate(date, time) {
    if (!date) return 'Data não definida';

    const eventDate = new Date(date);
    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    };

    let formattedDate = eventDate.toLocaleDateString('pt-BR', options);

    if (time) {
        formattedDate += ` • ${time}`;
    }

    return formattedDate;
}

/**
 * Renderiza o HTML da página de detalhes do evento
 * @param {Object} event - Dados do evento
 * @param {Object} user - Usuário logado
 * @param {boolean} canManageQrCodes - Se o usuário pode gerenciar QR Codes
 * @param {Array} userQRCodes - Lista de QR Codes do usuário
 * @returns {string} HTML da página
 */
export function renderEventDisplay(event, user, canManageQrCodes, userQRCodes) {
    return `
    <div class="page-container">
      <header class="header">
        <a href="#events" class="back-button" id="back-button">
          <svg class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </a>
        
        ${canManageQrCodes ? `
        <div class="action-buttons">
          <button class="icon-button" id="create-qrcode-btn" title="Criar QR Code de Benefício">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v9M7 3h9M3 3h4v4H3zM17 17h4v4h-4zM17 3h4v4h-4zM3 17h4v4H3zM17 8v9"></path>
            </svg>
          </button>
          <button class="icon-button" id="view-qrcodes-btn" title="Ver QR Codes">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
        </div>
        ` : ''}
      </header>

      <main class="content-container">
        <article class="event-detail">
          <section class="event-image-container" id="event-image-container">
            <img id="event-image" class="event-image" src="${event.photo_url || 'https://via.placeholder.com/800x400?text=Sem+Imagem'}">
            <div class="event-overlay">
              <h1 id="event-title" class="event-title">${event.event_name}</h1>
              <time id="event-date" class="event-time">${formatEventDate(event.event_date, event.event_time)}</time>
            </div>
          </section>

          <section class="event-info">
            <div class="tab-content">
              <section class="event-description">
                <h2 class="section-title">Descrição</h2>
                <p id="event-description">${event.description || 'Sem descrição disponível'}</p>
              </section>

              <section class="event-interaction">
                <div class="detail-item like-section">
                  <button id="like-button" class="icon-button like-button" aria-label="Curtir evento">
                      <svg class="icon heart-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                  </button>
                  <span id="like-count" class="like-count">${event.likeCount !== undefined ? event.likeCount : 0}</span>
                  </div>
                  <h3 class="section-title">Curtidas</h3> 
                </div>
              </section>

              <div class="event-details">
                <div class="detail-item">
                  <h3 class="section-title">Localização</h3>
                  <address id="event-location">${event.location}</address>
                </div>

                ${event.event_link ? `
                <div class="detail-item">
                  <h3 class="section-title">Link do Evento</h3>
                  <a id="event-link" class="event-link" href="${event.event_link}" target="_blank">${event.event_link}</a>
                </div>
                ` : ''}

                <div class="detail-item">
                  <h3 class="section-title">Categoria</h3>
                  <p id="event-category">${event.category_name}${event.subcategory_name ? ` / ${event.subcategory_name}` : ''}</p>
                </div>
                
                ${event.creator_name ? `
                <div class="detail-item">
                  <h3 class="section-title">Organizador</h3>
                  <p id="event-creator">${event.creator_name}</p>
                </div>
                ` : ''}
              </div>

              <!-- Adicionar a seção de QR Codes do usuário aqui -->
              ${user && userQRCodes.length > 0 ? `
                <section class="user-qrcodes-section">
                  <h2 class="section-title">Seus QR Codes</h2>
                  <div class="qr-codes-grid">
                    ${renderUserQRCodes(userQRCodes)}
                  </div>
                </section>
              ` : ''}

              <!-- Seção de Vídeos -->
              <div class="video-section">
                <h2 class="section-title">Vídeos</h2>
                <div id="video-container" class="video-grid"></div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <!-- Modal para criação de QR Code -->
      <div class="modal" id="qrcode-modal">
        <div class="modal-content">
          <span class="close-modal" id="close-qrcode-modal">&times;</span>
          <h3>Criar QR Code Promocional</h3>
          
          <form id="qrcode-form">
            <div class="form-group">
              <label for="qrcode-description">Descrição da Promoção</label>
              <input type="text" id="qrcode-description" placeholder="Descreva esta promoção" required>
            </div>
            
            <div class="form-group">
              <label for="qrcode-benefit-type">Tipo de Benefício</label>
              <select id="qrcode-benefit-type" required>
                <option value="">Selecione o tipo</option>
                <option value="discount">Desconto</option>
                <option value="gift">Brinde</option>
                <option value="vip">Acesso VIP</option>
              </select>
            </div>
            
            <div class="form-group" id="discount-group" style="display:none;">
              <label for="qrcode-discount">Percentual de Desconto</label>
              <input type="number" id="qrcode-discount" min="1" max="100" placeholder="Ex: 15">
            </div>
            
            <div class="form-group">
              <label for="qrcode-benefit-description">Descrição do Benefício</label>
              <textarea id="qrcode-benefit-description" placeholder="Detalhes sobre o benefício oferecido" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="qrcode-max-codes">Limite de QR Codes (opcional)</label>
              <input type="number" id="qrcode-max-codes" min="1" placeholder="Deixe em branco para ilimitado">
            </div>
            
            <div class="form-group">
              <label for="qrcode-generation-deadline">Data Limite para Geração</label>
              <input type="datetime-local" id="qrcode-generation-deadline">
            </div>
            
            <div class="form-group">
              <label for="qrcode-usage-deadline">Data Limite para Uso</label>
              <input type="datetime-local" id="qrcode-usage-deadline">
            </div>
            
            <div class="modal-buttons">
              <button type="submit" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF);">Criar Promoção</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para visualizar QR Codes -->
      <div class="modal" id="view-qrcodes-modal">
        <div class="modal-content" style="max-width: 600px;">
          <span class="close-modal" id="close-view-qrcodes-modal">&times;</span>
          <h3>QR Codes para ${event.event_name}</h3>
          
          <div id="qrcodes-list" class="qrcodes-list">
            <p>Carregando QR Codes...</p>
          </div>
        </div>
      </div>
      
      <!-- Modal para confirmar exclusão de QR Code -->
      <div class="modal" id="delete-qrcode-modal">
        <div class="modal-content">
          <span class="close-modal" id="close-delete-qrcode-modal">&times;</span>
          <h3>Confirmar exclusão</h3>
          <p>Tem certeza que deseja excluir este QR Code? Esta ação não pode ser desfeita.</p>
          <div class="modal-buttons">
            <button id="confirm-delete-qrcode" class="btn" style="background-color: #B33A3A;">Excluir</button>
            <button id="cancel-delete-qrcode" class="btn secondary">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}