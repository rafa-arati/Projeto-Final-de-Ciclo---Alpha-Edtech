const { createEvent, updateEventInDatabase, deleteEventFromDatabase, getAllEvents } = require('../models/Event');

const addEvent = async (req, res) => {
  const { eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl } = req.body;

  try {
    const newEvent = await createEvent(eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar evento', error });
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

module.exports = { addEvent, updateEvent, deleteEvent, listAllEvents };