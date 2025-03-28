// Lógica para modais

import { showMessage } from '../../modules/utils.js';
import { deleteEvent } from '../../modules/events-api.js';
import { eventos, currentEventId } from './index.js';
import { renderCarousels } from './renderers.js';
import { setupFilterModalEvents } from './eventHandlers.js';

/**
 * Configura todos os modais necessários
 */
export function setupModals() {
    console.log("Configurando modais");

    // Adicionar HTML dos modais ao DOM
    addModalsToDOM();

    // Configurar eventos do modal de filtros
    setupFilterModalEvents();

    // Configurar eventos do modal de exclusão
    setupDeleteModal();

    // Configurar eventos do modal de desenvolvimento
    setupDevelopmentModal();

    // Escutar por eventos para mostrar modais específicos
    document.addEventListener('showDeleteModal', (e) => {
        showDeleteConfirmation(e.detail.eventId);
    });

    console.log("Modais configurados com sucesso");
}

/**
 * Adiciona HTML dos modais ao DOM
 */
function addModalsToDOM() {
    console.log("Adicionando HTML dos modais ao DOM");

    // Verificar se os modais já existem para evitar duplicação
    if (document.getElementById('filter-modal')) {
        console.log("Modais já existem no DOM, pulando criação");
        return;
    }

    const modalsHTML = `
    <!-- Modal para filtros -->
    <div class="modal" id="filter-modal">
      <div class="modal-content" style="max-width: 500px;">
        <span class="close-modal" id="close-filter-modal">&times;</span>
        <h3>Filtrar Eventos</h3>
        
        <div class="filter-section">
          <h4>Categorias</h4>
          <div class="select-wrapper" style="margin-bottom: 15px;">
            <select id="filter-category" class="filter-select">
              <option value="">Todas as categorias</option>
              <!-- As categorias serão adicionadas dinamicamente -->
            </select>
          </div>
          
          <div id="subcategory-wrapper" style="margin-bottom: 15px; display: none;">
            <h4>Subcategorias</h4>
            <div class="select-wrapper">
              <select id="filter-subcategory" class="filter-select">
                <option value="">Todas as subcategorias</option>
                <!-- As subcategorias serão adicionadas dinamicamente -->
              </select>
            </div>
          </div>
        </div>
        
        <div class="filter-section">
          <h4>Período</h4>
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1;">
              <label for="filter-start-date">De</label>
              <input type="date" id="filter-start-date" class="filter-date">
            </div>
            <div style="flex: 1;">
              <label for="filter-end-date">Até</label>
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

    <!-- Modal para confirmação de exclusão -->
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
    
    <!-- Modal para recursos em desenvolvimento -->
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
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'events-modals';
    modalsContainer.innerHTML = modalsHTML;
    document.body.appendChild(modalsContainer);

    console.log("Modais adicionados ao DOM com sucesso");
}

/**
 * Configura o modal de exclusão
 */
function setupDeleteModal() {
    const deleteModal = document.getElementById("delete-modal");
    const closeDeleteModal = document.getElementById("close-delete-modal");
    const confirmDeleteBtn = document.getElementById("confirm-delete");
    const cancelDeleteBtn = document.getElementById("cancel-delete");

    if (!deleteModal || !closeDeleteModal || !confirmDeleteBtn || !cancelDeleteBtn) {
        console.error("Elementos do modal de exclusão não encontrados");
        return;
    }

    closeDeleteModal.addEventListener("click", () => {
        deleteModal.classList.remove("active");
    });

    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.classList.remove("active");
    });

    confirmDeleteBtn.addEventListener("click", async () => {
        if (!currentEventId) return;

        try {
            // Executar exclusão
            await deleteEvent(currentEventId);

            // Atualizar lista local
            const index = eventos.findIndex(e => e.id === currentEventId);
            if (index !== -1) {
                eventos.splice(index, 1);
            }

            // Atualizar interface
            renderCarousels();

            // Feedback
            showMessage("Evento excluído com sucesso!");
        } catch (error) {
            console.error("Falha na exclusão:", error);
            showMessage(error.message || "Falha ao excluir evento");
        } finally {
            // Fechar modal
            deleteModal.classList.remove("active");
        }
    });

    // Fechar ao clicar fora do modal
    window.addEventListener("click", (event) => {
        if (event.target === deleteModal) {
            deleteModal.classList.remove("active");
        }
    });
}

/**
 * Configura o modal de funcionalidades em desenvolvimento
 */
function setupDevelopmentModal() {
    const modal = document.getElementById("development-modal");
    const closeModal = document.getElementById("close-development-modal");
    const okBtn = document.getElementById("ok-development");

    if (!modal || !closeModal || !okBtn) {
        console.error("Elementos do modal de desenvolvimento não encontrados");
        return;
    }

    closeModal.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    okBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Fechar ao clicar fora do modal
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });
}

/**
 * Mostra o modal de confirmação de exclusão
 */
export function showDeleteConfirmation(eventId) {
    const deleteModal = document.getElementById("delete-modal");
    if (!deleteModal) {
        console.error("Modal de exclusão não encontrado");
        return;
    }

    // Armazenar o ID do evento a ser excluído
    window.currentEventId = eventId;

    // Mostrar o modal
    deleteModal.classList.add("active");
}

/**
 * Mostra o modal de desenvolvimento
 */
export function showDevelopmentModal() {
    const modal = document.getElementById("development-modal");
    if (!modal) {
        console.error("Modal de desenvolvimento não encontrado");
        return;
    }

    modal.classList.add("active");
}