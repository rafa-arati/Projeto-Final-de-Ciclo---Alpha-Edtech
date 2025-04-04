const USER_STORAGE_KEY = 'rota_cultural_user';
const PREFERENCES_STORAGE_KEY = 'rota_cultural_prefs';

/**
 * Salva os dados do usuário no localStorage
 * @param {object} userData - Dados do usuário
 */
export function saveUser(userData) {
  if (!userData?.id) {
    console.error('Dados do usuário inválidos:', userData);
    throw new Error('Dados do usuário inválidos');
  }

  const dataToStore = {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    name: userData.name || '',
    role: userData.role || 'user',
    phone: userData.phone || null,
    gender: userData.gender || null,
    birth_date: userData.birth_date || null,
    isLoggedIn: true,
    lastUpdated: Date.now()
  };

  console.log('Salvando usuário no localStorage:', dataToStore);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dataToStore));
}

/**
 * Remove os dados do usuário do localStorage
 */
export function clearUser() {
  console.log('Removendo usuário do localStorage');
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(PREFERENCES_STORAGE_KEY);
}

/**
 * Obtém os dados do usuário logado
 * @returns {object|null} Dados do usuário ou null se não estiver logado
 */
export function getLoggedInUser() {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) {
      console.log('Nenhum dado de usuário encontrado no localStorage');
      return null;
    }

    const parsedData = JSON.parse(userData);
    const isValid = parsedData && parsedData.isLoggedIn && parsedData.id;

    if (!isValid) {
      console.warn('Dados de usuário inválidos ou não está logado:', parsedData);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error);
    return null;
  }
}

/**
 * Verifica se o usuário atual é admin
 * @returns {boolean} True se for admin
 */
export function isAdmin() {
  const user = getLoggedInUser();
  return user?.role === 'admin';
}

/**
 * Verifica se o usuário atual é premium
 * @returns {boolean} True se for premium
 */
export function isPremium() {
  const user = getLoggedInUser();
  return user?.role === 'premium';
}

/**
 * Verifica se o usuário atual é premium ou admin
 * @returns {boolean} True se for premium ou admin
 */
export function isPremiumOrAdmin() {
  const user = getLoggedInUser();
  return user?.role === 'admin' || user?.role === 'premium';
}

/**
 * Obtém o status completo de autenticação
 * @returns {object} Objeto com status e dados do usuário
 */
export function getAuthStatus() {
  const user = getLoggedInUser();
  return {
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'admin',
    userData: user
  };
}

/**
 * Atualiza as preferências do usuário
 * @param {object} preferences - Novas preferências
 */
export function updateUserPreferences(preferences) {
  const user = getLoggedInUser();
  if (user) {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}'),
        ...preferences
      })
    );
  }
}

/**
 * Obtém as preferências do usuário
 * @returns {object} Preferências salvas
 */
export function getUserPreferences() {
  try {
    const prefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return prefs ? JSON.parse(prefs) : {};
  } catch (error) {
    console.error('Erro ao recuperar preferências:', error);
    return {};
  }
}

/**
 * Verifica se o usuário está logado
 * @returns {boolean} True se estiver logado
 */
export function isUserLoggedIn() {
  const user = getLoggedInUser();
  return !!user;
}