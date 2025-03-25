import { saveUser, clearUser } from './store.js';
import { showMessage } from './utils.js';

const API_URL = '/api/auth';

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

    // Usa a função do store.js para salvar
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

    clearUser(); // Usa a função do store.js
    return await response.json();
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
}

// Funções depreciadas (agora estão no store.js)
// - isUserLoggedIn() → Use getLoggedInUser() do store.js
// - isAdmin() → Moved to store.js
// - redirectToDashboard() → Substituída por navigateTo() no router.js

/**
 * ENVIA EMAIL DE RECUPERAÇÃO (ESQUECI SENHA)
 * @param {string} email - Email do usuário
 * @throws {Error} - Erro se a requisição falhar
 */
export async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE_URL}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao solicitar reset de senha');
  }
}

/**
 * SUBMETE NOVA SENHA (FORMULÁRIO DE REDEFINIÇÃO)
 * @param {string} token - Token JWT do link
 * @param {string} newPassword - Nova senha
 * @throws {Error} - Erro se o token ou senha forem inválidos
 */
export async function submitNewPassword(token, newPassword) {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao atualizar senha');
  }
}