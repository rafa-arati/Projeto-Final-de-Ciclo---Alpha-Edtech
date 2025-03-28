const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public routes
router.get('/events', eventController.listEvents);
router.get('/events/:id', eventController.getEventById);

// Admin-only routes
router.post('/events', authenticate, isAdmin, upload.single('imagem'), eventController.createEvent);
router.put('/events/:id', authenticate, isAdmin, upload.single('imagem'), eventController.updateEvent);
router.delete('/events/:id', authenticate, isAdmin, eventController.deleteEvent);

module.exports = router;