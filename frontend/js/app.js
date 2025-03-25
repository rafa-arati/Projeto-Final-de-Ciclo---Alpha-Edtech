import { initRouter } from './modules/router.js';
import { setupModal } from './modules/utils.js';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  setupModal(); // Configura o modal de mensagens
  initRouter(); // Inicia o roteador SPA
});