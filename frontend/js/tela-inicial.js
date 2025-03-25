// Função para renderizar a tela inicial
export function renderTelaInicial() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    const initialHTML = `
        <div class="container">
            <div class="status-bar">
                <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div class="logo">
                <span>R</span><span>OTA</span><span>CULTURAL</span>
            </div>
            
            <h1>Bem-vindo!</h1>
            
            <button class="social-button" id="google-login">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
            </button>
            
            <button class="social-button" id="apple-login">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M17.05 20.28c-.98.95-2.05.9-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.43C2.32 14.85 3.24 6.15 9.06 5.9c1.37.06 2.33.8 3.15.74.96-.1 1.82-.84 3.08-.77 2.05.16 3.44 1.26 4.1 3.16-3.63 2.22-2.57 6.75.66 7.83-.6 1.82-1.35 3.6-3 4.42zm-3.8-16C13.12 3.04 13.45 1 15.24 0c.13 2.4-2.14 4.03-2 4.28z" fill="#000"/>
                </svg>
                Entrar com ID Apple
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

    appContainer.innerHTML = initialHTML;
    setupInitialEvents();
}

function setupInitialEvents() {
    // Botão para criar conta
    const createAccountBtn = document.getElementById('create-account-btn');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            window.location.hash = '/register';
        });
    }

    // Botão para login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.hash = '/login';
        });
    }

    // Botões de login social
    const googleLoginBtn = document.getElementById('google-login');
    const appleLoginBtn = document.getElementById('apple-login');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            alert('Login com Google ainda não implementado');
        });
    }

    if (appleLoginBtn) {
        appleLoginBtn.addEventListener('click', () => {
            alert('Login com Apple ainda não implementado');
        });
    }
}