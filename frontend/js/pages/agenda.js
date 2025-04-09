import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { fetchEvents } from '../modules/events-api.js';
import { getLoggedInUser } from '../modules/store.js';

export default async function renderAgenda(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Obter o mês e ano atual (ou da URL)
  const today = new Date();
  const currentMonth = queryParams.get('month') ? parseInt(queryParams.get('month')) : today.getMonth();
  const currentYear = queryParams.get('year') ? parseInt(queryParams.get('year')) : today.getFullYear();

  // Gerar o HTML da página
  appContainer.innerHTML = `
    <div class="app-wrapper">
      <div class="app-container">
        <!-- Cabeçalho com botão de voltar -->
       <header class="page-header">
        <a class="back-button" href="#events" title="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 id="agenda-title">Agenda</h1>
      </header>
        
        <!-- Seletor de Mês -->
        <div class="month-selector">
          <button id="prev-month" class="month-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2 id="current-month-display">${getMonthName(currentMonth)} ${currentYear}</h2>
          <button id="next-month" class="month-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        <!-- Calendário -->
        <div class="calendar-container">
          <div class="calendar-header">
            <div class="weekday">Dom</div>
            <div class="weekday">Seg</div>
            <div class="weekday">Ter</div>
            <div class="weekday">Qua</div>
            <div class="weekday">Qui</div>
            <div class="weekday">Sex</div>
            <div class="weekday">Sáb</div>
          </div>
          <div id="calendar-days" class="calendar-days">
            <!-- Dias serão adicionados dinamicamente -->
          </div>
        </div>

        <!-- Lista de Eventos do Mês -->
        <div class="month-events">
          <h3>Eventos em ${getMonthName(currentMonth)}</h3>
          <div id="events-list" class="events-list">
            <!-- Eventos serão adicionados dinamicamente -->
          </div>
        </div>

        <!-- Menu de navegação inferior -->
        <footer class="bottom-nav">
          <div class="nav-item" id="nav-home">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Home</span>
          </div>
          <div class="nav-item active" id="nav-agenda">
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
              <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
            </svg>
            <span>Agenda</span>
          </div>
          <div class="nav-item" id="nav-favorites">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Favoritos</span>
          </div>
          <div class="nav-item" id="nav-profile">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>Perfil</span>
          </div>
        </footer>

        <!-- Modal de detalhes do evento -->
        <div id="event-details-modal" class="modal">
          <div class="modal-content">
            <span class="close-modal" id="close-event-details">&times;</span>
            <h3 id="modal-event-title">Título do Evento</h3>
            <div id="modal-event-details">
              <!-- Detalhes do evento serão preenchidos dinamicamente -->
            </div>
            <div class="modal-buttons">
              <button id="view-event-btn" class="btn">Ver Detalhes</button>
              <button id="add-to-gcal-btn" class="btn secondary"><svg width="18" height="18" viewBox="0 0 24 24" focusable="false" class="gcal-icon" aria-hidden="true"> <path fill="#34A853" d="M12 24H5c-1.7 0-3-1.3-3-3V7h10v17z"></path> <path fill="#4285F4" d="M19 24h-7V7h10v14c0 1.7-1.3 3-3 3z"></path> <path fill="#EA4335" d="M19 2H5C3.3 2 2 3.3 2 5v2h20V5c0-1.7-1.3-3-3-3z"></path> <path fill="#FBBC05" d="M12 0H7v7h10V5c0-1.7-1.3-3-3-3H12z"></path><path fill="#FFF" d="M12.5 15.5h-1V12h1v3.5zm2-1.5h-5v-1h5v1z"></path> </svg>Adicionar ao Google Agenda</button>
            </div>
          </div>
        </div>
        
        <!-- Modal de múltiplos eventos -->
        <div id="multiple-events-modal" class="modal">
          <div class="modal-content">
            <span class="close-modal" id="close-multiple-events">&times;</span>
            <h3 id="multiple-events-title">Eventos no dia</h3>
            <div id="multiple-events-list" class="events-modal-list">
              <!-- Lista de eventos será preenchida dinamicamente -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Carregar eventos e preencher o calendário
  try {
    // Definir filtros para o mês atual
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    // Formatação das datas para a API
    const startDateFormatted = formatDateForAPI(startDate);
    const endDateFormatted = formatDateForAPI(endDate);

    // Buscar eventos
    const events = await fetchEvents({
      start_date: startDateFormatted,
      end_date: endDateFormatted
    });

    // Gerar calendário
    renderCalendar(currentMonth, currentYear, events);

    // Renderizar lista de eventos
    renderEventsList(events);

    // Configurar navegação
    setupNavigation(currentMonth, currentYear);

    // Configurar eventos da UI
    setupEventHandlers(events);
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    showMessage('Não foi possível carregar os eventos do mês');
  }
}

// Função auxiliar para obter o nome do mês
function getMonthName(month) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return monthNames[month];
}

// Função para formatar data para a API (YYYY-MM-DD)
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para renderizar o calendário
function renderCalendar(month, year, events) {
  const calendarDays = document.getElementById('calendar-days');
  if (!calendarDays) return;

  calendarDays.innerHTML = '';

  // Primeiro dia do mês atual
  const firstDay = new Date(year, month, 1);

  // Último dia do mês atual
  const lastDay = new Date(year, month + 1, 0);

  // Dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, etc.)
  const firstDayIndex = firstDay.getDay();

  // Total de dias no mês
  const daysInMonth = lastDay.getDate();

  // Dias do mês anterior para completar a primeira semana
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Criar um mapa de eventos por dia para consulta rápida
  const eventsByDay = {};
  events.forEach(event => {
    const eventDate = new Date(event.event_date || event.start_date);
    if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
      const day = eventDate.getDate();
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push(event);
    }
  });

  // Adicionar dias do mês anterior
  for (let i = firstDayIndex; i > 0; i--) {
    const day = prevMonthLastDay - i + 1;
    calendarDays.innerHTML += `
      <div class="day other-month">${day}</div>
    `;
  }

  // Adicionar dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    const today = new Date();
    const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasEvents = eventsByDay[i] && eventsByDay[i].length > 0;

    calendarDays.innerHTML += `
      <div class="day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" data-day="${i}">
        ${i}
        ${hasEvents ? `<span class="event-dot" title="${eventsByDay[i].length} eventos"></span>` : ''}
      </div>
    `;
  }

  // Adicionar dias do próximo mês para completar a grade
  const totalDays = calendarDays.children.length;
  const remainingCells = 42 - totalDays; // 6 linhas * 7 dias = 42 células

  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.innerHTML += `
      <div class="day other-month">${i}</div>
    `;
  }
}

// Função para renderizar lista de eventos
function renderEventsList(events) {
  const eventsList = document.getElementById('events-list');
  if (!eventsList) return;

  if (events.length === 0) {
    eventsList.innerHTML = '<p class="no-events">Nenhum evento encontrado neste mês</p>';
    return;
  }

  // Ordenar eventos por data
  events.sort((a, b) => {
    const dateA = new Date(a.event_date || a.start_date);
    const dateB = new Date(b.event_date || b.start_date);
    return dateA - dateB;
  });

  // Imagens base64 para placeholder (evita erro de rede)
  const defaultImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAxMDAgODAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIGZpbGw9IiMyMjIiLz48dGV4dCB4PSI1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+RXZlbnRvPC90ZXh0Pjwvc3ZnPg==';

  // Renderizar cada evento
  eventsList.innerHTML = events.map(event => {
    // Obtenha a data do evento
    const eventDate = new Date(event.event_date || event.start_date);
    const day = eventDate.getDate();
    const eventTime = event.event_time || event.start_time || '';

    // Obtenha dados da categoria
    const category = event.category_name || '';
    const subcategory = event.subcategory_name || '';

    // URL da imagem (use uma imagem base64 padrão se não tiver)
    const imageUrl = event.photo_url || defaultImageBase64;

    return `
      <div class="event-card-item" data-id="${event.id}">
        <div class="event-card-date">
          <span class="event-card-day">${day}</span>
          <span class="event-card-month">${getMonthName(eventDate.getMonth()).substring(0, 3)}</span>
        </div>
        <div class="event-card-image">
          <img src="${imageUrl}" alt="${event.event_name || event.title}">
        </div>
        <div class="event-card-info">
          <h4 class="event-card-title">${event.event_name || event.title}</h4>
          <p class="event-card-location">${event.location || ''}</p>
          <div class="event-card-details">
            ${eventTime ? `<span class="event-card-time"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${eventTime}</span>` : ''}
            ${category ? `<span class="event-card-category">${category}${subcategory ? ` / ${subcategory}` : ''}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Configurar navegação do calendário
function setupNavigation(currentMonth, currentYear) {
  // Botão para mês anterior
  document.getElementById('prev-month')?.addEventListener('click', () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    navigateTo('agenda', { month: newMonth, year: newYear });
  });

  // Botão para próximo mês
  document.getElementById('next-month')?.addEventListener('click', () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    navigateTo('agenda', { month: newMonth, year: newYear });
  });

  // Configurar navegação do menu inferior
  document.getElementById('nav-home')?.addEventListener('click', () => {
    navigateTo('events');
  });

  document.getElementById('nav-search')?.addEventListener('click', () => {
    showMessage('Funcionalidade em desenvolvimento');
  });

  document.getElementById('nav-favorites')?.addEventListener('click', () => {
    showMessage('Funcionalidade em desenvolvimento');
  });

  document.getElementById('nav-profile')?.addEventListener('click', () => {
    navigateTo('edit-profile');
  });
}

// Configurar handlers de eventos
function setupEventHandlers(events) {
  // Adicionar click nos itens da lista de eventos
  const eventItems = document.querySelectorAll('.event-card-item');
  eventItems.forEach(item => {
    item.addEventListener('click', () => {
      const eventId = item.getAttribute('data-id');
      const event = events.find(e => e.id.toString() === eventId);
      if (event) {
        showEventDetailsModal(event);
      }
    });
  });

  // Adicionar click nos dias com eventos
  const daysWithEvents = document.querySelectorAll('.day.has-events');
  daysWithEvents.forEach(day => {
    day.addEventListener('click', () => {
      const dayNumber = parseInt(day.getAttribute('data-day'));
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.event_date || event.start_date);
        return eventDate.getDate() === dayNumber;
      });

      if (dayEvents.length === 1) {
        showEventDetailsModal(dayEvents[0]);
      } else if (dayEvents.length > 1) {
        // Mostrar modal com todos os eventos do dia
        showMultipleEventsModal(dayEvents, dayNumber);
      }
    });
  });

  // Configurar fechamento dos modais
  document.getElementById('close-event-details')?.addEventListener('click', () => {
    document.getElementById('event-details-modal').classList.remove('active');
  });

  document.getElementById('close-multiple-events')?.addEventListener('click', () => {
    document.getElementById('multiple-events-modal').classList.remove('active');
  });

  // Clicar fora dos modais para fechar
  window.addEventListener('click', (event) => {
    const eventModal = document.getElementById('event-details-modal');
    const multipleEventsModal = document.getElementById('multiple-events-modal');

    if (event.target === eventModal) {
      eventModal.classList.remove('active');
    }

    if (event.target === multipleEventsModal) {
      multipleEventsModal.classList.remove('active');
    }
  });
}

// Mostrar detalhes do evento no modal
function showEventDetailsModal(event) {
  const modal = document.getElementById('event-details-modal');
  const title = document.getElementById('modal-event-title');
  const details = document.getElementById('modal-event-details');
  const viewButton = document.getElementById('view-event-btn');
  const gcalButton = document.getElementById('add-to-gcal-btn');

  if (!modal || !title || !details || !viewButton || !gcalButton) return;

  // Limpar handlers anteriores
  const newViewButton = viewButton.cloneNode(true);
  viewButton.parentNode.replaceChild(newViewButton, viewButton);

  const newGcalButton = gcalButton.cloneNode(true);
  gcalButton.parentNode.replaceChild(newGcalButton, gcalButton);

  // Preencher informações do evento
  title.textContent = event.event_name || event.title;

  const eventDate = new Date(event.event_date || event.start_date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const eventTime = event.event_time || event.start_time || '';
  const location = event.location || '';
  const description = event.description || '';
  const category = event.category_name || '';
  const subcategory = event.subcategory_name || '';

  details.innerHTML = `
    <p><strong>Data:</strong> ${formattedDate}</p>
    ${eventTime ? `<p><strong>Horário:</strong> ${eventTime}</p>` : ''}
    ${location ? `<p><strong>Local:</strong> ${location}</p>` : ''}
    ${category ? `<p><strong>Categoria:</strong> ${category}${subcategory ? ` / ${subcategory}` : ''}</p>` : ''}
    ${description ? `<p class="modal-event-description-scrollable"><strong>Descrição:</strong> ${description}</p>` : ''}
  `;

  // Configurar botão para ver detalhes completos
  newViewButton.addEventListener('click', () => {
    navigateTo('details', { id: event.id });
  });

  // Configurar botão para adicionar ao Google Agenda
  newGcalButton.addEventListener('click', () => {
    // Criar link para Google Agenda
    const gcalLink = createGoogleCalendarLink(event);

    // Abrir link em nova aba
    window.open(gcalLink, '_blank');
  });

  // Mostrar o modal
  modal.classList.add('active');
}

// Função para exibir o modal de múltiplos eventos
function showMultipleEventsModal(events, dayNumber) {
  const modal = document.getElementById('multiple-events-modal');
  const title = document.getElementById('multiple-events-title');
  const eventsList = document.getElementById('multiple-events-list');

  if (!modal || !title || !eventsList) return;

  // Formatar o título do modal
  const date = new Date();
  date.setDate(dayNumber);
  const formattedDay = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  title.textContent = `Eventos em ${formattedDay}`;

  // Limpar lista anterior
  eventsList.innerHTML = '';

  // Renderizar cada evento na lista
  events.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'multiple-event-item';

    // Formatar hora do evento
    const eventTime = event.event_time || event.start_time || '';
    const timeDisplay = eventTime ? eventTime : 'Horário não definido';

    // Criar categoria/subcategoria display
    const category = event.category_name || '';
    const subcategory = event.subcategory_name || '';
    const categoryDisplay = category ? `${category}${subcategory ? ` / ${subcategory}` : ''}` : '';

    // URL da imagem com placeholder melhorado
    const defaultImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIzMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2VlZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+RXZlbnRvPC90ZXh0Pjwvc3ZnPg==';
    const imageUrl = event.photo_url || defaultImageBase64;

    eventCard.innerHTML = `
        <div class="multiple-event-image">
            <img src="${imageUrl}" alt="${event.event_name || event.title}">
        </div>
        <div class="multiple-event-details">
            <h4>${event.event_name || event.title}</h4>
            <p>${event.location || ''}</p>
            <div class="multiple-event-meta">
                <span class="time">${timeDisplay}</span>
                ${categoryDisplay ? `<span class="category">${categoryDisplay}</span>` : ''}
            </div>
        </div>
        <div class="multiple-event-actions">
            <button class="btn-view" data-id="${event.id}">Ver</button>
            <button class="btn-gcal" data-id="${event.id}">+ Google</button>
        </div>
    `;

    eventsList.appendChild(eventCard);

    // Adicionar event listeners aos botões
    const viewBtn = eventCard.querySelector('.btn-view');
    viewBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      navigateTo('details', { id: event.id });
    });

    const gcalBtn = eventCard.querySelector('.btn-gcal');
    gcalBtn.addEventListener('click', () => {
      const gcalLink = createGoogleCalendarLink(event);
      window.open(gcalLink, '_blank');
    });
  });

  // Mostrar o modal
  modal.classList.add('active');
}

// Criar link para Google Agenda
function createGoogleCalendarLink(event) {
  // Título do evento
  const title = encodeURIComponent(event.event_name || event.title || 'Evento');

  // Datas de início e fim
  const startDate = new Date(event.event_date || event.start_date);
  let startTime = null;

  if (event.event_time || event.start_time) {
    const timeStr = event.event_time || event.start_time;
    const [hours, minutes] = timeStr.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    startTime = true;
  } else {
    // Se não tem horário, definir para início do dia
    startDate.setHours(0, 0, 0);
  }

  // Data de fim - se não tem data de fim, usar a mesma data, mas +1 hora ou +1 dia
  const endDate = new Date(startDate);
  if (startTime) {
    endDate.setHours(endDate.getHours() + 1); // Adiciona 1 hora se tiver horário
  } else {
    endDate.setDate(endDate.getDate() + 1); // Adiciona 1 dia se não tiver horário
  }

  // Formatar datas para o formato do Google Agenda
  const formatGCal = (date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const startDateStr = formatGCal(startDate);
  const endDateStr = formatGCal(endDate);

  // Local do evento
  const location = encodeURIComponent(event.location || '');

  // Descrição
  const description = encodeURIComponent(event.description || '');

  // Construir URL
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${description}&location=${location}&sf=true&output=xml`;
}