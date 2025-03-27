import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { saveUser } from '../modules/store.js';

export default function render(queryParams) {
  // Obtém o ID do usuário da URL
  const userId = queryParams.get('userId');

  if (!userId) {
    showMessage('Erro: ID de usuário não encontrado');
    navigateTo('login');
    return;
  }

  // Renderiza o formulário de onboarding
  document.getElementById('app').innerHTML = `
    <div class="container onboarding-container">
      <div class="logo"><span>R</span>OTA<span>CULTURAL</span></div>
      <div class="welcome">Precisamos de algumas informações adicionais</div>
      
      <form id="onboardingForm">
        <input type="hidden" id="userId" value="${userId}">
        
        <div class="input-group date-input">
          <div class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <input type="text" id="birthDate" placeholder="Data de Nascimento (DD-MM-AAAA)" 
                pattern="\\d{2}-\\d{2}-\\d{4}" required>
        </div>
        
        <div class="input-group select-wrapper">
          <div class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#8000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <select id="gender" required>
            <option value="" disabled selected>Selecione o Gênero</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        
        <button type="submit" class="btn">CONCLUIR CADASTRO</button>
      </form>
      
      <div class="bottom-text">
        Essas informações são necessárias para melhorar sua experiência no Rota Cultural.
      </div>
    </div>
  `;

  setupOnboardingEvents();
}

function setupOnboardingEvents() {
  // Formatação de data de nascimento
  document.getElementById('birthDate')?.addEventListener('input', formatBirthDate);

  // Envio do formulário
  document.getElementById('onboardingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await completeOnboarding();
  });
}

// Função para formatação automática da data
function formatBirthDate() {
  const input = document.getElementById('birthDate');
  let value = input.value.replace(/\D/g, '');

  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 4) {
    value = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4)}`;
  } else if (value.length > 2) {
    value = `${value.substring(0, 2)}-${value.substring(2)}`;
  }

  input.value = value;
}

// Função para enviar as informações de onboarding
async function completeOnboarding() {
  const userId = document.getElementById('userId').value;
  const birthDate = document.getElementById('birthDate').value;
  const gender = document.getElementById('gender').value;

  // Validação básica
  if (!userId || !birthDate || !gender) {
    showMessage('Por favor, preencha todos os campos.');
    return;
  }

  try {
    const response = await fetch('/api/auth/complete-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, birth_date: birthDate, gender })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao completar cadastro');
    }

    const data = await response.json();

    // Salva os dados do usuário na sessão
    saveUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      username: data.user.username,
      photo_url: data.user.photo_url,
      role: data.user.role || 'user'
    });

    showMessage('Cadastro completado com sucesso! Redirecionando...');
    setTimeout(() => navigateTo('events'), 1500);
  } catch (error) {
    console.error('Erro ao completar onboarding:', error);
    showMessage(error.message || 'Erro ao completar cadastro. Tente novamente.');
  }
}