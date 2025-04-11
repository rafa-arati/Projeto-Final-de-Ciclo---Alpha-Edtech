// frontend/js/pages/forgot-password.js
import { showMessage, transitionToPage } from '../modules/utils.js'; // showMessage pode ser usado para ERROS se preferir alert
import { sendPasswordResetEmail } from '../modules/auth.js';
import { navigateTo } from '../modules/router.js';

// --- Funções auxiliares show/hide inline (Apenas para a MENSAGEM DE SUCESSO neste caso) ---
// Você pode manter ou remover se não usar showInlineError para erros
function showInlineMessage(messageHtml, elementId = 'recovery-success-message') {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.innerHTML = messageHtml; // Usa innerHTML para permitir tags
        messageDiv.classList.remove('is-hidden');
        messageDiv.style.display = 'block';
    } else {
        console.error(`Div de mensagem #${elementId} não encontrado!`);
        alert('Solicitação enviada! Verifique seu email.'); // Fallback para sucesso
    }
}

function hideInlineMessage(elementId = 'recovery-success-message') {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.innerHTML = '';
        messageDiv.classList.add('is-hidden');
        messageDiv.style.display = 'none';
    }
}


// --- Função Principal de Renderização ---
export default function renderForgotPassword(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // HTML com placeholder para mensagem de sucesso inline
  appContainer.innerHTML = `
    <div class="page-container forgot-password-page">
        <div class="header">
            <a href="#" class="back-button" id="backToLoginBtn" title="Voltar">←</a>
        </div>

        <div class="recovery-container">
            <h1 class="recovery-title">Recuperar Senha</h1>

            <div id="recovery-success-message" class="recovery-message success-message is-hidden">
            </div>

            <div id="recovery-content">
                <p class="recovery-description">
                    Digite seu endereço de e-mail. Enviaremos um link para redefinir sua senha.
                </p>
                <form id="forgotPasswordForm">
                  <input
                      type="email"
                      placeholder="Digite seu e-mail"
                      class="email-input"
                      id="recoveryEmail"
                      required
                  >
                   <div id="forgotPasswordError" class="form-error-message is-hidden" style="margin-top: 15px;"></div>

                  <button type="submit" class="send-button">
                      Enviar Link de Recuperação
                  </button>
                </form>
                <p class="spam-warning">
                    Verifique sua pasta de spam se não encontrar o e-mail na caixa de entrada.
                </p>
            </div> 

        </div>
    </div>
  `;

  // Configura os Event Listeners
  setupForgotPasswordEvents();
  // A função addForgotPasswordStyles() foi REMOVIDA daqui
}


// --- Configuração dos Eventos ---
function setupForgotPasswordEvents() {
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        const newForm = forgotForm.cloneNode(true);
        forgotForm.parentNode.replaceChild(newForm, forgotForm);
        newForm.addEventListener('submit', handleForgotPasswordSubmit);
    }

    const backButton = document.getElementById('backToLoginBtn');
    if (backButton) {
         const newBackButton = backButton.cloneNode(true);
         backButton.parentNode.replaceChild(newBackButton, backButton);
         newBackButton.addEventListener('click', (e) => {
             e.preventDefault();
             window.history.back(); // Volta no histórico
         });
     }
}

// --- Handler de Submit ATUALIZADO ---
async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('recoveryEmail');
    const email = emailInput ? emailInput.value.trim() : null;

    const submitButton = e.target.querySelector('.send-button');
    const recoveryContentDiv = document.getElementById('recovery-content'); // Div com form/descrição
    const successMessageDiv = document.getElementById('recovery-success-message'); // Div de sucesso
    const formErrorDiv = document.getElementById('forgotPasswordError'); // Div de erro do form

    // Esconde erro anterior do formulário
    if(formErrorDiv) {
        formErrorDiv.textContent = '';
        formErrorDiv.classList.add('is-hidden');
        formErrorDiv.style.display = 'none';
    }


    if (!email) {
        // Mostra erro de validação inline no form
        if(formErrorDiv){
            formErrorDiv.textContent = 'Por favor, digite seu e-mail.';
            formErrorDiv.classList.remove('is-hidden');
            formErrorDiv.style.display = 'block';
        } else {
            alert('Por favor, digite seu e-mail.');
        }
        return;
    }
    if (!submitButton || !recoveryContentDiv || !successMessageDiv) {
         console.error("Elementos do DOM não encontrados para recuperação de senha.");
         alert('Erro interno na página. Tente recarregar.');
         return;
     }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        await sendPasswordResetEmail(email);

        // --- SUCESSO ---
        // Esconde o formulário e textos originais
        recoveryContentDiv.style.display = 'none';

        // Preenche e mostra a mensagem de sucesso inline
        const successHtml = `
            <p style="font-size: 1.2em; margin-bottom: 10px;">✅ Solicitação enviada!</p>
            <p>Se o e-mail <strong>${email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha em breve.</p>
            <p style="font-size: 0.9em; margin-top:15px;">(Não se esqueça de verificar sua caixa de spam).</p>
        `;
        showInlineMessage(successHtml); // Usa a função helper para mostrar

        // Não redireciona automaticamente

    } catch (error) {
        // --- ERRO ---
        console.error("Erro ao enviar email:", error);
        // Mostra erro inline no form
         if(formErrorDiv){
            formErrorDiv.textContent = error.message || 'Ocorreu um erro. Tente novamente.';
            formErrorDiv.classList.remove('is-hidden');
            formErrorDiv.style.display = 'block';
        } else {
            alert(error.message || 'Ocorreu um erro. Tente novamente.'); // Fallback
        }
        // Reabilita o botão
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Link de Recuperação';
    }
}
