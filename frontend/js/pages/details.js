import {
  getEventById,
  toggleLikeEvent,
  createPromotion,
  getEventPromotions,
  generateUserQRCode,
  getUserQRCodes,
  validateQRCode,
  useQRCode
} from '../modules/events-api.js';
import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';
import { getLoggedInUser, isAdmin } from '../modules/store.js';
import {
  renderQRCode,
  formatExpirationDate,
  isPromotionAvailable,
  getRemainingTime
} from '../modules/qrCodeHelpers.js';

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

    // Carregar promoções se usuário estiver logado
    let promotions = [];
    if (user) {
      try {
        promotions = await getEventPromotions(eventId);
      } catch (error) {
        console.error('Erro ao carregar promoções:', error);
      }
    }
    // Carregar QR Codes se o usuário tiver permissão
    let qrCodes = [];
    let userQRCodes = [];

    // Carregar QR Codes para admins/premium
    if (canManageQrCodes) {
      try {
        const qrUrl = `/api/qrcode/event/${eventId}`;
        console.log("Tentando carregar QR Codes de:", qrUrl);

        const qrResponse = await fetch(qrUrl, {
          credentials: 'include'
        });

        console.log("Status da resposta:", qrResponse.status);

        if (qrResponse.ok) {
          const contentType = qrResponse.headers.get("content-type");
          console.log("Tipo de conteúdo:", contentType);

          if (contentType && contentType.includes("application/json")) {
            qrCodes = await qrResponse.json();
            console.log("QR Codes carregados:", qrCodes.length);
          } else {
            console.error("Resposta não é JSON:", await qrResponse.text());
            qrCodes = [];
          }
        } else {
          console.error("Resposta não ok:", qrResponse.status, await qrResponse.text());
          qrCodes = [];
        }
      } catch (error) {
        console.error('Erro ao carregar QR Codes:', error);
        qrCodes = [];
      }
    }

    // Carregar QR Codes gerados pelo usuário
    if (user) {
      try {
        console.log("Tentando carregar QR Codes para o usuário:", user.id);

        const userQRResponse = await getUserQRCodes();
        console.log("Resposta bruta da API:", userQRResponse);

        if (userQRResponse && Array.isArray(userQRResponse)) {
          userQRCodes = userQRResponse;
          console.log("QR Codes do usuário antes da filtragem:", userQRCodes.length);

          // Debugar valores para comparação
          console.log("EventId:", eventId, typeof eventId);
          if (userQRCodes.length > 0) {
            console.log("Exemplo de QR Code event_id:", userQRCodes[0].event_id, typeof userQRCodes[0].event_id);
          }

          // Filtrar apenas os deste evento - com verificação extra
          const parsedEventId = parseInt(eventId);
          console.log("EventId parseado:", parsedEventId);

          userQRCodes = userQRCodes.filter(qr => {
            console.log(`Comparando: QR event_id=${qr.event_id} (${typeof qr.event_id}) com eventId=${parsedEventId} (${typeof parsedEventId})`);
            return qr.event_id === parsedEventId;
          });

          console.log("QR Codes do usuário após filtragem:", userQRCodes.length);
        } else {
          console.error("Resposta não é um array ou está vazia:", userQRResponse);
          userQRCodes = [];
        }
      } catch (error) {
        console.error('Erro ao carregar QR Codes do usuário:', error);
        userQRCodes = [];
      }
    }

    // Log detalhado do estado final
    console.log("Status dos QR Codes do usuário:");
    console.log("- usuário logado:", !!user);
    console.log("- quantidade de QR Codes:", userQRCodes.length);
    if (userQRCodes.length > 0) {
      console.log("- QR Codes encontrados:", userQRCodes);
      console.log("- Conteúdo HTML gerado:", renderUserQRCodes(userQRCodes));
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

    // Configurar o botão de curtir
    setupLikeButton(eventId, event);

    // Processar vídeos
    processVideos(event);

    if (user && !canManageQrCodes) {
      let promotionsHTML = '';

      if (promotions.length > 0) {
        promotionsHTML = `
          <section class="event-promotions">
            <h2 class="section-title">Promoções Disponíveis</h2>
            <div class="promotions-list">
              ${renderPromotionsList(promotions, userQRCodes)}
            </div>
          </section>
        `;
      }

      // Adicionar seção de QR Codes do usuário
      if (userQRCodes.length > 0) {
        promotionsHTML += `
          <section class="user-qrcodes">
            <h2 class="section-title">Seus QR Codes</h2>
            <div class="qr-codes-grid">
              ${renderUserQRCodes(userQRCodes)}
            </div>
          </section>
        `;
      }

      // Inserir no DOM após a descrição do evento
      const eventDescriptionSection = document.querySelector('.event-description');
      if (eventDescriptionSection) {
        const promotionsSection = document.createElement('div');
        promotionsSection.innerHTML = promotionsHTML;
        eventDescriptionSection.after(promotionsSection);
      }
    }

    // Renomear o botão "Criar QR Code" para "Criar Promoção" para admins/premium
    const createQRCodeBtn = document.getElementById('create-qrcode-btn');
    if (createQRCodeBtn) {
      createQRCodeBtn.title = "Criar Promoção";
    }

  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    showMessage(error.message || 'Erro ao carregar detalhes do evento');
    navigateTo('events');
  }
}

// Processar vídeos do evento
function processVideos(event) {
  const videoContainer = document.getElementById('video-container');
  if (!videoContainer) return;

  videoContainer.innerHTML = ''; // Limpar container

  let videoUrls = event.video_urls || [];

  // Converter string para array se necessário
  if (typeof videoUrls === 'string') {
    videoUrls = videoUrls.replace(/[{}"]/g, '').split(',').filter(url => url.trim() !== '');
  }

  if (videoUrls.length > 0) {
    videoUrls.forEach(url => {
      const videoWrapper = document.createElement('div');
      videoWrapper.className = 'video-wrapper';
      videoWrapper.innerHTML = createVideoEmbed(url);
      videoContainer.appendChild(videoWrapper);
    });

    // Carregar script do TikTok se necessário
    if (videoUrls.some(url => url.includes('tiktok')) && !window.tiktokScriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.onload = () => {
        window.tiktokScriptLoaded = true;
        console.log('TikTok script carregado');
      };
      document.body.appendChild(script);
    }
  } else {
    videoContainer.innerHTML = '<p class="no-videos">Nenhum vídeo disponível para este evento</p>';
  }
}

// Criar embed de vídeo
function createVideoEmbed(url) {
  try {
    const urlObj = new URL(url);
    const cleanedUrl = urlObj.href.replace(/\/$/, ''); // Remover barra final

    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = getYouTubeId(cleanedUrl);
      if (!videoId) return '<p>ID do vídeo do YouTube não encontrado</p>';

      return `
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      return `
        <blockquote class="tiktok-embed"
          cite="${url}"
          data-video-id="${getTikTokId(url)}"
          style="max-width: 605px;min-width: 325px;">
          <section>
            <a target="_blank" href="${url}">Link original do TikTok</a>
          </section>
        </blockquote>
      `;
    }
    return '<p>Plataforma de vídeo não suportada</p>';

  } catch (error) {
    console.error('Erro ao criar embed:', error);
    return `<p>Link inválido: ${url}</p>`;
  }
}

// Funções auxiliares para extrair IDs
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getTikTokId(url) {
  const regExp = /\/video\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
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

// Renderiza a lista de promoções para administradores
function renderPromotionsListAdmin(promotions, eventId) {
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

// Função para renderizar lista de promoções para usuários comuns
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

// Função para renderizar QR Codes do usuário
function renderUserQRCodes(userQRCodes) {
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

// Função auxiliar para obter descrição do benefício
function getBenefitDescription(promotion) {
  if (promotion.benefit_type === 'discount' && promotion.discount_percentage) {
    return `${promotion.discount_percentage}% de desconto`;
  }
  return promotion.benefit_description || 'Benefício especial';
}


// Configuração do botão de curtir
function setupLikeButton(eventId, event) {
  const likeButton = document.getElementById('like-button');
  const likeCountSpan = document.getElementById('like-count');
  const user = getLoggedInUser();

  if (!likeButton || !likeCountSpan) return;

  if (user) {
    // Configurar o estado inicial do botão de curtir
    if (event.userHasLiked === true) {
      likeButton.classList.add('active');
      likeButton.setAttribute('aria-pressed', 'true');
    } else {
      likeButton.classList.remove('active');
      likeButton.setAttribute('aria-pressed', 'false');
    }

    // Adicionar o evento de clique
    likeButton.addEventListener('click', () => handleLikeClick(eventId));
  } else {
    // Usuário não logado: desabilitar botão
    likeButton.disabled = true;
    likeButton.style.opacity = 0.5;
    likeButton.title = "Faça login para curtir";
  }
}

// Manipulador de clique no botão de curtir
async function handleLikeClick(eventId) {
  const likeButton = document.getElementById('like-button');
  const likeCountSpan = document.getElementById('like-count');

  if (!likeButton || !likeCountSpan) return;

  // Desabilitar botão durante a requisição
  likeButton.disabled = true;
  likeButton.style.opacity = 0.7;

  try {
    const result = await toggleLikeEvent(eventId);

    // Atualizar a UI com a resposta da API
    likeCountSpan.textContent = result.likeCount;
    if (result.userHasLiked) {
      likeButton.classList.add('active');
      likeButton.setAttribute('aria-pressed', 'true');
    } else {
      likeButton.classList.remove('active');
      likeButton.setAttribute('aria-pressed', 'false');
    }
  } catch (error) {
    console.error("Erro no handleLikeClick:", error);
    showMessage(error.message || 'Erro ao processar o like. Tente novamente.');
  } finally {
    // Reabilitar botão após a requisição
    if (getLoggedInUser()) {
      likeButton.disabled = false;
      likeButton.style.opacity = 1;
    }
  }
}

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
    viewQRCodesBtn.addEventListener('click', async () => {
      try {
        console.log("Tentando buscar promoções para evento:", eventId);

        // Buscar promoções do evento para o admin
        const promotions = await getEventPromotions(eventId);
        console.log("Promoções carregadas:", promotions);

        // Obter o nome do evento a partir da página
        const eventName = document.getElementById('event-title')?.textContent || 'Evento';
        console.log("Nome do evento:", eventName);

        // Atualizar o conteúdo do modal
        const modal = document.getElementById('view-qrcodes-modal');
        const modalTitle = modal.querySelector('h3');
        const qrCodesList = document.getElementById('qrcodes-list');

        modalTitle.textContent = `Promoções para ${eventName}`;

        if (promotions && promotions.length > 0) {
          console.log("Renderizando promoções:", promotions.length);
          qrCodesList.innerHTML = renderPromotionsListAdmin(promotions, eventId);
        } else {
          console.log("Nenhuma promoção encontrada");
          qrCodesList.innerHTML = '<p>Nenhuma promoção criada para este evento.</p>';
        }

        // Configurar botões de exclusão
        setupDeleteButtons();
        console.log("Botões de exclusão configurados");

        // Mostrar o modal
        if (modal) {
          modal.classList.add('active');
          console.log("Modal ativado");
        } else {
          console.error("Modal não encontrado");
        }
      } catch (error) {
        console.error('Erro ao carregar promoções:', error);
        console.error('Detalhes do erro:', error.stack);
        showMessage(`Erro ao carregar promoções: ${error.message}`);
      }
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

  // AQUI COMEÇA A SUBSTITUIÇÃO - Formulário de criação de promoção (antes era QR Code)
  const qrcodeForm = document.getElementById('qrcode-form');
  if (qrcodeForm) {
    // Adicionar campos para os novos parâmetros
    qrcodeForm.innerHTML = `
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
    `;

    // Atualizar evento de submit do formulário
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
        const response = await createPromotion({
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

  // Adicionar evento para botões de geração de QR Code para usuários
  document.addEventListener('click', async function (e) {
    if (e.target.matches('.generate-qrcode-btn')) {
      const promotionId = e.target.getAttribute('data-promotion-id');

      try {
        await generateUserQRCode(promotionId);

        // Recarregar a página para mostrar o novo QR Code
        showMessage('QR Code gerado com sucesso!');
        setTimeout(() => window.location.reload(), 1500);

      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        showMessage(error.message || 'Erro ao gerar QR Code');
      }
    }
  });

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


function addPromotionStyles() {
  // Verificar se já existe um estilo para Promoções
  if (!document.getElementById('promotion-styles')) {
    const styles = document.createElement('style');
    styles.id = 'promotion-styles';
    styles.textContent = `
      .promotions-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      
      .promotion-card {
        background-color: #222;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #333;
        display: flex;
        flex-direction: column;
      }
      
      .promotion-header {
        padding: 15px;
        background: linear-gradient(45deg, #3a3a3a, #2a2a2a);
        border-bottom: 1px solid #333;
      }
      
      .promotion-header h3 {
        margin: 0;
        font-size: 18px;
        color: #fff;
      }
      
      .promotion-time {
        display: block;
        font-size: 12px;
        color: #aaa;
        margin-top: 5px;
      }
      
      .promotion-details {
        padding: 15px;
        flex-grow: 1;
      }
      
      .promotion-limit {
        display: inline-block;
        background-color: rgba(0, 255, 0, 0.1);
        color: #4caf50;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin: 8px 0;
      }
      
      .promotion-expiry {
        font-size: 12px;
        color: #999;
        margin-top: 10px;
      }
      
      .promotion-action {
        padding: 15px;
        border-top: 1px solid #333;
        text-align: center;
      }
      
      .btn.disabled {
        background-color: #444 !important;
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .generate-qrcode-btn {
        background: linear-gradient(45deg, #439DFE, #8000FF);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .generate-qrcode-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      
      .user-qrcodes {
        margin-top: 30px;
      }
    `;
    document.head.appendChild(styles);
  }
}


// Inicializar estilos
document.addEventListener('DOMContentLoaded', () => {
  addQRCodeStyles();
  addPromotionStyles();
});