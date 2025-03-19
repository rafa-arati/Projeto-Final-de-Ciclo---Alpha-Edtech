// Configurar eventos para a página de cadastro
function setupRegisterEvents() {
    // Evento para o formulário de cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Evento para voltar para o login
    const loginLink = document.getElementById('goToLogin');
    if (loginLink) {
        loginLink.addEventListener('click', function () {
            transitionToPage('register', showLoginForm);
        });
    }

    // Validação da senha em tempo real
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }

    // Formatar campo de data
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('input', formatBirthDate);
    }
}

// Manipular o envio do formulário de cadastro
async function handleRegistration(event) {
    event.preventDefault();

    // Coletar dados do formulário
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validações
    if (!name || !username || !email || !birthDate || !gender || !password || !confirmPassword) {
        showMessage('Por favor, preencha todos os campos.');
        return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor, insira um email válido.');
        return;
    }

    // Validar formato da data
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!dateRegex.test(birthDate)) {
        showMessage('Por favor, insira a data no formato DD-MM-AAAA.');
        return;
    }

    // Validar senha
    if (password.length < 8) {
        showMessage('A senha deve ter pelo menos 8 caracteres.');
        return;
    }

    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem.');
        return;
    }

    try {
        // Preparar objeto de dados para a API
        const userData = {
            name,
            email,
            password,
            gender,
            birth_date: birthDate,
            username
        };

        console.log("Enviando dados de usuário:", { ...userData, password: "***" });

        // Enviar dados para API
        const result = await registerUser(userData);

        // Se chegar aqui, o cadastro foi bem-sucedido
        showMessage('Cadastro realizado com sucesso! Você será redirecionado para o login.');

        // Redirecionar para o login após alguns segundos
        setTimeout(() => {
            transitionToPage('register', showLoginForm);
        }, 2000);

    } catch (error) {
        showMessage(error.message || 'Erro ao cadastrar. Tente novamente.');
    }
}

// Validar complexidade da senha
function validatePassword() {
    const password = document.getElementById('password').value;
    const requirementsDiv = document.querySelector('.password-requirements');

    // Critérios de validação
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Atualizar mensagem de requisitos
    if (password) {
        let message = 'A senha deve ter: ';
        let criteria = [];

        if (!hasMinLength) criteria.push('pelo menos 8 caracteres');
        if (!hasLetter) criteria.push('letras');
        if (!hasNumber) criteria.push('números');
        if (!hasSpecialChar) criteria.push('caracteres especiais');

        if (criteria.length === 0) {
            requirementsDiv.textContent = 'Senha forte!';
            requirementsDiv.style.color = '#4CAF50'; // Verde
        } else {
            requirementsDiv.textContent = message + criteria.join(', ');
            requirementsDiv.style.color = '#FFA500'; // Laranja
        }
    } else {
        requirementsDiv.textContent = 'A senha deve ter pelo menos 8 caracteres com letras, números e caracteres especiais.';
        requirementsDiv.style.color = '#888';
    }
}

// Formatar a data enquanto o usuário digita
function formatBirthDate() {
    const input = document.getElementById('birthDate');
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito

    if (value.length > 8) {
        value = value.substring(0, 8);
    }

    // Formatar como DD-MM-AAAA
    if (value.length > 4) {
        value = value.substring(0, 2) + '-' + value.substring(2, 4) + '-' + value.substring(4);
    } else if (value.length > 2) {
        value = value.substring(0, 2) + '-' + value.substring(2);
    }

    input.value = value;
}