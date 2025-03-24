import { showMessage } from './app.js'; // Importe a função showMessage
import { registerUser } from './auth.js'; // Importe a função registerUser

export function renderRegister() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    const registerHTML = `
        <div class="container register-container" id="registerContainer">
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

                <div class="password-requirements" id="passwordRequirements" style="display: none;">
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

    appContainer.innerHTML = registerHTML;
    setupRegisterEvents();
}

function setupRegisterEvents() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const goToLoginLink = document.getElementById('goToLogin');
    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', () => {
            window.location.hash = '/login';
        });
    }

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordRequirementsDiv = document.getElementById('passwordRequirements');

    if (passwordInput) {
        passwordInput.addEventListener('focus', () => {
            passwordRequirementsDiv.style.display = 'block';
        });

        passwordInput.addEventListener('input', () => {
            passwordRequirementsDiv.style.display = 'block';
            const password = passwordInput.value;
            const meetsRequirements = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password) && /[^\w\s]/.test(password);
            if (meetsRequirements) {
                passwordRequirementsDiv.textContent = 'Senha forte.';
                passwordRequirementsDiv.className = 'password-requirements strong';
            } else if (password.length >= 8) {
                passwordRequirementsDiv.textContent = 'Senha com 8+ caracteres, mas faltando letras, números ou símbolos.';
                passwordRequirementsDiv.className = 'password-requirements weak';
            } else {
                passwordRequirementsDiv.textContent = 'A senha deve ter pelo menos 8 caracteres com letras, números e caracteres especiais.';
                passwordRequirementsDiv.className = 'password-requirements';
            }
        });

        passwordInput.addEventListener('blur', () => {
            if (passwordInput.value === '') {
                passwordRequirementsDiv.style.display = 'none';
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            if (password !== confirmPassword) {
                confirmPasswordInput.setCustomValidity('As senhas não coincidem.');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }

    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, ''); // Remove não-dígitos
            if (value.length > 8) {
                value = value.slice(0, 8); // Limita a 8 dígitos
            }
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i === 2 || i === 4) {
                    formattedValue += '-';
                }
                formattedValue += value[i];
            }
            this.value = formattedValue;
        });
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem.');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, username, email, birthDate, gender, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Cadastro realizado com sucesso! Redirecionando para a página de login...');
            setTimeout(() => {
                window.location.hash = '/login';
            }, 2000);
        } else {
            console.log('Erro no registro - Dados recebidos:', data);
            showMessage(data.message || 'Erro ao cadastrar usuário.');
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        showMessage('Erro inesperado ao cadastrar.');
    }
}