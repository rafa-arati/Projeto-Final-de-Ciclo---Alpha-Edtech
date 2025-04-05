const pool = require('../config/db');
const Event = require('../models/Event');

class QRCodeValidator {
  // Verificar se um usuário tem permissão para criar/gerenciar promoções
  static async canManagePromotions(user, eventId) {
    if (!user) return false;

    if (user.role === 'admin') return true;

    if (user.role === 'premium') {
      const event = await Event.getEventById(eventId);
      return event && event.creator_id === user.id;
    }

    return false;
  }

  // Verificar se uma promoção está disponível para geração
  static isPromotionAvailable(promotion) {
    if (!promotion) return false;

    // Verificar prazo de geração
    if (promotion.generation_deadline &&
      new Date(promotion.generation_deadline) < new Date()) {
      return false;
    }

    // Verificar se há códigos disponíveis (se houver limite)
    if (promotion.max_codes !== null &&
      promotion.remaining_codes <= 0) {
      return false;
    }

    return true;
  }

  // Verificar se um QR Code é válido para uso
  static isQRCodeValid(qrCode) {
    if (!qrCode) return false;

    // Verificar se não é um registro de promoção
    if (qrCode.qr_code_value === qrCode.promotion_id) {
      return false;
    }

    // Verificar se já foi usado
    if (qrCode.status === 'usado' || qrCode.is_used) {
      return false;
    }

    // Verificar prazo de uso
    if (qrCode.usage_deadline &&
      new Date(qrCode.usage_deadline) < new Date()) {
      return false;
    }

    return true;
  }
}

module.exports = QRCodeValidator;