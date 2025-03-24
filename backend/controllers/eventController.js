const { createEvent } = require('../models/Event');

const addEvent = async (req, res) => {
  const { nome, data, horario, categoria, localizacao, link, descricao } = req.body;
  const imagem = req.file; // Informações do arquivo enviado

  try {
    let photoUrl = null;
    if (imagem) {
      // Aqui você precisará implementar a lógica para salvar a imagem
      // Por exemplo, você pode usar um serviço de armazenamento em nuvem
      // ou salvar o arquivo localmente e armazenar o caminho/URL.
      // Para este exemplo, vamos apenas simular uma URL.
      photoUrl = `/uploads/${imagem.originalname}`;
      console.log('Arquivo de imagem recebido:', imagem); // Para depuração
    }

    const newEvent = await createEvent(nome, data, horario, categoria, localizacao, link, descricao, photoUrl);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Erro ao adicionar evento:', error);
    res.status(500).json({ message: 'Erro ao adicionar evento', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl } = req.body;

  try {
    // Lógica para atualizar o evento no banco de dados
    const updatedEvent = await updateEventInDatabase(id, eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar evento', error });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // Lógica para remover o evento do banco de dados
    await deleteEventFromDatabase(id);
    res.status(200).json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover evento', error });
  }
};

// Função para listar todos os eventos
const listAllEvents = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error); // Log detalhado do erro
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

// Função para obter um evento por ID (adicionado conforme a rota no routes)
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await getEventByIdFromDatabase(id); // Assumindo que você tenha essa função no seu model
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

module.exports = { addEvent, updateEvent, deleteEvent, listAllEvents, getEventById };