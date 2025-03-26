import { showMessage } from './utils.js';

const API_URL = '/api/events';

export async function fetchEvents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao buscar eventos');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    showMessage('Não foi possível carregar os eventos');
    throw error;
  }
}

export async function deleteEvent(eventId) {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao excluir evento');
    }

    return await response.json(); // Retorna os dados da resposta se necessário
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    throw error; // Lança o erro para ser tratado no componente
  }
}

export async function createEvent(eventData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Erro ao criar evento');
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    showMessage('Erro ao criar evento');
    throw error;
  }
}

export async function updateEvent(eventId, eventData) {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Erro ao atualizar evento');
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    showMessage('Erro ao atualizar evento');
    throw error;
  }
}

export async function getEventById(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Erro ao buscar evento');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    throw error;
  }
}

export async function saveEvent(formData, eventId = null) {
  try {
    const url = eventId ? `/api/events/${eventId}` : '/api/events';
    const method = eventId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao salvar evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    throw error;
  }
}