export function getLoginFormHTML() {
  console.log("[login.js] Gerando HTML para o modal...");
  return `
      <div class="container login-container">
            
          <div class="logo"><span>R</span>OTA<span>CULTURAL</span></div>
          <div class="welcome">Bem-vindo!</div>

          <form id="loginFormModal">
              <div class="input-group">
                  <div class="input-icon">
                     <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" fill="none" stroke="currentColor" stroke-width="2"></path></svg>
                  </div>
                  <input type="text" id="loginIdentifierModal" placeholder="Email ou Nome de Usuário" required>
              </div>

              <div class="input-group">
                  <div class="input-icon">
                     <svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" stroke-width="2"></path></svg>
                  </div>
                  <input type="password" id="loginPasswordModal" placeholder="Senha" required>
              </div>

              <div id="loginErrorMessageModal" class="login-error-message" style="display: none;">
              </div>

              <button type="submit" id="loginSubmitBtnModal" class="btn login-btn">LOGIN</button>
          </form>

          <div id="loginForgotPasswordModal" class="forgot-password">Esqueceu a senha?</div>

          <div class="divider">Ou entre com</div>

          <div class="social-login">
              <div class="social-btn google" id="loginGoogleBtnModal">
                  <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
          </div>

          <div class="bottom-text">
              Não tem uma conta? <a id="loginRegisterLinkModal">Cadastre-se</a>
          </div>
      </div>
  `;
}