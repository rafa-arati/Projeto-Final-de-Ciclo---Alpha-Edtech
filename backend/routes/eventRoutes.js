const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas Publicas
router.get('/events', eventController.listEvents);
router.get('/events/:id', eventController.getEventById);

// Rotas autenticadas
router.get('/my-events', authenticate, eventController.listMyEvents);

// Rotas do admin e premium
router.post('/events', authenticate, upload.single('imagem'), eventController.createEvent);
router.put('/events/:id', authenticate, upload.single('imagem'), eventController.updateEvent);
router.delete('/events/:id', authenticate, eventController.deleteEvent);

module.exports = router;