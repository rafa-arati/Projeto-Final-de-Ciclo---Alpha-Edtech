import { navigateTo } from '../modules/router.js';
import { showMessage, transitionToPage } from '../modules/utils.js';

// Função principal que renderiza a tela inicial
export default function renderHome(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
        <div class="container">
            <div class="logo">
                <span>R</span><span>OTA</span><span>CULTURAL</span>
            </div>
            
            <h1>Bem-vindo!</h1>
            <p style="text-align: center; color: #bf7fff; margin-bottom: 30px; font-size: 16px;">Descubra e viva a cultura da sua cidade.</p>
            
            <button class="social-button" id="google-login">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
            </button>
              
            <button class="create-account" id="create-account-btn">Criar uma conta</button>
            
            <div class="terms">
                Ao se inscrever, você concorda com os <a href="#">Termos de Serviço</a> e a <a href="#">Política de Privacidade</a>, incluindo o uso de <a href="#">cookies</a>.
            </div>
            
            <div class="login-link">
                <p>Já tem uma conta?</p>
                <button class="login-button" id="login-btn">Entrar</button>
            </div>
        </div>
    `;

  setupInitialEvents();
}

// Configura os eventos da tela inicial
function setupInitialEvents() {
  // Botão para criar conta
  const createAccountBtn = document.getElementById('create-account-btn');
  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
      transitionToPage('welcome-screen', 'register');
    });
  }

  // Botão para login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      transitionToPage('welcome-screen', 'login');
    });
  }

  // Botões de login social
  const googleLoginBtn = document.getElementById('google-login');
  const appleLoginBtn = document.getElementById('apple-login');

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
      window.location.href = '/api/auth/google';
    });
  }

  if (appleLoginBtn) {
    appleLoginBtn.addEventListener('click', () => {
      showMessage('Login com Apple ainda não implementado');
    });
  }
}