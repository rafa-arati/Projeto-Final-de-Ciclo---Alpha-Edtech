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
                <div class="social-btn google" id="googleLoginBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                </div>
                <div class="social-btn facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#1877F2"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </div>
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


    if (!identifier || !password) {
      showMessage('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const result = await loginUser(identifier, password); 
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
