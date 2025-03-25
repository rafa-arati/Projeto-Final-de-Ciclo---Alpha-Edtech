/**
 * Gerenciador de estado global (simples)
 * Armazena dados do usuário e preferências no localStorage
 */
const STORAGE_KEY = 'rota_cultural_user';

// Salva os dados do usuário no localStorage
export function saveUser(userData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...userData,
    isLoggedIn: true
  }));
}

// Remove os dados do usuário (logout)
export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// Obtém os dados do usuário logado
export function getLoggedInUser() {
  const user = localStorage.getItem(STORAGE_KEY);
  return user ? JSON.parse(user) : null;
}

// Verifica se o usuário é admin
export function isAdmin() {
  const user = getLoggedInUser();
  return user?.role === 'admin';
}

// Atualiza preferências do usuário
export function updateUserPreferences(preferences) {
  const user = getLoggedInUser();
  if (user) {
    saveUser({ ...user, preferences });
  }
}