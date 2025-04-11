import { registerUser } from '../modules/auth.js';
import { showMessage, transitionToPage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';

// Exporta a função principal da página
export default function renderRegisterForm(queryParams) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return; // Adiciona verificação

  appContainer.innerHTML = `
        <div class="container register-container">
            <div class="logo"><span>R</span>OTA<span>CULTURAL</span></div>
            <div class="welcome">Crie sua conta</div>

            <form id="registerForm">
                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <input type="text" id="name" placeholder="Nome Completo" required>
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <input type="text" id="username" placeholder="Nome de Usuário" required>
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                        </svg>
                    </div>
                    <input type="email" id="email" placeholder="Email" required>
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <input type="text" id="birthDate" placeholder="Data de Nascimento (DD-MM-AAAA)"
                           pattern="\\d{2}-\\d{2}-\\d{4}" required>
                </div>

                <div class="input-group select-wrapper">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                    </div>
                    <select id="gender" required>
                        <option value="" disabled selected>Selecione o Gênero</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <input type="password" id="password" placeholder="Senha" required>
                </div>

                <div class="password-requirements hidden">
                    A senha deve ter pelo menos 8 caracteres com letras, números e caracteres especiais.
                </div>

                <div class="input-group">
                    <div class="input-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <input type="password" id="confirmPassword" placeholder="Confirmar Senha" required>
                </div>

                <div id="registerErrorMessage" class="form-error-message is-hidden">
                </div>

                <button type="submit" class="btn">CADASTRAR</button>
            </form>

            <div class="bottom-text">
                Já tem uma conta? <a id="goToLogin">Entre aqui</a>
            </div>
        </div>
    `;
  setupRegisterEvents();
}

function showInlineError(message, errorDivId = 'registerErrorMessage') {
  const errorDiv = document.getElementById(errorDivId);
  if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('is-hidden');
      errorDiv.style.display = 'block'; // Garante visibilidade
  } else {
      // Fallback caso o div não seja encontrado (improvável)
      alert(message); // ou use showMessage(message, 'error');
  }
}

// --- NOVO: Função auxiliar para esconder erro inline ---
function hideInlineError(errorDivId = 'registerErrorMessage') {
  const errorDiv = document.getElementById(errorDivId);
  if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.classList.add('is-hidden');
      errorDiv.style.display = 'none'; // Garante que está escondido
  }
}


// Configura eventos da página
function setupRegisterEvents() {
  setupRegisterForm();
  setupLoginLink();
  setupPasswordValidation(); // <-- ATUALIZADO: Configura os listeners para mostrar/esconder/validar a senha
  setupBirthDateInput();
}

// Helper: Formulário de cadastro
function setupRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleRegistration();
  });
}

// Helper: Link para login
function setupLoginLink() {
  const loginLink = document.getElementById('goToLogin');
  if (loginLink) {
    // Limpa listener antigo para segurança
    const newLoginLink = loginLink.cloneNode(true);
    loginLink.parentNode.replaceChild(newLoginLink, loginLink);
    newLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      transitionToPage('register', 'welcome-screen');
    });
  } else {
    console.warn("Elemento com ID 'goToLogin' não encontrado na página de registro.");
  }
}

// Helper: Configura listeners para o campo de senha e a mensagem de requisitos
function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const requirementsDiv = document.querySelector('.password-requirements');

    if (passwordInput && requirementsDiv) {
        // Mostrar ao focar no campo
        passwordInput.addEventListener('focus', () => {
            requirementsDiv.classList.remove('hidden');
        });

        // Esconder ao perder o foco SOMENTE se o campo estiver vazio
        passwordInput.addEventListener('blur', () => {
            if (passwordInput.value === '') {
                requirementsDiv.classList.add('hidden');
                // Resetar texto e cor ao esconder
                requirementsDiv.textContent = 'A senha deve ter pelo menos 8 caracteres com letras, números e caracteres especiais.';
                // Use a cor padrão definida no CSS ou uma cor neutra aqui
                requirementsDiv.style.color = 'var(--text-tertiary, #888)';
            }
        });

        // Validar e garantir visibilidade enquanto digita
        passwordInput.addEventListener('input', () => {
            requirementsDiv.classList.remove('hidden'); // Garante visibilidade
            validatePasswordRealtime(); // Chama a lógica de validação
        });
    } else {
        console.warn("Input de senha (#password) ou div de requisitos (.password-requirements) não encontrados.");
    }
}


// Helper: Validação da senha em tempo real (chamada pelo listener 'input')
function validatePasswordRealtime() {
    const passwordInput = document.getElementById('password');
    const requirementsDiv = document.querySelector('.password-requirements');
    if (!passwordInput || !requirementsDiv) return; // Segurança

    const password = passwordInput.value;

    // Requisitos
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Se o campo está vazio (após apagar tudo), reseta a mensagem e cor
    if (!password) {
        requirementsDiv.textContent = 'A senha deve ter pelo menos 8 caracteres com letras, números e caracteres especiais.';
        requirementsDiv.style.color = 'var(--text-tertiary, #888)'; // Cor padrão cinza
        return;
    }

    // Monta a mensagem de feedback
    const missing = [];
    if (!hasMinLength) missing.push('pelo menos 8 caracteres');
    if (!hasLetter) missing.push('letras');
    if (!hasNumber) missing.push('números');
    if (!hasSpecialChar) missing.push('caracteres especiais');

    if (missing.length === 0) {
        requirementsDiv.textContent = 'Senha forte!';
        requirementsDiv.style.color = 'var(--success-color, #4CAF50)'; // Verde
    } else {
        requirementsDiv.textContent = `A senha precisa ter: ${missing.join(', ')}.`;
        // Usa a cor de aviso/fraco definida no CSS se existir, senão um laranja padrão
        requirementsDiv.style.color = 'var(--warning-color, #FFA500)';
    }
}

// Helper: Formatação de data de nascimento
function setupBirthDateInput() {
  const birthDateInput = document.getElementById('birthDate');
  if (birthDateInput) {
    // Limpa listener antigo
    const newBirthDateInput = birthDateInput.cloneNode(true);
    birthDateInput.parentNode.replaceChild(newBirthDateInput, birthDateInput);
    newBirthDateInput.addEventListener('input', formatBirthDate);
  }
}

// Manipula o envio do formulário
async function handleRegistration() {
  const userData = collectFormData();
  const errorMessageDiv = document.getElementById('registerErrorMessage'); // Referência ao div de erro
  const registerForm = document.getElementById('registerForm');
  const submitButton = registerForm?.querySelector('button[type="submit"]');

  // 1. Esconde erro anterior
  hideInlineError();

  // 2. Validações do Frontend (agora usam showInlineError)
  if (!userData.name || !userData.username || !userData.email || !userData.birth_date || !userData.gender || !userData.password || !userData.confirmPassword) {
      showInlineError('Por favor, preencha todos os campos obrigatórios.');
      return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      showInlineError('Por favor, insira um email válido.');
      return;
  }
  if (!/^(\d{2})-(\d{2})-(\d{4})$/.test(userData.birth_date)) {
      showInlineError('Por favor, insira a data no formato DD-MM-AAAA.');
      return;
  }
  if (userData.password !== userData.confirmPassword) {
      showInlineError('As senhas não coincidem.');
      return;
  }
  // Validação de força da senha (exemplo)
  const password = userData.password;
  const isPasswordStrong = password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!isPasswordStrong) {
      showInlineError('A senha não atende aos requisitos de segurança (mín. 8 caracteres, letras, números, especiais).');
      // Poderia também mudar a cor da div .password-requirements aqui se quisesse
      return;
  }
  // --- Fim Validações ---


  // 3. Desabilitar botão e tentar registrar
  if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'CADASTRANDO...';
  }

  try {
      await registerUser(userData);
      // --- SUCESSO ---
      // Mantém o modal (showMessage) para sucesso, pois é uma confirmação importante
      // ou poderia também usar o showInlineError com estilo de sucesso.
      showMessage('Cadastro realizado com sucesso! Redirecionando para login...');
      setTimeout(() => navigateTo('welcome-screen'), 2000); // Navega após a mensagem

  } catch (error) {
      // --- ERRO DA API ---
      // Mostra o erro da API no div da tela
      showInlineError(error.message || 'Erro ao cadastrar. Tente novamente.');
      // Reabilita o botão
      if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'CADASTRAR';
      }
  }
}


// Coleta dados do formulário
function collectFormData() {
  // Usa optional chaining (?) para evitar erros se um elemento não for encontrado
  return {
    name: document.getElementById('name')?.value || '',
    username: document.getElementById('username')?.value || '',
    email: document.getElementById('email')?.value || '',
    birth_date: document.getElementById('birthDate')?.value || '',
    gender: document.getElementById('gender')?.value || '',
    password: document.getElementById('password')?.value || '',
    confirmPassword: document.getElementById('confirmPassword')?.value || ''
  };
}

// Valida os dados GERAIS do formulário (campos obrigatórios, formato email/data, senhas coincidem)
function validateForm({ name, username, email, birth_date, gender, password, confirmPassword }) {
  if (!name || !username || !email || !birth_date || !gender || !password || !confirmPassword) {
    showMessage('Por favor, preencha todos os campos obrigatórios.');
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage('Por favor, insira um email válido.');
    return false;
  }

  if (!/^(\d{2})-(\d{2})-(\d{4})$/.test(birth_date)) {
    showMessage('Por favor, insira a data no formato DD-MM-AAAA.');
    return false;
  }

  // A validação de tamanho mínimo da senha é feita em tempo real, mas verificamos aqui também
  if (password.length < 8) {
     showMessage('A senha deve ter pelo menos 8 caracteres.');
     return false;
  }

  if (password !== confirmPassword) {
    showMessage('As senhas não coincidem.');
    return false;
  }

  return true; // Retorna true se as validações básicas passarem
}

// Formatação de data (mantida igual)
function formatBirthDate() {
  const input = document.getElementById('birthDate');
  if (!input) return; // Segurança

  let value = input.value.replace(/\D/g, ''); // Remove não-dígitos

  if (value.length > 8) value = value.substring(0, 8); // Limita a 8 dígitos

  // Aplica a máscara DD-MM-YYYY
  if (value.length > 4) {
    value = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4)}`;
  } else if (value.length > 2) {
    value = `${value.substring(0, 2)}-${value.substring(2)}`;
  }

  input.value = value;
}