import { navigateTo } from '../modules/router.js';
import { showMessage, transitionToPage } from '../modules/utils.js';
import { getLoggedInUser, isAdmin } from '../modules/store.js';
import { setupImagePreview, setupCancelModal } from '../modules/form-utils.js';
import { getEventById, saveEvent } from '../modules/events-api.js';

export default function renderCreateEvent(queryParams) {
  if (!isAdmin()) {
    navigateTo('events');
    return;
  }

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Modo de edição (agora pegando direto da URL)
  const eventId = queryParams.get('edit');
  const isEditing = !!eventId;

  // Título dinâmico
  const titulo = isEditing ? 'Editar Evento' : 'Criar Novo Evento';
  const btnText = isEditing ? 'Salvar Alterações' : 'Adicionar Evento';

  appContainer.innerHTML = `
        <div class="header">
            <a href="#" id="voltar-btn" class="back-button">←</a>
            <h1>${titulo}</h1>
        </div>
        <form id="criarEventoForm">
            <input type="hidden" id="eventoId" value="${eventId || ''}">
            
            <div class="left-column">
                <div class="form-group">
                    <label for="nome">Nome do evento</label>
                    <input type="text" id="nome" name="nome" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="data">Data</label>
                        <input type="date" id="data" name="data" required>
                    </div>
                    <div class="form-group">
                        <label for="horario">Horário</label>
                        <input type="time" id="horario" name="horario">
                    </div>
                    <div class="form-group">
                        <label for="categoria">Categoria</label>
                        <input type="text" id="categoria" name="categoria">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="localizacao">Localização</label>
                    <input type="text" id="localizacao" name="localizacao" required>
                </div>
                
                <div class="form-group">
                    <label for="link">Link</label>
                    <input type="url" id="link" name="link">
                </div>
                
                <div class="form-group">
                    <label for="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao" rows="5"></textarea>
                </div>
            </div>
            
            <div class="right-column">
                <div>
                    <div id="previewImagem" class="image-preview">
                        <img id="imagemPrevia" src="#" alt="" style="display: none;">
                    </div>
                    
                    <button type="button" class="add-photo-button" id="btnAdicionarFoto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/>
                        </svg>
                        Adicionar Foto
                    </button>
                    <input type="file" id="imagem" name="imagem" accept="image/*" style="display: none;">
                </div>
                
                <div class="form-buttons">
                    <button type="submit" class="primary-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white"/>
                        </svg>
                        ${btnText}
                    </button>
                    <button type="button" class="secondary-button" id="cancelarEvento">Cancelar</button>
                </div>
            </div>
        </form>

        <!-- Modal de confirmação para cancelar evento -->
        <div class="modal" id="cancelarModal">
            <div class="modal-content">
                <span class="close-modal" id="fecharCancelarModal">&times;</span>
                <h3>Confirmar cancelamento</h3>
                <p>Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.</p>
                <div class="modal-buttons">
                    <button id="confirmarCancelar" class="btn">Sim, cancelar</button>
                    <button id="negarCancelar" class="btn secondary">Não, continuar editando</button>
                </div>
            </div>
        </div>
    `;

  setupForm(isEditing, eventId);
}

async function setupForm(isEditing, eventId) {
  const form = document.getElementById('criarEventoForm');
  if (!form) return;

  setupImagePreview('imagem', 'imagemPrevia', 'btnAdicionarFoto');
  setupCancelModal('cancelarModal', {
    cancelButtonId: 'cancelarEvento',
    closeButtonId: 'fecharCancelarModal',
    confirmButtonId: 'confirmarCancelar',
    denyButtonId: 'negarCancelar',
    onConfirm: () => transitionToPage('create-event', 'events')
  });

  // Carrega dados se for edição
  if (isEditing && eventId) {
    try {
      const evento = await getEventById(eventId);
      fillForm(evento);
    } catch (error) {
      showMessage('Falha ao carregar evento para edição');
      console.error(error);
      navigateTo('events'); // Redireciona se falhar
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSubmit(form, eventId); // Simplificado - não precisa mais do isEditing
  });
}

async function handleSubmit(form, eventId) {
  const formData = new FormData(form);

  try {
    await saveEvent(formData, eventId || null); // Usa sua função inteligente do events-api.js

    showMessage(eventId ? 'Evento atualizado!' : 'Evento criado!', 'success');
    setTimeout(() => navigateTo('events'), 1500);
  } catch (error) {
    showMessage(error.message || 'Erro no processamento', 'error');
    console.error(error);
  }
}

// Mantenha sua função fillForm exatamente como está
function fillForm(evento) {
  document.getElementById('nome').value = evento.event_name || '';

  if (evento.event_date) {
    const date = new Date(evento.event_date);
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById('data').value = formattedDate;
  }

  document.getElementById('horario').value = evento.event_time || '';
  document.getElementById('categoria').value = evento.category || '';
  document.getElementById('localizacao').value = evento.location || '';
  document.getElementById('link').value = evento.event_link || '';
  document.getElementById('descricao').value = evento.description || '';

  const imagemPrevia = document.getElementById('imagemPrevia');
  if (evento.photo_url) {
    imagemPrevia.src = evento.photo_url;
    imagemPrevia.style.display = 'block';
  }
}

// Mantenha seu event listener para o botão voltar
document.addEventListener('click', (e) => {
  if (e.target.closest('#voltar-btn')) {
    e.preventDefault();
    transitionToPage('create-event', 'events');
  }
});