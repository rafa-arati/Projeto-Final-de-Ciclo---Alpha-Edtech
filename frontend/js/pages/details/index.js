import { getEventById, getEventPromotions, getUserQRCodes } from '../../modules/events-api.js';
import { showMessage } from '../../modules/utils.js';
import { navigateTo } from '../../modules/router.js';
import { getLoggedInUser } from '../../modules/store.js';

// Importações dos módulos da pasta details
import { renderEventDisplay } from './event-display.js';
import { setupLikeButton } from './like-handler.js';
import { processVideos } from './media-handler.js';
import { renderPromotionsForUser } from './promotion-manager.js';
import { setupEventHandlers as setupQRCodeHandlers } from './qrcode-manager.js'; // Handlers dos modais Criar/Ver/Deletar
import { initializeStyles } from './styles.js';
import { renderQRCodeValidator, setupQRCodeValidator, addQRCodeValidatorStyles } from './qrcode-validator.js'; // Handlers do modal Scan

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
        // Carregar dados do evento
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
        let userQRCodes = []; // QR codes que o usuário gerou para ESTE evento
        let qrCodes = []; // Promoções/QR Codes para admins/premium (lista do modal 'Visualizar')

        if (user) {
            console.log("Usuário logado, buscando promoções e QR codes...");
            try {
                availablePromotions = await getEventPromotions(eventId);
                console.log(`Promoções disponíveis carregadas: ${availablePromotions.length}`);

                // Carregar todas as promoções/QR codes para admins/premium (para o modal 'Visualizar')
                if (canManageQrCodes) {
                     try {
                         // A API /qrcode/event/{eventId} deve retornar as *promoções* criadas
                         const qrUrl = `/api/qrcode/event/${eventId}`; // Endpoint correto pode variar
                         console.log("Carregando lista de promoções/QR Codes (admin/criador) de:", qrUrl);
                         const qrResponse = await fetch(qrUrl, { credentials: 'include' });
                         if (qrResponse.ok) {
                             qrCodes = await qrResponse.json(); // Assume que retorna um array de promoções
                             console.log("Lista de promoções (admin/criador) carregada:", qrCodes.length);
                         } else {
                             console.error("Erro ao carregar lista admin:", qrResponse.status);
                             qrCodes = [];
                         }
                     } catch (error) {
                         console.error('Erro ao carregar lista admin/criador:', error);
                         qrCodes = [];
                     }
                }


                // Busca TODOS os QR codes que o usuário já gerou
                const allUserQRCodes = await getUserQRCodes();
                if (allUserQRCodes && Array.isArray(allUserQRCodes)) {
                    const parsedEventId = parseInt(eventId, 10);
                    userQRCodes = allUserQRCodes.filter(qr => qr.event_id === parsedEventId);
                    console.log(`QR Codes do usuário para este evento (${eventId}): ${userQRCodes.length}`);
                } else {
                    console.warn("Resposta de getUserQRCodes inválida.");
                    userQRCodes = [];
                }
            } catch (error) {
                console.error('Erro ao carregar promoções ou QR codes do usuário:', error);
                showMessage('Erro ao carregar promoções/QR codes. Tente recarregar.', 'error');
                availablePromotions = []; userQRCodes = [];
            }
        } else {
            console.log("Usuário não logado. Não buscará promoções/QR codes.");
        }

        // Renderizar o HTML principal da página
        initializeStyles(); // Garante estilos CSS
        appContainer.innerHTML = renderEventDisplay(event, user, canManageQrCodes, userQRCodes, availablePromotions);

        // Configurar botão de edição do evento (se existir)
        const editButton = document.getElementById('edit-event-btn');
        if (editButton) {
             editButton.addEventListener('click', (e) => {
                 e.stopPropagation();
                 if (!user) { showMessage("Você precisa estar logado para editar eventos"); return; }
                 if (user.role === 'admin' || (user.role === 'premium' && String(event.creator_id) === String(user.id))) {
                     window.location.hash = `create-event?edit=${eventId}`;
                 } else {
                     showMessage("Você só pode editar seus próprios eventos");
                 }
             });
        }

        // Configurar handlers GERAIS da página de detalhes
        setupQRCodeHandlers(eventId, qrCodes); // Configura modais CRIAR/VER/DELETAR
        setupLikeButton(eventId, event); // Configura botão de like
        processVideos(event); // Processa e exibe vídeos

        

        // --- NOVA LÓGICA PARA O BOTÃO DE ABRIR O SCANNER ---
        const openScanButton = document.getElementById('open-scan-modal-btn');
        const scanModal = document.getElementById('scan-qrcode-modal');
        const scanModalContent = document.getElementById('scan-modal-content');
        const closeScanModalButton = document.getElementById('close-scan-modal');

        if (openScanButton && scanModal && scanModalContent && closeScanModalButton) {
            // Listener para ABRIR o modal
            openScanButton.addEventListener('click', () => {
                console.log("Abrindo modal de scan...");
                addQRCodeValidatorStyles(); // Garante estilos do validador
                scanModalContent.innerHTML = renderQRCodeValidator(); // Renderiza o conteúdo
                scanModal.classList.add('active'); // Mostra o modal

                // Inicializa o scanner DEPOIS que o modal está visível
                try {
                    setupQRCodeValidator(eventId); // Passa o eventId atual
                    console.log("setupQRCodeValidator chamado via modal.");
                } catch (error) {
                    console.error("Erro ao inicializar scanner no modal:", error);
                    showMessage("Erro ao iniciar scanner.", "error");
                    scanModal.classList.remove('active');
                }
            });

            // Listener para FECHAR o modal pelo botão X
            closeScanModalButton.addEventListener('click', () => {
                scanModal.classList.remove('active');
                const videoElem = document.getElementById('qr-video');
                if (videoElem && videoElem.srcObject) {
                    videoElem.srcObject.getTracks().forEach(track => track.stop());
                    videoElem.srcObject = null;
                    console.log("Câmera parada ao fechar modal.");
                }
            });

            // Listener para FECHAR o modal clicando fora
            const closeScanModalOnClickOutside = (event) => {
                if (scanModal && event.target === scanModal) {
                     scanModal.classList.remove('active');
                     const videoElem = document.getElementById('qr-video');
                     if (videoElem && videoElem.srcObject) {
                         videoElem.srcObject.getTracks().forEach(track => track.stop());
                         videoElem.srcObject = null;
                         console.log("Câmera parada ao fechar modal (click fora).");
                     }
                 }
             };
             // Limpa listener antigo para evitar duplicação
             window.removeEventListener("click", closeScanModalOnClickOutside);
             window.addEventListener("click", closeScanModalOnClickOutside);

        } else {
            // Log se algum elemento essencial para o modal de scan não for encontrado
            console.warn("Elementos para o modal de scan não foram encontrados:", {
                openScanButton: !!openScanButton,
                scanModal: !!scanModal,
                scanModalContent: !!scanModalContent,
                closeScanModalButton: !!closeScanModalButton
            });
        }

        const backButton = document.getElementById('details-back-button');
        if (backButton) {
            // Limpa listeners antigos (boa prática)
            const newBackButton = backButton.cloneNode(true);
            backButton.parentNode.replaceChild(newBackButton, backButton);

            // Adiciona o listener correto
            newBackButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
            console.log("Botão Voltar da página de detalhes configurado.");
        } else {
             // Verifica se o ID antigo ainda está sendo usado e avisa
             if(document.getElementById('back-button')) {
                  console.warn("Atenção: Botão Voltar encontrado com ID 'back-button', mas esperado 'details-back-button'. Verifique o HTML em event-display.js.");
              } else {
                  console.warn("Botão Voltar (#details-back-button) não encontrado na página de detalhes.");
              }
         }
        // --- FIM DA NOVA LÓGICA ---

        // Renderizar promoções para usuário comum (se aplicável)
        if (user && !canManageQrCodes) {
            console.log("Renderizando promoções para usuário comum...");
            renderPromotionsForUser(availablePromotions, userQRCodes);
        } else if (!user) {
            const userPromoContainer = document.getElementById('user-promotions-container');
            if (userPromoContainer) userPromoContainer.style.display = 'none';
        }

        console.log("Página de detalhes renderizada e handlers configurados.");

    } catch (error) {
        console.error('Erro fatal ao carregar detalhes do evento:', error);
        showMessage(error.message || 'Erro ao carregar detalhes do evento');
        appContainer.innerHTML = '<div class="error-message" style="text-align: center; padding: 40px; color: #e57373;">Erro ao carregar evento. Redirecionando...</div>';
        setTimeout(() => navigateTo('events'), 2000);
    }
}