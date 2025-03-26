const express = require('express');
const router = express.Router();
const path = require('path'); // Adicione esta linha
const eventController = require('../controllers/eventController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configuração do Multer para salvar em disco
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Rotas (mantenha o restante igual)
router.get('/events', eventController.listAllEvents);
router.post('/events', authenticate, isAdmin, upload.single('imagem'), eventController.addEvent);
router.get('/events/:id', eventController.getEventById);
router.put('/events/:id', authenticate, isAdmin, upload.single('imagem'), eventController.updateEvent);
router.delete('/events/:id', authenticate, isAdmin, eventController.deleteEvent);

module.exports = router;