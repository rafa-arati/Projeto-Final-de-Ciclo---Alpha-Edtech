const Event = require('../models/Event');
const { uploadFileToS3, deleteFileFromS3 } = require('../utils/s3Uploader');

// Listar todos os eventos com filtros
const listEvents = async (req, res) => {
  try {
    const {
      category_id,
      subcategory_id,
      start_date,
      end_date,
      search
    } = req.query;

    // Construir objeto de filtros
    const filters = {};
    if (category_id) filters.category_id = category_id;
    if (subcategory_id) filters.subcategory_id = subcategory_id;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (search) filters.search = search;

    console.log('Filtros aplicados:', filters);

    const events = await Event.getAllEvents(filters);
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

// Obter evento por ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.getEventById(id);

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Erro ao buscar evento por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
  }
};

// Criar novo evento
const createEvent = async (req, res) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem criar eventos' });
    }

    const { nome, data, horario, categoria, localizacao, link, descricao, category_id, subcategory_id } = req.body;
    const imagem = req.file;

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

    const eventData = {
      title: req.body.title || nome,
      description: req.body.description || descricao,
      start_date: req.body.start_date || data,
      start_time: req.body.start_time || horario,
      end_date: req.body.end_date,
      end_time: req.body.end_time,
      location: req.body.location || localizacao,
      event_link: req.body.event_link || link,
      category_id: category_id,
      subcategory_id: subcategory_id,
      photo_url: photoUrl
    };

    // Validar campos obrigatórios
    if (!eventData.title || !eventData.start_date) {
      return res.status(400).json({ message: 'Título e data são obrigatórios' });
    }

    console.log("Tentando criar evento com:", eventData);
    const newEvent = await Event.createEvent(eventData);
    console.log("Evento criado com sucesso:", newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
  }
};

// Atualizar evento
const updateEvent = async (req, res) => {
  const { id } = req.params;
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

    const { nome, data, horario, categoria, localizacao, link, descricao, category_id, subcategory_id } = req.body;
    const imagem = req.file;

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

    const eventData = {
      title: req.body.title || nome,
      description: req.body.description || descricao,
      start_date: req.body.start_date || data,
      start_time: req.body.start_time || horario,
      end_date: req.body.end_date,
      end_time: req.body.end_time,
      location: req.body.location || localizacao,
      event_link: req.body.event_link || link,
      category_id: category_id,
      subcategory_id: subcategory_id,
      photo_url: photoUrl
    };

    const updatedEvent = await Event.updateEvent(id, eventData);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
  }
};

// Excluir evento
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

    await Event.deleteEvent(id);
    res.status(200).json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ message: 'Erro ao remover evento', error: error.message });
  }
};

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};