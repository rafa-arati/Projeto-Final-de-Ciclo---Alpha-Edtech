// Manipuladores de eventos (cliques, etc.)

import { navigateTo } from '../../modules/router.js';
import { showMessage } from '../../modules/utils.js';
// Certifique-se que 'categorias' e 'activeFilters' estão sendo exportados de './index.js' ou de onde for apropriado
import { categorias, activeFilters } from './index.js';
// Importa debounce APENAS UMA VEZ
import { processSearch, debounce, updateSubcategories, applyFilters, resetFilters } from './filters.js';
import { loadEvents } from './dataLoader.js';

/**
 * Atualiza a visibilidade das setas de navegação de um carrossel.
 * (Versão revisada para CSS que esconde por padrão)
 * @param {HTMLElement} carouselElement - O elemento do carrossel (.carousel).
 */
export function updateCarouselArrowVisibility(carouselElement) {
    if (!carouselElement) return;

    const container = carouselElement.parentElement; // O .carousel-container
    if (!container) return;

    const leftArrow = container.querySelector('.carousel-arrow.left');
    const rightArrow = container.querySelector('.carousel-arrow.right');

    if (!leftArrow || !rightArrow) return;

    const scrollWidth = carouselElement.scrollWidth;
    const clientWidth = carouselElement.clientWidth;
    const scrollLeft = carouselElement.scrollLeft;
    const scrollEnd = scrollWidth - clientWidth;

    // Define uma pequena tolerância para comparações
    const tolerance = 2; // Aumentar ligeiramente a tolerância pode ajudar

    // Verifica se há conteúdo suficiente para rolar
    const canScroll = scrollWidth > clientWidth + tolerance;

    if (!canScroll) {
        // Esconde ambas se não pode rolar
        leftArrow.classList.remove('is-visible');
        rightArrow.classList.remove('is-visible');
    } else {
        // Lógica para mostrar/esconder seta esquerda
        if (scrollLeft > tolerance) {
            leftArrow.classList.add('is-visible'); // Mostra se não está no início
        } else {
            leftArrow.classList.remove('is-visible'); // Esconde se está no início
        }

        // Lógica para mostrar/esconder seta direita
        // Arredondar pode ser necessário para evitar problemas com subpixels
        if (Math.round(scrollLeft) < Math.round(scrollEnd) - tolerance) {
            rightArrow.classList.add('is-visible'); // Mostra se não está no fim
        } else {
            rightArrow.classList.remove('is-visible'); // Esconde se está no fim
        }
    }
}

/**
 * Adiciona o listener de scroll para um carrossel específico.
 * @param {HTMLElement} carouselElement - O elemento do carrossel (.carousel).
 */
function setupCarouselScrollListener(carouselElement) {
    const debouncedUpdate = debounce(() => {
        updateCarouselArrowVisibility(carouselElement);
    }, 50); // Tempo de debounce curto para scroll

    // Limpa listener antigo (melhor prática)
    carouselElement.removeEventListener('scroll', debouncedUpdate); // Adapte se o debounce retornar uma função diferente
    carouselElement.addEventListener('scroll', debouncedUpdate);
}

/**
 * Configura o listener de resize da janela para atualizar todos os carrosséis.
 */
function setupWindowResizeListener() {
    let resizeTimeout;
    // Limpa listener antigo para resize também
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("Window resized, updating all carousels visibility.");
            const allCarousels = document.querySelectorAll('.carousel');
            allCarousels.forEach(updateCarouselArrowVisibility);
        }, 250);
    };
    window.removeEventListener('resize', handleResize); // Remove listener antigo se existir
    window.addEventListener('resize', handleResize);
}

/**
 * Inicializa a visibilidade das setas e adiciona listeners para todos os carrosséis.
 * Deve ser chamado DEPOIS que os carrosséis foram renderizados.
 */
export function initializeCarouselVisibility() {
    console.log("Initializing carousel visibility and listeners...");
    const allCarousels = document.querySelectorAll('.carousel');
    allCarousels.forEach(carousel => {
        updateCarouselArrowVisibility(carousel); // Define o estado inicial
        setupCarouselScrollListener(carousel);  // Adiciona listener de scroll
    });
}

// Flag para garantir que o listener de resize seja configurado apenas uma vez por carregamento de página
let resizeListenerSet = false;

// --- Funções de configuração de UI específicas ---

function setupProfileButton() {
    const profileBtn = document.getElementById("profile-btn");
    const navPerfil = document.getElementById("nav-perfil");

    const navigate = () => navigateTo("edit-profile");

    if (profileBtn) {
        profileBtn.replaceWith(profileBtn.cloneNode(true));
        document.getElementById("profile-btn").addEventListener("click", navigate);
    }
    if (navPerfil) {
        navPerfil.replaceWith(navPerfil.cloneNode(true));
        document.getElementById("nav-perfil").addEventListener("click", navigate);
    }
}

function setupSearchField() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        const debouncedSearch = debounce(() => {
            const searchTerm = document.getElementById("search-input").value.trim();
            processSearch(searchTerm);
        }, 500);
        searchInput.replaceWith(searchInput.cloneNode(true));
        document.getElementById("search-input").addEventListener("input", debouncedSearch);
    }
}

function setupFilterButton() {
    const filterBtn = document.getElementById("filter-btn");
    if (filterBtn) {
        filterBtn.replaceWith(filterBtn.cloneNode(true));
        document.getElementById("filter-btn").addEventListener("click", showFilterModal);
    } else {
        console.warn("Botão de filtro não encontrado no DOM");
    }
}

function setupBottomNavigation() {
    const navItems = document.querySelectorAll('.nav-item:not(#nav-perfil)');
    navItems.forEach((item, index) => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        if (index === 0) { // Home
            newItem.addEventListener('click', () => {
                if (window.location.hash.startsWith('#events') || window.location.hash === '') {
                    Object.keys(activeFilters).forEach(key => { delete activeFilters[key]; });
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) searchInput.value = '';
                    loadEvents(activeFilters); // Recarrega eventos sem filtros
                } else {
                    navigateTo('events');
                }
            });
        } else if (index === 1) { // Agenda (segundo item agora)
            newItem.addEventListener('click', () => {
                navigateTo('agenda');
            });
        }
    });
}

// --- Funções exportadas relacionadas a modais e filtros (mantidas) ---

export function showDevelopmentMessage() {
    showMessage('Esta funcionalidade está em desenvolvimento e será disponibilizada em breve!');
}

export function showFilterModal() {
    console.log("Função showFilterModal chamada");
    const filterModal = document.getElementById("filter-modal");
    if (!filterModal) {
        console.error("Modal de filtros não encontrado no DOM");
        return;
    }

    // Preencher categorias (assumindo que 'categorias' está disponível)
    const categorySelect = document.getElementById("filter-category");
    if (categorySelect && Array.isArray(categorias)) {
        categorySelect.innerHTML = '<option value="">Todas as categorias</option>';
        categorias.forEach(cat => {
            if (cat && cat.id && cat.name) {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            }
        });
        // Restaurar seleção
        categorySelect.value = activeFilters.category_id || "";
    }

    // Atualizar e restaurar subcategorias
    const subcategoryWrapper = document.getElementById("subcategory-wrapper");
    const subcategorySelect = document.getElementById("filter-subcategory");
    if (subcategoryWrapper && subcategorySelect) {
        updateSubcategories(); // Chama a função que popula baseado na categoria
        subcategorySelect.value = activeFilters.subcategory_id || ""; // Restaura subcategoria
    }


    // Restaurar datas
    const startDateInput = document.getElementById("filter-start-date");
    const endDateInput = document.getElementById("filter-end-date");
    if (startDateInput) startDateInput.value = activeFilters.start_date || "";
    if (endDateInput) endDateInput.value = activeFilters.end_date || "";

    filterModal.classList.add("active");
}

// Função para fechar modal de filtro ao clicar fora (declarada antes de setupFilterModalEvents)
function closeModalOnClickOutside(event) {
    const filterModal = document.getElementById("filter-modal");
    if (event.target === filterModal) {
        filterModal.classList.remove("active");
    }
}

export function setupFilterModalEvents() {
    const filterModal = document.getElementById("filter-modal");
    const closeFilterModal = document.getElementById("close-filter-modal");
    const applyFiltersBtn = document.getElementById("apply-filters");
    const resetFiltersBtn = document.getElementById("reset-filters");
    const categorySelect = document.getElementById("filter-category");

    if (!filterModal || !closeFilterModal || !applyFiltersBtn || !resetFiltersBtn) {
        console.error("Elementos do modal de filtros não encontrados");
        return;
    }

    // Função para fechar o modal
    const closeModal = () => filterModal.classList.remove("active");

    // Limpar listeners antigos antes de adicionar novos
    const newCloseBtn = closeFilterModal.cloneNode(true);
    closeFilterModal.parentNode.replaceChild(newCloseBtn, closeFilterModal);
    newCloseBtn.addEventListener("click", closeModal);

    const newApplyBtn = applyFiltersBtn.cloneNode(true);
    applyFiltersBtn.parentNode.replaceChild(newApplyBtn, applyFiltersBtn);
    newApplyBtn.addEventListener("click", () => { applyFilters(); closeModal(); });

    const newResetBtn = resetFiltersBtn.cloneNode(true);
    resetFiltersBtn.parentNode.replaceChild(newResetBtn, resetFiltersBtn);
    newResetBtn.addEventListener("click", () => { resetFilters(); closeModal(); });

    if (categorySelect) {
        const newCategorySelect = categorySelect.cloneNode(true); // Preserva opções
        categorySelect.parentNode.replaceChild(newCategorySelect, categorySelect);
        newCategorySelect.addEventListener('change', updateSubcategories);
        newCategorySelect.value = activeFilters.category_id || ""; // Restaura valor
        if (newCategorySelect.value) updateSubcategories();
    }

    // Fechar ao clicar fora
    window.removeEventListener("click", closeModalOnClickOutside); // Remover listener antigo
    window.addEventListener("click", closeModalOnClickOutside);
}

// --- Função Principal de Setup ---

/**
 * Configura todos os eventos de UI para a página de listagem de eventos.
 */
export function setupUIEvents() {
    console.log("Executando setupUIEvents...");
    setupProfileButton();
    setupSearchField();
    setupFilterButton();
    setupBottomNavigation();
    // setupFilterModalEvents(); // Chamado de dentro de setupModals agora

    // Configura o listener de resize da janela (apenas uma vez)
    if (!resizeListenerSet) {
        setupWindowResizeListener();
        resizeListenerSet = true;
        console.log("Listener de resize da janela configurado.");
    }

    // Configura navegação (cliques) das setas
    const arrows = document.querySelectorAll('.carousel-arrow');
    arrows.forEach(arrow => {
        const newArrow = arrow.cloneNode(true);
        arrow.parentNode.replaceChild(newArrow, arrow); // Limpa listeners antigos

        newArrow.addEventListener('click', () => {
            // Só executa se a seta estiver visível
            if (newArrow.classList.contains('is-visible')) {
                const container = newArrow.closest('.carousel-container');
                if (container) {
                    const carousel = container.querySelector('.carousel');
                    if (carousel) {
                        const direction = newArrow.classList.contains('left') ? -1 : 1;
                        const scrollAmount = carousel.clientWidth * 0.8;
                        carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // Nota: A visibilidade inicial e os listeners de scroll são configurados
    // por initializeCarouselVisibility(), que é chamado após a renderização dos carrosséis.
    console.log("setupUIEvents concluído.");
}