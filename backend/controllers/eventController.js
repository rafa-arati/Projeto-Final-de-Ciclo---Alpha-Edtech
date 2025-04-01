const Event = require('../models/Event');

const sanitizeVideoUrls = (urls) => {
  const allowedDomains = [
    'youtube.com',
    'youtu.be',
    'tiktok.com',
    'vm.tiktok.com'
  ];

  return urls.filter(url => {
    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
    } catch {
      return false;
    }
  }).slice(0, 3); // Limita a 3 URLs
};

const addEvent = async (req, res) => {
  console.log("Requisição recebida em /api/events", {
    body: req.body,
    file: req.file ? "Arquivo recebido" : "Nenhum arquivo",
    user: req.user
  });

  const { nome, data, horario, categoria, localizacao, link, descricao } = req.body;
  const imagem = req.file;

  try {
    // Validação de usuário
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    // Processar URLs de vídeo
    const rawUrls = Array.isArray(req.body.video_urls) 
      ? req.body.video_urls 
      : JSON.parse(req.body.video_urls || '[]');
      
    const sanitizedUrls = sanitizeVideoUrls(rawUrls);

    if (rawUrls.length !== sanitizedUrls.length) {
      return res.status(400).json({ message: 'Contém links inválidos ou não permitidos' });
    }

    // Processar imagem
    let photoUrl = null;
    if (imagem) {
      photoUrl = `/uploads/${imagem.originalname}`;
      console.log('Arquivo de imagem processado:', imagem.originalname);
    }

    // Validar campos obrigatórios
    if (!nome || !data) {
      return res.status(400).json({ message: 'Nome e data são obrigatórios' });
    }

    // Criar evento
    const newEvent = await Event.createEvent(
      nome, 
      data, 
      horario, 
      categoria, 
      localizacao, 
      link, 
      descricao, 
      photoUrl,
      sanitizedUrls
    );

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Erro ao adicionar evento:', error);
    res.status(500).json({ 
      message: 'Erro ao adicionar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { nome, data, horario, categoria, localizacao, link, descricao } = req.body;
  const imagem = req.file;

  try {
    // Validação de usuário
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    // Verificar existência do evento
    const existingEvent = await Event.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Processar URLs de vídeo
    const rawUrls = Array.isArray(req.body.video_urls)
      ? req.body.video_urls
      : JSON.parse(req.body.video_urls || '[]');
      
    const sanitizedUrls = sanitizeVideoUrls(rawUrls);

    // Processar imagem
    let photoUrl = existingEvent.photo_url;
    if (imagem) {
      photoUrl = `/uploads/${imagem.originalname}`;
    }

    // Atualizar evento
    const updatedEvent = await Event.updateEventInDatabase(
      id,
      nome,
      data,
      horario,
      categoria,
      localizacao,
      link,
      descricao,
      photoUrl,
      sanitizedUrls // Adicionado parâmetro de vídeos
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // Validação de usuário
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    // Verificar existência do evento
    const existingEvent = await Event.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Excluir evento
    await Event.deleteEventFromDatabase(id);
    res.status(200).json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ 
      message: 'Erro ao remover evento',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const listAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ 
      message: 'Erro ao listar eventos',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.getEventById(id);
    event ? res.status(200).json(event) : res.status(404).json({ message: 'Evento não encontrado' });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  addEvent,
  updateEvent,
  deleteEvent,
  listAllEvents,
  getEventById
};