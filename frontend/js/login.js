// Configurar eventos para a página de login
function setupLoginEvents() {
    // Alternar entre usuário e admin
    const userLoginBtn = document.getElementById('user-login-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const userTypeInput = document.getElementById('userType');

    if (userLoginBtn && adminLoginBtn) {
        userLoginBtn.addEventListener('click', function () {
            userLoginBtn.classList.add('active');
            adminLoginBtn.classList.remove('active');
            userTypeInput.value = 'user';
        });

        adminLoginBtn.addEventListener('click', function () {
            adminLoginBtn.classList.add('active');
            userLoginBtn.classList.remove('active');
            userTypeInput.value = 'admin';
        });
    }

    // Evento para o formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Evento para link "Esqueceu a senha"
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function () {
            showMessage('Recurso de recuperação de senha em desenvolvimento.');
        });
    }

    // Evento para os botões de login social
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function () {
            showMessage('Login social em desenvolvimento.');
        });
    });

    // Evento para o link de cadastro
    const registerLink = document.getElementById('goToRegister');
    if (registerLink) {
        registerLink.addEventListener('click', function () {
            transitionToPage('login', showRegisterForm);
        });
    }
}

// Manipular o envio do formulário de login
async function handleLogin(event) {
    event.preventDefault();

    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('userType').value;

    // Validação básica
    if (!identifier || !password) {
        showMessage('Por favor, preencha todos os campos.');
        return;
    }

    try {
        // Tenta fazer login via API
        const result = await loginUser(identifier, password, userType);

        // Verifica se o usuário é admin se selecionou o tipo admin
        if (userType === 'admin' && result.user.role !== 'admin') {
            showMessage('Você não tem permissões de administrador.');
            return;
        }

        // Se chegar aqui, o login foi bem-sucedido
        showMessage('Login bem-sucedido! Redirecionando...');

        // Redireciona para a dashboard após um breve intervalo
        setTimeout(() => {
            redirectToDashboard();
        }, 1500);
    } catch (error) {
        showMessage(error.message || 'Falha no login. Verifique suas credenciais.');
    }
}