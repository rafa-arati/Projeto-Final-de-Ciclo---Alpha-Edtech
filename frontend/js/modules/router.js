import { showMessage } from './utils.js';
import { getLoggedInUser } from './store.js';

export function initRouter() {
  // Carrega a página inicial baseada no hash
  window.addEventListener('DOMContentLoaded', () => {
    const fullHash = window.location.hash.replace('#', '');
    const [path, queryString] = fullHash.split('?');

    const queryParams = new URLSearchParams(queryString || '');
    loadPage(path, queryParams);
  });

  // Atualiza quando o hash muda
  window.addEventListener('hashchange', () => {
    const fullHash = window.location.hash.replace('#', '');
    const [path, queryString] = fullHash.split('?');

    const queryParams = new URLSearchParams(queryString || '');
    loadPage(path, queryParams);
  });
}

async function loadPage(page, queryParams) {
  try {
    console.log('Carregando página:', page);
    console.log('Parâmetros:', Object.fromEntries(queryParams));

    // Carrega a página dinamicamente
    const { default: renderPage } = await import(`../pages/${page}.js`);

    // Chama a função da página passando os parâmetros
    renderPage(queryParams);

  } catch (error) {
    console.error('Erro ao carregar página:', error);
    navigateTo('login');
    showMessage('Página não encontrada');
  }
}

// Navega para uma página específica
export function navigateTo(page, queryParams = {}) {
  const queryString = new URLSearchParams(queryParams).toString();
  const hashUrl = queryString
    ? `#${page}?${queryString}`
    : `#${page}`;

  window.location.hash = hashUrl;
}