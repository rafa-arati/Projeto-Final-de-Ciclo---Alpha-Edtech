const pool = require('../config/db');

// Função para criar um evento
const createEvent = async (
  eventName, 
  eventDate, 
  eventTime, 
  category, 
  location, 
  eventLink, 
  description, 
  photoUrl,
  videoUrls = []  // Adicionar parâmetro de vídeos
) => {
  try {
    const result = await pool.query(
      `INSERT INTO events (
        event_name, 
        event_date, 
        event_time, 
        category, 
        location, 
        event_link, 
        description, 
        photo_url,
        video_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        eventName, 
        eventDate, 
        eventTime, 
        category, 
        location, 
        eventLink, 
        description, 
        photoUrl,
        videoUrls
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Função para atualizar um evento
const updateEventInDatabase = async (id, eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl, videoUrls) => {
  try {
    const result = await pool.query(
      `UPDATE events SET 
        event_name = $1, 
        event_date = $2,
        event_time = $3,
        category = $4,
        location = $5,
        event_link = $6,
        description = $7,
        photo_url = $8,
        video_urls = $9
      WHERE id = $10 RETURNING *`,
      [eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl, videoUrls, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Função para remover um evento
const deleteEventFromDatabase = async (id) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao deletar evento no banco:", error);
    throw error;
  }
};

// Função para obter todos os eventos
const getAllEvents = async () => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_date, event_time');
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar todos os eventos:", error);
    throw error;
  }
};

// Função para obter um evento por ID
const getEventById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao buscar evento por ID:", error);
    throw error;
  }
};

const VIDEO_REGEX = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/,
  tiktok: /^(https?:\/\/)?(www\.|vm\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|embed\/v2\/\d+)/
};

const validateVideoUrls = (urls) => {
  if (!urls) return true;
  return urls.every(url => 
    VIDEO_REGEX.youtube.test(url) || 
    VIDEO_REGEX.tiktok.test(url)
  );
};

module.exports = {
  createEvent,
  updateEventInDatabase,
  deleteEventFromDatabase,
  getAllEvents,
  getEventById
};