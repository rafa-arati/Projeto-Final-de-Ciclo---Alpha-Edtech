// frontend/js/pages/welcome-screen.js (VERSÃO COMPLETA FINAL CORRIGIDA)

// Importações Essenciais
import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
// Importa SOMENTE getLoginFormHTML de login.js (Garanta que login.js está correto!)
import { getLoginFormHTML } from './login.js';
import { loginUser } from '../modules/auth.js'; // Função da API de Login

// Variável global no escopo do módulo para rastrear o modal
let dynamicLoginModal = null;

// Função principal que renderiza a tela inicial
export default function renderHome(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) { console.error("[welcome] Elemento #app não encontrado!"); return; }

  // Cole SEU HTML original da tela inicial aqui (verifique ID 'login-btn')
  appContainer.innerHTML = `
    <div class="welcome-page-wrapper">
        <div class="welcome-container desktop-layout">
          <div class="welcome-left">
            <div class="desktop-logo logo">
                <div class="logo-line1"><span>R</span><span>OTA</span></div>
                <div class="logo-line2"><span>CULTURAL</span></div>
            </div>
          </div>
          <div class="welcome-right">
            <div class="mobile-logo logo">
                <span>R</span><span>OTA</span><span>CULTURAL</span>
            </div>
            <h1 class="welcome-title">Bem-vindo!</h1>
            <p class="welcome-original-subtitle">
                Descubra e viva a cultura da sua cidade.
            </p>
            <div class="action-buttons">
              <button class="social-button project-style google" id="google-login">
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Entrar com Google
              </button>
              <button class="create-account project-gradient" id="create-account-btn">Criar uma conta</button>
            </div>
            <div class="existing-account">
              <h3 class="existing-account-title">Já tem uma conta?</h3>
              <button class="login-button project-outlined" id="login-btn">Entrar</button> 
            </div>
            <div class="terms">
                Ao se inscrever, você concorda com os <a href="#">Termos de Serviço</a> e a <a href="#">Política de Privacidade</a>, incluindo o <a href="#">Uso de Cookies</a>.
            </div>
          </div>
        </div>
    </div>
  `;

  setupWelcomeScreenEvents();
}

// Adiciona listeners APENAS para os botões DA TELA INICIAL
function setupWelcomeScreenEvents() {
  const loginBtn = document.getElementById('login-btn');
  const createAccountBtn = document.getElementById('create-account-btn');
  const googleLoginBtn = document.getElementById('google-login');

  if (loginBtn) {
    loginBtn.addEventListener('click', openDynamicLoginModal); // Chama ABRIR modal
  } else { console.error("[welcome] Botão #login-btn não encontrado!"); }

  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => navigateTo('register'));
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => window.location.href = '/api/auth/google');
  }
}

// --- LÓGICA DO MODAL DINÂMICO ---

function openDynamicLoginModal() {
  if (document.getElementById('login-modal-dynamic')) { console.warn("Modal já existe"); return; }
  console.log("[welcome] Criando modal dinâmico...");

  dynamicLoginModal = document.createElement('div');
  dynamicLoginModal.id = 'login-modal-dynamic'; // ID para CSS
  dynamicLoginModal.className = 'modal-overlay'; // Classe para CSS
  dynamicLoginModal.style.display = 'none'; // Começa invisível

  try {
    // Gera o HTML interno do modal, incluindo o formulário
    dynamicLoginModal.innerHTML = `
      <div id="login-modal-container" class="modal-container">
          <button id="close-login-modal-dynamic" class="modal-close-btn">&times;</button>
          <div id="login-modal-content-dynamic">
              ${getLoginFormHTML()}
          </div>
      </div>
    `;
  } catch (error) {
      console.error("[welcome] Erro ao gerar HTML do formulário:", error);
      // Verifica se o erro é porque login.js não tem getLoginFormHTML
      if (error instanceof TypeError && error.message.includes('getLoginFormHTML is not a function')) {
         showMessage("Erro: Arquivo login.js não está configurado corretamente.", "error");
      } else {
         showMessage("Erro ao carregar o formulário de login.", "error");
      }
      return;
  }

  document.body.appendChild(dynamicLoginModal); // Adiciona ao final do body
  console.log("[welcome] Modal adicionado ao DOM.");

  // Adiciona listeners DEPOIS que o HTML está no DOM
  addInternalLoginFormListeners(); // <<< Chama a função LOCAL para adicionar listeners do FORM
  addModalCloseListeners(); // Adiciona listeners para FECHAR o modal

  // Truque para garantir que a transição CSS funcione corretamente
  requestAnimationFrame(() => {
      requestAnimationFrame(() => {
          dynamicLoginModal.style.display = 'flex'; // Ou 'block'
           dynamicLoginModal.classList.add('visible'); // Ativa a visibilidade via CSS
           document.body.style.overflow = 'hidden'; // Trava scroll
           console.log("[welcome] Modal tornado visível.");
      });
  });
}

// Adiciona listeners específicos para FECHAR o modal
function addModalCloseListeners() {
    const closeBtn = document.getElementById('close-login-modal-dynamic');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDynamicLoginModal);
    } else { console.error("[welcome] Botão fechar dinâmico não encontrado."); }
    dynamicLoginModal.addEventListener('click', handleDynamicOverlayClick);
}

// Adiciona listeners PARA O FORMULÁRIO dentro do modal
function addInternalLoginFormListeners() {
    console.log("[welcome] Adicionando listeners INTERNOS do formulário...");
    // Usa os IDs únicos definidos em getLoginFormHTML
    const loginForm = document.getElementById('loginFormModal');
    const googleLoginBtn = document.getElementById('loginGoogleBtnModal');
    const forgotPasswordLink = document.getElementById('loginForgotPasswordModal');
    const registerLink = document.getElementById('loginRegisterLinkModal');

    // Adiciona listeners chamando os handlers LOCAIS deste arquivo
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    else console.warn("[welcome] Formulário #loginFormModal não encontrado.");

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleLogin);
    else console.warn("[welcome] Botão #loginGoogleBtnModal não encontrado.");

    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', handleForgotPassword);
    else console.warn("[welcome] Link #loginForgotPasswordModal não encontrado.");

    if (registerLink) registerLink.addEventListener('click', handleRegister);
    else console.warn("[welcome] Link #loginRegisterLinkModal não encontrado.");

    console.log("[welcome] Listeners INTERNOS adicionados.");
}

// Função para FECHAR e REMOVER o modal
function closeDynamicLoginModal() {
  if (!dynamicLoginModal) return; // Só executa se o modal existe
  console.log("[welcome] Fechando modal dinâmico...");

  // Remove listeners de fechar para evitar leaks
  const closeBtn = document.getElementById('close-login-modal-dynamic');
  if (closeBtn) closeBtn.removeEventListener('click', closeDynamicLoginModal);
  // Remove o listener do overlay APENAS se ele ainda existir
  if(dynamicLoginModal) dynamicLoginModal.removeEventListener('click', handleDynamicOverlayClick);

  dynamicLoginModal.classList.remove('visible'); // Inicia animação CSS de saída
  document.body.style.overflow = ''; // Libera scroll do fundo

  // Define uma função para remover o modal do DOM
  const removeModalElement = () => {
    if (dynamicLoginModal) { // Verifica se ainda existe antes de remover
        console.log("[welcome] Removendo modal do DOM.");
        dynamicLoginModal.remove();
        dynamicLoginModal = null; // Limpa a referência global
    }
  };

  // Espera a transição CSS terminar E remove
  // Usa 'transitionend' que é mais confiável para animações CSS
  dynamicLoginModal.addEventListener('transitionend', removeModalElement, { once: true });

  // Fallback: Remove após um tempo um pouco maior que a transição, caso transitionend não dispare
  setTimeout(() => {
    if (dynamicLoginModal && !dynamicLoginModal.classList.contains('visible')) {
      removeModalElement();
    }
  }, 350); // Tempo em ms (ajuste se a transição for diferente)
}

// Fecha ao clicar no fundo (overlay)
function handleDynamicOverlayClick(event) {
    // Garante que o clique foi no overlay e não em conteúdo dentro dele
    if (event.target.id === 'login-modal-dynamic') {
        console.log("[welcome] Clique no overlay.");
        closeDynamicLoginModal();
    }
}

// --- Handlers para ações DENTRO do modal (Funções Corrigidas) ---

// ***** ESTA É A FUNÇÃO QUE TRATA O LOGIN E DEVE REDIRECIONAR/FECHAR *****
async function handleLoginSubmit(event) {
    event.preventDefault(); // Previne recarregamento da página
    console.log("[welcome modal] Submit do formulário.");
    // IDs únicos definidos em getLoginFormHTML
    const identifierInput = document.getElementById('loginIdentifierModal');
    const passwordInput = document.getElementById('loginPasswordModal');
    const loginButton = document.getElementById('loginSubmitBtnModal'); // ID específico do botão

    // Validação básica
    if (!identifierInput || !passwordInput || !loginButton) {
        console.error("[welcome modal] Inputs/Botão não encontrados no submit.");
        showMessage("Erro interno no formulário.", "error");
        return;
    }
    if (!identifierInput.value || !passwordInput.value) {
        showMessage("Por favor, preencha email/usuário e senha.", "warning");
        return;
    }

    const identifier = identifierInput.value;
    const password = passwordInput.value;

    // Feedback visual e desabilita botão
    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';
    console.log("[welcome modal] Chamando API loginUser...");

    try {
        const result = await loginUser(identifier, password); // Chama a API de login
        console.log("[welcome modal] Resposta da API loginUser:", result); // LOG IMPORTANTE

        // VERIFICA O RESULTADO DA API
        // ***** IMPORTANTE: Usar a verificação CORRIGIDA baseada na resposta do SEU backend *****
        // Se o backend AGORA envia 'success: true', esta condição está correta.
        // Se o backend NÃO envia 'success: true', mas você sabe que deu certo se 'result.user' existe,
        // você poderia MUDAR a condição para if (result && result.user), MAS O IDEAL É CORRIGIR O BACKEND.
        if (result && result.success === true) {
            console.log("[welcome modal] Login API SUCESSO.");
            showMessage('Login bem-sucedido! Redirecionando...', 'success', 2000); // Mostra por 2s

            // <<< FECHA O MODAL >>>
            closeDynamicLoginModal(); // Chama a função para fechar
            console.log("[welcome modal] Modal fechado após sucesso.");

            // <<< REDIRECIONA >>>
            // Pequeno delay APÓS fechar o modal para garantir que a UI atualize
            setTimeout(() => {
                // Verifica se precisa ir para onboarding ou eventos
                // Garanta que result.user.onboarding_completed está sendo enviado pelo backend
                if (result.user && result.user.onboarding_completed === false) {
                    console.log("[welcome modal] Redirecionando para ONBOARDING...");
                    navigateTo('onboarding');
                } else {
                    // Redireciona para a tela de eventos como padrão se onboarding estiver completo ou indefinido
                    console.log("[welcome modal] Redirecionando para EVENTS...");
                    navigateTo('events');
                }
            }, 150); // 150ms de delay

        } else {
            // Login falhou (API retornou success: false ou algo inesperado)
            console.warn("[welcome modal] Login API FALHA:", result?.message);
            showMessage(result?.message || 'Falha no login. Verifique suas credenciais.', 'error');
         
            closeDynamicLoginModal();
            console.log("[welcome modal] Modal fechado após falha no login.");
        }
    } catch (error) {
        // Erro na comunicação com a API (ex: rede, servidor fora)
        console.error('[welcome modal] Erro CATCH na chamada loginUser:', error);
        showMessage(error?.message || 'Erro de comunicação. Tente novamente.', 'error');
        closeDynamicLoginModal(); // <<< fecha modal em caso de erro
        loginButton.disabled = false; // Reabilita o botão
        loginButton.textContent = 'LOGIN'; // Restaura o texto
    }
}

// Handler para o botão Google
function handleGoogleLogin() {
    console.log("[welcome modal] Clicado em Login Google.");
    window.location.href = '/api/auth/google'; // Redireciona para rota do backend
}

// Handler para o link "Esqueci Senha"
function handleForgotPassword(event) {
    event.preventDefault();
    console.log("[welcome modal] Clicado em Esqueci Senha.");
    closeDynamicLoginModal(); // Fecha modal
    setTimeout(() => navigateTo('forgot-password'), 150); // Navega após delay
}

// Handler para o link "Cadastre-se"
function handleRegister(event) {
    event.preventDefault();
    console.log("[welcome modal] Clicado em Cadastre-se.");
    closeDynamicLoginModal(); // Fecha modal
    setTimeout(() => navigateTo('register'), 150); // Navega após delay
}