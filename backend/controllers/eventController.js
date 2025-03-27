const Event = require('../models/Event');
const { uploadFileToS3, deleteFileFromS3 } = require('../utils/s3Uploader');

const addEvent = async (req, res) => {
  console.log("Requisição recebida em /api/events", {
    body: req.body,
    file: req.file ? "Arquivo recebido" : "Nenhum arquivo",
    user: req.user
  });

  const { nome, data, horario, categoria, localizacao, link, descricao } = req.body;
  const imagem = req.file;

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
      // Upload do arquivo para o S3
      photoUrl = await uploadFileToS3(
        imagem.buffer,
        imagem.originalname,
        imagem.mimetype
      );
      console.log('Imagem enviada para o S3:', photoUrl);
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
      // Upload da nova imagem para o S3
      photoUrl = await uploadFileToS3(
        imagem.buffer,
        imagem.originalname,
        imagem.mimetype
      );

      // Excluir a imagem antiga do S3 se existir
      if (existingEvent.photo_url) {
        await deleteFileFromS3(existingEvent.photo_url);
      }
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

    // Excluir a imagem do S3 se existir
    if (existingEvent.photo_url) {
      await deleteFileFromS3(existingEvent.photo_url);
    }

    // Excluir o evento
    await Event.deleteEventFromDatabase(id);
    res.status(200).json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ message: 'Erro ao remover evento', error: error.message });
  }
};

// Manter as outras funções sem alteração
const listAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

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