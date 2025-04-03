const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const { authenticate } = require('../middleware/authMiddleware');

// Criar um novo QR Code (admin e premium apenas)
router.post('/', authenticate, qrCodeController.createQRCode);

// Listar QR Codes de um evento (admin e premium que criou o evento)
router.get('/event/:eventId', authenticate, qrCodeController.getEventQRCodes);

// Validar QR Code (público - apenas verifica se é válido)
router.get('/validate/:qrCodeValue', qrCodeController.validateQRCode);

// Usar um QR Code (usuário autenticado)
router.post('/use/:qrCodeValue', authenticate, qrCodeController.useQRCode);

// Excluir um QR Code (admin e criador)
router.delete('/:qrCodeId', authenticate, qrCodeController.deleteQRCode);

module.exports = router;