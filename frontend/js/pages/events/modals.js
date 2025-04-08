// Lógica para modais

import { showMessage } from '../../modules/utils.js';
import { deleteEvent } from '../../modules/events-api.js';
// Certifique-se que 'eventos' está sendo exportado de './index.js' ou de onde for apropriado
// Exemplo: import { eventos } from './dataLoader.js'; ou import { eventos } from './index.js';
import { eventos } from './index.js'; // Ajuste este import se 'eventos' vier de outro lugar
import { renderCarousels } from './renderers.js';
// Importa as funções necessárias de eventHandlers.js
import { setupFilterModalEvents, initializeCarouselVisibility } from './eventHandlers.js';

// Variável no escopo do módulo para armazenar o ID do evento a ser excluído
let currentEventIdToDelete = null;

// --- Funções Auxiliares ---

// Função separada para o handler do evento showDeleteModal
function handleShowDeleteModal(e) {
  const deleteModal = document.getElementById("delete-modal");
  if (!deleteModal) {
    console.error("Modal de exclusão não encontrado ao tentar mostrar.");
    return;
  }
  // Armazena o ID no escopo do módulo
  currentEventIdToDelete = e.detail.eventId;
  deleteModal.classList.add('active');
}

// Função auxiliar para fechar modal de desenvolvimento ao clicar fora
function closeDevModalOnClickOutside(event) {
  const modal = document.getElementById("development-modal");
  // Verifica se o modal existe e se o clique foi fora do conteúdo do modal
  if (modal && event.target === modal) {
    modal.classList.remove("active");
  }
}

// Função auxiliar para fechar modal de filtros ao clicar fora
function closeFilterModalOnClickOutside(event) {
  const filterModal = document.getElementById("filter-modal");
  if (filterModal && event.target === filterModal) {
    filterModal.classList.remove("active");
  }
}

// --- Funções de Configuração dos Modais ---

/**
 * Adiciona HTML dos modais ao DOM, se ainda não existirem.
 */
function addModalsToDOM() {
  // Verifica se o container dos modais já existe
  if (document.getElementById('events-modals-container')) {
    console.log("Container de modais já existe no DOM.");
    return;
  }

  console.log("Adicionando HTML dos modais ao DOM...");
  const modalsContainer = document.createElement('div');
  modalsContainer.id = 'events-modals-container'; // ID para o container

  modalsContainer.innerHTML = `
      <div class="modal" id="filter-modal">
        <div class="modal-content" style="max-width: 500px;">
          <span class="close-modal" id="close-filter-modal">&times;</span>
          <h3>Filtrar Eventos</h3>

          <div class="filter-section">
            <h4>Categorias</h4>
            <div class="select-wrapper" style="margin-bottom: 15px;">
              <select id="filter-category" class="filter-select">
                <option value="">Todas as categorias</option>
                </select>
            </div>

            <div id="subcategory-wrapper" style="margin-bottom: 15px; display: none;">
              <h4>Subcategorias</h4>
              <div class="select-wrapper">
                <select id="filter-subcategory" class="filter-select">
                  <option value="">Todas as subcategorias</option>
                  </select>
              </div>
            </div>
          </div>

          <div class="filter-section">
            <h4>Período</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
              <div style="flex: 1;">
                <label for="filter-start-date" style="display: block; margin-bottom: 5px; font-size: 12px; color: #aaa;">De</label>
                <input type="date" id="filter-start-date" class="filter-date">
              </div>
              <div style="flex: 1;">
                <label for="filter-end-date" style="display: block; margin-bottom: 5px; font-size: 12px; color: #aaa;">Até</label>
                <input type="date" id="filter-end-date" class="filter-date">
              </div>
            </div>
          </div>

          <div class="modal-buttons">
            <button id="apply-filters" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF);">Aplicar Filtros</button>
            <button id="reset-filters" class="btn secondary">Limpar Filtros</button>
          </div>
        </div>
      </div>

      <div class="modal" id="delete-modal">
        <div class="modal-content">
          <span class="close-modal" id="close-delete-modal">&times;</span>
          <h3>Confirmar exclusão</h3>
          <p>Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.</p>
          <div class="modal-buttons">
            <button id="confirm-delete" class="btn" style="background-color: #B33A3A;">Sim, excluir</button>
            <button id="cancel-delete" class="btn secondary">Cancelar</button>
          </div>
        </div>
      </div>

      <div class="modal" id="development-modal">
        <div class="modal-content">
          <span class="close-modal" id="close-development-modal">&times;</span>
          <h3>Funcionalidade em Desenvolvimento</h3>
          <p>Esta funcionalidade está sendo implementada e estará disponível em breve!</p>
          <div class="modal-buttons">
            <button id="ok-development" class="btn">Entendi</button>
          </div>
        </div>
      </div>
    `;
  // Adicionar os modais ao final do body
  document.body.appendChild(modalsContainer);
  console.log("Modais adicionados ao DOM.");
}

/**
 * Configura o modal de exclusão
 */
function setupDeleteModal() {
  console.log("Configurando modal de exclusão...");
  const deleteModal = document.getElementById("delete-modal");
  const closeDeleteModalBtn = document.getElementById("close-delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");

  if (!deleteModal || !closeDeleteModalBtn || !confirmDeleteBtn || !cancelDeleteBtn) {
    console.error("Elementos do modal de exclusão não encontrados. A configuração será pulada.");
    return;
  }

  // Função para fechar o modal de exclusão
  const closeModal = () => {
    if (deleteModal) {
      deleteModal.classList.remove("active");
      currentEventIdToDelete = null; // Limpa o ID ao fechar
    }
  };

  // Reatribui listeners usando cloneNode para garantir limpeza
  const newCloseDeleteModalBtn = closeDeleteModalBtn.cloneNode(true);
  closeDeleteModalBtn.parentNode.replaceChild(newCloseDeleteModalBtn, closeDeleteModalBtn);
  newCloseDeleteModalBtn.addEventListener("click", closeModal);

  const newCancelDeleteBtn = cancelDeleteBtn.cloneNode(true);
  cancelDeleteBtn.parentNode.replaceChild(newCancelDeleteBtn, cancelDeleteBtn);
  newCancelDeleteBtn.addEventListener("click", closeModal);

  const newConfirmDeleteBtn = confirmDeleteBtn.cloneNode(true);
  confirmDeleteBtn.parentNode.replaceChild(newConfirmDeleteBtn, confirmDeleteBtn);
  newConfirmDeleteBtn.addEventListener("click", async () => {
    const eventIdToDelete = currentEventIdToDelete; // Usa o ID armazenado
    if (!eventIdToDelete) {
      console.warn("Nenhum ID de evento para excluir.");
      closeModal();
      return;
    }

    console.log(`Confirmação de exclusão para evento ID: ${eventIdToDelete}`);
    newConfirmDeleteBtn.disabled = true;
    newConfirmDeleteBtn.textContent = 'Excluindo...';

    try {
      // 1. Executar exclusão na API
      await deleteEvent(eventIdToDelete);

      // 2. Atualizar o array local 'eventos'
      const initialLength = eventos.length;
      const index = eventos.findIndex(e => e.id === parseInt(eventIdToDelete));
      if (index !== -1) {
        eventos.splice(index, 1);
        console.log(`Evento ${eventIdToDelete} removido do array local. Tamanho anterior: ${initialLength}, Novo tamanho: ${eventos.length}`);
      } else {
        console.warn(`Evento com ID ${eventIdToDelete} não encontrado na lista local após exclusão bem-sucedida.`);
      }

      // 3. Atualizar interface - Renderizar carrosséis novamente
      console.log("Renderizando carrosséis após exclusão...");
      renderCarousels(); // <<-- Redesenha os carrosséis

      // 4. *** REAVALIAR VISIBILIDADE DAS SETAS ***
      console.log("Atualizando visibilidade das setas após exclusão...");
      initializeCarouselVisibility(); // <<-- Chama a atualização das setas

      // 5. Feedback para o usuário
      showMessage("Evento excluído com sucesso!");

    } catch (error) {
      console.error("Falha na exclusão:", error);
      showMessage(error.message || "Falha ao excluir evento");
    } finally {
      // Restaurar botão e fechar modal
      newConfirmDeleteBtn.disabled = false;
      newConfirmDeleteBtn.textContent = 'Sim, excluir';
      closeModal(); // Fecha o modal e limpa o ID
    }
  });
  console.log("Modal de exclusão configurado.");
}

/**
 * Configura o modal de funcionalidades em desenvolvimento
 */
function setupDevelopmentModal() {
  console.log("Configurando modal de desenvolvimento...");
  const modal = document.getElementById("development-modal");
  const closeModalBtn = document.getElementById("close-development-modal");
  const okBtn = document.getElementById("ok-development");

  if (!modal || !closeModalBtn || !okBtn) {
    console.error("Elementos do modal de desenvolvimento não encontrados.");
    return;
  }

  const closeModalFunc = () => modal.classList.remove("active");

  // Limpar listeners antigos
  const newCloseModalBtn = closeModalBtn.cloneNode(true);
  closeModalBtn.parentNode.replaceChild(newCloseModalBtn, closeModalBtn);
  newCloseModalBtn.addEventListener("click", closeModalFunc);

  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  newOkBtn.addEventListener("click", closeModalFunc);

  // Fechar ao clicar fora do modal
  window.removeEventListener("click", closeDevModalOnClickOutside); // Remove anterior se houver
  window.addEventListener("click", closeDevModalOnClickOutside);
  console.log("Modal de desenvolvimento configurado.");
}


// --- Função Principal Exportada ---

/**
 * Configura todos os modais necessários para a página de eventos.
 */
export function setupModals() {
  console.log("Executando setupModals...");

  // Garante que o HTML dos modais exista no DOM
  addModalsToDOM();

  // Configura os eventos para cada modal
  try {
    // Modal de Filtros
    setupFilterModalEvents();
    // Modal de Exclusão
    setupDeleteModal();

    // Modal de Desenvolvimento
    setupDevelopmentModal();

    // Listener para o evento personalizado que dispara a exibição do modal de exclusão
    document.removeEventListener('showDeleteModal', handleShowDeleteModal); // Limpa listener antigo
    document.addEventListener('showDeleteModal', handleShowDeleteModal); // Adiciona novo

    // Adiciona listener para fechar modal de filtro ao clicar fora
    window.removeEventListener("click", closeFilterModalOnClickOutside);
    window.addEventListener("click", closeFilterModalOnClickOutside);


  } catch (error) {
    console.error("Erro geral durante a configuração dos modais:", error);
  }


  console.log("Configuração de Modais concluída.");
}

/**
 * Mostra o modal de desenvolvimento (pode ser chamada de outros lugares).
 */
export function showDevelopmentModal() {
  const modal = document.getElementById("development-modal");
  if (!modal) {
    console.error("Modal de desenvolvimento não encontrado ao tentar mostrar.");
    return;
  }
  modal.classList.add("active");
}

// NOTA: A função showDeleteConfirmation foi removida pois sua lógica
// está agora dentro do listener do evento 'showDeleteModal'. 