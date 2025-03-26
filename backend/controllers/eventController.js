const Event = require('../models/Event');
const pool = require('../config/db'); // Adicione esta linha

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
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`; // Usa o nome gerado pelo multer
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
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`; // Usa o nome gerado pelo multer
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
    const searchTerm = req.query.searchTerm;
    let query = 'SELECT * FROM events';
    let params = [];

    if (searchTerm) {
      query += ` WHERE 
        event_name ILIKE $1 OR 
        category ILIKE $1 OR 
        description ILIKE $1`;
      params.push(`%${searchTerm}%`);
    }

    query += ' ORDER BY event_date, event_time';
    
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
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