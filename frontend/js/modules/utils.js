// Gerenciamento do Modal
export function setupModal() {
  const modal = document.getElementById('message-modal');
  const closeModal = document.querySelector('.close-modal');
  const confirmButton = document.getElementById('modal-confirm');

  closeModal?.addEventListener('click', () => modal.classList.remove('active'));
  confirmButton?.addEventListener('click', () => modal.classList.remove('active'));
  window.addEventListener('click', (event) => {
    if (event.target === modal) modal.classList.remove('active');
  });
}

// Exibir mensagens no modal
export function showMessage(message) {
  const modal = document.getElementById('message-modal');
  const modalMessage = document.getElementById('modal-message');
  if (!modal || !modalMessage) return;

  modalMessage.textContent = message;
  modal.classList.add('active');
}

// Transição entre páginas
export function transitionToPage(currentPage, newPageFunction) {
  const container = document.querySelector(`.${currentPage}-container`);
  if (container) container.classList.add('fade-out');
  setTimeout(() => newPageFunction(), 500);
}

// Validação de senha (pode ser movida para um módulo específico de validação depois)
export function validatePassword(password) {
  return {
    hasMinLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
}