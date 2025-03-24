export function renderCriarEvento() {
    const container = document.getElementById('app');
    if (!container) return;

    container.innerHTML = `
        <div class="header">
            <a href="#/admin/events">←</a>
            <h1>Gerenciar Evento</h1>
        </div>
        <form id="criarEventoForm">
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
                        Adicionar evento
                    </button>
                    <button type="button" class="secondary-button" id="cancelarEvento">Cancelar</button>
                </div>
            </div>
            
            <div id="mensagem" class="message" style="display: none;"></div>
        </form>
    `;

    const form = document.getElementById('criarEventoForm');
    const imagemInput = document.getElementById('imagem');
    const imagemPrevia = document.getElementById('imagemPrevia');
    const previewImagemDiv = document.getElementById('previewImagem');
    const mensagemDiv = document.getElementById('mensagem');
    const cancelarButton = document.getElementById('cancelarEvento');
    const btnAdicionarFoto = document.getElementById('btnAdicionarFoto');

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

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const formData = new FormData(form);
    
        try {
            const response = await fetch('/admin/events', {
                method: 'POST',
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                showMessage('Evento criado com sucesso!', 'success');
                form.reset();
                imagemPrevia.src = '#';
                imagemPrevia.style.display = 'none';
                window.location.hash = '/admin/events'; // Redirecionar para a listagem de eventos
            } else {
                showMessage(data.message || 'Erro ao criar evento.', 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showMessage('Erro inesperado ao criar evento.', 'error');
        }
    });
    
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