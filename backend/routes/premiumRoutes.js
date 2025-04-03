const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { authenticate } = require('../middleware/authMiddleware');

// Rota para upgrade para conta premium
router.post('/upgrade', authenticate, premiumController.upgradeToPremium);

// Rota para verificar status da assinatura premium
router.get('/status', authenticate, premiumController.checkPremiumStatus);

// Rota para cancelar assinatura premium
router.post('/cancel', authenticate, premiumController.cancelPremium);

module.exports = router;