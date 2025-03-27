import { navigateTo } from '../modules/router.js';
import { showMessage } from '../modules/utils.js';
import { fetchCompleteUserData } from '../modules/auth.js'; // Removida a importação inexistente

export default async function renderEditProfile(queryParams) {
  try {
    // Adicione await aqui para esperar a resposta
    const user = await fetchCompleteUserData();

    console.log('Usuário completo:', user);
    console.log('Número do telefone do usuário:', user?.phone);
    console.log('genero:', user?.gender);
    console.log('cargo:', user?.role);
    console.log('nome:', user?.username);
    console.log('email:', user?.email);
    console.log('email:', user?.birth_date);
    // Formata o telefone para exibição inicial apenas se existir no banco
    const formattedPhone = user?.phone ? formatPhoneNumber(user.phone) : '';

    console.log('Telefone formatado:', formattedPhone);

    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
    <div class="container">
      <div class="header">
        <a href="#" id="back-btn" class="back-button">←</a>
        <h1>Editar Perfil</h1>
      </div>

      <form id="profileForm" class="profile-form">
        <div class="input-group">
          <input type="text" id="name" placeholder="Nome" value="${user?.username || ''}" required>
        </div>

        <div class="input-group">
          <input type="email" id="email" placeholder="E-mail" value="${user?.email || ''}" disabled>
        </div>

        <div class="input-group">
          <label>Telefone</label>
          <input type="tel" id="phone" 
                 value="${formattedPhone}" 
                 placeholder="(XX) XXXXX-XXXX"
                 maxlength="15"> <!-- Limite de caracteres com formatação -->
          <small class="input-hint">Digite o DDD + número (11 dígitos)</small>
        </div>

        <div class="form-buttons">
          <button type="submit" class="btn">Salvar Alterações</button>
          <button type="button" id="logout-btn" class="btn secondary">Sair</button>
        </div>
      </form>
    </div>
  `;

    // Configura eventos
    document.getElementById('back-btn').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('events');
    });

    // Formatação rigorosa do telefone durante a digitação
    document.getElementById('phone').addEventListener('input', function (e) {
      const cursorPosition = e.target.selectionStart;
      const formattedValue = enforcePhoneFormat(e.target.value);
      e.target.value = formattedValue;

      // Mantém a posição do cursor correta após formatação
      if (cursorPosition === 1 && formattedValue.length === 1) {
        e.target.setSelectionRange(2, 2);
      } else if (cursorPosition === 3 && formattedValue.length === 3) {
        e.target.setSelectionRange(4, 4);
      } else if (cursorPosition === 9 && formattedValue.length === 9) {
        e.target.setSelectionRange(10, 10);
      } else {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showMessage('Erro ao carregar dados do perfil', 'error');
    // Você pode redirecionar para outra página ou mostrar uma UI de erro
    navigateTo('events'); // ou outra rota apropriada
  }


  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('profileForm').addEventListener('submit', handleSubmit);
}

// Função que aplica a formatação EXATA (XX) XXXXX-XXXX
function enforcePhoneFormat(value) {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11);

  // Aplica a formatação exata
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
  }
}

// Função para formatar o telefone que vem do banco de dados
function formatPhoneNumber(phoneFromDB) {
  if (!phoneFromDB) return '';

  // Remove possíveis formatações antigas
  const numbers = phoneFromDB.toString().replace(/\D/g, '');

  // Aplica a formatação correta
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  // Se não tiver 11 dígitos, retorna sem formatação
  return numbers;
}

async function handleSubmit(e) {
  e.preventDefault();
  const user = getLoggedInUser();

  const name = document.getElementById('name').value.trim();
  const rawPhone = document.getElementById('phone').value.replace(/\D/g, '');

  // Validações
  if (!name) {
    return showMessage('Nome é obrigatório', 'error');
  }

  if (rawPhone && rawPhone.length !== 11) {
    return showMessage('Telefone deve ter exatamente 11 dígitos (DDD + número)', 'error');
  }

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        name: name,
        phone: rawPhone || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha na atualização');
    }

    // Atualiza os dados locais
    if (user) {
      user.name = name;
      user.phone = rawPhone;
    }

    showMessage('Perfil atualizado com sucesso!', 'success');

  } catch (error) {
    console.error('Erro na atualização:', error);
    showMessage(error.message || 'Erro ao atualizar perfil', 'error');
  }
}

async function handleLogout() {
  localStorage.removeItem('token');
  navigateTo('login');
}