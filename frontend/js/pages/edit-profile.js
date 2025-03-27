import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { getLoggedInUser } from '../modules/store.js';

export default function renderEditProfile(queryParams) {
  const user = getLoggedInUser();
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <div class="header">
        <a href="#" id="back-btn" class="back-button">←</a>
        <h1>Editar Perfil</h1>
      </div>

      <form id="profileForm" class="profile-form">
        <div class="input-group">
          <input type="text" id="name" placeholder="Nome" value="${user?.name || ''}" required>
        </div>

        <div class="input-group">
          <input type="email" id="email" placeholder="E-mail" value="${user?.email || ''}" disabled>
        </div>

        <div class="input-group">
          <label>Telefone</label>
          <input type="tel" id="phone" 
                 value="${user?.phone || ''}" 
                 placeholder="(XX) XXXXX-XXXX">
          <small class="input-hint">Digite apenas números com DDD (ex: 11999998888)</small>
        </div>

        <div class="form-buttons">
          <button type="submit" class="btn">Salvar Alterações</button>
          <button type="button" id="logout-btn" class="btn secondary">Sair</button>
        </div>
      </form>
    </div>
  `;

  // Event Listeners
  document.getElementById('back-btn').addEventListener('click', () => {
    window.history.back(); // Volta para a página anterior
  });
  document.getElementById('phone').addEventListener('input', function(e) {
    e.target.value = formatPhoneNumber(e.target.value);
});
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('profileForm').addEventListener('submit', handleSubmit);
  document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0,11);
    
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    e.target.value = value;
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const user = getLoggedInUser();
  
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value
  };

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Falha na atualização');

    showMessage('Perfil atualizado com sucesso!', 'success');
    setTimeout(() => navigateTo('events'), 1500);

  } catch (error) {
    showMessage(error.message || 'Erro ao atualizar perfil', 'error');
  }
}

async function handleLogout() {
  localStorage.removeItem('token');
  navigateTo('login');
}

function formatPhoneNumber(value) {
    if (!value) return '';
    
    const numbers = value.replace(/\D/g, '');
    const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    
    if (!match) return value;
    
    return [
      match[1] ? `(${match[1]}` : '',
      match[2] ? `) ${match[2]}` : '',
      match[3] ? `-${match[3]}` : ''
    ].join('');
}
