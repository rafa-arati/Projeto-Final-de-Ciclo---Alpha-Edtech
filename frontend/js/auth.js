// API base URL - Como frontend e backend estão no mesmo servidor, usamos caminho relativo
const API_URL = '/api/auth';

// Função para fazer login
async function loginUser(identifier, password, userType) {
    try {
        // Determinar se o identifier é um email
        const isEmail = identifier.includes('@');

        // Construir o objeto de dados baseado no tipo de identificador
        // O backend agora está modificado para verificar se é email ou username
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: identifier, // O campo email no backend será usado para ambos email/username
                password: password
            }),
            credentials: 'include' // Importante para cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao fazer login');
        }

        const data = await response.json();

        // Armazenar algumas informações básicas do usuário no localStorage
        // Não armazene informações sensíveis como senhas!
        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            userType: data.user.role || userType,
            isLoggedIn: true
        }));

        return data;
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

// Função para registrar um novo usuário
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao cadastrar usuário');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro no cadastro:', error);
        throw error;
    }
}

// Função para fazer logout
async function logoutUser() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include' // Importante para cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao fazer logout');
        }

        // Limpar informações do usuário do localStorage
        localStorage.removeItem('user');

        return await response.json();
    } catch (error) {
        console.error('Erro no logout:', error);
        throw error;
    }
}

// Verificar se o usuário está logado
function isUserLoggedIn() {
    const user = localStorage.getItem('user');
    if (!user) return false;

    try {
        const userData = JSON.parse(user);
        return userData.isLoggedIn === true;
    } catch (e) {
        return false;
    }
}

// Obter dados do usuário logado
function getLoggedInUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
        return JSON.parse(user);
    } catch (e) {
        return null;
    }
}

// Verificar se o usuário é um administrador
function isAdmin() {
    const user = getLoggedInUser();
    return user && (user.userType === 'admin' || user.role === 'admin');
}

// Redirecionar para a página de dashboard após login
function redirectToDashboard() {
    // Esta função será implementada quando você criar o dashboard
    // Por enquanto, só exibe uma mensagem
    showMessage('Login bem-sucedido! Redirecionando...');

    // Simulação de redirecionamento
    setTimeout(() => {
        if (isAdmin()) {
            // Redirecionar para dashboard admin
            console.log('Redirecionando para dashboard de administrador');
            // window.location.href = '/admin';
        } else {
            // Redirecionar para dashboard de usuário
            console.log('Redirecionando para dashboard de usuário');
            // window.location.href = '/dashboard';
        }
    }, 2000);
}