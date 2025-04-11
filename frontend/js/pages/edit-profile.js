// frontend/js/pages/edit-profile.js
import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js'; // Usado para SUCESSO
import { fetchCompleteUserData, logoutUser } from '../modules/auth.js';
import { getLoggedInUser, saveUser, clearUser, isAdmin, isPremium } from '../modules/store.js';

// --- Ícones SVG ---
const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const listIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
const logoutIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
// Ícones da Barra de Navegação Inferior
const homeIconNav = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const agendaIconNav = `<svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/><path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/></svg>`;
const profileIconNav = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;


// --- Funções auxiliares ---

/**
 * Mostra uma mensagem inline (erro ou sucesso) no div especificado.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'error' | 'success'} type - O tipo de mensagem ('error' ou 'success').
 * @param {string} elementId - O ID do elemento onde mostrar a mensagem.
 */
function showInlineFeedback(message, type = 'error', elementId = 'profileEditErrorMessage') {
  const feedbackDiv = document.getElementById(elementId);
  if (feedbackDiv) {
      feedbackDiv.textContent = message;
      feedbackDiv.classList.remove('is-hidden');
      feedbackDiv.style.display = 'block'; // Garante visibilidade

      // Remove classes de tipo anteriores e adiciona a nova
      feedbackDiv.classList.remove('error-message', 'success-message');
      if (type === 'success') {
          feedbackDiv.classList.add('success-message');
      } else {
          feedbackDiv.classList.add('error-message'); // Padrão para erro
      }
  } else {
      console.error(`Div de feedback #${elementId} não encontrado!`);
      alert(`${type === 'success' ? 'Sucesso' : 'Erro'}: ${message}`); // Fallback
  }
}

/**
 * Esconde a mensagem inline.
 * @param {string} elementId - O ID do elemento da mensagem.
 */
function hideInlineFeedback(elementId = 'profileEditErrorMessage') {
  const feedbackDiv = document.getElementById(elementId);
  if (feedbackDiv) {
      feedbackDiv.textContent = '';
      feedbackDiv.classList.add('is-hidden');
      feedbackDiv.style.display = 'none'; // Garante que está escondido
      feedbackDiv.classList.remove('error-message', 'success-message'); // Limpa classes
  }
}

function formatDateForInput(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste fuso
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // Formato AAAA-MM-DD
  } catch (e) { console.error("Erro formatar data:", e); return ''; }
}

function formatPhoneNumber(phoneFromDB) {
  if (!phoneFromDB) return '';
  const numbers = phoneFromDB.toString().replace(/\D/g, '');
  if (numbers.length === 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  if (numbers.length === 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return numbers;
}

function enforcePhoneFormat(value) {
  const numbers = value.replace(/\D/g, '');
  const len = numbers.length;
  if (len === 0) return '';
  if (len <= 2) return `(${numbers}`;
  if (len <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (len <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

function showInlineError(message, errorDivId = 'profileEditErrorMessage') {
  const errorDiv = document.getElementById(errorDivId);
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('is-hidden');
    errorDiv.style.display = 'block';
  } else { console.error(`Div erro #${errorDivId} não achado!`); alert(message); }
}

function hideInlineError(errorDivId = 'profileEditErrorMessage') {
  const errorDiv = document.getElementById(errorDivId);
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.classList.add('is-hidden');
    errorDiv.style.display = 'none';
  }
}

function showEditForm() {
  document.getElementById('actionList')?.classList.add('is-hidden');
  document.getElementById('userInfoDisplay')?.classList.add('is-hidden');
  document.getElementById('editFormContainer')?.classList.remove('is-hidden');
  const titleElement = document.getElementById('account-hub-title');
  if (titleElement) titleElement.textContent = 'Editar Informações';
  hideInlineError(); // Esconde erro ao mostrar
}

function showActionList() {
  document.getElementById('actionList')?.classList.remove('is-hidden');
  document.getElementById('userInfoDisplay')?.classList.remove('is-hidden');
  document.getElementById('editFormContainer')?.classList.add('is-hidden');
  const titleElement = document.getElementById('account-hub-title');
  if (titleElement) titleElement.textContent = 'Minha Conta';
  hideInlineError(); // Esconde erro ao voltar
}

document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'cancel-edit-btn') {
    e.preventDefault();
    showActionList();
  }
});

// EXPANDIDO: Configura o modal genérico de "Em desenvolvimento"
function setupDevelopmentModal() {
  const modal = document.getElementById("development-modal");
  const closeModalBtn = document.getElementById("close-development-modal");
  const okBtn = document.getElementById("ok-development");
  if (!modal || !closeModalBtn || !okBtn) {
    console.warn("Elementos do modal de desenvolvimento não encontrados.");
    return;
  }

  const closeModalFunc = () => modal.classList.remove('active');

  // Limpa listeners antigos antes de adicionar novos
  const newCloseModalBtn = closeModalBtn.cloneNode(true);
  closeModalBtn.parentNode.replaceChild(newCloseModalBtn, closeModalBtn);
  newCloseModalBtn.addEventListener("click", closeModalFunc);

  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);
  newOkBtn.addEventListener("click", closeModalFunc);

  // Fechar ao clicar fora
  const closeDevModalOnClickOutside = (event) => { if (modal && event.target === modal) { modal.classList.remove("active"); } };
  window.removeEventListener("click", closeDevModalOnClickOutside); // Remove anterior
  window.addEventListener("click", closeDevModalOnClickOutside); // Adiciona novo
  console.log("Modal de desenvolvimento configurado.");
}

// EXPANDIDO: Mostra o modal de "Em desenvolvimento"
function showDevelopmentModal() {
  const modal = document.getElementById('development-modal');
  if (modal) {
    modal.classList.add('active');
  } else {
    console.warn("Modal de desenvolvimento não encontrado para exibir.");
  }
}


// Função para resetar o estado do botão de salvar (declarada fora da setupAccountHubEvents)
function resetSaveButtonState() {
  const submitButton = document.querySelector('#profileForm button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Salvar Alterações';
  }

  // Também esconder mensagens de erro
  hideInlineError();
}

// --- Configuração dos Eventos da Página ---
function setupAccountHubEvents(user) {
  console.log("Setting up Account Hub events...");

  // Chamada para resetar o estado do botão logo no início
  resetSaveButtonState();

  const cleanAndAddListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      newElement.addEventListener(event, handler);
    } else { console.warn(`Elemento #${id} não encontrado.`); }
  };

  // Botões Principais e Ações
  cleanAndAddListener('profile-back-button', 'click', (e) => {
    e.preventDefault();
    if (document.getElementById('editFormContainer')?.classList.contains('is-hidden') === false) {
      showActionList();
    } else { navigateTo('events'); }
  });
  cleanAndAddListener('edit-info-btn', 'click', showEditForm);
  cleanAndAddListener('cancel-edit-btn', 'click', (e) => { e.preventDefault(); showActionList(); });
  cleanAndAddListener('meus-eventos-btn', 'click', () => navigateTo('events', { showMyEvents: 'true' }));
  cleanAndAddListener('criar-evento-btn', 'click', () => navigateTo('create-event'));
  cleanAndAddListener('logout-btn', 'click', async (e) => {
    const button = e.currentTarget;
    const originalContent = button.innerHTML;
    button.disabled = true; button.innerHTML = `${logoutIcon} Saindo...`;
    try { await logoutUser(); clearUser(); navigateTo('welcome-screen'); }
    catch (error) { console.error('Logout error:', error); showMessage('Erro ao sair.'); button.disabled = false; button.innerHTML = originalContent; }
  });
  // cleanAndAddListener('upgrade-btn', 'click', () => navigateTo('premium')); // Se tiver botão de upgrade

  // Input de Telefone
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    const newPhoneInput = phoneInput.cloneNode(true);
    phoneInput.parentNode.replaceChild(newPhoneInput, phoneInput);
    newPhoneInput.addEventListener('input', (e) => { e.target.value = enforcePhoneFormat(e.target.value); });
  }

  // Formulário de Edição (Submit)
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    const newProfileForm = profileForm.cloneNode(true);
    profileForm.parentNode.replaceChild(newProfileForm, profileForm);
    newProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalButtonText = submitButton?.textContent || 'Salvar Alterações';

      const feedbackElementId = 'profileEditErrorMessage'; 

      hideInlineFeedback(feedbackElementId)

      // Coleta e Valida
      const name = document.getElementById('name')?.value.trim();
      const rawPhone = document.getElementById('phone')?.value.replace(/\D/g, '');
      const birthDateValue = document.getElementById('birthDate')?.value; // YYYY-MM-DD

      if (!name) { showInlineFeedback('O nome é obrigatório.', 'error', feedbackElementId);}
      if (rawPhone && (rawPhone.length < 10 || rawPhone.length > 11)) { showInlineFeedback('Telefone inválido (10 ou 11 dígitos).', 'error', feedbackElementId); // <- Usa a função local
        return;}
      if (birthDateValue) { // Valida data futura
        try {
          const birthDateObj = new Date(birthDateValue);
          const today = new Date(); today.setHours(0, 0, 0, 0);
          birthDateObj.setMinutes(birthDateObj.getMinutes() + birthDateObj.getTimezoneOffset()); // Ajuste Fuso
          if (birthDateObj > today) {showInlineFeedback('Insira uma data de nascimento válida.', 'error', feedbackElementId); // <- Usa a função local
            return; }
        } catch (e) { showInlineFeedback('Data de nascimento inválida.', 'error', feedbackElementId); // <- Usa a função local
          return; }
      }

      // Prepara e Envia
      const bodyData = { name, phone: rawPhone || null, birth_date: birthDateValue || null };
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Salvando...'; }

      // NOVA LINHA: Adicionar timeout para garantir que o botão volte ao normal
      const resetTimeout = setTimeout(() => {
        console.log('Timeout atingido, resetando botão');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }, 10000); // 10 segundos

      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(bodyData)
        });

        // Limpar o timeout quando receber resposta
        clearTimeout(resetTimeout);

        const data = await response.json();
        if (!response.ok || data.success === false) { throw new Error(data.message || 'Falha ao atualizar'); }

        // Sucesso
        // 1. Desbloquear o botão ANTES de navegar
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }

        // 2. Mostrar mensagem de sucesso
        showInlineFeedback('Perfil atualizado com sucesso!', 'success', feedbackElementId); // <--- AQUI (Usa a função local)

        // 3. Atualizar os dados no armazenamento local
        const updatedUserData = { ...user, ...data.data };
        saveUser(updatedUserData);

        // 4. Atualizar o nome na interface atual
        const displayNameElement = document.querySelector('.user-display-name');
        if (displayNameElement) displayNameElement.textContent = updatedUserData.name || updatedUserData.username || 'Usuário';

        // 5. Adicionar um delay curto antes de navegar para a próxima tela
        setTimeout(() => {
          showActionList();
        }, 1000); // Espera 1 segundo para que o usuário veja a mensagem

      } catch (error) {
        // Limpar o timeout para evitar duplicação
        clearTimeout(resetTimeout);

        console.error('Erro na atualização do perfil:', error);
        showInlineError(error.message || 'Erro ao atualizar perfil.'); // Mostra erro inline
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = originalButtonText; }
      }
    });
  }
  // Navegação Inferior
  cleanAndAddListener('nav-home', 'click', () => navigateTo('events'));
  cleanAndAddListener('nav-agenda', 'click', () => navigateTo('agenda'));
  cleanAndAddListener('nav-profile', 'click', () => { if (document.getElementById('editFormContainer')?.classList.contains('is-hidden') === false) showActionList(); });

  console.log("Account Hub events set up complete.");
}


// --- Função Principal de Renderização ---
export default async function renderEditProfile(queryParams) {
  console.log("Rendering Account Hub Page...");
  try {
    const user = await fetchCompleteUserData();
    if (!user) {
      showMessage('Você precisa estar logado para acessar essa página');
      navigateTo('welcome-screen'); // Redireciona para welcome-screen se não logado
      return;
    }

    const isAdminUser = isAdmin();
    const isPremiumUser = isPremium();
    const appContainer = document.getElementById('app');
    if (!appContainer) { console.error("Container #app não encontrado!"); return; }

    // HTML da página (com placeholder de erro)
    appContainer.innerHTML = `
          <div class="app-wrapper account-hub-page">
            <div class="app-container">
              <header class="page-header">
                <a class="back-button" id="profile-back-button" title="Voltar">${backIcon}</a>
                <h1 id="account-hub-title">Minha Conta</h1>
              </header>
              <div class="profile-content">
                <div id="userInfoDisplay">
                    <div class="profile-image-container">
                       <div class="profile-image">
                         ${user.photo_url ? `<img src="${user.photo_url}" alt="Foto">` : `<div class="profile-image-initial">${user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}</div>`}
                       </div>
                     </div>
                     <h2 class="user-display-name">${user.name || user.username || 'Usuário'}</h2>
                     ${isAdminUser ? `<div class="user-badge admin-badge">Admin</div>` : ''}
                     ${isPremiumUser && !isAdminUser ? `<div class="user-badge premium-badge">Premium</div>` : ''}
                     ${!isPremiumUser && !isAdminUser ? `<div class="user-badge user-badge">Comum</div>` : ''}
                 </div>
                <div id="actionList" class="profile-action-list">
                    <button id="edit-info-btn" class="btn-profile-action">${editIcon} Editar Informações</button>
                    ${isPremiumUser || isAdminUser ? `<button id="meus-eventos-btn" class="btn-profile-action">${listIcon} Meus Eventos</button><button id="criar-evento-btn" class="btn-profile-action">${plusIcon} Criar Evento</button>` : ``}
                    <button id="logout-btn" class="btn-profile-action logout-action">${logoutIcon} Sair</button>
                 </div>
                <div id="editFormContainer" class="profile-form-container is-hidden">
                    <form id="profileForm" class="profile-form" novalidate  >
                        <div class="form-group"><label for="name">Nome</label><input type="text" id="name" value="${user.name || ''}" required></div>
                        <div class="form-group"><label for="email">E-mail (não pode ser alterado)</label><input type="email" id="email" value="${user.email || ''}" disabled></div>
                        <div class="form-group"><label for="phone">Telefone</label><input type="tel" id="phone" value="${formatPhoneNumber(user.phone)}" placeholder="(XX)..." maxlength="15"><span class="input-hint">Formato: (DDD) 9xxxx-xxxx</span></div>
                        <div class="form-group"><label for="birthDate">Data de Nascimento</label><input type="date" id="birthDate" value="${formatDateForInput(user.birth_date)}"></div>
                        <div id="profileEditErrorMessage" class="form-error-message is-hidden"></div>
                       <div class="form-buttons">
                            <button type="submit" class="btn btn-save">Salvar Alterações</button>
                            <button type="button" id="cancel-edit-btn" class="btn secondary">Cancelar</button>
                       </div>
                    </form>
                </div>
              </div>
              <footer class="bottom-nav">
                 <div class="nav-item" id="nav-home"> ${homeIconNav} <span>Home</span> </div>
                 <div class="nav-item" id="nav-agenda"> ${agendaIconNav} <span>Agenda</span> </div>
                 <div class="nav-item active" id="nav-profile"> ${profileIconNav} <span>Perfil</span> </div>
              </footer>
            </div>
          </div> 
          <div class="modal" id="development-modal">
             <div class="modal-content">
               <span class="close-modal" id="close-development-modal">&times;</span>
               <h3>Em Desenvolvimento</h3>
               <p>Esta funcionalidade estará disponível em breve!</p>
               <div class="modal-buttons">
                 <button id="ok-development" class="btn">Entendi</button>
               </div>
             </div>
          </div>
        `;

    // Define data máxima para nascimento APÓS renderizar HTML
    try {
      const birthDateInput = document.getElementById('birthDate');
      if (birthDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`; // <<< FORMATO CORRETO YYYY-MM-DD >>>
        birthDateInput.setAttribute('max', todayString);
        console.log(`Data máxima para nascimento definida como: ${todayString}`);
      }
    } catch (e) { console.error("Erro ao definir data máxima:", e); }

    // --- CHAMADA DE SETUP APÓS INNERHTML ---
    setupAccountHubEvents(user); // Configura listeners
    setupDevelopmentModal();   // Configura modal genérico (se usado)

  } catch (error) {
    console.error('Erro fatal ao carregar Conta/Perfil:', error);
    showMessage('Erro ao carregar seus dados. Tente novamente.', 'error');
    navigateTo('welcome-screen');
  }
}

// A função addAccountHubStyles() foi REMOVIDA.