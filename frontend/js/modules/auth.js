import { saveUser, clearUser } from './store.js';
import { showMessage } from './utils.js';

const API_URL = '/api/auth';
const PASSWORD_API_URL = '/api/password';

export async function loginUser(identifier, password, userType) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    const data = await response.json();

    // Salva o usuário usando a função do store.js
    saveUser({
      id: data.user.id,
      email: data.user.email,
      username: data.user.username,
      role: data.user.role || userType
    });

    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer logout');
    }

    // Limpa o usuário usando a função do store.js
    clearUser();

    return await response.json();
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email) {
  try {
    const response = await fetch(`${PASSWORD_API_URL}/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Lança o erro com a mensagem do servidor, se disponível
      throw new Error(responseData.message || 'Falha ao enviar email de recuperação');
    }

    return responseData;
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    throw error;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres');
    }

    const response = await fetch(`${PASSWORD_API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao redefinir senha');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    throw error;
  }
}

export function getToken() {
  // Tenta pegar do localStorage primeiro (se você armazena lá)
  const storedToken = localStorage.getItem('auth_token');

  // Ou pode pegar dos cookies (se você usa httpOnly cookies)
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  return storedToken || cookieToken || null;
}


export async function fetchCompleteUserData() {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${getToken()}`, // Implemente getToken() se necessário
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Erro ao buscar dados');

    const userData = await response.json();
    saveUser(userData); // Atualiza o localStorage com dados completos
    return userData;
  } catch (error) {
    console.error('Erro ao buscar dados completos:', error);
    throw error;
  }
}