const express = require('express');
const { register, login, logout } = require('../controllers/authController');

const router = express.Router();

// Rota de cadastro de usuário
router.post('/register', register);

// Rota de login e logout de usuário
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;