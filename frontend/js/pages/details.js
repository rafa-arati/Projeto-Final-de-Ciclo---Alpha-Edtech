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

                <!-- Seção de Vídeos -->
                <div class="video-section">
                  <h2 class="section-title">Vídeos</h2>
                  <div id="video-container" class="video-grid"></div>
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

    // Preencher dados básicos
    document.getElementById('event-title').textContent = event.event_name;
    document.getElementById('event-description').textContent = event.description;
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-link').href = event.event_link;
    document.getElementById('event-link').textContent = event.event_link || 'N/A';
    document.getElementById('event-category').textContent = event.category;

    // Preencher data
    const eventDate = new Date(event.event_date);
    document.getElementById('event-date').textContent = eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' • ' + (event.event_time || '');

    // Preencher imagem
    const img = document.getElementById('event-image');
    img.src = event.photo_url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    img.alt = `Imagem do evento ${event.event_name}`;

    // Processar vídeos
    const videoContainer = document.getElementById('video-container');
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

  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    showMessage(error.message || 'Erro ao carregar detalhes do evento');
    navigateTo('events');
  }
}

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

function setupBackButton() {
  document.getElementById('back-button').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('events');
  });
}