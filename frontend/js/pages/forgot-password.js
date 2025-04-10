import { showMessage, transitionToPage } from '../modules/utils.js';
import { sendPasswordResetEmail } from '../modules/auth.js';
import { navigateTo } from '../modules/router.js';

export default function renderForgotPassword(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Gera o HTML da nova estrutura que você forneceu
  appContainer.innerHTML = `
    <div class="page-container forgot-password-page">
        <div class="header">
            <a href="#" class="back-button" id="backToLoginBtn">←</a>
        </div>
        
        <div class="recovery-container">
            <h1 class="recovery-title">Recuperar Senha</h1>
            
            <p class="recovery-description">
                Digite seu endereço de e-mail. Enviaremos um link para redefinir sua senha.
            </p>
            
            <form id="forgotPasswordForm"> 
              <input 
                  type="email" 
                  placeholder="Digite seu e-mail" 
                  class="email-input"
                  id="recoveryEmail" {/* Adicionado ID para o input */}
                  required 
              >
              
              <button type="submit" class="send-button">
                  Enviar Link de Recuperação
              </button>
            </form>
            
            <p class="spam-warning">
                Verifique sua pasta de spam se não encontrar o e-mail na caixa de entrada.
            </p>
        </div>
    </div>
  `;

  // --- Configura os Event Listeners usando os IDs/Classes da nova estrutura ---

  // Event listener para o formulário de recuperação
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('recoveryEmail');
      const email = emailInput ? emailInput.value : null;

      if (!email) {
        showMessage('Por favor, digite seu e-mail.');
        return;
      }

      // Desabilitar botão para evitar cliques múltiplos (opcional)
      const submitButton = forgotForm.querySelector('.send-button');
      if (submitButton) submitButton.disabled = true;

      try {
        await sendPasswordResetEmail(email);
        // Mensagem genérica por segurança (não confirma se o email existe)
        showMessage(`Se o email ${email} estiver cadastrado, você receberá um link de recuperação.`);
        setTimeout(() => {
            transitionToPage('forgot-password-page', 'welcome-screen');
        }, 4000);
      } catch (error) {
        // Mesmo em caso de erro, mostrar mensagem genérica pode ser mais seguro
        showMessage(error.message || 'Ocorreu um erro. Tente novamente.');
      } finally {
        // Habilitar botão novamente (opcional)
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // Event listener para o botão Voltar
  const backButton = document.getElementById('backToLoginBtn');
  if (backButton) {
    backButton.addEventListener('click', (e) => {
      window.history.back(); 
      navigateTo('welcome-screen');
    });
  }
}