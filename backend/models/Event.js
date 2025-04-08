const pool = require('../config/db');

// Expressão regular para validar URLs de vídeo
const VIDEO_REGEX = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/,
  tiktok: /^(https?:\/\/)?(www\.|vm\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|embed\/v2\/\d+)/
};

// Função para validar URLs de vídeo
const validateVideoUrls = (urls) => {
  if (!urls) return true;
  return urls.every(url =>
    VIDEO_REGEX.youtube.test(url) ||
    VIDEO_REGEX.tiktok.test(url)
  );
};

// Obter todos os eventos com filtros opcionais
const getAllEvents = async (filters = {}) => {
  try {
    let query = `
      SELECT e.*, c.name as category_name, s.name as subcategory_name, 
             u.name as creator_name, u.username as creator_username
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
      LEFT JOIN users u ON e.creator_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    // Aplicar filtro de categoria
    if (filters.category_id) {
      paramCount++;
      query += ` AND e.category_id = $${paramCount}`;
      values.push(filters.category_id);
    }

    // Aplicar filtro de subcategoria
    if (filters.subcategory_id) {
      paramCount++;
      query += ` AND e.subcategory_id = $${paramCount}`;
      values.push(filters.subcategory_id);
    }

    // Aplicar filtro de data inicial
    if (filters.start_date) {
      paramCount++;
      query += ` AND e.event_date >= $${paramCount}`;
      values.push(filters.start_date);
    }

    // Aplicar filtro de data final
    if (filters.end_date) {
      paramCount++;
      query += ` AND e.event_date <= $${paramCount}`;
      values.push(filters.end_date);
    }

    // Busca por título ou descrição
    if (filters.search) {
      paramCount++;
      query += ` AND (e.event_name ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm);
    }

    // Filtrar por criador (para eventos de usuário premium)
    if (filters.creator_id) {
      paramCount++;
      query += ` AND e.creator_id = $${paramCount}`;
      values.push(filters.creator_id);
    }

    // Ordenar por data
    query += ` ORDER BY e.event_date ASC`;

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
};

// Obter evento por ID com informações de categoria e subcategoria
const getEventById = async (id) => {
  try {
    const query = `
      SELECT e.*, c.name as category_name, s.name as subcategory_name,
             u.name as creator_name, u.username as creator_username, u.role as creator_role
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
      LEFT JOIN users u ON e.creator_id = u.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao buscar evento por ID:", error);
    throw error;
  }
};

// Criar novo evento
const createEvent = async (eventData) => {
  const {
    title,
    description,
    start_date,
    start_time,
    end_date,
    end_time,
    location,
    category_id,
    subcategory_id,
    photo_url,
    event_link,
    creator_id,
    video_urls = [] // Adicionado suporte para URLs de vídeo
  } = eventData;

  try {
    // Adaptar para usar apenas os campos que existem na tabela
    const query = `
      INSERT INTO events (
        event_name, description, event_date, event_time, 
        location, category_id, subcategory_id, photo_url, event_link, creator_id, video_urls
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    // Tratar valores vazios ou nulos para IDs
    const parsedCategoryId = category_id === "" || category_id === undefined ? null : parseInt(category_id, 10);
    const parsedSubcategoryId = subcategory_id === "" || subcategory_id === undefined ? null : parseInt(subcategory_id, 10);

    // Validar URLs de vídeo
    if (video_urls.length > 0 && !validateVideoUrls(video_urls)) {
      throw new Error('URLs de vídeo inválidas. São aceitos apenas links do YouTube e TikTok.');
    }

    const values = [
      title || "",
      description || "",
      start_date || null,
      start_time || null,
      location || "",
      parsedCategoryId,
      parsedSubcategoryId,
      photo_url,
      event_link,
      creator_id,
      video_urls
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
};

// Atualizar evento
const updateEvent = async (id, eventData) => {
  const {
    title,
    description,
    start_date,
    start_time,
    end_date,
    end_time,
    location,
    category_id,
    subcategory_id,
    photo_url,
    event_link,
    video_urls = [] // Adicionado suporte para URLs de vídeo
  } = eventData;

  try {
    // Tratar valores vazios ou nulos para IDs
    const parsedCategoryId = category_id === "" || category_id === undefined ? null : parseInt(category_id, 10);
    const parsedSubcategoryId = subcategory_id === "" || subcategory_id === undefined ? null : parseInt(subcategory_id, 10);

    // Validar URLs de vídeo
    if (video_urls.length > 0 && !validateVideoUrls(video_urls)) {
      throw new Error('URLs de vídeo inválidas. São aceitos apenas links do YouTube e TikTok.');
    }

    const query = `
      UPDATE events
      SET event_name = $1, 
          description = $2,
          event_date = $3,
          event_time = $4,
          location = $5,
          category_id = $6,
          subcategory_id = $7,
          photo_url = $8,
          event_link = $9,
          video_urls = $10,
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      title || "",
      description || "",
      start_date || null,
      start_time || null,
      location || "",
      parsedCategoryId,
      parsedSubcategoryId,
      photo_url,
      event_link,
      video_urls,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    throw error;
  }
};

// Excluir evento
const deleteEvent = async (id) => {
  try {
    // Primeiro excluir os QR codes relacionados ao evento
    await pool.query('DELETE FROM event_qr_codes WHERE event_id = $1', [id]);

    // Depois excluir o evento
    const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    throw error;
  }
};

// Buscar eventos em destaque (mais curtidos)
const getHighlightedEvents = async () => {
  try {
    const query = `
      SELECT e.*, c.name as category_name, s.name as subcategory_name, 
             u.name as creator_name, u.username as creator_username,
             COUNT(el.id) as like_count
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
      LEFT JOIN users u ON e.creator_id = u.id
      LEFT JOIN event_likes el ON e.id = el.event_id
      WHERE e.event_date >= CURRENT_DATE
      GROUP BY e.id, c.name, s.name, u.name, u.username
      ORDER BY like_count DESC, e.event_date ASC
      LIMIT 10
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar eventos em destaque:", error);
    throw error;
  }
};

// Buscar eventos personalizados para o usuário (baseado nas preferências e curtidas)
const getPersonalizedEvents = async (userId) => {
  try {
    const query = `
      SELECT e.*, c.name as category_name, s.name as subcategory_name, 
             u.name as creator_name, u.username as creator_username
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
      LEFT JOIN users u ON e.creator_id = u.id
      WHERE e.event_date >= CURRENT_DATE
      AND (
        -- Eventos em categorias que o usuário prefere
        e.category_id IN (
          SELECT category_id FROM user_preferences
          WHERE user_id = $1
        )
        OR
        -- Eventos em subcategorias que o usuário prefere
        e.subcategory_id IN (
          SELECT subcategory_id FROM user_preferences
          WHERE user_id = $1
        )
        OR
        -- Categorias/subcategorias de eventos que o usuário curtiu
        e.category_id IN (
          SELECT e2.category_id
          FROM events e2
          JOIN event_likes el ON e2.id = el.event_id
          WHERE el.user_id = $1
        )
        OR
        e.subcategory_id IN (
          SELECT e2.subcategory_id
          FROM events e2
          JOIN event_likes el ON e2.id = el.event_id
          WHERE el.user_id = $1
        )
      )
      ORDER BY e.event_date ASC
      LIMIT 10
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar eventos personalizados:", error);
    throw error;
  }
};

// Buscar eventos que acontecem hoje
const getTodayEvents = async () => {
  try {
    const query = `
      SELECT e.*, c.name as category_name, s.name as subcategory_name, 
             u.name as creator_name, u.username as creator_username
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
      LEFT JOIN users u ON e.creator_id = u.id
      WHERE e.event_date = CURRENT_DATE
      ORDER BY e.event_time ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar eventos de hoje:", error);
    throw error;
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  validateVideoUrls,
  getHighlightedEvents,   // Nova função
  getPersonalizedEvents,  // Nova função
  getTodayEvents          // Nova função
};