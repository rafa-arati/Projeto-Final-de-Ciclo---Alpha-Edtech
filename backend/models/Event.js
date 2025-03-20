const pool = require('../config/db');

// Função para criar um evento
const createEvent = async (eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl) => {
  const result = await pool.query(
    'INSERT INTO events (event_name, event_date, event_time, category, location, event_link, description, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl]
  );
  return result.rows[0];
};

// Função para atualizar um evento
const updateEventInDatabase = async (id, eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl) => {
  const result = await pool.query(
    'UPDATE events SET event_name = $1, event_date = $2, event_time = $3, category = $4, location = $5, event_link = $6, description = $7, photo_url = $8 WHERE id = $9 RETURNING *',
    [eventName, eventDate, eventTime, category, location, eventLink, description, photoUrl, id]
  );
  return result.rows[0];
};

// Função para remover um evento
const deleteEventFromDatabase = async (id) => {
  const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

const getAllEvents = async () => {
  const result = await pool.query('SELECT * FROM events ORDER BY event_date, event_time');
  return result.rows;
};

module.exports = { createEvent, updateEventInDatabase, deleteEventFromDatabase, getAllEvents };