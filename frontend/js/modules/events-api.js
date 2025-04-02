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
