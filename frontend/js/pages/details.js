import { getEventById } from '../modules/events-api.js';
import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';
import { getLoggedInUser, isAdmin } from '../modules/store.js';

export default async function renderEventDetails(queryParams) {
  const appContainer = document.getElementById('app');
  const eventId = queryParams.get('id');
  const user = getLoggedInUser();

  if (!eventId) {
    showMessage('Evento não encontrado');
    navigateTo('events');
    return;
  }

  try {
    // Carregar dados do evento
    const event = await getEventById(eventId);
    if (!event) {
      showMessage('Evento não encontrado');
      navigateTo('events');
      return;
    }

    // Determinar se o usuário pode gerenciar QR Codes
    const canManageQrCodes = (user?.role === 'admin' ||
      (user?.role === 'premium' && user?.id === event.creator_id));

    // Carregar QR Codes se o usuário tiver permissão
    let qrCodes = [];
    if (canManageQrCodes) {
      try {
        const qrResponse = await fetch(`/api/qrcode/event/${eventId}`, {
          credentials: 'include'
        });

        if (qrResponse.ok) {
          qrCodes = await qrResponse.json();
        }
      } catch (error) {
        console.error('Erro ao carregar QR Codes:', error);
      }
    }

    // Preparar HTML da página
    appContainer.innerHTML = `
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
                <label for="qrcode-description">Descrição</label>
                <input type="text" id="qrcode-description" placeholder="Descreva este QR Code" required>
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
                <label for="qrcode-valid-until">Válido até</label>
                <input type="datetime-local" id="qrcode-valid-until">
              </div>
              
              <div class="modal-buttons">
                <button type="submit" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF);">Gerar QR Code</button>
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
              ${qrCodes.length > 0 ? renderQRCodesList(qrCodes) : '<p>Nenhum QR Code criado para este evento.</p>'}
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

    // Configurar eventos
    setupEventHandlers(eventId, qrCodes);
  } catch (error) {
    console.error('Erro:', error);
    showMessage(error.message || 'Erro ao carregar detalhes do evento');
    navigateTo('events');
  }
}

// Formatação de data do evento
function formatEventDate(date, time) {
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

// Renderiza a lista de QR Codes
function renderQRCodesList(qrCodes) {
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

// Configurar manipuladores de eventos
function setupEventHandlers(eventId, qrCodes) {
  // Variável para armazenar o ID do QR Code a ser excluído
  let qrCodeToDelete = null;

  // Botão de voltar
  document.getElementById('back-button')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('events');
  });

  // Botão de criar QR Code
  const createQRCodeBtn = document.getElementById('create-qrcode-btn');
  if (createQRCodeBtn) {
    createQRCodeBtn.addEventListener('click', () => {
      const modal = document.getElementById('qrcode-modal');
      if (modal) modal.classList.add('active');
    });
  }

  // Botão de visualizar QR Codes
  const viewQRCodesBtn = document.getElementById('view-qrcodes-btn');
  if (viewQRCodesBtn) {
    viewQRCodesBtn.addEventListener('click', () => {
      const modal = document.getElementById('view-qrcodes-modal');
      if (modal) modal.classList.add('active');
    });
  }

  // Botões para fechar modais
  document.getElementById('close-qrcode-modal')?.addEventListener('click', () => {
    document.getElementById('qrcode-modal').classList.remove('active');
  });

  document.getElementById('close-view-qrcodes-modal')?.addEventListener('click', () => {
    document.getElementById('view-qrcodes-modal').classList.remove('active');
  });

  // Configuração do modal de exclusão de QR Code
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

  // Clique fora do modal para fechar
  window.addEventListener('click', (event) => {
    const qrcodeModal = document.getElementById('qrcode-modal');
    if (event.target === qrcodeModal) {
      qrcodeModal.classList.remove('active');
    }

    const viewQrcodesModal = document.getElementById('view-qrcodes-modal');
    if (event.target === viewQrcodesModal) {
      viewQrcodesModal.classList.remove('active');
    }

    if (event.target === deleteModal) {
      deleteModal.classList.remove('active');
      qrCodeToDelete = null;
    }
  });

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

  async function refreshQRCodesList(eventId) {
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

  // Configurar botões de exclusão
  function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-qr-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Armazenar o ID do QR Code a ser excluído
        qrCodeToDelete = button.getAttribute('data-id');

        // Mostrar o modal de confirmação
        if (deleteModal) {
          deleteModal.classList.add('active');
        }
      });
    });
  }

  // Formulário de criação de QR Code
  const qrcodeForm = document.getElementById('qrcode-form');
  if (qrcodeForm) {
    qrcodeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = document.getElementById('qrcode-description').value;
      const benefitType = document.getElementById('qrcode-benefit-type').value;
      const benefitDescription = document.getElementById('qrcode-benefit-description').value;
      const validUntil = document.getElementById('qrcode-valid-until').value;

      let discountPercentage = null;
      if (benefitType === 'discount') {
        discountPercentage = document.getElementById('qrcode-discount').value;
      }

      try {
        const response = await fetch('/api/qrcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            eventId,
            description,
            benefitType,
            benefitDescription,
            discountPercentage,
            validUntil: validUntil || null
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao criar QR Code');
        }

        const result = await response.json();

        // Fechar modal
        document.getElementById('qrcode-modal').classList.remove('active');

        // Mostrar mensagem de sucesso
        showMessage('QR Code criado com sucesso!');

        // Atualizar a lista de QR Codes imediatamente
        await refreshQRCodesList(eventId);

        // Limpar o formulário para nova entrada
        qrcodeForm.reset();

      } catch (error) {
        console.error('Erro ao criar QR Code:', error);
        showMessage(error.message || 'Erro ao criar QR Code');
      }
    });
  }

  // Inicializar configuração de botões de exclusão
  setupDeleteButtons();
}

// Adiciona estilos específicos para QR Codes
function addQRCodeStyles() {
  // Verificar se já existe um estilo para QR Codes
  if (!document.getElementById('qrcode-styles')) {
    const styles = document.createElement('style');
    styles.id = 'qrcode-styles';
    styles.textContent = `
      .qr-codes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
      }
      
      .qr-code-card {
        background-color: #222;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #333;
        position: relative;
      }
      
      .qr-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #1a1a1a;
      }
      
      .qr-code-status {
        font-size: 12px;
        font-weight: bold;
        padding: 3px 8px;
        border-radius: 10px;
      }
      
      .status-active {
        background-color: rgba(0, 255, 0, 0.2);
        color: #4caf50;
      }
      
      .status-used {
        background-color: rgba(255, 255, 0, 0.2);
        color: #ffc107;
      }
      
      .status-expired {
        background-color: rgba(255, 0, 0, 0.2);
        color: #f44336;
      }
      
      .delete-qr-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #333;
        color: white;
        border: none;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .qr-code-img {
        padding: 10px;
        display: flex;
        justify-content: center;
        background-color: white;
      }
      
      .qr-code-img img {
        max-width: 100%;
        height: auto;
      }
      
      .qr-code-info {
        padding: 15px;
      }
      
      .qr-code-description {
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .qr-code-benefit {
        font-size: 14px;
        margin-bottom: 5px;
        color: #bbb;
      }
      
      .qr-code-expiry {
        font-size: 12px;
        color: #999;
      }
      
      /* Estilo para o formulário de QR Code */
      #qrcode-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      #qrcode-form .form-group {
        margin-bottom: 15px;
      }

      #qrcode-form label {
        display: block;
        margin-bottom: 8px;
        color: #8000FF;
        font-size: 14px;
        font-weight: 500;
      }

      #qrcode-form input[type="text"],
      #qrcode-form input[type="number"],
      #qrcode-form input[type="datetime-local"],
      #qrcode-form select,
      #qrcode-form textarea {
        width: 100%;
        padding: 12px 15px;
        background-color: #222;
        border: 1px solid #333;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      #qrcode-form input:focus,
      #qrcode-form select:focus,
      #qrcode-form textarea:focus {
        border-color: #8000FF;
        outline: none;
      }

      #qrcode-form select {
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238000FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 16px;
        padding-right: 36px;
      }

      #qrcode-form textarea {
        min-height: 80px;
        resize: vertical;
      }

      #qrcode-form input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
      }
    `;
    document.head.appendChild(styles);
  }
}

// Inicializar estilos
document.addEventListener('DOMContentLoaded', addQRCodeStyles);