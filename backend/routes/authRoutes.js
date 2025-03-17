const express = require('express');
const { register } = require('../controllers/authController');

const router = express.Router();

// Rota de cadastro de usuário
router.post('/register', register);

module.exports = router;