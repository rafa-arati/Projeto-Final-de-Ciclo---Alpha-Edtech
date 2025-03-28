// backend/models/Event.js
const pool = require('../config/db');

// Obter todos os eventos com filtros opcionais
const getAllEvents = async (filters = {}) => {
  try {
    let query = `
      SELECT e.*, c.name as category_name, s.name as subcategory_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
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
      query += ` AND e.event_date >= $${paramCount}`; // Usando event_date em vez de start_date
      values.push(filters.start_date);
    }

    // Aplicar filtro de data final
    if (filters.end_date) {
      paramCount++;
      query += ` AND e.event_date <= $${paramCount}`; // Usando event_date em vez de start_date
      values.push(filters.end_date);
    }

    // Busca por título ou descrição
    if (filters.search) {
      paramCount++;
      query += ` AND (e.event_name ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`; // Usando event_name em vez de title
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm);
    }

    // Ordenar por data
    query += ` ORDER BY e.event_date ASC`; // Usando event_date em vez de start_date

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
      SELECT e.*, c.name as category_name, s.name as subcategory_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN subcategories s ON e.subcategory_id = s.id
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
    event_link
  } = eventData;

  try {
    // Adaptar para usar apenas os campos que existem na tabela
    const query = `
      INSERT INTO events (
        event_name, description, event_date, event_time, 
        location, category_id, subcategory_id, photo_url, event_link
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    // Tratar valores vazios ou nulos para IDs
    const parsedCategoryId = category_id === "" || category_id === undefined ? null : parseInt(category_id, 10);
    const parsedSubcategoryId = subcategory_id === "" || subcategory_id === undefined ? null : parseInt(subcategory_id, 10);

    const values = [
      title || "",
      description || "",
      start_date || null,
      start_time || null,
      location || "",
      parsedCategoryId,
      parsedSubcategoryId,
      photo_url,
      event_link
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
};

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
    event_link
  } = eventData;

  try {
    // Tratar valores vazios ou nulos para IDs
    const parsedCategoryId = category_id === "" || category_id === undefined ? null : parseInt(category_id, 10);
    const parsedSubcategoryId = subcategory_id === "" || subcategory_id === undefined ? null : parseInt(subcategory_id, 10);

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
          event_link = $9
      WHERE id = $10
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
    const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    throw error;
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};