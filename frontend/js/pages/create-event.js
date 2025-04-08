import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { getLoggedInUser, isPremiumOrAdmin } from '../modules/store.js';
import { setupImagePreview, setupCancelModal } from '../modules/form-utils.js'; // setupCancelModal é importante aqui
import { getEventById, saveEvent, fetchCategoriesWithSubcategories } from '../modules/events-api.js';

// --- Ícones ---
const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const photoIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/></svg>`;
const addIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white"/></svg>`;
const videoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-film" viewBox="0 0 16 16"><path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm4 0v6h8V1zm8 8H4v6h8zM1 1v2h2V1zm2 3H1v2h2zm-2 3H1v2h2zm-2 3H1v2h2zm14-9v2h2V1zm-2 3h2v2h-2zm2 3h2v2h-2zm-2 3h2v2h-2z"/></svg>`;

// Variáveis do módulo
let categorias = [];
let isSubmitting = false; // Flag para evitar duplo submit

/**
 * Renderiza o formulário de criação/edição de evento.
 */
export default async function renderCreateEvent(queryParams) {
  // 1. Verificar permissões
  if (!isPremiumOrAdmin()) {
    navigateTo('events');
    showMessage('Acesso negado. Você precisa ser premium ou admin para criar eventos.');
    return;
  }

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // 2. Determinar modo (Criação ou Edição)
  const eventId = queryParams.get('edit');
  const isEditing = !!eventId;
  const pageTitle = isEditing ? 'Editar Evento' : 'Criar Novo Evento';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Adicionar Evento';

  // 3. Definir HTML com o novo header padronizado
  appContainer.innerHTML = `
      <div class="app-wrapper create-event-page">
        <div class="app-container">
            <header class="page-header">
                <a class="back-button" id="create-event-back-button" title="Voltar">${backIcon}</a>
                <h1>${pageTitle}</h1>
            </header>

            <div class="create-event-content">
                <form id="criarEventoForm">
                    <input type="hidden" id="eventoId" value="${eventId || ''}">

                    <div class="left-column">
                        <div class="form-group">
                            <label for="titulo">Nome do evento*</label>
                            <input type="text" id="titulo" name="title" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="data">Data*</label>
                                <input type="date" id="data" name="start_date" required>
                            </div>
                            <div class="form-group">
                                <label for="horario">Horário</label>
                                <input type="time" id="horario" name="start_time">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="categoria">Categoria*</label>
                                <select id="categoria" name="category_id" required>
                                    <option value="">Selecione...</option>
                                </select>
                            </div>
                            <div class="form-group" id="subcategoria-container" style="display: none;">
                                <label for="subcategoria">Subcategoria</label>
                                <select id="subcategoria" name="subcategory_id">
                                    <option value="">Selecione...</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="localizacao">Localização*</label>
                            <input type="text" id="localizacao" name="location" required>
                        </div>

                        <div class="form-group">
                            <label for="link">Link (Website, Instagram, etc.)</label>
                            <input type="url" id="link" name="event_link" placeholder="https://...">
                        </div>

                        <div class="form-group">
                            <label for="descricao">Descrição</label>
                            <textarea id="descricao" name="description" rows="4" placeholder="Descreva o evento..."></textarea>
                        </div>

                         <div class="form-group video-input-section">
                          <label>${videoIcon} Links de Vídeo (YouTube/TikTok - Máx. 3)</label>
                          <div id="video-input-container">
                              </div>
                          <button type="button" id="add-video-btn" class="btn small add-video">
                            + Adicionar Vídeo
                          </button>
                        </div>
                    </div> <div class="right-column">
                        <div>
                            <label for="imagem">Imagem do Evento</label>
                            <div id="previewImagem" class="image-preview">
                                <img id="imagemPrevia" src="#" alt="Preview da imagem" style="display: none;">
                                <span id="previewPlaceholder" style="color: #555; font-size: 14px;">Preview da Imagem</span>
                            </div>
                            <button type="button" class="add-photo-button" id="btnAdicionarFoto">
                                ${photoIcon}
                                Adicionar/Alterar Foto
                            </button>
                            <input type="file" id="imagem" name="imagem" accept="image/*" style="display: none;">
                        </div>

                        <div class="form-buttons">
                            <button type="submit" class="primary-button submit-event-btn">
                                ${addIcon}
                                ${submitButtonText}
                            </button>
                            <button type="button" class="secondary-button cancel-event-btn" id="cancelarEvento">Cancelar</button>
                        </div>
                    </div> </form>
            </div> </div> </div> <div class="modal" id="cancelarModal"> <div class="modal-content"> <span class="close-modal" id="fecharCancelarModal">×</span> <h3>Descartar Alterações?</h3> <p>Tem certeza que deseja cancelar? ${isEditing ? 'As alterações não salvas' : 'Os dados inseridos'} serão perdidos.</p> <div class="modal-buttons"> <button id="confirmarCancelar" class="btn">Sim, descartar</button> <button id="negarCancelar" class="btn secondary">Não, continuar</button> </div> </div> </div>
      `;

  // 4. Adicionar/Garantir Estilos CSS (opcional, se não estiverem globais)
  addCreateEventStyles();
  // 5. Configurar o formulário e seus eventos
  await setupEventForm(isEditing, eventId);
}

/**
 * Configura o formulário de evento, carrega dados e adiciona listeners.
 */
async function setupEventForm(isEditing, eventId) {
  const form = document.getElementById('criarEventoForm');
  if (!form) return;

  // Resetar flag de submit
  isSubmitting = false;

  // Configurar preview de imagem
  setupImagePreview('imagem', 'imagemPrevia', 'btnAdicionarFoto');
  // Esconder placeholder se já houver imagem no preview
  const imgPreview = document.getElementById('imagemPrevia');
  const placeholder = document.getElementById('previewPlaceholder');
  if (imgPreview && placeholder) {
    const observer = new MutationObserver(() => {
      placeholder.style.display = imgPreview.style.display === 'none' ? 'block' : 'none';
    });
    observer.observe(imgPreview, { attributes: true, attributeFilter: ['style', 'src'] });
    // Estado inicial
    placeholder.style.display = imgPreview.style.display === 'none' ? 'block' : 'none';
  }


  // Configurar modal de cancelamento (agora volta para o perfil)
  setupCancelModal('cancelarModal', {
    cancelButtonId: 'cancelarEvento',
    closeButtonId: 'fecharCancelarModal',
    confirmButtonId: 'confirmarCancelar',
    denyButtonId: 'negarCancelar',
    onConfirm: () => navigateTo('edit-profile') // <-- VOLTA PARA O PERFIL
  });

  // --- BOTÃO VOLTAR DO HEADER ---
  const backButton = document.getElementById('create-event-back-button');
  if (backButton) {
    // Limpa listener antigo
    backButton.replaceWith(backButton.cloneNode(true));
    document.getElementById('create-event-back-button').addEventListener('click', (e) => {
      e.preventDefault();
      // Mostra o mesmo modal de confirmação do botão "Cancelar"
      const cancelModal = document.getElementById('cancelarModal');
      if (cancelModal) cancelModal.classList.add('active');
    });
  }
  // --- FIM BOTÃO VOLTAR ---


  try {
    setupVideoInputs(isEditing); // Passa isEditing
    await loadCategoriesAndSubcategories(); // Carrega categorias
    document.getElementById('categoria')?.addEventListener('change', updateSubcategories);

    if (isEditing && eventId) {
      await loadEventForEditing(eventId); // Carrega dados do evento se editando
    }

    // Configurar envio do formulário
    form.addEventListener('submit', handleFormSubmit);

  } catch (error) {
    console.error('Erro ao configurar formulário:', error);
    showMessage('Ocorreu um erro ao carregar o formulário. Tente novamente.');
  }
}

/**
 * Manipula a submissão do formulário.
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return; // Previne duplo clique

  const form = e.target;
  const eventId = form.querySelector('#eventoId').value;
  const submitButton = form.querySelector('.submit-event-btn');
  const originalButtonContent = submitButton.innerHTML; // Salva o conteúdo original

  // Validar formulário
  if (!validateForm(form)) return;

  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.innerHTML = `${addIcon} ${eventId ? 'Salvando...' : 'Adicionando...'}`; // Feedback visual

  try {
    const formData = new FormData(form);

    // Tratamento de Categoria/Subcategoria (só envia subcategoria se visível)
    const subcatContainer = document.getElementById('subcategoria-container');
    if (subcatContainer && subcatContainer.style.display === 'none') {
      formData.delete('subcategory_id'); // Remove se não aplicável
    }

    // Coletar URLs de vídeo
    const videoUrls = Array.from(form.querySelectorAll('.video-url'))
      .map(input => input.value.trim())
      .filter(url => url !== ''); // Filtra vazios

    // Adicionar vídeos ao FormData como JSON stringificado
    formData.append('video_urls', JSON.stringify(videoUrls));

    // Log para depuração
    console.log(`Enviando ${eventId ? 'atualização' : 'criação'} para evento ID: ${eventId || 'novo'}`);
    // for (let [key, value] of formData.entries()) { console.log(`${key}:`, value); } // Descomente para ver todos os dados

    // Enviar para API
    const resultado = await saveEvent(formData, eventId);

    showMessage(eventId ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'success');
    navigateTo('events'); // Volta para o perfil após salvar

  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    showMessage(error.message || 'Ocorreu um erro ao salvar o evento', 'error');
    submitButton.disabled = false; // Reabilita botão em caso de erro
    submitButton.innerHTML = originalButtonContent; // Restaura texto
    isSubmitting = false;
  }
  // O finally não é ideal aqui por causa do redirect no sucesso
}

/**
 * Adiciona inputs de vídeo dinamicamente.
 */
function setupVideoInputs(isEditing) { // Recebe isEditing
  const container = document.getElementById('video-input-container');
  const addButton = document.getElementById('add-video-btn');

  if (!container || !addButton) return;

  // Se não estiver editando, adiciona o primeiro campo
  if (!isEditing) {
    addVideoInput(container);
  }

  addButton.addEventListener('click', () => {
    if (container.querySelectorAll('.video-url').length < 3) {
      addVideoInput(container);
    }
    // Opcional: esconder botão se atingir o limite
    addButton.style.display = container.querySelectorAll('.video-url').length >= 3 ? 'none' : 'flex';
  });

  // Opcional: Esconder botão inicialmente se já tiver 3 campos (na edição)
  addButton.style.display = container.querySelectorAll('.video-url').length >= 3 ? 'none' : 'flex';
}

/**
 * Cria e adiciona um novo campo de input de vídeo.
 */
function addVideoInput(container) {
  const newInput = document.createElement('input');
  newInput.type = 'url';
  newInput.className = 'video-url';
  newInput.placeholder = 'https://youtube.com/shorts/abc123... ou https://tiktok.com/...';
  container.appendChild(newInput);
}

/**
 * Carrega categorias e subcategorias para os dropdowns.
 */
async function loadCategoriesAndSubcategories() {
  try {
    categorias = await fetchCategoriesWithSubcategories();
    const categoriaSelect = document.getElementById('categoria');
    if (!categoriaSelect) return;

    categoriaSelect.innerHTML = '<option value="">Selecione...</option>'; // Reset
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    throw error; // Propaga o erro
  }
}

/**
 * Atualiza o dropdown de subcategorias baseado na categoria selecionada.
 */
function updateSubcategories() {
  const categoriaId = document.getElementById('categoria').value;
  const subcategoriaContainer = document.getElementById('subcategoria-container');
  const subcategoriaSelect = document.getElementById('subcategoria');
  if (!subcategoriaContainer || !subcategoriaSelect) return;

  subcategoriaSelect.innerHTML = '<option value="">Selecione...</option>'; // Reset

  const selectedCategory = categorias.find(c => c.id.toString() === categoriaId);

  if (selectedCategory?.subcategories?.length > 0 && selectedCategory.name !== 'DIVERSOS') {
    selectedCategory.subcategories.forEach(sub => {
      if (sub.id) {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = sub.name;
        subcategoriaSelect.appendChild(option);
      }
    });
    subcategoriaContainer.style.display = 'block';
  } else {
    subcategoriaContainer.style.display = 'none';
    subcategoriaSelect.value = ""; // Garante que nenhum valor seja enviado
  }
}

/**
 * Carrega os dados de um evento existente para o formulário (modo de edição).
 */
async function loadEventForEditing(eventId) {
  try {
    console.log(`Carregando evento ID: ${eventId} para edição.`);
    const evento = await getEventById(eventId);
    if (!evento) throw new Error('Evento não encontrado para edição');

    // Validação de permissão (usuário logado precisa ser o criador ou admin)
    const user = getLoggedInUser();
    if (!user || (user.role !== 'admin' && String(evento.creator_id) !== String(user.id))) {
      showMessage('Você não tem permissão para editar este evento.');
      navigateTo('events');
      return;
    }

    // Preencher campos simples
    document.getElementById('titulo').value = evento.event_name || '';
    document.getElementById('localizacao').value = evento.location || '';
    document.getElementById('link').value = evento.event_link || '';
    document.getElementById('descricao').value = evento.description || '';

    // Preencher data e hora
    if (evento.event_date) {
      // Formato YYYY-MM-DD é necessário para input type="date"
      try {
        const date = new Date(evento.event_date);
        // Adiciona 1 dia por causa de problemas de fuso horário ao converter
        date.setUTCDate(date.getUTCDate() + 1);
        document.getElementById('data').value = date.toISOString().split('T')[0];
      } catch (e) { console.error("Erro ao formatar data:", evento.event_date, e); }
    }
    if (evento.event_time) {
      document.getElementById('horario').value = evento.event_time;
    }


    // Preencher imagem
    const imgPreview = document.getElementById('imagemPrevia');
    const placeholder = document.getElementById('previewPlaceholder');
    if (evento.photo_url && imgPreview && placeholder) {
      imgPreview.src = evento.photo_url;
      imgPreview.style.display = 'block';
      placeholder.style.display = 'none';
    } else if (placeholder) {
      placeholder.style.display = 'block';
      if (imgPreview) imgPreview.style.display = 'none';
    }


    // Preencher Categoria e Subcategoria (APÓS categorias serem carregadas)
    await loadCategoriesAndSubcategories(); // Garante que categorias estão carregadas
    const categoriaSelect = document.getElementById('categoria');
    if (evento.category_id && categoriaSelect) {
      categoriaSelect.value = evento.category_id;
      updateSubcategories(); // Atualiza subcategorias baseado na categoria carregada
      // Seleciona a subcategoria APÓS o updateSubcategories
      const subcategoriaSelect = document.getElementById('subcategoria');
      if (evento.subcategory_id && subcategoriaSelect) {
        // Pequeno delay para garantir que o DOM atualizou as opções
        await new Promise(resolve => setTimeout(resolve, 50));
        subcategoriaSelect.value = evento.subcategory_id;
        console.log(`Subcategoria ${evento.subcategory_id} selecionada.`);
      }
    }

    // Preencher Vídeos
    const videoContainer = document.getElementById('video-input-container');
    if (videoContainer && evento.video_urls && Array.isArray(evento.video_urls)) {
      videoContainer.innerHTML = ''; // Limpa container
      evento.video_urls.forEach(url => {
        if (url) { // Verifica se a URL não é nula/vazia
          const videoInput = document.createElement('input');
          videoInput.type = 'url';
          videoInput.className = 'video-url';
          videoInput.value = url;
          videoInput.placeholder = 'https://youtube.com/shorts/abc123... ou https://tiktok.com/...';
          videoContainer.appendChild(videoInput);
        }
      });
      // Adiciona um campo vazio se houver menos de 3 vídeos
      if (evento.video_urls.length < 3) {
        addVideoInput(videoContainer);
      }
      // Atualiza visibilidade do botão "Adicionar"
      const addButton = document.getElementById('add-video-btn');
      if (addButton) {
        addButton.style.display = videoContainer.querySelectorAll('.video-url').length >= 3 ? 'none' : 'flex';
      }
    } else if (videoContainer) {
      // Adiciona o primeiro input se não houver vídeos salvos
      addVideoInput(videoContainer);
    }


    console.log("Formulário preenchido para edição.");

  } catch (error) {
    console.error('Erro ao carregar evento para edição:', error);
    showMessage('Não foi possível carregar os dados do evento para edição.', 'error');
    navigateTo('edit-profile'); // Volta para o perfil se der erro
  }
}

/**
 * Valida o formulário antes do envio.
 */
function validateForm(form) {
  const titulo = form.querySelector('#titulo').value.trim();
  const data = form.querySelector('#data').value;
  const categoria = form.querySelector('#categoria').value;
  const localizacao = form.querySelector('#localizacao').value.trim();
  const imagemInput = form.querySelector('#imagem');
  const isEditing = !!form.querySelector('#eventoId').value; // Verifica se está editando

  if (!titulo) { showMessage('O título do evento é obrigatório', 'error'); return false; }
  if (!data) { showMessage('A data do evento é obrigatória', 'error'); return false; }
  if (!categoria) { showMessage('A categoria do evento é obrigatória', 'error'); return false; }
  if (!localizacao) { showMessage('A localização do evento é obrigatória', 'error'); return false; }

  // Exige imagem apenas na criação, não na edição (a menos que queira obrigar sempre)
  if (!isEditing && imagemInput && imagemInput.files.length === 0) {
    // showMessage('Uma imagem para o evento é obrigatória na criação', 'error');
    // return false; // DESCOMENTE se quiser obrigar imagem na criação
  }

  // Validação de URLs de vídeo (opcional, pode ser feita no backend também)
  const videoUrls = Array.from(form.querySelectorAll('.video-url'))
    .map(input => input.value.trim())
    .filter(url => url !== '');
  // Adicionar validação de formato se necessário aqui

  return true;
}


/**
 * Adiciona estilos CSS específicos para a página de criação de evento.
 */
function addCreateEventStyles() {
  const styleId = 'create-event-styles';
  if (document.getElementById(styleId)) return; // Já existe

  console.log("Adding Create Event page styles...");
  const styles = document.createElement('style');
  styles.id = styleId;
  styles.textContent = `
      /* Estilos Gerais */
      .create-event-page .app-container { max-width: 1100px; margin: 0 auto; }
      .create-event-page .page-header { /* Reutiliza estilos de common.css */ }
      .create-event-content { padding: 0 15px 20px; /* Adiciona padding lateral */ }

      #criarEventoForm {
        display: flex;
        flex-wrap: wrap; /* Permite quebrar em telas menores */
        gap: 30px; /* Espaço entre colunas */
        width: 100%;
      }

      .left-column {
        flex: 2; /* Ocupa mais espaço */
        min-width: 300px; /* Largura mínima */
      }
      .right-column {
        flex: 1; /* Ocupa menos espaço */
        min-width: 280px;
        display: flex;
        flex-direction: column;
      }

      /* Estilos do Formulário */
      .form-group { margin-bottom: 20px; }
      .form-group label { display: block; margin-bottom: 8px; color: #aaa; font-size: 14px; font-weight: 500; text-align: left;}
      .form-group input[type="text"],
      .form-group input[type="date"],
      .form-group input[type="time"],
      .form-group input[type="url"],
      .form-group textarea,
      .form-group select {
        width: 100%; box-sizing: border-box;
        background-color: #1c1c1e; border: 1px solid #3a3a3c;
        border-radius: 8px; padding: 12px 15px; color: white; font-size: 15px;
      }
      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus { border-color: #8000FF; outline: none; background-color: #2c2c2e; }
      .form-group textarea { resize: vertical; min-height: 100px; }
      .form-group select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23aaa' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 15px center; background-size: 16px; padding-right: 40px; cursor: pointer;}

      .form-row { display: flex; gap: 15px; }
      .form-row .form-group { flex: 1; margin-bottom: 0; } /* Remove margin bottom dos grupos na linha */
      .form-row + .form-group { margin-top: 20px; } /* Adiciona espaço acima se o próximo for grupo único */
      .form-group + .form-row { margin-top: 20px; }

      /* Preview da Imagem */
      .image-preview {
        width: 100%; height: 200px; margin-top: 8px; /* Espaço abaixo do label */ margin-bottom: 15px; border-radius: 8px;
        overflow: hidden; background-color: #1c1c1e; border: 1px dashed #3a3a3c;
        display: flex; justify-content: center; align-items: center; position: relative;
      }
      .image-preview img { max-width: 100%; max-height: 100%; object-fit: cover; display: block; }
      #previewPlaceholder { position: absolute; color: #555; font-size: 14px; text-align: center; }

      .add-photo-button {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        background-color: #3a3a3c; color: #ccc; padding: 10px; border: none;
        border-radius: 8px; cursor: pointer; font-size: 14px; width: 100%;
        margin-bottom: 30px; /* Espaço antes dos botões principais */
        transition: background-color 0.2s ease;
      }
       .add-photo-button:hover { background-color: #4a4a4c; }
       .add-photo-button svg { width: 18px; height: 18px; }

      /* Botões de Ação (Direita) */
      .right-column { justify-content: space-between; } /* Empurra botões para baixo */
      .form-buttons { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
      .primary-button, .secondary-button { /* Reutiliza estilo .btn se existir */
          padding: 14px; border-radius: 8px; font-size: 16px; cursor: pointer; border: none;
          display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500;
      }
       .primary-button { background: linear-gradient(45deg, #439DFE, #8000FF); color: white; }
       .primary-button:hover { opacity: 0.9; }
       .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }
       .secondary-button { background-color: #3a3a3c; color: #ccc; }
       .secondary-button:hover { background-color: #4a4a4c; }

       /* Seção de Vídeos */
       .video-input-section { border: 1px solid #2a2a2c; padding: 15px; border-radius: 8px; margin-top: 20px; background-color: #111; }
       .video-input-section label { color: #aaa; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;}
       #video-input-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
       .video-url { font-size: 14px !important; padding: 10px 12px !important; }
       .add-video { font-size: 13px !important; padding: 8px 12px !important; background-color: #3a3a3c !important; align-self: flex-start; } /* Botão menor */
       .add-video:hover { background-color: #4a4a4c !important; }

      /* Responsividade Básica */
      @media (max-width: 768px) {
        #criarEventoForm { flex-direction: column; }
        .left-column, .right-column { flex: none; width: 100%; padding-right: 0;}
        .right-column { order: -1; } /* Move imagem para cima em telas pequenas */
        .add-photo-button { margin-bottom: 20px; }
      }
    `;
  document.head.appendChild(styles);
  console.log("Create Event page styles added.");
}