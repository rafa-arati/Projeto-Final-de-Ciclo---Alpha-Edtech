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
    console.log(`Tentando excluir evento com ID: ${eventId}`);

    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    // Obtenha o texto completo da resposta para diagnóstico
    const responseText = await response.text();
    console.log(`Resposta completa: ${responseText}`);

    // Tente converter para JSON se possível
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // Se não for JSON, use o texto como está
      responseData = { message: responseText || 'Sem detalhes do erro' };
    }

    if (!response.ok) {
      throw new Error(responseData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return responseData;
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
    // Linha CORRETA:
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      credentials: 'include' // <-- Inclui as opções com credentials
    });
    // Assegure-se que a linha acima esteja EXATAMENTE assim, 
    // com a crase final e o objeto de opções.

    // --- Tratamento de erro (MELHORADO) ---
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      try {
        // Tenta obter mais detalhes SE a resposta for JSON
        if (response.headers.get('content-type')?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          // Se não for JSON, pega o texto (útil para HTML de erro)
          const errorText = await response.text();
          console.error("Resposta não-JSON recebida do backend:", errorText); // Log do HTML/Texto
          // Não joga o HTML inteiro no erro principal, apenas loga
        }
      } catch (e) {
        console.warn("Não foi possível parsear corpo da resposta de erro", e);
      }
      // Lança o erro para ser pego pelo bloco catch externo
      throw new Error(errorMessage);
    }
    // --- Fim do tratamento de erro ---

    // Se a resposta for OK, parseia o JSON
    return await response.json();

  } catch (error) {
    // Loga o erro final que será mostrado ao usuário ou tratado posteriormente
    console.error('Erro ao buscar evento:', error);
    // Re-lança o erro para que a função chamadora (loadEventDetails) possa tratá-lo
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

    // Depuração para verificar os dados enviados
    console.log("Enviando dados para", url, "com método", method);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(url, {
      method,
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      // Tente obter mais detalhes sobre o erro
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Erro ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.message || 'Erro ao salvar evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    throw error;
  }
}

/**
 * Curte ou descurte um evento
 * @param {number} eventId - ID do evento
 * @returns {Promise} Promise com o resultado { success, message, likeCount, userHasLiked }
 */
export async function toggleLikeEvent(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      // Tenta ler o corpo como texto para dar mais detalhes, se possível
      try {
        const errorBody = await response.text();
        // Verifica se o corpo parece ser JSON antes de tentar parse específico
        if (response.headers.get('content-type')?.includes('application/json')) {
          const errorData = JSON.parse(errorBody); // Parse manual se for JSON
          errorMessage = errorData.message || errorMessage;
        } else if (errorBody.length < 200) { // Mostra corpo se for curto e não JSON
          errorMessage += ` - ${errorBody}`;
        }
        // Se for HTML longo, não inclui no erro principal.
      } catch (parseError) {
        // Ignora erro ao tentar ler/parsear o corpo do erro
        console.warn("Não foi possível ler o corpo da resposta de erro.", parseError);
      }

      // Lança erro específico para 401
      if (response.status === 401) {
        throw new Error('Faça login para curtir eventos.');
      }

      throw new Error(errorMessage); // Lança o erro com a mensagem construída
    }
    // --- FIM DO BLOCO MODIFICADO ---

    // Se a resposta for OK (2xx), aí sim esperamos JSON
    return await response.json();

  } catch (error) {
    console.error('Erro ao curtir/descurtir evento:', error);
    throw error; // Re-lança o erro para ser tratado por quem chamou
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
 * Cria uma nova promoção para um evento
 * @param {Object} promotionData - Dados da promoção
 * @returns {Promise} Promise com a promoção criada
 */
export async function createPromotion(promotionData) {
  try {
    const response = await fetch(`${API_URL}/qrcode/promotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(promotionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar promoção');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    throw error;
  }
}

/**
 * Obtém promoções disponíveis para um evento
 * @param {number} eventId - ID do evento
 * @returns {Promise} Promise com as promoções disponíveis
 */
export async function getEventPromotions(eventId) {
  try {
    const response = await fetch(`${API_URL}/qrcode/promotions/${eventId}`);

    if (!response.ok) throw new Error('Erro ao buscar promoções');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return [];
  }
}

/**
 * Gera um QR Code personalizado para o usuário atual
 * @param {string} promotionId - ID da promoção
 * @returns {Promise} Promise com o QR Code gerado
 */
export async function generateUserQRCode(promotionId) {
  try {
    const response = await fetch(`${API_URL}/qrcode/generate/${promotionId}`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao gerar QR Code');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
}

/**
 * Obtém QR Codes gerados pelo usuário atual
 * @returns {Promise} Promise com os QR Codes do usuário
 */
export async function getUserQRCodes() {
  try {
    const response = await fetch(`${API_URL}/qrcode/my-qrcodes`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Erro ao buscar seus QR Codes');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar seus QR Codes:', error);
    return [];
  }
}

/**
 * Valida um QR Code (sem marcar como usado)
 * @param {string} qrCodeValue - Valor do QR Code
 * @returns {Promise} Promise com o resultado da validação
 */
export async function validateQRCode(qrCodeValue) {
  try {
    const response = await fetch(`${API_URL}/qrcode/validate/${qrCodeValue}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'QR Code inválido');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao validar QR Code:', error);
    throw error;
  }
}

/**
 * Marca um QR Code como utilizado
 * @param {string} qrCodeValue - Valor do QR Code
 * @returns {Promise} Promise com o resultado
 */
export async function useQRCode(qrCodeValue) {
  try {
    const response = await fetch(`${API_URL}/qrcode/use/${qrCodeValue}`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao utilizar QR Code');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao utilizar QR Code:', error);
    throw error;
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