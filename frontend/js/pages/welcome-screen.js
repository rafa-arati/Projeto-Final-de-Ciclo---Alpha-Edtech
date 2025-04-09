// frontend/js/pages/welcome-screen.js

import { navigateTo } from '../modules/router.js';
import { showMessage, transitionToPage } from '../modules/utils.js';

export default function renderHome(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div class="welcome-page-wrapper">
      <div class="welcome-container desktop-layout">

        <div class="welcome-left">
          <div class="desktop-logo logo"> 
              <div class="logo-line1">
                 <span>R</span><span>OTA</span>
              </div>
              <div class="logo-line2">
                 <span>CULTURAL</span>
              </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
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

  setupInitialEvents();
}

// Função setupInitialEvents permanece a mesma (ou remova o listener do Apple se removeu o botão)
function setupInitialEvents() {
  document.getElementById('create-account-btn')?.addEventListener('click', () => {
    transitionToPage('welcome-screen', 'register');
  });
  document.getElementById('login-btn')?.addEventListener('click', () => {
    transitionToPage('welcome-screen', 'login');
  });
  document.getElementById('google-login')?.addEventListener('click', () => {
    window.location.href = '/api/auth/google';
  });
}