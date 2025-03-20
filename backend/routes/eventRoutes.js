const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Rota para listar todos os eventos (acessível a todos os usuários)
router.get('/events', eventController.listAllEvents);

// Rota para adicionar um evento (somente admin)
router.post('/events', authenticate, isAdmin, eventController.addEvent);

// Rota para editar um evento (somente admin)
router.put('/events/:id', authenticate, isAdmin, eventController.updateEvent);

// Rota para remover um evento (somente admin)
router.delete('/events/:id', authenticate, isAdmin, eventController.deleteEvent);

module.exports = router;