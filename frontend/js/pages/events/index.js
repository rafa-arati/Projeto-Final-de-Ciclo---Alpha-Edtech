//Ponto de entrada principal

import { setupUIEvents } from './eventHandlers.js';
import { loadInitialData } from './dataLoader.js';
import { renderCarousels } from './renderers.js';
import { setupModals } from './modals.js';
import { navigateTo } from '../../modules/router.js';
import { showMessage } from '../../modules/utils.js';
import { getLoggedInUser, isAdmin } from '../../modules/store.js';
import { fetchCompleteUserData } from '../../modules/auth.js';

// Variáveis globais compartilhadas entre os módulos
export let eventos = [];
export let categorias = [];
export let currentEventId = null;
export let activeFilters = {};

export default async function renderEvents(queryParams) {
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  try {
    // Tentar atualizar os dados do usuário primeiro
    await fetchCompleteUserData().catch(err => {
      console.warn('Não foi possível atualizar dados do usuário:', err.message);
      // Prosseguir mesmo se esta chamada falhar
    });
  } catch (error) {
    console.warn('Erro ao buscar dados do usuário:', error);
    // Ignorar o erro e continuar
  }

  // Obter dados do usuário logado
  const user = getLoggedInUser();
  console.log('Dados do usuário atual:', user);

  const isAdminUser = isAdmin();

  // Renderizar a estrutura base da página
  appContainer.innerHTML = `
    <div class="app-wrapper">
      <div class="app-container">
        <header class="app-header">
          <div class="header-top">
            
          </div>
          <h1 class="header-title">Explore eventos</h1>
        </header>

        <section class="search-bar">
          <span class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </span>
          <input type="text" class="search-input" placeholder="Buscar eventos" id="search-input">
          <span class="filter-icon" id="filter-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
              viewBox="0 0 16 16">
              <path
                d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
            </svg>
          </span>
        </section>

        <!-- Filtros ativos (ocultos inicialmente) -->
        <section id="active-filters" class="active-filters" style="padding: 0 20px; margin-bottom: 15px; display: none;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <!-- Os filtros ativos serão adicionados aqui dinamicamente -->
          </div>
        </section>

        <!-- Seção de eventos em destaque -->
        <section class="carousel-section">
          <h2 class="section-title">EM DESTAQUE</h2>
          <div class="carousel-container">
            <button class="carousel-arrow left" id="destaque-left">&#10094;</button>
            <div class="carousel" id="destaque-eventos"></div>
            <button class="carousel-arrow right" id="destaque-right">&#10095;</button>
          </div>
        </section>

        <!-- Espaço para mais carrosséis de eventos por categoria -->
        <div id="categorias-container"></div>

        <div class="carousel-div"></div>

        <!-- Menu de navegação inferior -->
        <footer class="bottom-nav">
          <div class="nav-item active">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Home</span>
          </div>
          <div class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>Procurar</span>
          </div>

          <div class="nav-item">
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
              <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
            </svg>
            <span>Agenda</span>
          </div>
             
          <div class="nav-item">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Favoritos</span>
          </div>

          <div class="nav-item" id="nav-perfil">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Perfil</span>
          </div>
        </footer>
      </div>
    </div>
  `;

  // Incluir também os modais necessários
  setupModals();

  // Inicializar as funcionalidades da página
  try {
    // Carregar dados necessários
    await loadInitialData();

    // Configurar os eventos de UI
    setupUIEvents();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    showMessage("Não foi possível carregar os dados. Tente novamente mais tarde.");
  }
}