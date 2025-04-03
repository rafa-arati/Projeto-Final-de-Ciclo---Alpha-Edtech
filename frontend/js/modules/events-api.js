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
    if (filters.creator_id) params.append('creator_id', filters.creator_id);

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
 * Busca apenas os eventos do usuário atual
 * @returns {Promise} Promise com os eventos do usuário
 */
export async function fetchMyEvents() {
  try {
    const response = await fetch(`${API_URL}/my-events`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Erro ao buscar seus eventos');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar seus eventos:', error);
    showMessage('Não foi possível carregar seus eventos');
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

/**
 * Verifica o status premium do usuário
 * @returns {Promise} Promise com o status premium
 */
export async function checkPremiumStatus() {
  try {
    const response = await fetch(`${API_URL}/premium/status`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Erro ao verificar status premium');

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return { isPremium: false, subscription: { status: 'none' } };
  }
}

/**
 * Solicita upgrade para conta premium
 * @returns {Promise} Promise com o resultado da solicitação
 */
export async function upgradeToPremium() {
  try {
    const response = await fetch(`${API_URL}/premium/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer upgrade para premium');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao fazer upgrade para premium:', error);
    throw error;
  }
}

/**
 * Cria um novo QR Code para um evento
 * @param {Object} qrCodeData - Dados do QR Code
 * @returns {Promise} Promise com o QR Code criado
 */
export async function createQRCode(qrCodeData) {
  try {
    const response = await fetch(`${API_URL}/qrcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(qrCodeData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar QR Code');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar QR Code:', error);
    throw error;
  }
}

/**
 * Obtém QR Codes de um evento
 * @param {number} eventId - ID do evento
 * @returns {Promise} Promise com os QR Codes do evento
 */
export async function getEventQRCodes(eventId) {
  try {
    const response = await fetch(`${API_URL}/qrcode/event/${eventId}`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Erro ao buscar QR Codes');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar QR Codes:', error);
    return [];
  }
}

/**
 * Exclui um QR Code
 * @param {number} qrCodeId - ID do QR Code
 * @returns {Promise} Promise com o resultado da exclusão
 */
export async function deleteQRCode(qrCodeId) {
  try {
    const response = await fetch(`${API_URL}/qrcode/${qrCodeId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao excluir QR Code');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao excluir QR Code:', error);
    throw error;
  }
}