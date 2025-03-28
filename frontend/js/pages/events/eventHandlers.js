// Manipuladores de eventos (cliques, etc.)

import { navigateTo } from '../../modules/router.js';
import { showMessage } from '../../modules/utils.js';
import { categorias, activeFilters } from './index.js';
import { processSearch, debounce, updateSubcategories, applyFilters, resetFilters } from './filters.js';
import { loadEvents } from './dataLoader.js';

/**
 * Configura todos os eventos de UI
 */
export function setupUIEvents() {
    // Configurar botão de perfil no topo
    setupProfileButton();

    // Configurar campo de busca
    setupSearchField();

    // Configurar botão de filtro
    setupFilterButton();

    // Configurar navegação inferior
    setupBottomNavigation();
}

/**
 * Configuração do botão de perfil
 */
function setupProfileButton() {
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
}

/**
 * Configuração do campo de busca
 */
function setupSearchField() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        // Usar debounce para não fazer muitas requisições
        searchInput.addEventListener("input", debounce(() => {
            const searchTerm = searchInput.value.trim();
            processSearch(searchTerm);
        }, 500));
    }
}

/**
 * Configuração do botão de filtro
 */
function setupFilterButton() {
    const filterBtn = document.getElementById("filter-btn");
    if (filterBtn) {
        console.log("Configurando evento de clique para o botão de filtro");

        // Remove qualquer evento existente e adiciona um novo
        const newFilterBtn = filterBtn.cloneNode(true);
        filterBtn.parentNode.replaceChild(newFilterBtn, filterBtn);

        newFilterBtn.addEventListener("click", showFilterModal);
    } else {
        console.warn("Botão de filtro não encontrado no DOM");
    }
}

/**
 * Configuração da navegação inferior
 */
function setupBottomNavigation() {
    // Adicionar eventos aos itens de navegação (exceto o perfil, que já foi configurado)
    const navItems = document.querySelectorAll('.nav-item:not(#nav-perfil)');
    navItems.forEach((item, index) => {
        if (index === 0) { // Home
            item.addEventListener('click', () => {
                // Se já estamos na página events, apenas recarregar os dados
                if (window.location.hash === '#events') {
                    // Reiniciar filtros e recarregar
                    Object.keys(activeFilters).forEach(key => {
                        delete activeFilters[key];
                    });
                    document.getElementById('search-input').value = '';
                    loadEvents(activeFilters);
                } else {
                    navigateTo('events');
                }
            });
        } else {
            // Para os outros itens (Busca, Agenda, Favoritos), mostrar mensagem de desenvolvimento
            item.addEventListener('click', () => {
                showDevelopmentMessage();
            });
        }
    });
}

/**
 * Mostra mensagem para funcionalidades em desenvolvimento
 */
export function showDevelopmentMessage() {
    showMessage('Esta funcionalidade está em desenvolvimento e será disponibilizada em breve!');
}

/**
 * Mostra o modal de filtros
 */
export function showFilterModal() {
    console.log("Função showFilterModal chamada");

    const filterModal = document.getElementById("filter-modal");
    if (!filterModal) {
        console.error("Modal de filtros não encontrado no DOM");
        return;
    }

    // Preencher o dropdown de categorias
    const categorySelect = document.getElementById("filter-category");
    if (categorySelect) {
        // Limpar opções existentes
        categorySelect.innerHTML = '<option value="">Todas as categorias</option>';

        console.log("Preenchendo categorias no modal. Categorias disponíveis:", categorias.length);

        // Adicionar categorias ao dropdown
        if (Array.isArray(categorias) && categorias.length > 0) {
            categorias.forEach(categoria => {
                if (categoria && categoria.id && categoria.name) {
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.name;
                    categorySelect.appendChild(option);
                }
            });
        }
    } else {
        console.warn("Select de categorias não encontrado no DOM");
    }

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

/**
 * Configurar eventos para o modal de filtros
 */
export function setupFilterModalEvents() {
    const filterModal = document.getElementById("filter-modal");
    const closeFilterModal = document.getElementById("close-filter-modal");
    const applyFiltersBtn = document.getElementById("apply-filters");
    const resetFiltersBtn = document.getElementById("reset-filters");
    const categorySelect = document.getElementById("filter-category");

    // Verificar se os elementos existem
    if (!filterModal || !closeFilterModal || !applyFiltersBtn || !resetFiltersBtn) {
        console.error("Elementos do modal de filtros não encontrados");
        return;
    }

    // Configurar evento de categoria para atualizar subcategorias
    if (categorySelect) {
        categorySelect.addEventListener('change', updateSubcategories);
    }

    // Fechar modal
    closeFilterModal.addEventListener("click", () => {
        filterModal.classList.remove("active");
    });

    // Aplicar filtros
    applyFiltersBtn.addEventListener("click", () => {
        applyFilters();
        filterModal.classList.remove("active");
    });

    // Resetar filtros
    resetFiltersBtn.addEventListener("click", () => {
        resetFilters();
        filterModal.classList.remove("active");
    });

    // Fechar ao clicar fora do modal
    window.addEventListener("click", (event) => {
        if (event.target === filterModal) {
            filterModal.classList.remove("active");
        }
    });
}