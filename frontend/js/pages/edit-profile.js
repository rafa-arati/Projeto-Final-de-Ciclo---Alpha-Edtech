import { navigateTo } from '../modules/router.js';
import { showMessage, transitionToPage } from '../modules/utils.js'; // Assumindo que transitionToPage está em utils.js
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

// Ícones da Barra de Navegação Inferior
const homeIconNav = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const searchIconNav = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const agendaIconNav = `<svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/><path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/></svg>`;
const favoritesIconNav = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const profileIconNav = `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;


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
                    ` : ``
                    `}
                    ${isAdminUser ? `
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
                       <div class="form-group">
                        <label for="birthDate">Data de Nascimento</label>
                        <input type="date" id="birthDate" value="${formatDateForInput(user.birth_date)}">
                    </div>
                       <div class="form-buttons">
                            <button type="submit" class="btn btn-save">Salvar Alterações</button>
                            <button type="button" id="cancel-edit-btn" class="btn secondary">Cancelar</button>
                       </div>
                    </form>
                </div>

              </div> </div> <footer class="bottom-nav">
              <div class="nav-item" id="nav-home">
                ${homeIconNav}
                <span>Home</span>
              </div>
              <div class="nav-item" id="nav-agenda">
                ${agendaIconNav}
                <span>Agenda</span>
              </div>
              <div class="nav-item" id="nav-favorites">
                ${favoritesIconNav}
                <span>Favoritos</span>
              </div>
              <div class="nav-item active" id="nav-profile">
                ${profileIconNav}
                <span>Perfil</span>
              </div>
            </footer>
            </div> <div class="modal" id="development-modal">
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

        addAccountHubStyles(); // Garante que os estilos CSS sejam carregados/existam
        setupAccountHubEvents(user); // Configura TODOS os eventos da página, incluindo a nova barra
        setupDevelopmentModal(); // Configura o modal de "em desenvolvimento"

      } catch (error) {
        console.error('Erro fatal ao carregar Conta/Perfil:', error);
        showMessage('Erro ao carregar seus dados. Tente novamente.', 'error');
        navigateTo('events');
      }
}

// --- Funções Auxiliares ---

/**
 * Formata uma string de data ou objeto Date para o formato YYYY-MM-DD.
 * @param {string|Date|null} dateString - A data do usuário.
 * @returns {string} Data formatada ou string vazia.
 */
function formatDateForInput(dateString) {
  if (!dateString) return ''; // Retorna vazio se não houver data
  try {
    // Cria um objeto Date. Funciona com YYYY-MM-DD ou objetos Date.
    const date = new Date(dateString);
    
    // Importante: Ajusta para o fuso horário local para evitar problemas de um dia a menos/mais
    // ao converter para string ISO se a data original não tiver fuso específico.
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 

    if (isNaN(date.getTime())) return ''; // Retorna vazio se a data for inválida

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é 0-11, adiciona 1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Erro ao formatar data para input:", e);
    return ''; // Retorna vazio em caso de erro
  }
}

// Formata número de telefone para exibição (Ex: (XX) XXXXX-XXXX)
function formatPhoneNumber(phoneFromDB) {
    if (!phoneFromDB) return '';
    const numbers = phoneFromDB.toString().replace(/\D/g, '');
    if (numbers.length === 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    if (numbers.length === 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return numbers; // Retorna apenas números se não bater com 10 ou 11 dígitos
}

// Aplica máscara enquanto o usuário digita no campo telefone
function enforcePhoneFormat(value) {
    const numbers = value.replace(/\D/g, '');
    const len = numbers.length;
    if (len === 0) return '';
    if (len <= 2) return `(${numbers}`;
    if (len <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    // Adapta para 8 ou 9 dígitos no número principal
    if (len <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    // Assume 9 dígitos como padrão se passar de 10
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

// Configura o modal genérico de "Em desenvolvimento"
function setupDevelopmentModal() {
    const modal = document.getElementById("development-modal");
    const closeModalBtn = document.getElementById("close-development-modal");
    const okBtn = document.getElementById("ok-development");
    if (!modal || !closeModalBtn || !okBtn) return;

    const closeModalFunc = () => modal.classList.remove('active');

    // Limpeza de listeners antigos antes de adicionar novos
    closeModalBtn.replaceWith(closeModalBtn.cloneNode(true));
    document.getElementById("close-development-modal").addEventListener("click", closeModalFunc);

    okBtn.replaceWith(okBtn.cloneNode(true));
    document.getElementById("ok-development").addEventListener("click", closeModalFunc);

    // Fechar ao clicar fora (handler global, limpar antes de adicionar)
    const closeDevModalOnClickOutside = (event) => { if (modal && event.target === modal) { modal.classList.remove("active"); } };
    window.removeEventListener("click", closeDevModalOnClickOutside); // Remove anterior
    window.addEventListener("click", closeDevModalOnClickOutside); // Adiciona novo
}

// Mostra o modal de "Em desenvolvimento"
function showDevelopmentModal() {
    const modal = document.getElementById('development-modal');
    if (modal) modal.classList.add('active');
}

// Mostra o formulário de edição e esconde a lista de ações
function showEditForm() {
    document.getElementById('actionList')?.classList.add('is-hidden');
    document.getElementById('userInfoDisplay')?.classList.add('is-hidden'); // Esconde também a imagem/nome
    document.getElementById('editFormContainer')?.classList.remove('is-hidden');
    document.getElementById('account-hub-title').textContent = 'Editar Informações'; // Muda o título do header
}

// Mostra a lista de ações e esconde o formulário de edição
function showActionList() {
    document.getElementById('actionList')?.classList.remove('is-hidden');
    document.getElementById('userInfoDisplay')?.classList.remove('is-hidden'); // Mostra imagem/nome de volta
    document.getElementById('editFormContainer')?.classList.add('is-hidden');
    document.getElementById('account-hub-title').textContent = 'Minha Conta'; // Restaura título
}

/**
 * Configura todos os event listeners da página de conta/hub, incluindo a barra de navegação.
 * @param {object} user - Os dados do usuário atual.
 */
function setupAccountHubEvents(user) {
    console.log("Setting up Account Hub events...");

    // Função auxiliar para limpar e adicionar listeners
    const cleanAndAddListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            const newElement = element.cloneNode(true); // Cria um clone
            element.parentNode.replaceChild(newElement, element); // Substitui o original pelo clone (remove listeners antigos)
            newElement.addEventListener(event, handler); // Adiciona listener ao clone
        } else {
            console.warn(`Elemento com ID #${id} não encontrado para adicionar listener.`);
        }
    };

    // Botão Voltar do Header Principal
    cleanAndAddListener('profile-back-button', 'click', (e) => {
        e.preventDefault();
        const editFormContainer = document.getElementById('editFormContainer');
        if (editFormContainer && !editFormContainer.classList.contains('is-hidden')) {
            showActionList(); // Se editando, volta para lista de ações
        } else {
            navigateTo('events'); // Se na lista de ações, volta para eventos
        }
    });

    // Botão Alterar Foto (Display)
    cleanAndAddListener('alterar-foto-btn-display', 'click', showDevelopmentModal);

    // Botão Editar Informações Pessoais (mostra o formulário)
    cleanAndAddListener('edit-info-btn', 'click', showEditForm);

    // Botão Cancelar Edição (esconde o formulário)
    cleanAndAddListener('cancel-edit-btn', 'click', (e) => {
        e.preventDefault();
        showActionList();
    });

    // Botão Meus Eventos
    cleanAndAddListener('meus-eventos-btn', 'click', () => navigateTo('events', { showMyEvents: 'true' }));

    // Botão Criar Evento
    cleanAndAddListener('criar-evento-btn', 'click', () => navigateTo('create-event'));

    // Botão Gerenciar Todos Eventos (Admin)
    cleanAndAddListener('gerenciar-eventos-btn', 'click', () => navigateTo('manage-events')); // Vai para a tela de gerenciamento

    // Botão Métricas (Admin)
    cleanAndAddListener('metricas-btn', 'click', showDevelopmentModal);

    // Botão Upgrade Premium
    cleanAndAddListener('upgrade-btn', 'click', () => navigateTo('premium'));

    // Botão Logout
    cleanAndAddListener('logout-btn', 'click', async (e) => {
        console.log("Logout button clicked");
        const button = e.currentTarget;
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `${logoutIcon} Saindo...`;
        try {
            await logoutUser();
            clearUser(); // Limpa dados do localStorage
            navigateTo('welcome-screen'); // Vai para a tela de boas-vindas/login
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            showMessage('Erro ao sair. Tente novamente.');
            clearUser(); // Limpa dados mesmo em caso de erro
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

    // Formulário de Submit (edição de perfil)
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        const newProfileForm = profileForm.cloneNode(true);
        profileForm.parentNode.replaceChild(newProfileForm, profileForm);
        // --- SUBSTITUA A PARTIR DAQUI ---
        newProfileForm.addEventListener('submit', async (e) => {
             e.preventDefault();
            const nameInput = document.getElementById('name');
            const phoneInputSubmit = document.getElementById('phone');
            const birthDateInput = document.getElementById('birthDate');

            // Pega os valores dos inputs
            const name = nameInput ? nameInput.value.trim() : '';
            const rawPhone = phoneInputSubmit ? phoneInputSubmit.value.replace(/\D/g, '') : ''; 
            const birthDateValue = birthDateInput ? birthDateInput.value : null; // Formato AAAA-MM-DD ou vazio

            // --- Validações ---
            if (!name) {
                showMessage('Nome é obrigatório'); 
                return; 
            }
            if (rawPhone && (rawPhone.length < 10 || rawPhone.length > 11)) {
                showMessage('Telefone inválido. Use DDD + número (10 ou 11 dígitos).'); 
                return;
            }
            // Você pode adicionar validações para birthDateValue aqui se desejar
            // (ex: verificar se não é uma data futura)

            // --- CORREÇÃO: Monta o objeto bodyData ANTES do fetch ---
            const bodyData = {
                name: name,
                phone: rawPhone || null, // Envia null para o backend se o telefone estiver vazio
                birth_date: birthDateValue || null // Envia null para o backend se a data estiver vazia
            };
            console.log("Dados que serão enviados para API:", bodyData); // Log para debug
            // --- FIM DA CORREÇÃO ---

            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Salvando...';

            try {
                // --- CORREÇÃO: Corrige o 'body' da chamada fetch ---
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', 
                    body: JSON.stringify(bodyData) // <<< Envia o objeto bodyData corretamente formatado
                });
                // --- FIM DA CORREÇÃO ---
                
                const data = await response.json();
                if (!response.ok) {
                    // Tenta pegar a mensagem de erro específica do backend
                    throw new Error(data.message || `Falha ao atualizar (Status: ${response.status})`);
                }

                showMessage('Perfil atualizado com sucesso!');
                
                // Atualiza dados do usuário no localStorage com a resposta (incluindo birth_date)
                // Certifique-se que o backend retorna 'birth_date' no objeto 'data.data'
                const updatedUserData = { 
                    ...user, 
                    name: data.data.name, 
                    phone: data.data.phone, 
                    birth_date: data.data.birth_date // <<< Pega a data atualizada da resposta
                };
                saveUser(updatedUserData); // Salva no localStorage
                console.log("LocalStorage atualizado:", updatedUserData);
                
                // Atualiza nome exibido na tela (se visível)
                const displayNameElement = document.querySelector('.user-display-name');
                if (displayNameElement) {
                   displayNameElement.textContent = updatedUserData.name || updatedUserData.username || 'Usuário';
                }

                showActionList(); // Volta para a lista de ações

            } catch (error) {
                console.error('Erro na atualização do perfil:', error);
                showMessage(error.message || 'Erro ao atualizar perfil. Tente novamente.');
            } finally {
                // Garante que o botão seja reabilitado
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        });
     }

    // --- Listeners para a Barra de Navegação Inferior ---
    console.log("Setting up bottom navigation listeners...");
    cleanAndAddListener('nav-home', 'click', () => navigateTo('events'));
    cleanAndAddListener('nav-search', 'click', showDevelopmentModal); // Altere para navigateTo('search') se implementar
    cleanAndAddListener('nav-agenda', 'click', () => navigateTo('agenda'));
    cleanAndAddListener('nav-favorites', 'click', showDevelopmentModal); // Altere para navigateTo('favorites') se implementar
    cleanAndAddListener('nav-profile', 'click', () => {
        // Se já está na página de perfil e editando, volta para a lista de ações
        const editFormContainer = document.getElementById('editFormContainer');
        if (editFormContainer && !editFormContainer.classList.contains('is-hidden')) {
             showActionList();
        }
        console.log("Profile nav item clicked (already on page).");
        // Não precisa fazer nada se já estiver na visualização principal do perfil
    });
    // --- FIM: Listeners para a Barra de Navegação Inferior ---

    console.log("Account Hub events set up complete.");
}


/**
 * Adiciona ou garante que os estilos CSS necessários para a página de conta/hub existam.
 * (Pode ser otimizado movendo estilos para arquivos CSS globais/específicos)
 */
function addAccountHubStyles() {
    const styleId = 'account-hub-styles';
    if (document.getElementById(styleId)) return; // Já existe

    console.log("Adding Account Hub page styles...");
    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
      /* Estilos para a página Minha Conta / Editar Perfil */
      .account-hub-page .profile-content { padding: 0 20px 100px; /* Mais espaço inferior por causa do nav */ text-align: center; }
      /* ... (outros estilos de .profile-header, .profile-image-container, .user-display-name, .user-badge, etc. como definidos anteriormente) ... */
      .account-hub-page .page-header { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #222; margin-bottom: 20px; }
      .account-hub-page .page-header h1 { flex-grow: 1; text-align: center; margin: 0; font-size: 1.25rem; font-weight: 600; color: #eee; padding-right: 44px; /* Compensa botão voltar */ }
      .account-hub-page .back-button { background: none; border: none; color: #ccc; padding: 5px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 34px; flex-shrink: 0; margin-right: 10px; }
      .account-hub-page .back-button:hover { color: white; }
      .account-hub-page .back-button svg { width: 24px; height: 24px; }

      #userInfoDisplay { margin-bottom: 30px; margin-top: 10px; }
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

      .profile-form-container { max-width: 450px; margin: 0 auto; /* Removido margin top */ }
      .profile-form { text-align: left; padding-top: 20px; /* Adicionado padding top */}
      .profile-form .form-group { margin-bottom: 20px; }
      .profile-form label { display: block; margin-bottom: 8px; color: #aaa; font-size: 14px; font-weight: 500; }
      .profile-form input { width: 100%; box-sizing: border-box; background-color: #1c1c1e; border: 1px solid #3a3a3c; border-radius: 8px; padding: 12px 15px; color: white; font-size: 16px; }
      .profile-form input:focus { border-color: #8000FF; outline: none; background-color: #2c2c2e; }
      .profile-form input:disabled { background-color: #2c2c2e; color: #777; opacity: 0.7; cursor: not-allowed; border-color: #3a3a3c; }
      .input-hint { display: block; font-size: 12px; color: #666; margin-top: 6px; }
      .profile-form .form-buttons { display: flex; gap: 10px; margin-top: 25px; }
      .profile-form .btn { flex: 1; padding: 12px; /* Ajuste padding se necessário */ }
      .profile-form .btn-save { background: linear-gradient(45deg, #439DFE, #8000FF); color: white;}
      .profile-form .btn.secondary { background-color: #3a3a3c; border-color: #555; color: #ccc; }
      .profile-form .btn.secondary:hover { background-color: #4a4a4c; }

      .is-hidden { display: none !important; }
    `;
    document.head.appendChild(styles);
    console.log("Account Hub styles added/ensured.");
}