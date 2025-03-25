import { registerUser } from '../modules/auth.js';
import { showMessage, transitionToPage } from '../modules/utils.js';
import { navigateTo } from '../modules/router.js';

// Exporta a função principal da página
export default function renderRegisterForm(queryParams) {
  const appContainer = document.getElementById('app');
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

                <div class="password-requirements">
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

                <button type="submit" class="btn">CADASTRAR</button>
            </form>

            <div class="bottom-text">
                Já tem uma conta? <a id="goToLogin">Entre aqui</a>
            </div>
        </div>
    `;
  setupRegisterEvents();
}

// Configura eventos da página
function setupRegisterEvents() {
  setupRegisterForm();
  setupLoginLink();
  setupPasswordValidation();
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
  document.getElementById('goToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    transitionToPage('register', 'login');
  });
}

// Helper: Validação de senha em tempo real
function setupPasswordValidation() {
  document.getElementById('password')?.addEventListener('input', validatePassword);
}

// Helper: Formatação de data de nascimento
function setupBirthDateInput() {
  document.getElementById('birthDate')?.addEventListener('input', formatBirthDate);
}

// Manipula o envio do formulário
async function handleRegistration() {
  const userData = collectFormData();

  if (!validateForm(userData)) return;

  try {
    await registerUser(userData);
    showMessage('Cadastro realizado com sucesso! Redirecionando para login...');
    transitionToPage('register', 'login')
  } catch (error) {
    showMessage(error.message || 'Erro ao cadastrar. Tente novamente.');
  }
}

// Coleta dados do formulário
function collectFormData() {
  return {
    name: document.getElementById('name').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    birth_date: document.getElementById('birthDate').value,
    gender: document.getElementById('gender').value,
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value
  };
}

// Valida os dados do formulário
function validateForm({ name, username, email, birth_date, gender, password, confirmPassword }) {
  if (!name || !username || !email || !birth_date || !gender || !password || !confirmPassword) {
    showMessage('Por favor, preencha todos os campos.');
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

  if (password.length < 8) {
    showMessage('A senha deve ter pelo menos 8 caracteres.');
    return false;
  }

  if (password !== confirmPassword) {
    showMessage('As senhas não coincidem.');
    return false;
  }

  return true;
}

// Validação de senha (mantida igual, mas agora é função interna)
function validatePassword() {
  const password = document.getElementById('password').value;
  const requirementsDiv = document.querySelector('.password-requirements');

  const validation = {
    hasMinLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  if (!password) {
    requirementsDiv.textContent = 'A senha deve ter pelo menos 8 caracteres com letras, números e caracteres especiais.';
    requirementsDiv.style.color = '#888';
    return;
  }

  const missing = [
    !validation.hasMinLength && 'pelo menos 8 caracteres',
    !validation.hasLetter && 'letras',
    !validation.hasNumber && 'números',
    !validation.hasSpecialChar && 'caracteres especiais'
  ].filter(Boolean);

  if (missing.length === 0) {
    requirementsDiv.textContent = 'Senha forte!';
    requirementsDiv.style.color = '#4CAF50';
  } else {
    requirementsDiv.textContent = `A senha deve ter: ${missing.join(', ')}`;
    requirementsDiv.style.color = '#FFA500';
  }
}

// Formatação de data (mantida igual, mas agora é função interna)
function formatBirthDate() {
  const input = document.getElementById('birthDate');
  let value = input.value.replace(/\D/g, '');

  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 4) {
    value = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4)}`;
  } else if (value.length > 2) {
    value = `${value.substring(0, 2)}-${value.substring(2)}`;
  }

  input.value = value;
}