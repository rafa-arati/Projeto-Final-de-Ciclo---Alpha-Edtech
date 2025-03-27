import { loginUser } from '../modules/auth.js';
import { navigateTo } from '../modules/router.js';
import { showMessage, transitionToPage } from '../modules/utils.js';

// Exporta a função principal da página
export default function renderLogin(queryParams) {
  // Verifica se há erro na URL
  const error = queryParams.get('error');
  if (error) {
    // Mostra mensagem de erro específica
    setTimeout(() => {
      if (error === 'google_login_failed') {
        showMessage('Falha ao fazer login com Google. Tente novamente.');
      } else if (error === 'auth_failed') {
        showMessage('Autenticação falhou. Tente novamente.');
      } else if (error === 'server_error') {
        showMessage('Erro no servidor. Tente novamente mais tarde.');
      }
    }, 500);
  }

  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
       <div class="container login-container">
            <div class="logo"><span>R</span>OTA<span>CULTURAL</span></div>
            <div class="welcome">Bem-vindo!</div>

            <div class="toggle-form">
                <button class="toggle-btn active" id="user-login-btn">Usuário</button>
                <button class="toggle-btn" id="admin-login-btn">Administrador</button>
            </div>

            <form id="loginForm">
                <input type="hidden" id="userType" value="user">

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                        </svg>
                    </div>
                    <input type="text" id="loginIdentifier" placeholder="Email ou Nome de Usuário" required>
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <input type="password" id="loginPassword" placeholder="Senha" required>
                </div>

                <button type="submit" class="btn login-btn">LOGIN</button>
            </form>

            <div class="forgot-password">Esqueceu a senha?</div>

            <div class="divider">Ou entre com</div>

            <div class="social-login">
                <div class="social-btn instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <defs>
                            <radialGradient id="instagram-gradient" cx="0%" cy="100%" r="150%">
                                <stop offset="0%" stop-color="#fdf497"></stop>
                                <stop offset="5%" stop-color="#fdf497"></stop>
                                <stop offset="45%" stop-color="#fd5949"></stop>
                                <stop offset="60%" stop-color="#d6249f"></stop>
                                <stop offset="90%" stop-color="#285AEB"></stop>
                            </radialGradient>
                        </defs>
                        <path fill="url(#instagram-gradient)"
                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                </div>
                <div class="social-btn facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#1877F2"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </div>
                <div class="social-btn google">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#EA4335"
                            d="M5.266 9.765C6.199 6.766 9.25 4.5 12.97 4.5c2.027 0 3.822.789 5.21 2.071l-2.12 2.12c-.878-.761-2.003-1.226-3.09-1.226-2.652 0-4.857 2.13-4.857 4.742v.08c0 2.611 2.205 4.742 4.857 4.742 1.704 0 2.885-.65 3.623-1.517 0 0 .963-1.19 1.069-1.288v-.008h-4.692v-2.977h7.905c.084.389.122.84.122 1.343 0 1.926-.494 4.305-2.088 5.993C17.004 19.654 15.201 20.5 12.97 20.5c-3.718 0-6.77-2.266-7.703-5.265h-.001z" />
                        <path fill="#FBBC05"
                            d="M5.266 14.235h-.001c-.16-.599-.242-1.225-.242-1.868 0-.644.08-1.271.244-1.869h.001C6.19 7.298 9.242 5.03 12.969 5.03c2.027 0 3.823.79 5.21 2.071l-2.119 2.121c-.879-.761-2.004-1.226-3.091-1.226-2.652 0-4.856 2.131-4.856 4.742v.081c0 2.611 2.204 4.742 4.856 4.742 1.705 0 2.887-.65 3.624-1.517 0 0 .963-1.191 1.069-1.29h-4.693V11.78h7.881c.136.724.201 1.475.201 2.241 0 2.829-1.019 5.254-2.833 6.891-1.709 1.547-4.037 2.346-6.349 2.346-3.717 0-6.769-2.267-7.702-5.265" />
                        <path fill="#34A853"
                            d="M12.969 20.5c3.716 0 6.767-2.267 7.7-5.265h-.001c-.16-.599-.242-1.225-.242-1.869 0-.644.08-1.271.244-1.868h.001C19.79 7.299 16.738 5.031 13.01 5.031c-2.027 0-3.822.789-5.21 2.07l2.12 2.12c.879-.76 2.003-1.226 3.09-1.226 2.653 0 4.858 2.131 4.858 4.742v.08c0 2.612-2.205 4.743-4.857 4.743-1.704 0-2.886-.65-3.623-1.517l-2.357 2.356c1.613 1.517 3.809 2.1 5.92 2.1v.001z" />
                        <path fill="#4285F4"
                            d="M20.894 8.28c0-.108-.013-.216-.023-.323H12.97v2.957h4.62l-.878 1.874c-.411.852-1.116 1.58-2.012 2.082l2.356 2.357c1.614-1.517 2.697-3.67 2.697-6.946h.141z" />
                    </svg>
                </div>
            </div>

            <div class="bottom-text">
                Não tem uma conta? <a id="goToRegister">Cadastre-se</a>
            </div>
        </div>
    `;
  setupLoginEvents();
}

// Configura eventos da página
function setupLoginEvents() {
  setupToggleButtons();
  setupLoginForm();
  setupForgotPassword();
  setupSocialButtons();
  setupRegisterLink();
}

// Helper: Botões de toggle (usuário/admin)
function setupToggleButtons() {
  const userLoginBtn = document.getElementById('user-login-btn');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const userTypeInput = document.getElementById('userType');

  if (userLoginBtn && adminLoginBtn) {
    userLoginBtn.addEventListener('click', () => {
      userLoginBtn.classList.add('active');
      adminLoginBtn.classList.remove('active');
      userTypeInput.value = 'user';
    });

    adminLoginBtn.addEventListener('click', () => {
      adminLoginBtn.classList.add('active');
      userLoginBtn.classList.remove('active');
      userTypeInput.value = 'admin';
    });
  }
}

// Helper: Formulário de login
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('userType').value;

    if (!identifier || !password) {
      showMessage('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const result = await loginUser(identifier, password, userType);

      if (userType === 'admin' && result.user.role !== 'admin') {
        showMessage('Você não tem permissões de administrador.');
        return;
      }

      showMessage('Login bem-sucedido! Redirecionando...');
      setTimeout(() => navigateTo('events'), 1500);
    } catch (error) {
      showMessage(error.message || 'Falha no login. Verifique suas credenciais.');
    }
  });
}

// Helper: Link "Esqueceu a senha"
function setupForgotPassword() {
  document.querySelector('.forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    transitionToPage('login', 'forgot-password');
  });
}

// Helper: Botões de login social
function setupSocialButtons() {
  // Configuração do botão de login com Google
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
    // Redireciona para a rota de autenticação do Google no backend
    window.location.href = '/api/auth/google';
  });

  // Outros botões sociais (Facebook, Instagram) - ainda não implementados
  const otherSocialBtns = document.querySelectorAll('.social-btn:not(.google)');
  otherSocialBtns.forEach(button => {
    button.addEventListener('click', () => {
      showMessage('Login social em desenvolvimento.');
    });
  });
}

// Helper: Link para cadastro
function setupRegisterLink() {
  document.getElementById('goToRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    transitionToPage('login', 'register');
  });
}
