import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';
import { resetPassword } from '../modules/auth.js'; //

export default function renderResetPassword(queryParams) {
  // Obtém o token dos parâmetros da URL
  const token = queryParams.get('token');

  // Se não tiver token, redireciona para login
  if (!token) {
    showMessage('Token inválido ou ausente. Solicite a recuperação novamente.');
    // setTimeout(() => navigateTo('login'), 50); // <-- Linha antiga
    setTimeout(() => navigateTo('welcome-screen'), 50); // <-- Linha nova
    return;
  }

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Renderiza a nova estrutura HTML que você forneceu
  appContainer.innerHTML = `
    <div class="page-container reset-password-page">
        
        <div class="header">
            <a href="#" class="back-button" id="backToLoginBtn">←</a>
        </div>
        
        <div class="password-container">
            <h1 class="password-title">Criar Nova Senha</h1>
            
            <p class="password-description">
                Crie uma senha forte para proteger sua conta.
            </p>
            
            <form id="resetForm">
              <input 
                  type="password" 
                  placeholder="Digite sua nova senha" 
                  class="password-input"
                  id="newPassword" 
                  required
              >
              
              <input 
                  type="password" 
                  placeholder="Confirme sua nova senha" 
                  class="password-input"
                  id="confirmPassword"
                  required
              >
              
              <div class="password-requirements">
                <div id="req-length" class="requirement not-met">• Mínimo de 8 caracteres</div>
                <div id="req-letter" class="requirement not-met">• Pelo menos uma letra</div>
                <div id="req-number" class="requirement not-met">• Pelo menos um número</div>
                <div id="req-special" class="requirement not-met">• Pelo menos um caractere especial</div>
              </div>
              
              <button type="submit" class="send-button" id="reset-submit-btn">
                  Redefinir Senha
              </button>
            </form>
        </div>
    </div>
  `;

  // --- Configura os Event Listeners ---

  // Event listener para o formulário de reset
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPassInput = document.getElementById('newPassword');
      const confirmPassInput = document.getElementById('confirmPassword');
      const newPass = newPassInput ? newPassInput.value : null;
      const confirmPass = confirmPassInput ? confirmPassInput.value : null;

      // Validações básicas
      if (!newPass || !confirmPass) {
          showMessage('Por favor, preencha ambos os campos de senha.');
          return;
      }
      if (newPass !== confirmPass) {
        showMessage('As senhas não coincidem!');
        return;
      }
      
      // Validações completas de força da senha
      const hasMinLength = newPass.replace(/\s/g, '').length >= 8;
      const hasLetter = /[a-zA-Z]/.test(newPass);
      const hasNumber = /[0-9]/.test(newPass);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);
      
      if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecialChar) {
        showMessage('A senha não atende a todos os requisitos de segurança.');
        return;
      }

      // Desabilitar botão
      const submitButton = resetForm.querySelector('.send-button');
      if (submitButton) submitButton.disabled = true;

      try {
        // Chama a função de redefinição de senha da API
        await resetPassword(token, newPass); //

        showMessage('Senha alterada com sucesso! Redirecionando...');
        setTimeout(() => navigateTo('welcome-screen'), 2000);
        
      } catch (error) {
        // Mostra mensagem de erro
        showMessage(error.message || 'Erro ao redefinir senha. O link pode ter expirado.');
        // Habilitar botão novamente
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // Event listener para o botão Voltar
  const backButton = document.getElementById('backToLoginBtn');
  if (backButton) {
      backButton.addEventListener('click', (e) => {
        window.history.back();
          // Navega de volta para a tela de login
          navigateTo('login'); 
      });
  }
  
  // Adiciona o código para validação visual dos requisitos da senha
  const passwordInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmPassword');
  const reqLength = document.getElementById('req-length');
  const reqLetter = document.getElementById('req-letter');
  const reqNumber = document.getElementById('req-number');
  const reqSpecial = document.getElementById('req-special');
  
  // Função para validar a senha em tempo real
  function validatePassword() {
    const password = passwordInput.value;
    
    // Validar comprimento
    if (password.replace(/\s/g, '').length >= 8) {
      reqLength.classList.remove('not-met');
      reqLength.classList.add('met');
    } else {
      reqLength.classList.remove('met');
      reqLength.classList.add('not-met');
    }
    
    // Validar letra
    if (/[a-zA-Z]/.test(password)) {
      reqLetter.classList.remove('not-met');
      reqLetter.classList.add('met');
    } else {
      reqLetter.classList.remove('met');
      reqLetter.classList.add('not-met');
    }
    
    // Validar número
    if (/[0-9]/.test(password)) {
      reqNumber.classList.remove('not-met');
      reqNumber.classList.add('met');
    } else {
      reqNumber.classList.remove('met');
      reqNumber.classList.add('not-met');
    }
    
    // Validar caractere especial
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      reqSpecial.classList.remove('not-met');
      reqSpecial.classList.add('met');
    } else {
      reqSpecial.classList.remove('met');
      reqSpecial.classList.add('not-met');
    }
  }
  
  // Adicionar listeners de evento para os campos de senha
  if (passwordInput) {
    passwordInput.addEventListener('input', validatePassword);
  }
  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      // Podemos adicionar validação visual de confirmação aqui se necessário
    });
  }
  
  // Executar a validação inicial para caso o campo já tenha algum valor
  if (passwordInput) {
    validatePassword();
  }
}