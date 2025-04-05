const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const { authenticate } = require('../middleware/authMiddleware');

// Criar uma promoção (admin e premium apenas)
router.post('/promotion', authenticate, qrCodeController.createPromotion);

// Listar promoções disponíveis para um evento
router.get('/promotions/:eventId', qrCodeController.getEventPromotions);

// Gerar QR Code personalizado para o usuário
router.post('/generate/:promotionId', authenticate, qrCodeController.generateUserQRCode);

// Listar QR Codes gerados pelo usuário
router.get('/my-qrcodes', authenticate, qrCodeController.getUserQRCodes);

// Validar QR Code (público - apenas verifica se é válido)
router.get('/validate/:qrCodeValue', qrCodeController.validateQRCode);

// Usar um QR Code (usuário autenticado com permissão)
router.post('/use/:qrCodeValue', authenticate, qrCodeController.useQRCode);

// Excluir uma promoção (admin e criador)
router.delete('/:qrCodeId', authenticate, qrCodeController.deleteQRCode);

// // Manter retrocompatibilidade com API antiga
// router.post('/', authenticate, qrCodeController.createPromotion);
// router.get('/event/:eventId', authenticate, qrCodeController.getEventQRCodes);

module.exports = router;