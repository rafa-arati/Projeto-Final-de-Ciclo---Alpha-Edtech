import { showMessage } from './utils.js';

export function setupImagePreview(inputId, previewId, buttonId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const button = document.getElementById(buttonId);

  if (!input || !preview || !button) return;

  button.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = '#';
      preview.style.display = 'none';
    }
  });
}

export function setupCancelModal(modalId, options = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const {
    cancelButtonId,
    closeButtonId,
    confirmButtonId,
    denyButtonId,
    onConfirm = () => navigateTo('events')
  } = options;

  document.getElementById(cancelButtonId)?.addEventListener('click', () => {
    modal.classList.add('active');
  });

  document.getElementById(closeButtonId)?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById(denyButtonId)?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById(confirmButtonId)?.addEventListener('click', () => {
    onConfirm();
    modal.classList.remove('active');
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.remove('active');
    }
  });
}