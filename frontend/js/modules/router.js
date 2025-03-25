import { showMessage } from './utils.js';
import { getLoggedInUser } from './store.js';

export function initRouter() {
  // Carrega a página inicial baseada no hash
  window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.hash.replace('#', '') || 'login';
    loadPage(path);
  });

  // Atualiza quando o hash muda
  window.addEventListener('hashchange', () => {
    const path = window.location.hash.replace('#', '');
    loadPage(path);
  });
}

async function loadPage(page) {
  try {
    // Verifica autenticação para rotas protegidas
    if (page === 'dashboard' && !getLoggedInUser()) {
      showMessage('Faça login para acessar esta página.');
      window.location.hash = 'login';
      return;
    }

    // Carrega dinamicamente o módulo da página
    const pageModule = await import(`../pages/${page}.js`);

    // Chama a função principal da página (showLoginForm, showRegisterForm, etc)
    if (pageModule.default) {
      pageModule.default(); // Para páginas que usam export default
    } else if (pageModule[`show${page.charAt(0).toUpperCase() + page.slice(1)}Form`]) {
      // Para páginas que exportam funções nomeadas (showLoginForm, showRegisterForm)
      pageModule[`show${page.charAt(0).toUpperCase() + page.slice(1)}Form`]();
    } else {
      throw new Error(`Função de renderização não encontrada em ${page}.js`);
    }
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    window.location.hash = 'login'; // Fallback
    showMessage('Página não encontrada. Redirecionando...');
  }
}

// Navega para uma página específica
export function navigateTo(page) {
  window.location.hash = page;
}