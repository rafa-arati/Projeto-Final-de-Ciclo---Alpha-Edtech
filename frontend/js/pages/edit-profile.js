import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { fetchCompleteUserData } from '../modules/auth.js';
import { getLoggedInUser, isAdmin } from '../modules/store.js';
import { checkPremiumStatus } from '../modules/events-api.js';

export default async function renderEditProfile(queryParams) {
  try {
    // Buscar dados completos do usuário
    const user = await fetchCompleteUserData();

    console.log('Dados do usuário:', user);

    // Verificar se o usuário está logado
    if (!user) {
      showMessage('Você precisa estar logado para acessar essa página');
      navigateTo('login');
      return;
    }

    // Verificar se o usuário é admin
    const isAdminUser = isAdmin();

    // Verificar status premium
    let premiumStatus = { status: 'none' };
    try {
      const premiumResponse = await checkPremiumStatus();
      premiumStatus = premiumResponse.subscription;
    } catch (error) {
      console.error('Erro ao verificar status premium:', error);
    }

    // Formatar telefone apenas se existir
    const formattedPhone = user?.phone ? formatPhoneNumber(user.phone) : '';

    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
      <div class="app-wrapper">
        <div class="app-container">
          <!-- Cabeçalho com botão de voltar -->
          <header style="padding: 20px 0 0 20px;">
            <a href="#events" class="back-button" style="display: inline-flex; align-items: center; color: white; text-decoration: none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span style="margin-left: 8px;">Perfil</span>
            </a>
          </header>
          
          <!-- Área de perfil -->
          <div style="padding: 20px; text-align: center;">
            <!-- Foto de perfil -->
            <div style="position: relative; width: 100px; height: 100px; margin: 0 auto; margin-bottom: 20px;">
              <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background-color: #333;">
                ${user.photo_url
        ? `<img src="${user.photo_url}" alt="Foto de perfil" style="width: 100%; height: 100%; object-fit: cover;">`
        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #fff;">${user.name?.charAt(0) || user.username?.charAt(0) || 'U'}</div>`
      }
              </div>
              <button id="alterar-foto-btn" style="position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #439DFE, #8000FF); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            
            <!-- Badge de premium/admin se for o caso -->
            ${user.role === 'admin'
        ? `<div class="user-badge admin-badge">Administrador</div>`
        : user.role === 'premium'
          ? `<div class="user-badge premium-badge">Usuário Premium</div>`
          : ''}
            
            ${isAdminUser ? `
            <!-- Botões administrativos (apenas para admins) -->
            <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 30px;">
              <button id="gerenciar-eventos-btn" style="background-color: #333; border: none; border-radius: 8px; padding: 8px 16px; color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Gerenciar eventos
              </button>
              
              <button id="metricas-btn" style="background-color: #333; border: none; border-radius: 8px; padding: 8px 16px; color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Métricas
              </button>
            </div>
            ` : (user.role === 'premium' ? `
            <!-- Botões para usuários premium -->
            <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 30px;">
              <button id="meus-eventos-btn" style="background-color: #333; border: none; border-radius: 8px; padding: 8px 16px; color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Meus eventos
              </button>
              
              <button id="criar-evento-btn" style="background: linear-gradient(45deg, #439DFE, #8000FF); border: none; border-radius: 8px; padding: 8px 16px; color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Criar evento
              </button>
            </div>
            ` : `
            <!-- Banner para usuários comuns fazerem upgrade -->
            <div class="premium-banner">
              <div class="premium-banner-content">
                <div class="premium-banner-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div class="premium-banner-text">
                  <h3>Torne-se Premium</h3>
                  <p>Crie seus próprios eventos e gere QR Codes promocionais</p>
                </div>
              </div>
              <button id="upgrade-btn" class="premium-upgrade-btn">Fazer Upgrade</button>
            </div>
            `)}
            
            <!-- Formulário de edição -->
            <form id="profileForm" style="max-width: 400px; margin: 0 auto; text-align: left;">
              <!-- Nome -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #8000FF; font-size: 14px;">Nome</label>
                <input type="text" id="name" value="${user.name || user.username || ''}" 
                  style="width: 100%; background-color: #222; border: none; border-radius: 8px; padding: 15px; color: white; font-size: 16px;">
              </div>
              
              <!-- Email (desativado) -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #8000FF; font-size: 14px;">E-mail</label>
                <input type="email" id="email" value="${user.email || ''}" disabled
                  style="width: 100%; background-color: #333; border: none; border-radius: 8px; padding: 15px; color: #aaa; font-size: 16px; opacity: 0.7; cursor: not-allowed;">
              </div>
              
              <!-- Telefone -->
              <div style="margin-bottom: 30px;">
                <label style="display: block; margin-bottom: 8px; color: #8000FF; font-size: 14px;">Telefone</label>
                <input type="tel" id="phone" value="${formattedPhone}" placeholder="(XX) XXXXX-XXXX" maxlength="15"
                  style="width: 100%; background-color: #222; border: none; border-radius: 8px; padding: 15px; color: white; font-size: 16px;">
                <small style="color: #666; font-size: 12px; margin-top: 5px; display: block;">Digite o DDD + número (11 dígitos)</small>
              </div>
              
              <!-- Botões -->
              <div style="display: flex; flex-direction: column; gap: 15px;">
                <button type="submit" style="background: linear-gradient(45deg, #439DFE, #8000FF); border: none; border-radius: 8px; padding: 15px; color: white; font-size: 16px; font-weight: bold; cursor: pointer;">Salvar Informações</button>
                <button type="button" id="logout-btn" style="background-color: #B33A3A; border: none; border-radius: 8px; padding: 15px; color: white; font-size: 16px; cursor: pointer;">Sair</button>
              </div>
            </form>
          </div>
          
          <!-- Menu de navegação inferior -->
          <footer class="bottom-nav">
            <div class="nav-item">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>Home</span>
            </div>
            <div class="nav-item">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>Procurar</span>
            </div>
            <div class="nav-item">
              <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
              </svg>
              <span>Agenda</span>
            </div>
            <div class="nav-item">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>Favoritos</span>
            </div>
            <div class="nav-item active">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>Perfil</span>
            </div>
          </footer>
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

    // Adicionar estilos para premium
    addPremiumStyles();

    // Configurar eventos
    setupProfileEvents(user);
    setupDevelopmentModal();
    setupFormEvents(user);
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showMessage('Erro ao carregar dados do perfil', 'error');
    navigateTo('events');
  }
}

// Formatação de número de telefone
function formatPhoneNumber(phoneFromDB) {
  if (!phoneFromDB) return '';

  // Remove formatações antigas
  const numbers = phoneFromDB.toString().replace(/\D/g, '');

  // Aplica a formatação correta
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  // Se não tiver 11 dígitos, retorna sem formatação
  return numbers;
}

// Configuração do modal de desenvolvimento
function setupDevelopmentModal() {
  const modal = document.getElementById("development-modal");
  const closeModal = document.getElementById("close-development-modal");
  const okBtn = document.getElementById("ok-development");

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (okBtn) {
    okBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  // Fechar ao clicar fora do modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });
}

// Configurar eventos da página de perfil
function setupProfileEvents(user) {
  // Botão para alterar foto (modal de desenvolvimento)
  document.getElementById('alterar-foto-btn')?.addEventListener('click', showDevelopmentModal);

  // Botão para upgrade para premium
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      navigateTo('premium');
    });
  }

  // Botões para usuários premium
  const criarEventoBtn = document.getElementById('criar-evento-btn');
  if (criarEventoBtn) {
    criarEventoBtn.addEventListener('click', () => {
      navigateTo('create-event');
    });
  }

  const meusEventosBtn = document.getElementById('meus-eventos-btn');
  if (meusEventosBtn) {
    meusEventosBtn.addEventListener('click', () => {
      navigateTo('events', { showMyEvents: true });
    });
  }

  // Botões administrativos (apenas para admins)
  const gerenciarEventosBtn = document.getElementById('gerenciar-eventos-btn');
  const metricasBtn = document.getElementById('metricas-btn');

  if (gerenciarEventosBtn) {
    gerenciarEventosBtn.addEventListener('click', showEventManagerModal);
  }

  if (metricasBtn) {
    metricasBtn.addEventListener('click', showDevelopmentModal);
  }

  // Item de menu Home
  document.querySelector('.nav-item:nth-child(1)').addEventListener('click', () => {
    navigateTo('events');
  });
}

// Exibe o modal de gerenciamento de eventos
function showEventManagerModal() {
  // Criar o modal dinamicamente
  const modalHTML = `
    <div class="modal" id="event-manager-modal">
      <div class="modal-content">
        <span class="close-modal" id="close-event-manager">&times;</span>
        <h3>Gerenciar Eventos</h3>
        <p>O que você gostaria de fazer?</p>
        <div class="modal-buttons">
          <button id="create-event-btn" class="btn" style="background: linear-gradient(45deg, #439DFE, #8000FF);">Criar Novo Evento</button>
          <button id="view-events-btn" class="btn secondary">Ver Todos os Eventos</button>
        </div>
      </div>
    </div>
  `;

  // Adicionar ao DOM se ainda não existir
  if (!document.getElementById('event-manager-modal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adicionar eventos aos botões
    document.getElementById('close-event-manager').addEventListener('click', () => {
      document.getElementById('event-manager-modal').classList.remove('active');
    });

    document.getElementById('create-event-btn').addEventListener('click', () => {
      document.getElementById('event-manager-modal').classList.remove('active');
      navigateTo('create-event');
    });

    document.getElementById('view-events-btn').addEventListener('click', () => {
      document.getElementById('event-manager-modal').classList.remove('active');
      navigateTo('events');
    });

    // Fechar ao clicar fora do modal
    document.getElementById('event-manager-modal').addEventListener('click', (event) => {
      if (event.target === document.getElementById('event-manager-modal')) {
        document.getElementById('event-manager-modal').classList.remove('active');
      }
    });
  }

  // Exibir o modal
  document.getElementById('event-manager-modal').classList.add('active');
}

// Configurar eventos do formulário
function setupFormEvents(user) {
  // Formatação de telefone
  document.getElementById('phone')?.addEventListener('input', function (e) {
    const cursorPosition = e.target.selectionStart;
    const formattedValue = enforcePhoneFormat(e.target.value);
    e.target.value = formattedValue;

    // Mantém posição do cursor após formatação
    if (cursorPosition === 1 && formattedValue.length === 1) {
      e.target.setSelectionRange(2, 2);
    } else if (cursorPosition === 3 && formattedValue.length === 3) {
      e.target.setSelectionRange(4, 4);
    } else if (cursorPosition === 9 && formattedValue.length === 9) {
      e.target.setSelectionRange(10, 10);
    } else {
      e.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  });

  // Evento de submit do formulário
  document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSubmit(user);
  });

  // Botão de logout
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

// Aplicar formatação de telefone
function enforcePhoneFormat(value) {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11);

  // Aplica a formatação exata
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
  }
}

// Exibe o modal de desenvolvimento
function showDevelopmentModal() {
  const modal = document.getElementById('development-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Submissão do formulário de perfil
async function handleSubmit(user) {
  const name = document.getElementById('name').value.trim();
  const rawPhone = document.getElementById('phone').value.replace(/\D/g, '');

  // Validações
  if (!name) {
    showMessage('Nome é obrigatório');
    return;
  }

  if (rawPhone && rawPhone.length !== 11) {
    showMessage('Telefone deve ter exatamente 11 dígitos (DDD + número)');
    return;
  }

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: name,
        phone: rawPhone || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha na atualização');
    }

    showMessage('Perfil atualizado com sucesso!');

    // Atualizar dados locais
    await fetchCompleteUserData();
  } catch (error) {
    console.error('Erro na atualização:', error);
    showMessage(error.message || 'Erro ao atualizar perfil');
  }
}

// Logout do usuário
async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      // Limpar dados do usuário no localStorage
      localStorage.removeItem('rota_cultural_user');

      // Redirecionar para login
      navigateTo('welcome-screen');
    } else {
      throw new Error('Falha ao fazer logout');
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    showMessage('Erro ao fazer logout');
  }
}

// Adicionar estilos específicos para o perfil com opções premium
function addPremiumStyles() {
  if (!document.getElementById('premium-profile-styles')) {
    const styles = document.createElement('style');
    styles.id = 'premium-profile-styles';
    styles.textContent = `
      .user-badge {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      
      .admin-badge {
        background-color: rgba(255, 69, 58, 0.2);
        color: #ff453a;
      }
      
      .premium-badge {
        background: linear-gradient(45deg, rgba(67, 157, 254, 0.2), rgba(128, 0, 255, 0.2));
        color: #8000FF;
      }
      
      .premium-banner {
        background: linear-gradient(45deg, rgba(67, 157, 254, 0.1), rgba(128, 0, 255, 0.1));
        border: 1px solid rgba(128, 0, 255, 0.3);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .premium-banner-content {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .premium-banner-icon {
        background: linear-gradient(45deg, #439DFE, #8000FF);
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .premium-banner-icon svg {
        color: white;
      }
      
      .premium-banner-text {
        text-align: left;
      }
      
      .premium-banner-text h3 {
        margin: 0 0 5px 0;
        color: white;
      }
      
      .premium-banner-text p {
        margin: 0;
        font-size: 14px;
        color: #aaa;
      }
      
      .premium-upgrade-btn {
        background: linear-gradient(45deg, #439DFE, #8000FF);
        border: none;
        border-radius: 8px;
        padding: 10px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
      }
    `;
    document.head.appendChild(styles);
  }
}