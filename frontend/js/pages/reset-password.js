import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';
import { resetPassword } from '../modules/auth.js'; //

export default function renderResetPassword(queryParams) {
  // Obtém o token dos parâmetros da URL
  const token = queryParams.get('token');

  // Se não tiver token, redireciona para login
  if (!token) {
    // Garante que a mensagem seja mostrada antes do redirecionamento
    showMessage('Token inválido ou ausente. Solicite a recuperação novamente.');
    // Adiciona um pequeno delay antes de redirecionar, caso showMessage seja assíncrono
    setTimeout(() => navigateTo('login'), 50); 
    return; // Impede a renderização do restante da página
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
                  • Mínimo de 8 caracteres<br>
                  • Pelo menos uma letra<br>
                  • Pelo menos um número<br>
                  • Pelo menos um caractere especial
              </div>
              
              <button type="submit" class="send-button">
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
      // Adicionar validação de força da senha se desejar (ex: min 8 chars)
      if (newPass.length < 8) {
         showMessage('A senha deve ter pelo menos 8 caracteres.');
         return;
      }
      // Validações mais complexas (letras, números, especiais) podem ser adicionadas aqui
      // Exemplo: if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPass)) { ... }


      // Desabilitar botão
      const submitButton = resetForm.querySelector('.send-button');
      if (submitButton) submitButton.disabled = true;

      try {
        // Chama a função de redefinição de senha da API
        await resetPassword(token, newPass); //

        showMessage('Senha alterada com sucesso! Redirecionando para login...');

        // Redireciona para login após um tempo
        setTimeout(() => navigateTo('login'), 2000);
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
        window.history.back() ;
          // Navega de volta para a tela de login
          navigateTo('login'); 
      });
  }
}