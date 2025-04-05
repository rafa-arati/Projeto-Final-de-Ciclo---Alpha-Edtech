import { toggleLikeEvent } from '../../modules/events-api.js';
import { getLoggedInUser } from '../../modules/store.js';
import { showMessage } from '../../modules/utils.js';

/**
 * Configura o botão de curtir
 * @param {string} eventId - ID do evento
 * @param {Object} event - Dados do evento
 */
export function setupLikeButton(eventId, event) {
    const likeButton = document.getElementById('like-button');
    const likeCountSpan = document.getElementById('like-count');
    const user = getLoggedInUser();

    if (!likeButton || !likeCountSpan) return;

    if (user) {
        // Configurar o estado inicial do botão de curtir
        if (event.userHasLiked === true) {
            likeButton.classList.add('active');
            likeButton.setAttribute('aria-pressed', 'true');
        } else {
            likeButton.classList.remove('active');
            likeButton.setAttribute('aria-pressed', 'false');
        }

        // Adicionar o evento de clique
        likeButton.addEventListener('click', () => handleLikeClick(eventId));
    } else {
        // Usuário não logado: desabilitar botão
        likeButton.disabled = true;
        likeButton.style.opacity = 0.5;
        likeButton.title = "Faça login para curtir";
    }
}

/**
 * Manipulador de clique no botão de curtir
 * @param {string} eventId - ID do evento
 */
async function handleLikeClick(eventId) {
    const likeButton = document.getElementById('like-button');
    const likeCountSpan = document.getElementById('like-count');

    if (!likeButton || !likeCountSpan) return;

    // Desabilitar botão durante a requisição
    likeButton.disabled = true;
    likeButton.style.opacity = 0.7;

    try {
        const result = await toggleLikeEvent(eventId);

        // Atualizar a UI com a resposta da API
        likeCountSpan.textContent = result.likeCount;
        if (result.userHasLiked) {
            likeButton.classList.add('active');
            likeButton.setAttribute('aria-pressed', 'true');
        } else {
            likeButton.classList.remove('active');
            likeButton.setAttribute('aria-pressed', 'false');
        }
    } catch (error) {
        console.error("Erro no handleLikeClick:", error);
        showMessage(error.message || 'Erro ao processar o like. Tente novamente.');
    } finally {
        // Reabilitar botão após a requisição
        if (getLoggedInUser()) {
            likeButton.disabled = false;
            likeButton.style.opacity = 1;
        }
    }
}