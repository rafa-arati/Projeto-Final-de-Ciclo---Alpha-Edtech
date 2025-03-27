const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { updateProfile } = require('../controllers/profileController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Rota de cadastro de usuário
router.post('/register', register);

// Rota de login e logout de usuário
router.post('/login', login);
router.post('/logout', logout);
router.put('/profile', authenticate, updateProfile);

module.exports = router;