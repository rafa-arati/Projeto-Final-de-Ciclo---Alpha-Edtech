import { showMessage } from './app.js';

export function renderCriarEvento(isEditing = false) {
    const container = document.getElementById('app');
    if (!container) return;

    // Verificar se estamos no modo de edição
    const editEventId = isEditing ? localStorage.getItem('editEventId') : null;
    const titulo = isEditing ? 'Editar Evento' : 'Criar Novo Evento';
    const btnText = isEditing ? 'Salvar Alterações' : 'Adicionar Evento';

    container.innerHTML = `
        <div class="header">
            <a href="#/eventos">←</a>
            <h1>${titulo}</h1>
        </div>
        <form id="criarEventoForm">
            <input type="hidden" id="eventoId" value="${editEventId || ''}">
            
            <div class="left-column">
                <div class="form-group">
                    <label for="nome">Nome do evento</label>
                    <input type="text" id="nome" name="nome" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="data">Data</label>
                        <input type="date" id="data" name="data" required>
                    </div>
                    <div class="form-group">
                        <label for="horario">Horário</label>
                        <input type="time" id="horario" name="horario">
                    </div>
                    <div class="form-group">
                        <label for="categoria">Categoria</label>
                        <input type="text" id="categoria" name="categoria">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="localizacao">Localização</label>
                    <input type="text" id="localizacao" name="localizacao" required>
                </div>
                
                <div class="form-group">
                    <label for="link">Link</label>
                    <input type="url" id="link" name="link">
                </div>
                
                <div class="form-group">
                    <label for="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao" rows="5"></textarea>
                </div>
            </div>
            
            <div class="right-column">
                <div>
                    <div id="previewImagem" class="image-preview">
                        <img id="imagemPrevia" src="#" alt="" style="display: none;">
                    </div>
                    
                    <button type="button" class="add-photo-button" id="btnAdicionarFoto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/>
                        </svg>
                        Adicionar Foto
                    </button>
                    <input type="file" id="imagem" name="imagem" accept="image/*" style="display: none;">
                </div>
                
                <div class="form-buttons">
                    <button type="submit" class="primary-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white"/>
                        </svg>
                        ${btnText}
                    </button>
                    <button type="button" class="secondary-button" id="cancelarEvento">Cancelar</button>
                </div>
            </div>
            
            <div id="mensagem" class="message" style="display: none;"></div>
        </form>
        
        <!-- Modal de confirmação para cancelar evento -->
        <div class="modal" id="cancelarModal">
            <div class="modal-content">
                <span class="close-modal" id="fecharCancelarModal">&times;</span>
                <h3>Confirmar cancelamento</h3>
                <p>Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.</p>
                <div class="modal-buttons">
                    <button id="confirmarCancelar" class="btn">Sim, cancelar</button>
                    <button id="negarCancelar" class="btn secondary">Não, continuar editando</button>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('criarEventoForm');
    const imagemInput = document.getElementById('imagem');
    const imagemPrevia = document.getElementById('imagemPrevia');
    const previewImagemDiv = document.getElementById('previewImagem');
    const mensagemDiv = document.getElementById('mensagem');
    const cancelarButton = document.getElementById('cancelarEvento');
    const btnAdicionarFoto = document.getElementById('btnAdicionarFoto');
    const cancelarModal = document.getElementById('cancelarModal');
    const fecharCancelarModal = document.getElementById('fecharCancelarModal');
    const confirmarCancelar = document.getElementById('confirmarCancelar');
    const negarCancelar = document.getElementById('negarCancelar');

    // Se estivermos no modo de edição, carregar os dados do evento
    if (isEditing && editEventId) {
        carregarDadosEvento(editEventId);
    }

    // Ativar input de arquivo ao clicar no botão de adicionar foto
    btnAdicionarFoto.addEventListener('click', () => {
        imagemInput.click();
    });

    imagemInput.addEventListener('change', () => {
        const file = imagemInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagemPrevia.src = e.target.result;
                imagemPrevia.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagemPrevia.src = '#';
            imagemPrevia.style.display = 'none';
        }
    });

    // Configurar modal de cancelamento
    cancelarButton.addEventListener('click', () => {
        cancelarModal.classList.add('active');
    });

    fecharCancelarModal.addEventListener('click', () => {
        cancelarModal.classList.remove('active');
    });

    negarCancelar.addEventListener('click', () => {
        cancelarModal.classList.remove('active');
    });

    confirmarCancelar.addEventListener('click', () => {
        form.reset();
        imagemPrevia.src = '#';
        imagemPrevia.style.display = 'none';
        cancelarModal.classList.remove('active');
        window.location.hash = '/eventos'; // Redireciona para a tela de eventos
    });

    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === cancelarModal) {
            cancelarModal.classList.remove('active');
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const eventoId = document.getElementById('eventoId').value;

        try {
            let url = '/api/events';
            let method = 'POST';

            // Se estivermos editando, usar PUT e incluir o ID na URL
            if (isEditing && eventoId) {
                url = `/api/events/${eventoId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                body: formData,
                credentials: 'include' // Para enviar cookies de autenticação
            });

            const data = await response.json();

            if (response.ok) {
                // Mostrar mensagem de sucesso
                showMessage(isEditing ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 'success');

                // Limpar o formulário
                form.reset();
                imagemPrevia.src = '#';
                imagemPrevia.style.display = 'none';

                // Redirecionar após um breve delay
                setTimeout(() => {
                    window.location.hash = '/eventos';
                }, 1500);
            } else {
                showMessage(data.message || 'Erro ao processar evento.', 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showMessage('Erro inesperado ao processar evento.', 'error');
        }
    });

    // Função para carregar os dados do evento para edição
    async function carregarDadosEvento(id) {
        try {
            const response = await fetch(`/api/events/${id}`, {
                credentials: 'include' // Para enviar cookies de autenticação
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar dados do evento');
            }

            const evento = await response.json();

            // Preencher o formulário com os dados do evento
            document.getElementById('nome').value = evento.event_name || '';

            // Formatar a data para o formato do input date (YYYY-MM-DD)
            if (evento.event_date) {
                const date = new Date(evento.event_date);
                const formattedDate = date.toISOString().split('T')[0];
                document.getElementById('data').value = formattedDate;
            }

            document.getElementById('horario').value = evento.event_time || '';
            document.getElementById('categoria').value = evento.category || '';
            document.getElementById('localizacao').value = evento.location || '';
            document.getElementById('link').value = evento.event_link || '';
            document.getElementById('descricao').value = evento.description || '';

            // Exibir a imagem se existir
            if (evento.photo_url) {
                imagemPrevia.src = evento.photo_url;
                imagemPrevia.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do evento:', error);
            showMessage('Erro ao carregar dados do evento. Tente novamente.', 'error');
        }
    }

    // Função para mostrar mensagem temporária
    function showMessage(text, type) {
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.textContent = text;
        mensagemDiv.className = `message ${type}`;
        mensagemDiv.style.display = 'block';
        mensagemDiv.classList.add('fade-out');

        // Remover após 3.5 segundos (3s delay + 0.5s animação)
        setTimeout(() => {
            mensagemDiv.style.display = 'none';
            mensagemDiv.classList.remove('fade-out');
        }, 3500);
    }
}