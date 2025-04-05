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
        <header style="padding: 20px 0 0 20px;">
          <a href="#events" class="back-button" style="display: inline-flex; align-items: center; color: white; text-decoration: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span style="margin-left: 8px;">Agenda</span>
          </a>
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
          <div class="nav-item" id="nav-search">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>Procurar</span>
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
              <button id="add-to-gcal-btn" class="btn secondary">Adicionar ao Google Agenda</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Adicionar estilos específicos do calendário
    addCalendarStyles();

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

    // Renderizar cada evento
    eventsList.innerHTML = events.map(event => {
        const eventDate = new Date(event.event_date || event.start_date);
        const day = eventDate.getDate();
        const eventTime = event.event_time || event.start_time || '';

        return `
      <div class="event-item" data-id="${event.id}">
        <div class="event-date">
          <span class="event-day">${day}</span>
        </div>
        <div class="event-info">
          <h4 class="event-title">${event.event_name || event.title}</h4>
          <p class="event-location">${event.location || ''}</p>
          ${eventTime ? `<p class="event-time">${eventTime}</p>` : ''}
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
    const eventItems = document.querySelectorAll('.event-item');
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
                // Mostrar lista de eventos para o dia selecionado
                showMessage(`${dayEvents.length} eventos encontrados para o dia ${dayNumber}`);

                // Rolar para a lista de eventos
                const eventsList = document.getElementById('events-list');
                eventsList?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Configurar fechamento do modal
    document.getElementById('close-event-details')?.addEventListener('click', () => {
        document.getElementById('event-details-modal').classList.remove('active');
    });

    // Clicar fora do modal para fechar
    const modal = document.getElementById('event-details-modal');
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

// Mostrar detalhes do evento no modal
function showEventDetailsModal(event) {
    const modal = document.getElementById('event-details-modal');
    const title = document.getElementById('modal-event-title');
    const details = document.getElementById('modal-event-details');
    const viewButton = document.getElementById('view-event-btn');
    const gcalButton = document.getElementById('add-to-gcal-btn');

    if (!modal || !title || !details || !viewButton || !gcalButton) return;

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

    details.innerHTML = `
    <p><strong>Data:</strong> ${formattedDate}</p>
    ${eventTime ? `<p><strong>Horário:</strong> ${eventTime}</p>` : ''}
    ${location ? `<p><strong>Local:</strong> ${location}</p>` : ''}
    ${description ? `<p><strong>Descrição:</strong> ${description}</p>` : ''}
  `;

    // Configurar botão para ver detalhes completos
    viewButton.addEventListener('click', () => {
        navigateTo('details', { id: event.id });
    });

    // Configurar botão para adicionar ao Google Agenda
    gcalButton.addEventListener('click', () => {
        // Criar link para Google Agenda
        const gcalLink = createGoogleCalendarLink(event);

        // Abrir link em nova aba
        window.open(gcalLink, '_blank');
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

// Adicionar estilos específicos do calendário
function addCalendarStyles() {
    const styleId = 'calendar-styles';

    // Verificar se os estilos já existem
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      /* Estilos do Calendário */
      .month-selector {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #222;
        border-radius: 10px;
        margin: 20px 20px 30px 20px;
      }
      
      .month-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        transition: background-color 0.3s;
      }
      
      .month-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      #current-month-display {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
        color: white;
      }
      
      .calendar-container {
        padding: 0 20px;
        margin-bottom: 30px;
      }
      
      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: 10px;
      }
      
      .weekday {
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        padding: 10px 0;
        color: #888;
      }
      
      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
      }
      
      .day {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
        height: 40px;
        border-radius: 8px;
        font-size: 14px;
        position: relative;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .day:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .day.other-month {
        color: #666;
      }
      
      .day.today {
        background-color: rgba(128, 0, 255, 0.2);
        font-weight: bold;
      }
      
      .day.has-events {
        font-weight: bold;
        position: relative;
      }
      
      .event-dot {
        position: absolute;
        bottom: 4px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: linear-gradient(45deg, #439DFE, #8000FF);
      }
      
      .month-events {
        padding: 0 20px;
        margin-bottom: 70px;
      }
      
      .month-events h3 {
        font-size: 16px;
        margin-bottom: 15px;
        color: #ccc;
      }
      
      .events-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .event-item {
        display: flex;
        align-items: center;
        background-color: #222;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: transform 0.2s, background-color 0.3s;
      }
      
      .event-item:hover {
        background-color: #2a2a2a;
        transform: translateY(-2px);
      }
      
      .event-date {
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #439DFE, #8000FF);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        flex-shrink: 0;
      }
      
      .event-day {
        font-size: 18px;
        font-weight: bold;
        color: white;
      }
      
      .event-info {
        flex: 1;
      }
      
      .event-title {
        font-size: 16px;
        margin: 0 0 5px 0;
      }
      
      .event-location, .event-time {
        font-size: 12px;
        color: #aaa;
        margin: 0;
      }
      
      .no-events {
        color: #888;
        font-style: italic;
        text-align: center;
        padding: 20px 0;
      }
      
      /* Estilos do Modal */
      #event-details-modal .modal-content {
        max-width: 90%;
        width: 400px;
      }
      
      #modal-event-title {
        margin-top: 5px;
        margin-bottom: 15px;
      }
      
      #modal-event-details {
        margin-bottom: 20px;
      }
      
      #modal-event-details p {
        margin: 10px 0;
        color: #ccc;
      }
      
      .modal-buttons {
        display: flex;
        gap: 10px;
      }
      
      .modal-buttons .btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .modal-buttons .btn:first-child {
        background: linear-gradient(45deg, #439DFE, #8000FF);
        color: white;
      }
      
      .modal-buttons .btn.secondary {
        background-color: #444;
        color: white;
      }
    `;

        document.head.appendChild(style);
    }
}