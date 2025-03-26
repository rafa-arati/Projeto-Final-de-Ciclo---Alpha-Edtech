import { getEventById } from '../modules/events-api.js';
import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';

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

function setupBackButton() {
  document.getElementById('back-button').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('events');
  });
}