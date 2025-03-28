import { navigateTo } from "../modules/router.js";
import { showMessage } from "../modules/utils.js";
import { logoutUser } from "../modules/auth.js";
import { getLoggedInUser, isAdmin } from "../modules/store.js";
import {
  fetchEvents,
  deleteEvent,
  fetchCategoriesWithSubcategories
} from "../modules/events-api.js";

// Variáveis globais
let eventos = [];
let categorias = [];
let currentEventId = null;
let activeFilters = {};

export default function renderEvents(queryParams) {
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  // Obter dados do usuário logado
  const user = getLoggedInUser();
  const isAdminUser = isAdmin();

  appContainer.innerHTML = `
    <div class="app-wrapper">
      <div class="app-container">
        <header class="app-header">
          <div class="header-top">
            <div class="header-date">${new Date().toLocaleDateString(
    "pt-BR",
    { day: "numeric", month: "long" }
  )}, ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}</div>
            <div class="header-profile" id="profile-btn">
              ${user?.photo_url ? `<img src="${user.photo_url}" alt="Perfil" style="width: 32px; height: 32px; border-radius: 50%;">` : ''}
            </div>
          </div>
          <h1 class="header-title">Explore eventos</h1>
        </header>

        <section class="search-bar">
          <span class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </span>
          <input type="text" class="search-input" placeholder="Buscar eventos" id="search-input">
          <span class="filter-icon" id="filter-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
            </svg>
          </span>
        </section>

        <!-- Filtros ativos (ocultos inicialmente) -->
        <section id="active-filters" class="active-filters" style="padding: 0 20px; margin-bottom: 15px; display: none;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <!-- Os filtros ativos serão adicionados aqui dinamicamente -->
          </div>
        </section>

        <!-- Seção de eventos em destaque -->
        <section class="carousel-section">
          <h2 class="section-title">TODOS OS EVENTOS</h2>
          <div class="carousel-container">
            <button class="carousel-arrow left" id="todos-left">&#10094;</button>
            <div class="carousel" id="todos-eventos"></div>
            <button class="carousel-arrow right" id="todos-right">&#10095;</button>
          </div>
        </section>

        <!-- Espaço para mais carrosséis de eventos por categoria -->
        <div id="categorias-container"></div>

        <div class="carousel-div"></div>

        <!-- Menu de navegação inferior -->
        <footer class="bottom-nav">
          <div class="nav-item active">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Home</span>
          </div>
          <div class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>Procurar</span>
          </div>

          <div class="nav-item">
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
              <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
            </svg>
            <span>Agenda</span>
          </div>
             
          <div class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Favoritos</span>
          </div>
          
          <div class="nav-item" id="nav-perfil">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>Perfil</span>
          </div>
        </footer>
      </div>
    </div>

    <!-- Modal para filtros -->
    <div class="modal" id="filter-modal">
      <div class="modal-content" style="max-width: 500px;">
        <span class="close-modal" id="close-filter-modal">&times;</span>
        <h3>Filtrar Eventos</h3>
        
        <div class="filter-section">
          <h4>Categorias</h4>
          <div class="select-wrapper" style="margin-bottom: 15px;">
            <select id="filter-category" class="filter-select">
              <option value="">Todas as categorias</option>
              <!-- As categorias serão adicionadas dinamicamente -->
            </select>
          </div>
          
          <div id="subcategory-wrapper" style="margin-bottom: 15px; display: none;">
            <h4>Subcategorias</h4>
            <div class="select-wrapper">
              <select id="filter-subcategory" class="filter-select">
                <option value="">Todas as subcategorias</option>
                <!-- As subcategorias serão adicionadas dinamicamente -->
              </select>
            </div>
          </div>
        </div>
        
        <div class="filter-section">
          <h4>Período</h4>
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1;">
              <label for="filter-start-date">De</label>
              <input type="date" id="filter-start-date" class="filter-date">
            </div>
            <div style="flex: 1;">
              <label for="filter-end-date">Até</label>
              <input type="date" id="filter-end-date" class="filter-date">
            </div>
          </div>
        </div>
        
        <div class="modal-buttons">
          <button id="apply-filters" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF);">Aplicar Filtros</button>
          <button id="reset-filters" class="btn secondary">Limpar Filtros</button>
        </div>
      </div>
    </div>

    <!-- Modal para confirmação de exclusão -->
    <div class="modal" id="delete-modal">
      <div class="modal-content">
        <span class="close-modal" id="close-delete-modal">&times;</span>
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.</p>
        <div class="modal-buttons">
          <button id="confirm-delete" class="btn" style="background-color: #B33A3A;">Sim, excluir</button>
          <button id="cancel-delete" class="btn secondary">Cancelar</button>
        </div>
      </div>
    </div>
    
    <!-- Modal para recursos em desenvolvimento -->
    <div class="modal" id="development-modal">
      <div class="modal-content">
        <span class="close-modal" id="close-development-modal">&times;</span>
        <h3>Funcionalidade em Desenvolvimento</h3>
        <p>Esta funcionalidade está sendo implementada e estará disponível em breve!</p>
        <div class="modal-buttons">
          <button id="ok-development" class="btn">Entendi</button>
        </div>
      </div>
    </div>
  `;

  // Inicializar as funcionalidades da página
  initializeEvents();
}

// Função para inicializar eventos e carregamentos
async function initializeEvents() {
  try {
    // Carregar categorias antes dos eventos para poder exibir nomes corretos
    await loadCategoriesAndSubcategories();

    // Carregar eventos com os filtros atuais
    await loadEvents(activeFilters);

    // Configurar eventos de UI
    setupUIEvents();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showMessage("Não foi possível carregar os dados. Tente novamente mais tarde.");
  }
}

// Função para carregar categorias e subcategorias
async function loadCategoriesAndSubcategories() {
  try {
    categorias = await fetchCategoriesWithSubcategories();
    console.log("Categorias carregadas:", categorias);

    // Preencher o select de categorias no modal de filtros
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Todas as categorias</option>';

      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.name;
        categorySelect.appendChild(option);
      });

      // Adicionar evento de change para atualizar subcategorias
      categorySelect.addEventListener('change', updateSubcategories);
    }
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
    throw error;
  }
}

// Atualiza as subcategorias quando uma categoria é selecionada
function updateSubcategories() {
  const categoryId = document.getElementById('filter-category').value;
  const subcategoryWrapper = document.getElementById('subcategory-wrapper');
  const subcategorySelect = document.getElementById('filter-subcategory');

  if (!categoryId) {
    subcategoryWrapper.style.display = 'none';
    return;
  }

  // Limpar select de subcategorias
  subcategorySelect.innerHTML = '<option value="">Todas as subcategorias</option>';

  // Encontrar categoria selecionada
  const selectedCategory = categorias.find(c => c.id.toString() === categoryId);

  if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
    // Popular select com as subcategorias da categoria selecionada
    selectedCategory.subcategories.forEach(subcategoria => {
      if (subcategoria.id) { // Verifica se a subcategoria é válida
        const option = document.createElement('option');
        option.value = subcategoria.id;
        option.textContent = subcategoria.name;
        subcategorySelect.appendChild(option);
      }
    });

    // Mostrar select de subcategorias
    subcategoryWrapper.style.display = 'block';
  } else if (selectedCategory && selectedCategory.name === 'DIVERSOS') {
    // Categoria "DIVERSOS" não tem subcategorias
    subcategoryWrapper.style.display = 'none';
  } else {
    subcategoryWrapper.style.display = 'none';
  }
}

// Função para carregar eventos
async function loadEvents(filters = {}) {
  try {
    eventos = await fetchEvents(filters);
    console.log("Eventos carregados:", eventos);
    renderEventosCarrossel();
    updateActiveFiltersDisplay();
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    throw error;
  }
}

// Atualiza a exibição dos filtros ativos
function updateActiveFiltersDisplay() {
  const activeFiltersContainer = document.getElementById('active-filters');
  const filtersDiv = activeFiltersContainer.querySelector('div');

  // Limpar filtros atuais
  filtersDiv.innerHTML = '';

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  if (!hasActiveFilters) {
    activeFiltersContainer.style.display = 'none';
    return;
  }

  // Mostrar container de filtros
  activeFiltersContainer.style.display = 'block';

  // Adicionar filtro de categoria
  if (activeFilters.category_id) {
    const categoria = categorias.find(c => c.id.toString() === activeFilters.category_id.toString());
    if (categoria) {
      const filterBadge = createFilterBadge(`Categoria: ${categoria.name}`, () => {
        delete activeFilters.category_id;
        delete activeFilters.subcategory_id; // Remove também subcategoria
        loadEvents(activeFilters);
      });
      filtersDiv.appendChild(filterBadge);
    }
  }

  // Adicionar filtro de subcategoria
  if (activeFilters.subcategory_id) {
    const categoria = categorias.find(c => c.id.toString() === activeFilters.category_id.toString());
    if (categoria) {
      const subcategoria = categoria.subcategories.find(s => s.id.toString() === activeFilters.subcategory_id.toString());
      if (subcategoria) {
        const filterBadge = createFilterBadge(`Subcategoria: ${subcategoria.name}`, () => {
          delete activeFilters.subcategory_id;
          loadEvents(activeFilters);
        });
        filtersDiv.appendChild(filterBadge);
      }
    }
  }

  // Adicionar filtro de data inicial
  if (activeFilters.start_date) {
    const dateObj = new Date(activeFilters.start_date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    const filterBadge = createFilterBadge(`A partir de: ${formattedDate}`, () => {
      delete activeFilters.start_date;
      loadEvents(activeFilters);
    });
    filtersDiv.appendChild(filterBadge);
  }

  // Adicionar filtro de data final
  if (activeFilters.end_date) {
    const dateObj = new Date(activeFilters.end_date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    const filterBadge = createFilterBadge(`Até: ${formattedDate}`, () => {
      delete activeFilters.end_date;
      loadEvents(activeFilters);
    });
    filtersDiv.appendChild(filterBadge);
  }

  // Adicionar filtro de busca
  if (activeFilters.search) {
    const filterBadge = createFilterBadge(`Busca: ${activeFilters.search}`, () => {
      delete activeFilters.search;
      document.getElementById('search-input').value = '';
      loadEvents(activeFilters);
    });
    filtersDiv.appendChild(filterBadge);
  }

  // Adicionar botão para limpar todos os filtros
  if (hasActiveFilters) {
    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = 'Limpar todos';
    clearAllBtn.classList.add('filter-clear-all');
    clearAllBtn.style.cssText = `
      background-color: #333;
      color: white;
      border: none;
      border-radius: 15px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      margin-left: 10px;
    `;

    clearAllBtn.addEventListener('click', () => {
      activeFilters = {};
      document.getElementById('search-input').value = '';
      loadEvents(activeFilters);
    });

    filtersDiv.appendChild(clearAllBtn);
  }
}

// Cria um badge de filtro com botão para remover
function createFilterBadge(text, onRemove) {
  const badge = document.createElement('div');
  badge.classList.add('filter-badge');
  badge.style.cssText = `
    background-color: #333;
    color: white;
    border-radius: 15px;
    padding: 5px 15px 5px 10px;
    font-size: 12px;
    display: flex;
    align-items: center;
  `;

  // Texto do filtro
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  badge.appendChild(textSpan);

  // Botão para remover
  const removeBtn = document.createElement('span');
  removeBtn.innerHTML = '&times;';
  removeBtn.style.cssText = `
    margin-left: 8px;
    font-size: 16px;
    cursor: pointer;
  `;
  removeBtn.addEventListener('click', onRemove);
  badge.appendChild(removeBtn);

  return badge;
}

// Renderiza os eventos nos carrosséis
function renderEventosCarrossel() {
  const todosEventosContainer = document.getElementById("todos-eventos");
  const categoriasContainer = document.getElementById("categorias-container");

  if (!todosEventosContainer || !categoriasContainer) return;

  // Limpar os containers
  todosEventosContainer.innerHTML = "";
  categoriasContainer.innerHTML = "";

  // Verificar se há eventos
  if (eventos.length === 0) {
    todosEventosContainer.innerHTML =
      '<p style="color: white; padding: 20px;">Nenhum evento encontrado.</p>';
    return;
  }

  // Renderizar os eventos no carrossel "Todos os Eventos"
  eventos.forEach((evento) => {
    const eventCard = createEventCard(evento);
    todosEventosContainer.appendChild(eventCard);
  });

  // Agrupar eventos por categoria para criar carrosséis por categoria
  const eventosPorCategoria = {};
  eventos.forEach((evento) => {
    const categoriaId = evento.category_id || 'sem-categoria';
    const categoriaNome = evento.category_name || 'Sem categoria';

    if (!eventosPorCategoria[categoriaId]) {
      eventosPorCategoria[categoriaId] = {
        nome: categoriaNome,
        eventos: []
      };
    }

    eventosPorCategoria[categoriaId].eventos.push(evento);
  });

  // Criar carrosséis por categoria
  Object.keys(eventosPorCategoria).forEach((categoriaId) => {
    const categoria = eventosPorCategoria[categoriaId];

    // Pular se tiver poucos eventos ou for "sem categoria"
    if (categoria.eventos.length < 3 || categoriaId === 'sem-categoria') return;

    const categoriaSection = document.createElement("section");
    categoriaSection.className = "carousel-section";
    categoriaSection.innerHTML = `
      <h2 class="section-title">${categoria.nome.toUpperCase()}</h2>
      <div class="carousel-container">
        <button class="carousel-arrow left" id="${categoriaId}-left">&#10094;</button>
        <div class="carousel" id="${categoriaId}-eventos"></div>
        <button class="carousel-arrow right" id="${categoriaId}-right">&#10095;</button>
      </div>
    `;

    categoriasContainer.appendChild(categoriaSection);

    const categoriaCarrossel = document.getElementById(`${categoriaId}-eventos`);
    if (categoriaCarrossel) {
      // Adicionar eventos da categoria ao carrossel
      categoria.eventos.forEach((evento) => {
        const eventCard = createEventCard(evento);
        categoriaCarrossel.appendChild(eventCard);
      });
    }
  });
}

// Cria um card de evento
function createEventCard(evento) {
  // Converter data para objeto Date
  const eventDate = evento.start_date ? new Date(evento.start_date) : new Date();

  // Formatação de mês e dia
  const month = eventDate
    .toLocaleString("pt-BR", { month: "short" })
    .toUpperCase();
  const day = eventDate.getDate();

  const eventCard = document.createElement("article");
  eventCard.className = "event-card";
  eventCard.dataset.id = evento.id;

  // Determinar a imagem (usar uma imagem padrão se não houver)
  const imageUrl =
    evento.photo_url ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  // Título do evento
  const eventTitle = evento.title || evento.event_name || "Evento sem título";

  // Categoria do evento
  const eventCategory = evento.category_name || evento.subcategory_name || "Evento";

  eventCard.innerHTML = `
    <img src="${imageUrl}" alt="${eventTitle}" class="event-image">
    <div class="event-info">
      <h3 class="event-title">${eventTitle}</h3>
      <p class="event-subtitle">${eventCategory}</p>
    </div>
    <div class="event-date">
      <span class="event-month">${month}</span>
      <span class="event-day">${day}</span>
    </div>
    ${isAdmin()
      ? `
      <div style="position: absolute; top: 10px; left: 10px; display: flex; gap: 5px;">
        <button class="icon-button edit-event" data-id="${evento.id}" style="background: rgba(0,0,0,0.5);">
          <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
        </button>
        <button class="icon-button delete-event" data-id="${evento.id}" style="background: rgba(0,0,0,0.5);">
          <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
      `
      : ""
    }
  `;

  // Adicionar evento de clique no card para ver detalhes
  eventCard.addEventListener("click", (e) => {
    // Impedir a propagação do evento quando clicar nos botões de editar/excluir
    if (e.target.closest(".edit-event") || e.target.closest(".delete-event")) {
      return;
    }
    viewEventDetails(evento.id);
  });

  // Adicionar eventos específicos para os botões de editar e excluir
  const editButton = eventCard.querySelector(".edit-event");
  if (editButton) {
    editButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Impedir propagação do evento
      editEvent(evento.id);
    });
  }

  const deleteButton = eventCard.querySelector(".delete-event");
  if (deleteButton) {
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Impedir propagação do evento
      showDeleteConfirmation(evento.id);
    });
  }

  return eventCard;
}

// Configuração de todos os eventos de UI
function setupUIEvents() {
  // Configurar botão de perfil no topo
  const profileBtn = document.getElementById("profile-btn");
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      navigateTo("edit-profile");
    });
  }

  // Configurar item de perfil na navegação inferior
  const navPerfil = document.getElementById("nav-perfil");
  if (navPerfil) {
    navPerfil.addEventListener("click", () => {
      navigateTo("edit-profile");
    });
  }

  // Configurar setas dos carrosséis
  setupCarouselArrows();

  // Configurar campo de busca
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => {
      const searchTerm = searchInput.value.trim();

      if (searchTerm) {
        activeFilters.search = searchTerm;
      } else {
        delete activeFilters.search;
      }

      loadEvents(activeFilters);
    }, 500)); // Debounce de 500ms para não fazer muitas requisições
  }

  // Configurar botão de filtro
  const filterBtn = document.getElementById("filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", showFilterModal);
  }

  // Configurar modal de filtros
  setupFilterModal();

  // Configurar modal de exclusão
  setupDeleteModal();

  // Configurar modal de desenvolvimento
  setupDevelopmentModal();
}

// Configuração das setas dos carrosséis
function setupCarouselArrows() {
  // Configurar setas para o carrossel "Todos os Eventos"
  const todosLeftArrow = document.getElementById("todos-left");
  const todosRightArrow = document.getElementById("todos-right");
  const todosEventos = document.getElementById("todos-eventos");

  if (todosLeftArrow && todosEventos) {
    todosLeftArrow.addEventListener("click", () => {
      todosEventos.scrollBy({ left: -300, behavior: "smooth" });
    });
  }

  if (todosRightArrow && todosEventos) {
    todosRightArrow.addEventListener("click", () => {
      todosEventos.scrollBy({ left: 300, behavior: "smooth" });
    });
  }

  // Configurar setas para carrosséis de categoria
  // Usar MutationObserver para detectar quando novos carrosséis são adicionados
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        setupCategoryCarousels();
      }
    });
  });

  observer.observe(document.getElementById("categorias-container"), {
    childList: true,
    subtree: true,
  });

  // Configurar carrosséis iniciais
  setupCategoryCarousels();
}

// Configuração dos carrosséis de categoria
function setupCategoryCarousels() {
  const categories = eventos
    .map((e) => e.category_id)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  categories.forEach((categoryId) => {
    const leftArrow = document.getElementById(`${categoryId}-left`);
    const rightArrow = document.getElementById(`${categoryId}-right`);
    const categoryEvents = document.getElementById(`${categoryId}-eventos`);

    if (leftArrow && categoryEvents) {
      leftArrow.addEventListener("click", () => {
        categoryEvents.scrollBy({ left: -300, behavior: "smooth" });
      });
    }

    if (rightArrow && categoryEvents) {
      rightArrow.addEventListener("click", () => {
        categoryEvents.scrollBy({ left: 300, behavior: "smooth" });
      });
    }
  });
}

// Configura o modal de filtros
function setupFilterModal() {
  const filterModal = document.getElementById("filter-modal");
  const closeFilterModal = document.getElementById("close-filter-modal");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const resetFiltersBtn = document.getElementById("reset-filters");

  // Fechar modal
  if (closeFilterModal && filterModal) {
    closeFilterModal.addEventListener("click", () => {
      filterModal.classList.remove("active");
    });
  }

  // Aplicar filtros
  if (applyFiltersBtn && filterModal) {
    applyFiltersBtn.addEventListener("click", () => {
      // Obter valores dos filtros
      const categoryId = document.getElementById("filter-category").value;
      const subcategoryId = document.getElementById("filter-subcategory").value;
      const startDate = document.getElementById("filter-start-date").value;
      const endDate = document.getElementById("filter-end-date").value;

      // Atualizar filtros ativos
      if (categoryId) {
        activeFilters.category_id = categoryId;
      } else {
        delete activeFilters.category_id;
      }

      if (subcategoryId) {
        activeFilters.subcategory_id = subcategoryId;
      } else {
        delete activeFilters.subcategory_id;
      }

      if (startDate) {
        activeFilters.start_date = startDate;
      } else {
        delete activeFilters.start_date;
      }

      if (endDate) {
        activeFilters.end_date = endDate;
      } else {
        delete activeFilters.end_date;
      }

      // Carregar eventos com os novos filtros
      loadEvents(activeFilters);

      // Fechar modal
      filterModal.classList.remove("active");
    });
  }

  // Resetar filtros
  if (resetFiltersBtn && filterModal) {
    resetFiltersBtn.addEventListener("click", () => {
      // Limpar campos do formulário
      document.getElementById("filter-category").value = "";
      document.getElementById("filter-subcategory").value = "";
      document.getElementById("filter-start-date").value = "";
      document.getElementById("filter-end-date").value = "";

      // Esconder subcategorias
      document.getElementById("subcategory-wrapper").style.display = "none";

      // Limpar todos os filtros, exceto de busca
      const searchFilter = activeFilters.search;
      activeFilters = {};
      if (searchFilter) {
        activeFilters.search = searchFilter;
      }

      // Carregar eventos sem filtros
      loadEvents(activeFilters);

      // Fechar modal
      filterModal.classList.remove("active");
    });
  }

  // Fechar ao clicar fora do modal
  window.addEventListener("click", (event) => {
    if (event.target === filterModal) {
      filterModal.classList.remove("active");
    }
  });
}

// Mostra o modal de filtros
function showFilterModal() {
  const filterModal = document.getElementById("filter-modal");

  // Preencher valores dos filtros existentes
  if (activeFilters.category_id) {
    document.getElementById("filter-category").value = activeFilters.category_id;
    updateSubcategories(); // Atualizar subcategorias

    if (activeFilters.subcategory_id) {
      document.getElementById("filter-subcategory").value = activeFilters.subcategory_id;
    }
  }

  if (activeFilters.start_date) {
    document.getElementById("filter-start-date").value = activeFilters.start_date;
  }

  if (activeFilters.end_date) {
    document.getElementById("filter-end-date").value = activeFilters.end_date;
  }

  // Mostrar modal
  filterModal.classList.add("active");
}

// Configura o modal de exclusão
function setupDeleteModal() {
  const deleteModal = document.getElementById("delete-modal");
  const closeDeleteModal = document.getElementById("close-delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");

  if (closeDeleteModal) {
    closeDeleteModal.addEventListener("click", () => {
      deleteModal.classList.remove("active");
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteModal.classList.remove("active");
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      if (!currentEventId) return;

      try {
        // Executar exclusão
        await deleteEvent(currentEventId);

        // Atualizar lista local
        eventos = eventos.filter((e) => e.id !== currentEventId);

        // Atualizar interface
        renderEventosCarrossel();

        // Feedback
        showMessage("Evento excluído com sucesso!");
      } catch (error) {
        console.error("Falha na exclusão:", error);
        showMessage(error.message || "Falha ao excluir evento");
      } finally {
        // Fechar modal
        deleteModal.classList.remove("active");
      }
    });
  }

  // Fechar ao clicar fora do modal
  window.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      deleteModal.classList.remove("active");
    }
  });
}

// Configura o modal de funcionalidades em desenvolvimento
function setupDevelopmentModal() {
  const modal = document.getElementById("development-modal");
  const closeModal = document.getElementById("close-development-modal");
  const okBtn = document.getElementById("ok-development");

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (okBtn) {
    okBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  // Fechar ao clicar fora do modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });
}

// Mostrar confirmação de exclusão
function showDeleteConfirmation(eventId) {
  currentEventId = eventId;
  const deleteModal = document.getElementById("delete-modal");
  if (deleteModal) {
    deleteModal.classList.add("active");
  }
}

// Navegar para a página de detalhes do evento
function viewEventDetails(eventId) {
  navigateTo('details', { id: eventId });
}

// Navegar para a página de edição de evento
function editEvent(eventId) {
  navigateTo("create-event", { edit: eventId });
}

// Função de debounce para limitar chamadas
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}