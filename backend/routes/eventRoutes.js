const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController'); // Verifique este caminho
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas
router.get('/events', eventController.listAllEvents); // Exemplo de rota GET
router.post('/events', authenticate, isAdmin, upload.single('imagem'), eventController.addEvent);

// Certifique-se de que todas as rotas tenham controladores válidos
router.get('/events/:id', eventController.getEventById);
router.put('/events/:id', authenticate, isAdmin, upload.single('imagem'), eventController.updateEvent);
router.delete('/events/:id', authenticate, isAdmin, eventController.deleteEvent);

module.exports = router;