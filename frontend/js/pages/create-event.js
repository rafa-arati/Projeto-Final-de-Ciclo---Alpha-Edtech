import { navigateTo } from '../modules/router.js';
import { showMessage, transitionToPage } from '../modules/utils.js';
import { getLoggedInUser, isAdmin, isPremiumOrAdmin } from '../modules/store.js';
import { setupImagePreview, setupCancelModal } from '../modules/form-utils.js';
import { getEventById, saveEvent, fetchCategoriesWithSubcategories } from '../modules/events-api.js';

// Variáveis globais
let categorias = [];

export default async function renderCreateEvent(queryParams) {
  // Verificar se o usuário é administrador ou usuário premium
  if (!isPremiumOrAdmin()) {
    navigateTo('events');
    showMessage('Acesso negado. Você precisa ser administrador ou usuário premium para criar eventos.');
    return;
  }

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Modo de edição
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
          <label for="titulo">Nome do evento</label>
          <input type="text" id="titulo" name="title" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="data">Data</label>
            <input type="date" id="data" name="start_date" required>
          </div>
          <div class="form-group">
            <label for="horario">Horário</label>
            <input type="time" id="horario" name="start_time">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="categoria">Categoria</label>
            <select id="categoria" name="category_id" required>
              <option value="">Selecione uma categoria</option>
              <!-- As categorias serão adicionadas via JavaScript -->
            </select>
          </div>
          <div class="form-group" id="subcategoria-container" style="display: none;">
            <label for="subcategoria">Subcategoria</label>
            <select id="subcategoria" name="subcategory_id">
              <option value="">Selecione uma subcategoria</option>
              <!-- As subcategorias serão adicionadas via JavaScript -->
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="localizacao">Localização</label>
          <input type="text" id="localizacao" name="location" required>
        </div>
        
        <div class="form-group">
          <label for="link">Link</label>
          <input type="url" id="link" name="event_link">
        </div>
        
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" name="description" rows="5"></textarea>
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

    <!-- Mensagem de sucesso/erro -->
    <div id="message" class="message" style="display: none;"></div>
  `;

  await setupForm(isEditing, eventId);
}

// Inicialização do formulário
async function setupForm(isEditing, eventId) {
  const form = document.getElementById('criarEventoForm');
  if (!form) return;

  // Configurar preview de imagem
  setupImagePreview('imagem', 'imagemPrevia', 'btnAdicionarFoto');

  // Configurar modal de cancelamento
  setupCancelModal('cancelarModal', {
    cancelButtonId: 'cancelarEvento',
    closeButtonId: 'fecharCancelarModal',
    confirmButtonId: 'confirmarCancelar',
    denyButtonId: 'negarCancelar',
    onConfirm: () => navigateTo('events')
  });

  // Botão de voltar
  document.getElementById('voltar-btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('events');
  });

  try {
    // Carregar categorias e subcategorias
    await loadCategoriesAndSubcategories();

    // Configurar evento de change para categoria
    document.getElementById('categoria').addEventListener('change', updateSubcategories);

    // Carregar dados se for edição
    if (isEditing && eventId) {
      await loadEventForEditing(eventId);
    }

    // Configurar envio do formulário
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSubmit(form, eventId);
    });
  } catch (error) {
    console.error('Erro ao configurar formulário:', error);
    showMessage('Ocorreu um erro ao carregar o formulário. Tente novamente.');
  }
}

// Carrega categorias e subcategorias
async function loadCategoriesAndSubcategories() {
  try {
    categorias = await fetchCategoriesWithSubcategories();

    // Popular select de categorias
    const categoriaSelect = document.getElementById('categoria');

    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.name;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    throw error;
  }
}

// Atualiza subcategorias com base na categoria selecionada
function updateSubcategories() {
  const categoriaId = document.getElementById('categoria').value;
  const subcategoriaContainer = document.getElementById('subcategoria-container');
  const subcategoriaSelect = document.getElementById('subcategoria');

  // Limpar subcategorias
  subcategoriaSelect.innerHTML = '<option value="">Selecione uma subcategoria</option>';

  if (!categoriaId) {
    subcategoriaContainer.style.display = 'none';
    return;
  }

  // Encontrar categoria selecionada
  const selectedCategory = categorias.find(c => c.id.toString() === categoriaId);

  if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 &&
    !(selectedCategory.name === 'DIVERSOS')) {
    // Popular select com as subcategorias da categoria selecionada
    selectedCategory.subcategories.forEach(subcategoria => {
      if (subcategoria.id) { // Verificar se a subcategoria é válida
        const option = document.createElement('option');
        option.value = subcategoria.id;
        option.textContent = subcategoria.name;
        subcategoriaSelect.appendChild(option);
      }
    });

    // Mostrar select de subcategorias
    subcategoriaContainer.style.display = 'block';
  } else {
    // Ocultar select de subcategorias para a categoria DIVERSOS ou se não houver subcategorias
    subcategoriaContainer.style.display = 'none';
  }
}

// Carrega evento para edição
async function loadEventForEditing(eventId) {
  try {
    const user = getLoggedInUser();
    const evento = await getEventById(eventId);

    // Verificar permissões para edição
    if (user.role !== 'admin' &&
      (user.role !== 'premium' || String(evento.creator_id) !== String(user.id))) {
      showMessage('Você não tem permissão para editar este evento');
      navigateTo('events');
      return null;
    }

    // Primeiro, garantir que as categorias foram carregadas
    if (!categorias || categorias.length === 0) {
      await loadCategoriesAndSubcategories();
    }

    if (!evento) {
      throw new Error('Evento não encontrado');
    }

    // Preencher formulário com dados do evento
    document.getElementById('titulo').value = evento.title || evento.event_name || '';

    // Formatar data para o formato do input date (YYYY-MM-DD)
    if (evento.start_date || evento.event_date) {
      const dateStr = evento.start_date || evento.event_date;
      const date = new Date(dateStr);
      const formattedDate = date.toISOString().split('T')[0];
      document.getElementById('data').value = formattedDate;
    }

    // Preencher horário
    document.getElementById('horario').value = evento.start_time || evento.event_time || '';

    // Outros campos que não dependem de categorias
    document.getElementById('localizacao').value = evento.location || '';
    document.getElementById('link').value = evento.event_link || '';
    document.getElementById('descricao').value = evento.description || '';

    // Carregar imagem se houver
    const imagemPrevia = document.getElementById('imagemPrevia');
    if (evento.photo_url) {
      imagemPrevia.src = evento.photo_url;
      imagemPrevia.style.display = 'block';
    }

    // Selecionar categoria
    const categoriaSelect = document.getElementById('categoria');
    if (evento.category_id) {
      console.log('Selecionando categoria ID:', evento.category_id);
      categoriaSelect.value = evento.category_id;

      // Atualizamos as subcategorias
      updateSubcategories();

      // Esperamos um momento para garantir que a UI atualizou
      await new Promise(resolve => setTimeout(resolve, 100));

      // Selecionar subcategoria se existir
      if (evento.subcategory_id) {
        console.log('Tentando selecionar subcategoria ID:', evento.subcategory_id);
        const subcategoriaSelect = document.getElementById('subcategoria');

        // Verificar se a subcategoria está disponível no select
        const subcategoriaExists = Array.from(subcategoriaSelect.options).some(
          option => option.value === evento.subcategory_id.toString()
        );

        if (subcategoriaExists) {
          subcategoriaSelect.value = evento.subcategory_id;
          console.log('Subcategoria selecionada com sucesso');
        } else {
          console.warn('Subcategoria não encontrada no select:', evento.subcategory_id);
          // Verificar se a subcategoria pertence à categoria
          const selectedCategory = categorias.find(c => c.id.toString() === evento.category_id.toString());
          if (selectedCategory) {
            console.log('Subcategorias disponíveis:', selectedCategory.subcategories);
          }
        }
      }
    }

    return evento;
  } catch (error) {
    console.error('Erro ao carregar evento para edição:', error);
    showMessage('Não foi possível carregar os dados do evento para edição');
    navigateTo('events');
    return null;
  }
}

// Manipula o envio do formulário
async function handleSubmit(form, eventId) {
  try {
    // Validar formulário
    if (!validateForm(form)) {
      return;
    }

    // Criar FormData
    const formData = new FormData(form);

    // Adicionar campo para API
    if (formData.get('title')) {
      formData.append('nome', formData.get('title')); // Para compatibilidade
    }

    if (formData.get('start_date')) {
      formData.append('data', formData.get('start_date')); // Para compatibilidade
    }

    if (formData.get('start_time')) {
      formData.append('horario', formData.get('start_time')); // Para compatibilidade
    }

    if (formData.get('description')) {
      formData.append('descricao', formData.get('description')); // Para compatibilidade
    }

    if (formData.get('location')) {
      formData.append('localizacao', formData.get('location')); // Para compatibilidade
    }

    if (formData.get('event_link')) {
      formData.append('link', formData.get('event_link')); // Para compatibilidade
    }

    // Enviar para API
    const resultado = await saveEvent(formData, eventId);

    // Mostrar mensagem de sucesso
    showMessage(eventId ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'success');

    // Redirecionar após 1,5 segundo
    setTimeout(() => navigateTo('events'), 1500);
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    showMessage(error.message || 'Ocorreu um erro ao salvar o evento');
  }
}

// Valida o formulário antes do envio
function validateForm(form) {
  const titulo = form.querySelector('#titulo').value.trim();
  const data = form.querySelector('#data').value;
  const categoria = form.querySelector('#categoria').value;
  const localizacao = form.querySelector('#localizacao').value.trim();

  if (!titulo) {
    showMessage('O título do evento é obrigatório');
    return false;
  }

  if (!data) {
    showMessage('A data do evento é obrigatória');
    return false;
  }

  if (!categoria) {
    showMessage('A categoria do evento é obrigatória');
    return false;
  }

  if (!localizacao) {
    showMessage('A localização do evento é obrigatória');
    return false;
  }

  return true;
}