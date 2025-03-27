import { navigateTo } from "../modules/router.js";
import { showMessage } from "../modules/utils.js";
import { logoutUser } from "../modules/auth.js";
import { getLoggedInUser, isAdmin } from "../modules/store.js";
import {
  fetchEvents,
  deleteEvent,
  createEvent,
  updateEvent,
} from "../modules/events-api.js";

let eventos = [];
let currentEventId = null;

export default function renderEvents(queryParams) {
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

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
                        <div class="header-profile" id="profile-btn"></div>
                    </div>
                    <h1 class="header-title">Explore eventos</h1>
                    ${
                      isAdmin()
                        ? '<button id="criar-evento-btn" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF); margin-top: 10px;">Criar Novo Evento</button>'
                        : ""
                    }
                </header>

                <section class="search-bar">
                    <span class="search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            viewBox="0 0 16 16">
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </span>
                    <input type="text" class="search-input" placeholder="Procurar" id="search-input">
                    <span class="filter-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                            viewBox="0 0 16 16">
                            <path
                                d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
                        </svg>
                    </span>
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
    `;

  loadEvents().catch((error) => {
    console.error("Erro ao carregar eventos:", error);
    showMessage("Erro ao carregar eventos. Tente novamente.");
  });
}

/********************
 * FUNÇÕES PRINCIPAIS *
 ********************/

async function loadEvents() {
  try {
    eventos = await fetchEvents();
    renderEventosCarrossel();
    setupUIEvents();
  } catch (error) {
    // Erro já tratado no events-api.js, mas podemos adicionar tratamento específico aqui se necessário
    throw error;
  }
}

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
  const categorias = {};
  eventos.forEach((evento) => {
    const categoria = evento.category || "Sem categoria";
    if (!categorias[categoria]) {
      categorias[categoria] = [];
    }
    categorias[categoria].push(evento);
  });

  // Criar carrosséis por categoria
  Object.keys(categorias).forEach((categoria) => {
    if (categoria === "Sem categoria") return; // Pular categoria vazia

    const categoriaSection = document.createElement("section");
    categoriaSection.className = "carousel-section";
    categoriaSection.innerHTML = `
            <h2 class="section-title">${categoria.toUpperCase()}</h2>
            <div class="carousel-container">
                <button class="carousel-arrow left" id="${categoria}-left">&#10094;</button>
                <div class="carousel" id="${categoria}-eventos"></div>
                <button class="carousel-arrow right" id="${categoria}-right">&#10095;</button>
            </div>
        `;

    categoriasContainer.appendChild(categoriaSection);

    const categoriaCarrossel = document.getElementById(`${categoria}-eventos`);
    if (categoriaCarrossel) {
      // Adicionar eventos da categoria ao carrossel
      categorias[categoria].forEach((evento) => {
        const eventCard = createEventCard(evento);
        categoriaCarrossel.appendChild(eventCard);
      });
    }
  });
}

function createEventCard(evento) {
  const eventDate = new Date(evento.event_date);
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

  eventCard.innerHTML = `
        <img src="${imageUrl}" alt="${evento.event_name}" class="event-image">
        <div class="event-info">
            <h3 class="event-title">${evento.event_name}</h3>
            <p class="event-subtitle">${evento.category || "Evento"}</p>
        </div>
        <div class="event-date">
            <span class="event-month">${month}</span>
            <span class="event-day">${day}</span>
        </div>
        ${
          isAdmin()
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

function setupUIEvents() {
  const criarEventoBtn = document.getElementById("criar-evento-btn");
  if (criarEventoBtn && isAdmin()) {
    criarEventoBtn.addEventListener("click", () => {
      // Opção 1 (recomendada): Navegar direto para a rota create-event
      navigateTo("create-event");

      // Opção 2: Se preferir usar como parâmetro
      // navigateTo('events', { mode: 'create' });
    });
    document.getElementById('nav-perfil').addEventListener('click', () => {
      navigateTo('edit-profile');
    });
  }

  // Configurar setas dos carrosséis
  setupCarouselArrows();

  // Campo de busca
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      filterEventos(searchTerm);
    });
  }

  // Botão do perfil
  const profileBtn = document.getElementById("profile-btn");
  if (profileBtn) {
    profileBtn.addEventListener("click", () => navigateTo("edit-profile"));
  }

  // Item de navegação do perfil
  const navPerfil = document.getElementById("nav-perfil");
  if (navPerfil) {
    navPerfil.addEventListener("click", showProfileModal);
  }

  // Configurar modal de exclusão
  setupDeleteModal();

  // Configurar modal de perfil
  setupProfileModal();
}

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

  // Configurar setas para os carrosséis de categoria
  // Obtém todas as categorias dos eventos
  const categorias = [
    ...new Set(eventos.filter((e) => e.category).map((e) => e.category)),
  ];

  categorias.forEach((categoria) => {
    const leftArrow = document.getElementById(`${categoria}-left`);
    const rightArrow = document.getElementById(`${categoria}-right`);
    const categoriaEventos = document.getElementById(`${categoria}-eventos`);

    if (leftArrow && categoriaEventos) {
      leftArrow.addEventListener("click", () => {
        categoriaEventos.scrollBy({ left: -300, behavior: "smooth" });
      });
    }

    if (rightArrow && categoriaEventos) {
      rightArrow.addEventListener("click", () => {
        categoriaEventos.scrollBy({ left: 300, behavior: "smooth" });
      });
    }
  });
}

function filterEventos(searchTerm) {
  // Filtrar eventos com base no termo de busca
  const filteredEventos = eventos.filter((evento) => {
    return (
      evento.event_name.toLowerCase().includes(searchTerm) ||
      (evento.category && evento.category.toLowerCase().includes(searchTerm)) ||
      (evento.description &&
        evento.description.toLowerCase().includes(searchTerm))
    );
  });

  // Atualizar o carrossel principal
  const todosEventosContainer = document.getElementById("todos-eventos");
  if (todosEventosContainer) {
    todosEventosContainer.innerHTML = "";

    if (filteredEventos.length === 0) {
      todosEventosContainer.innerHTML =
        '<p style="color: white; padding: 20px;">Nenhum evento encontrado com esse termo.</p>';
    } else {
      filteredEventos.forEach((evento) => {
        const eventCard = createEventCard(evento);
        todosEventosContainer.appendChild(eventCard);
      });
    }
  }
}

function viewEventDetails(eventId) {
  // Buscar o evento pelo ID
  const evento = eventos.find((e) => e.id === eventId);
  if (!evento) {
    showMessage("Evento não encontrado.");
    return;
  }

  // Redirecionar para a página de detalhes (a implementar)
  // Por enquanto, apenas mostrar informações básicas
  showMessage(
    `Detalhes do evento "${evento.event_name}" serão implementados em breve.`
  );
}

function editEvent(eventId) {
  navigateTo("create-event", { edit: eventId }); // Passa o ID na URL
}

function showDeleteConfirmation(eventId) {
  currentEventId = eventId;
  const deleteModal = document.getElementById("delete-modal");
  if (deleteModal) {
    deleteModal.classList.add("active");
  }
}

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
        // 1. Executa a exclusão na API
        await deleteEvent(currentEventId);

        // 2. Atualiza a lista local (otimista)
        eventos = eventos.filter((e) => e.id !== currentEventId);

        // 3. Atualiza a interface
        renderEventosCarrossel();

        // 4. Feedback visual
        showMessage("Evento excluído com sucesso!", "success");
      } catch (error) {
        // 5. Tratamento de erros completo
        console.error("Falha na exclusão:", error);
        showMessage(error.message || "Falha ao excluir evento", "error");

        // 6. Rollback opcional (se quiser recarregar os dados originais)
        eventos = await fetchEvents();
        renderEventosCarrossel();
      } finally {
        // 7. Fecha o modal em qualquer caso
        deleteModal.classList.remove("active");
      }
    });
  }
  // Fechar ao clicar fora do modal
  if (deleteModal) {
    window.addEventListener("click", (event) => {
      if (event.target === deleteModal) {
        deleteModal.classList.remove("active");
      }
    });
  }
}

function showProfileModal() {
  const profileModal = document.getElementById("profile-modal");
  const userInfoContainer = document.getElementById("user-info");

  if (profileModal && userInfoContainer) {
    // Obter informações do usuário
    const user = getLoggedInUser();

    if (user) {
      userInfoContainer.innerHTML = `
                <p><strong>Nome:</strong> ${
                  user.name || user.username || "N/A"
                }</p>
                <p><strong>Email:</strong> ${user.email || "N/A"}</p>
                <p><strong>Tipo de Usuário:</strong> ${
                  user.userType === "admin" ? "Administrador" : "Usuário comum"
                }</p>
            `;
    } else {
      userInfoContainer.innerHTML =
        "<p>Não foi possível obter informações do usuário.</p>";
    }

    profileModal.classList.add("active");
  }
}

function setupProfileModal() {
  const profileModal = document.getElementById("profile-modal");
  const closeProfileModal = document.getElementById("close-profile-modal");
  const logoutBtn = document.getElementById("logout-btn");

  if (closeProfileModal && profileModal) {
    closeProfileModal.addEventListener("click", () => {
      profileModal.classList.remove("active");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await logoutUser();
        navigateTo("welcome-screen");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        showMessage("Erro ao fazer logout");
      }
    });
  }

  // Fechar ao clicar fora do modal
  if (profileModal) {
    window.addEventListener("click", (event) => {
      if (event.target === profileModal) {
        profileModal.classList.remove("active");
      }
    });
  }
}
