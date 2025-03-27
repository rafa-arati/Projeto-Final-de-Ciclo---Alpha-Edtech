const express = require('express');
const { requestPasswordReset, validateResetToken, resetPassword } = require('../controllers/passwordController');
const { resetPasswordLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Rota para solicitar recuperação de senha (com limitador)
router.post('/request-password-reset', resetPasswordLimiter, requestPasswordReset);

// Rota para validar o token
router.get('/validate-reset-token/:token', validateResetToken);

// Rota para redefinir a senha
router.post('/reset-password', resetPassword);

module.exports = router;