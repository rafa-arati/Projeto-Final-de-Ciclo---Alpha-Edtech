const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const likeController = require('../controllers/likeController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas Públicas
router.get('/events', eventController.listEvents); // Mantido como listEvents da versão HEAD
router.get('/events/:id', eventController.getEventById);

// Rotas autenticadas
router.get('/my-events', authenticate, eventController.listMyEvents);

// Rotas do admin e premium
router.post('/events', authenticate, upload.single('imagem'), eventController.createEvent);
router.put('/events/:id', authenticate, upload.single('imagem'), eventController.updateEvent);
router.delete('/events/:id', authenticate, eventController.deleteEvent);

// Rota para curtir/descurtir um evento (requer autenticação)
router.post('/events/:eventId/like', authenticate, likeController.toggleLike);

module.exports = router;