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
    // Extrai parâmetros da URL (como ?token=abc123)
    const queryParams = new URLSearchParams(window.location.search);

    // Carrega a página dinamicamente
    const { default: renderPage } = await import(`../pages/${page}.js`);

    // Chama a função da página passando os parâmetros
    renderPage(queryParams);

  } catch (error) {
    console.error('Erro ao carregar página:', error);
    navigateTo('login'); // Fallback para login
    showMessage('Página não encontrada');
  }
}

// Navega para uma página específica
export function navigateTo(page) {
  window.location.hash = page;
}