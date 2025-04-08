const Like = require('../models/Likes');
const Event = require('../models/Event');
const { uploadFileToS3, deleteFileFromS3 } = require('../utils/s3Uploader');

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

// Listar todos os eventos com filtros
const listEvents = async (req, res) => {
  try {
    const {
      category_id,
      subcategory_id,
      start_date,
      end_date,
      search,
      creator_id
    } = req.query;

    // Construir objeto de filtros
    const filters = {};
    if (category_id) filters.category_id = category_id;
    if (subcategory_id) filters.subcategory_id = subcategory_id;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (search) filters.search = search;
    if (creator_id) filters.creator_id = creator_id;

    console.log('Filtros aplicados:', filters);

    const events = await Event.getAllEvents(filters);
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

// Listar eventos criados pelo usuário atual
const listMyEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // O usuário admin pode ver todos os eventos, usuários premium apenas os seus
    const filters = {};
    if (req.user.role === 'premium') {
      filters.creator_id = req.user.id;
    }

    const events = await Event.getAllEvents(filters);
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao listar eventos do usuário:', error);
    res.status(500).json({ message: 'Erro ao listar eventos', error: error.message });
  }
};

// Listar todos os eventos sem filtros (para compatibilidade)
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

// Obter evento por ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.getEventById(id);

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    const likeCount = await Like.getLikeCount(id);
    let userHasLiked = null;
    // Verifica se há usuário autenticado NAQUELA REQUISIÇÃO ESPECÍFICA
    console.log(`[getEventById] Verificando req.user para evento ${id}:`, req.user ? `ID ${req.user.id}` : 'Nenhum req.user');
    if (req.user) {
      userHasLiked = await Like.checkUserLike(req.user.id, id);
      console.log(`[getEventById] Status do like para usuário ${req.user.id}: ${userHasLiked}`);
    }

    const eventDetails = {
      ...event,
      likeCount: likeCount,
      userHasLiked: userHasLiked // null se não logado, true/false se logado
    };

    console.log(`[getEventById] Enviando detalhes:`, JSON.stringify(eventDetails, null, 2));
    res.status(200).json(eventDetails);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({
      message: 'Erro ao buscar evento',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Adicionar evento (versão compatível com a implementação anterior)
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

// Criar novo evento (versão nova com S3)
const createEvent = async (req, res) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário tem permissão (admin ou premium)
    if (req.user.role !== 'admin' && req.user.role !== 'premium') {
      return res.status(403).json({
        message: 'Apenas administradores e usuários premium podem criar eventos'
      });
    }

    const { nome, data, horario, categoria, localizacao, link, descricao, category_id, subcategory_id } = req.body;
    const imagem = req.file;

    // Processar URLs de vídeo (integrado da outra versão)
    const rawUrls = Array.isArray(req.body.video_urls)
      ? req.body.video_urls
      : JSON.parse(req.body.video_urls || '[]');

    const sanitizedUrls = sanitizeVideoUrls(rawUrls);

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
      photo_url: photoUrl,
      creator_id: req.user.id, // Registramos o criador do evento
      video_urls: sanitizedUrls // Adicionado suporte para vídeos
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

// Atualizar evento (versão avançada com S3)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o evento existe
    const existingEvent = await Event.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Verificar permissões:
    // - Admin pode editar qualquer evento
    // - Premium pode editar apenas seus próprios eventos
    if (req.user.role !== 'admin' &&
      (req.user.role !== 'premium' || String(existingEvent.creator_id) !== String(req.user.id))) {
      return res.status(403).json({
        message: 'Você não tem permissão para modificar este evento'
      });
    }

    // Log para depuração
    console.log("Dados recebidos para atualização:", req.body);
    console.log("Arquivo recebido:", req.file);

    // Construir dados do evento para atualização
    const eventData = {
      title: req.body.title || req.body.nome || existingEvent.event_name,
      description: req.body.description || req.body.descricao || existingEvent.description,
      start_date: req.body.start_date || req.body.data || existingEvent.event_date,
      start_time: req.body.start_time || req.body.horario || existingEvent.event_time,
      location: req.body.location || req.body.localizacao || existingEvent.location,
      category_id: req.body.category_id || existingEvent.category_id,
      subcategory_id: req.body.subcategory_id || existingEvent.subcategory_id,
      event_link: req.body.event_link || req.body.link || existingEvent.event_link,
      photo_url: existingEvent.photo_url // Valor padrão
    };

    // Processar URLs de vídeo se presentes
    if (req.body.video_urls) {
      const rawUrls = Array.isArray(req.body.video_urls)
        ? req.body.video_urls
        : JSON.parse(req.body.video_urls || '[]');

      eventData.video_urls = rawUrls;
    }

    // Processa imagem se enviada
    if (req.file) {
      // Se usar o S3
      if (typeof uploadFileToS3 === 'function') {
        eventData.photo_url = await uploadFileToS3(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
      } else {
        // Método alternativo
        eventData.photo_url = `/uploads/${req.file.originalname}`;
      }

      // Excluir imagem antiga se existir
      if (existingEvent.photo_url && typeof deleteFileFromS3 === 'function') {
        try {
          await deleteFileFromS3(existingEvent.photo_url);
        } catch (err) {
          console.warn("Erro ao excluir imagem antiga:", err);
        }
      }
    }

    // Atualizar o evento no banco de dados
    const updatedEvent = await Event.updateEvent(id, eventData);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
  }
};

// Atualizar evento (versão anterior para compatibilidade)
const updateEventLegacy = async (req, res) => {
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

// Excluir evento
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o evento existe
    const existingEvent = await Event.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Verificar permissões:
    // - Admin pode excluir qualquer evento
    // - Premium pode excluir apenas seus próprios eventos
    if (req.user.role !== 'admin' &&
      (req.user.role !== 'premium' || String(existingEvent.creator_id) !== String(req.user.id))) {
      return res.status(403).json({
        message: 'Você não tem permissão para excluir este evento'
      });
    }

    // Excluir a imagem do S3 se existir
    if (existingEvent.photo_url && typeof deleteFileFromS3 === 'function') {
      try {
        await deleteFileFromS3(existingEvent.photo_url);
      } catch (err) {
        console.warn("Erro ao excluir imagem:", err);
      }
    }

    // Excluir o evento
    await Event.deleteEvent(id);

    // Responder com sucesso
    res.status(200).json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ message: 'Erro ao remover evento', error: error.message });
  }
};

// Excluir evento (versão antiga para compatibilidade)
const deleteEventLegacy = async (req, res) => {
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



// Buscar eventos em destaque (mais curtidos)
const getHighlightedEvents = async (req, res) => {
  try {
    const events = await Event.getHighlightedEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos em destaque:', error);
    res.status(500).json({
      message: 'Erro ao buscar eventos em destaque',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Buscar eventos personalizados para o usuário
const getPersonalizedEvents = async (req, res) => {
  try {
    // Verificar se há um usuário logado
    if (!req.user) {
      return res.status(200).json([]); // Retorna array vazio se não houver usuário
    }

    const userId = req.user.id;
    const events = await Event.getPersonalizedEvents(userId);
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos personalizados:', error);
    res.status(500).json({
      message: 'Erro ao buscar eventos personalizados',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Buscar eventos que acontecem hoje
const getTodayEvents = async (req, res) => {
  try {
    const events = await Event.getTodayEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos de hoje:', error);
    res.status(500).json({
      message: 'Erro ao buscar eventos de hoje',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  listEvents,
  listMyEvents,
  listAllEvents,
  getEventById,
  createEvent,
  addEvent,           // Versão antiga para compatibilidade
  updateEvent,
  updateEventLegacy,  // Versão antiga para compatibilidade
  deleteEvent,
  deleteEventLegacy,   // Versão antiga para compatibilidade
  getHighlightedEvents,
  getPersonalizedEvents,
  getTodayEvents
};