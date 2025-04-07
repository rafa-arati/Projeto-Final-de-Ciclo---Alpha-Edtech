import { getEventById, getEventPromotions, getUserQRCodes } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { navigateTo } from '../../modules/router.js';
import { getLoggedInUser } from '../../modules/store.js';

import { renderEventDisplay } from './event-display.js';
import { setupLikeButton } from './like-handler.js';
import { processVideos } from './media-handler.js';
import { renderPromotionsForUser } from './promotion-manager.js';
import { setupEventHandlers as setupQRCodeHandlers } from './qrcode-manager.js'; // Renomeado para clareza
import { initializeStyles } from './styles.js';

import { renderQRCodeValidator, setupQRCodeValidator, addQRCodeValidatorStyles } from './qrcode-validator.js';

/**
 * Renderiza a página de detalhes do evento
 * @param {URLSearchParams} queryParams - Parâmetros da URL
 */
export default async function renderEventDetails(queryParams) {
    const appContainer = document.getElementById('app');
    const eventId = queryParams.get('id');
    const user = getLoggedInUser(); // Pega usuário do localStorage

    if (!eventId) {
        showMessage('Evento não encontrado');
        navigateTo('events');
        return;
    }

    if (!appContainer) {
        console.error("Elemento #app não encontrado no DOM.");
        return;
    }

    // Limpa o conteúdo anterior e mostra mensagem de carregamento
    appContainer.innerHTML = '<div class="loading-message" style="text-align: center; padding: 40px; color: #aaa;">Carregando detalhes do evento...</div>';

    try {
        // Carregar dados do evento (inclui like status se user estiver logado)
        console.log(`Buscando detalhes do evento ID: ${eventId}`);
        const event = await getEventById(eventId);
        if (!event) {
            showMessage('Evento não encontrado');
            navigateTo('events');
            return;
        }
        console.log("Detalhes do evento carregados:", event);

        // Determinar se o usuário pode gerenciar QR Codes
        const creatorId = event.creator_id ? parseInt(event.creator_id, 10) : null;
        const userId = user ? parseInt(user.id, 10) : null;
        const canManageQrCodes = (user?.role === 'admin') || (user?.role === 'premium' && userId === creatorId);
        console.log(`Pode gerenciar QR Codes: ${canManageQrCodes}`);

        // Carregar promoções e QR Codes do usuário (APENAS SE LOGADO)
        let availablePromotions = [];
        let userQRCodes = []; // Array que conterá os QR codes já gerados pelo usuário PARA ESTE EVENTO
        let qrCodes = []; // QR Codes para admins/premium

        if (user) {
            console.log("Usuário logado, buscando promoções e QR codes...");
            try {
                // Busca todas as promoções disponíveis para este evento
                availablePromotions = await getEventPromotions(eventId);
                console.log(`Promoções disponíveis carregadas: ${availablePromotions.length}`);

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

                // Busca TODOS os QR codes que o usuário já gerou (para qualquer evento)
                try {
                    const allUserQRCodes = await getUserQRCodes(); // Assume que esta função busca todos do usuário

                    // Filtra para pegar apenas os QR codes DESTE evento
                    if (allUserQRCodes && Array.isArray(allUserQRCodes)) {
                        const parsedEventId = parseInt(eventId, 10);
                        userQRCodes = allUserQRCodes.filter(qr => qr.event_id === parsedEventId);
                        console.log(`QR Codes do usuário para este evento (${eventId}): ${userQRCodes.length}`);
                    } else {
                        console.warn("Não foi possível obter QR Codes do usuário ou a resposta não foi um array.");
                        userQRCodes = []; // Garante que seja um array vazio
                    }
                } catch (error) {
                    console.error('Erro ao carregar QR Codes do usuário:', error);
                    userQRCodes = [];
                }
            } catch (error) {
                console.error('Erro ao carregar promoções ou QR codes do usuário:', error);
                showMessage('Erro ao carregar promoções/QR codes. Tente recarregar.', 'error');
                availablePromotions = []; // Garante que seja um array vazio em caso de erro
                userQRCodes = []; // Garante que seja um array vazio em caso de erro
            }
        } else {
            console.log("Usuário não logado. Não buscará promoções/QR codes.");
        }

        // Inicializar estilos CSS necessários para esta página
        initializeStyles();

        // Renderizar o HTML principal da página, passando os dados carregados
        // *** userQRCodes é passado aqui ***
        appContainer.innerHTML = renderEventDisplay(event, user, canManageQrCodes, userQRCodes, availablePromotions);

        // Configurar botão de edição do evento
        const editButton = document.getElementById('edit-event-btn');
        if (editButton) {
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Impedir propagação do evento

                // Verificar permissões
                if (!user) {
                    showMessage("Você precisa estar logado para editar eventos");
                    return;
                }

                if (user.role === 'admin' || (user.role === 'premium' && event.creator_id &&
                    user.id && event.creator_id.toString() === user.id.toString())) {
                    // Usar o formato exato da URL que funciona em seu sistema
                    window.location.hash = `create-event?edit=${eventId}`;
                } else {
                    showMessage("Você só pode editar seus próprios eventos");
                }
            });
        }

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

        // Configurar componentes interativos APÓS o HTML ser renderizado
        console.log("Configurando handlers...");
        setupQRCodeHandlers(eventId, qrCodes); // Configurar com os QR codes carregados
        setupLikeButton(eventId, event); // Configura botão de like
        processVideos(event); // Processa e exibe vídeos

        // Renderizar a seção de promoções para o usuário comum (se logado e não for admin/criador)
        if (user && !canManageQrCodes) {
            console.log("Renderizando promoções para usuário comum...");
            // Passa as promoções disponíveis E os QRCodes que o usuário já tem
            renderPromotionsForUser(availablePromotions, userQRCodes);
        } else if (user && canManageQrCodes) {
            console.log("Usuário é admin/criador, não renderizando seção de promoções de usuário.");
        } else {
            // Esconder o container se o usuário não estiver logado
            const userPromoContainer = document.getElementById('user-promotions-container');
            if(userPromoContainer) userPromoContainer.style.display = 'none';
        }

        console.log("Página de detalhes renderizada com sucesso.");

    } catch (error) {
        console.error('Erro fatal ao carregar detalhes do evento:', error);
        showMessage(error.message || 'Erro ao carregar detalhes do evento');
        // Limpa o container e redireciona se houver erro crítico
        appContainer.innerHTML = '<div class="error-message" style="text-align: center; padding: 40px; color: #e57373;">Erro ao carregar evento. Redirecionando...</div>';
        setTimeout(() => navigateTo('events'), 2000);
    }
}