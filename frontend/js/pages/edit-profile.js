import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { fetchCompleteUserData, logoutUser } from '../modules/auth.js';
import { getLoggedInUser, saveUser, clearUser, isAdmin, isPremium } from '../modules/store.js';

// --- Ícones SVG ---
const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const cameraIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const listIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
const barChartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
const adminIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
const premiumIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
const logoutIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;

/**
 * Renderiza a página de perfil/conta do usuário.
 */
export default async function renderEditProfile(queryParams) {
    console.log("Rendering Account Hub Page...");
    try {
        const user = await fetchCompleteUserData();
        if (!user) {
            showMessage('Você precisa estar logado para acessar essa página');
            navigateTo('login');
            return;
        }
        console.log("User data fetched:", user);

        const isAdminUser = isAdmin();
        const isPremiumUser = isPremium();

        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error("Container #app não encontrado!");
            return;
        }

        // Define o HTML da página
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
                         ${user.photo_url
                               ? `<img src="${user.photo_url}" alt="Foto de perfil">`
                               : `<div class="profile-image-initial">${user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}</div>`
                         }
                       </div>
                       <button id="alterar-foto-btn-display" class="profile-edit-photo" title="Alterar foto (em breve)">
                         ${cameraIcon}
                       </button>
                     </div>
                     <h2 class="user-display-name">${user.name || user.username || 'Usuário'}</h2>
                     ${isAdminUser ? `<div class="user-badge admin-badge">Administrador</div>` : ''}
                     ${isPremiumUser && !isAdminUser ? `<div class="user-badge premium-badge">Usuário Premium</div>` : ''}
                     ${!isPremiumUser && !isAdminUser ? `<div class="user-badge user-badge">Usuário Comum</div>` : ''}
                 </div>

                <div id="actionList" class="profile-action-list">
                    <button id="edit-info-btn" class="btn-profile-action">
                        ${editIcon} Editar Informações Pessoais
                    </button>
                    ${isPremiumUser || isAdminUser ? `
                    <button id="meus-eventos-btn" class="btn-profile-action">
                        ${listIcon} Meus Eventos
                    </button>
                    <button id="criar-evento-btn" class="btn-profile-action">
                        ${plusIcon} Criar Novo Evento
                    </button>
                    ` : `
                    <button id="upgrade-btn" class="btn-profile-action premium-cta">
                        ${premiumIcon} Tornar-se Premium
                    </button>
                    `}
                    ${isAdminUser ? `
                    <button id="gerenciar-eventos-btn" class="btn-profile-action">
                        ${adminIcon} Gerenciar Todos Eventos
                    </button>
                    <button id="metricas-btn" class="btn-profile-action">
                        ${barChartIcon} Métricas (em breve)
                    </button>
                    ` : ''}
                     <button id="logout-btn" class="btn-profile-action logout-action">
                         ${logoutIcon} Sair
                     </button>
                 </div>

                <div id="editFormContainer" class="profile-form-container is-hidden">
                    <form id="profileForm" class="profile-form">
                      <div class="form-group">
                        <label for="name">Nome</label>
                        <input type="text" id="name" value="${user.name || user.username || ''}" required>
                      </div>
                      <div class="form-group">
                        <label for="email">E-mail (não pode ser alterado)</label>
                        <input type="email" id="email" value="${user.email || ''}" disabled title="O e-mail não pode ser alterado.">
                      </div>
                      <div class="form-group">
                        <label for="phone">Telefone</label>
                        <input type="tel" id="phone" value="${formatPhoneNumber(user.phone)}" placeholder="(XX) XXXXX-XXXX" maxlength="15">
                        <span class="input-hint">Formato: (DDD) 9xxxx-xxxx ou xxxx-xxxx</span>
                      </div>
                       <div class="form-buttons">
                            <button type="submit" class="btn btn-save">Salvar Alterações</button>
                            <button type="button" id="cancel-edit-btn" class="btn secondary">Cancelar</button>
                       </div>
                    </form>
                </div>

              </div> </div> </div> <div class="modal" id="development-modal"> <div class="modal-content"> <span class="close-modal" id="close-development-modal">&times;</span> <h3>Em Desenvolvimento</h3> <p>Esta funcionalidade estará disponível em breve!</p> <div class="modal-buttons"> <button id="ok-development" class="btn">Entendi</button> </div> </div> </div>
        `;

        addAccountHubStyles();
        setupAccountHubEvents(user);
        setupDevelopmentModal();

      } catch (error) {
        console.error('Erro fatal ao carregar Conta/Perfil:', error);
        showMessage('Erro ao carregar seus dados. Tente novamente.', 'error');
        navigateTo('events');
      }
}

// --- Funções Auxiliares ---

function formatPhoneNumber(phoneFromDB) { /* ... (código como antes) ... */
    if (!phoneFromDB) return '';
    const numbers = phoneFromDB.toString().replace(/\D/g, '');
    if (numbers.length === 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    if (numbers.length === 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return numbers;
}

function enforcePhoneFormat(value) { /* ... (código como antes) ... */
    const numbers = value.replace(/\D/g, '');
    const len = numbers.length;
    if (len === 0) return '';
    if (len <= 2) return `(${numbers}`;
    if (len <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (len <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

function setupDevelopmentModal() { /* ... (código como antes, com limpeza de listeners) ... */
    const modal = document.getElementById("development-modal");
    const closeModalBtn = document.getElementById("close-development-modal");
    const okBtn = document.getElementById("ok-development");
    if (!modal || !closeModalBtn || !okBtn) return;
    const closeModalFunc = () => modal.classList.remove('active');
    closeModalBtn.replaceWith(closeModalBtn.cloneNode(true));
    document.getElementById("close-development-modal").addEventListener("click", closeModalFunc);
    okBtn.replaceWith(okBtn.cloneNode(true));
    document.getElementById("ok-development").addEventListener("click", closeModalFunc);
    const closeDevModalOnClickOutside = (event) => { if (modal && event.target === modal) { modal.classList.remove("active"); } };
    window.removeEventListener("click", closeDevModalOnClickOutside);
    window.addEventListener("click", closeDevModalOnClickOutside);
}

function showDevelopmentModal() { /* ... (código como antes) ... */
    const modal = document.getElementById('development-modal');
    if (modal) modal.classList.add('active');
}

function showEditForm() { /* ... (código como antes) ... */
    document.getElementById('actionList')?.classList.add('is-hidden');
    document.getElementById('editFormContainer')?.classList.remove('is-hidden');
    document.getElementById('account-hub-title').textContent = 'Editar Informações';
}

function showActionList() { /* ... (código como antes) ... */
    document.getElementById('actionList')?.classList.remove('is-hidden');
    document.getElementById('editFormContainer')?.classList.add('is-hidden');
    document.getElementById('account-hub-title').textContent = 'Minha Conta';
}

/**
 * Configura todos os event listeners da página de conta/hub.
 * @param {object} user - Os dados do usuário atual.
 */
function setupAccountHubEvents(user) {
    console.log("Setting up Account Hub events...");

    // Função auxiliar para limpar e adicionar listeners
    const cleanAndAddListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            newElement.addEventListener(event, handler);
        } else {
            console.warn(`Elemento com ID #${id} não encontrado para adicionar listener.`);
        }
    };

    // *** NOVO LISTENER PARA O BOTÃO VOLTAR DO HEADER ***
    cleanAndAddListener('profile-back-button', 'click', (e) => {
        e.preventDefault();
        const editFormContainer = document.getElementById('editFormContainer');
        // Verifica se o formulário está VISÍVEL
        if (editFormContainer && !editFormContainer.classList.contains('is-hidden')) {
            // Se o formulário está visível, volta para a lista de ações
            console.log("Back button: Form is visible, switching to action list.");
            showActionList();
        } else {
            // Se a lista de ações está visível, navega para a página de eventos
            console.log("Back button: Action list is visible, navigating to events.");
            navigateTo('events'); // Navega para a lista principal de eventos
        }
    });

    // Botão: Alterar Foto (Display)
    cleanAndAddListener('alterar-foto-btn-display', 'click', showDevelopmentModal);

    // Botão: Editar Informações Pessoais (mostra o formulário)
    cleanAndAddListener('edit-info-btn', 'click', showEditForm);

    // Botão: Cancelar Edição (esconde o formulário)
    cleanAndAddListener('cancel-edit-btn', 'click', (e) => {
        e.preventDefault(); // Previne comportamento padrão caso seja um link no futuro
        console.log("Cancel edit button clicked.");
        showActionList();
    });

    // Botão: Meus Eventos
    cleanAndAddListener('meus-eventos-btn', 'click', () => navigateTo('events', { showMyEvents: 'true' }));

    // Botão: Criar Evento
    cleanAndAddListener('criar-evento-btn', 'click', () => navigateTo('create-event'));

    // Botão: Gerenciar Todos Eventos (Admin)
    cleanAndAddListener('gerenciar-eventos-btn', 'click', () => navigateTo('events')); // Admin vê todos

    // Botão: Métricas (Admin)
    cleanAndAddListener('metricas-btn', 'click', showDevelopmentModal);

    // Botão: Upgrade Premium
    cleanAndAddListener('upgrade-btn', 'click', () => navigateTo('premium'));

    // Botão: Logout
    cleanAndAddListener('logout-btn', 'click', async (e) => {
        // ... (lógica de logout como na versão anterior, com loading state) ...
        console.log("Logout button clicked");
        const button = e.currentTarget;
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `${logoutIcon} Saindo...`;
        try {
            await logoutUser();
            clearUser();
            navigateTo('welcome-screen');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            showMessage('Erro ao sair. Tente novamente.');
             clearUser();
             navigateTo('welcome-screen');
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    });

    // Input de Telefone (formatação no formulário)
    const phoneInput = document.getElementById('phone');
     if (phoneInput) {
         const newPhoneInput = phoneInput.cloneNode(true);
         phoneInput.parentNode.replaceChild(newPhoneInput, phoneInput);
         newPhoneInput.addEventListener('input', (e) => {
             e.target.value = enforcePhoneFormat(e.target.value);
         });
     }

    // Formulário de Submit (edição)
     const profileForm = document.getElementById('profileForm');
     if (profileForm) {
         const newProfileForm = profileForm.cloneNode(true);
         profileForm.parentNode.replaceChild(newProfileForm, profileForm);
         newProfileForm.addEventListener('submit', async (e) => {
             // ... (lógica de submit do formulário como na versão anterior, com loading state) ...
              e.preventDefault();
             const nameInput = document.getElementById('name');
             const phoneInputSubmit = document.getElementById('phone');
             const name = nameInput ? nameInput.value.trim() : '';
             const rawPhone = phoneInputSubmit ? phoneInputSubmit.value.replace(/\D/g, '') : '';

             if (!name) { showMessage('Nome é obrigatório'); return; }
             if (rawPhone && (rawPhone.length < 10 || rawPhone.length > 11)) {
                 showMessage('Telefone inválido. Use DDD + número (10 ou 11 dígitos).'); return;
             }

             const submitButton = e.target.querySelector('button[type="submit"]');
             const originalButtonText = submitButton.textContent;
             submitButton.disabled = true;
             submitButton.textContent = 'Salvando...';

             try {
                 const response = await fetch('/api/auth/profile', {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     credentials: 'include',
                     body: JSON.stringify({ name: name, phone: rawPhone || null })
                 });
                 const data = await response.json();
                 if (!response.ok) throw new Error(data.message || 'Falha ao atualizar');

                 showMessage('Perfil atualizado com sucesso!');
                 const updatedUserData = { ...user, name: data.data.name, phone: data.data.phone };
                 saveUser(updatedUserData);
                 document.querySelector('.user-display-name').textContent = updatedUserData.name || updatedUserData.username || 'Usuário'; // Atualiza nome na tela
                 showActionList(); // Volta para a lista de ações

             } catch (error) {
                 console.error('Erro na atualização:', error);
                 showMessage(error.message || 'Erro ao atualizar perfil');
             } finally {
                 submitButton.disabled = false;
                 submitButton.textContent = originalButtonText;
             }
         });
     }

    console.log("Account Hub events set up complete.");
}


/**
 * Adiciona ou garante que os estilos CSS necessários para a página de conta/hub existam.
 */
function addAccountHubStyles() {
    const styleId = 'account-hub-styles';
    if (document.getElementById(styleId)) return; // Já existe

    console.log("Adding Account Hub page styles...");
    const styles = document.createElement('style');
    styles.id = styleId;
    // Adiciona os estilos CSS definidos anteriormente
    styles.textContent = `
      /* ... (Cole aqui TODOS os estilos CSS da função addAccountHubStyles da resposta anterior) ... */
      .account-hub-page .profile-header { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #222; margin-bottom: 20px; }
      .account-hub-page .profile-header h1 { margin: 0 0 0 15px; font-size: 20px; font-weight: 600; color: #eee; }
      .account-hub-page .back-button { background: none; border: none; color: #ccc; padding: 5px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
      .account-hub-page .back-button:hover { color: white; }
      .account-hub-page .back-button svg { width: 24px; height: 24px; }
      .account-hub-page .profile-content { padding: 0 20px 80px; text-align: center; }
      #userInfoDisplay { margin-bottom: 30px; }
      .profile-image-container { position: relative; width: 100px; height: 100px; margin: 0 auto 15px auto; }
      .profile-image { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background-color: #333; display: flex; align-items: center; justify-content: center; border: 2px solid #444; }
      .profile-image img { width: 100%; height: 100%; object-fit: cover; }
      .profile-image-initial { font-size: 36px; color: #fff; font-weight: bold; }
      .profile-edit-photo { position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #439DFE, #8000FF); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.4); }
      .profile-edit-photo:hover { opacity: 0.9; }
      .user-display-name { font-size: 22px; font-weight: 600; color: white; margin-bottom: 10px; }
      .user-badge { display: inline-block; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: 500; margin: 0 auto 10px; border: 1px solid; }
      .admin-badge { background-color: rgba(255, 69, 58, 0.1); color: #ff453a; border-color: rgba(255, 69, 58, 0.3); }
      .premium-badge { background: linear-gradient(45deg, rgba(67, 157, 254, 0.1), rgba(128, 0, 255, 0.1)); color: #ae50ff; border-color: rgba(128, 0, 255, 0.3); }
      .user-badge.user-badge { background-color: rgba(142, 142, 147, 0.1); color: #8e8e93; border-color: rgba(142, 142, 147, 0.3); }
      .profile-action-list { max-width: 450px; margin: 20px auto; display: flex; flex-direction: column; gap: 12px; }
      .btn-profile-action { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; background-color: #1c1c1e; color: #ddd; border: 1px solid #3a3a3c; padding: 14px 18px; border-radius: 10px; font-size: 15px; cursor: pointer; transition: background-color 0.2s ease, border-color 0.2s ease; }
      .btn-profile-action:hover { background-color: #2c2c2e; border-color: #555; }
      .btn-profile-action svg { width: 20px; height: 20px; color: #8000FF; flex-shrink: 0; }
      .btn-profile-action.premium-cta svg { color: #ae50ff; }
      .btn-profile-action.logout-action { color: #ff453a; }
      .btn-profile-action.logout-action svg { color: #ff453a; }
      .btn-profile-action.logout-action:hover { background-color: rgba(255, 69, 58, 0.15); border-color: rgba(255, 69, 58, 0.4); color: #ff6359; }
      .btn-profile-action.logout-action:hover svg { color: #ff6359; }
      .profile-form-container { max-width: 450px; margin: 20px auto; }
      .profile-form { text-align: left; }
      .profile-form .form-group { margin-bottom: 20px; }
      .profile-form label { display: block; margin-bottom: 8px; color: #aaa; font-size: 14px; font-weight: 500; }
      .profile-form input { width: 100%; box-sizing: border-box; background-color: #1c1c1e; border: 1px solid #3a3a3c; border-radius: 8px; padding: 12px 15px; color: white; font-size: 16px; }
      .profile-form input:focus { border-color: #8000FF; outline: none; background-color: #2c2c2e; }
      .profile-form input:disabled { background-color: #2c2c2e; color: #777; opacity: 0.7; cursor: not-allowed; border-color: #3a3a3c; }
      .input-hint { display: block; font-size: 12px; color: #666; margin-top: 6px; }
      .profile-form .form-buttons { display: flex; gap: 10px; margin-top: 25px; }
      .profile-form .btn { flex: 1; }
      .profile-form .btn.secondary { background-color: #3a3a3c; border-color: #555; }
      .profile-form .btn.secondary:hover { background-color: #4a4a4c; }
      .premium-banner { background: linear-gradient(45deg, rgba(67, 157, 254, 0.1), rgba(128, 0, 255, 0.1)); border: 1px solid rgba(128, 0, 255, 0.3); border-radius: 10px; padding: 15px; margin: 25px 0; display: flex; flex-direction: column; gap: 15px; text-align: left; }
      .premium-banner-content { display: flex; align-items: center; gap: 15px; }
      .premium-banner-icon { background: linear-gradient(45deg, #439DFE, #8000FF); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .premium-banner-icon svg { color: white; width: 20px; height: 20px; }
      .premium-banner-text h3 { margin: 0 0 5px 0; color: white; font-size: 16px;}
      .premium-banner-text p { margin: 0; font-size: 12px; color: #aaa; }
      .premium-upgrade-btn { background: linear-gradient(45deg, #439DFE, #8000FF); border: none; border-radius: 8px; padding: 10px; color: white; font-weight: bold; cursor: pointer; width: 100%; font-size: 14px; margin-top: 10px; }
      .premium-upgrade-btn:hover { opacity: 0.9; }
      .is-hidden { display: none !important; }
    `;
    document.head.appendChild(styles);
    console.log("Account Hub styles added/ensured.");
}