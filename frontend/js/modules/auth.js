import { saveUser, clearUser } from './store.js';
import { showMessage } from './utils.js';

const API_URL = '/api/auth';
const PASSWORD_API_URL = '/api/password';

export async function loginUser(identifier, password, userType) {
  try {
    console.log('Tentando fazer login com:', { identifier, userType });

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
    console.log('Login bem-sucedido:', data);

    // Verificar se os dados do usuário estão completos
    if (!data.user || !data.user.id) {
      throw new Error('Dados do usuário incompletos');
    }

    // Salva o usuário usando a função do store.js
    saveUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || '',
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

    // Limpa o usuário mesmo se a requisição falhar
    clearUser();

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Aviso no logout:', errorData.message);
      // Não lançar erro para não impedir o logout do lado do cliente
    }

    return { success: true, message: 'Logout realizado com sucesso' };
  } catch (error) {
    console.error('Erro no logout:', error);
    clearUser(); // Garantir que os dados sejam limpos mesmo com erro
    return { success: true, message: 'Logout local realizado' };
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
  // Obter do cookie (se estiver usando httpOnly cookies)
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  return cookieToken || null;
}

export async function fetchCompleteUserData() {
  try {
    console.log('Buscando dados completos do usuário');

    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Importante para enviar cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar dados');
    }

    const userData = await response.json();
    console.log('Dados completos do usuário recebidos:', userData);

    if (!userData || !userData.id) {
      throw new Error('Dados do usuário incompletos');
    }

    // Atualiza o localStorage com dados completos
    saveUser(userData);
    return userData;
  } catch (error) {
    console.error('Erro ao buscar dados completos:', error);
    throw error;
  }
}