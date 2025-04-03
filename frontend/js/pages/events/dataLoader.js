//Funções para carregamento de dados

import { fetchEvents, fetchCategoriesWithSubcategories } from '../../modules/events-api.js';
import { eventos, categorias, activeFilters } from './index.js';
import { renderCarousels } from './renderers.js';
import { updateActiveFiltersDisplay } from './filters.js';
import { getLoggedInUser } from '../../modules/store.js';

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
        throw error;
    }
}

/**
 * Carrega categorias e subcategorias
 */
export async function loadCategoriesAndSubcategories() {
    try {
        const categoriasData = await fetchCategoriesWithSubcategories();

        // Atualizar a referência global
        Object.assign(categorias, categoriasData);

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
export async function loadEvents(filters = {}) {
    try {
        const eventosData = await fetchEvents(filters);

        // Limpar o array atual e adicionar os novos itens
        eventos.length = 0;
        eventos.push(...eventosData);

        console.log("Eventos carregados:", eventos.length);

        // Renderizar carrosséis com os novos dados
        renderCarousels();

        // Atualizar exibição de filtros ativos
        updateActiveFiltersDisplay();

        return eventos;
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        throw error;
    }
}