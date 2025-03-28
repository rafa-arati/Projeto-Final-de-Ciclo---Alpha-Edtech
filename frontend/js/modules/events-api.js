import { showMessage } from './utils.js';

const API_URL = '/api';

/**
 * Busca todos os eventos com filtros opcionais
 * @param {Object} filters - Filtros para os eventos (categoria, subcategoria, data)
 * @returns {Promise} Promise com os eventos
 */
export async function fetchEvents(filters = {}) {
  try {
    // Criação dos parâmetros de consulta para os filtros
    const params = new URLSearchParams();

    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search) params.append('search', filters.search);

    // URL com os parâmetros
    const url = `${API_URL}/events${params.toString() ? '?' + params.toString() : ''}`;

    console.log('Buscando eventos com URL:', url);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar eventos');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    showMessage('Não foi possível carregar os eventos');
    throw error;
  }
}

/**
 * Busca categorias com suas subcategorias
 * @returns {Promise} Promise com as categorias e subcategorias
 */
export async function fetchCategoriesWithSubcategories() {
  try {
    const response = await fetch(`${API_URL}/categories-with-subcategories`);
    if (!response.ok) throw new Error('Erro ao buscar categorias');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    showMessage('Não foi possível carregar as categorias');
    throw error;
  }
}

/**
 * Exclui um evento
 * @param {number} eventId - ID do evento a ser excluído
 * @returns {Promise} Promise com o resultado da exclusão
 */
export async function deleteEvent(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao excluir evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    throw error;
  }
}

/**
 * Busca um evento pelo ID
 * @param {number} eventId - ID do evento
 * @returns {Promise} Promise com os dados do evento
 */
export async function getEventById(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Erro ao buscar evento');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    throw error;
  }
}

/**
 * Salva um evento (cria novo ou atualiza existente)
 * @param {FormData} formData - Dados do evento em FormData
 * @param {number|null} eventId - ID do evento (para atualização) ou null (para criação)
 * @returns {Promise} Promise com os dados do evento salvo
 */
export async function saveEvent(formData, eventId = null) {
  try {
    const url = eventId ? `${API_URL}/events/${eventId}` : `${API_URL}/events`;
    const method = eventId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao salvar evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    throw error;
  }
}