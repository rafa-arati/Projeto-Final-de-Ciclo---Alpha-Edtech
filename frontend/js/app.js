// Gerenciamento da SPA
// Importe a função renderCriarEvento
import { renderCriarEvento } from './creat_event.js';
import { renderLogin } from './login.js'; // Importe a função renderLogin
import { renderRegister } from './register.js'; // Importe a função renderRegister

function handleRouteChange() {
    const path = window.location.hash.substring(1); // Remove o '#' inicial

    const container = document.getElementById('app'); // Seleciona o container usando o ID 'app'
    if (!container) return;
    container.innerHTML = ''; // Limpa o conteúdo anterior

    if (path === '/login') {
        renderLogin();
    } else if (path === '/register') {
        renderRegister();
    } else if (path === '/admin/eventos/novo') {
        renderCriarEvento();
    } else {
        // Renderize a página de login como página inicial
        renderLogin();
    }
}

// Adicione um listener para o evento hashchange
window.addEventListener('hashchange', handleRouteChange);

// Renderize a página inicial na primeira carga
handleRouteChange();

// Configurar o modal de mensagens
function setupModal() {
    const modal = document.getElementById('message-modal');
    const closeModal = document.querySelector('.close-modal');
    const confirmButton = document.getElementById('modal-confirm');

    // Fechar ao clicar no X
    closeModal.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    // Fechar ao clicar no botão de confirmação
    confirmButton.addEventListener('click', function () { // Correção do erro de digitação
        modal.classList.remove('active');
    });

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

    modalMessage.textContent = message;
    modal.classList.add('active');
}

// Inicializar o modal
document.addEventListener('DOMContentLoaded', setupModal);