import { showMessage, transitionToPage } from '../modules/utils.js';
import { sendPasswordResetEmail } from '../modules/auth.js';
import { navigateTo } from '../modules/router.js';

export default function render(queryParams) {
  document.getElementById('app').innerHTML = `
    <div class="forgot-password-container">
      <h2>Recuperar Senha</h2>
      <form id="forgotPasswordForm">
        <input type="email" placeholder="Seu email cadastrado" required>
        <button type="submit">Enviar Link</button>
      </form>
      <p class="info">Verifique sua caixa de spam</p>
    </div>
  `;

  document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;

    try {
      await sendPasswordResetEmail(email);
      showMessage(`Se o email estiver cadastrado, você receberá um link de recuperação.`);
      transitionToPage('forgot-password', 'login');
    } catch (error) {
      showMessage(error.message);
    }
  });
}