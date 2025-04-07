import { getEventById, getEventPromotions, getUserQRCodes } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { navigateTo } from '../../modules/router.js';
import { getLoggedInUser } from '../../modules/store.js';

import { renderEventDisplay } from './event-display.js';
import { setupLikeButton } from './like-handler.js';
import { processVideos } from './media-handler.js';
import { renderPromotionsForUser } from './promotion-manager.js';
import { setupEventHandlers } from './qrcode-manager.js';
import { initializeStyles } from './styles.js';

import { renderQRCodeValidator, setupQRCodeValidator, addQRCodeValidatorStyles } from './qrcode-validator.js';

/**
 * Renderiza a página de detalhes do evento
 * @param {URLSearchParams} queryParams - Parâmetros da URL
 */
export default async function renderEventDetails(queryParams) {
  const appContainer = document.getElementById('app');
  const eventId = queryParams.get('id');
  const user = getLoggedInUser();

  if (!eventId) {
    showMessage('Evento não encontrado');
    navigateTo('events');
    return;
  }

  try {
    // Carregar dados do evento
    const event = await getEventById(eventId);
    if (!event) {
      showMessage('Evento não encontrado');
      navigateTo('events');
      return;
    }

    // Determinar se o usuário pode gerenciar QR Codes
    const canManageQrCodes = (user?.role === 'admin' ||
      (user?.role === 'premium' && user?.id === event.creator_id));

    // Carregar promoções se usuário estiver logado
    let promotions = [];
    if (user) {
      try {
        promotions = await getEventPromotions(eventId);
      } catch (error) {
        console.error('Erro ao carregar promoções:', error);
      }
    }

    // Carregar QR Codes para o usuário
    let qrCodes = [];
    let userQRCodes = [];

    // Carregar QR Codes para admins/premium
    if (canManageQrCodes) {
      try {
        const qrUrl = `/api/qrcode/event/${eventId}`;
        console.log("Tentando carregar QR Codes de:", qrUrl);

        const qrResponse = await fetch(qrUrl, {
          credentials: 'include'
        });

        if (qrResponse.ok) {
          const contentType = qrResponse.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            qrCodes = await qrResponse.json();
            console.log("QR Codes carregados:", qrCodes.length);
          } else {
            console.error("Resposta não é JSON:", await qrResponse.text());
            qrCodes = [];
          }
        } else {
          console.error("Resposta não ok:", qrResponse.status, await qrResponse.text());
          qrCodes = [];
        }
      } catch (error) {
        console.error('Erro ao carregar QR Codes:', error);
        qrCodes = [];
      }
    }

    // Carregar QR Codes gerados pelo usuário
    if (user) {
      try {
        console.log("Tentando carregar QR Codes para o usuário:", user.id);

        const userQRResponse = await getUserQRCodes();

        if (userQRResponse && Array.isArray(userQRResponse)) {
          userQRCodes = userQRResponse;

          // Filtrar apenas os deste evento
          const parsedEventId = parseInt(eventId);
          userQRCodes = userQRCodes.filter(qr => {
            return qr.event_id === parsedEventId;
          });

          console.log("QR Codes do usuário após filtragem:", userQRCodes.length);
        } else {
          console.error("Resposta não é um array ou está vazia:", userQRResponse);
          userQRCodes = [];
        }
      } catch (error) {
        console.error('Erro ao carregar QR Codes do usuário:', error);
        userQRCodes = [];
      }
    }

    // Inicializar estilos
    initializeStyles();

    // Renderizar o HTML principal da página
    appContainer.innerHTML = renderEventDisplay(event, user, canManageQrCodes, userQRCodes);

    // Adicionar validador de QR Code para admins/premium
    if (user && (user.role === 'admin' || user.role === 'premium')) {
      // Adicionar a seção de validação logo após as ações do criador
      const creatorActionsSection = document.querySelector('.creator-actions');
      if (creatorActionsSection) {
        const validatorHTML = renderQRCodeValidator();
        const validatorSection = document.createElement('div');
        validatorSection.innerHTML = validatorHTML;
        creatorActionsSection.after(validatorSection.firstElementChild);

        // Adicionar estilos e configurar os eventos
        addQRCodeValidatorStyles();
        setupQRCodeValidator();
      }
    }
    // Configurar componentes interativos
    setupEventHandlers(eventId, qrCodes);
    setupLikeButton(eventId, event);
    processVideos(event);

    // Renderizar promoções para usuários comuns
    if (user && !canManageQrCodes) {
      renderPromotionsForUser(promotions, userQRCodes);
    }

  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    showMessage(error.message || 'Erro ao carregar detalhes do evento');
    navigateTo('events');
  }
}