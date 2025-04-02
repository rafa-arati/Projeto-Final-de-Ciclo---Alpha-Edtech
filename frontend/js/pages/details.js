import { getEventById, toggleLikeEvent } from '../modules/events-api.js';
import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';
import { getLoggedInUser } from '../modules/store.js';

export default function renderEventDetails(queryParams) {
  const appContainer = document.getElementById('app');
  const eventId = queryParams.get('id');

  if (!eventId) {
    showMessage('Evento não encontrado');
    navigateTo('events');
    return;
  }

  appContainer.innerHTML = `
    <div class="page-container">
      <header class="header">
        <a href="#" class="back-button" id="back-button">
          <svg class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </a>
      </header>

      <main class="content-container">
        <article class="event-detail">
          <section class="event-image-container" id="event-image-container">
            <img id="event-image" class="event-image">
            <div class="event-overlay">
              <h1 id="event-title" class="event-title"></h1>
              <time id="event-date" class="event-time"></time>
            </div>
          </section>

          <section class="event-info">
            <div class="tab-content">
              <section class="event-description">
                <h2 class="section-title">Descrição</h2>
                <p id="event-description"></p>
              </section>

              <section class="event-interaction">
                <div class="detail-item like-section">
                  <button id="like-button" class="icon-button like-button" aria-label="Curtir evento">
                      <svg class="icon heart-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                  </button>
                  <span id="like-count" class="like-count">0</span>
                  </div>
                  <h3 class="section-title">Curtidas</h3> 
                </div>
              </section>

              <div class="event-details">
                <div class="detail-item">
                  <h3 class="section-title">Localização</h3>
                  <address id="event-location"></address>
                </div>

                <div class="detail-item">
                  <h3 class="section-title">Link do Evento</h3>
                  <a id="event-link" class="event-link" target="_blank"></a>
                </div>

                <div class="detail-item">
                  <h3 class="section-title">Categoria</h3>
                  <p id="event-category"></p>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  `;

  loadEventDetails(eventId);
  setupBackButton();
}

async function loadEventDetails(eventId) {
  try {
    const event = await getEventById(eventId);
    console.log("Dados do evento recebidos em loadEventDetails:", JSON.stringify(event, null, 2));
    
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    // Preencher dados
    document.getElementById('event-title').textContent = event.event_name;
    document.getElementById('event-description').textContent = event.description;
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-link').href = event.event_link;
    document.getElementById('event-link').textContent = event.event_link || 'N/A';
    document.getElementById('event-category').textContent = event.category;
    
    // Formatar data
    const eventDate = new Date(event.event_date);
    document.getElementById('event-date').textContent = eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' • ' + (event.event_time || '');

    const likeCountSpan = document.getElementById('like-count');
        const likeButton = document.getElementById('like-button');

        if (likeCountSpan) {
            likeCountSpan.textContent = event.likeCount !== undefined ? event.likeCount : 0;
        }

        if (likeButton) {
            const user = getLoggedInUser(); 
            if (user) {
                // ----> ESTA PARTE É RESPONSÁVEL PELO ESTADO INICIAL <----
                if (event.userHasLiked === true) { // Verifica o status vindo da API
                    likeButton.classList.add('active'); // Adiciona a classe se já curtiu
                    likeButton.setAttribute('aria-pressed', 'true');
                } else {
                    likeButton.classList.remove('active'); // Remove a classe se não curtiu
                    likeButton.setAttribute('aria-pressed', 'false');
                }

                // Remove listener antigo antes de adicionar um novo (previne múltiplos listeners)
                likeButton.replaceWith(likeButton.cloneNode(true));
                document.getElementById('like-button').addEventListener('click', () => handleLikeClick(eventId));


            } else {
                // Usuário não logado: desabilita ou muda comportamento
                likeButton.disabled = true; 
                likeButton.style.opacity = 0.5; // Indica visualmente que está desabilitado
                likeButton.title = "Faça login para curtir"; 
                // Ou: likeButton.addEventListener('click', () => navigateTo('login'));
            }
        }

    // Carregar imagem
    const img = document.getElementById('event-image');
    if (event.photo_url) {
      img.src = event.photo_url;
      img.alt = `Imagem do evento ${event.event_name}`;
    } else {
      img.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    }
    
  } catch (error) {
    console.error('Erro:', error);
    showMessage(error.message || 'Erro ao carregar detalhes do evento');
    navigateTo('events');
  }
}

async function handleLikeClick(eventId) {
  const likeButton = document.getElementById('like-button');
  const likeCountSpan = document.getElementById('like-count');

  if (!likeButton || !likeCountSpan) return;

  // Opcional: Desabilitar botão durante a requisição
  likeButton.disabled = true; 
  likeButton.style.opacity = 0.7;

  try {
      const result = await toggleLikeEvent(eventId); // Chama a API

      // Atualiza a UI com a resposta da API
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
      // Opcional: reverter a aparência do botão se a API falhar
  } finally {
      // Reabilitar botão após a requisição (mesmo se falhar)
       if (getLoggedInUser()) { // Só reabilita se ainda estiver logado
           likeButton.disabled = false;
           likeButton.style.opacity = 1;
       }
  }
}

function setupBackButton() {
  document.getElementById('back-button').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('events');
  });
}