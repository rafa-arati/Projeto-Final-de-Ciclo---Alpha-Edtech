// Gerenciamento da SPA
import { renderCriarEvento } from './creat_event.js';
import { renderLogin } from './login.js';
import { renderRegister } from './register.js';
import { renderTelaInicial } from './tela-inicial.js';
import { renderEventos } from './eventos.js';
import { isUserLoggedIn, isAdmin } from './auth.js';

function handleRouteChange() {
    const path = window.location.hash.substring(1); // Remove o '#' inicial
    const container = document.getElementById('app');
    if (!container) return;
    container.innerHTML = ''; // Limpa o conteúdo anterior

    // Verifica se o usuário está logado para rotas protegidas
    if (path.startsWith('/admin') || path.startsWith('/eventos')) {
        if (!isUserLoggedIn()) {
            window.location.hash = '/login';
            return;
        }
    }

    // Roteamento da aplicação
    switch (path) {
        case '/login':
            renderLogin();
            break;
        case '/register':
            renderRegister();
            break;
        case '/eventos':
            renderEventos();
            break;
        case '/admin/eventos/novo':
            // Só administradores podem acessar esta rota
            if (!isAdmin()) {
                window.location.hash = '/eventos';
                return;
            }
            renderCriarEvento();
            break;
        case '/admin/eventos/editar':
            // Só administradores podem acessar esta rota
            if (!isAdmin()) {
                window.location.hash = '/eventos';
                return;
            }
            renderCriarEvento(true); // true indica modo de edição
            break;
        case '/inicial':
        case '/':
            renderTelaInicial();
            break;
        default:
            // Redireciona para a página inicial por padrão
            renderTelaInicial();
    }
}

// Adicione um listener para o evento hashchange
window.addEventListener('hashchange', handleRouteChange);

// Renderize a página inicial na primeira carga
document.addEventListener('DOMContentLoaded', () => {
    handleRouteChange();
    setupModal();
});

// Configurar o modal de mensagens
function setupModal() {
    const modal = document.getElementById('message-modal');
    const closeModal = document.querySelector('.close-modal');
    const confirmButton = document.getElementById('modal-confirm');

    // Fechar ao clicar no X
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            modal.classList.remove('active');
        });
    }

    // Fechar ao clicar no botão de confirmação
    if (confirmButton) {
        confirmButton.addEventListener('click', function () {
            modal.classList.remove('active');
        });
    }

    // Fechar ao clicar fora do modal
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Exibir mensagem no modal
export function showMessage(message) {
    const modal = document.getElementById('message-modal');
    const modalMessage = document.getElementById('modal-message');

    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.classList.add('active');
    } else {
        console.error('Modal ou elemento de mensagem não encontrado');
        alert(message); // Fallback para alert
    }
}