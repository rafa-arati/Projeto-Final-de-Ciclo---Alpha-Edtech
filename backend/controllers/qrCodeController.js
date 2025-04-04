const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const QRCode = require('../models/QRCode');
const Event = require('../models/Event');

// Criar um novo QR Code para evento
const createPromotion = async (req, res) => {
  try {
    const {
      eventId,
      description,
      discountPercentage,
      benefitType,
      benefitDescription,
      maxCodes,
      generationDeadline,
      usageDeadline
    } = req.body;

    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário é admin ou premium
    if (req.user.role !== 'admin' && req.user.role !== 'premium') {
      return res.status(403).json({
        message: 'Apenas administradores e usuários premium podem criar promoções'
      });
    }

    // Verificar se o evento existe
    const event = await Event.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Se for usuário premium, verificar se o evento é dele
    if (req.user.role === 'premium' && event.creator_id !== req.user.id) {
      return res.status(403).json({
        message: 'Você só pode criar promoções para seus próprios eventos'
      });
    }

    // Criar a promoção
    const newPromotion = await QRCode.createPromotion({
      eventId,
      creatorId: req.user.id,
      description,
      discountPercentage,
      benefitType,
      benefitDescription,
      maxCodes: maxCodes || null,
      generationDeadline: generationDeadline ? new Date(generationDeadline) : null,
      usageDeadline: usageDeadline ? new Date(usageDeadline) : null
    });

    res.status(201).json({
      message: 'Promoção criada com sucesso',
      promotion: newPromotion
    });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    res.status(500).json({ message: 'Erro ao criar promoção', error: error.message });
  }
};

// Listar promoções disponíveis para um evento
const getEventPromotions = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verificar se o evento existe
    const event = await Event.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    const promotions = await QRCode.getAvailablePromotions(eventId);

    res.status(200).json(promotions);
  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    res.status(500).json({ message: 'Erro ao listar promoções', error: error.message });
  }
};

// Gerar QR Code personalizado para o usuário atual
const generateUserQRCode = async (req, res) => {
  try {
    const { promotionId } = req.params;

    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o usuário já gerou um código para esta promoção
    const hasGenerated = await QRCode.hasUserGeneratedCode(promotionId, req.user.id);
    if (hasGenerated) {
      return res.status(400).json({
        message: 'Você já gerou um QR Code para esta promoção'
      });
    }

    // Gerar o QR Code personalizado
    const userQRCode = await QRCode.generateUserQRCode(promotionId, req.user.id);

    res.status(201).json({
      message: 'QR Code gerado com sucesso',
      qrCode: userQRCode
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ message: 'Erro ao gerar QR Code', error: error.message });
  }
};

// Listar QR Codes gerados pelo usuário
const getUserQRCodes = async (req, res) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userQRCodes = await QRCode.getUserGeneratedQRCodes(req.user.id);

    res.status(200).json(userQRCodes);
  } catch (error) {
    console.error('Erro ao listar QR Codes do usuário:', error);
    res.status(500).json({ message: 'Erro ao listar QR Codes', error: error.message });
  }
};

// Validar QR Code (modificado)
const validateQRCode = async (req, res) => {
  try {
    const { qrCodeValue } = req.params;

    // Verificar se o código existe
    const qrCode = await QRCode.getQRCodeByValue(qrCodeValue);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code não encontrado' });
    }

    // Verificar se o QR Code é de um usuário (não a promoção principal)
    if (qrCode.qr_code_value === qrCode.promotion_id) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    // Verificar se o QR Code está expirado
    if (qrCode.usage_deadline && new Date(qrCode.usage_deadline) < new Date()) {
      return res.status(400).json({ message: 'QR Code expirado' });
    }

    // Verificar se o QR Code já foi usado
    if (qrCode.status === 'usado') {
      return res.status(400).json({ message: 'QR Code já utilizado' });
    }

    // Obter informações do evento
    const event = await Event.getEventById(qrCode.event_id);

    // Obter informações do usuário que gerou o código
    const userQuery = `SELECT id, name, birth_date FROM users WHERE id = $1`;
    const { rows: userRows } = await pool.query(userQuery, [qrCode.generator_user_id]);
    const userData = userRows[0];

    // Retornar dados de benefício e usuário para verificação
    res.status(200).json({
      isValid: true,
      eventName: event.event_name,
      eventDate: event.event_date,
      benefit: {
        type: qrCode.benefit_type,
        description: qrCode.benefit_description,
        discountPercentage: qrCode.discount_percentage
      },
      user: {
        id: userData.id,
        name: userData.name,
        birthDate: userData.birth_date
      }
    });
  } catch (error) {
    console.error('Erro ao validar QR Code:', error);
    res.status(500).json({ message: 'Erro ao validar QR Code', error: error.message });
  }
};

// Marcar QR Code como utilizado (modificado)
const useQRCode = async (req, res) => {
  try {
    const { qrCodeValue } = req.params;

    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verificar se o QR Code existe e é válido
    const qrCode = await QRCode.getQRCodeByValue(qrCodeValue);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code não encontrado' });
    }

    if (qrCode.status === 'usado') {
      return res.status(400).json({ message: 'QR Code já foi utilizado' });
    }

    if (qrCode.usage_deadline && new Date(qrCode.usage_deadline) < new Date()) {
      return res.status(400).json({ message: 'QR Code expirado' });
    }

    // Verificar se o usuário tem permissão (admin, premium dono do evento, ou staff)
    const event = await Event.getEventById(qrCode.event_id);
    const hasPermission =
      req.user.role === 'admin' ||
      (req.user.role === 'premium' && event.creator_id === req.user.id);

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Você não tem permissão para validar este QR Code'
      });
    }

    // Marcar como utilizado
    const query = `
            UPDATE event_qr_codes
            SET status = 'usado', 
                used_at = NOW(),
                used_by = $1,
                is_used = TRUE
            WHERE qr_code_value = $2 AND status = 'gerado'
            RETURNING *
        `;

    const { rows } = await pool.query(query, [req.user.id, qrCodeValue]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Não foi possível marcar o QR Code como utilizado' });
    }

    res.status(200).json({
      message: 'QR Code utilizado com sucesso',
      qrCode: rows[0]
    });
  } catch (error) {
    console.error('Erro ao utilizar QR Code:', error);
    res.status(500).json({ message: 'Erro ao utilizar QR Code', error: error.message });
  }
};
// Excluir QR Code
const deleteQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Obter o QR Code
    const qrCode = await QRCode.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code não encontrado' });
    }

    // Verificar se é o criador do QR Code ou um admin
    if (req.user.role !== 'admin' && qrCode.creator_id !== req.user.id) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este QR Code' });
    }

    // Excluir o QR Code
    await QRCode.deleteQRCode(qrCodeId);

    res.status(200).json({ message: 'QR Code excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir QR Code:', error);
    res.status(500).json({ message: 'Erro ao excluir QR Code', error: error.message });
  }
};

module.exports = {
  createQRCode,
  getEventQRCodes,
  validateQRCode,
  createPromotion,
  deleteQRCode
};