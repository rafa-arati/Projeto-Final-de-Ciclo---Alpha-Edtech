//Funções de renderização de componentes

import { navigateTo } from '../../modules/router.js';
import { isAdmin } from '../../modules/store.js';
import { eventos, categorias } from './index.js';

/**
 * Renderiza os carrosséis de eventos
 */
export function renderCarousels() {
    const categoriasContainer = document.getElementById("categorias-container");
    const destaqueContainer = document.getElementById("destaque-eventos");

    if (!categoriasContainer || !destaqueContainer) return;

    // Limpar os containers
    categoriasContainer.innerHTML = "";
    destaqueContainer.innerHTML = "";

    // Verificar se há eventos
    if (eventos.length === 0) {
        categoriasContainer.innerHTML =
            '<p style="color: white; padding: 20px;">Nenhum evento encontrado.</p>';
        return;
    }

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

    // Adicionar eventos em destaque (por enquanto vazio, mas preparado para implementação futura)
    // Apenas um placeholder - esta lógica pode ser modificada depois
    renderEventsInCarousel(destaqueContainer, []);

    // Criar carrosséis por categoria
    Object.keys(eventosPorCategoria).forEach((categoriaId) => {
        const categoria = eventosPorCategoria[categoriaId];

        // Pular se for "sem categoria"
        if (categoriaId === 'sem-categoria') return;

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
            // Renderizar eventos da categoria no carrossel
            renderEventsInCarousel(categoriaCarrossel, categoria.eventos);
        }
    });

    // Configurar setas dos carrosséis
    setupCarouselArrows();
}

/**
 * Renderiza eventos em um carrossel específico
 */
export function renderEventsInCarousel(carouselContainer, eventosToRender) {
    // Se não houver eventos, exibe mensagem
    if (eventosToRender.length === 0) {
        carouselContainer.innerHTML = `
      <div style="padding: 20px; color: #888; text-align: center; width: 100%;">
        Nenhum evento encontrado nesta categoria.
      </div>
    `;
        return;
    }

    // Adicionar eventos ao carrossel
    eventosToRender.forEach((evento) => {
        const eventCard = createEventCard(evento);
        carouselContainer.appendChild(eventCard);
    });
}

/**
 * Cria um card de evento
 */
export function createEventCard(evento) {
    // Converter data para objeto Date
    const eventDate = evento.event_date ? new Date(evento.event_date) :
        evento.start_date ? new Date(evento.start_date) : new Date();

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

/**
 * Navegar para a página de detalhes do evento
 */
function viewEventDetails(eventId) {
    navigateTo('details', { id: eventId });
}

/**
 * Navegar para a página de edição de evento
 */
function editEvent(eventId) {
    navigateTo("create-event", { edit: eventId });
}

/**
 * Mostrar confirmação de exclusão
 */
function showDeleteConfirmation(eventId) {
    // Esta função está implementada no módulo modals.js
    const event = new CustomEvent('showDeleteModal', { detail: { eventId } });
    document.dispatchEvent(event);
}

/**
 * Configuração das setas dos carrosséis
 */
function setupCarouselArrows() {
    // Configurar setas para o carrossel "Em Destaque"
    const destaqueLeftArrow = document.getElementById("destaque-left");
    const destaqueRightArrow = document.getElementById("destaque-right");
    const destaqueCarousel = document.getElementById("destaque-eventos");

    setupCarouselNavigation(destaqueLeftArrow, destaqueRightArrow, destaqueCarousel);

    // Configurar setas para carrosséis de categoria
    const categories = eventos
        .map((e) => e.category_id)
        .filter((value, index, self) => value && self.indexOf(value) === index);

    categories.forEach((categoryId) => {
        const leftArrow = document.getElementById(`${categoryId}-left`);
        const rightArrow = document.getElementById(`${categoryId}-right`);
        const categoryCarousel = document.getElementById(`${categoryId}-eventos`);

        setupCarouselNavigation(leftArrow, rightArrow, categoryCarousel);
    });
}

/**
 * Configura navegação para um carrossel específico
 */
function setupCarouselNavigation(leftArrow, rightArrow, carousel) {
    if (leftArrow && carousel) {
        leftArrow.addEventListener("click", () => {
            carousel.scrollBy({ left: -300, behavior: "smooth" });
        });
    }

    if (rightArrow && carousel) {
        rightArrow.addEventListener("click", () => {
            carousel.scrollBy({ left: 300, behavior: "smooth" });
        });
    }
}