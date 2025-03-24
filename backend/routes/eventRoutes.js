const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer'); // Import multer

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rota para listar todos os eventos (acessível a todos os usuários)
router.get('/events', eventController.listAllEvents);

// Rota para adicionar um evento (somente admin)
router.post('/events', authenticate, isAdmin, upload.single('imagem'), eventController.addEvent);

// Rotas para obter eventos (acesso a todos os usuários autenticados)
router.get('/:id', eventController.getEventById);
router.put('/:id', authenticate, isAdmin, eventController.updateEvent);
router.delete('/:id', authenticate, isAdmin, eventController.deleteEvent);

module.exports = router;