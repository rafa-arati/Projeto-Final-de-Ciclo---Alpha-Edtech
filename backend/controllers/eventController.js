const Event = require('../models/Event');

const addEvent = async (req, res) => {
  console.log("Requisição recebida em /api/events", {
    body: req.body,
    file: req.file ? "Arquivo recebido" : "Nenhum arquivo",
    user: req.user
  });

  const { nome, data, horario, categoria, localizacao, link, descricao } = req.body;
  const imagem = req.file; // Informações do arquivo enviado

  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      console.log("Usuário não autenticado");
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário é admin
    if (req.user.role !== 'admin') {
      console.log("Usuário não é admin:", req.user.role);
      return res.status(403).json({ message: 'Apenas administradores podem criar eventos' });
    }

    let photoUrl = null;
    if (imagem) {
      // Aqui você precisará implementar a lógica para salvar a imagem
      // Por exemplo, você pode usar um serviço de armazenamento em nuvem
      // ou salvar o arquivo localmente e armazenar o caminho/URL.
      // Para este exemplo, vamos apenas simular uma URL.
      photoUrl = `/uploads/${imagem.originalname}`;
      console.log('Arquivo de imagem recebido:', imagem); // Para depuração
    }

    // Verificar se os campos necessários estão presentes
    if (!nome || !data) {
      console.log("Campos obrigatórios ausentes");
      return res.status(400).json({ message: 'Nome e data são obrigatórios' });
    }

    console.log("Tentando criar evento com:", { nome, data, horario, categoria, localizacao, link, descricao, photoUrl });
    const newEvent = await Event.createEvent(nome, data, horario, categoria, localizacao, link, descricao, photoUrl);
    console.log("Evento criado com sucesso:", newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Erro ao adicionar evento:', error);
    res.status(500).json({ message: 'Erro ao adicionar evento', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { nome, data, horario, categoria, localizacao, link, descricao } = req.body;
  const imagem = req.file;

  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem editar eventos' });
    }

    // Verificar se o evento existe
    const existingEvent = await Event.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    let photoUrl = existingEvent.photo_url;
    if (imagem) {
      // Lógica para processar a nova imagem 
      photoUrl = `/uploads/${imagem.originalname}`;
    }

    // Atualizar o evento
    const updatedEvent = await Event.updateEventInDatabase(
      id,
      nome,
      data,
      horario,
      categoria,
      localizacao,
      link,
      descricao,
      photoUrl
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem excluir eventos' });
    }

    // Verificar se o evento existe
    const existingEvent = await Event.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Excluir o evento
    await Event.deleteEventFromDatabase(id);
    res.status(200).json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ message: 'Erro ao remover evento', error: error.message });
  }
};

// Função para listar todos os eventos
const listAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error); // Log detalhado do erro
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

// Função para obter um evento por ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.getEventById(id);
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: 'Evento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar evento por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
  }
};

module.exports = {
  addEvent,
  updateEvent,
  deleteEvent,
  listAllEvents,
  getEventById
};