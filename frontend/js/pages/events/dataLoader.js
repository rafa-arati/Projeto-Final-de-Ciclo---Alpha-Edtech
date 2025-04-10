import {
  fetchEvents,
  fetchCategoriesWithSubcategories,
  fetchHighlightedEvents,
  fetchPersonalizedEvents,
  fetchTodayEvents
} from '../../modules/events-api.js';

// Certifique-se que 'eventos' e 'categorias' estão corretamente exportados e importados de './index.js'
import {
  eventos,
  categorias,
  activeFilters,
  highlightedEvents,
  personalizedEvents,
  todayEvents
} from './index.js';
import { renderCarousels } from './renderers.js';
import { updateActiveFiltersDisplay } from './filters.js';
import { getLoggedInUser } from '../../modules/store.js';
// Importa a função de inicialização
import { initializeCarouselVisibility } from './eventHandlers.js';

/**
 * Filtra eventos passados de uma lista
 * @param {Array} events - Lista de eventos para filtrar
 * @returns {Array} - Eventos com data atual ou futura
 */
function filterPastEvents(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset de horas para comparar apenas a data

  return events.filter(event => {
    if (!event.event_date && !event.start_date) return true; // Se não tem data, manter

    const eventDate = new Date(event.event_date || event.start_date);
    eventDate.setHours(0, 0, 0, 0); // Reset de horas para comparar apenas a data

    return eventDate >= today; // Manter apenas eventos de hoje ou futuros
  });
}

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

    // Carregar os novos tipos de eventos em paralelo para melhor performance
    await Promise.all([
      loadHighlightedEvents(),
      loadPersonalizedEvents(),
      loadTodayEvents()
    ]);

    // Renderizar os carrosséis novamente com todos os dados carregados
    renderCarousels();

    // Atualizar a visibilidade das setas
    initializeCarouselVisibility();

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
export async function loadEvents(filters = {}) {
  try {
    const eventosData = await fetchEvents(filters);

    // Filtrar eventos passados
    const filteredEvents = filterPastEvents(eventosData);

    // Limpar o array atual e adicionar os novos itens já filtrados
    eventos.length = 0;
    eventos.push(...filteredEvents);

    console.log(`Eventos carregados: ${eventosData.length}, Após filtro: ${filteredEvents.length}`);

    // 1. Renderiza os carrosséis
    renderCarousels();

    // 2. ATUALIZA a visibilidade das setas DEPOIS de renderizar
    initializeCarouselVisibility();

    // 3. Atualiza a exibição dos filtros ativos
    updateActiveFiltersDisplay();

    return eventos;
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    throw error;
  }
}

/**
 * Carrega eventos em destaque (mais curtidos)
 */
export async function loadHighlightedEvents() {
  try {
    const events = await fetchHighlightedEvents();

    // Filtrar eventos passados
    const filteredEvents = filterPastEvents(events);

    // Limpar o array atual e adicionar os novos itens
    highlightedEvents.length = 0;
    highlightedEvents.push(...filteredEvents);

    console.log(`Eventos em destaque: ${events.length}, Após filtro: ${filteredEvents.length}`);

    return highlightedEvents;
  } catch (error) {
    console.error("Erro ao carregar eventos em destaque:", error);
    return [];
  }
}

/**
 * Carrega eventos personalizados para o usuário
 */
export async function loadPersonalizedEvents() {
  try {
    const events = await fetchPersonalizedEvents();

    // Filtrar eventos passados
    const filteredEvents = filterPastEvents(events);

    // Limpar o array atual e adicionar os novos itens
    personalizedEvents.length = 0;
    personalizedEvents.push(...filteredEvents);

    console.log(`Eventos personalizados: ${events.length}, Após filtro: ${filteredEvents.length}`);

    return personalizedEvents;
  } catch (error) {
    console.error("Erro ao carregar eventos personalizados:", error);
    return [];
  }
}

/**
 * Carrega eventos que acontecem hoje
 */
export async function loadTodayEvents() {
  try {
    const events = await fetchTodayEvents();

    // Para eventos de hoje, não precisamos filtrar por data passada
    // pois teoricamente estes já são apenas de hoje
    // Mas aplicamos o filtro para garantir, caso a API retorne algo diferente
    const filteredEvents = filterPastEvents(events);

    // Limpar o array atual e adicionar os novos itens
    todayEvents.length = 0;
    todayEvents.push(...filteredEvents);

    console.log(`Eventos de hoje: ${events.length}, Após filtro: ${filteredEvents.length}`);

    return todayEvents;
  } catch (error) {
    console.error("Erro ao carregar eventos de hoje:", error);
    return [];
  }
}