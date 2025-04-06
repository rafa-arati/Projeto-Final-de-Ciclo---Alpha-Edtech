// Funções para carregamento de dados

import { fetchEvents, fetchCategoriesWithSubcategories } from '../../modules/events-api.js';
// Certifique-se que 'eventos' e 'categorias' estão corretamente exportados e importados de './index.js'
import { eventos, categorias, activeFilters } from './index.js';
import { renderCarousels } from './renderers.js';
import { updateActiveFiltersDisplay } from './filters.js';
import { getLoggedInUser } from '../../modules/store.js';
// Importa a função de inicialização
import { initializeCarouselVisibility } from './eventHandlers.js';

/**
 * Carrega dados iniciais necessários para a página
 */
export async function loadInitialData() {
    try {
        console.log("Iniciando carregamento de dados iniciais");

        // Verificar se há um usuário logado
        const user = getLoggedInUser();
        console.log("Usuário atual:", user);

        // Carregar categorias primeiro, para poder exibir nomes corretos depois
        await loadCategoriesAndSubcategories();

        // Carregar eventos com os filtros atuais
        await loadEvents(activeFilters);

        return { success: true };
    } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        throw error; // Re-lança o erro para ser tratado no nível superior se necessário
    }
}

/**
 * Carrega categorias e subcategorias
 */
export async function loadCategoriesAndSubcategories() {
    try {
        const categoriasData = await fetchCategoriesWithSubcategories();

        // Limpar e atualizar a referência global de forma segura
        categorias.length = 0; // Limpa o array existente mantendo a referência
        Object.assign(categorias, categoriasData); // Copia as propriedades (se for um objeto)
        // Ou se categoriasData for um array:
        // categorias.push(...categoriasData);

        console.log("Categorias carregadas:", categorias);

        return categorias;
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        throw error;
    }
}

/**
 * Carrega eventos com base nos filtros
 */
// MANTENHA APENAS ESTA DEFINIÇÃO DE loadEvents
export async function loadEvents(filters = {}) {
    try {
        const eventosData = await fetchEvents(filters);

        // Limpar o array atual e adicionar os novos itens
        eventos.length = 0;
        eventos.push(...eventosData);

        console.log("Eventos carregados:", eventos.length);

        // 1. Renderiza os carrosséis
        renderCarousels();

        // 2. ATUALIZA a visibilidade das setas DEPOIS de renderizar
        // Certifique-se que 'initializeCarouselVisibility' está sendo exportada de eventHandlers.js
        initializeCarouselVisibility();

        // 3. Atualiza a exibição dos filtros ativos
        updateActiveFiltersDisplay();

        return eventos;
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        throw error;
    }
}