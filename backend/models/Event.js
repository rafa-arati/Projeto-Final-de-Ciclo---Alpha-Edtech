const pool = require('../config/db');

// Função para criar um evento
const createEvent = async (eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl) => {
  console.log("Executando createEvent com parâmetros:", {
    eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl
  });

  try {
    const result = await pool.query(
      'INSERT INTO events (event_name, event_date, event_time, category, location, event_link, description, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl]
    );
    console.log("Resultado da inserção:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao inserir evento no banco:", error);
    throw error;
  }
};

// Função para atualizar um evento
const updateEventInDatabase = async (id, eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl) => {
  try {
    const result = await pool.query(
      'UPDATE events SET event_name = $1, event_date = $2, event_time = $3, category = $4, location = $5, event_link = $6, description = $7, photo_url = $8 WHERE id = $9 RETURNING *',
      [eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao atualizar evento no banco:", error);
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

module.exports = {
  createEvent,
  updateEventInDatabase,
  deleteEventFromDatabase,
  getAllEvents,
  getEventById
};