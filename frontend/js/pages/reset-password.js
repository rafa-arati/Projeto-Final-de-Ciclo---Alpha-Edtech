import { showMessage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';
import { resetPassword } from '../modules/auth.js';

export default function render(queryParams) {
  // Obtém o token dos parâmetros da URL
  const token = queryParams.get('token');

  // Se não tiver token, redireciona para login
  if (!token) {
    showMessage('Token inválido');
    navigateTo('login');
    return;
  }

  // Renderiza o formulário de redefinição de senha
  document.getElementById('app').innerHTML = `
    <div class="reset-password-container">
      <h2>Crie sua Nova Senha</h2>
      <form id="resetForm">
        <input type="password" id="newPassword" placeholder="Nova senha" required>
        <input type="password" id="confirmPassword" placeholder="Confirme a senha" required>
        <button type="submit">Salvar</button>
      </form>
    </div>
  `;

  // Adiciona evento de submissão do formulário
  document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    // Valida se as senhas coincidem
    if (newPass !== confirmPass) {
      showMessage('As senhas não coincidem!');
      return;
    }

    try {
      // Chama a função de redefinição de senha
      await resetPassword(token, newPass);

      showMessage('Senha alterada com sucesso!');

      // Redireciona para login após 2 segundos
      setTimeout(() => navigateTo('login'), 2000);
    } catch (error) {
      // Mostra mensagem de erro
      showMessage(error.message || 'Erro ao redefinir senha');
    }
  });
}