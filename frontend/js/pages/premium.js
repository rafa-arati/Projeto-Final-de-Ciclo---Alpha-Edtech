import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { getLoggedInUser } from '../modules/store.js';

export default async function renderPremiumPage(queryParams) {
    // Verificar se o usuário está logado
    const user = getLoggedInUser();
    if (!user) {
        showMessage('Você precisa estar logado para acessar esta página.');
        navigateTo('login');
        return;
    }

    // Verificar se já é premium
    if (user.role === 'premium' || user.role === 'admin') {
        showMessage('Você já possui uma conta premium ou privilégios de administrador.');
        navigateTo('events');
        return;
    }

    // Verificar status atual da assinatura
    let premiumStatus = { status: 'none' };
    try {
        const response = await fetch('/api/premium/status', {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            premiumStatus = data.subscription;
        }
    } catch (error) {
        console.error('Erro ao verificar status premium:', error);
    }

    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
    <div class="container premium-container">
      <div class="header" style="margin-bottom: 30px;">
        <a href="#events" class="back-button">←</a>
        <h1>Conta Premium</h1>
      </div>

      <div class="premium-content">
        <div class="premium-card">
          <div class="premium-header">
            <h2>Rota Cultural Premium</h2>
            <div class="premium-price">R$ 19,90<span>/mês</span></div>
          </div>
          
          <div class="premium-features">
            <h3>Benefícios inclusos:</h3>
            <ul>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Crie eventos culturais próprios
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Gerencie suas criações com facilidade
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Gere QR Codes promocionais exclusivos
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Ofereça descontos e brindes aos participantes
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Análises e relatórios de seus eventos
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Suporte prioritário
              </li>
            </ul>
          </div>

          ${premiumStatus.status === 'expired' ?
            `<div class="premium-notice">
               <p>Sua assinatura anterior expirou em ${new Date(premiumStatus.expiryDate).toLocaleDateString('pt-BR')}.</p>
             </div>` : ''}
          
          <button id="upgrade-button" class="premium-button">
            Tornar-se Premium
          </button>
          
          <div class="premium-disclaimer">
            Assinatura válida por 30 dias. Sem compromisso.
          </div>
        </div>
      </div>
    </div>
  `;

    // Adicionar estilos específicos para a página premium
    addPremiumStyles();

    // Adicionar evento no botão
    document.getElementById('upgrade-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/premium/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao fazer upgrade');
            }

            const data = await response.json();
            showMessage('Parabéns! Sua conta agora é premium. Aproveite os benefícios!');

            // Atualizar dados do usuário no localStorage
            const currentUser = getLoggedInUser();
            if (currentUser) {
                localStorage.setItem('rota_cultural_user', JSON.stringify({
                    ...currentUser,
                    role: 'premium'
                }));
            }

            // Redirecionar após 2 segundos
            setTimeout(() => navigateTo('events'), 2000);
        } catch (error) {
            console.error('Erro no upgrade:', error);
            showMessage(error.message || 'Ocorreu um erro ao processar sua solicitação');
        }
    });
}

// Adicionar estilos específicos para a página de premium
function addPremiumStyles() {
    // Verificar se já existe um estilo para a página premium
    if (!document.getElementById('premium-styles')) {
        const styles = document.createElement('style');
        styles.id = 'premium-styles';
        styles.textContent = `
      .premium-container {
        max-width: 600px;
        width: 100%;
        margin: 0 auto;
      }
      
      .header {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
      }
      
      .back-button {
        width: 32px;
        height: 32px;
        background-color: #222;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-decoration: none;
        margin-right: 15px;
        font-size: 18px;
      }
      
      .premium-card {
        background-color: #222;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #333;
      }
      
      .premium-header {
        background: linear-gradient(45deg, #439DFE, #8000FF);
        padding: 25px;
        color: white;
      }
      
      .premium-header h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }
      
      .premium-price {
        font-size: 36px;
        font-weight: bold;
      }
      
      .premium-price span {
        font-size: 16px;
        opacity: 0.8;
      }
      
      .premium-features {
        padding: 25px;
      }
      
      .premium-features h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #ddd;
      }
      
      .premium-features ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .premium-features li {
        margin-bottom: 12px;
        display: flex;
        align-items: center;
      }
      
      .premium-features li svg {
        margin-right: 10px;
        color: #8000FF;
      }
      
      .premium-button {
        width: calc(100% - 50px);
        margin: 0 25px 25px;
        padding: 15px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(45deg, #439DFE, #8000FF);
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      
      .premium-button:hover {
        opacity: 0.9;
      }
      
      .premium-disclaimer {
        text-align: center;
        padding-bottom: 25px;
        color: #888;
        font-size: 14px;
      }
      
      .premium-notice {
        background-color: rgba(255, 100, 100, 0.1);
        border-left: 3px solid #ff6464;
        padding: 10px 25px;
        margin: 0 25px 20px;
        color: #ff6464;
      }
    `;
        document.head.appendChild(styles);
    }
}