// Lógica de filtros e busca

import { showMessage } from '../../modules/utils.js';
import { eventos, categorias, activeFilters } from './index.js';
import { loadEvents } from './dataLoader.js';

/**
 * Atualiza a exibição dos filtros ativos
 */
export function updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById('active-filters');
    if (!activeFiltersContainer) return;

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
            // Limpar todos os filtros
            Object.keys(activeFilters).forEach(key => {
                delete activeFilters[key];
            });

            // Limpar campo de busca
            document.getElementById('search-input').value = '';

            // Recarregar eventos
            loadEvents(activeFilters);
        });

        filtersDiv.appendChild(clearAllBtn);
    }
}

/**
 * Cria um badge de filtro com botão para remover
 */
export function createFilterBadge(text, onRemove) {
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

/**
 * Configura atualizações de subcategorias no modal de filtros
 */
export function updateSubcategories() {
    const categoryId = document.getElementById('filter-category').value;
    const subcategoryWrapper = document.getElementById('subcategory-wrapper');
    const subcategorySelect = document.getElementById('filter-subcategory');

    if (!subcategoryWrapper || !subcategorySelect) return;

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
            if (subcategoria.id) { // Verificar se a subcategoria é válida
                const option = document.createElement('option');
                option.value = subcategoria.id;
                option.textContent = subcategoria.name;
                subcategorySelect.appendChild(option);
            }
        });

        // Mostrar select de subcategorias
        subcategoryWrapper.style.display = 'block';
    } else {
        // Ocultar select de subcategorias para categorias sem subcategorias
        subcategoryWrapper.style.display = 'none';
    }
}

/**
 * Aplica os filtros selecionados
 */
export function applyFilters() {
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
}

/**
 * Limpa os filtros aplicados
 */
export function resetFilters() {
    // Limpar campos do formulário
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-subcategory").value = "";
    document.getElementById("filter-start-date").value = "";
    document.getElementById("filter-end-date").value = "";

    // Esconder subcategorias
    document.getElementById("subcategory-wrapper").style.display = "none";

    // Limpar todos os filtros, exceto de busca
    const searchFilter = activeFilters.search;

    // Limpar o objeto de filtros
    Object.keys(activeFilters).forEach(key => {
        delete activeFilters[key];
    });

    // Manter filtro de busca se existir
    if (searchFilter) {
        activeFilters.search = searchFilter;
    }

    // Recarregar eventos
    loadEvents(activeFilters);
}

/**
 * Processa a busca por texto
 */
export function processSearch(searchTerm) {
    if (searchTerm) {
        activeFilters.search = searchTerm;
    } else {
        delete activeFilters.search;
    }

    loadEvents(activeFilters);
}

/**
 * Função de debounce para limitar chamadas
 */
export function debounce(func, wait) {
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