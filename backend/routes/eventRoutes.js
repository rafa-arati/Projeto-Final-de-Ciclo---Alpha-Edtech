const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const likeController = require('../controllers/likeController');
// --- Certifique-se de importar o authenticate ---
const { authenticate, isAdmin } = require('../middleware/authMiddleware'); 
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Rotas Públicas --- 
// (Estas rotas NÃO precisam do authenticate, qualquer um pode ver)
router.get('/events', eventController.listEvents); 
router.get('/highlighted-events', eventController.getHighlightedEvents);
router.get('/today-events', eventController.getTodayEvents);
router.get('/events/:id', authenticate, eventController.getEventById); 

// --- Rotas que JÁ REQUEREM autenticação ---
router.get('/my-events', authenticate, eventController.listMyEvents);
router.get('/personalized-events', authenticate, eventController.getPersonalizedEvents);
router.post('/events/:eventId/like', authenticate, likeController.toggleLike);

// Rotas de Admin/Premium (já tinham authenticate)
router.post('/events', authenticate, upload.single('imagem'), eventController.createEvent);
router.put('/events/:id', authenticate, upload.single('imagem'), eventController.updateEvent);
router.delete('/events/:id', authenticate, eventController.deleteEvent);

module.exports = router;